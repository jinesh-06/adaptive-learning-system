"""
Text Chunker module for the RAG pipeline.
Performs semantic, section-aware, and paragraph-aware chunking of educational documents.
Preserves rich metadata (course, topic, level, source, section) on every chunk.
Target chunk size: 600–1200 characters, overlap: 100–250 characters.
"""

import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict

from rag.src.config import RAGConfig, default_config
from rag.src.document_loader import Document


@dataclass
class DocumentChunk:
    """Represents an indexed chunk derived from a document with full metadata."""
    chunk_id: str
    text: str
    source: str
    course: str
    topic: str
    level: str
    section: str
    chunk_index: int
    char_length: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def detect_level_from_section(section_name: str, fallback_level: str) -> str:
    """
    Infer educational difficulty level from section titles or headers.
    """
    s = section_name.lower()
    if any(k in s for k in ("beginner", "basic", "introduction", "prerequisite", "what is", "fundamental")):
        return "beginner"
    elif any(k in s for k in ("intermediate", "practical", "real-world", "common mistake", "debugging", "error")):
        return "intermediate"
    elif any(k in s for k in ("advanced", "performance", "security", "memory", "deep dive", "concurrency", "optimization", "internals")):
        return "advanced"
    return fallback_level.lower()


def parse_sections(text: str) -> List[Dict[str, str]]:
    """
    Parse document into logical section units based on numbered headers or all-caps markers.
    E.g., '1. Introduction', '7. Basic Examples', 'BEGINNER CONCEPTS', '18. Performance Considerations'
    """
    lines = text.split("\n")
    sections: List[Dict[str, str]] = []
    
    current_section_title = "General Overview"
    current_lines: List[str] = []

    header_pattern = re.compile(
        r"^(?:\d{1,2}\.\s+[A-Za-z0-9\s\-/,\(\)]+|[A-Z\s]{4,}CONCEPTS|[A-Z\s]{4,}REQUIREMENTS|BEGINNER|INTERMEDIATE|ADVANCED)$"
    )

    for line in lines:
        stripped = line.strip()
        # Check if line looks like a major section header
        if header_pattern.match(stripped) and len(stripped) < 80:
            if current_lines:
                sec_text = "\n".join(current_lines).strip()
                if sec_text:
                    sections.append({
                        "section": current_section_title,
                        "text": sec_text
                    })
                current_lines = []
            current_section_title = stripped
        else:
            current_lines.append(line)

    if current_lines:
        sec_text = "\n".join(current_lines).strip()
        if sec_text:
            sections.append({
                "section": current_section_title,
                "text": sec_text
            })

    if not sections:
        sections.append({
            "section": "General Content",
            "text": text.strip()
        })

    return sections


def split_section_into_paragraphs(section_text: str) -> List[str]:
    """Split section text along double newlines into coherent paragraph blocks."""
    raw_paras = re.split(r"\n\s*\n", section_text)
    return [p.strip() for p in raw_paras if p.strip()]


def split_paragraph_into_sentences(paragraph: str) -> List[str]:
    """Split a large paragraph into sentences or newline-separated code lines."""
    sentences = re.split(r"(?<=[.!?])\s+|\n", paragraph)
    return [s.strip() for s in sentences if s.strip()]


def chunk_single_text(
    text: str,
    source: str,
    course: str,
    topic: str,
    level: str,
    chunk_size: int = 900,
    chunk_overlap: int = 180,
    min_chunk_length: int = 80
) -> List[DocumentChunk]:
    """
    Split a single document into section-aware, overlapping chunks (600–1200 characters).
    Preserves section titles, code blocks, and adaptive difficulty levels.
    """
    if not text or len(text.strip()) == 0:
        return []

    stem = Path(source).stem.lower().replace("-", "_").replace(" ", "_")
    parsed_sections = parse_sections(text)

    all_chunks: List[DocumentChunk] = []
    global_chunk_idx = 1

    for sec in parsed_sections:
        sec_title = sec["section"]
        sec_text = sec["text"]
        sec_level = detect_level_from_section(sec_title, fallback_level=level)

        # Split section into paragraphs
        paras = split_section_into_paragraphs(sec_text)
        units: List[str] = []
        for p in paras:
            if len(p) > chunk_size:
                sentences = split_paragraph_into_sentences(p)
                units.extend(sentences)
            else:
                units.append(p)

        if not units:
            continue

        sec_chunk_texts: List[str] = []
        current_idx = 0
        total_units = len(units)

        while current_idx < total_units:
            current_parts: List[str] = []
            current_len = 0
            scan_idx = current_idx

            while scan_idx < total_units:
                unit = units[scan_idx]
                proj_len = current_len + (len(unit) + 2 if current_parts else len(unit))

                if proj_len > chunk_size and current_parts:
                    break

                current_parts.append(unit)
                current_len = proj_len
                scan_idx += 1

            chunk_content = "\n\n".join(current_parts).strip()
            if len(chunk_content) >= min_chunk_length:
                sec_chunk_texts.append(chunk_content)

            if scan_idx >= total_units:
                break

            # Calculate overlap
            overlap_acc = 0
            step_back = 0
            for back_idx in range(scan_idx - 1, current_idx, -1):
                overlap_acc += len(units[back_idx])
                step_back += 1
                if overlap_acc >= chunk_overlap:
                    break

            next_idx = scan_idx - step_back
            if next_idx <= current_idx:
                next_idx = current_idx + 1
            current_idx = next_idx

        # If section had content but was smaller than min_chunk_length
        if not sec_chunk_texts and len(sec_text.strip()) >= min_chunk_length:
            sec_chunk_texts.append(sec_text.strip())

        for c_text in sec_chunk_texts:
            chunk_id = f"{course}_{stem}_{global_chunk_idx:03d}"
            all_chunks.append(
                DocumentChunk(
                    chunk_id=chunk_id,
                    text=c_text,
                    source=source,
                    course=course,
                    topic=topic,
                    level=sec_level,
                    section=sec_title,
                    chunk_index=global_chunk_idx,
                    char_length=len(c_text)
                )
            )
            global_chunk_idx += 1

    return all_chunks


def chunk_documents(
    documents: List[Document],
    config: Optional[RAGConfig] = None
) -> List[DocumentChunk]:
    """
    Chunk multiple loaded documents into a single flat list of DocumentChunk objects.
    """
    cfg = config or default_config
    all_chunks: List[DocumentChunk] = []

    for doc in documents:
        doc_chunks = chunk_single_text(
            text=doc.text,
            source=doc.source,
            course=doc.course,
            topic=doc.topic,
            level=doc.level,
            chunk_size=cfg.chunk_size,
            chunk_overlap=cfg.chunk_overlap,
            min_chunk_length=cfg.min_chunk_length
        )
        all_chunks.extend(doc_chunks)

    return all_chunks


if __name__ == "__main__":
    from rag.src.document_loader import load_documents
    docs = load_documents()
    chunks = chunk_documents(docs)
    print(f"Total chunks created across {len(docs)} documents: {len(chunks)}")
    if chunks:
        sample = chunks[0]
        print(f"\nSample chunk ({sample.chunk_id}):")
        print(f"Course: {sample.course} | Topic: {sample.topic} | Level: {sample.level} | Section: {sample.section}")
        print(f"Source: {sample.source} | Length: {sample.char_length} chars")
        print(f"Content:\n{sample.text[:250]}...\n")
