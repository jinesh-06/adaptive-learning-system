"""Adaptive prompt builder for guiding the Gemini educational tutor."""

from typing import Optional, Union
from .schemas import CognitiveLoadLevel, normalize_cognitive_load


_LOW_COGNITIVE_LOAD_INSTRUCTIONS = """\
[ADAPTATION PROFILE: LOW COGNITIVE LOAD]
The learner demonstrates high mastery/comfort. Provide a deep, comprehensive conceptual explanation:
- Structure:
  1. Core Concept Definition
  2. Detailed Explanation & Theoretical Foundation
  3. Deep Dive ("Why it works" / Underlying Mechanisms)
  4. Rich Examples (2+ practical or applied examples)
  5. Interdisciplinary Connections / Real-World Application
  6. Thought-Provoking Challenge Question (to test critical thinking)
- Tone: Rigorous, engaging, using precise moderate-to-advanced technical terminology.
"""

_MEDIUM_COGNITIVE_LOAD_INSTRUCTIONS = """\
[ADAPTATION PROFILE: MEDIUM COGNITIVE LOAD]
The learner requires balanced, standard support without cognitive overwhelm:
- Structure:
  1. Clear, Intuitive Definition
  2. Key Explanation & Essential Steps
  3. Practical Concrete Example (1 to 2 relatable examples)
  4. Concise Summary
- Tone: Accessible, conversational, clear vocabulary with minimal unnecessary jargon.
- Brevity: Moderate length; avoid dense theoretical digressions.
"""

_HIGH_COGNITIVE_LOAD_INSTRUCTIONS = """\
[ADAPTATION PROFILE: HIGH COGNITIVE LOAD]
CRITICAL: The learner is currently cognitively overloaded and struggling. Your goal is cognitive load reduction:
- Structure:
  1. One-Sentence Simple Definition (plain, welcoming language)
  2. Step-by-Step Breakdown (numbered, bite-sized steps, one micro-concept at a time)
  3. One Everyday Analogy or Simple Concrete Example
  4. Quick Recap (exactly 2-3 brief bullet points)
- Tone: Extremely clear, patient, supportive, plain vocabulary.
- Constraints:
  - Do NOT use long paragraphs (keep paragraphs under 2-3 short sentences).
  - Do NOT overwhelm with complex technical terminology.
  - Do NOT make the explanation childish or factually imprecise—maintain educational integrity.
  - Keep the total explanation brief and digestible.
"""


def normalize_language_display(raw_lang: Optional[str]) -> str:
    """Normalize language identifier to clear human/runtime label."""
    if not raw_lang or not str(raw_lang).strip():
        return "Python 3"
    cleaned = str(raw_lang).strip().lower()
    if "cpp" in cleaned or "c++" in cleaned or "cplusplus" in cleaned:
        return "C++17"
    if cleaned == "c" or cleaned.startswith("c ") or cleaned.startswith("c_"):
        return "C11"
    if "java" in cleaned:
        return "Java 17"
    if "python" in cleaned or "py" in cleaned:
        return "Python 3"
    return str(raw_lang).strip().capitalize()


def get_tutor_mode_directive(mode_key: str, language_display: str) -> str:
    """Return language-parameterized tutor mode directive."""
    key = mode_key.upper().strip()
    directives = {
        "EXPLAIN": f"MODE [Explain this]: Provide a balanced, intuitive, and crystal-clear explanation of the core concept in {language_display}. Ground it directly in the lesson material.",
        "SIMPLIFY": f"MODE [Make it simpler]: Break down this concept into its simplest form using a friendly real-world analogy appropriate for {language_display}. Avoid complex technical jargon.",
        "EXAMPLE": f"MODE [Give an example]: Provide clean, self-contained, and well-commented {language_display} code examples directly illustrating this concept.",
        "DEBUG": f"MODE [Why is this wrong?]: Detail the most common bugs, syntax errors, and edge-case pitfalls students encounter with this topic in {language_display}, along with how to fix them.",
        "HINT": f"MODE [Show a hint]: Give a focused pedagogical hint or conceptual nudge for {language_display} that helps the learner reason through the concept without spoiling the complete answer.",
        "QUIZ": f"MODE [Quiz me]: Generate 1 conceptual practice multiple-choice question (with options A, B, C, D) testing this {language_display} concept, followed by an explanation of the correct choice.",
        "REVISE": f"MODE [Summarize]: Provide a high-impact summary checklist of key takeaways, {language_display} syntax patterns, and rules from this lesson.",
        "ADVANCED": f"MODE [Advanced deep dive]: Provide an advanced, rigorous technical breakdown detailing {language_display} internal mechanics, memory model, and performance characteristics.",
    }
    return directives.get(key, "")


