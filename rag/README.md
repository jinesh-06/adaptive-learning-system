# RAG Knowledge-Base & Retrieval System
## Cognitive-Load-Aware Adaptive Learning Engine

### Role: Member 2 — RAG Engineer

---

## 1. Project Purpose & Overview

The **RAG (Retrieval-Augmented Generation)** subsystem forms the authoritative knowledge backbone of the **Cognitive-Load-Aware Adaptive Learning Engine**. 

When a student interacts with the learning platform, their cognitive load state (e.g., `LOW`, `OPTIMAL`, `HIGH`) and learning query are evaluated. Rather than relying solely on parametric LLM knowledge (which is prone to hallucinations and uncalibrated depth), this RAG subsystem retrieves semantically precise, curriculum-grounded programming lessons, code examples, debugging patterns, and common pitfalls to construct rich grounding context for Member 3's Gemini explanation generator.

### Key Capabilities
- **Curriculum-Grounded Knowledge Base**: 32 comprehensive, deep educational documents spanning C, C++, Python, and Java (1,200 to 2,000+ words per topic).
- **Structure-Aware Semantic Chunking**: Section- and paragraph-aware chunking (500–1000 characters, 100–200 character overlap) that avoids blind splitting across code blocks and explanations.
- **Local Sentence-Transformer Embeddings**: Thread-safe singleton model (`all-MiniLM-L6-v2`) generating 384-dimensional dense semantic vectors with zero external API costs or rate limits.
- **Persistent ChromaDB Vector Store**: Embedded persistent vector database with cosine distance indexing, idempotent batch upserts, and compound metadata filtering (`$and` queries).
- **Multi-Attribute Retrieval**: Top-$k$ similarity search with granular course, topic, and difficulty level filtering, plus cosine similarity confidence thresholding.
- **Cognitive-Load-Ready Context Formatting**: Standardized context serializations ready for seamless downstream prompt injection by Member 3.

---

## 2. RAG Architecture

```
[ Programming Courses: C, C++, Python, Java ]
                 │
                 ▼
     [ 32 Educational Documents ]
                 │
                 ▼
       [ Document Loader ]  ──────► Extracts Course, Topic, Level, Filename
                 │
                 ▼
       [ Semantic Chunker ] ──────► 500-1000 chars, 100-200 overlap + Metadata
                 │
                 ▼
     [ SentenceTransformer ] ──────► all-MiniLM-L6-v2 (384-dim embeddings)
                 │
                 ▼
        [ ChromaDB Store ]  ──────► Collection: "programming_knowledge"
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
[ Query Ingestion ]    [ Multi-Attribute Filter ]
(Semantic Vector)      (Course, Topic, Level)
    │                         │
    └────────────┬────────────┘
                 │
                 ▼
      [ Top-K Document Retrieval ]
                 │
                 ▼
    [ Context Formatter (Member 3) ] ───► Gemini Explanation Engine
```

---

## 3. Supported Courses & Knowledge Base Structure

The knowledge base currently supports **4 foundational programming courses**:

| Course | Code / Key | Document Count | Topics Covered |
| :--- | :--- | :---: | :--- |
| **C** | `c` | 8 | Fundamentals, Control Flow, Functions, Arrays & Strings, Pointers & Memory, Structures & Unions, File Handling, Advanced Topics |
| **C++** | `cpp` | 8 | Fundamentals, Control Flow & Functions, Arrays & Strings, OOP, Inheritance & Polymorphism, STL (Standard Template Library), Memory Management & Smart Pointers, Advanced Modern C++ |
| **Python** | `python` | 8 | Fundamentals, Control Flow, Functions & Scopes, Data Structures & Collections, OOP, Exceptions & Modules, File Handling, Advanced Topics |
| **Java** | `java` | 8 | Fundamentals, Control Flow & Methods, Arrays & Strings, OOP, Inheritance & Interfaces, Collections Framework, Exceptions, Advanced Topics |

### Directory Hierarchy

