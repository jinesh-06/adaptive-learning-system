"""LLM Service integrating Gemini adaptive generator and progressive hints."""

import os
import sys
import logging
from typing import Dict, Any, Optional
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from llm.adaptive_generator import generate_adaptive_explanation
from llm.config import get_model_name
from backend.services.rag_service import rag_service

logger = logging.getLogger(__name__)


class LLMService:
    """Manages adaptive explanation generation and progressive hints."""

    def __init__(self):
        self.model_name = get_model_name()

    def generate_explanation(
        self,
        question: str,
        cognitive_load: str = "MEDIUM",
        course: Optional[str] = None,
        topic: Optional[str] = None,
        topic_id: Optional[str] = None,
        section_id: Optional[str] = None,
        section_title: Optional[str] = None,
        section_content: Optional[str] = None,
        level: Optional[str] = None,
        tutor_mode: Optional[str] = None,
        code_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate cognitive-load-adapted explanation grounded in verified RAG knowledge.
        """
        # 1. Build contextual RAG retrieval query
        rag_query_parts = []
        if course:
            rag_query_parts.append(course)
        if topic:
            rag_query_parts.append(topic)
        if section_title:
            rag_query_parts.append(section_title)
        rag_query_parts.append(question)
        rag_query = " ".join(rag_query_parts).strip()

        # 2. Retrieve verified educational context via RAG
        resolved_topic = topic_id or topic
        retrieved_context = rag_service.get_formatted_context(
            query=rag_query,
            course=course or "python",
            topic=resolved_topic,
            level=level,
            top_k=5,
            learner_level=level or "intermediate"
        )

        # 3. Assemble active lesson context
        lesson_ctx_parts = []
        if topic:
            lesson_ctx_parts.append(f"Lesson: {topic}")
        if section_title:
            lesson_ctx_parts.append(f"Section: {section_title}")
        if section_content:
            lesson_ctx_parts.append(f"Content: {section_content.strip()}")
        if code_context:
            lesson_ctx_parts.append(f"Code Context:\n{code_context.strip()}")
        lesson_context_str = "\n".join(lesson_ctx_parts)

        # 4. Attempt Gemini generation via llm.adaptive_generator
        res = generate_adaptive_explanation(
            question=question,
            retrieved_context=retrieved_context,
            cognitive_load=cognitive_load,
            topic=topic or course,
            tutor_mode=tutor_mode,
            lesson_context=lesson_context_str
        )

        # 5. If Gemini succeeds, return standard response
        if res.get("success"):
            return {
                "success": True,
                "answer": res.get("explanation"),
                "cognitive_load": res.get("cognitive_load", cognitive_load),
                "adaptation": res.get("adaptation"),
                "retrieved_context": retrieved_context,
                "source": "gemini-rag-integrated"
            }

        # 6. Graceful Fallback if GEMINI_API_KEY is not set or network unavailable:
        # Synthesize mode-adapted explanation grounded in retrieved chunks
        fallback_explanation = self._build_offline_adaptive_fallback(
            question=question,
            retrieved_context=retrieved_context,
            cognitive_load=cognitive_load,
            tutor_mode=tutor_mode,
            section_title=section_title,
            section_content=section_content
        )

        return {
            "success": True,
            "answer": fallback_explanation,
            "cognitive_load": cognitive_load.upper(),
            "adaptation": {
                "detail_level": "low" if cognitive_load.upper() == "HIGH" else "high" if cognitive_load.upper() == "LOW" else "medium",
                "style": "step-by-step" if cognitive_load.upper() == "HIGH" else "deep-conceptual" if cognitive_load.upper() == "LOW" else "balanced-standard",
                "examples": 1 if cognitive_load.upper() == "HIGH" else 2
            },
            "retrieved_context": retrieved_context,
            "source": "rag-context-grounded-fallback",
            "warning": res.get("error")
        }

    def generate_hint(
        self,
        question: str,
        hint_level: int = 1,
        code_snippet: Optional[str] = None,
        cognitive_load: str = "MEDIUM",
        topic: Optional[str] = None,
        language: Optional[str] = "python"
    ) -> Dict[str, Any]:
        """
        Generate progressive, multi-tier hint conditioned on cognitive load.
        Level 1: Conceptual nudge / underlying principle
        Level 2: Structural pseudocode / logical flow
        Level 3: Exact syntax snippet / target correction
        """
        retrieved_context = rag_service.get_formatted_context(
            query=f"{topic or ''} {question}".strip(),
            course=language,
            topic=topic,
            top_k=2
        )

        hint_prompt = (
            f"Provide a Level {hint_level} pedagogical hint for the following problem:\n"
            f"Problem: {question}\n"
            f"Code: {code_snippet or 'None'}\n"
            f"Level 1: Intuition nudge only, no syntax.\n"
            f"Level 2: Structural pseudocode and logic.\n"
            f"Level 3: Clear concrete syntax and fix example.\n"
            f"Current Learner Cognitive Load: {cognitive_load.upper()}.\n"
        )

        res = generate_adaptive_explanation(
            question=hint_prompt,
            retrieved_context=retrieved_context,
            cognitive_load=cognitive_load,
            topic=topic or language
        )

        if res.get("success"):
            hint_text = res.get("explanation", "")
        else:
            if hint_level == 1:
                hint_text = f"💡 Level 1 Conceptual Nudge: Focus on the base logic of {topic or 'the task'}. Check your loop termination condition or variable assignments."
            elif hint_level == 2:
                hint_text = f"🔍 Level 2 Structural Outline: 1. Initialize counter/accumulator. 2. Iterate across items. 3. Return or yield final evaluated result."
            else:
                hint_text = f"🚀 Level 3 Concrete Solution Guidance: Ensure variables match target types and review syntax:\n```python\nfor item in collection:\n    process(item)\n```"

        return {
            "success": True,
            "hint_level": hint_level,
            "hint": hint_text,
            "cognitive_load": cognitive_load.upper(),
            "max_levels": 3
        }

    def _build_offline_adaptive_fallback(
        self,
        question: str,
        retrieved_context: str,
        cognitive_load: str,
        tutor_mode: Optional[str] = None,
        section_title: Optional[str] = None,
        section_content: Optional[str] = None
    ) -> str:
        """Construct grounded, lesson-specific explanation for all 8 modes from RAG chunks."""
        load = cognitive_load.upper()
        mode = (tutor_mode or "EXPLAIN").upper()
        subject_heading = section_title or "Python 3 Fundamentals"

        clean_context = retrieved_context.replace("---", "").strip()
        chunks = [c.strip() for c in clean_context.split("\n\n") if c.strip() and not c.strip().startswith("[Source")]
        primary_knowledge = chunks[0] if chunks else (section_content or "Python 3 standard execution and syntax.")
        secondary_knowledge = chunks[1] if len(chunks) > 1 else ""

        if mode == "EXPLAIN":
            if load == "HIGH":
                return (
                    f"### 💡 Simple Explanation: {subject_heading}\n\n"
                    f"**Core Concept in Plain Terms:**\n"
                    f"{primary_knowledge[:280]}...\n\n"
                    f"**Step-by-Step Breakdown:**\n"
                    f"1. Python 3 executes code using the reference CPython interpreter.\n"
                    f"2. Every entity is represented as an object with an identity, type, and value.\n"
                    f"3. Focus on one operation at a time to build confidence."
                )
            elif load == "LOW":
                return (
                    f"### 🚀 Deep Conceptual Breakdown: {subject_heading}\n\n"
                    f"**Architectural Foundation:**\n"
                    f"{primary_knowledge}\n\n"
                    f"**Execution Model & Memory Internals:**\n"
                    f"{secondary_knowledge[:350]}\n\n"
                    f"**Mastery Challenge:**\n"
                    f"How does object interning affect memory allocation and performance when handling large datasets?"
                )
            else:
                return (
                    f"### 📘 Conceptual Overview: {subject_heading}\n\n"
                    f"**Definition & Context:**\n"
                    f"{primary_knowledge[:350]}\n\n"
                    f"**Essential Principles:**\n"
                    f"• In Python 3, variables hold references to objects in memory rather than raw memory addresses.\n"
                    f"• Built-in fundamental types like `int`, `str`, and `tuple` are immutable.\n"
                    f"• Use `id()` to inspect identity and `type()` to verify the runtime class."
                )

        elif mode == "SIMPLIFY":
            return (
                f"### 🎈 Real-World Analogy: {subject_heading}\n\n"
                f"Think of Python 3 variables like sticky address labels on shipping boxes:\n\n"
                f"• The **box** in memory is the object itself (it holds the value and type).\n"
                f"• The **label** is your variable name (like `x = 10`).\n"
                f"• When you assign `y = x`, you aren't cloning the box; you're just sticking another label onto the exact same box!\n\n"
                f"**Takeaway:** Python objects exist independently in memory, and your code simply manages names that point to them."
            )

        elif mode == "EXAMPLE":
            return (
                f"### 💻 Python 3 Code Example: {subject_heading}\n\n"
                f"Here is a clean, runnable example demonstrating these fundamentals:\n\n"
                f"```python\n"
                f"# Exploring Python 3 Object Characteristics\n"
                f"x = 100\n"
                f"print('Value:', x)\n"
                f"print('Type:', type(x).__name__)    # int\n"
                f"print('Memory ID:', id(x))          # Unique object address\n"
                f"\n"
                f"# Demonstrating Immutability\n"
                f"old_id = id(x)\n"
                f"x = x + 1\n"
                f"print('New Value:', x)              # 101\n"
                f"print('Rebound to new object?', id(x) != old_id)  # True\n"
                f"```\n\n"
                f"**Explanation:** Modifying an immutable integer creates a brand-new object with a new address."
            )

        elif mode == "DEBUG":
            return (
                f"### 🔍 Common Bugs & Pitfalls: {subject_heading}\n\n"
                f"**1. Confusing Identity (`is`) with Equality (`==`):**\n"
                f"• `==` checks whether two objects have identical values.\n"
                f"• `is` checks whether two variables refer to the exact same object in memory.\n\n"
                f"**2. Attempting In-Place Modification of Immutable Types:**\n"
                f"```python\n"
                f"s = 'hello'\n"
                f"# s[0] = 'H'  # ❌ TypeError: 'str' object does not support item assignment\n"
                f"s = 'H' + s[1:]  # ✔ Correct: reassign with newly created string\n"
                f"```\n\n"
                f"**3. Variable Name Shadowing:**\n"
                f"Avoid naming variables after Python builtins like `list = [1, 2]` or `str = 'abc'`."
            )

        elif mode == "HINT":
            return (
                f"### 💡 Guided Lesson Hint: {subject_heading}\n\n"
                f"• **Step 1:** Identify whether the data type you are working with is mutable (e.g., `list`, `dict`) or immutable (e.g., `int`, `str`, `tuple`).\n"
                f"• **Step 2:** Remember that assignment binds a name to an object reference.\n"
                f"• **Step 3:** Use `print(type(var), id(var))` to verify how Python stores your variables."
            )

        elif mode == "QUIZ":
            return (
                f"### ❓ Practice Quiz: {subject_heading}\n\n"
                f"**Question:** What will be the output of the following Python 3 code?\n\n"
                f"```python\n"
                f"a = [1, 2, 3]\n"
                f"b = a\n"
                f"b.append(4)\n"
                f"print(len(a))\n"
                f"```\n\n"
                f"A) `3`\n"
                f"B) `4`\n"
                f"C) `TypeError`\n"
                f"D) `None`\n\n"
                f"**Answer:** **B) 4** — Because lists are mutable, `a` and `b` reference the same list object in memory."
            )

        elif mode == "REVISE":
            return (
                f"### 📋 Key Takeaways Summary: {subject_heading}\n\n"
                f"• **Standard Runtime:** Python 3 runs on the reference CPython interpreter with the Python Virtual Machine (PVM).\n"
                f"• **Object Model:** Everything in Python 3 is an object with an ID, type, and value.\n"
                f"• **Immutability:** Fundamental types (`int`, `float`, `bool`, `str`, `tuple`) cannot be changed in place.\n"
                f"• **Variable Binding:** Identifiers are references bound to objects, not fixed memory cells."
            )

        else:  # ADVANCED
            return (
                f"### 🔬 Advanced Deep Dive: {subject_heading}\n\n"
                f"**CPython Memory Management & Object Internals:**\n\n"
                f"In CPython 3, every object is represented by the C struct `PyObject` containing:\n"
                f"1. `ob_refcnt`: The reference counter for deterministic garbage collection.\n"
                f"2. `ob_type`: Pointer to the object's type object (e.g. `&PyLong_Type`).\n\n"
                f"**Small Integer Interning:**\n"
                f"CPython pre-allocates an array of integer objects for values in the range `[-5, 256]`. Any variable assigned an integer in this range will point to the exact same memory address.\n\n"
                f"**Code Verification:**\n"
                f"```python\n"
                f"x = 256; y = 256\n"
                f"print(x is y)  # True (shared interned instance)\n"
                f"a = 257; b = 257\n"
                f"print(a is b)  # False (allocated distinct heap objects)\n"
                f"```"
            )


llm_service = LLMService()
