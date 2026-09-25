"""
Ingestion Pipeline module for the RAG pipeline.
Orchestrates: Document Loading -> Cleaning -> Metadata Tagging -> Chunking -> Embedding Generation -> ChromaDB Persistent Indexing.
"""

import sys
import os
import time
from typing import Dict, Any, Optional
from pathlib import Path

# Fix Windows console UTF-8 output if needed
if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"

from rag.src.config import RAGConfig, default_config
from rag.src.document_loader import load_documents
from rag.src.text_chunker import chunk_documents
from rag.src.embeddings import embed_documents
from rag.src.vector_store import get_vector_store


def run_ingestion(
    config: Optional[RAGConfig] = None,
    reset_collection: bool = False
) -> Dict[str, Any]:
    """
    Execute the end-to-end RAG ingestion workflow.

    1. Load documents from rag/documents/{C,CPP,PYTHON,JAVA}/
    2. Extract metadata (course, topic, level, source) and clean text
    3. Chunk documents into section/paragraph-aware chunks (500-1000 chars, 100-200 overlap)
    4. Generate embeddings using all-MiniLM-L6-v2 (384-dimensional dense vectors)
    5. Upsert chunks into persistent ChromaDB
    6. Print structured ingestion summary report

    Args:
        config: Optional custom RAGConfig.
        reset_collection: If True, purges existing collection before indexing.

    Returns:
        Dict containing ingestion statistics.
    """
    cfg = config or default_config
    cfg.ensure_directories()

    start_time = time.time()
    print("=" * 70)
    print("STARTING RAG INGESTION PIPELINE")
    print(f"Documents Directory: {cfg.documents_dir}")
    print(f"ChromaDB Directory:  {cfg.chroma_db_dir}")
    print(f"Embedding Model:     {cfg.embedding_model_name}")
    print(f"Supported Courses:   {', '.join(cfg.supported_courses)}")
    print("=" * 70)

    # 1 & 2: Load and clean documents
    print("\n[Step 1/5] Loading and cleaning documents across all courses...")
    documents = load_documents(config=cfg)
    doc_count = len(documents)
    print(f"  [OK] Loaded {doc_count} valid educational documents.")

    course_doc_counts: Dict[str, int] = {}
    for doc in documents:
        c = doc.course.upper()
        course_doc_counts[c] = course_doc_counts.get(c, 0) + 1
        print(f"    - [{doc.course.upper():6} | {doc.topic:22} | {doc.level:12}] {doc.source:32} ({len(doc.text):5} chars)")

    if doc_count == 0:
        print("\n[WARN] No documents found in documents directory. Aborting ingestion.")
        return {
            "documents_loaded": 0,
            "chunks_created": 0,
            "embeddings_generated": 0,
            "stored_in_chromadb": 0,
            "total_in_collection": 0,
            "elapsed_seconds": round(time.time() - start_time, 2)
        }

    # 3: Chunk documents
    print(f"\n[Step 2/5] Chunking documents (size: {cfg.chunk_size} chars, overlap: {cfg.chunk_overlap} chars)...")
    chunks = chunk_documents(documents, config=cfg)
    chunk_count = len(chunks)
    print(f"  [OK] Created {chunk_count} semantic text chunks.")

    course_chunk_counts: Dict[str, int] = {}
    for ch in chunks:
        c = ch.course.upper()
        course_chunk_counts[c] = course_chunk_counts.get(c, 0) + 1

    for c, cnt in sorted(course_chunk_counts.items()):
        print(f"    * Course {c:6}: {cnt} chunks")

    # 4: Generate embeddings
    print(f"\n[Step 3/5] Generating embeddings using '{cfg.embedding_model_name}'...")
    chunk_texts = [c.text for c in chunks]
    embeddings = embed_documents(chunk_texts, config=cfg)
    emb_count = len(embeddings)
    dim_len = len(embeddings[0]) if embeddings else 0
    print(f"  [OK] Generated {emb_count} dense vector embeddings (dimension: {dim_len}).")

    # 5: Store in ChromaDB
    print(f"\n[Step 4/5] Storing chunks in ChromaDB collection '{cfg.collection_name}'...")
    vstore = get_vector_store(config=cfg)
    if reset_collection:
        print("  [INFO] Resetting existing collection...")
        vstore.reset_collection()

    stored_count = vstore.upsert_chunks(chunks, embeddings)
    total_in_db = vstore.count()
    print(f"  [OK] Upserted {stored_count} chunks into ChromaDB.")

    elapsed = time.time() - start_time

    # Step 5: Summary Report
    print("\n" + "=" * 70)
    print("## RAG INGESTION SUMMARY REPORT")
    print("=" * 70)
    print(f"Documents Loaded:       {doc_count}")
    print(f"Courses Covered:        {', '.join(sorted(course_doc_counts.keys()))}")
    for c, num in sorted(course_doc_counts.items()):
        print(f"  - {c:6}: {num} docs, {course_chunk_counts.get(c, 0)} chunks")
    print(f"Total Chunks Created:   {chunk_count}")
    print(f"Embeddings Generated:   {emb_count}")
    print(f"Stored in ChromaDB:     {stored_count}")
    print(f"Total in Collection:    {total_in_db}")
    print(f"Database Directory:     {cfg.chroma_db_dir}")
    print(f"Execution Time:         {elapsed:.2f} seconds")
    print("=" * 70 + "\n")

    return {
        "documents_loaded": doc_count,
        "chunks_created": chunk_count,
        "embeddings_generated": emb_count,
        "stored_in_chromadb": stored_count,
        "total_in_collection": total_in_db,
        "course_doc_counts": course_doc_counts,
        "course_chunk_counts": course_chunk_counts,
        "elapsed_seconds": round(elapsed, 2)
    }


if __name__ == "__main__":
    reset = "--reset" in sys.argv
    run_ingestion(reset_collection=reset)

