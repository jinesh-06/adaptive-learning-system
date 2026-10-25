"""
Retriever module for the RAG pipeline.
Handles query embedding, ChromaDB dense vector similarity search, multi-attribute metadata filtering
(course, topic, level), adaptive learner_level ranking/re-ranking, configurable top-k retrieval, and relevance threshold filtering.
"""

import re
from typing import List, Dict, Any, Optional
from rag.src.config import RAGConfig, default_config
from rag.src.document_loader import normalize_course_name
from rag.src.embeddings import embed_query
from rag.src.vector_store import get_vector_store, VectorStore

_STOP_WORDS = {"what", "how", "does", "explain", "work", "and", "the", "with", "for", "in", "are", "is"}


VALID_CHROMA_TOPIC_SLUGS: Dict[str, set] = {
    "c": {
        "fundamentals", "control_flow", "functions", "arrays_strings",
        "pointers_memory", "structures_unions", "file_handling", "advanced_topics"
    },
    "cpp": {
        "fundamentals", "control_flow_functions", "arrays_strings", "oop",
        "inheritance_polymorphism", "memory_management", "stl", "advanced_topics"
    },
    "java": {
        "fundamentals", "control_flow_methods", "arrays_strings", "oop",
        "inheritance_interfaces", "collections", "exceptions_file_handling", "advanced_topics"
    },
    "python": {
        "fundamentals", "control_flow", "data_structures", "functions",
        "oop", "exceptions_modules", "file_handling", "advanced_topics"
    },
}

