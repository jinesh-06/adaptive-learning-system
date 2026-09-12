"""
Context Formatter module for the RAG pipeline.
Converts retrieved document chunks into clean, structured context strings for Member 3's Gemini / LLM consumption.
Output format per chunk:
COURSE: <COURSE>
TOPIC: <TOPIC>
LEVEL: <LEVEL>
SOURCE: <SOURCE>
SECTION: <SECTION>

[content]
"""

from typing import List, Dict, Any, Optional


def format_context(
    retrieved_documents: List[Dict[str, Any]],
    include_metadata: bool = True,
    separator: str = "\n\n---\n\n"
) -> str:
    """
    Format a list of retrieved chunks into a clean, LLM-ready context block.

    Structure per chunk:
    COURSE: C
    TOPIC: POINTERS
    LEVEL: BEGINNER
    SOURCE: c_pointers_memory.txt
    SECTION: Pointer Basics

    [Relevant educational content]

    Args:
        retrieved_documents: List of retrieved chunk dictionaries from retrieve_documents().
        include_metadata: Whether to prepend COURSE, TOPIC, LEVEL, SOURCE, SECTION headers.
        separator: String delimiter separating consecutive chunks.

    Returns:
        str: Formatted context block suitable for Gemini prompt construction.
    """
    if not retrieved_documents:
        return "No relevant context found in knowledge base."

    formatted_blocks: List[str] = []

    for idx, doc in enumerate(retrieved_documents, 1):
        text = doc.get("text", "").strip()
        source = doc.get("source", "unknown")
        course = doc.get("course", "general").upper()
        topic = doc.get("topic", "general").replace("_", " ").upper()
        level = doc.get("level", "intermediate").upper()
        section = doc.get("section", "General Content").strip()

        if include_metadata:
            header = f"COURSE: {course}\nTOPIC: {topic}\nLEVEL: {level}\nSOURCE: {source}\nSECTION: {section}"
            block = f"{header}\n\n{text}"
        else:
            block = text

        formatted_blocks.append(block)

    return separator.join(formatted_blocks)


def format_rag_prompt(
    query: str,
    retrieved_documents: List[Dict[str, Any]],
    cognitive_load: Optional[str] = None,
    system_instruction: Optional[str] = None
) -> str:
    """
    Helper function to compose a complete context-augmented prompt template
    ready to be forwarded by Member 3 to Gemini / LLM.

    Args:
        query: Student's programming question.
        retrieved_documents: Chunks returned by retrieve_documents().
        cognitive_load: Optional cognitive load state ("LOW", "MEDIUM", "HIGH").
        system_instruction: Optional pedagogical instructions for the LLM.

    Returns:
        str: Full assembled prompt with context, cognitive load level, and student question.
    """
    context_text = format_context(retrieved_documents)

    load_instruction = ""
    if cognitive_load:
        load_instruction = f"STUDENT COGNITIVE LOAD: {cognitive_load.upper()}\n"

    instruction = system_instruction or (
        "You are an adaptive programming AI tutor. Use the provided verified educational "
        "knowledge base context below to answer the student's question accurately, concisely, "
        "and with educational code examples where appropriate. Adapt explanation complexity "
        "to the student's cognitive load level."
    )

    prompt = (
        f"{instruction}\n\n"
        f"{load_instruction}"
        f"=== CONTEXT FROM KNOWLEDGE BASE ===\n"
        f"{context_text}\n"
        f"===================================\n\n"
        f"STUDENT QUESTION: {query}\n\n"
        f"ADAPTIVE TUTOR RESPONSE:"
    )
    return prompt


if __name__ == "__main__":
    sample_docs = [
        {
            "chunk_id": "c_pointers_memory_001",
            "source": "c_pointers_memory.txt",
            "course": "c",
            "topic": "pointers_memory",
            "level": "beginner",
            "section": "Pointer Basics",
            "similarity": 0.88,
            "text": "A pointer is a variable that stores the memory address of another variable."
        },
        {
            "chunk_id": "c_pointers_memory_012",
            "source": "c_pointers_memory.txt",
            "course": "c",
            "topic": "pointers_memory",
            "level": "intermediate",
            "section": "Pointer Arithmetic",
            "similarity": 0.81,
            "text": "Pointer arithmetic in C accounts for the size of the underlying data type automatically."
        }
    ]
    formatted = format_context(sample_docs)
    print("Formatted Context Output:\n")
    print(formatted)
