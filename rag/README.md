# RAG Knowledge-Base & Retrieval System
## Cognitive-Load-Aware Adaptive Learning Engine

### Role: Member 2 — RAG Engineer

---

## 1. Project Purpose & Overview

The **RAG (Retrieval-Augmented Generation)** subsystem forms the authoritative knowledge backbone of the **Cognitive-Load-Aware Adaptive Learning Engine**. 

When a student interacts with the learning platform, their cognitive load state (`LOW`, `MEDIUM`, `HIGH`) and learning query are processed. Rather than relying solely on generic LLM parametric knowledge, this RAG subsystem retrieves semantically precise, curriculum-grounded programming lessons, code examples, debugging patterns, common pitfalls, and memory models to construct rich grounding context for Member 3's Gemini explanation generator.

### Key Capabilities
- **Curriculum-Grounded Knowledge Base**: Exactly 32 comprehensive, deep textbook-chapter documents spanning C, C++, Python, and Java (2,000 to 5,000+ words per topic).
- **Structure-Aware Semantic Chunking**: Section- and paragraph-aware chunking (600–1200 characters, 100–250 character overlap) preserving section headers (`SECTION: ...`), code blocks, and adaptive difficulty levels.
- **Local Sentence-Transformer Embeddings**: Thread-safe singleton model (`all-MiniLM-L6-v2`) generating 384-dimensional dense semantic vectors with zero external API costs or latency.
- **Persistent ChromaDB Vector Store**: Embedded persistent vector database with cosine distance indexing, idempotent batch upserts, and compound metadata filtering (`$and` queries).
- **Multi-Attribute & Adaptive Retrieval**: Top-$k$ similarity search with granular course, topic, and difficulty level filtering, plus adaptive `learner_level` cognitive ranking.
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
       [ Semantic Chunker ] ──────► 600-1200 chars, 100-250 overlap + Metadata & Section
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
[ Query Ingestion ]    [ Multi-Attribute & Adaptive Filter ]
(Semantic Vector)      (Course, Topic, Level, learner_level)
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

The knowledge base supports **4 foundational programming courses** with **exactly 8 detailed documents per course (32 total)**:

| Course | Code / Key | Document Count | Topics Covered |
| :--- | :--- | :---: | :--- |
| **C** | `c` | 8 | Fundamentals, Control Flow, Functions, Arrays & Strings, Pointers & Memory, Structures & Unions, File Handling, Advanced Topics |
| **C++** | `cpp` | 8 | Fundamentals, Control Flow & Functions, Arrays & Strings, OOP, Inheritance & Polymorphism, STL (Standard Template Library), Memory Management & Smart Pointers, Advanced Modern C++ |
| **Python** | `python` | 8 | Fundamentals, Control Flow, Functions & Scopes, Data Structures & Collections, OOP, Exceptions & Modules, File Handling, Advanced Topics |
| **Java** | `java` | 8 | Fundamentals, Control Flow & Methods, Arrays & Strings, OOP, Inheritance & Interfaces, Collections Framework, Exceptions & File Handling, Advanced Topics |

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
│       ├── java_exceptions_file_handling.txt
│       └── java_advanced_topics.txt
├── chroma_db/               # Persistent ChromaDB vector store
├── src/
│   ├── __init__.py          # Public module exports
│   ├── config.py            # Central RAG configuration & constants
│   ├── document_loader.py   # Recursive loader & path-based metadata extractor
│   ├── text_chunker.py      # Semantic section-aware chunker (600-1200 chars)
│   ├── embeddings.py        # Sentence-Transformer singleton (all-MiniLM-L6-v2)
│   ├── vector_store.py      # ChromaDB client, upserts, and search
│   ├── ingest.py            # CLI and library ingestion runner
│   ├── retriever.py         # Multi-filter and adaptive similarity retriever
│   ├── context_formatter.py # Gemini-ready context serializer
│   └── test_rag.py          # Comprehensive evaluation & verification suite
├── requirements.txt         # Subsystem dependencies
├── .gitignore               # Ignored cache, virtualenv, and temp files
└── README.md                # System documentation
```

---

## 4. Document Structure Standard

Every educational document adheres to a standardized **27-section format**:

1. **Introduction**: High-level motivation and conceptual orientation.
2. **Learning Objectives**: Concrete competencies acquired upon mastery.
3. **Prerequisites**: Necessary prior knowledge before tackling the chapter.
4. **Core Concepts**: Foundational rules, definitions, and mental models.
5. **Detailed Theory**: In-depth theoretical walkthrough.
6. **Syntax**: Exact language grammar and signatures.
7. **Basic Examples**: Accessible hello-world style illustrations.
8. **Intermediate Examples**: Real-world algorithmic workflows.
9. **Advanced Examples**: Performance-critical or architecture-level examples.
10. **Line-by-Line Code Explanation**: Mechanical breakdown of key routines.
11. **Practical Programming Problems**: Real-world engineering tasks.
12. **Real-World Applications**: Industry use cases and systems patterns.
13. **Common Mistakes**: Incorrect vs. Correct code patterns.
14. **Common Errors and Error Messages**: Exact compiler/runtime diagnostics and causes.
15. **Debugging Techniques**: Step-by-step troubleshooting, logging, sanitizers, and flags.
16. **Edge Cases**: Boundary conditions, overflow, null states, and off-by-one errors.
17. **Best Practices**: Idiomatic patterns and clean code conventions.
18. **Performance Considerations**: Time/space complexity and memory layout.
19. **Security Considerations**: Buffer overflows, injection, leaks, bounds safety.
20. **Memory Considerations**: Stack, heap, static storage, and layout models.
21. **Comparison with Related Concepts**: Comparative trade-off matrices.
22. **Frequently Asked Questions**: Direct answers to common learner questions.
23. **Interview Questions**: Beginner, Intermediate, and Advanced interview questions.
24. **Exam Questions**: Short, medium, and long-answer academic questions.
25. **Practice Questions**: Conceptual, coding, debugging, and output prediction sets.
26. **Summary**: Concise recap for rapid review.
27. **Key Takeaways**: High-yield summary points.

---

## 5. Metadata Schema

Each document chunk retains comprehensive metadata preserved through ChromaDB:

```json
{
  "course": "python",
  "topic": "data_structures",
  "level": "intermediate",
  "section": "7. Basic Examples",
  "source": "python_data_structures.txt",
  "chunk_id": "python_data_structures_004",
  "chunk_index": 4,
  "char_length": 842
}
```

- `course`: Normalized course code (`c`, `cpp`, `python`, `java`).
- `topic`: Derived topic identifier (e.g., `data_structures`, `pointers_memory`, `collections`).
- `level`: Educational difficulty tag (`beginner`, `intermediate`, `advanced`).
- `section`: Section title header.
- `source`: Source filename.
- `chunk_id`: Deterministic unique identifier (`{source_stem}_{index:03d}`).

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

---

## 8. Verification & Evaluation Suite

Execute the comprehensive evaluation suite covering Hit@1, Hit@3, Hit@5 retrieval accuracy, course isolation, ambiguous query disambiguation, adaptive level ranking, metadata filtering, thresholding, and idempotency:

```powershell
python -m rag.src.test_rag
```

### Ambiguous Query Disambiguation Test
The evaluation suite ensures identical terminology across languages is correctly isolated:
- `"What is a vector?"` with `course="cpp"` → returns C++ STL Vector
- `"What is a list?"` with `course="python"` → returns Python Dynamic Lists
- `"What is inheritance?"` with `course="java"` → returns Java OOP Inheritance
- `"What is a pointer?"` with `course="c"` → returns C Pointers & Memory

---

## 9. Member 3 Integration Contract (Gemini Generation)

Member 3 (LLM / Generation Engineer) can directly consume the RAG retrieval module:

### Python Integration Example

```python
from rag.src import retrieve_documents, format_context