TOPIC_SLUG_MAP: Dict[str, str] = {
    # Direct collection slugs
    "fundamentals": "fundamentals",
    "control_flow": "control_flow",
    "functions": "functions",
    "arrays_strings": "arrays_strings",
    "pointers_memory": "pointers_memory",
    "structures_unions": "structures_unions",
    "file_handling": "file_handling",
    "advanced_topics": "advanced_topics",
    "control_flow_functions": "control_flow_functions",
    "oop": "oop",
    "inheritance_polymorphism": "inheritance_polymorphism",
    "memory_management": "memory_management",
    "stl": "stl",
    "control_flow_methods": "control_flow_methods",
    "inheritance_interfaces": "inheritance_interfaces",
    "collections": "collections",
    "exceptions_file_handling": "exceptions_file_handling",
    "data_structures": "data_structures",
    "exceptions_modules": "exceptions_modules",

    # Python topic IDs and titles
    "top-py-fundamentals": "fundamentals",
    "top-py-intro": "fundamentals",
    "top-py-operators-io": "fundamentals",
    "top-py-operators": "fundamentals",
    "top-py-variables": "fundamentals",
    "top-py-variables-datatypes": "fundamentals",
    "language fundamentals, datatypes & immutability": "fundamentals",
    "python 3 architecture & standard runtime": "fundamentals",
    "operators & dynamic input/output statements": "fundamentals",
    "top-py-flow-control": "control_flow",
    "top-py-loops": "control_flow",
    "flow control, conditionals & transfer statements": "control_flow",
    "loops, iteration constructs & pattern printing": "control_flow",
    "top-py-strings": "data_structures",
    "top-py-lists": "data_structures",
    "top-py-tuples": "data_structures",
    "top-py-sets": "data_structures",
    "top-py-tuples-sets": "data_structures",
    "top-py-dictionaries": "data_structures",
    "in-depth string operations, slicing & algorithms": "data_structures",
    "list data structure, matrices & comprehensions": "data_structures",
    "tuples and sets data structures": "data_structures",
    "dictionary data structure & hash tables": "data_structures",
    "top-py-functions": "functions",
    "top-py-recursion": "functions",
    "functions, parameters & scope (legb)": "functions",
    "recursion and recursive thinking": "functions",
    "top-py-oop": "oop",
    "classes, objects, encapsulation & methods": "oop",
    "top-py-modules-regex": "exceptions_modules",
    "top-py-modules-packages": "exceptions_modules",
    "top-py-exceptions": "exceptions_modules",
    "modules, math, random & regular expressions": "exceptions_modules",
    "top-py-file-handling": "file_handling",
    "top-py-advanced-topics": "advanced_topics",

    # C topic IDs and titles
    "top-c-fundamentals": "fundamentals",
    "top-c-intro": "fundamentals",
    "top-c-operators": "fundamentals",
    "c fundamentals, data types & console i/o": "fundamentals",
    "arithmetic, relational & conditional operators": "fundamentals",
    "top-c-control-flow": "control_flow",
    "top-c-loops": "control_flow",
    "decision making & branching (if-else, switch)": "control_flow",
    "iteration & loop architecture (for, while, do-while)": "control_flow",
    "top-c-arrays": "arrays_strings",
    "top-c-strings": "arrays_strings",
    "single & multidimensional array processing": "arrays_strings",
    "string processing & character sequences": "arrays_strings",
    "top-c-functions": "functions",
    "functions, parameters & call-by-value": "functions",
    "top-c-pointers": "pointers_memory",
    "top-c-pointers-intro": "pointers_memory",
    "top-c-malloc": "pointers_memory",
    "pointers and memory addressing": "pointers_memory",
    "dynamic memory allocation (malloc, calloc, free)": "pointers_memory",
    "top-c-structures": "structures_unions",
    "top-c-advanced-structures": "structures_unions",
    "top-c-structure-pointers": "structures_unions",
    "top-c-unions-enums": "structures_unions",
    "top-c-typedef-bitfields": "structures_unions",
    "structures, unions & typedef architecture": "structures_unions",
    "structures in c": "structures_unions",
    "pointers to structures": "structures_unions",
    "unions and enumerations": "structures_unions",
    "typedef and bit fields": "structures_unions",
    "top-c-file-fundamentals": "file_handling",
    "top-c-file-operations": "file_handling",
    "file handling fundamentals": "file_handling",
    "file operations and random access": "file_handling",
    "top-c-preprocessor": "advanced_topics",
    "top-c-data-structures-intro": "advanced_topics",
    "top-c-singly-linked-list": "advanced_topics",
    "top-c-doubly-circular-list": "advanced_topics",
    "top-c-stacks-queues": "advanced_topics",
    "top-c-trees-bst": "advanced_topics",
    "top-c-searching": "advanced_topics",
    "top-c-sorting": "advanced_topics",
    "top-c-command-line-modular": "advanced_topics",
    "top-c-library-project": "advanced_topics",
    "preprocessor directives and header files": "advanced_topics",
    "introduction to data structures": "advanced_topics",
    "singly linked lists": "advanced_topics",
    "doubly and circular linked lists": "advanced_topics",
    "stacks and queues": "advanced_topics",
    "trees and binary search trees": "advanced_topics",
    "searching algorithms": "advanced_topics",
    "sorting algorithms": "advanced_topics",
    "command-line arguments and modular programming": "advanced_topics",
    "final mini project – library management system": "advanced_topics",

    # C++ topic IDs and titles
    "top-cpp-fundamentals": "fundamentals",
    "top-cpp-intro": "fundamentals",
    "c++ modern fundamentals: type deduction, streams & namespaces": "fundamentals",
    "top-cpp-control-functions": "control_flow_functions",
    "control flow, function overloading & default arguments": "control_flow_functions",
    "top-cpp-references-memory": "memory_management",
    "top-cpp-memory": "memory_management",
    "pointers, references & dynamic memory (new/delete)": "memory_management",
    "top-cpp-oop": "oop",
    "classes, objects & encapsulation": "oop",
    "top-cpp-inheritance": "inheritance_polymorphism",
    "top-cpp-polymorphism": "inheritance_polymorphism",
    "top-cpp-stl": "stl",
    "standard template library": "stl",
    "top-cpp-arrays": "arrays_strings",
    "top-cpp-strings": "arrays_strings",
    "top-cpp-advanced": "advanced_topics",

    # Java topic IDs and titles
    "top-java-fundamentals": "fundamentals",
    "top-java-intro": "fundamentals",
    "java core architecture: jvm, bytecode & strong typing": "fundamentals",
    "top-java-control-flow": "control_flow_methods",
    "top-java-methods-arrays": "control_flow_methods",
    "control flow, switch expressions & loop constructs": "control_flow_methods",
    "static methods, memory stack/heap & arrays": "control_flow_methods",
    "top-java-oop": "oop",
    "classes, objects & inheritance": "oop",
    "top-java-inheritance": "inheritance_interfaces",
    "top-java-interfaces": "inheritance_interfaces",
    "top-java-collections": "collections",
    "java collections framework": "collections",
    "top-java-exceptions": "exceptions_file_handling",
    "top-java-file-handling": "exceptions_file_handling",
    "top-java-arrays": "arrays_strings",
    "top-java-strings": "arrays_strings",
    "top-java-advanced": "advanced_topics",
}


