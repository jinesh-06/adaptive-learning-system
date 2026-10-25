import re
import os
import sys
import logging
from typing import Dict, Any, Optional
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from llm.adaptive_generator import generate_adaptive_explanation, INSUFFICIENT_CONTEXT_MESSAGE
from llm.config import get_model_name
from backend.services.rag_service import rag_service
from rag.src.context_formatter import format_context

logger = logging.getLogger(__name__)


def detect_language(
    course: Optional[str] = None,
    topic: Optional[str] = None,
    topic_id: Optional[str] = None
) -> tuple:
    """Detect programming language and return (lang_code, lang_name) for Python, C, C++, Java."""
    candidates = [str(x).strip().lower() for x in (course, topic, topic_id) if x]
    combined = " ".join(candidates)

    if any(k in combined for k in ("cpp", "c++", "cplusplus", "top-cpp")):
        return ("cpp", "C++")
    if "java" in combined and "javascript" not in combined:
        return ("java", "Java")
    if (
        "top-c-" in combined
        or "c-beg" in combined
        or "c-int" in combined
        or "c-advanced" in combined
        or any(re.search(r'\bc\b', c) for c in candidates)
        or any(c.startswith("c-") or c.startswith("c_") or c.startswith("c ") for c in candidates)
        or " c " in f" {combined} "
    ):
        return ("c", "C")
    return ("python", "Python 3")


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
        history: Optional[list] = None,
    ) -> Dict[str, Any]:
        """
        Generate cognitive-load-adapted explanation grounded in verified RAG knowledge.
        """
        lang_code, lang_name = detect_language(course=course, topic=topic, topic_id=topic_id)

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

        # 2. Retrieve verified educational context via RAG (single call to avoid duplicate retrieval)
        resolved_topic = topic_id or topic
        retrieved_chunks = rag_service.retrieve(
            query=rag_query,
            course=lang_code,
            topic=resolved_topic,
            level=level,
            top_k=5,
            learner_level=level or "intermediate"
        )
        retrieved_context = format_context(retrieved_chunks)

        # 2b. Extract genuine document sources strictly from retrieved document metadata
        sources: list = []
        if retrieved_chunks:
            seen_sources = set()
            for chunk in retrieved_chunks:
                citation = chunk.get("section") or chunk.get("topic") or chunk.get("source")
                if citation:
                    citation_str = str(citation).strip()
                    if (
                        citation_str
                        and citation_str.lower() != "general content"
                        and citation_str not in seen_sources
                    ):
                        seen_sources.add(citation_str)
                        sources.append(citation_str)

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
            lesson_context=lesson_context_str,
            conversation_history=history,
            language=lang_code,
            allow_general_knowledge=True
        )

        # 5. If Gemini succeeds and returned substantive explanation, return standard response
        if res.get("success") and res.get("explanation") and res.get("explanation") != INSUFFICIENT_CONTEXT_MESSAGE:
            return {
                "success": True,
                "answer": res.get("explanation"),
                "cognitive_load": res.get("cognitive_load", cognitive_load),
                "adaptation": res.get("adaptation"),
                "retrieved_context": retrieved_context,
                "sources": sources,
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
            section_content=section_content,
            course=lang_code
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
            "sources": sources,
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
        language: Optional[str] = "python",
        topic_id: Optional[str] = None,
        course: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate progressive, multi-tier hint conditioned on cognitive load.
        Tier 1: Conceptual clue / underlying principle
        Tier 2: Algorithmic strategy / step-by-step logical approach
        Tier 3: Pseudocode blueprint / structural outline
        Tier 4: Partial code skeleton with comments
        """
        stage_names = [
            "Conceptual Clue",
            "Algorithmic Strategy",
            "Pseudocode Blueprint",
            "Code Skeleton"
        ]
        stage_idx = max(0, min(hint_level - 1, len(stage_names) - 1))
        stage_title = stage_names[stage_idx]

        # Precedence rule: explicit course takes precedence over language
        target_course = (course.strip() if course and course.strip() else None) or language
        lang_code, lang_name = detect_language(course=target_course, topic=topic, topic_id=topic_id)
        resolved_topic = topic_id or topic

        retrieved_context = rag_service.get_formatted_context(
            query=f"{resolved_topic or ''} {question}".strip(),
            course=lang_code,
            topic=resolved_topic,
            top_k=2
        )

        hint_prompt = (
            f"Provide a Tier {hint_level} pedagogical hint ({stage_title}) for the following coding challenge:\n"
            f"Problem: {question}\n"
            f"Current Code: {code_snippet or 'None'}\n"
            f"Tier 1: Conceptual clue & intuition only, zero code/syntax.\n"
            f"Tier 2: Algorithmic strategy & high-level logical approach.\n"
            f"Tier 3: Pseudocode blueprint showing logic structure.\n"
            f"Tier 4: Partial code skeleton with fill-in-the-blank comments.\n"
            f"Active Tier to provide: Tier {hint_level} ({stage_title}).\n"
            f"Cognitive Load: {cognitive_load.upper()}.\n"
            f"Format clearly in concise markdown."
        )

        res = generate_adaptive_explanation(
            question=hint_prompt,
            retrieved_context=retrieved_context,
            cognitive_load=cognitive_load,
            topic=resolved_topic or lang_code,
            language=lang_code,
            allow_general_knowledge=True
        )

        if res.get("success") and res.get("explanation") and res.get("explanation") != INSUFFICIENT_CONTEXT_MESSAGE:
            hint_text = res.get("explanation", "")
        else:
            if hint_level == 1:
                hint_text = f"💡 **Tier 1 — Conceptual Clue**: Focus on the core objective in {topic or 'the task'}. Clarify what data structure or condition controls termination."
            elif hint_level == 2:
                hint_text = f"🧭 **Tier 2 — Algorithmic Strategy**: 1. Initialize required accumulators or tracking pointers. 2. Iterate methodically over items. 3. Return or yield final evaluated result."
            elif hint_level == 3:
                hint_text = f"📝 **Tier 3 — Pseudocode Blueprint**:\n```text\nFUNCTION solve(data):\n    INITIALIZE result\n    FOR each element IN data:\n        IF condition(element) THEN\n            UPDATE result\n    RETURN result\n```"
            else:
                if lang_code == "cpp":
                    hint_text = (
                        "🧩 **Tier 4 — Code Skeleton**:\n```cpp\n"
                        "#include <vector>\n\n"
                        "int solution(const std::vector<int>& items) {\n"
                        "    // 1. Base initialization\n"
                        "    int result = 0;\n"
                        "    for (const auto& x : items) {\n"
                        "        // 2. Apply logic here\n"
                        "    }\n"
                        "    return result;\n"
                        "}\n```"
                    )
                elif lang_code == "c":
                    hint_text = (
                        "🧩 **Tier 4 — Code Skeleton**:\n```c\n"
                        "#include <stdio.h>\n\n"
                        "int solution(const int* items, int size) {\n"
                        "    // 1. Base initialization\n"
                        "    int result = 0;\n"
                        "    for (int i = 0; i < size; i++) {\n"
                        "        // 2. Apply logic here\n"
                        "    }\n"
                        "    return result;\n"
                        "}\n```"
                    )
                elif lang_code == "java":
                    hint_text = (
                        "🧩 **Tier 4 — Code Skeleton**:\n```java\n"
                        "public class Solution {\n"
                        "    public static int solution(int[] items) {\n"
                        "        // 1. Base initialization\n"
                        "        int result = 0;\n"
                        "        for (int x : items) {\n"
                        "            // 2. Apply logic here\n"
                        "        }\n"
                        "        return result;\n"
                        "    }\n"
                        "}\n```"
                    )
                else:
                    hint_text = (
                        "🧩 **Tier 4 — Code Skeleton**:\n```python\n"
                        "def solution(items):\n"
                        "    # 1. Base initialization\n"
                        "    res = []\n"
                        "    for x in items:\n"
                        "        # 2. Apply logic here\n"
                        "        pass\n"
                        "    return res\n```"
                    )

        return {
            "success": True,
            "hint_level": hint_level,
            "hint": hint_text,
            "hint_text": hint_text,
            "stage": stage_title,
            "next_hint_available": hint_level < 4,
            "cognitive_load": cognitive_load.upper(),
            "max_levels": 4
        }

    def _build_offline_adaptive_fallback(
        self,
        question: str,
        retrieved_context: str,
        cognitive_load: str,
        tutor_mode: Optional[str] = None,
        section_title: Optional[str] = None,
        section_content: Optional[str] = None,
        course: Optional[str] = None
    ) -> str:
        """Construct grounded, cognitive-load-adapted explanation for all 8 modes from RAG chunks."""
        load = cognitive_load.upper().strip()
        mode = (tutor_mode or "EXPLAIN").upper().strip()
        lang_code, lang_name = detect_language(course=course, topic=section_title)

        subject_heading = section_title or f"{lang_name} Fundamentals"

        clean_context = retrieved_context.replace("---", "").strip()
        raw_chunks = [c.strip() for c in clean_context.split("\n\n") if c.strip() and not c.strip().startswith("[Source")]
        valid_chunks = [
            c for c in raw_chunks
            if "no relevant context found" not in c.lower() and not c.startswith("COURSE:")
        ]
        primary_knowledge = valid_chunks[0] if valid_chunks else (section_content or f"{lang_name} standard execution and syntax.")
        secondary_knowledge = valid_chunks[1] if len(valid_chunks) > 1 else ""

        # Extract complete factual sentences from verified chunks or section content
        context_corpus = ""
        if valid_chunks:
            clean_chunk_texts = []
            for c in valid_chunks:
                lines = [
                    l for l in c.splitlines()
                    if not any(l.strip().startswith(h) for h in ("COURSE:", "TOPIC:", "LEVEL:", "SOURCE:", "SECTION:"))
                ]
                clean_chunk_texts.append(" ".join(lines))
            context_corpus = " ".join(clean_chunk_texts).strip()
        elif section_content and section_content.strip():
            context_corpus = section_content.strip()

        factual_sentences = []
        if context_corpus:
            raw_sentences = re.split(r'(?<=[.!?])\s+', context_corpus)
            for s in raw_sentences:
                cleaned_s = re.sub(r'^[#*•\-\d.\s]+', '', s).strip()
                if (
                    len(cleaned_s) >= 25
                    and not any(cleaned_s.startswith(p) for p in ("COURSE:", "TOPIC:", "SECTION:", "LEVEL:", "SOURCE:"))
                ):
                    if cleaned_s not in factual_sentences:
                        factual_sentences.append(cleaned_s)

        # ---------------------------------------------------------
        # 1. EXPLAIN MODE
        # ---------------------------------------------------------
        if mode == "EXPLAIN":
            if load == "HIGH":
                return (
                    f"### 💡 Simple Explanation: {subject_heading}\n\n"
                    f"**Core Concept in Plain Terms:**\n"
                    f"{primary_knowledge[:280]}...\n\n"
                    f"**Step-by-Step Breakdown:**\n"
                    f"1. {lang_name} executes code using its standard runtime and type system.\n"
                    f"2. Focus on core memory concepts and syntax patterns for {lang_name}.\n"
                    f"3. Focus on one operation at a time to build confidence."
                )
            elif load == "LOW":
                if lang_code == "c":
                    challenge = "How does memory alignment and structure padding impact cache locality and spatial memory efficiency?"
                elif lang_code == "cpp":
                    challenge = "How do move semantics (std::move) and RVO prevent redundant object copies in high-throughput pipelines?"
                elif lang_code == "java":
                    challenge = "How does JVM generational garbage collection optimize memory reclamation for short-lived vs long-lived objects?"
                else:
                    challenge = "How does object interning affect memory allocation and performance when handling large datasets?"

                return (
                    f"### 🚀 Deep Conceptual Breakdown: {subject_heading}\n\n"
                    f"**Architectural Foundation:**\n"
                    f"{primary_knowledge}\n\n"
                    f"**Execution Model & Memory Internals:**\n"
                    f"{secondary_knowledge[:350] if secondary_knowledge else primary_knowledge[:350]}\n\n"
                    f"**Mastery Challenge:**\n"
                    f"{challenge}"
                )
            else:  # MEDIUM
                return (
                    f"### 📘 Conceptual Overview: {subject_heading}\n\n"
                    f"**Definition & Context:**\n"
                    f"{primary_knowledge[:350]}\n\n"
                    f"**Essential Principles:**\n"
                    f"• In {lang_name}, variables hold values and references.\n"
                    f"• Understand fundamental types and memory management.\n"
                    f"• Best practices are required for optimal efficiency."
                )

        # ---------------------------------------------------------
        # 2. SIMPLIFY MODE
        # ---------------------------------------------------------
        elif mode == "SIMPLIFY":
            if load == "HIGH":
                if lang_code == "c":
                    analogy = (
                        "Think of memory like numbered mailboxes along a single street. Each variable is one mailbox with a specific number (its address). Writing to it replaces the paper inside.\n\n"
                        "**Key Takeaway:** In C, every variable lives in a concrete, numbered memory box."
                    )
                elif lang_code == "cpp":
                    analogy = (
                        "Think of variables like storage containers in a warehouse. You own the container directly, and putting something new inside completely replaces what was there.\n\n"
                        "**Key Takeaway:** In C++, objects have clear ownership and predictable lifecycles."
                    )
                elif lang_code == "java":
                    analogy = (
                        "Think of variables like TV sets and handheld remotes. Basic numbers live in your hand, while big objects sit in the room and your remote points to them.\n\n"
                        "**Key Takeaway:** Primitives store data directly; object variables hold remote controls."
                    )
                else:
                    analogy = (
                        "Think of variables like sticky name tags on gift boxes. Writing `x = 10` simply attaches the name tag 'x' to the number 10 in memory.\n\n"
                        "**Key Takeaway:** Variable names are just sticky tags pointing to objects in memory."
                    )
                return f"### 🎈 Everyday Analogy: {subject_heading}\n\n{analogy}"

            elif load == "LOW":
                if lang_code == "c":
                    analogy = (
                        "At the hardware architecture boundary, C abstractions map 1:1 to CPU register allocations and flat virtual address spaces:\n\n"
                        "• **Register Allocation:** Compilers map hot variables directly to machine registers (`%eax`, `%rsi`).\n"
                        "• **Memory Bus:** Pointers represent 64-bit virtual addresses dereferenced in single CPU clock cycles.\n"
                        "• **Cache Hierarchy:** Contiguous memory buffers maximize spatial cache locality across L1/L2/L3 caches.\n\n"
                        "**Architectural Takeaway:** C provides direct, deterministic control over the underlying memory subsystem with zero runtime overhead."
                    )
                elif lang_code == "cpp":
                    analogy = (
                        "Under the C++ zero-overhead principle, abstractions do not incur hidden runtime penalties compared to hand-written assembly:\n\n"
                        "• **Deterministic Lifecycles:** Stack frames guarantee deterministic destruction (RAII) at scope exit without garbage collection pauses.\n"
                        "• **Value Semantics:** Contiguous storage in `std::vector` preserves cache locality, outperforming pointer-chasing node graphs.\n"
                        "• **Move Semantics:** Rvalue transfers steal internal heap pointers in O(1) time without buffer copies.\n\n"
                        "**Architectural Takeaway:** Modern C++ marries expressive high-level abstractions with raw bare-metal hardware efficiency."
                    )
                elif lang_code == "java":
                    analogy = (
                        "Inside the JVM HotSpot runtime, abstractions navigate a tiered execution engine:\n\n"
                        "• **Tiered Compilation:** Bytecode executes via the interpreter, then compiles to native machine instructions via C1 and C2 JIT compilers.\n"
                        "• **Memory Partitions:** The heap divides into Young Generation (Eden, Survivor) and Tenured Space to optimize garbage collector throughput.\n"
                        "• **Escape Analysis:** If an object does not escape a method, HotSpot eliminates heap allocation via scalar replacement.\n\n"
                        "**Architectural Takeaway:** The JVM continuously profiles code to optimize memory layout and runtime execution dynamically."
                    )
                else:
                    analogy = (
                        "Under the CPython runtime, variables operate within dynamic PyObject pointer routing:\n\n"
                        "• **PyObject Architecture:** Every integer, string, and list is a heap-allocated C struct with reference count (`ob_refcnt`) and type pointer (`ob_type`).\n"
                        "• **Small Object Allocator (PyMalloc):** 256KB Arenas divided into 4KB Pools manage objects under 512 bytes to eliminate OS system call overhead.\n"
                        "• **Global Interpreter Lock (GIL):** Mutex serialization protects reference counting integrity across bytecode evaluation loops.\n\n"
                        "**Architectural Takeaway:** Python trades raw single-thread CPU cycles for flexible dynamic dispatch and developer velocity."
                    )
                return f"### 🎈 System-Level Mental Model: {subject_heading}\n\n{analogy}"

            else:  # MEDIUM
                if lang_code == "c":
                    analogy = (
                        f"Think of {lang_name} memory like a row of numbered mailboxes along a street:\n\n"
                        f"• Each mailbox has an **address** (like `&x` in memory).\n"
                        f"• Inside each mailbox is the **contents/value** (like `int x = 10`).\n"
                        f"• When you assign `int y = x;`, you make a physical photocopy of the letter and put it in a separate mailbox!\n"
                        f"• A **pointer** is simply a slip of paper containing the mailbox address of another box.\n\n"
                        f"**Takeaway:** In {lang_name}, values reside in concrete memory cells, and pointers allow direct access to those locations."
                    )
                elif lang_code == "cpp":
                    analogy = (
                        f"Think of {lang_name} variables like dedicated physical storage containers:\n\n"
                        f"• A standard variable (`int x = 10`) owns its storage container directly.\n"
                        f"• When you assign `int y = x;`, an independent duplicate container is created.\n"
                        f"• A **reference** (`int &ref = x;`) is a permanent nickname or secondary handle for that exact same container!\n\n"
                        f"**Takeaway:** In {lang_name}, objects have definite lifetimes and direct ownership, preventing surprise side-effects."
                    )
                elif lang_code == "java":
                    analogy = (
                        f"Think of {lang_name} variables like television sets and remote controls:\n\n"
                        f"• Primitive types (`int x = 10`) hold their values directly inside the variable.\n"
                        f"• Objects (`String`, `List`) are TV sets situated on the memory heap.\n"
                        f"• The variable is just a **remote control** holding a beam to that TV set.\n"
                        f"• When you assign `b = a`, you get a second remote control pointed at the exact same TV!\n\n"
                        f"**Takeaway:** In {lang_name}, primitives pass values directly, while objects are referenced via handles."
                    )
                else:
                    analogy = (
                        f"Think of {lang_name} variables like sticky address labels on shipping boxes:\n\n"
                        f"• The **box** in memory is the object itself (it holds the value and type).\n"
                        f"• The **label** is your variable name (like `x = 10`).\n"
                        f"• When you assign `y = x`, you aren't cloning the box; you're just sticking another label onto the exact same box!\n\n"
                        f"**Takeaway:** {lang_name} objects exist independently in memory, and your code simply manages names that point to them."
                    )
                return f"### 🎈 Real-World Analogy: {subject_heading}\n\n{analogy}"

        # ---------------------------------------------------------
        # 3. EXAMPLE MODE
        # ---------------------------------------------------------
        elif mode == "EXAMPLE":
            if load == "HIGH":
                if lang_code == "c":
                    code_snippet = (
                        "// Step-by-step simple example\n"
                        "#include <stdio.h>\n\n"
                        "int main(void) {\n"
                        "    int score = 100;\n"
                        "    printf(\"Score: %d\\n\", score);\n"
                        "    return 0;\n"
                        "}"
                    )
                elif lang_code == "cpp":
                    code_snippet = (
                        "// Step-by-step simple example\n"
                        "#include <iostream>\n\n"
                        "int main() {\n"
                        "    int score = 100;\n"
                        "    std::cout << \"Score: \" << score << std::endl;\n"
                        "    return 0;\n"
                        "}"
                    )
                elif lang_code == "java":
                    code_snippet = (
                        "// Step-by-step simple example\n"
                        "public class SimpleExample {\n"
                        "    public static void main(String[] args) {\n"
                        "        int score = 100;\n"
                        "        System.out.println(\"Score: \" + score);\n"
                        "    }\n"
                        "}"
                    )
                else:
                    code_snippet = (
                        "# Step-by-step simple example\n"
                        "score = 100\n"
                        "print(f\"Score: {score}\")"
                    )
                return (
                    f"### 💻 Minimal Code Example: {subject_heading}\n\n"
                    f"Here is a simple, scaffolded example:\n\n"
                    f"```{lang_code}\n"
                    f"{code_snippet}\n"
                    f"```\n\n"
                    f"**Expected Output:** `Score: 100`"
                )

            elif load == "LOW":
                if lang_code == "c":
                    code_snippet = (
                        "// Production-grade C pattern with const correctness & bounds safety\n"
                        "#include <stdio.h>\n"
                        "#include <stddef.h>\n\n"
                        "int compute_total(const int *data, size_t count) {\n"
                        "    if (!data || count == 0) return 0;\n"
                        "    int sum = 0;\n"
                        "    for (size_t i = 0; i < count; ++i) {\n"
                        "        sum += data[i];\n"
                        "    }\n"
                        "    return sum;\n"
                        "}"
                    )
                elif lang_code == "cpp":
                    code_snippet = (
                        "// Production-grade C++ pattern using RAII, const auto&, and std::accumulate\n"
                        "#include <iostream>\n"
                        "#include <vector>\n"
                        "#include <numeric>\n\n"
                        "template <typename T>\n"
                        "auto calculate_sum(const std::vector<T>& values) noexcept {\n"
                        "    return std::accumulate(values.begin(), values.end(), T{});\n"
                        "}"
                    )
                elif lang_code == "java":
                    code_snippet = (
                        "// Production-grade Java pattern using try-with-resources and streams\n"
                        "import java.util.List;\n"
                        "import java.util.Objects;\n\n"
                        "public class RobustService {\n"
                        "    public static int calculateSum(List<Integer> values) {\n"
                        "        Objects.requireNonNull(values, \"Input values cannot be null\");\n"
                        "        return values.stream().filter(Objects::nonNull).mapToInt(Integer::intValue).sum();\n"
                        "    }\n"
                        "}"
                    )
                else:
                    code_snippet = (
                        "# Production-grade Python pattern with type hints and defensive guard\n"
                        "from typing import Sequence\n\n"
                        "def calculate_sum(values: Sequence[int]) -> int:\n"
                        "    if not values:\n"
                        "        return 0\n"
                        "    return sum(x for x in values if isinstance(x, int))"
                    )
                return (
                    f"### 💻 Production-Grade Pattern: {subject_heading}\n\n"
                    f"Below is an optimized, defensive implementation:\n\n"
                    f"```{lang_code}\n"
                    f"{code_snippet}\n"
                    f"```\n\n"
                    f"**Architectural Analysis:** Prioritizes type safety, memory locality, and zero-cost error handling."
                )

            else:  # MEDIUM
                if lang_code == "c":
                    code_snippet = (
                        f"// Exploring {lang_name} fundamentals: {subject_heading}\n"
                        f"#include <stdio.h>\n\n"
                        f"int main(void) {{\n"
                        f"    int items[] = {{10, 20, 30}};\n"
                        f"    int total = 0;\n"
                        f"    for (int i = 0; i < 3; i++) {{\n"
                        f"        total += items[i];\n"
                        f"    }}\n"
                        f"    printf(\"Total: %d\\n\", total);\n"
                        f"    return 0;\n"
                        f"}}"
                    )
                elif lang_code == "cpp":
                    code_snippet = (
                        f"// Exploring {lang_name} fundamentals: {subject_heading}\n"
                        f"#include <iostream>\n"
                        f"#include <vector>\n"
                        f"#include <numeric>\n\n"
                        f"int main() {{\n"
                        f"    std::vector<int> items = {{10, 20, 30}};\n"
                        f"    int total = std::accumulate(items.begin(), items.end(), 0);\n"
                        f"    std::cout << \"Total: \" << total << std::endl;\n"
                        f"    return 0;\n"
                        f"}}"
                    )
                elif lang_code == "java":
                    code_snippet = (
                        f"// Exploring {lang_name} fundamentals: {subject_heading}\n"
                        f"public class Example {{\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        int[] items = {{10, 20, 30}};\n"
                        f"        int total = 0;\n"
                        f"        for (int val : items) {{\n"
                        f"            total += val;\n"
                        f"        }}\n"
                        f"        System.out.println(\"Total: \" + total);\n"
                        f"    }}\n"
                        f"}}"
                    )
                else:
                    code_snippet = (
                        f"# Exploring {lang_name} fundamentals: {subject_heading}\n"
                        f"items = [10, 20, 30]\n"
                        f"total = sum(items)\n"
                        f"print(f\"Total: {{total}}\")"
                    )
                return (
                    f"### 💻 {lang_name} Code Example: {subject_heading}\n\n"
                    f"Here is a clean, runnable example demonstrating these fundamentals:\n\n"
                    f"```{lang_code}\n"
                    f"{code_snippet}\n"
                    f"```\n\n"
                    f"**Explanation:** Modifying variables updates values according to {lang_name} paradigms."
                )

        # ---------------------------------------------------------
        # 4. DEBUG MODE
        # ---------------------------------------------------------
        elif mode == "DEBUG":
            if load == "HIGH":
                if lang_code == "c":
                    trap = (
                        "**❌ Common Beginner Mistake: Using Uninitialized Pointer**\n"
                        "```c\n"
                        "int *p;\n"
                        "*p = 10; // ❌ CRASH: Undefined behavior / segmentation fault!\n"
                        "```\n\n"
                        "**✔ Correct Way:**\n"
                        "```c\n"
                        "int x = 10;\n"
                        "int *p = &x; // ✔ Point to valid memory address first\n"
                        "*p = 20;\n"
                        "```"
                    )
                elif lang_code == "cpp":
                    trap = (
                        "**❌ Common Beginner Mistake: Returning Reference to Local Variable**\n"
                        "```cpp\n"
                        "int& get_value() {\n"
                        "    int local = 42;\n"
                        "    return local; // ❌ CRASH: Local stack memory is freed at return!\n"
                        "}\n"
                        "```\n\n"
                        "**✔ Correct Way:**\n"
                        "```cpp\n"
                        "int get_value() {\n"
                        "    int local = 42;\n"
                        "    return local; // ✔ Return by value\n"
                        "}\n"
                        "```"
                    )
                elif lang_code == "java":
                    trap = (
                        "**❌ Common Beginner Mistake: Comparing Strings with '=='**\n"
                        "```java\n"
                        "String a = new String(\"hello\");\n"
                        "String b = new String(\"hello\");\n"
                        "if (a == b) { ... } // ❌ False: Compares object memory addresses!\n"
                        "```\n\n"
                        "**✔ Correct Way:**\n"
                        "```java\n"
                        "if (a.equals(b)) { ... } // ✔ True: Compares character contents\n"
                        "```"
                    )
                else:
                    trap = (
                        "**❌ Common Beginner Mistake: Attempting to Modify Strings In-Place**\n"
                        "```python\n"
                        "name = 'antigravity'\n"
                        "# name[0] = 'A'  # ❌ TypeError: 'str' object does not support item assignment\n"
                        "```\n\n"
                        "**✔ Correct Way:**\n"
                        "```python\n"
                        "name = 'A' + name[1:]  # ✔ Strings are immutable; reassign with a new string\n"
                        "```"
                    )
                return f"### 🔍 Common Beginner Trap: {subject_heading}\n\n{trap}"

            elif load == "LOW":
                if lang_code == "c":
                    advanced_bugs = (
                        "**1. Structure Alignment & Padding Hazards:**\n"
                        "• Compilers insert hidden padding bytes into structs to satisfy CPU alignment restrictions.\n"
                        "• Never rely on `sizeof(struct)` being the raw sum of member sizes when writing to network sockets or binary files.\n\n"
                        "**2. Unchecked Buffer Boundaries & Pointer Overflow:**\n"
                        "• Writing past allocated boundaries overwrites stack canaries or heap headers.\n"
                        "• **Diagnostic Tooling:** Compile with `-fsanitize=address,undefined -g` to detect heap/stack overflows immediately."
                    )
                elif lang_code == "cpp":
                    advanced_bugs = (
                        "**1. Iterator Invalidation in Dynamic Containers:**\n"
                        "• Mutating `std::vector` capacity during iteration invalidates all existing pointers, references, and iterators.\n\n"
                        "**2. Slicing in Polymorphic Value Assignments:**\n"
                        "• Passing derived objects by value to a base-class parameter slices away derived members and virtual table bindings.\n"
                        "• **Diagnostic Tooling:** Use `valgrind --leak-check=full` and compile with `-Wall -Wextra -Wpedantic`."
                    )
                elif lang_code == "java":
                    advanced_bugs = (
                        "**1. ConcurrentModificationException in Iterator Pipelines:**\n"
                        "• Modifying a collection structurally outside of `Iterator.remove()` while iterating triggers immediate fail-fast exceptions.\n\n"
                        "**2. Static Reference Memory Leaks:**\n"
                        "• Holding references in `static` collections or ThreadLocal variables prevents garbage collection reclamation indefinitely.\n"
                        "• **Diagnostic Tooling:** Inspect heap dumps with Eclipse MAT or VisualVM using `-XX:+HeapDumpOnOutOfMemoryError`."
                    )
                else:
                    advanced_bugs = (
                        "**1. Late Binding Closures in Iteration Loops:**\n"
                        "• Lambdas created inside loops bind to the variable name, not the value at creation time (`[lambda: i for i in range(5)]`).\n"
                        "• Fix using default arguments: `lambda i=i: i`.\n\n"
                        "**2. Reference Cycles Defeating Immediate ARC:**\n"
                        "• Objects referencing each other bypass immediate deallocation upon `del`, relying instead on the cyclic generational GC.\n"
                        "• **Diagnostic Tooling:** Profile memory allocations with Python's built-in `tracemalloc` module."
                    )
                return f"### 🔍 Advanced Edge Cases & Defect Prevention: {subject_heading}\n\n{advanced_bugs}"

            else:  # MEDIUM
                if lang_code == "c":
                    pitfalls = (
                        "**1. Uninitialized Pointers & NULL Dereference:**\n"
                        "• Dereferencing uninitialized pointers produces undefined behavior or segmentation faults.\n"
                        "• Always initialize pointers (`int *p = NULL;`) and check `if (p != NULL)` before dereference.\n\n"
                        "**2. Array Index Out-of-Bounds:**\n"
                        "```c\n"
                        "int arr[5];\n"
                        "arr[5] = 100; // ❌ Invalid: valid indices are 0 to 4\n"
                        "```\n\n"
                        "**3. Dynamic Memory Leaks:**\n"
                        "Pair every `malloc()` or `calloc()` with a corresponding `free()`."
                    )
                elif lang_code == "cpp":
                    pitfalls = (
                        "**1. Dangling References to Stack Memory:**\n"
                        "• Returning a reference to a local variable causes undefined behavior once the stack frame unwinds.\n\n"
                        "**2. Iterator Invalidation:**\n"
                        "```cpp\n"
                        "std::vector<int> v = {1, 2, 3};\n"
                        "for (auto it = v.begin(); it != v.end(); ++it) {\n"
                        "    if (*it == 2) v.push_back(4); // ❌ Invalidates iterator!\n"
                        "}\n"
                        "```\n\n"
                        "**3. Object Slicing:**\n"
                        "Passing derived class instances by value to a base class parameter slices off derived members."
                    )
                elif lang_code == "java":
                    pitfalls = (
                        "**1. NullPointerException (NPE):**\n"
                        "• Calling methods on an uninitialized object reference.\n"
                        "• Always guard with null checks or use `java.util.Optional`.\n\n"
                        "**2. Using `==` Instead of `.equals()` for String Comparison:**\n"
                        "```java\n"
                        "String a = new String(\"test\");\n"
                        "String b = new String(\"test\");\n"
                        "System.out.println(a == b);      // ❌ false (reference comparison)\n"
                        "System.out.println(a.equals(b));  // ✔ true (content comparison)\n"
                        "```\n\n"
                        "**3. ConcurrentModificationException:**\n"
                        "Modifying collections directly while iterating over them without an explicit `Iterator.remove()`."
                    )
                else:
                    pitfalls = (
                        "**1. Confusing Identity (`is`) with Equality (`==`):**\n"
                        "• `==` checks whether two objects have identical values.\n"
                        "• `is` checks whether two variables refer to the exact same object in memory.\n\n"
                        "**2. Attempting In-Place Modification of Immutable Types:**\n"
                        "```python\n"
                        "s = 'hello'\n"
                        "# s[0] = 'H'  # ❌ TypeError: 'str' object does not support item assignment\n"
                        "s = 'H' + s[1:]  # ✔ Correct: reassign with newly created string\n"
                        "```\n\n"
                        "**3. Mutable Default Arguments in Functions:**\n"
                        "Avoid `def append_to(val, lst=[])`. Instead use `lst=None` and initialize inside the function."
                    )
                return f"### 🔍 Common Bugs & Pitfalls: {subject_heading}\n\n{pitfalls}"

        # ---------------------------------------------------------
        # 5. HINT MODE
        # ---------------------------------------------------------
        elif mode == "HINT":
            if load == "HIGH":
                if lang_code == "c":
                    hint = "• **Immediate Next Step:** Ensure every pointer variable points to an active memory address (`&variable`) before using the `*` operator."
                elif lang_code == "cpp":
                    hint = "• **Immediate Next Step:** Check whether you should pass by reference (`const &`) to avoid copying or by value."
                elif lang_code == "java":
                    hint = "• **Immediate Next Step:** Check if your reference variable might be `null` before invoking methods on it."
                else:
                    hint = "• **Immediate Next Step:** Remember that numbers, strings, and tuples cannot be altered in-place; reassign them to save changes."
                return f"### 💡 Quick Step-by-Step Hint: {subject_heading}\n\n{hint}"

            elif load == "LOW":
                if lang_code == "c":
                    clue = (
                        "• **Architectural Reasoning:** Consider whether memory alignment allows SIMD vectorization. "
                        "Can this operation avoid cache misses by streaming linearly through memory rather than following node pointers?"
                    )
                elif lang_code == "cpp":
                    clue = (
                        "• **Architectural Reasoning:** Verify whether your function signature satisfies the strong exception guarantee. "
                        "Can move semantics eliminate heap reallocations when growing internal buffers?"
                    )
                elif lang_code == "java":
                    clue = (
                        "• **Architectural Reasoning:** Evaluate how HotSpot escape analysis treats this temporary object. "
                        "Can you eliminate boxing overhead by using primitive streams (`IntStream`) instead of wrapper types?"
                    )
                else:
                    clue = (
                        "• **Architectural Reasoning:** Analyze the time complexity of your lookup operations. "
                        "Can you convert an O(n) list scan into an O(1) hash set membership test?"
                    )
                return f"### 💡 Architectural Reasoning Clue: {subject_heading}\n\n{clue}"

            else:  # MEDIUM
                if lang_code == "c":
                    hints = (
                        "• **Step 1:** Identify variable storage class (stack allocated vs heap allocated).\n"
                        "• **Step 2:** Ensure pointer operations verify `ptr != NULL` before dereferencing.\n"
                        "• **Step 3:** Inspect memory addresses with `printf(\"%p\", (void*)ptr)` to trace pointers."
                    )
                elif lang_code == "cpp":
                    hints = (
                        "• **Step 1:** Prefer RAII containers (`std::vector`, `std::unique_ptr`) over manual pointer management.\n"
                        "• **Step 2:** Use `const auto&` for read-only iterations to avoid accidental object copies.\n"
                        "• **Step 3:** Check container bounds with `.size()` and boundary conditions before indexing."
                    )
                elif lang_code == "java":
                    hints = (
                        "• **Step 1:** Distinguish between primitive types (`int`, `double`) and object references (`String`, `List`).\n"
                        "• **Step 2:** Always invoke `.equals()` when comparing values of reference types.\n"
                        "• **Step 3:** Verify array bounds against `.length` or Collection size with `.size()`."
                    )
                else:
                    hints = (
                        "• **Step 1:** Identify whether the data type you are working with is mutable (e.g., `list`, `dict`) or immutable (e.g., `int`, `str`, `tuple`).\n"
                        "• **Step 2:** Remember that assignment binds a name to an object reference.\n"
                        "• **Step 3:** Use `print(type(var), id(var))` to verify how Python stores your variables."
                    )
                return f"### 💡 Guided Lesson Hint: {subject_heading}\n\n{hints}"

        # ---------------------------------------------------------
        # 6. QUIZ MODE
        # ---------------------------------------------------------
        elif mode == "QUIZ":
            if load == "HIGH":
                if lang_code == "c":
                    q_text = "In C, what operator is used to retrieve the memory address of variable `x`?"
                    q_opts = "A) `*x`\nB) `&x`\nC) `%x`"
                    q_ans = "**B) &x** — The address-of operator `&` produces the memory location of `x`."
                elif lang_code == "cpp":
                    q_text = "In C++, which keyword creates an alias/reference to an existing variable `int a`?"
                    q_opts = "A) `int *ref = a;`\nB) `int &ref = a;`\nC) `ref int = a;`"
                    q_ans = "**B) int &ref = a;** — The ampersand `&` declares a reference alias."
                elif lang_code == "java":
                    q_text = "In Java, what method correctly compares the character contents of two String objects?"
                    q_opts = "A) `s1 == s2`\nB) `s1.equals(s2)`\nC) `s1.sameAs(s2)`"
                    q_ans = "**B) s1.equals(s2)** — `.equals()` compares text values rather than heap references."
                else:
                    q_text = "In Python, which of the following data structures is immutable?"
                    q_opts = "A) `list`\nB) `dict`\nC) `tuple`"
                    q_ans = "**C) tuple** — Tuples cannot be modified after creation."
                return (
                    f"### ❓ Rapid Concept Check: {subject_heading}\n\n"
                    f"**Question:** {q_text}\n\n"
                    f"{q_opts}\n\n"
                    f"**Answer:** {q_ans}"
                )

            elif load == "LOW":
                if lang_code == "c":
                    quiz_code = "int arr[] = {10, 20, 30};\nint *p = arr;\nprintf(\"%d \", *(p + 1));\nprintf(\"%d\", *p + 1);"
                    q_opts = "A) `20 11`\nB) `20 20`\nC) `11 11`\nD) `10 20`"
                    q_ans = "**A) 20 11** — `*(p + 1)` scales pointer offset by `sizeof(int)` to read `arr[1]` (20). `*p + 1` dereferences `arr[0]` (10) and adds 1 (11)."
                elif lang_code == "cpp":
                    quiz_code = "int x = 10;\nauto f = [&x]() { x += 5; };\nf();\nstd::cout << x;"
                    q_opts = "A) `10`\nB) `15`\nC) `5`\nD) `Compilation Error`"
                    q_ans = "**B) 15** — The lambda captures `x` by reference (`[&x]`), mutating the original variable."
                elif lang_code == "java":
                    quiz_code = "String s1 = \"hello\";\nString s2 = \"hello\";\nString s3 = new String(\"hello\");\nSystem.out.print((s1 == s2) + \" \" + (s1 == s3));"
                    q_opts = "A) `true true`\nB) `true false`\nC) `false false`\nD) `false true`"
                    q_ans = "**B) true false** — `s1` and `s2` refer to the same interned String constant pool instance, while `s3` is an explicit distinct heap allocation."
                else:
                    quiz_code = "def append_val(v, target=[]):\n    target.append(v)\n    return len(target)\nprint(append_val(1), append_val(2))"
                    q_opts = "A) `1 1`\nB) `1 2`\nC) `2 2`\nD) `TypeError`"
                    q_ans = "**B) 1 2** — The default list argument `target=[]` is instantiated once at function definition time, sharing state across invocations."
                return (
                    f"### ❓ Deep-Dive Evaluation: {subject_heading}\n\n"
                    f"**Question:** What will be the output of the following {lang_name} code?\n\n"
                    f"```{lang_code}\n"
                    f"{quiz_code}\n"
                    f"```\n\n"
                    f"{q_opts}\n\n"
                    f"**In-Depth Analysis:** {q_ans}"
                )

            else:  # MEDIUM
                if lang_code == "c":
                    quiz_code = "int x = 10;\nint *p = &x;\n*p = 20;\nprintf(\"%d\", x);"
                    q_opts = "A) `10`\nB) `20`\nC) `0`\nD) `Segmentation fault`"
                    q_ans = "**B) 20** — Dereferencing pointer `*p` writes directly to the memory address of `x`, updating its value."
                elif lang_code == "cpp":
                    quiz_code = "int a = 5;\nint &ref = a;\nref = 15;\nstd::cout << a;"
                    q_opts = "A) `5`\nB) `15`\nC) `10`\nD) `Compilation Error`"
                    q_ans = "**B) 15** — `ref` is a reference alias to `a`, so writing to `ref` updates `a` directly."
                elif lang_code == "java":
                    quiz_code = "String s1 = new String(\"code\");\nString s2 = new String(\"code\");\nSystem.out.print((s1 == s2) + \" \" + s1.equals(s2));"
                    q_opts = "A) `true true`\nB) `false true`\nC) `false false`\nD) `true false`"
                    q_ans = "**B) false true** — `==` compares object references (distinct heap allocations), while `.equals()` compares character contents."
                else:
                    quiz_code = "a = [1, 2]\nb = a\nb.append(3)\nprint(len(a))"
                    q_opts = "A) `2`\nB) `3`\nC) `TypeError`\nD) `None`"
                    q_ans = "**B) 3** — Because `b` and `a` refer to the same mutable list object in memory, mutating `b` also changes `a`."
                return (
                    f"### ❓ Practice Quiz: {subject_heading}\n\n"
                    f"**Question:** What will be the output of the following {lang_name} code?\n\n"
                    f"```{lang_code}\n"
                    f"{quiz_code}\n"
                    f"```\n\n"
                    f"{q_opts}\n\n"
                    f"**Answer:** {q_ans}"
                )

        # ---------------------------------------------------------
        # 7. REVISE MODE
        # ---------------------------------------------------------
        elif mode == "REVISE":
            has_lesson_facts = len(factual_sentences) > 0

            if load == "HIGH":
                if has_lesson_facts:
                    points = [f"{i}. {s}" for i, s in enumerate(factual_sentences[:3], 1)]
                    revision_body = "\n".join(points)
                else:
                    revision_body = (
                        f"ℹ️ *Note: No active lesson reference text found for {subject_heading}. Core {lang_name} syntax invariants:*\n"
                        f"1. {lang_name} executes code sequentially following its structured runtime semantics.\n"
                        f"2. Keep variable state transitions transparent and inspect outputs step by step.\n"
                        f"3. Verify boundary conditions and base cases before loop or function execution."
                    )
                return (
                    f"### 📋 Quick Revision Checklist: {subject_heading}\n\n"
                    f"{revision_body}\n\n"
                    f"💡 **Immediate Mental Anchor:** Focus on one variable and operation at a time. Trace execution sequentially."
                )

            elif load == "LOW":
                if lang_code == "c":
                    invariants = (
                        "• **Memory & Runtime Architecture:** Stack frames allocate automatic variables with deterministic alignment. Heap allocations via `malloc` require explicit lifetime termination with `free`.\n"
                        "• **Pointer Offset Mechanics:** Pointer arithmetic scales automatically by `sizeof(*ptr)`, ensuring constant-time address calculations.\n"
                        "• **Compiler & Platform Optimization:** Modern compilers enforce structure alignment padding; compile with `-O2 -Wall -fsanitize=address` to verify bounds.\n"
                        "• **Defensive Systems Invariant:** Validate all pointer parameters against `NULL` and verify buffer capacity before memory transfers."
                    )
                    challenge = "Mentally trace how structure member reordering alters structure padding and total cache footprint."
                elif lang_code == "cpp":
                    invariants = (
                        "• **Zero-Overhead Principle & RAII:** Resource allocation is tied to object lifetime; destructors execute deterministically at scope exit.\n"
                        "• **Value vs Reference Semantics:** `std::vector` provides contiguous heap storage with O(1) random access; move semantics (`std::move`) transfer internal pointers without deep copying.\n"
                        "• **Dynamic Dispatch & vtable:** Virtual member functions invoke runtime dispatch via compiler-generated vtables; non-virtual calls resolve statically via monomorphization.\n"
                        "• **Exception Safety Contract:** Critical operations should strive for the strong exception guarantee or be marked `noexcept`."
                    )
                    challenge = "Verify how move constructors eliminate deep buffer duplicates when returning large collections by value."
                elif lang_code == "java":
                    invariants = (
                        "• **JVM Runtime & Memory Partitions:** Execution frames reside in the JVM call stack, while all class instances and arrays inhabit the managed heap.\n"
                        "• **Garbage Collection Dynamics:** HotSpot divides the heap into Young and Tenured generations; short-lived objects are reclaimed rapidly via minor GC sweeps.\n"
                        "• **JIT Tiered Compilation:** Interpreted bytecode transitions to C1 client and C2 server compiled native machine instructions for hot execution loops.\n"
                        "• **Reference vs Value Identity:** Primitive variables hold direct bits, whereas object variables store references subject to interned pooling (`==`) vs value equivalence (`.equals`)."
                    )
                    challenge = "Evaluate whether HotSpot escape analysis can scalar-replace short-lived objects inside hot loops."
                else:  # python
                    invariants = (
                        "• **CPython Object Model:** Every entity is a heap-allocated `PyObject` structure containing type information and reference count (`ob_refcnt`).\n"
                        "• **Memory Management Hierarchy:** Objects under 512 bytes are managed by PyMalloc arenas and pools to bypass kernel-level allocator overhead.\n"
                        "• **Mutability & Namespace Bindings:** Variable assignment binds an identifier name to an existing object reference rather than copying memory contents.\n"
                        "• **Execution Invariant:** Dynamic name resolution follows LEGB scope hierarchy (Local, Enclosing, Global, Built-in)."
                    )
                    challenge = "Contrast the memory allocation behavior of immutable tuple expansion vs mutable list append operations."

                context_section = ""
                if has_lesson_facts:
                    context_section = f"\n\n**Lesson Specific Focus:**\n• {factual_sentences[0]}"

                return (
                    f"### 📋 Architectural Reference Summary: {subject_heading}\n\n"
                    f"{invariants}{context_section}\n\n"
                    f"**Mastery Self-Check:** {challenge}"
                )

            else:  # MEDIUM
                if has_lesson_facts:
                    p1 = factual_sentences[0]
                    p2 = factual_sentences[1] if len(factual_sentences) > 1 else f"{lang_name} enforces strict syntax and execution invariants."
                    p3 = factual_sentences[2] if len(factual_sentences) > 2 else f"Structure code into modular, single-responsibility components."
                    p4 = factual_sentences[3] if len(factual_sentences) > 3 else f"Always guard against boundary errors and unexpected null or uninitialized states."
                    body = (
                        f"• **Core Mechanism:** {p1}\n"
                        f"• **Syntax Invariant:** {p2}\n"
                        f"• **Practical Pattern:** {p3}\n"
                        f"• **Safety Precaution:** {p4}"
                    )
                else:
                    body = (
                        f"ℹ️ *Note: No active lesson reference text found for {subject_heading}. Core {lang_name} standards:*\n"
                        f"• **Core Mechanism:** Programs execute through sequential statements, structured control flow, and modular routines.\n"
                        f"• **Syntax Invariant:** Comply with {lang_name} typing rules, delimiter rules, and block scoping.\n"
                        f"• **Practical Pattern:** Separate business logic into self-contained functions or classes with clear inputs and outputs.\n"
                        f"• **Safety Precaution:** Always validate boundary conditions and verify type expectations before operations."
                    )
                return (
                    f"### 📋 Key Takeaways Summary: {subject_heading}\n\n"
                    f"{body}"
                )

        # ---------------------------------------------------------
        # 8. ADVANCED MODE
        # ---------------------------------------------------------
        else:  # ADVANCED
            if load == "HIGH":
                if lang_code == "c":
                    preview = (
                        "Behind the scenes, C coordinates directly with your computer's RAM. "
                        "When you declare variables, the compiler carves out exact memory slots on the call stack."
                    )
                    code_snippet = (
                        "// Stack memory allocation in C\n"
                        "int x = 42; // Allocated on the stack frame"
                    )
                elif lang_code == "cpp":
                    preview = (
                        "Behind the scenes, C++ manages memory automatically using RAII. "
                        "When an object goes out of scope, its destructor runs immediately to return resources."
                    )
                    code_snippet = (
                        "// Automatic RAII resource cleanup in C++\n"
                        "{\n"
                        "    std::vector<int> buffer = {1, 2, 3};\n"
                        "} // buffer memory released here automatically"
                    )
                elif lang_code == "java":
                    preview = (
                        "Behind the scenes, the JVM runs your code through an intelligent engine. "
                        "Objects you no longer need are cleaned up automatically by the Garbage Collector."
                    )
                    code_snippet = (
                        "// Object allocation and automatic GC in Java\n"
                        "Object item = new Object(); // Allocated on heap, reclaimed by GC"
                    )
                else:
                    preview = (
                        "Behind the scenes, Python tracks your objects using reference counters. "
                        "When no more names point to an object, Python frees the memory automatically."
                    )
                    code_snippet = (
                        "# Object reference tracking in Python\n"
                        "x = [1, 2, 3]  # Reference count is 1\n"
                        "y = x          # Reference count becomes 2"
                    )
                return (
                    f"### 🔬 Under the Hood Preview: {subject_heading}\n\n"
                    f"{preview}\n\n"
                    f"**Code Verification:**\n"
                    f"```{lang_code}\n"
                    f"{code_snippet}\n"
                    f"```"
                )

            elif load == "LOW":
                if lang_code == "c":
                    internals = (
                        "**C Memory Architecture & Pointer Scaling:**\n\n"
                        "• **Pointer Arithmetic:** Arithmetic operations scale automatically by `sizeof(*ptr)` based on target type.\n"
                        "• **Stack vs Heap:** Local automatic variables occupy stack frames, while `malloc` requests continuous virtual memory.\n"
                        "• **Structure Padding:** Compilers insert padding bytes to satisfy hardware data alignment rules."
                    )
                    code_snippet = (
                        "// Direct memory inspection in C\n"
                        "#include <stdio.h>\n\n"
                        "int main(void) {\n"
                        "    int x = 42;\n"
                        "    printf(\"Address: %p\\n\", (void*)&x);\n"
                        "    return 0;\n"
                        "}"
                    )
                elif lang_code == "cpp":
                    internals = (
                        "**C++ Zero-Overhead Abstractions & Object Lifecycles:**\n\n"
                        "• **vtable & Polymorphism:** Dynamic dispatch uses a compiler-generated virtual method table per polymorphic class.\n"
                        "• **Move Semantics:** Rvalue references (`T&&`) enable resource transfer without allocation via move constructors.\n"
                        "• **Templates:** Monomorphization creates dedicated specialized machine code per type with zero runtime indirection."
                    )
                    code_snippet = (
                        "// Memory layout inspection in C++\n"
                        "#include <iostream>\n\n"
                        "int main() {\n"
                        "    int x = 42;\n"
                        "    std::cout << \"Address: \" << &x << std::endl;\n"
                        "    return 0;\n"
                        "}"
                    )
                elif lang_code == "java":
                    internals = (
                        "**JVM Bytecode Execution & Garbage Collection:**\n\n"
                        "• **Generational GC:** Divides heap into Young (Eden, Survivor) and Tenured spaces.\n"
                        "• **JIT Compilation:** Hot execution paths are compiled dynamically to native machine code via C1/C2 compilers.\n"
                        "• **Object Headers:** JVM objects carry a Mark Word (locking, hashcode, GC age) and Klass pointer."
                    )
                    code_snippet = (
                        "// Object identity inspection in Java\n"
                        "public class Verify {\n"
                        "    public static void main(String[] args) {\n"
                        "        Object obj = new Object();\n"
                        "        System.out.println(\"Identity: \" + System.identityHashCode(obj));\n"
                        "    }\n"
                        "}"
                    )
                else:
                    internals = (
                        f"**{lang_name} Memory Management & PyObject Internals:**\n\n"
                        f"• **CPython Memory Hierarchy:** Small objects under 512 bytes are managed by PyMalloc pools and arenas.\n"
                        f"• **Reference Counting:** Every `PyObject` carries `ob_refcnt`, complemented by cyclic garbage collection.\n"
                        f"• **Dynamic Namespace:** Global and local symbol tables map strings to PyObject pointers via hash tables."
                    )
                    code_snippet = (
                        "# CPython PyObject inspection: id() returns heap memory address\n"
                        "x = [10, 20]\n"
                        "print(f\"Address: {hex(id(x))}\")"
                    )
                return (
                    f"### 🔬 Advanced Systems Deep Dive: {subject_heading}\n\n"
                    f"{internals}\n\n"
                    f"**Code Verification Concept:**\n"
                    f"```{lang_code}\n"
                    f"{code_snippet}\n"
                    f"```"
                )

            else:  # MEDIUM
                if lang_code == "c":
                    internals = (
                        "**C Memory Organization:**\n\n"
                        "• Automatic variables reside on the execution stack frame.\n"
                        "• Dynamic memory allocated with `malloc` resides on the heap.\n"
                        "• Pointer variables store exact 64-bit memory addresses."
                    )
                    code_snippet = (
                        "// Inspecting memory address in C\n"
                        "#include <stdio.h>\n"
                        "int x = 10;\n"
                        "int *p = &x;"
                    )
                elif lang_code == "cpp":
                    internals = (
                        "**C++ Memory Layout & Value Semantics:**\n\n"
                        "• Objects on the stack obey strict scope boundaries (RAII).\n"
                        "• References act as direct aliases without heap indirection.\n"
                        "• Dynamic containers (`std::vector`) manage contiguous heap buffers internally."
                    )
                    code_snippet = (
                        "// Inspecting reference semantics in C++\n"
                        "int a = 10;\n"
                        "int &ref = a;"
                    )
                elif lang_code == "java":
                    internals = (
                        "**JVM Stack and Heap Architecture:**\n\n"
                        "• Stack frames store method call frames, local primitives, and object references.\n"
                        "• All class instances and array objects are allocated in heap memory.\n"
                        "• Automatic garbage collection continuously reclaims unreferenced heap memory."
                    )
                    code_snippet = (
                        "// Reference assignment in Java\n"
                        "Object a = new Object();\n"
                        "Object b = a; // Both point to the same heap object"
                    )
                else:
                    internals = (
                        f"**{lang_name} Memory Model & Internals:**\n\n"
                        f"• Variables in Python are name tags bound to heap-allocated `PyObject` instances.\n"
                        f"• Mutable objects (lists, dicts) can alter their internal data in-place.\n"
                        f"• Immutable objects (ints, strings, tuples) cannot be altered; new objects are constructed on reassignment."
                    )
                    code_snippet = (
                        "# Object identity verification in Python\n"
                        "a = [1, 2, 3]\n"
                        "b = a\n"
                        "assert id(a) == id(b)"
                    )
                return (
                    f"### 🔬 Runtime & Memory Mechanics: {subject_heading}\n\n"
                    f"{internals}\n\n"
                    f"**Code Verification:**\n"
                    f"```{lang_code}\n"
                    f"{code_snippet}\n"
                    f"```"
                )


llm_service = LLMService()
