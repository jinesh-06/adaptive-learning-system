"""Adapted Lesson Service: Personalization engine & structured AI lesson generation."""

import json
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from google.genai import types
from google.genai import errors as genai_errors

from llm.config import get_gemini_client, get_model_name
from llm.lesson_schemas import AdaptedLesson, LessonSection, AdaptationInfo
from backend.services.ml_service import ml_service
from backend.services.curriculum_service import CurriculumService
from backend.services.rag_service import rag_service
from backend.services.state_store import state_store

logger = logging.getLogger(__name__)


class AdaptedLessonService:
    """Orchestrates learner profiling, cognitive load evaluation, teaching strategy selection, and Gemini lesson generation."""

    def __init__(self):
        self.curriculum = CurriculumService()

    def _detect_language(self, topic_id: str, topic_meta: Dict[str, Any]) -> str:
        t_id = (topic_id or "").lower()
        if "py" in t_id:
            return "python"
        if "cpp" in t_id:
            return "cpp"
        if "java" in t_id:
            return "java"
        if "top-c-" in t_id or "c-adv" in t_id or "c-int" in t_id:
            return "c"
        return topic_meta.get("language", "python").lower()

    def generate_adapted_lesson(
        self,
        user_id: str,
        topic_id: str,
        detail_level: str = "STANDARD",
        signals: Optional[Dict[str, Any]] = None,
        force_refresh: bool = False,
        learner_feedback: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate or retrieve a personalized AI-adapted lesson structured for dynamic UI rendering."""
        safe_user_id = str(user_id or "guest-learner").strip() or "guest-learner"
        normalized_mode = (detail_level or "STANDARD").upper().strip()
        if normalized_mode not in ("STANDARD", "DETAILED", "SIMPLIFIED"):
            normalized_mode = "STANDARD"

        # 1. Check persistent SQLite cache unless force_refresh requested
        if not force_refresh:
            cached = state_store.get_adapted_lesson(safe_user_id, topic_id, normalized_mode)
            if cached and cached.get("lesson_data"):
                return {
                    "success": True,
                    "cached": True,
                    "topic_id": topic_id,
                    "detail_level": normalized_mode,
                    "lesson": cached["lesson_data"]
                }

        # 2. Retrieve authoritative curriculum data
        topic_meta = self.curriculum.get_topic_detail(topic_id)
        if not topic_meta:
            # Fallback lookup in platform data
            for t in self.curriculum.data.get("topics", []):
                if t.get("id") == topic_id:
                    topic_meta = t
                    break

        if not topic_meta:
            topic_meta = {
                "id": topic_id,
                "title": topic_id.replace("-", " ").replace("top ", "").title(),
                "description": "Programming concepts and practical implementation.",
                "conceptExplanation": "Core mechanics, syntax semantics, and problem-solving patterns.",
                "learningObjectives": ["Understand core mechanics", "Apply concepts in code"]
            }

        topic_title = topic_meta.get("title") or topic_id
        subject = self._detect_language(topic_id, topic_meta)

        # 3. Assemble learner context & cognitive load signals
        telemetry_signals = signals or {}
        
        # Extract prior progress & history if available
        prior_status = "NOT_STARTED"
        try:
            prior_status = state_store.get_topic_progress(topic_id, safe_user_id)
        except Exception:
            pass

        adaptive_history = state_store.get_adaptive_history(safe_user_id, limit=3)

        # Evaluate Cognitive Load via ML model
        ml_input = dict(telemetry_signals)
        if "accuracy" not in ml_input and "recentQuizAccuracy" in telemetry_signals:
            ml_input["accuracy"] = float(telemetry_signals["recentQuizAccuracy"])

        ml_eval = ml_service.evaluate(ml_input)
        pred_load = ml_eval.get("cognitive_load", "MEDIUM")
        confidence = ml_eval.get("confidence", 0.85)
        contributing_factors = ml_eval.get("contributing_factors", [])
        base_reason = ml_eval.get("reason", "Steady learning progression detected.")

        # 4. Teaching Strategy Selection
        signals_used = list(contributing_factors)
        if telemetry_signals.get("recentQuizAccuracy") is not None:
            signals_used.append(f"Recent quiz accuracy: {telemetry_signals['recentQuizAccuracy']}%")
        if telemetry_signals.get("codingErrorCount"):
            signals_used.append(f"Code sandbox errors: {telemetry_signals['codingErrorCount']}")
        if learner_feedback:
            signals_used.append(f"Learner preference note: {learner_feedback}")

        if not signals_used:
            signals_used = ["Calibrated baseline learning pace", "Continuous section telemetry"]

        if normalized_mode == "SIMPLIFIED":
            strategy = "guided_step_by_step"
            strategy_instructions = (
                "SIMPLIFIED TEACHING STRATEGY:\n"
                "- Break concepts into small, digestible micro-milestones.\n"
                "- Use simple, beginner-friendly wording without jargon.\n"
                "- Provide an intuitive, real-world everyday analogy.\n"
                "- Provide concise code with step-by-step commentary.\n"
                "- Provide common pitfalls with clear solutions.\n"
                "- Offer an encouraging tone and guided practice with hints."
            )
            reason = f"Simplified mode selected: breaking concepts down into bite-sized analogies and guided micro-steps. ({base_reason})"
        elif normalized_mode == "DETAILED":
            strategy = "deep_conceptual_dive"
            strategy_instructions = (
                "DETAILED TEACHING STRATEGY:\n"
                "- Provide an architectural deep dive, memory layout, and runtime mechanics.\n"
                "- Discuss edge cases, performance trade-offs, and compiler/interpreter behavior.\n"
                "- Provide thorough code examples showing idiomatic patterns and advanced usage.\n"
                "- Address subtle bugs and defensive coding practices.\n"
                "- Offer challenging practice exercises."
            )
            reason = f"Detailed mode selected: expanding with architectural depth, memory mechanics, and edge cases. ({base_reason})"
        else:
            strategy = "balanced_standard"
            strategy_instructions = (
                "STANDARD TEACHING STRATEGY:\n"
                "- Deliver a balanced explanation: concept intuition, clear definition, and practical application.\n"
                "- Provide clean, idiomatic code examples with concise walkthroughs.\n"
                "- Highlight key takeaways and offer structured practice."
            )
            reason = f"Standard mode selected: maintaining balanced pacing, practical examples, and core definitions. ({base_reason})"

        # 5. Fetch verified curriculum context via RAG
        rag_context = ""
        try:
            rag_context = rag_service.get_formatted_context(
                query=f"{subject} {topic_title} conceptual explanation examples",
                course=subject,
                topic=topic_id,
                top_k=3
            )
        except Exception as e:
            logger.warning("RAG retrieval failed: %s", e)

        # 6. Generate with Gemini
        ai_lesson_dict = self._generate_with_gemini(
            topic_title=topic_title,
            subject=subject,
            topic_id=topic_id,
            topic_meta=topic_meta,
            rag_context=rag_context,
            detail_level=normalized_mode,
            strategy=strategy,
            strategy_instructions=strategy_instructions,
            pred_load=pred_load,
            confidence=confidence,
            reason=reason,
            signals_used=signals_used
        )

        # 7. Fallback to offline structured adaptation if Gemini returns None
        if not ai_lesson_dict:
            ai_lesson_dict = self._build_offline_adapted_lesson(
                topic_title=topic_title,
                subject=subject,
                topic_id=topic_id,
                topic_meta=topic_meta,
                rag_context=rag_context,
                detail_level=normalized_mode,
                strategy=strategy,
                pred_load=pred_load,
                confidence=confidence,
                reason=reason,
                signals_used=signals_used
            )

        # 8. Validate and sanitize through Pydantic
        try:
            validated_lesson = AdaptedLesson(**ai_lesson_dict).model_dump()
        except Exception as val_err:
            logger.warning("Pydantic validation warning on AI output: %s. Sanitizing...", val_err)
            validated_lesson = self._build_offline_adapted_lesson(
                topic_title=topic_title,
                subject=subject,
                topic_id=topic_id,
                topic_meta=topic_meta,
                rag_context=rag_context,
                detail_level=normalized_mode,
                strategy=strategy,
                pred_load=pred_load,
                confidence=confidence,
                reason=reason,
                signals_used=signals_used
            )

        # 9. Save to SQLite cache
        state_store.save_adapted_lesson(
            user_id=safe_user_id,
            topic_id=topic_id,
            adaptation_strategy=strategy,
            lesson_data=validated_lesson,
            signals=telemetry_signals,
            detail_level=normalized_mode
        )

        return {
            "success": True,
            "cached": False,
            "topic_id": topic_id,
            "detail_level": normalized_mode,
            "lesson": validated_lesson
        }

    def _generate_with_gemini(
        self,
        topic_title: str,
        subject: str,
        topic_id: str,
        topic_meta: Dict[str, Any],
        rag_context: str,
        detail_level: str,
        strategy: str,
        strategy_instructions: str,
        pred_load: str,
        confidence: float,
        reason: str,
        signals_used: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Call Gemini model with structured JSON response schema."""
        try:
            client = get_gemini_client()
        except Exception as e:
            logger.warning("Gemini client not initialized: %s", e)
            return None

        # Build prompt
        prompt = f"""You are an elite educational AI pedagogy system for a computer science platform.
Your task is to generate a complete, genuinely personalized, structured AI-Adapted Lesson for a student.

TOPIC INFORMATION:
- Topic: {topic_title}
- Subject/Language: {subject}
- Topic ID: {topic_id}
- Learning Objectives: {json.dumps(topic_meta.get('learningObjectives', []))}
- Reference Content: {topic_meta.get('conceptExplanation', topic_meta.get('description', ''))[:800]}
- RAG Educational Context: {rag_context[:1000]}

LEARNER SIGNALS & COGNITIVE STATE:
- Cognitive Load Category: {pred_load} (Confidence: {confidence:.2f})
- Active Explanation Mode: {detail_level}
- Teaching Strategy: {strategy}
- Adaptation Reason: {reason}
- Signals Observed: {json.dumps(signals_used)}

PEDAGOGICAL STRATEGY RULES:
{strategy_instructions}

OUTPUT FORMAT REQUIREMENTS:
You MUST respond strictly with a valid JSON object matching this schema:
{{
  "title": "A personalized engaging lesson title",
  "subject": "{subject}",
  "topic": "{topic_title}",
  "topic_id": "{topic_id}",
  "adaptation": {{
    "strategy": "{strategy}",
    "detail_level": "{detail_level.lower()}",
    "cognitive_load": "{pred_load}",
    "confidence": {confidence},
    "reason": "{reason}",
    "signals_used": {json.dumps(signals_used)}
  }},
  "learning_objectives": [
    "Specific learning objective 1",
    "Specific learning objective 2",
    "Specific learning objective 3"
  ],
  "introduction": "An engaging, friendly introduction explaining what the learner will master.",
  "sections": [
    {{
      "id": "core-intuition",
      "type": "explanation",
      "title": "Core Intuition & Meaning",
      "content": "Rich markdown explanation detailing the underlying principle.",
      "importance": "primary"
    }},
    {{
      "id": "everyday-analogy",
      "type": "analogy",
      "title": "Everyday Analogy",
      "content": "A memorable real-world analogy comparing this computer science concept to an everyday object or system.",
      "importance": "primary"
    }},
    {{
      "id": "visual-flow",
      "type": "visual_diagram",
      "title": "Conceptual Flow & Diagram",
      "diagram_type": "ascii",
      "diagram_content": "+-----------+    +-----------+\\n| Input     | -> | Transform |\\n+-----------+    +-----------+",
      "diagram_caption": "Visual pipeline illustrating data or execution flow.",
      "importance": "secondary"
    }},
    {{
      "id": "worked-code-example",
      "type": "code_example",
      "title": "Worked Code Walkthrough",
      "language": "{subject}",
      "code": "executable code snippet",
      "code_explanation": "Explanation of how the code executes line by line.",
      "line_by_line": [
        {{"line": "Line of code", "explanation": "Why this line was written and what it does"}}
      ],
      "importance": "primary"
    }},
    {{
      "id": "common-pitfalls",
      "type": "common_mistakes",
      "title": "Common Bugs & Pitfalls",
      "mistakes": [
        {{
          "mistake": "Description of common mistake",
          "why_wrong": "Why this happens or causes an error",
          "fix": "How to write it correctly"
        }}
      ],
      "importance": "secondary"
    }},
    {{
      "id": "guided-practice",
      "type": "guided_practice",
      "title": "Interactive Practice Sandbox",
      "practice": {{
        "prompt": "Clear coding exercise prompt",
        "starter_code": "# Starter code\\n",
        "expected_output": "Expected stdout or result",
        "hint": "Pedagogical hint to get unblocked",
        "solution": "Correct working solution"
      }},
      "importance": "primary"
    }},
    {{
      "id": "knowledge-check",
      "type": "quiz",
      "title": "Check Your Understanding",
      "questions": [
        {{
          "id": "kc-1",
          "question": "Clear conceptual question testing understanding?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_index": 0,
          "explanation": "Clear explanation of why option 0 is correct."
        }},
        {{
          "id": "kc-2",
          "question": "Second question testing edge case or syntax?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_index": 1,
          "explanation": "Clear explanation of why option 1 is correct."
        }}
      ],
      "importance": "primary"
    }}
  ],
  "key_takeaways": [
    "Key takeaway 1",
    "Key takeaway 2",
    "Key takeaway 3"
  ],
  "next_step": "Recommended next learning activity"
}}

IMPORTANT:
1. Ground the code strictly in {subject}.
2. Ensure the code is 100% syntactically valid and runnable.
3. Choose section types that genuinely fit {topic_title} and the learner's {detail_level} preference.
4. Return ONLY valid JSON, with no enclosing backticks or markdown preamble.
"""

        candidate_models = [
            get_model_name(),
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-3.7-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash"
        ]

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.3
                    )
                )
                text = response.text.strip() if response.text else ""
                if not text:
                    continue

                parsed = json.loads(text)
                if isinstance(parsed, dict) and "sections" in parsed:
                    return parsed
            except genai_errors.APIError as api_err:
                logger.warning("Gemini API error on %s: %s", model_name, api_err)
            except json.JSONDecodeError as json_err:
                logger.warning("Failed to parse Gemini JSON on %s: %s", model_name, json_err)
            except Exception as e:
                logger.warning("Unexpected error calling Gemini %s: %s", model_name, e)

        return None

    def _build_offline_adapted_lesson(
        self,
        topic_title: str,
        subject: str,
        topic_id: str,
        topic_meta: Dict[str, Any],
        rag_context: str,
        detail_level: str,
        strategy: str,
        pred_load: str,
        confidence: float,
        reason: str,
        signals_used: List[str]
    ) -> Dict[str, Any]:
        """Construct a high-quality offline adapted lesson grounded in curriculum data when Gemini is unavailable."""
        objectives = topic_meta.get("learningObjectives") or [
            f"Understand core principles of {topic_title}",
            f"Write and execute valid {subject.capitalize()} code",
            f"Debug common issues in {topic_title}"
        ]

        base_explanation = topic_meta.get("conceptExplanation") or topic_meta.get("description") or f"Learn the core fundamentals of {topic_title} in {subject}."
        code_sample = topic_meta.get("codeExample") or topic_meta.get("syntax") or f"// {topic_title} in {subject}\n"

        if subject == "python":
            default_code = f"# Exploring {topic_title}\ndata = [1, 2, 3, 4, 5]\nresult = [x * 2 for x in data]\nprint('Processed output:', result)\n"
            default_practice = {
                "prompt": f"Write a clean Python snippet demonstrating {topic_title}. Create a variable and print the output.",
                "starter_code": f"# Complete the solution for {topic_title}\nvalue = 10\n# Print value multiplied by 2\n",
                "expected_output": "20",
                "hint": "Use print(value * 2) to display the calculated result.",
                "solution": "value = 10\nprint(value * 2)"
            }
        elif subject == "cpp":
            default_code = f"#include <iostream>\n\nint main() {{\n    std::cout << \"Exploring {topic_title}\" << std::endl;\n    return 0;\n}}\n"
            default_practice = {
                "prompt": f"Complete the C++ program demonstrating {topic_title} by printing the message.",
                "starter_code": "#include <iostream>\n\nint main() {\n    // Output 'Ready'\n    return 0;\n}\n",
                "expected_output": "Ready",
                "hint": "Use std::cout << \"Ready\" << std::endl;",
                "solution": "#include <iostream>\n\nint main() {\n    std::cout << \"Ready\" << std::endl;\n    return 0;\n}"
            }
        elif subject == "java":
            default_code = f"public class Main {{\n    public static void main(String[] args) {{\n        System.out.println(\"Exploring {topic_title}\");\n    }}\n}}\n"
            default_practice = {
                "prompt": f"Complete the Java program for {topic_title}.",
                "starter_code": "public class Main {\n    public static void main(String[] args) {\n        // Print 'Done'\n    }\n}\n",
                "expected_output": "Done",
                "hint": "Use System.out.println(\"Done\");",
                "solution": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Done\");\n    }\n}"
            }
        else: # c
            default_code = f"#include <stdio.h>\n\nint main() {{\n    printf(\"Exploring {topic_title}\\n\");\n    return 0;\n}}\n"
            default_practice = {
                "prompt": f"Complete the C code for {topic_title}.",
                "starter_code": "#include <stdio.h>\n\nint main() {\n    // Print 'Success'\n    return 0;\n}\n",
                "expected_output": "Success",
                "hint": "Use printf(\"Success\\n\");",
                "solution": "#include <stdio.h>\n\nint main() {\n    printf(\"Success\\n\");\n    return 0;\n}"
            }

        effective_code = topic_meta.get("codeExample") or default_code

        # Build modular sections
        sections = []

        # 1. Intuition / Core Explanation
        if detail_level == "SIMPLIFIED":
            explanation_content = f"### 💡 What is {topic_title}?\n\n{base_explanation.split(chr(10))[0] if chr(10) in base_explanation else base_explanation}\n\n**The Big Idea:** Instead of memorizing syntax rules, focus on what the computer does step by step. Every instruction tells the system how to organize memory and transform data."
        elif detail_level == "DETAILED":
            explanation_content = f"### 🔬 Architectural Deep Dive: {topic_title}\n\n{base_explanation}\n\n**System Execution Model:**\nIn {subject.capitalize()}, operations execute through runtime state transitions. Variables reference allocated memory frames, and data evaluation adheres strictly to the language specification."
        else:
            explanation_content = f"### 📘 Conceptual Overview: {topic_title}\n\n{base_explanation}\n\n**Core Principles:**\n- Understand syntax structure and operational semantics.\n- Trace variable bindings and memory lifecycle.\n- Apply best practices for maintainable code."

        sections.append({
            "id": "core-intuition",
            "type": "explanation",
            "title": f"1. Conceptual Foundation: {topic_title}",
            "content": explanation_content,
            "importance": "primary"
        })

        # 2. Everyday Analogy
        sections.append({
            "id": "everyday-analogy",
            "type": "analogy",
            "title": "2. Everyday Analogy",
            "content": f"Think of **{topic_title}** like an organized postal sorting office or a clear assembly line:\n\n- **Input Items:** Raw materials arriving at the workstation.\n- **Processors:** Dedicated workers following precise recipe steps without ambiguity.\n- **Result:** A packaged product ready for delivery.\n\nJust like sorting parcels with explicit destination labels, {subject.capitalize()} processes instructions sequentially so every variable has an unambiguous address and state.",
            "importance": "primary"
        })

        # 3. Visual System Diagram
        sections.append({
            "id": "visual-flow",
            "type": "visual_diagram",
            "title": "3. Visual System Flow",
            "diagram_type": "ascii",
            "diagram_content": (
                f"+-----------------------------+       +-----------------------------+       +-----------------------------+\n"
                f"|    Input / Source Code      |  -->  |    Execution & Evaluation   |  -->  |    State / Console Result   |\n"
                f"|    ({subject} statements)   |       |    (runtime transformation) |       |    (verified output)        |\n"
                f"+-----------------------------+       +-----------------------------+       +-----------------------------+"
            ),
            "diagram_caption": f"Structural lifecycle of {topic_title} execution in {subject.capitalize()}.",
            "importance": "secondary"
        })

        # 4. Step-by-Step Breakdown
        sections.append({
            "id": "step-by-step-breakdown",
            "type": "step_by_step",
            "title": "4. Step-by-Step Walkthrough",
            "content": "Follow these foundational milestones to master the operational mechanics:",
            "steps": [
                {"step": 1, "title": "Identify the Core Purpose", "description": f"Clarify why {topic_title} is necessary and what problem it solves."},
                {"step": 2, "title": "Inspect Minimal Syntax", "description": f"Examine the simplest valid snippet without superfluous parameters."},
                {"step": 3, "title": "Trace Runtime Execution", "description": "Observe how values transition through memory addresses line by line."},
                {"step": 4, "title": "Verify Edge Cases", "description": "Confirm behavior with boundary inputs, empty collections, or type bounds."}
            ],
            "importance": "primary"
        })

        # 5. Code Example
        sections.append({
            "id": "worked-code-example",
            "type": "code_example",
            "title": "5. Runnable Code Demonstration",
            "language": subject,
            "code": effective_code,
            "code_explanation": f"This snippet demonstrates idiomatic {subject.capitalize()} implementation for {topic_title}.",
            "line_by_line": [
                {"line": "Initialization", "explanation": "Sets up required identifiers in local scope."},
                {"line": "Operation", "explanation": "Executes core computational logic."},
                {"line": "Output", "explanation": "Emits verified result to console standard output."}
            ],
            "importance": "primary"
        })

        # 6. Common Mistakes
        pitfalls = topic_meta.get("commonMistakes") or []
        mistake_items = []
        if pitfalls and isinstance(pitfalls, list):
            for p in pitfalls[:2]:
                if isinstance(p, dict):
                    mistake_items.append({
                        "mistake": p.get("mistake", "Syntax or typing mismatch"),
                        "why_wrong": p.get("whyWrong", p.get("explanation", "Causes runtime error or unexpected evaluation")),
                        "fix": p.get("fix", p.get("correctCode", "Use verified idiomatic syntax"))
                    })
        if not mistake_items:
            mistake_items = [
                {
                    "mistake": f"Confusing variable identity with value equality in {subject}",
                    "why_wrong": "Checking whether two variables reference the same address differs from checking equal value.",
                    "fix": "Use appropriate comparison operators according to language semantics."
                },
                {
                    "mistake": "Unchecked edge conditions (off-by-one or None/null dereference)",
                    "why_wrong": "Accessing undefined indices or references causes abrupt runtime termination.",
                    "fix": "Always guard boundary conditions before indexing or dereferencing."
                }
            ]

        sections.append({
            "id": "common-pitfalls",
            "type": "common_mistakes",
            "title": "6. Common Bugs & Pitfalls",
            "mistakes": mistake_items,
            "importance": "secondary"
        })

        # 7. Guided Practice Sandbox
        practice_payload = topic_meta.get("practice") or default_practice
        sections.append({
            "id": "guided-practice",
            "type": "guided_practice",
            "title": "7. Guided Hands-on Practice",
            "practice": {
                "prompt": practice_payload.get("prompt", f"Practice implementing {topic_title}."),
                "starter_code": practice_payload.get("starterCode", practice_payload.get("starter_code", default_practice["starter_code"])),
                "expected_output": practice_payload.get("expectedOutputMatcher", practice_payload.get("expected_output", default_practice["expected_output"])),
                "hint": practice_payload.get("hint", default_practice["hint"]),
                "solution": practice_payload.get("solution", default_practice["solution"])
            },
            "importance": "primary"
        })

        # 8. Knowledge Check Quiz
        quiz_data = topic_meta.get("quiz") or []
        questions = []
        if quiz_data and isinstance(quiz_data, list):
            for idx, q in enumerate(quiz_data[:2]):
                if isinstance(q, dict):
                    questions.append({
                        "id": q.get("id", f"kc-{idx+1}"),
                        "question": q.get("question", f"What is the key benefit of {topic_title}?"),
                        "options": q.get("options", ["Clear modularity", "Syntax overhead", "Platform locks", "None"]),
                        "correct_index": q.get("correctIndex", q.get("correct_index", 0)),
                        "explanation": q.get("explanation", "Adapted lessons clarify core concepts through structured milestones.")
                    })
        if not questions:
            questions = [
                {
                    "id": "kc-1",
                    "question": f"What is the primary architectural advantage of understanding {topic_title}?",
                    "options": [
                        "Enables predictable memory management and modular execution",
                        "Forces the compiler to bypass all type checks",
                        "Replaces the operating system runtime entirely",
                        "Disables debugging logs permanently"
                    ],
                    "correct_index": 0,
                    "explanation": f"Understanding {topic_title} gives you precise control over state management and runtime execution."
                },
                {
                    "id": "kc-2",
                    "question": f"When applying {topic_title} in production code, what is the recommended practice?",
                    "options": [
                        "Write monolithic scripts without unit tests",
                        "Validate boundaries, use idiomatic constructs, and write clean comments",
                        "Ignore runtime exceptions and suppress error handling",
                        "Avoid checking return codes or types"
                    ],
                    "correct_index": 1,
                    "explanation": "Defensive programming and boundary validation ensure high system reliability."
                }
            ]

        sections.append({
            "id": "knowledge-check",
            "type": "quiz",
            "title": "8. Knowledge Check",
            "questions": questions,
            "importance": "primary"
        })

        return {
            "title": f"Personalized Guide: {topic_title}",
            "subject": subject,
            "topic": topic_title,
            "topic_id": topic_id,
            "adaptation": {
                "strategy": strategy,
                "detail_level": detail_level.lower(),
                "cognitive_load": pred_load,
                "confidence": confidence,
                "reason": reason,
                "signals_used": signals_used
            },
            "learning_objectives": objectives,
            "introduction": f"Welcome to your tailored learning guide for **{topic_title}**. This edition is calibrated to your **{detail_level.capitalize()}** preference, delivering clear mental models, runnable examples, and targeted practice.",
            "sections": sections,
            "key_takeaways": [
                f"Mastered core conceptual primitives for {topic_title} in {subject.capitalize()}.",
                "Learned idiomatic implementation patterns and common pitfall avoidance.",
                "Reinforced understanding through hands-on sandbox execution and self-check."
            ],
            "next_step": f"Continue with the next module in {subject.capitalize()} or solidify mastery in the Coding Studio."
        }


adapted_lesson_service = AdaptedLessonService()
