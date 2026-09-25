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


_TUTOR_MODE_DIRECTIVES = {
    "EXPLAIN": "MODE [Explain this]: Provide a balanced, intuitive, and crystal-clear explanation of the core concept. Ground it directly in the lesson material.",
    "SIMPLIFY": "MODE [Make it simpler]: Break down this concept into its simplest form using a friendly real-world analogy. Avoid complex technical jargon.",
    "EXAMPLE": "MODE [Give an example]: Provide clean, self-contained, and well-commented Python 3 code examples directly illustrating this concept.",
    "DEBUG": "MODE [Why is this wrong?]: Detail the most common bugs, syntax errors, and edge-case pitfalls students encounter with this topic, along with how to fix them.",
    "HINT": "MODE [Show a hint]: Give a focused pedagogical hint or conceptual nudge that helps the learner reason through the concept without spoiling the complete answer.",
    "QUIZ": "MODE [Quiz me]: Generate 1 conceptual practice multiple-choice question (with options A, B, C, D) testing this concept, followed by an explanation of the correct choice.",
    "REVISE": "MODE [Summarize]: Provide a high-impact summary checklist of key takeaways, syntax patterns, and rules from this lesson.",
    "ADVANCED": "MODE [Advanced deep dive]: Provide an advanced, rigorous technical breakdown detailing Python 3 internal mechanics, memory model, and performance characteristics."
}


def build_adaptive_prompt(
    question: str,
    retrieved_context: str,
    cognitive_load: Union[str, CognitiveLoadLevel],
    topic: Optional[str] = None,
    tutor_mode: Optional[str] = None,
    lesson_context: Optional[str] = None,
) -> str:
    """Construct an adaptive educational prompt for the Gemini model.

    Args:
        question: Student's inquiry.
        retrieved_context: Grounding context retrieved by RAG.
        cognitive_load: Cognitive load level (LOW, MEDIUM, HIGH).
        topic: Optional domain or topic name.
        tutor_mode: Optional 8-contextual mode (EXPLAIN, SIMPLIFY, EXAMPLE, DEBUG, HINT, QUIZ, REVISE, ADVANCED).
        lesson_context: Optional active lesson and section content snippet.

    Returns:
        str: Fully formatted prompt text.
    """
    level = normalize_cognitive_load(cognitive_load)

    if level == CognitiveLoadLevel.LOW:
        adaptation_instructions = _LOW_COGNITIVE_LOAD_INSTRUCTIONS
    elif level == CognitiveLoadLevel.MEDIUM:
        adaptation_instructions = _MEDIUM_COGNITIVE_LOAD_INSTRUCTIONS
    else:
        adaptation_instructions = _HIGH_COGNITIVE_LOAD_INSTRUCTIONS

    topic_line = f"TOPIC / DOMAIN: {topic.strip()}\n" if topic and topic.strip() else ""

    mode_key = tutor_mode.strip().upper() if tutor_mode else ""
    mode_directive = _TUTOR_MODE_DIRECTIVES.get(mode_key, "")
    mode_section = f"ACTIVE TUTOR MODE:\n{mode_directive}\n" if mode_directive else ""

    lesson_section = f"CURRENT LESSON MATERIAL:\n{lesson_context.strip()}\n\n" if lesson_context and lesson_context.strip() else ""

    prompt = f"""You are an expert Adaptive Educational AI Tutor helping a student learn Python 3. Your primary responsibility is to teach concepts to students by adapting your explanation style, complexity, length, structure, and vocabulary according to the student's current cognitive load.

STRICT GROUNDING & RUNTIME RULES:
1. Ground your explanation primarily on the RETRIEVED CONTEXT and CURRENT LESSON MATERIAL provided below.
2. The runtime environment is strictly Python 3 (standard CPython 3). Never reference Jython, JPython, or Java-based Python.
3. Tailor your response directly to the student's active inquiry and requested TUTOR MODE.
4. Only if the retrieved context and lesson material are completely empty or completely unrelated should you inform the student: "The available learning material is insufficient and does not contain enough information to address this question."

{adaptation_instructions}

{mode_section}{topic_line}{lesson_section}STUDENT QUESTION / ACTION:
{question.strip()}

RETRIEVED KNOWLEDGE BASE CONTEXT:
{retrieved_context.strip() if retrieved_context and retrieved_context.strip() else "[NO CONTEXT PROVIDED]"}

COGNITIVE LOAD LEVEL:
{level.value}

INSTRUCTION:
Generate an adaptive explanation in Python 3 that strictly follows the active tutor mode, adaptation profile, and grounding rules above.
"""
    return prompt
