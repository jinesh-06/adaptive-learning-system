"""
Document Loader module for the RAG pipeline.
Loads raw educational text files, extracts structured metadata (course, topic, level, source),
cleans whitespace, and structures documents for semantic chunking.
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict

from rag.src.config import RAGConfig, default_config


@dataclass
class Document:
    """Represents a loaded raw educational document before chunking."""
    text: str
    source: str
    course: str
    topic: str
    level: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def normalize_course_name(raw_name: str) -> str:
    """
    Normalize course/language name to standard identifiers.
    Examples:
        'C' -> 'c'
        'CPP' / 'c++' / 'cplusplus' -> 'cpp'
        'PYTHON' / 'py' -> 'python'
        'JAVA' -> 'java'
    """
    cleaned = raw_name.strip().lower()
    if cleaned in ("cpp", "c++", "cplusplus"):
        return "cpp"
    elif cleaned in ("python", "py"):
        return "python"
    elif cleaned in ("java",):
        return "java"
    elif cleaned in ("c",):
        return "c"
    return cleaned


def extract_metadata_from_text(raw_text: str) -> Dict[str, str]:
    """
    Extract embedded metadata header if present in document header:
    COURSE: python
    TOPIC: data_structures
    LEVEL: intermediate
    SOURCE: python_data_structures.txt
    """
    metadata: Dict[str, str] = {}
    lines = raw_text.split("\n", 15)  # Inspect first 15 lines

    for line in lines:
        line_clean = line.strip()
        if ":" in line_clean:
            key, val = line_clean.split(":", 1)
            key_upper = key.strip().upper()
            if key_upper in ("COURSE", "TOPIC", "LEVEL", "SOURCE"):
                metadata[key_upper.lower()] = val.strip()

    return metadata


def derive_metadata_from_path(file_path: Path) -> Dict[str, str]:
    """
    Derive metadata from directory structure and file naming conventions:
    rag/documents/PYTHON/python_data_structures.txt ->
        course = 'python'
        topic = 'data_structures'
        source = 'python_data_structures.txt'
    """
    parent_folder = file_path.parent.name
    filename = file_path.name
    stem = file_path.stem.lower()

    # 1. Course from parent folder or filename prefix
    course = normalize_course_name(parent_folder)
    if course == "documents" or not course:
        # Fallback to filename prefix
        if stem.startswith("python_"):
            course = "python"
        elif stem.startswith("cpp_") or stem.startswith("cplusplus_"):
            course = "cpp"
        elif stem.startswith("java_"):
            course = "java"
        elif stem.startswith("c_"):
            course = "c"
        else:
            course = "general"

    # 2. Topic from filename stem
    prefix_to_strip = f"{course}_"
    if stem.startswith(prefix_to_strip):
        topic = stem[len(prefix_to_strip):]
    else:
        topic = stem

    # 3. Default level inference if not specified in file
    if any(k in topic for k in ("fundamental", "basic", "control_flow")):
        level = "beginner"
    elif any(k in topic for k in ("advanced", "stl", "memory", "concurrency")):
        level = "advanced"
    else:
        level = "intermediate"

    return {
        "course": course,
        "topic": topic,
        "level": level,
        "source": filename
    }


def clean_text(raw_text: str) -> str:
    """
    Clean whitespace and normalize text while preserving meaningful code blocks and paragraphs.
    - Replaces CRLF / CR with LF.
    - Strips leading/trailing spaces per line.
    - Collapses 3+ consecutive newlines into 2.
    """
    if not raw_text:
        return ""
    # Normalize CRLF / CR to LF
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    # Clean leading/trailing whitespace per line
    lines = [re.sub(r"[ \t]+", " ", line).rstrip() for line in text.split("\n")]
    text = "\n".join(lines)
    # Collapse multiple blank lines to at most two
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def load_documents(
    documents_dir: Optional[Path] = None,
    config: Optional[RAGConfig] = None
) -> List[Document]:
    """
    Read all .txt files recursively from the documents directory, extract metadata,
    clean text, ignore empty ones, and return a list of Document objects.

    Args:
        documents_dir: Path to directory containing course subdirectories or .txt files.
        config: RAGConfig instance (optional).

    Returns:
        List[Document] with text, source, course, topic, and level.
    """
    cfg = config or default_config
    target_dir = Path(documents_dir) if documents_dir else cfg.documents_dir

    if not target_dir.exists():
        raise FileNotFoundError(f"Documents directory not found: {target_dir}")

    documents: List[Document] = []
    # Recursive search to automatically discover course subdirectories (C, CPP, PYTHON, JAVA, etc.)
    txt_files = sorted(list(target_dir.rglob("*.txt")))

    for file_path in txt_files:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                raw_content = f.read()

            cleaned = clean_text(raw_content)
            if not cleaned:
                # Ignore empty or whitespace-only documents
                continue

            # 1. Fallback metadata from file path
            path_meta = derive_metadata_from_path(file_path)

            # 2. Override with explicit in-document metadata header if present
            doc_meta = extract_metadata_from_text(cleaned)

            course = normalize_course_name(doc_meta.get("course") or path_meta["course"])
            topic = (doc_meta.get("topic") or path_meta["topic"]).lower().strip()
            level = (doc_meta.get("level") or path_meta["level"]).lower().strip()
            source_name = doc_meta.get("source") or path_meta["source"]

            documents.append(
                Document(
                    text=cleaned,
                    source=source_name,
                    course=course,
                    topic=topic,
                    level=level
                )
            )
        except Exception as e:
            print(f"[DocumentLoader] Warning: Failed to load {file_path.name}: {e}")

    return documents


if __name__ == "__main__":
    docs = load_documents()
    print(f"Loaded {len(docs)} documents:")
    for d in docs:
        print(f"  - [{d.course.upper():6} | {d.topic:22} | {d.level:12}] {d.source} ({len(d.text)} chars)")