_TUTOR_MODE_DIRECTIVES = {
    "EXPLAIN": "MODE [Explain this]: Provide a balanced, intuitive, and crystal-clear explanation of the core concept. Ground it directly in the lesson material.",
    "SIMPLIFY": "MODE [Make it simpler]: Break down this concept into its simplest form using a friendly real-world analogy. Avoid complex technical jargon.",
    "EXAMPLE": "MODE [Give an example]: Provide clean, self-contained, and well-commented code examples directly illustrating this concept.",
    "DEBUG": "MODE [Why is this wrong?]: Detail the most common bugs, syntax errors, and edge-case pitfalls students encounter with this topic, along with how to fix them.",
    "HINT": "MODE [Show a hint]: Give a focused pedagogical hint or conceptual nudge that helps the learner reason through the concept without spoiling the complete answer.",
    "QUIZ": "MODE [Quiz me]: Generate 1 conceptual practice multiple-choice question (with options A, B, C, D) testing this concept, followed by an explanation of the correct choice.",
    "REVISE": "MODE [Summarize]: Provide a high-impact summary checklist of key takeaways, syntax patterns, and rules from this lesson.",
    "ADVANCED": "MODE [Advanced deep dive]: Provide an advanced, rigorous technical breakdown detailing internal mechanics, memory model, and performance characteristics."
}


def build_adaptive_prompt(
    question: str,
    retrieved_context: str,
    cognitive_load: Union[str, CognitiveLoadLevel],
    topic: Optional[str] = None,
    tutor_mode: Optional[str] = None,
    lesson_context: Optional[str] = None,
    conversation_history: Optional[list] = None,
    language: Optional[str] = None,
) -> str:
    """Construct an adaptive educational prompt for the Gemini model.

    Args:
        question: Student's inquiry.
        retrieved_context: Grounding context retrieved by RAG.
        cognitive_load: Cognitive load level (LOW, MEDIUM, HIGH).
        topic: Optional domain or topic name.
        tutor_mode: Optional 8-contextual mode (EXPLAIN, SIMPLIFY, EXAMPLE, DEBUG, HINT, QUIZ, REVISE, ADVANCED).
        lesson_context: Optional active lesson and section content snippet.
        conversation_history: Optional recent conversation messages for chat continuity.
        language: Optional target programming language (e.g. python, c, cpp, java).

    Returns:
        str: Fully formatted prompt text.
    """
    level = normalize_cognitive_load(cognitive_load)
    lang_display = normalize_language_display(language)

    if level == CognitiveLoadLevel.LOW:
        adaptation_instructions = _LOW_COGNITIVE_LOAD_INSTRUCTIONS
    elif level == CognitiveLoadLevel.MEDIUM:
        adaptation_instructions = _MEDIUM_COGNITIVE_LOAD_INSTRUCTIONS
    else:
        adaptation_instructions = _HIGH_COGNITIVE_LOAD_INSTRUCTIONS

    lang_line = f"PROGRAMMING LANGUAGE: {lang_display}\n"
    topic_line = f"TOPIC / DOMAIN: {topic.strip()}\n" if topic and topic.strip() else ""

    mode_key = tutor_mode.strip().upper() if tutor_mode else ""
    mode_directive = get_tutor_mode_directive(mode_key, lang_display)
    if not mode_directive and mode_key in _TUTOR_MODE_DIRECTIVES:
        mode_directive = _TUTOR_MODE_DIRECTIVES[mode_key]
    mode_section = f"ACTIVE TUTOR MODE:\n{mode_directive}\n" if mode_directive else ""

    lesson_section = f"CURRENT LESSON MATERIAL:\n{lesson_context.strip()}\n\n" if lesson_context and lesson_context.strip() else ""

    history_section = ""
    if conversation_history:
        history_lines = []
        for msg in conversation_history[-6:]:
            if isinstance(msg, dict):
                role = "Student" if msg.get("sender") == "user" else "AI Tutor"
                text = str(msg.get("text", "")).strip()
                if text:
                    history_lines.append(f"{role}: {text[:280]}")
        if history_lines:
            history_section = "RECENT CONVERSATION HISTORY:\n" + "\n".join(history_lines) + "\n\n"

    prompt = f"""You are an expert Adaptive Educational AI Tutor helping a student learn {lang_display}. Your primary responsibility is to teach concepts to students by adapting your explanation style, complexity, length, structure, and vocabulary according to the student's current cognitive load.

STRICT GROUNDING & RUNTIME RULES:
1. Ground your explanation primarily on the RETRIEVED CONTEXT and CURRENT LESSON MATERIAL provided below whenever relevant.
2. The runtime environment is strictly standard modern {lang_display} programming practices.
3. Tailor your response directly to the student's active inquiry, requested TUTOR MODE, and {lang_display} idioms.
4. If the retrieved context is minimal or does not directly cover the student's question, provide an accurate, clear, and pedagogically sound {lang_display} answer tailored to their cognitive load level.
5. Keep explanations direct, conversational, and helpful. Use clear markdown formatting (bolding, concise bullet points, and syntax-highlighted code blocks).

{adaptation_instructions}

{mode_section}{lang_line}{topic_line}{lesson_section}{history_section}STUDENT QUESTION / ACTION:
{question.strip()}

RETRIEVED KNOWLEDGE BASE CONTEXT:
{retrieved_context.strip() if retrieved_context and retrieved_context.strip() else "[NO CONTEXT PROVIDED]"}

COGNITIVE LOAD LEVEL:
{level.value}

INSTRUCTION:
Generate an adaptive explanation that strictly follows the active tutor mode, adaptation profile, and grounding rules above.
"""
    return prompt