```
rag/
├── documents/
│   ├── C/
│   │   ├── c_fundamentals.txt
│   │   ├── c_control_flow.txt
│   │   ├── c_functions.txt
│   │   ├── c_arrays_strings.txt
│   │   ├── c_pointers_memory.txt
│   │   ├── c_structures_unions.txt
│   │   ├── c_file_handling.txt
│   │   └── c_advanced_topics.txt
│   ├── CPP/
│   │   ├── cpp_fundamentals.txt
│   │   ├── cpp_control_flow_functions.txt
│   │   ├── cpp_arrays_strings.txt
│   │   ├── cpp_oop.txt
│   │   ├── cpp_inheritance_polymorphism.txt
│   │   ├── cpp_stl.txt
│   │   ├── cpp_memory_management.txt
│   │   └── cpp_advanced_topics.txt
│   ├── PYTHON/
│   │   ├── python_fundamentals.txt
│   │   ├── python_control_flow.txt
│   │   ├── python_functions.txt
│   │   ├── python_data_structures.txt
│   │   ├── python_oop.txt
│   │   ├── python_exceptions_modules.txt
│   │   ├── python_file_handling.txt
│   │   └── python_advanced_topics.txt
│   └── JAVA/
│       ├── java_fundamentals.txt
│       ├── java_control_flow_methods.txt
│       ├── java_arrays_strings.txt
│       ├── java_oop.txt
│       ├── java_inheritance_interfaces.txt
│       ├── java_collections.txt
│       ├── java_exceptions.txt
│       └── java_advanced_topics.txt
├── chroma_db/               # Persistent ChromaDB vector store
├── src/
│   ├── __init__.py          # Public module exports
│   ├── config.py            # Central RAG configuration & constants
│   ├── document_loader.py   # Recursive loader & path-based metadata extractor
│   ├── text_chunker.py      # Semantic paragraph-aware chunker
│   ├── embeddings.py        # Sentence-Transformer singleton
│   ├── vector_store.py      # ChromaDB client, upserts, and search
│   ├── ingest.py            # CLI and library ingestion runner
│   ├── retriever.py         # Multi-filter similarity retriever
│   ├── context_formatter.py # Gemini-ready context serializer
│   └── test_rag.py          # Comprehensive evaluation & verification suite
├── requirements.txt         # Subsystem dependencies
├── .gitignore               # Ignored cache, virtualenv, and temp files
└── README.md                # System documentation
```

---

## 4. Document Structure Standard

Every educational document adheres to a standardized **18-section format**:

1. **Title & Metadata Header**: Course, topic, level, source identifier.
2. **Introduction**: High-level motivation and conceptual orientation.
3. **Learning Objectives**: Concrete competencies acquired upon mastery.
4. **Core Concepts**: Foundational rules, definitions, and mental models.
5. **Detailed Explanation**: In-depth theoretical walkthrough.
6. **Syntax & Grammatical Rules**: Exact language grammar and signatures.
7. **Basic Examples**: Accessible hello-world style illustrations.
8. **Intermediate Examples**: Real-world algorithmic workflows.
9. **Advanced Examples**: Performance-critical or architecture-level examples.
10. **Code Explanation**: Line-by-line mechanical breakdown.
11. **Practical Use Cases**: Industry applications and typical design patterns.
12. **Common Mistakes**: Frequent bugs, misconceptions, and undefined behaviors.
13. **Edge Cases**: Boundary conditions, overflow, null states, and off-by-one errors.
14. **Best Practices**: Idiomatic patterns and clean code conventions.
15. **Performance Considerations**: Time/space complexity and memory layout.
16. **Comparison with Related Concepts**: Comparative trade-off tables.
17. **Debugging Tips**: Practical diagnosis strategies and compiler/runtime flags.
18. **Interview Questions & Concept Checks**: Assessment problems with detailed solutions.
19. **Summary**: Concise recap for rapid review.

---

## 5. Metadata Schema

Each document chunk retains comprehensive metadata preserved through ChromaDB:

```json
{
  "course": "python",
  "topic": "data_structures",
  "level": "intermediate",
  "source": "python_data_structures.txt",
  "chunk_id": "python_data_structures_txt_chunk_0042",
  "chunk_index": 42,
  "char_length": 748
}
```

- `course`: Normalized course code (`c`, `cpp`, `python`, `java`).
- `topic`: Derived topic identifier (e.g., `data_structures`, `pointers_memory`, `collections`).
- `level`: Cognitive difficulty tag (`beginner`, `intermediate`, `advanced`).
- `source`: Source filename.
- `chunk_id`: Deterministic unique identifier (`{source_sanitized}_chunk_{index:04d}`).

---

## 6. Installation & Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.12/3.13)
- Windows PowerShell or Command Prompt

### Virtual Environment Setup

```powershell
# Navigate to project root
cd c:\Users\Manoj kumar\OneDrive\Documents\project\adaptive-learning-system

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Install RAG dependencies
pip install -r rag/requirements.txt
```

---

## 7. Ingestion Pipeline

To parse all 32 documents, generate semantic chunks, compute embeddings, and populate ChromaDB:

```powershell
# Reset existing index and ingest all documents
python -m rag.src.ingest --reset
```

