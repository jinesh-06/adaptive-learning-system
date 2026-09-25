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


TOPIC_SLUG_MAP: Dict[str, str] = {
    # Python
    "fundamentals": "fundamentals",
    "top-py-fundamentals": "fundamentals",
    "language fundamentals, datatypes & immutability": "fundamentals",
    "1. python 3 architecture & standard runtime": "fundamentals",
    "python 3 architecture & standard runtime": "fundamentals",
    "top-py-operators-io": "fundamentals",
    "operators & dynamic input/output statements": "fundamentals",
    "control_flow": "control_flow",
    "top-py-flow-control": "control_flow",
    "flow control, conditionals & transfer statements": "control_flow",
    "top-py-loops": "control_flow",
    "loops, iteration constructs & pattern printing": "control_flow",
    "data_structures": "data_structures",
    "top-py-strings": "data_structures",
    "in-depth string operations, slicing & algorithms": "data_structures",
    "top-py-lists": "data_structures",
    "list data structure, matrices & comprehensions": "data_structures",
    "top-py-tuples-sets": "data_structures",
    "tuples and sets data structures": "data_structures",
    "top-py-dictionaries": "data_structures",
    "dictionary data structure & hash tables": "data_structures",
    "functions": "functions",
    "top-py-functions": "functions",
    "functions, parameters & scope (legb)": "functions",
    "top-py-recursion": "functions",
    "recursion and recursive thinking": "functions",
    "exceptions_modules": "exceptions_modules",
    "top-py-modules-regex": "exceptions_modules",
    "modules, math, random & regular expressions": "exceptions_modules",
    "file_handling": "file_handling",
    "oop": "oop",
    "advanced_topics": "advanced_topics",
}


def resolve_topic_slug(raw_topic: Optional[str]) -> Optional[str]:
    """Map human topic titles or topic IDs to ChromaDB collection slugs."""
    if not raw_topic or not raw_topic.strip():
        return None
    cleaned = raw_topic.strip().lower()
    return TOPIC_SLUG_MAP.get(cleaned, cleaned)


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
    if not query or not query.strip():
        return []

    cfg = config or default_config
    vstore = vector_store or get_vector_store(config=cfg)

    # 1. Generate query embedding
    query_emb = embed_query(query.strip(), config=cfg)

    # 2. Build metadata filter dictionary
    filter_course = course or category
    filter_conditions: List[Dict[str, Any]] = []

    norm_course = None
    if filter_course and filter_course.strip():
        norm_course = normalize_course_name(filter_course)
        filter_conditions.append({"course": norm_course})

    norm_topic = resolve_topic_slug(topic)
    if norm_topic:
        filter_conditions.append({"topic": norm_topic})

    # Explicit hard filter on level if specified
    if level and level.strip():
        filter_conditions.append({"level": level.strip().lower()})

    where_filter: Optional[Dict[str, Any]] = None
    if len(filter_conditions) == 1:
        where_filter = filter_conditions[0]
    elif len(filter_conditions) > 1:
        where_filter = {"$and": filter_conditions}

    # 3. Query ChromaDB for nearest neighbors
    fetch_k = top_k * 4 if (threshold is not None or learner_level is not None) else top_k
    try:
        results = vstore.query(
            query_embedding=query_emb,
            top_k=fetch_k,
            where_filter=where_filter
        )
    except Exception as e:
        return []

    documents_list = results.get("documents", [[]])[0]
    metadatas_list = results.get("metadatas", [[]])[0]
    distances_list = results.get("distances", [[]])[0]
    ids_list = results.get("ids", [[]])[0]

    # 4. Fallback search: If filtered search returned zero documents and topic was specified,
    # retry without the strict topic filter so semantic search over the course finds relevant chunks
    if not documents_list and norm_topic:
        fallback_conditions: List[Dict[str, Any]] = []
        if norm_course:
            fallback_conditions.append({"course": norm_course})
        if level and level.strip():
            fallback_conditions.append({"level": level.strip().lower()})

        fallback_where = fallback_conditions[0] if len(fallback_conditions) == 1 else (
            {"$and": fallback_conditions} if len(fallback_conditions) > 1 else None
        )
        try:
            fallback_results = vstore.query(
                query_embedding=query_emb,
                top_k=fetch_k,
                where_filter=fallback_where
            )
            documents_list = fallback_results.get("documents", [[]])[0]
            metadatas_list = fallback_results.get("metadatas", [[]])[0]
            distances_list = fallback_results.get("distances", [[]])[0]
            ids_list = fallback_results.get("ids", [[]])[0]
        except Exception:
            pass

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
