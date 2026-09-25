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
        level: Optional[str] = None,
        tutor_mode: Optional[str] = None,
        code_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate cognitive-load-adapted explanation with RAG context grounding.
        """
        # 1. Retrieve verified educational context via RAG
        retrieved_context = rag_service.get_formatted_context(
            query=f"{topic or ''} {question}".strip(),
            course=course,
            topic=topic,
            level=level,
            top_k=4,
            learner_level=level or "intermediate"
        )

        effective_query = question
        if tutor_mode:
            effective_query = f"[{tutor_mode.upper()} MODE] {question}"
        if code_context:
            effective_query += f"\n\nStudent Code:\n{code_context}"

        # 2. Attempt Gemini generation via llm.adaptive_generator
        res = generate_adaptive_explanation(
            question=effective_query,
            retrieved_context=retrieved_context,
            cognitive_load=cognitive_load,
            topic=topic or course
        )

        # 3. If Gemini succeeds, return standard response
        if res.get("success"):
            return {
                "success": True,
                "answer": res.get("explanation"),
                "cognitive_load": res.get("cognitive_load", cognitive_load),
                "adaptation": res.get("adaptation"),
                "retrieved_context": retrieved_context,
                "source": "gemini-rag-integrated"
            }

        # 4. Graceful Fallback if GEMINI_API_KEY is not set or network unavailable:
        # Use retrieved RAG material to deliver a structured, cognitive-load-adapted answer
        fallback_explanation = self._build_offline_adaptive_fallback(
            question=question,
            retrieved_context=retrieved_context,
            cognitive_load=cognitive_load,
            tutor_mode=tutor_mode
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
        tutor_mode: Optional[str] = None
    ) -> str:
        """Construct grounded educational explanation from RAG when API key is absent."""
        load = cognitive_load.upper()
        mode_str = f"[{tutor_mode.upper()} Mode] " if tutor_mode else ""

        # Clean snippet of RAG context
        clean_context = retrieved_context.replace("---", "").strip()
        first_chunk = clean_context.split("\n\n")[0] if clean_context else ""

        if load == "HIGH":
            return (
                f"{mode_str}### Simplified Step-by-Step Breakdown\n\n"
                f"**1. Core Concept in Simple Terms:**\n"
                f"{question} is best approached one step at a time.\n\n"
                f"**2. Relevant Knowledge Context:**\n"
                f"{first_chunk[:300]}...\n\n"
                f"**3. Quick Summary Checklist:**\n"
                f"• Break the concept into small parts.\n"
                f"• Practice with a single variable or test case first.\n"
                f"• Check your output step by step."
            )
        elif load == "LOW":
            return (
                f"{mode_str}### Advanced In-Depth Analysis\n\n"
                f"**Theoretical Foundation:**\n"
                f"{first_chunk[:450]}\n\n"
                f"**Underlying Mechanics & Architectural Flow:**\n"
                f"The implementation scales across memory structures and execution lifecycles.\n\n"
                f"**Mastery Challenge:**\n"
                f"How would you optimize time complexity and edge case handling for this in production systems?"
            )
        else:
            return (
                f"{mode_str}### Balanced Concept Explanation\n\n"
                f"**Definition & Context:**\n"
                f"{first_chunk[:350]}\n\n"
                f"**Key Takeaways:**\n"
                f"• Follow standard idioms for clarity and maintainability.\n"
                f"• Review edge cases like zero, None, or empty containers.\n"
                f"• Test frequently with incremental examples."
            )


llm_service = LLMService()
