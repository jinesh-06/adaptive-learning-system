"""Quiz Service: Generates, validates, caches, and grades 10-question lesson quizzes with adaptive feedback."""

import json
import logging
import random
import re
from typing import Dict, Any, List, Optional

from backend.services.state_store import state_store

logger = logging.getLogger(__name__)


def clean_snippet(code: str, max_lines: int = 6) -> str:
    if not code:
        return ""
    lines = [
        l for l in code.strip().split("\n")
        if l.strip() and not l.strip().startswith("//===") and not l.strip().startswith("#===")
    ]
    return "\n".join(lines[:max_lines]).strip()


def shuffle_options_with_correct(options: List[str], correct_opt: str, target_idx: int) -> tuple[List[str], int]:
    """Ensure options has 4 unique items and target_idx holds correct_opt."""
    distractors = [opt for opt in options if opt != correct_opt]
    while len(distractors) < 3:
        distractors.append(f"Alternative implementation variant {len(distractors) + 1}")
    distractors = distractors[:3]
    final_options = list(distractors)
    final_options.insert(target_idx, correct_opt)
    return final_options, target_idx


class QuizService:
    """Service providing 10 lesson-grounded quiz questions and AI adaptive feedback for every lesson."""

    def __init__(self):
        pass

    def validate_and_normalize_quiz(
        self,
        questions: List[Dict[str, Any]],
        topic_id: str,
        topic_title: str
    ) -> List[Dict[str, Any]]:
        """Validate and guarantee that questions has exactly 10 questions with 4 options each."""
        valid_list = []
        seen = set()

        for idx, q in enumerate(questions):
            if not isinstance(q, dict):
                continue
            q_text = (q.get("question") or q.get("question_text") or "").strip()
            if not q_text or q_text.lower() in seen:
                continue
            seen.add(q_text.lower())

            c_idx = q.get("correct_index") if "correct_index" in q else q.get("correctIndex", 0)
            if not isinstance(c_idx, int) or c_idx < 0 or c_idx > 3:
                c_idx = 0

            opts = q.get("options", [])
            if not isinstance(opts, list):
                opts = []
            opts = [str(o).strip() for o in opts if str(o).strip()]
            while len(opts) < 4:
                opts.append(f"Option {chr(65 + len(opts))}")
            opts = opts[:4]

            expl = q.get("explanation") or f"This is the verified correct answer for {topic_title}."
            diff = q.get("difficulty") or ("easy" if len(valid_list) < 3 else "medium" if len(valid_list) < 7 else "hard")
            if diff not in ("easy", "medium", "hard"):
                diff = "medium"

            valid_list.append({
                "id": f"q-{topic_id}-{len(valid_list) + 1}",
                "question": q_text,
                "options": opts,
                "correct_index": c_idx,
                "correctIndex": c_idx,
                "explanation": expl,
                "difficulty": diff
            })

            if len(valid_list) == 10:
                break

        # If fewer than 10, fill up to 10
        fallback_templates = [
            (f"What is a foundational mechanism behind {topic_title}?", f"Executes structured logic adhering to standard language mechanics.", ["Bypasses all type checks", "Disables memory management", "Forces unbuffered I/O"], "easy"),
            (f"Which principle is recommended when architecting solutions for {topic_title}?", f"Maintain clean boundary separation and predictable resource scoping.", ["Rely on silent error handling", "Disable compiler optimization", "Store transient state in global variables"], "medium"),
            (f"What is the primary debugging approach if {topic_title} behaves unexpectedly?", f"Trace variable bindings, bounds checking, and runtime flow.", ["Assume internal compiler fault", "Delete all assertions", "Remove type annotations"], "medium"),
            (f"How does {topic_title} enhance program robustness?", f"Ensures idiomatic, maintainable, and type-safe execution.", ["Eliminates all unit tests", "Replaces standard libraries", "Executes directly in hardware bios"], "hard"),
            (f"What is a key performance consideration when utilizing {topic_title}?", f"Minimize unnecessary memory allocations and redundant iterations.", ["Always use blocking sleeps", "Avoid utilizing local variables", "Disable stack execution"], "hard")
        ]
        fb_idx = 0
        while len(valid_list) < 10:
            tmpl_q, tmpl_ans, tmpl_dist, tmpl_diff = fallback_templates[fb_idx % len(fallback_templates)]
            target_idx = (len(valid_list) * 3 + 1) % 4
            opts, c_idx = shuffle_options_with_correct(tmpl_dist, tmpl_ans, target_idx)
            valid_list.append({
                "id": f"q-{topic_id}-{len(valid_list) + 1}",
                "question": tmpl_q,
                "options": opts,
                "correct_index": c_idx,
                "correctIndex": c_idx,
                "explanation": f"In {topic_title}, this represents standard best engineering practice.",
                "difficulty": tmpl_diff
            })
            fb_idx += 1

        return valid_list[:10]

    def generate_10_questions_offline(self, topic: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate exactly 10 questions grounded in the lesson content."""
        topic_id = topic.get("id", "top-unknown")
        topic_title = topic.get("title", "Topic Lesson")
        lang = (topic.get("language") or "python").lower()
        if "cpp" in topic_id:
            lang = "cpp"
        elif "java" in topic_id:
            lang = "java"
        elif "c-" in topic_id or "c_adv" in topic_id or "c_int" in topic_id:
            lang = "c"

        lang_display = "C++" if lang == "cpp" else "Java" if lang == "java" else "C" if lang == "c" else "Python"

        raw_quiz = topic.get("quiz", [])
        valid_existing = []
        seen = set()

        for idx, q in enumerate(raw_quiz):
            if not isinstance(q, dict):
                continue
            q_text = (q.get("question") or q.get("question_text") or "").strip()
            if not q_text or q_text.lower() in seen:
                continue
            seen.add(q_text.lower())

            c_idx = q.get("correct_index") if "correct_index" in q else q.get("correctIndex", 0)
            if not isinstance(c_idx, int) or c_idx < 0 or c_idx > 3:
                c_idx = 0

            opts = q.get("options", [])
            if not isinstance(opts, list):
                opts = []
            opts = [str(o).strip() for o in opts if str(o).strip()]
            while len(opts) < 4:
                opts.append(f"Alternative option {len(opts) + 1}")
            opts = opts[:4]

            expl = q.get("explanation") or f"This is the verified correct principle for {topic_title}."
            diff = q.get("difficulty") or ("easy" if idx == 0 else "medium" if idx < 3 else "hard")
            if diff not in ("easy", "medium", "hard"):
                diff = "medium"

            valid_existing.append({
                "id": f"q-{topic_id}-{len(valid_existing) + 1}",
                "question": q_text,
                "options": opts,
                "correct_index": c_idx,
                "correctIndex": c_idx,
                "explanation": expl,
                "difficulty": diff
            })

        if len(valid_existing) >= 10:
            return valid_existing[:10]

        # Extract lesson materials
        objectives = [o.strip() for o in topic.get("learningObjectives", []) if isinstance(o, str) and len(o.strip()) > 8]
        concept_expl = topic.get("conceptExplanation", "")
        if isinstance(concept_expl, list):
            concept_expl = " ".join(str(x) for x in concept_expl)
        elif not isinstance(concept_expl, str):
            concept_expl = str(concept_expl or "")

        simple_ex = topic.get("simpleExample", {})
        simple_ex = simple_ex if isinstance(simple_ex, dict) else {}
        syntax_str = topic.get("syntax", "")
        code_ex = topic.get("codeExample", "")
        expected_out = topic.get("expectedOutput", "")
        steps = [s.strip() for s in topic.get("stepByStep", []) if isinstance(s, str) and len(s.strip()) > 8]
        mistakes = topic.get("commonMistakes", []) or []
        real_world = topic.get("realWorldExample", {})
        practice = topic.get("practice", {})
        summary_items = [s.strip() for s in topic.get("summary", []) if isinstance(s, str) and len(s.strip()) > 8]

        code_snippet = clean_snippet(code_ex or simple_ex.get("code", ""))

        generated = list(valid_existing)

        def add_q(q_text: str, correct_opt: str, distractors: List[str], expl: str, diff: str):
            if len(generated) >= 10:
                return
            if not q_text or q_text.lower() in seen:
                return
            seen.add(q_text.lower())
            target_idx = (len(generated) * 3 + 1) % 4
            opts, c_idx = shuffle_options_with_correct(distractors, correct_opt, target_idx)
            generated.append({
                "id": f"q-{topic_id}-{len(generated) + 1}",
                "question": q_text,
                "options": opts,
                "correct_index": c_idx,
                "correctIndex": c_idx,
                "explanation": expl,
                "difficulty": diff
            })

        # 1. Learning Objectives
        for obj in objectives:
            if len(generated) >= 10:
                break
            q = f"Which statement best describes mastering the concept: '{obj}'?"
            correct = f"Demonstrates proper understanding and execution of {topic_title} in {lang_display}."
            distractors = [
                f"Restricts {topic_title} to legacy environment compilers only",
                f"Disables all runtime exception handling and bounds checks",
                f"Requires rewriting the host operating system kernel"
            ]
            add_q(q, correct, distractors, f"Mastering this objective verifies core competence in {topic_title}.", "easy")

        # 2. Syntax & Conventions
        if syntax_str and len(generated) < 10:
            clean_syn = clean_snippet(syntax_str, max_lines=2)
            q = f"Which syntax convention applies to {topic_title} in {lang_display}?"
            correct = f"Standard syntax: {clean_syn[:80]}..." if len(clean_syn) > 15 else f"Follows standard {lang_display} syntax rules."
            distractors = [
                "Requires omitting return types and parameter brackets",
                "Only legal inside assembly __asm blocks",
                "Can only be declared inside global header namespaces"
            ]
            add_q(q, correct, distractors, "Following verified syntax ensures proper parser and compiler resolution.", "medium")

        # 3. Code Output Prediction
        if (expected_out or code_snippet) and len(generated) < 10:
            clean_out = str(expected_out).strip().split("\n")[0][:60] if expected_out else f"Executes {topic_title} successfully"
            if code_snippet and len(code_snippet) < 140:
                q = f"What is the expected result of running this {lang_display} code for {topic_title}?\n\n{code_snippet}"
            else:
                q = f"What is the expected output when the canonical example for {topic_title} executes?"
            correct = clean_out if len(clean_out) > 2 else f"Produces expected validated results for {topic_title}"
            distractors = [
                "Compilation Error / SyntaxError",
                "Segmentation fault or NullPointerException",
                "Infinite loop without producing output"
            ]
            add_q(q, correct, distractors, f"Executing this code yields '{correct}'.", "medium")

        # 4. Common Mistakes & Pitfalls
        for m in mistakes:
            if len(generated) >= 10:
                break
            if isinstance(m, dict):
                m_title = m.get("mistake", "")
                m_expl = m.get("explanation", "")
                m_fix = m.get("correction", "")
                m_code = clean_snippet(m.get("codeSnippet", ""), max_lines=3)
            else:
                m_title = str(m)
                m_expl = f"Common bug regarding {topic_title}."
                m_fix = "Follow established best practices."
                m_code = ""

            if m_code:
                q = f"In {topic_title}, what issue is present in this snippet?\n\n{m_code}"
            else:
                q = f"Which common pitfall must developers avoid when implementing {topic_title}?"
            correct = f"{m_title}: {m_expl}"[:140] if m_expl else f"Pitfall: {m_fix}"
            distractors = [
                "The code executes twice as fast but disables type checks",
                "Compiler silently fixes the statement without emitting diagnostics",
                "Forces the process into a permanent background daemon"
            ]
            add_q(q, correct, distractors, f"{m_fix}. {m_expl}", "hard")

        # 5. Real-World Application
        if real_world and len(generated) < 10:
            if isinstance(real_world, dict):
                scenario = real_world.get("scenario", "Production Systems")
                rw_expl = real_world.get("explanation", "")
            else:
                scenario = "Production Systems"
                rw_expl = str(real_world)
            q = f"How is {topic_title} utilized in practical production systems ({scenario})?"
            correct = rw_expl[:140] if rw_expl else f"Provides high reliability and structured data flow for {scenario}."
            distractors = [
                "Removes the necessity for test suites and memory budgeting",
                "Bypasses network firewall policies completely",
                "Requires converting all memory into uncompressed raw bytes"
            ]
            add_q(q, correct, distractors, f"In {scenario}, {rw_expl or 'this concept delivers robust system execution.'}", "hard")

        # 6. Step-by-Step Runtime Mechanics
        if steps and len(generated) < 10:
            for s in steps[:2]:
                if len(generated) >= 10:
                    break
                q = f"During the runtime execution of {topic_title}, which step occurs?"
                correct = s[:130]
                distractors = [
                    "Memory registers are cleared and execution resets to entry",
                    "The runtime pauses execution to query remote cloud servers",
                    "CPU enters low power sleep mode until interrupt"
                ]
                add_q(q, correct, distractors, f"Execution follows this verified step: {s}.", "medium")

        # 7. Key Takeaways
        for sm in summary_items:
            if len(generated) >= 10:
                break
            q = f"Which principle is a fundamental key takeaway for {topic_title}?"
            correct = sm[:130]
            distractors = [
                f"Disable compiler and interpreter safety flags for {topic_title}",
                f"{topic_title} should be avoided in production software",
                "Always prefer hardcoded absolute memory addresses"
            ]
            add_q(q, correct, distractors, f"Essential rule: {sm}.", "hard")

        # 8. Practice Challenge
        if practice and len(generated) < 10:
            if isinstance(practice, dict):
                prompt = practice.get("prompt", "")
                hint = practice.get("hint", "")
            else:
                prompt = str(practice)
                hint = ""
            if prompt:
                q = f"When approaching the practice problem '{prompt[:90]}...', what is the recommended strategy?"
                correct = hint[:130] if hint else f"Apply the idiomatic {lang_display} solution design for {topic_title}."
                distractors = [
                    "Return hardcoded dummy values without implementing logic",
                    "Write an infinite loop that ignores input parameters",
                    "Bypass the type system using unsafe casts"
                ]
                add_q(q, correct, distractors, f"Guidance: {hint or 'Implement structured logic matching problem specifications.'}", "hard")

        # 9. Concept Explanation Sentences
        sentences = [
            s.strip() for s in re.split(r'[.\n]+', concept_expl)
            if len(s.strip()) > 20 and not s.strip().startswith("#") and not s.strip().startswith("```")
        ]
        for cs in sentences:
            if len(generated) >= 10:
                break
            q = f"Regarding {topic_title} in {lang_display}, which statement is accurate?"
            correct = cs[:130]
            distractors = [
                f"{topic_title} is completely deprecated in modern {lang_display}",
                "Executes without sandbox memory protection",
                "Causes mandatory process restart upon invocation"
            ]
            add_q(q, correct, distractors, f"Core principle: {cs}.", "easy" if len(generated) < 3 else "medium")

        return self.validate_and_normalize_quiz(generated, topic_id, topic_title)

    def generate_10_questions_ai(self, topic: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Attempt to generate 10 questions using Gemini LLM if quota and network permit."""
        try:
            from llm.config import get_gemini_client, get_model_name
            from google.genai import types

            client = get_gemini_client()
            model = get_model_name()

            topic_id = topic.get("id", "top-unknown")
            topic_title = topic.get("title", "Topic Lesson")
            lang = topic.get("language", "python")
            prompt = (
                f"You are an expert computer science curriculum designer. Generate exactly 10 multiple-choice quiz questions for the lesson below.\n"
                f"Topic: {topic_title} (Language/Domain: {lang}, ID: {topic_id})\n"
                f"Short Description: {topic.get('shortDescription', '')}\n"
                f"Concept Explanation: {str(topic.get('conceptExplanation', ''))[:500]}\n"
                f"Code Example: {str(topic.get('codeExample', ''))[:300]}\n"
                f"Expected Output: {str(topic.get('expectedOutput', ''))[:100]}\n\n"
                f"REQUIREMENTS:\n"
                f"1. Generate EXACTLY 10 questions.\n"
                f"2. Every question must have EXACTLY 4 options (A, B, C, D) and exactly ONE correct answer (correct_index 0, 1, 2, or 3).\n"
                f"3. Cover difficulty levels: 3 easy, 4 medium, 3 hard.\n"
                f"4. Include conceptual questions, code output prediction, syntax checks, bug finding, and practical applications.\n"
                f"5. Provide a clear, educational explanation for each question.\n"
                f"6. Return strictly valid JSON array of 10 question objects matching this schema:\n"
                f"[\n"
                f'  {{"id": "q-{topic_id}-1", "question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "explanation": "...", "difficulty": "easy"}}\n'
                f"]"
            )

            resp = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )

            if resp and resp.text:
                data = json.loads(resp.text)
                q_list = data if isinstance(data, list) else data.get("questions", [])
                if isinstance(q_list, list) and len(q_list) >= 10:
                    validated = self.validate_and_normalize_quiz(q_list, topic_id, topic_title)
                    if len(validated) == 10:
                        logger.info("Successfully generated 10 quiz questions via Gemini for %s", topic_id)
                        return validated
        except Exception as e:
            logger.warning("Gemini AI quiz generation failed or rate limited (%s). Using lesson-grounded fallback.", e)

        return None

    def get_quiz_for_topic(self, topic_id: str, force_regenerate: bool = False) -> Dict[str, Any]:
        """Retrieve or generate exactly 10 questions for the topic with caching."""
        # 1. Check persistent SQLite cache unless force_regenerate
        if not force_regenerate:
            cached = state_store.get_generated_quiz(topic_id)
            if cached and isinstance(cached.get("questions"), list) and len(cached["questions"]) == 10:
                return cached

        # 2. Look up topic in curriculum
        from backend.services.curriculum_service import curriculum_service
        topic = curriculum_service.get_topic_detail(topic_id)
        if not topic:
            # Check platform data
            for t in curriculum_service.data.get("topics", []):
                if t.get("id") == topic_id:
                    topic = t
                    break

        if not topic:
            topic = {
                "id": topic_id,
                "title": topic_id.replace("top-", "").replace("-", " ").title(),
                "language": "python",
                "shortDescription": f"Master the core architectural mechanics of {topic_id}."
            }

        topic_title = topic.get("title", topic_id)

        # 3. Check if topic already has 10 rich questions
        existing_quiz = topic.get("quiz", [])
        questions = None
        if isinstance(existing_quiz, list) and len(existing_quiz) == 10:
            questions = self.validate_and_normalize_quiz(existing_quiz, topic_id, topic_title)

        # 4. Try AI generation if force_regenerate or missing
        if not questions and force_regenerate:
            questions = self.generate_10_questions_ai(topic)

        # 5. Lesson-grounded generator fallback
        if not questions or len(questions) != 10:
            questions = self.generate_10_questions_offline(topic)

        quiz_data = {
            "topic_id": topic_id,
            "title": f"Mini Quiz: {topic_title}",
            "target_difficulty": "standard",
            "adaptive_note": "Standard calibrated 10-question quiz based on your active mastery.",
            "questions": questions
        }

        # 6. Cache in SQLite
        state_store.save_generated_quiz(topic_id, quiz_data)

        return quiz_data

    def generate_adaptive_feedback(
        self,
        topic_title: str,
        topic_id: str,
        questions: List[Dict[str, Any]],
        review: List[Dict[str, Any]],
        score: float,
        percentage: int,
        ml_eval: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate comprehensive personalized adaptive feedback using learner results and AI/ML signals."""
        missed_questions = [r for r in review if not r.get("is_correct")]
        passed = percentage >= 70

        # Extract specific concept areas from missed questions
        missed_concepts = []
        for r in missed_questions:
            q_text = r.get("question", "")
            # Extract concept from question or explanation
            if ":" in q_text:
                missed_concepts.append(q_text.split(":")[0].strip())
            elif "?" in q_text:
                missed_concepts.append(q_text.split("?")[0].strip()[:60])
            else:
                missed_concepts.append(q_text[:50])

        if not missed_concepts:
            missed_concepts = [f"Mastery verified for {topic_title} checkpoints"]

        # Determine suggested adaptation mode
        cognitive_load = ml_eval.get("cognitive_load", "MEDIUM")
        if percentage < 60:
            recommended_mode = "SIMPLIFIED"
            mode_rationale = "We suggest switching to the Simplified explanation mode for everyday analogies and step-by-step breakdowns."
        elif percentage >= 90:
            recommended_mode = "DETAILED"
            mode_rationale = "Exceptional performance! We recommend the Detailed mode for deep memory and execution mechanics."
        else:
            recommended_mode = "STANDARD"
            mode_rationale = "Good foundation. Continue at standard pace with targeted revision of missed questions."

        # Attempt Gemini personalized feedback if available
        ai_advice = None
        try:
            from llm.config import get_gemini_client, get_model_name
            from google.genai import types

            client = get_gemini_client()
            model = get_model_name()
            prompt = (
                f"You are an empathetic adaptive tutor. A learner just scored {percentage}% on a 10-question quiz for '{topic_title}'.\n"
                f"Missed {len(missed_questions)} out of 10 questions:\n"
                + "\n".join(f"- Question: {m.get('question')} | User Choice: {m.get('user_choice')} | Correct: {m.get('correct_index')} | Expl: {m.get('explanation')}" for m in missed_questions[:3])
                + f"\nGive 2 short paragraphs of encouraging, specific feedback: (1) Diagnosing the key misconception, (2) 2 specific actionable revision steps."
            )
            resp = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.3)
            )
            if resp and resp.text:
                ai_advice = resp.text.strip()
        except Exception:
            pass

        if not ai_advice:
            if passed:
                ai_advice = (
                    f"Great job mastering {topic_title}! You answered {len(questions) - len(missed_questions)} of {len(questions)} questions correctly. "
                    f"Your grasp on core concepts is solid. Review any missed checkpoints to solidify your understanding before proceeding."
                )
            else:
                ai_advice = (
                    f"You scored {percentage}% ({len(questions) - len(missed_questions)} of {len(questions)} correct). "
                    f"Focus your revision on: {', '.join(missed_concepts[:2])}. "
                    f"Try exploring the everyday analogy or interactive code example to clarify these mechanics."
                )

        return {
            "cognitive_level": ml_eval.get("cognitive_level", "MEDIUM"),
            "cognitive_load": cognitive_load,
            "confidence": ml_eval.get("confidence", 0.88),
            "score": percentage,
            "passed": passed,
            "personalized_summary": ai_advice,
            "recommended_mode": recommended_mode,
            "mode_rationale": mode_rationale,
            "revision_concepts": missed_concepts[:3],
            "recommended_action": "Switch to Simplified Analogy" if recommended_mode == "SIMPLIFIED" else "Explore Deep Architectural Breakdown" if recommended_mode == "DETAILED" else "Proceed to Next Lesson",
            "suggested_actions": [
                {"action": "MODE_SWITCH", "mode": recommended_mode, "label": f"Switch to {recommended_mode.title()} Mode"},
                {"action": "SANDBOX_PRACTICE", "label": "Practice in Interactive Sandbox"},
                {"action": "RETAKE_QUIZ", "label": "Retake 10-Question Quiz"}
            ],
            "reason": ml_eval.get("reason", "Adaptive evaluation based on quiz checkpoint performance."),
            "contributing_factors": ml_eval.get("contributing_factors", ["10-Question quiz score analysis"])
        }


quiz_service = QuizService()