# 1. User submits query during learning session
query = "How do smart pointers prevent memory leaks in C++?"
student_course = "cpp"
learner_cognitive_load = "HIGH"  # From Member 1's ML Classifier ("LOW", "MEDIUM", "HIGH")

# Map cognitive load to learner difficulty preference
level_map = {
    "LOW": "advanced",      # Low load -> can handle deep/advanced material
    "MEDIUM": "intermediate",
    "HIGH": "beginner"      # High load -> prefer clear foundational explanations
}
preferred_level = level_map.get(learner_cognitive_load, "intermediate")

# 2. Retrieve relevant RAG chunks with course isolation and adaptive level ranking
retrieved_chunks = retrieve_documents(
    query=query,
    top_k=4,
    course=student_course,
    learner_level=preferred_level,
    threshold=0.30  # Optional minimum similarity score
)

# 3. Format context string
context_str = format_context(retrieved_chunks)

# 4. Construct prompt for Gemini (Member 3's task)
prompt = f"""You are an adaptive programming tutor.
Student Cognitive Load: {learner_cognitive_load}

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
COURSE: C
TOPIC: POINTERS MEMORY
LEVEL: BEGINNER
SOURCE: c_pointers_memory.txt
SECTION: 7. Basic Examples

A pointer in C is a variable that stores the memory address of another variable...

---

COURSE: C
TOPIC: POINTERS MEMORY
LEVEL: INTERMEDIATE
SOURCE: c_pointers_memory.txt
SECTION: 8. Intermediate Examples

Pointer arithmetic operates in units of the underlying data type size...
```

---

## 10. Adding Future Programming Courses

The RAG engine uses **zero-configuration dynamic directory discovery**. To add a future course (e.g., `Rust`, `Go`, `JavaScript`):

1. Create a folder under `rag/documents/<COURSE_NAME>/` (e.g., `rag/documents/RUST/`).
2. Add comprehensive `.txt` lesson files following the standard naming format: `rust_ownership.txt`, `rust_concurrency.txt`.
3. Include the standard metadata header or rely on automatic directory parsing.
4. Re-run `python -m rag.src.ingest`.
5. The course is immediately available for retrieval via `retrieve_documents(query, course="rust")`. No code modification required.
