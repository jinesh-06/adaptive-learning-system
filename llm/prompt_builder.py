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


def build_adaptive_prompt(
    question: str,
    retrieved_context: str,
    cognitive_load: Union[str, CognitiveLoadLevel],
    topic: Optional[str] = None,
) -> str:
    """Construct an adaptive educational prompt for the Gemini model.

    Args:
        question: Student's inquiry.
        retrieved_context: Grounding context retrieved by RAG.
        cognitive_load: Cognitive load level (LOW, MEDIUM, HIGH).
        topic: Optional domain or topic name.

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

    prompt = f"""You are an expert Adaptive Educational AI Tutor. Your primary responsibility is to teach concepts to students by adapting your explanation style, complexity, length, structure, and vocabulary according to the student's current cognitive load.

STRICT GROUNDING RULES:
1. Ground your explanation primarily on the RETRIEVED CONTEXT provided below.
2. Do NOT invent or hallucinate facts that are unsupported by the retrieved context.
3. If the retrieved context is missing, empty, or does not contain sufficient information to answer the question, clearly inform the student: "The available learning material is insufficient and does not contain enough information to address this question." Do not fabricate an answer.

{adaptation_instructions}

{topic_line}STUDENT QUESTION:
{question.strip()}

RETRIEVED CONTEXT:
{retrieved_context.strip() if retrieved_context and retrieved_context.strip() else "[NO CONTEXT PROVIDED]"}

COGNITIVE LOAD LEVEL:
{level.value}

INSTRUCTION:
Generate an adaptive explanation that strictly follows the adaptation profile and grounding rules above.
"""
    return prompt
