"""
RAG (Retrieval-Augmented Generation) Module
Cognitive-Load-Aware Adaptive Learning Engine

Provides document loading, intelligent chunking, local sentence-transformer embeddings,
ChromaDB persistent vector indexing, metadata-filtered top-k retrieval,
and LLM-ready context formatting.
"""

from rag.src.config import RAGConfig
from rag.src.document_loader import load_documents, Document
from rag.src.text_chunker import chunk_documents, DocumentChunk
from rag.src.embeddings import EmbeddingModel, get_embedding_model
from rag.src.vector_store import VectorStore, get_vector_store
from rag.src.retriever import retrieve_documents
from rag.src.context_formatter import format_context

__all__ = [
    "RAGConfig",
    "Document",
    "load_documents",
    "DocumentChunk",
    "chunk_documents",
    "EmbeddingModel",
    "get_embedding_model",
    "VectorStore",
    "get_vector_store",
    "retrieve_documents",
    "format_context",
]
