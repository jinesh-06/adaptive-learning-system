"""
Vector Store module for the RAG pipeline.
Wraps ChromaDB PersistentClient for local persistence, collection management,
batch insertion/upsertion of chunk embeddings, and dense vector similarity search with metadata filtering.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings

from rag.src.config import RAGConfig, default_config
from rag.src.text_chunker import DocumentChunk


class VectorStore:
    """Manages persistent ChromaDB vector storage and semantic retrieval."""

    def __init__(self, config: Optional[RAGConfig] = None):
        self.config = config or default_config
        self.chroma_db_dir = str(self.config.chroma_db_dir.resolve())
        self.collection_name = self.config.collection_name

        # Initialize persistent ChromaDB client
        self.client = chromadb.PersistentClient(
            path=self.chroma_db_dir,
            settings=Settings(anonymized_telemetry=False, allow_reset=True)
        )

        # Get or create the collection with cosine distance metric
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": self.config.distance_metric}
        )

    def upsert_chunks(
        self,
        chunks: List[DocumentChunk],
        embeddings: List[List[float]]
    ) -> int:
        """
        Safely store or update document chunks and their embeddings in ChromaDB.
        Idempotent: avoids duplicate chunk IDs by updating existing records.

        Args:
            chunks: List of DocumentChunk objects.
            embeddings: Parallel list of embedding vectors.

        Returns:
            int: Number of chunks upserted.
        """
        if not chunks:
            return 0

        if len(chunks) != len(embeddings):
            raise ValueError(f"Chunk count ({len(chunks)}) does not match embeddings count ({len(embeddings)})")

        ids: List[str] = []
        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []

        for chunk in chunks:
            ids.append(chunk.chunk_id)
            documents.append(chunk.text)
            metadatas.append({
                "source": chunk.source,
                "course": chunk.course,
                "topic": chunk.topic,
                "level": chunk.level,
                "section": getattr(chunk, "section", "General"),
                "chunk_id": chunk.chunk_id,
                "chunk_index": chunk.chunk_index,
                "char_length": chunk.char_length,
            })

        # Upsert in batches of 100 to avoid payload size constraints
        batch_size = 100
        total_upserted = 0

        for i in range(0, len(ids), batch_size):
            batch_ids = ids[i : i + batch_size]
            batch_docs = documents[i : i + batch_size]
            batch_metas = metadatas[i : i + batch_size]
            batch_embs = embeddings[i : i + batch_size]

            self.collection.upsert(
                ids=batch_ids,
                documents=batch_docs,
                metadatas=batch_metas,
                embeddings=batch_embs
            )
            total_upserted += len(batch_ids)

        return total_upserted

    def query(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        where_filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Perform dense vector similarity search against the ChromaDB collection.

        Args:
            query_embedding: Query embedding vector.
            top_k: Number of nearest neighbors to retrieve.
            where_filter: ChromaDB metadata filter dictionary (e.g. {"course": "python"}).

        Returns:
            Dict containing 'ids', 'documents', 'metadatas', 'distances'.
        """
        count = self.collection.count()
        if count == 0:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        effective_k = min(top_k, count)

        query_kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": effective_k,
            "include": ["documents", "metadatas", "distances"]
        }

        if where_filter:
            query_kwargs["where"] = where_filter

        results = self.collection.query(**query_kwargs)
        return results

    def count(self) -> int:
        """Return the total number of indexed chunks in the collection."""
        return self.collection.count()

    def get_all_sources(self) -> List[str]:
        """Return distinct source filenames in the database."""
        all_data = self.collection.get(include=["metadatas"])
        metas = all_data.get("metadatas") or []
        sources = set(m.get("source") for m in metas if m and "source" in m)
        return sorted(list(sources))

    def get_course_breakdown(self) -> Dict[str, int]:
        """Return chunk count per course."""
        all_data = self.collection.get(include=["metadatas"])
        metas = all_data.get("metadatas") or []
        breakdown: Dict[str, int] = {}
        for m in metas:
            if m and "course" in m:
                c = m["course"]
                breakdown[c] = breakdown.get(c, 0) + 1
        return breakdown

    def reset_collection(self) -> None:
        """Utility to delete and recreate the collection (for testing or full re-index)."""
        try:
            self.client.delete_collection(self.collection_name)
        except Exception:
            pass
        self.collection = self.client.create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": self.config.distance_metric}
        )


_vector_store_instance: Optional[VectorStore] = None


def get_vector_store(config: Optional[RAGConfig] = None) -> VectorStore:
    """Return singleton VectorStore instance."""
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = VectorStore(config=config)
    return _vector_store_instance

