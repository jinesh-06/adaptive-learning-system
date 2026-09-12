"""
Retriever module for the RAG pipeline.
Handles query embedding, ChromaDB dense vector similarity search, multi-attribute metadata filtering
(course, topic, level), adaptive learner_level ranking/re-ranking, configurable top-k retrieval, and relevance threshold filtering.
"""

from typing import List, Dict, Any, Optional
from rag.src.config import RAGConfig, default_config
from rag.src.document_loader import normalize_course_name
from rag.src.embeddings import embed_query
from rag.src.vector_store import get_vector_store, VectorStore


def retrieve_documents(
    query: str,
    top_k: int = 5,
    course: Optional[str] = None,
    topic: Optional[str] = None,
    level: Optional[str] = None,
    threshold: Optional[float] = None,
    learner_level: Optional[str] = None,
    config: Optional[RAGConfig] = None,
    vector_store: Optional[VectorStore] = None,
    category: Optional[str] = None  # Backward compatibility alias for course
) -> List[Dict[str, Any]]:
    """
    Retrieve top-k relevant document chunks for a given query from ChromaDB.

    Distance & Similarity Explanation:
    ----------------------------------
    ChromaDB is configured with cosine distance ('hnsw:space': 'cosine').
    - Cosine Distance (d): Range [0, 2], where 0.0 means identical angle, 1.0 is orthogonal.
    - Cosine Similarity (s): Computed as `1.0 - d` (higher is more similar).
    - Threshold Filtering:
      When `threshold` is provided (e.g. 0.35):
      Chunks with `similarity < threshold` (or `distance > (1.0 - threshold)`) are rejected.

    Adaptive Retrieval:
    -------------------
    When `learner_level` is provided (e.g., "beginner", "intermediate", "advanced"),
    the retriever pulls extra candidates and prioritizes/ranks matching educational levels
    higher while preserving relevant foundational or advanced context.

    Args:
        query: Natural language query or programming concept question.
        top_k: Maximum number of chunks to return (e.g., 1, 3, 5, 10). Default is 5.
        course: Optional course filter (e.g. "c", "cpp", "python", "java").
        topic: Optional topic filter (e.g. "data_structures", "pointers_memory").
        level: Optional hard difficulty level filter ("beginner", "intermediate", "advanced").
        threshold: Optional minimum cosine similarity threshold (e.g. 0.35).
        learner_level: Optional adaptive cognitive/learner level ("beginner", "intermediate", "advanced").
        config: Optional custom RAGConfig.
        vector_store: Optional pre-instantiated VectorStore.
        category: Backward-compatible alias for course.

    Returns:
        List[Dict[str, Any]] containing:
            - chunk_id: Unique chunk identifier
            - text: Educational chunk content
            - source: Source filename
            - course: Programming course ('c', 'cpp', 'python', 'java')
            - topic: Topic name
            - level: Educational level ('beginner', 'intermediate', 'advanced')
            - section: Section name
            - distance: Cosine distance (lower = closer)
            - similarity: Cosine similarity score (higher = closer)
    """
    if not query or not query.strip():
        return []

    cfg = config or default_config
    vstore = vector_store or get_vector_store(config=cfg)

    # 1. Generate query embedding
    query_emb = embed_query(query.strip(), config=cfg)

    # 2. Build metadata filter dictionary
    filter_course = course or category
    filter_conditions: List[Dict[str, Any]] = []

    if filter_course and filter_course.strip():
        norm_course = normalize_course_name(filter_course)
        filter_conditions.append({"course": norm_course})

    if topic and topic.strip():
        filter_conditions.append({"topic": topic.strip().lower()})

    # Explicit hard filter on level if specified
    if level and level.strip():
        filter_conditions.append({"level": level.strip().lower()})

    where_filter: Optional[Dict[str, Any]] = None
    if len(filter_conditions) == 1:
        where_filter = filter_conditions[0]
    elif len(filter_conditions) > 1:
        where_filter = {"$and": filter_conditions}

    # 3. Query ChromaDB for nearest neighbors
    # Pull extra candidates if threshold or adaptive learner_level ranking is active
    fetch_k = top_k * 4 if (threshold is not None or learner_level is not None) else top_k
    try:
        results = vstore.query(
            query_embedding=query_emb,
            top_k=fetch_k,
            where_filter=where_filter
        )
    except Exception as e:
        # Graceful fallback if query fails (e.g., non-existent filter combination in ChromaDB)
        return []

    documents_list = results.get("documents", [[]])[0]
    metadatas_list = results.get("metadatas", [[]])[0]
    distances_list = results.get("distances", [[]])[0]
    ids_list = results.get("ids", [[]])[0]

    candidate_chunks: List[Dict[str, Any]] = []

    for doc_text, meta, dist, cid in zip(documents_list, metadatas_list, distances_list, ids_list):
        distance_val = float(dist) if dist is not None else 0.0
        similarity_val = round(1.0 - distance_val, 4)

        # Relevance threshold check
        if threshold is not None:
            if similarity_val < threshold:
                continue

        meta_dict = meta or {}
        doc_level = meta_dict.get("level", "intermediate")
        doc_section = meta_dict.get("section", "General Content")

        # Base ranking score
        rank_score = similarity_val

        # Adaptive ranking: boost items matching learner_level
        if learner_level and learner_level.strip():
            target_lvl = learner_level.strip().lower()
            if doc_level.lower() == target_lvl:
                rank_score += 0.08  # Soft boost for matching learner difficulty

        candidate_chunks.append({
            "chunk_id": meta_dict.get("chunk_id", cid),
            "text": doc_text,
            "source": meta_dict.get("source", "unknown"),
            "course": meta_dict.get("course", "general"),
            "topic": meta_dict.get("topic", "general"),
            "level": doc_level,
            "section": doc_section,
            "distance": round(distance_val, 4),
            "similarity": similarity_val,
            "_rank_score": rank_score
        })

    # Sort by adaptive rank score if learner_level applied, otherwise preserve similarity ordering
    if learner_level:
        candidate_chunks.sort(key=lambda x: x["_rank_score"], reverse=True)

    # Clean internal rank score and slice to top_k
    final_retrieved: List[Dict[str, Any]] = []
    for c in candidate_chunks[:top_k]:
        c_clean = {k: v for k, v in c.items() if not k.startswith("_")}
        final_retrieved.append(c_clean)

    return final_retrieved


if __name__ == "__main__":
    test_q = "What is a pointer in C?"
    print(f"Query: {test_q}")
    results = retrieve_documents(test_q, top_k=3, course="c", learner_level="beginner")
    for i, r in enumerate(results, 1):
        print(f"\n[{i}] ID: {r['chunk_id']} | Source: {r['source']} | Course: {r['course']} | Level: {r['level']} | Section: {r['section']} | Sim: {r['similarity']:.3f}")
        print(f"Content:\n{r['text'][:150]}...")