### Ingestion Output Example:
```
[RAG Ingestion] Initializing ingestion pipeline...
[DocumentLoader] Loading documents from: .../rag/documents
[DocumentLoader] Successfully loaded 32 documents.
[TextChunker] Chunked 32 documents into 889 chunks.
[VectorStore] Initializing ChromaDB persistent client at: .../rag/chroma_db
[VectorStore] Connecting to collection: 'programming_knowledge' (metric=cosine)
[EmbeddingModel] Loading 'all-MiniLM-L6-v2' (device=cpu)...
[EmbeddingModel] Model loaded successfully. Embedding dimension: 384
[VectorStore] Upserting 889 chunks in batches of 100...
[VectorStore] Batch 1/9 (100 items) indexed.
...
[VectorStore] Successfully upserted 889 chunks. Total in collection: 889.
[RAG Ingestion] Ingestion complete in 14.82s!
```

---

## 8. Verification & Evaluation Suite

Execute the comprehensive evaluation suite covering Hit@1, Hit@3, Hit@5 retrieval accuracy, course isolation, metadata filtering, thresholding, and edge cases:

```powershell
python -m rag.src.test_rag
```

### Evaluated Test Queries

| Course | Query | Target Topic |
| :--- | :--- | :--- |
| **C** | *"What is a pointer in C?"* | `pointers_memory` |
| **C** | *"How does malloc work?"* | `pointers_memory` |
| **C** | *"What is a structure in C?"* | `structures_unions` |
| **C++** | *"What is inheritance in C++?"* | `inheritance_polymorphism` |
| **C++** | *"What is a vector in C++?"* | `stl` |
| **C++** | *"What are smart pointers?"* | `memory_management` |
| **Python** | *"What is a list comprehension?"* | `data_structures` |
| **Python** | *"How do Python dictionaries work?"* | `data_structures` |
| **Python** | *"What are decorators?"* | `functions` / `advanced_topics` |
| **Java** | *"What is an interface?"* | `inheritance_interfaces` |
| **Java** | *"What is HashMap?"* | `collections` |
| **Java** | *"What is method overriding?"* | `inheritance_interfaces` |

---

## 9. Member 3 Integration Contract (Gemini Generation)

Member 3 (LLM / Generation Engineer) can directly consume the RAG retrieval module:

### Python Integration Example

```python
from rag.src import retrieve_documents, format_context

# 1. User submits query during learning session
query = "How do smart pointers prevent memory leaks in C++?"
student_course = "cpp"
cognitive_load = "HIGH"  # From Member 1's ML Classifier

# 2. Retrieve relevant RAG chunks with course isolation
retrieved_chunks = retrieve_documents(
    query=query,
    top_k=4,
    course=student_course,
    threshold=0.30  # Optional minimum similarity score
)

# 3. Format context string
context_str = format_context(retrieved_chunks)

# 4. Construct prompt for Gemini (Member 3's task)
prompt = f"""You are an adaptive programming tutor.
Student Cognitive Load: {cognitive_load}

GROUNDING CONTEXT:
{context_str}

STUDENT QUESTION:
{query}

Please provide a tailored explanation adapted to the student's cognitive load.
"""

# 5. Pass to Gemini API
# response = gemini_model.generate_content(prompt)
```

### Context Formatter Output Format

```
COURSE: CPP
TOPIC: MEMORY_MANAGEMENT
LEVEL: ADVANCED
SOURCE: cpp_memory_management.txt
SIMILARITY: 0.8214
---
Smart pointers are class templates that encapsulate raw pointers and manage
object lifetime automatically using RAII (Resource Acquisition Is Initialization).
std::unique_ptr ensures exclusive ownership and prevents memory leaks by
deleting the managed object when the pointer goes out of scope...
================================================================================
```

---

## 10. Adding Future Programming Courses

The RAG engine uses **zero-configuration dynamic directory discovery**. To add a future course (e.g., `Rust`, `Go`, `JavaScript`):

1. Create a folder under `rag/documents/<COURSE_NAME>/` (e.g., `rag/documents/RUST/`).
2. Add comprehensive `.txt` lesson files following the standard naming format: `rust_ownership.txt`, `rust_concurrency.txt`.
3. Include the standard metadata header or rely on automatic directory parsing:
   ```
   COURSE: RUST
   TOPIC: OWNERSHIP
   LEVEL: INTERMEDIATE
   ```
4. Re-run `python -m rag.src.ingest`.
5. The course is immediately available for retrieval via `retrieve_documents(query, course="rust")`. No code modification required.

---

## 11. Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `ModuleNotFoundError: No module named 'rag'` | Running script from inside `rag/src` without package context | Run from project root using `-m`: `python -m rag.src.test_rag` |
| ChromaDB lock error | Another process has an exclusive lock on `chroma_db` | Terminate any lingering Python processes holding the directory lock. |
| Embeddings download slow on first run | Hugging Face downloading `all-MiniLM-L6-v2` (~90 MB) | Wait for initial download to complete; model is cached locally in `~/.cache/huggingface/hub/`. |