def resolve_topic_slug(raw_topic: Optional[str], course: Optional[str] = None) -> Optional[str]:
    """Map human topic titles or topic IDs to ChromaDB collection slugs with course context."""
    if not raw_topic or not raw_topic.strip():
        return None
    cleaned = raw_topic.strip().lower()

    # 1. Direct dictionary lookup
    if cleaned in TOPIC_SLUG_MAP:
        return TOPIC_SLUG_MAP[cleaned]

    # 2. Determine target course context
    target_course = normalize_course_name(course) if course and course.strip() else None
    if not target_course:
        if cleaned.startswith("top-cpp-") or cleaned.startswith("cpp-"):
            target_course = "cpp"
        elif cleaned.startswith("top-c-") or cleaned.startswith("c-"):
            target_course = "c"
        elif cleaned.startswith("top-java-") or cleaned.startswith("java-"):
            target_course = "java"
        elif cleaned.startswith("top-py-") or cleaned.startswith("py-"):
            target_course = "python"

    # 3. Direct valid slug check for target course
    if target_course and target_course in VALID_CHROMA_TOPIC_SLUGS:
        valid_slugs = VALID_CHROMA_TOPIC_SLUGS[target_course]
        if cleaned in valid_slugs:
            return cleaned

        # 4. Course-specific keyword heuristics
        if target_course == "c":
            if any(k in cleaned for k in ("pointer", "malloc", "calloc", "free", "memory", "address")):
                return "pointers_memory"
            if any(k in cleaned for k in ("struct", "union", "typedef", "bitfield", "bit-field")):
                return "structures_unions"
            if any(k in cleaned for k in ("file", "fopen", "fread", "fwrite", "fputs", "fgets")):
                return "file_handling"
            if any(k in cleaned for k in ("array", "string")):
                return "arrays_strings"
            if any(k in cleaned for k in ("function", "recursion", "param")):
                return "functions"
            if any(k in cleaned for k in ("control", "flow", "loop", "if", "switch", "branch", "iteration")):
                return "control_flow"
            if any(k in cleaned for k in ("preprocessor", "data-structures", "list", "stack", "queue", "tree", "bst", "sort", "search", "modular", "command-line", "project", "advanced")):
                return "advanced_topics"
            if any(k in cleaned for k in ("fund", "intro", "operator", "type", "io", "variable")):
                return "fundamentals"

        elif target_course == "cpp":
            if any(k in cleaned for k in ("stl", "vector", "map", "set", "iterator", "algorithm", "container")):
                return "stl"
            if any(k in cleaned for k in ("inherit", "poly", "virtual", "override", "abstract")):
                return "inheritance_polymorphism"
            if any(k in cleaned for k in ("memory", "reference", "pointer", "new", "delete", "raii", "smart_ptr", "unique_ptr", "shared_ptr")):
                return "memory_management"
            if any(k in cleaned for k in ("oop", "class", "object", "encapsul", "constructor", "destructor")):
                return "oop"
            if any(k in cleaned for k in ("control", "flow", "function", "overload", "loop", "argument")):
                return "control_flow_functions"
            if any(k in cleaned for k in ("array", "string")):
                return "arrays_strings"
            if any(k in cleaned for k in ("template", "lambda", "concurrency", "thread", "advanced")):
                return "advanced_topics"
            if any(k in cleaned for k in ("fund", "intro", "stream", "namespace", "type")):
                return "fundamentals"

        elif target_course == "java":
            if any(k in cleaned for k in ("collection", "arraylist", "hashmap", "set", "map", "list", "queue", "deque")):
                return "collections"
            if any(k in cleaned for k in ("inherit", "interface", "poly", "abstract", "override")):
                return "inheritance_interfaces"
            if any(k in cleaned for k in ("except", "try", "catch", "throw", "file", "stream", "reader", "writer", "io")):
                return "exceptions_file_handling"
            if any(k in cleaned for k in ("oop", "class", "object", "encapsul", "constructor")):
                return "oop"
            if any(k in cleaned for k in ("control", "flow", "loop", "method", "switch", "branch")):
                return "control_flow_methods"
            if any(k in cleaned for k in ("array", "string")):
                return "arrays_strings"
            if any(k in cleaned for k in ("thread", "concurren", "stream", "lambda", "generic", "jvm", "advanced")):
                return "advanced_topics"
            if any(k in cleaned for k in ("fund", "intro", "bytecode", "variable", "type")):
                return "fundamentals"

        elif target_course == "python":
            if any(k in cleaned for k in ("list", "dict", "tuple", "set", "string", "matrix", "comprehension")):
                return "data_structures"
            if any(k in cleaned for k in ("control", "flow", "loop", "if", "else", "while", "for", "branch")):
                return "control_flow"
            if any(k in cleaned for k in ("function", "def", "lambda", "recur", "scope", "legb")):
                return "functions"
            if any(k in cleaned for k in ("oop", "class", "object", "encapsul", "inherit", "method")):
                return "oop"
            if any(k in cleaned for k in ("except", "error", "module", "regex", "import", "package")):
                return "exceptions_modules"
            if any(k in cleaned for k in ("file", "read", "write", "open")):
                return "file_handling"
            if any(k in cleaned for k in ("async", "generator", "decorator", "advanced", "problem-solving")):
                return "advanced_topics"
            if any(k in cleaned for k in ("fund", "intro", "operator", "var", "type", "io")):
                return "fundamentals"

    return cleaned


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

    norm_topic = resolve_topic_slug(topic, course=norm_course)
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
    fetch_k = max(top_k * 4, 15)
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

    query_words = [
        w for w in re.findall(r'[a-zA-Z0-9_:]+', query.lower())
        if len(w) >= 3 and w not in _STOP_WORDS
    ]

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

        # Grounded section metadata adjustment:
        # Demote non-instructional syllabus / prerequisite checklists so substantive content ranks first
        sec_lower = doc_section.lower()
        if "prerequisite" in sec_lower or "learning objective" in sec_lower:
            rank_score -= 0.08

        # Grounded lexical relevance adjustment:
        # Dense vector models have small distance variance between related chapters;
        # provide slight hybrid term overlap boost for exact technical keywords.
        if query_words:
            doc_lower = doc_text.lower()
            matches = sum(1 for w in query_words if w in doc_lower)
            rank_score += 0.03 * (matches / len(query_words))

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

    # Sort candidates by combined rank score
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
