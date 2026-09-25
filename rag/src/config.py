"""
Configuration settings for the RAG pipeline module.
"""

import os
from pathlib import Path
from dataclasses import dataclass, field


# Base directory for the rag module (where config.py is at rag/src/config.py -> parent of parent is rag/)
RAG_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = RAG_DIR.parent


@dataclass
class RAGConfig:
    """Central configuration for RAG ingestion, embeddings, storage, and retrieval."""

    # File paths
    rag_dir: Path = field(default_factory=lambda: RAG_DIR)
    documents_dir: Path = field(default_factory=lambda: RAG_DIR / "documents")
    chroma_db_dir: Path = field(default_factory=lambda: RAG_DIR / "chroma_db")

    # Document Chunking Settings (600-1200 characters target, 100-250 characters overlap)
    chunk_size: int = 900
    chunk_overlap: int = 180
    min_chunk_length: int = 80

    # Embedding Model Settings
    embedding_model_name: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384
    embedding_device: str = os.getenv("RAG_EMBEDDING_DEVICE", "cpu")

    # ChromaDB Vector Store Settings
    collection_name: str = os.getenv("RAG_COLLECTION_NAME", "programming_knowledge")
    distance_metric: str = "cosine"  # cosine distance (range 0 to 2, where 0 = identical)

    # Retrieval Defaults
    default_top_k: int = 5
    default_distance_threshold: float = 0.85
    default_similarity_threshold: float = 0.15

    # Supported Courses
    supported_courses: tuple = ("c", "cpp", "python", "java")

    def ensure_directories(self) -> None:
        """Ensure necessary directories exist."""
        self.documents_dir.mkdir(parents=True, exist_ok=True)
        self.chroma_db_dir.mkdir(parents=True, exist_ok=True)


# Default global instance
default_config = RAGConfig()
default_config.ensure_directories()

