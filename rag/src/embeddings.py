"""
Embeddings module for the RAG pipeline.
Uses local sentence-transformers (all-MiniLM-L6-v2) to generate dense vector embeddings.
Ensures the model is loaded once (singleton pattern) and reused across all queries and ingestions.
"""

import threading
from typing import List, Union, Optional
import numpy as np

from rag.src.config import RAGConfig, default_config


class EmbeddingModel:
    """Singleton embedding manager for sentence-transformers models."""
    _instance: Optional["EmbeddingModel"] = None
    _lock: threading.Lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(EmbeddingModel, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self, model_name: Optional[str] = None, device: Optional[str] = None, config: Optional[RAGConfig] = None):
        if self._initialized:
            return
        cfg = config or default_config
        self.model_name = model_name or cfg.embedding_model_name
        self.device = device or cfg.embedding_device
        self._model = None
        self._load_model()
        self._initialized = True

    def _load_model(self) -> None:
        """Load the sentence-transformers model once into memory."""
        try:
            from sentence_transformers import SentenceTransformer
            # print(f"[EmbeddingModel] Loading sentence-transformer model: '{self.model_name}' on device '{self.device}'...")
            self._model = SentenceTransformer(self.model_name, device=self.device)
        except Exception as e:
            raise RuntimeError(
                f"[EmbeddingModel] Failed to load sentence-transformers model '{self.model_name}': {e}\n"
                f"Please ensure sentence-transformers and PyTorch are installed."
            ) from e

    def embed_texts(self, texts: List[str], batch_size: int = 32, normalize_embeddings: bool = True) -> List[List[float]]:
        """
        Generate dense vector embeddings for a list of texts.

        Args:
            texts: List of text strings to embed.
            batch_size: Batch size for model inference.
            normalize_embeddings: Whether to L2-normalize vectors for cosine similarity.

        Returns:
            List[List[float]]: List of float embedding vectors.
        """
        if not texts:
            return []

        embeddings = self._model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=False,
            normalize_embeddings=normalize_embeddings,
            convert_to_numpy=True
        )

        if isinstance(embeddings, np.ndarray):
            return embeddings.tolist()
        return [list(map(float, vec)) for vec in embeddings]

    def embed_single(self, text: str, normalize_embeddings: bool = True) -> List[float]:
        """
        Generate embedding for a single query or text string.

        Args:
            text: Query string.
            normalize_embeddings: Whether to normalize vector.

        Returns:
            List[float]: Single embedding vector.
        """
        if not text or not text.strip():
            # Return zero vector of appropriate dimension if text is empty
            dim = getattr(self._model, "get_sentence_embedding_dimension", lambda: 384)()
            return [0.0] * dim

        embeddings = self._model.encode(
            [text],
            show_progress_bar=False,
            normalize_embeddings=normalize_embeddings,
            convert_to_numpy=True
        )
        return embeddings[0].tolist()


def get_embedding_model(config: Optional[RAGConfig] = None) -> EmbeddingModel:
    """Return the singleton instance of the EmbeddingModel."""
    return EmbeddingModel(config=config)


def embed_documents(texts: List[str], config: Optional[RAGConfig] = None) -> List[List[float]]:
    """
    Convenience function to generate embeddings for a batch of documents.

    Args:
        texts: List of strings.
        config: Optional RAGConfig.

    Returns:
        List[List[float]]: Embedding vectors.
    """
    model = get_embedding_model(config=config)
    return model.embed_texts(texts)


def embed_query(query: str, config: Optional[RAGConfig] = None) -> List[float]:
    """
    Convenience function to generate an embedding for a search query.

    Args:
        query: Query string.
        config: Optional RAGConfig.

    Returns:
        List[float]: Embedding vector.
    """
    model = get_embedding_model(config=config)
    return model.embed_single(query)


if __name__ == "__main__":
    sample_text = "What is a Python function?"
    emb = embed_query(sample_text)
    print(f"Embedding generated for '{sample_text}': dimension = {len(emb)}, sample = {emb[:5]}")
