"""
Text Chunker module for the RAG pipeline.
Performs semantic, section, and paragraph-aware chunking of educational documents with sliding window overlap.
Preserves rich metadata (course, topic, level, source) on every chunk.
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
    chunk_index: int
    char_length: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def split_text_into_sections(text: str) -> List[str]:
    """
    Split text along major numbered section headers (e.g., '1. Introduction', '6. Basic Examples')
    or double newlines while preserving coherent context blocks.
    """
    # Split on double newline while preserving non-empty blocks
    raw_paragraphs = re.split(r"\n\s*\n", text)
    paragraphs = [p.strip() for p in raw_paragraphs if p.strip()]
    return paragraphs


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
    chunk_size: int = 750,
    chunk_overlap: int = 150,
    min_chunk_length: int = 60
) -> List[DocumentChunk]:
    """
    Split a single document's text into overlapping chunks using paragraph/section boundaries.

    Args:
        text: Cleaned text content.
        source: Filename of the source document.
        course: Normalized course identifier ('c', 'cpp', 'python', 'java').
        topic: Topic name string.
        level: Educational difficulty level ('beginner', 'intermediate', 'advanced').
        chunk_size: Target maximum characters per chunk (500-1000 chars).
        chunk_overlap: Target character overlap between consecutive chunks (100-200 chars).
        min_chunk_length: Minimum characters for a valid chunk.

    Returns:
        List of DocumentChunk instances.
    """
    if not text or len(text.strip()) == 0:
        return []

    stem = Path(source).stem.lower().replace("-", "_").replace(" ", "_")
    paragraphs = split_text_into_sections(text)

    # Break down any oversized paragraphs into smaller sentence/code units
    units: List[str] = []
    for para in paragraphs:
        if len(para) > chunk_size:
            sentences = split_paragraph_into_sentences(para)
            units.extend(sentences)
        else:
            units.append(para)

    chunks: List[str] = []
    current_unit_idx = 0
    total_units = len(units)

    while current_unit_idx < total_units:
        current_chunk_parts: List[str] = []
        current_length = 0

        scan_idx = current_unit_idx
        while scan_idx < total_units:
            unit = units[scan_idx]
            projected_length = current_length + (len(unit) + 2 if current_chunk_parts else len(unit))

            if projected_length > chunk_size and current_chunk_parts:
                # Adding this unit would exceed chunk size; finalize current chunk
                break

            current_chunk_parts.append(unit)
            current_length = projected_length
            scan_idx += 1

        chunk_str = "\n\n".join(current_chunk_parts).strip()
        if len(chunk_str) >= min_chunk_length:
            chunks.append(chunk_str)

        # Reached the end
        if scan_idx >= total_units:
            break

        # Calculate overlap step: step backwards through accumulated units until overlap threshold
        overlap_len = 0
        step_back = 0
        for back_idx in range(scan_idx - 1, current_unit_idx, -1):
            overlap_len += len(units[back_idx])
            step_back += 1
            if overlap_len >= chunk_overlap:
                break

        # Advance by at least 1 unit to guarantee forward progress
        next_idx = scan_idx - step_back
        if next_idx <= current_unit_idx:
            next_idx = current_unit_idx + 1

        current_unit_idx = next_idx

    # If the text was smaller than chunk_size and wasn't added above
    if not chunks and len(text.strip()) >= min_chunk_length:
        chunks.append(text.strip())

    # Build DocumentChunk objects with deterministic IDs
    result_chunks: List[DocumentChunk] = []
    for idx, c_text in enumerate(chunks):
        chunk_id = f"{stem}_{idx + 1:03d}"
        result_chunks.append(
            DocumentChunk(
                chunk_id=chunk_id,
                text=c_text,
                source=source,
                course=course,
                topic=topic,
                level=level,
                chunk_index=idx + 1,
                char_length=len(c_text)
            )
        )

    return result_chunks


def chunk_documents(
    documents: List[Document],
    config: Optional[RAGConfig] = None
) -> List[DocumentChunk]:
    """
    Chunk multiple loaded documents into a single flat list of DocumentChunk objects.

    Args:
        documents: List of Document objects loaded by document_loader.
        config: Optional RAGConfig instance.

    Returns:
        List[DocumentChunk]
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
        print(f"Course: {sample.course} | Topic: {sample.topic} | Level: {sample.level} | Source: {sample.source}")
        print(f"Length: {sample.char_length} chars")
        print(f"Content:\n{sample.text[:200]}...\n")

