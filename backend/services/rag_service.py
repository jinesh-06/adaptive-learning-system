"""RAG Service integrating ChromaDB retrieval and context formatting."""

import sys
from typing import List, Dict, Any, Optional
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.src.retriever import retrieve_documents
from rag.src.context_formatter import format_context, format_rag_prompt
from rag.src.ingest import run_ingestion
from rag.src.vector_store import get_vector_store


class RAGService:
    """Manages document retrieval, contextual search, and knowledge base re-indexing."""

    def __init__(self):
        self.vector_store = get_vector_store()

    def retrieve(
        self,
        query: str,
        course: Optional[str] = None,
        topic: Optional[str] = None,
        level: Optional[str] = None,
        top_k: int = 4,
        learner_level: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant knowledge chunks with learner-level conditioning."""
        if not query or not query.strip():
            return []
        return retrieve_documents(
            query=query,
            top_k=top_k,
            course=course,
            topic=topic,
            level=level,
            learner_level=learner_level,
            vector_store=self.vector_store
        )

    def get_formatted_context(
        self,
        query: str,
        course: Optional[str] = None,
        topic: Optional[str] = None,
        level: Optional[str] = None,
        top_k: int = 4,
        learner_level: Optional[str] = None,
    ) -> str:
        """Retrieve and format context for downstream LLM generator."""
        chunks = self.retrieve(
            query=query,
            course=course,
            topic=topic,
            level=level,
            top_k=top_k,
            learner_level=learner_level
        )
        return format_context(chunks)

    def reindex(self, reset: bool = False) -> Dict[str, Any]:
        """Trigger complete RAG ingestion pipeline."""
        return run_ingestion(reset_collection=reset)

    def get_chunk_count(self) -> int:
        """Return total indexed chunks."""
        return self.vector_store.count()


rag_service = RAGService()
