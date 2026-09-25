# 📚 Adaptive Learning System — RAG Knowledge & Retrieval Subsystem

[![Branch](https://img.shields.io/badge/branch-rag--development-success.svg)](https://github.com/jinesh-06/adaptive-learning-system/tree/rag-development)
[![Role](https://img.shields.io/badge/role-Member%202%20(RAG%20Engineer)-blue.svg)](rag/README.md)
[![Vector DB](https://img.shields.io/badge/VectorDB-ChromaDB-purple.svg)](https://www.trychroma.com/)
[![Embeddings](https://img.shields.io/badge/Embeddings-all--MiniLM--L6--v2-green.svg)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)

This branch houses the **Retrieval-Augmented Generation (RAG) Subsystem** engineered by **Member 2 (RAG Engineer)** for the Adaptive Learning System. It serves as the authoritative, curriculum-grounded knowledge base, enabling the AI Tutor to provide verifiable, pedagogical programming explanations without hallucinations.

---

## 🎯 Purpose & Scope

Generic Large Language Models frequently hallucinate subtle language syntax nuances, mix dialect versions (e.g., Python 2 vs Python 3), or provide overly complex explanations that overwhelm novice learners.

The RAG subsystem eliminates these issues by:
1. **Indexing 32 Textbook-Grade Chapters**: Curated, comprehensive lessons across **C, C++, Python, and Java** (8 comprehensive chapters per course).
2. **Semantic Chunking**: Structure-preserving chunker (600–1200 characters with 100–250 character overlap) that retains code blocks, syntax rules, common pitfalls, and section headers.
3. **Local Dense Semantic Search**: `all-MiniLM-L6-v2` sentence-transformer producing 384-dimensional embeddings with low latency and zero external API fees.
4. **Multi-Attribute & Cognitive Filtering**: Persistent ChromaDB vector collection (`programming_knowledge`) supporting compound `$and` queries across course key, topic, difficulty level, and learner cognitive state.

---

## 📂 Subsystem Directory Structure

```text
rag/
├── documents/                # 32 Authoritative Textbook Documents
│   ├── C/                    # 8 chapters: fundamentals, pointers, memory, etc.
│   ├── CPP/                  # 8 chapters: OOP, inheritance, STL, modern C++
│   ├── PYTHON/               # 8 chapters: fundamentals, data structures, OOP, etc.
│   └── JAVA/                 # 8 chapters: OOP, interfaces, collections, etc.
├── src/                      # RAG Processing & Retrieval Code
│   ├── chunker.py            # Section- and code-block-aware text chunker
│   ├── embeddings.py         # Thread-safe singleton for all-MiniLM-L6-v2
│   ├── indexer.py            # Batch document parser & ChromaDB indexing pipeline
│   └── retriever.py          # Multi-attribute similarity search & context formatter
├── chromadb_store/           # Persistent ChromaDB vector database files
└── README.md                 # In-depth RAG engineering documentation
```

---

## 📖 Supported Courses & Document Catalog

| Course | Language Key | Chapters | Topics Covered |
| :--- | :---: | :---: | :--- |
| **C** | `c` | 8 | Fundamentals, Control Flow, Functions, Arrays & Strings, Pointers & Memory, Structures & Unions, File Handling, Advanced Topics |
| **C++** | `cpp` | 8 | Fundamentals, Control Flow & Functions, Arrays & Strings, OOP, Inheritance & Polymorphism, STL, Memory Management & Smart Pointers, Advanced Modern C++ |
| **Python** | `python` | 8 | Fundamentals, Control Flow, Functions & Scopes, Data Structures & Collections, OOP, Exceptions & Modules, File Handling, Advanced Topics |
| **Java** | `java` | 8 | Fundamentals, Control Flow & Methods, Arrays & Strings, OOP, Inheritance & Interfaces, Collections Framework, Exceptions & File Handling, Advanced Topics |

---

## 🏗️ RAG Pipeline Architecture

```
[ 32 Educational Documents (C, C++, Python, Java) ]
                      │
                      ▼
[ Document Loader & Metadata Extraction ] ──► course, topic, level, section
                      │
                      ▼
[ Structure-Preserving Semantic Chunker ] ──► 600-1200 chars, 100-250 overlap
                      │
                      ▼
   [ SentenceTransformer (all-MiniLM-L6-v2) ] ──► 384-dimensional dense vectors
                      │
                      ▼
       [ ChromaDB Vector Collection ] ──────────► "programming_knowledge"
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
   [ Query Ingestion ]     [ Multi-Attribute Filtering ]
  (Embedding vector)      (Course, Topic, Difficulty, Cognitive State)
         │                         │
         └────────────┬────────────┘
                      │
                      ▼
        [ Top-K Ranked Context Chunks ]
                      │
                      ▼
     [ Formatted Context Serializer ] ──────────► Injected into Gemini Prompt
```

---

## 🚀 How to Index & Query

### 1. Install Dependencies
```bash
pip install chromadb sentence-transformers torch
```

### 2. Build or Rebuild the Vector Index
```bash
python rag/src/indexer.py
```
This script scans all 32 documents in `rag/documents/`, splits them into semantic chunks, computes 384-dim embeddings, and batch-upserts them idempotently into `rag/chromadb_store/`.

### 3. Query the Knowledge Base (CLI Test)
```bash
python rag/src/retriever.py
```

### 4. Integration Usage in Backend
```python
from rag.src.retriever import get_rag_retriever

retriever = get_rag_retriever()
results = retriever.retrieve(
    query="How do pointers and dynamic memory work in C?",
    course_filter="c",
    top_k=3
)

for chunk in results:
    print(f"[{chunk['topic']} - {chunk['section']}] (Score: {chunk['similarity_score']:.2f})")
    print(chunk['content'][:200], "\n")
```

---

## 🔗 Technical References

- For comprehensive chunking parameters, distance metrics, and ChromaDB schema details, consult [rag/README.md](file:///rag/README.md).
- For backend service integration with LLM prompts, see [backend/services/rag_service.py](file:///backend/services/rag_service.py).
