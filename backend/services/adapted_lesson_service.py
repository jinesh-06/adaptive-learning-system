"""Adapted Lesson Service: Personalization engine & structured AI lesson generation."""

import json
import os
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

    def _diagnose_concept_from_question(self, q_data: Dict[str, Any], topic_id: str, topic_meta: Dict[str, Any]) -> Dict[str, Any]:
        """Classify question into concept key, human title, and error category based on question/explanation semantics."""
        q_text = (q_data.get("question") or "").strip()
        explanation = (q_data.get("explanation") or "").strip()
        combined = f"{q_text} {explanation}".lower()

        # 1. Boundary conditions & range stop limits / off-by-one errors
        if any(k in combined for k in ("range(", "stop value", "index", "bounds", "slice", "off-by-one", "fencepost", "last index", "len(", "out of range")):
            concept_key = "boundary_conditions_and_indexing"
            title = "Boundary Conditions & Range Stop Limits"
            category = "boundary_condition_error"
            remediation_focus = "Emphasize boundary-safe ranges, zero-based indexing, and exclusive stop values using execution trace tables."

        # 2. Loop termination, infinite loops, and break/continue control flow
        elif any(k in combined for k in ("while ", "while(", "termination", "infinite loop", "break", "continue", "sentinel", "condition-driven", "loop condition")):
            concept_key = "loop_termination_and_control_flow"
            title = "Loop Termination & Control Flow Guarantees"
            category = "control_flow_error"
            remediation_focus = "Focus on loop condition update guarantees, sentinel checks, and early exit control flow."

        # 3. Variable scoping, lifetime, and state mutability
        elif any(k in combined for k in ("variable", "assignment", "scope", "local", "global", "shadowing", "reassignment", "mutable", "immutable")):
            concept_key = "variable_scope_and_state"
            title = "Variable Scoping & State Mutability"
            category = "conceptual_misunderstanding"
            remediation_focus = "Clarify identifier scoping frames, reference binding vs value copying, and state persistence."

        # 4. Operator precedence, evaluation order, and type coercion
        elif any(k in combined for k in ("precedence", "operator", "division", "modulo", "//", "%", "bitwise", "logical and", "logical or", "truthy", "falsy")):
            concept_key = "operator_precedence_and_evaluation"
            title = "Operator Semantics & Evaluation Precedence"
            category = "syntax_or_operator_confusion"
            remediation_focus = "Break down operator evaluation precedence orders and type conversion semantics."

        # 5. Pointer addressing & dereferencing safety (C / C++)
        elif any(k in combined for k in ("pointer", "address-of", "dereference", "*ptr", "&var", "null pointer", "segmentation", "segfault")):
            concept_key = "pointer_addressing_and_dereference"
            title = "Pointer Addressing & Dereferencing Safety"
            category = "resource_management_error"
            remediation_focus = "Trace memory addresses, address-of operators, and safe dereferencing guards."

        # 6. Dynamic memory management & lifecycle (C / C++)
        elif any(k in combined for k in ("malloc", "free", "heap", "memory leak", "sizeof", "calloc", "realloc", "dangling")):
            concept_key = "memory_allocation_and_lifecycle"
            title = "Dynamic Memory Allocation & Lifecycle"
            category = "resource_management_error"
            remediation_focus = "Emphasize heap allocation checks, buffer boundaries, and paired deallocation."

        # 7. Recursion invariants and call stack depth
        elif any(k in combined for k in ("recursion", "recursive", "base case", "call stack", "stack overflow")):
            concept_key = "recursion_and_call_stack"
            title = "Recursion Invariants & Call Stack Depth"
            category = "control_flow_error"
            remediation_focus = "Trace recursive frame stacking and verify guaranteed base case termination."

        # 8. Object-oriented concepts and inheritance
        elif any(k in combined for k in ("class", "object", "inheritance", "polymorphism", "encapsulation", "self", "this", "constructor", "method")):
            concept_key = "oop_and_inheritance"
            title = "Object Encapsulation & Inheritance"
            category = "conceptual_misunderstanding"
            remediation_focus = "Clarify class blueprints, instance state encapsulation, and method dispatch."

        # 9. Fallback concept extraction from question title / topic
        else:
            concept_key = "core_topic_mechanics"
            title = f"{topic_meta.get('title', topic_id)} Mechanics"
            category = "conceptual_misunderstanding"
            remediation_focus = f"Step-by-step conceptual walkthrough of {topic_meta.get('title', topic_id)}."

        return {
            "concept_key": concept_key,
            "title": title,
            "category": category,
            "remediation_focus": remediation_focus,
            "question_id": str(q_data.get("id", "")),
            "question": q_text,
            "user_choice": q_data.get("user_choice"),
            "correct_index": q_data.get("correct_index"),
            "explanation": explanation
        }

    def diagnose_student_learning_evidence(
        self,
        user_id: str,
        topic_id: str,
        topic_meta: Dict[str, Any],
        ml_eval: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze actual saved quiz attempts for the authenticated student to identify knowledge gaps,
        error patterns, trajectory, and determine genuine pedagogical adaptation.
        """
        safe_user_id = str(user_id or "guest-learner").strip() or "guest-learner"
        topic_title = topic_meta.get("title") or topic_id

        attempts = state_store.get_quiz_attempts(safe_user_id, topic_id)
        if not attempts:
            return {
                "has_evidence": False,
                "strategy": "baseline_orientation",
                "reason": f"Baseline orientation: No quiz attempts recorded yet for this topic. Foundational lesson provided with diagnostic checkpoints.",
                "signals_used": [
                    "Baseline pedagogical orientation",
                    "Calibrated introductory pacing"
                ],
                "attempt_count": 0,
                "latest_score": None,
                "score_trend": "none",
                "diagnosed_gaps": [],
                "target_concepts": [topic_title],
                "specific_learning_gaps": [],
                "mastery_tier": "unassessed",
                "quiz_performance_summary": {
                    "attempt_count": 0,
                    "latest_score": None,
                    "score_trend": "none",
                    "missed_count": 0
                }
            }

        latest_attempt = attempts[0]
        latest_score = float(latest_attempt.get("percentage") if latest_attempt.get("percentage") is not None else 0.0)
        latest_correct = int(latest_attempt.get("correct_count", 0))
        latest_total = int(latest_attempt.get("total_questions", 10))

        # Parse review_json of latest attempt to extract missed questions
        raw_review = latest_attempt.get("review_json")
        review_items: List[Dict[str, Any]] = []
        if raw_review:
            try:
                review_items = json.loads(raw_review) if isinstance(raw_review, str) else raw_review
            except Exception:
                review_items = []

        missed_questions = [q for q in review_items if not q.get("is_correct")]

        diagnosed_gaps: List[Dict[str, Any]] = []
        seen_concepts = set()
        for q in missed_questions:
            c_info = self._diagnose_concept_from_question(q, topic_id, topic_meta)
            if c_info["concept_key"] not in seen_concepts:
                seen_concepts.add(c_info["concept_key"])
                diagnosed_gaps.append(c_info)

        # Inspect previous attempts to detect repeat errors and trend
        score_trend = "initial_attempt"
        repeated_concepts: List[Dict[str, Any]] = []
        prev_score = None

        if len(attempts) > 1:
            prev_attempt = attempts[1]
            prev_score = float(prev_attempt.get("percentage") if prev_attempt.get("percentage") is not None else 0.0)
            if latest_score >= prev_score + 15:
                score_trend = "improving"
            elif latest_score <= prev_score - 15:
                score_trend = "regressing"
            else:
                score_trend = "steady"

            prev_raw_review = prev_attempt.get("review_json")
            prev_review_items: List[Dict[str, Any]] = []
            if prev_raw_review:
                try:
                    prev_review_items = json.loads(prev_raw_review) if isinstance(prev_raw_review, str) else prev_raw_review
                except Exception:
                    prev_review_items = []

            prev_missed = [q for q in prev_review_items if not q.get("is_correct")]
            prev_concepts = {self._diagnose_concept_from_question(q, topic_id, topic_meta)["concept_key"] for q in prev_missed}
            repeated_concepts = [gap for gap in diagnosed_gaps if gap["concept_key"] in prev_concepts]

        has_repeated_struggle = len(repeated_concepts) > 0 and latest_score < 70

        # Assess whether assessment evidence is adequate for mastery progression (minimum 5 questions)
        has_adequate_evidence = latest_total >= 5

        # Concept-specific rationale focus mapping
        CONCEPT_FOCUS_DESCRIPTIONS = {
            "boundary_conditions_and_indexing": "boundary-safe iteration, zero-based indexing, and range stop limits with execution trace tables and targeted practice",
            "loop_termination_and_control_flow": "loop invariants, condition update guarantees, and sentinel checks with execution trace tables and targeted practice",
            "variable_scope_and_state": "local versus global scoping frames, identifier resolution, and state mutability with trace diagrams and targeted practice",
            "operator_precedence_and_evaluation": "operator evaluation precedence, type coercion, and expression semantics with step-by-step trace tables and targeted practice",
            "pointer_addressing_and_dereference": "memory address scoping, pointer initialization, and defensive NULL dereference guards with memory diagrams and targeted practice",
            "memory_allocation_and_lifecycle": "dynamic heap allocation, buffer boundaries, and paired deallocation with memory lifecycle diagrams and targeted practice",
            "recursion_and_call_stack": "recursion base case invariants, call stack frames, and termination guarantees with recursive call tree diagrams and targeted practice",
            "oop_and_inheritance": "class encapsulation, instance state isolation, and method dispatch mechanics with object model diagrams and targeted practice",
            "core_topic_mechanics": "core conceptual foundations, syntax structure, and standard language mechanics with worked examples and guided practice"
        }

        # Pedagogical Strategy Selection
        if latest_score >= 90 and has_adequate_evidence and not has_repeated_struggle:
            strategy = "advanced_mastery_extension"
            reason = f"Personalized for you: You demonstrated high mastery ({latest_score:.0f}%) on {topic_title}. This adapted lesson expands beyond basics into low-level runtime mechanics, compiler optimizations, and advanced algorithmic patterns."
            target_concepts = ["advanced_runtime_mechanics", "edge_cases_and_optimizations"]
        elif has_repeated_struggle:
            strategy = "deep_remedial_scaffolding"
            rep_titles = [g["title"] for g in repeated_concepts]
            rep_key = repeated_concepts[0].get("concept_key", "core_topic_mechanics")
            rep_focus = CONCEPT_FOCUS_DESCRIPTIONS.get(rep_key, "micro-step trace tables and guided remedial practice")
            reason = f"Personalized for you: Recent quiz attempts show repeated difficulty with {', '.join(rep_titles[:2])}. This adapted lesson provides {rep_focus}."
            target_concepts = [g["concept_key"] for g in repeated_concepts]
        elif score_trend == "improving" and latest_score >= 70:
            strategy = "progress_reinforcement"
            lead_gap = diagnosed_gaps[0]["title"] if diagnosed_gaps else "edge cases"
            lead_key = diagnosed_gaps[0].get("concept_key", "core_topic_mechanics") if diagnosed_gaps else "core_topic_mechanics"
            lead_focus = CONCEPT_FOCUS_DESCRIPTIONS.get(lead_key, "practical application and edge case reinforcement")
            reason = f"Personalized for you: Excellent progress! Your score improved from {prev_score:.0f}% to {latest_score:.0f}%. This adapted lesson reinforces {lead_focus} to cement your mastery."
            target_concepts = [g["concept_key"] for g in diagnosed_gaps] or [topic_title]
        elif diagnosed_gaps and latest_score < 70:
            strategy = "targeted_concept_revision"
            gap_summary = ", ".join([g["title"] for g in diagnosed_gaps[:2]])
            lead_key = diagnosed_gaps[0].get("concept_key", "core_topic_mechanics")
            focus_desc = CONCEPT_FOCUS_DESCRIPTIONS.get(lead_key, f"targeted instruction and guided practice for {gap_summary}")
            reason = f"Personalized for you: On your recent quiz (score {latest_score:.0f}%), you missed questions on {gap_summary}. This adapted lesson emphasizes {focus_desc}."
            target_concepts = [g["concept_key"] for g in diagnosed_gaps]
        elif latest_score >= 90 and not has_adequate_evidence:
            strategy = "balanced_standard"
            reason = f"Personalized for you: Good initial performance ({latest_score:.0f}%), but comprehensive assessment evidence across full checkpoints is required before unlocking advanced mastery extension."
            target_concepts = [topic_title]
        else:
            strategy = "balanced_standard"
            reason = f"Personalized for you: Solid understanding demonstrated ({latest_score:.0f}%). Balanced review reinforcing edge cases before advancing."
            target_concepts = [topic_title]

        signals_used = [
            f"Assessment accuracy: {latest_score:.0f}% ({latest_correct}/{latest_total} correct)",
            f"Quiz attempt history: {len(attempts)} attempt(s) (trend: {score_trend})"
        ]
        if diagnosed_gaps:
            signals_used.append(f"Diagnosed knowledge gaps: {', '.join([g['title'] for g in diagnosed_gaps[:2]])}")
        if repeated_concepts:
            signals_used.append(f"Repeated error pattern: {', '.join([g['title'] for g in repeated_concepts[:2]])}")
        if ml_eval and ml_eval.get("cognitive_load"):
            signals_used.append(f"Cognitive load evaluated: {ml_eval['cognitive_load']}")

        specific_learning_gaps = [g["title"] for g in diagnosed_gaps]

        return {
            "has_evidence": True,
            "strategy": strategy,
            "reason": reason,
            "signals_used": signals_used,
            "attempt_count": len(attempts),
            "latest_score": latest_score,
            "score_trend": score_trend,
            "diagnosed_gaps": diagnosed_gaps,
            "repeated_concepts": repeated_concepts,
            "target_concepts": target_concepts,
            "specific_learning_gaps": specific_learning_gaps,
            "mastery_tier": "mastered" if latest_score >= 90 and has_adequate_evidence else "competent" if latest_score >= 70 else "struggling",
            "quiz_performance_summary": {
                "attempt_count": len(attempts),
                "latest_score": latest_score,
                "score_trend": score_trend,
                "missed_count": len(missed_questions),
                "repeated_errors_count": len(repeated_concepts)
            }
        }

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
        # Verify whether any newer quiz attempt exists since the cache was recorded
        if not force_refresh:
            cached = state_store.get_adapted_lesson(safe_user_id, topic_id, normalized_mode)
            if cached and cached.get("lesson_data"):
                cached_at = cached.get("created_at")
                attempts = state_store.get_quiz_attempts(safe_user_id, topic_id)
                is_stale = False
                if attempts and cached_at:
                    latest_attempt_at = attempts[0].get("created_at")
                    if latest_attempt_at and str(latest_attempt_at) > str(cached_at):
                        is_stale = True
                if not is_stale:
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

        # Extract model-compatible cognitive features from SQLite telemetry/quiz records
        extracted_features = state_store.extract_cognitive_features(safe_user_id, topic_id)

        # Build ml_input starting from extracted features (strictly preserving FEATURE_COLUMNS order)
        ml_input = {
            "time_spent_minutes": extracted_features["time_spent_minutes"],
            "scroll_speed": extracted_features["scroll_speed"],
            "rereads": extracted_features["rereads"],
            "backtracking": extracted_features["backtracking"],
            "quiz_attempts": extracted_features["quiz_attempts"],
            "hesitation_time_seconds": extracted_features["hesitation_time_seconds"],
            "accuracy": extracted_features["accuracy"],
        }

        # Allow explicit caller-provided telemetry signals to take precedence if supplied
        if telemetry_signals:
            for feature_col in ("time_spent_minutes", "scroll_speed", "rereads", "backtracking", "quiz_attempts", "hesitation_time_seconds", "accuracy"):
                if feature_col in telemetry_signals and telemetry_signals[feature_col] is not None:
                    try:
                        ml_input[feature_col] = float(telemetry_signals[feature_col]) if feature_col not in ("rereads", "backtracking", "quiz_attempts") else int(telemetry_signals[feature_col])
                    except (ValueError, TypeError):
                        pass

            # Legacy / alias parameter handling from API clients
            if "recentQuizAccuracy" in telemetry_signals and "accuracy" not in telemetry_signals:
                try:
                    ml_input["accuracy"] = float(telemetry_signals["recentQuizAccuracy"])
                except (ValueError, TypeError):
                    pass
            if "timeSpentSeconds" in telemetry_signals and "time_spent_minutes" not in telemetry_signals:
                try:
                    ml_input["time_spent_minutes"] = round(float(telemetry_signals["timeSpentSeconds"]) / 60.0, 2)
                except (ValueError, TypeError):
                    pass
            if "codingErrorCount" in telemetry_signals and "backtracking" not in telemetry_signals:
                try:
                    ml_input["backtracking"] = int(telemetry_signals["codingErrorCount"])
                except (ValueError, TypeError):
                    pass

        # Evaluate Cognitive Load via ML model
        ml_eval = ml_service.evaluate(ml_input)
        pred_load = ml_eval.get("cognitive_load", "MEDIUM")
        confidence = ml_eval.get("confidence", 0.85)

        # 4. Diagnose student-specific learning evidence from saved quiz attempts
        diagnosis = self.diagnose_student_learning_evidence(safe_user_id, topic_id, topic_meta, ml_eval)

        # Genuine Pedagogical Strategy Selection
        strategy = diagnosis["strategy"]
        reason = diagnosis["reason"]
        signals_used = list(diagnosis["signals_used"])

        if telemetry_signals.get("codingErrorCount"):
            signals_used.append(f"Code sandbox errors: {telemetry_signals['codingErrorCount']}")
        if learner_feedback:
            signals_used.append(f"Learner preference note: {learner_feedback}")

        # Choose effective presentation mode
        effective_detail_level = normalized_mode
        if normalized_mode == "STANDARD":
            if strategy == "deep_remedial_scaffolding":
                effective_detail_level = "SIMPLIFIED"
            elif strategy == "advanced_mastery_extension":
                effective_detail_level = "DETAILED"

        strategy_instructions = (
            f"STRATEGY: {strategy.upper()}\n"
            f"- Effective Detail Level: {effective_detail_level}\n"
            f"- Student Diagnosed Gaps: {json.dumps(diagnosis['specific_learning_gaps'])}\n"
            f"- Target Concepts: {json.dumps(diagnosis['target_concepts'])}\n"
            f"- Strategy Rationale: {reason}\n"
        )

        # 5. Fetch verified curriculum context via RAG
        rag_context = ""
        if os.getenv("ENVIRONMENT") != "test":
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
            detail_level=effective_detail_level,
            strategy=strategy,
            strategy_instructions=strategy_instructions,
            pred_load=pred_load,
            confidence=confidence,
            reason=reason,
            signals_used=signals_used,
            diagnosis=diagnosis
        )

        # 7. Fallback to offline structured adaptation if Gemini returns None
        if not ai_lesson_dict:
            ai_lesson_dict = self._build_offline_adapted_lesson(
                topic_title=topic_title,
                subject=subject,
                topic_id=topic_id,
                topic_meta=topic_meta,
                rag_context=rag_context,
                detail_level=effective_detail_level,
                strategy=strategy,
                pred_load=pred_load,
                confidence=confidence,
                reason=reason,
                signals_used=signals_used,
                diagnosis=diagnosis
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
                detail_level=effective_detail_level,
                strategy=strategy,
                pred_load=pred_load,
                confidence=confidence,
                reason=reason,
                signals_used=signals_used,
                diagnosis=diagnosis
            )

        # 9. Save to SQLite cache
        cached_signals = dict(telemetry_signals)
        cached_signals["extracted_features"] = ml_input
        cached_signals["cognitive_load_prediction"] = pred_load
        cached_signals["confidence"] = confidence
        cached_signals["diagnosis_summary"] = diagnosis.get("quiz_performance_summary", {})

        state_store.save_adapted_lesson(
            user_id=safe_user_id,
            topic_id=topic_id,
            adaptation_strategy=strategy,
            lesson_data=validated_lesson,
            signals=cached_signals,
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
        signals_used: List[str],
        diagnosis: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Call Gemini model with structured JSON response schema tailored to diagnosed knowledge gaps."""
        if os.getenv("ENVIRONMENT", "").lower() == "test" and not os.getenv("ALLOW_TEST_GEMINI_CALLS"):
            return None

        try:
            client = get_gemini_client()
        except Exception as e:
            logger.warning("Gemini client not initialized: %s", e)
            return None

        diag_info = diagnosis or {}
        gaps_list = diag_info.get("specific_learning_gaps", [])
        quiz_summary = diag_info.get("quiz_performance_summary", {})

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

DIAGNOSED STUDENT LEARNING EVIDENCE:
- Teaching Strategy: {strategy}
- Diagnosed Knowledge Gaps: {json.dumps(gaps_list)}
- Performance Summary: {json.dumps(quiz_summary)}
- Cognitive Load Category: {pred_load} (Confidence: {confidence:.2f})
- Active Explanation Mode: {detail_level}
- Adaptation Reason: {reason}
- Signals Observed: {json.dumps(signals_used)}

PEDAGOGICAL STRATEGY RULES:
{strategy_instructions}
CRITICAL REQUIREMENT:
The lesson MUST specifically teach and reinforce the student's diagnosed knowledge gaps: {json.dumps(gaps_list)}.
Ensure the code example, visual diagram, common pitfalls, and guided practice challenge directly target these concepts!

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
    "signals_used": {json.dumps(signals_used)},
    "specific_learning_gaps": {json.dumps(gaps_list)},
    "target_concepts": {json.dumps(diag_info.get("target_concepts", []))},
    "quiz_performance_summary": {json.dumps(quiz_summary)}
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
            "gemini-2.5-flash",
            "gemini-1.5-flash"
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
        signals_used: List[str],
        diagnosis: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Construct a high-quality offline adapted lesson grounded in curriculum data and tailored to student knowledge gaps."""
        diag = diagnosis or {}
        diagnosed_gaps = diag.get("diagnosed_gaps", [])
        primary_gap = diagnosed_gaps[0] if diagnosed_gaps else None
        gap_key = primary_gap["concept_key"] if primary_gap else (diag.get("target_concepts", [""])[0] if diag else "")

        base_explanation = topic_meta.get("conceptExplanation") or topic_meta.get("description") or f"Learn the core fundamentals of {topic_title} in {subject}."
        objectives = topic_meta.get("learningObjectives") or [
            f"Understand core principles of {topic_title}",
            f"Write and execute valid {subject.capitalize()} code",
            f"Debug common issues in {topic_title}"
        ]

        # -------------------------------------------------------------
        # Branch tailored lesson content based on diagnosed gap & strategy
        # -------------------------------------------------------------
        if gap_key == "boundary_conditions_and_indexing":
            lesson_title = f"Targeted Revision: Mastering Boundary Conditions in {topic_title}"
            intro = f"Personalized for you based on your recent quiz. On your assessment, questions concerning **Boundary Conditions & Range Stop Limits** indicated an area for improvement. This targeted lesson breaks down the fencepost principle, visualizes zero-based indexing, and guides you through boundary-safe iteration."
            objectives = [
                f"Master zero-based indexing and exclusive range limits in {subject.capitalize()}",
                "Eliminate off-by-one errors and array bounds violations",
                "Apply defensive boundary checks in hands-on code"
            ]
            explanation_content = (
                f"### 🎯 Understanding Boundary Conditions & Range Limits\n\n"
                f"In {subject.capitalize()}, sequence traversal and numeric ranges follow the **half-open interval** principle `[start, stop)`. The start index is inclusive, but the stop value is **strictly exclusive**.\n\n"
                f"- `range(2, 6)` generates `2, 3, 4, 5` (stops immediately before `6`).\n"
                f"- For a sequence of length `N`, the valid indices are `0, 1, 2, ..., N - 1`.\n"
                f"- Accessing index `N` triggers an out-of-bounds error because indices start at 0."
            )
            analogy_content = (
                "Think of boundary conditions like building a garden fence:\n\n"
                "- **The Fencepost Principle:** To install 4 fence sections, you place 5 posts (post 0, 1, 2, 3, 4).\n"
                "- When you tell a worker `range(2, 6)`, you are specifying: *'Start at marker 2, work through marker 5, and stop before marker 6.'*\n"
                "- Believing the range includes 6 is like trying to attach a 5th fence panel when only 4 were paid for."
            )
            diagram_content = (
                "+-----------------------------------------------------------------------------------------+\n"
                "| Sequence Index:    0         1         2         3         4       (Total Length = 5)   |\n"
                "| Stored Values:   ['a']     ['b']     ['c']     ['d']     ['e']                          |\n"
                "| Status:          Valid     Valid     Valid     Valid     Valid     [X] Index 5 ERROR!   |\n"
                "| range(1, 4) ---> Visits: index 1 ('b'), index 2 ('c'), index 3 ('d') (Stops before 4)  |\n"
                "+-----------------------------------------------------------------------------------------+"
            )
            diagram_caption = "Memory layout of zero-based sequence indexing and range stop boundaries."
            if subject == "python":
                code_text = (
                    "# Boundary-Safe Iteration Demonstration\n"
                    "items = ['alpha', 'beta', 'gamma', 'delta']\n\n"
                    "# 1. Correct range stop limit: len(items) is exclusive!\n"
                    "print('--- Iterating by Index ---')\n"
                    "for i in range(len(items)):\n"
                    "    print(f'Index {i}: {items[i]}')\n\n"
                    "# 2. Sub-range demonstration: range(1, 3) stops before 3\n"
                    "slice_indices = list(range(1, 3))\n"
                    "print('range(1, 3) yields indices:', slice_indices)\n"
                )
                practice_payload = {
                    "prompt": "Fix the boundary bug in the snippet below so that it safely prints all 3 elements without an IndexError.",
                    "starter_code": "data = ['first', 'second', 'third']\n# Complete the range to iterate safely from 0 to len(data)\nfor i in range(len(data)):\n    print(data[i])\n",
                    "expected_output": "first\nsecond\nthird",
                    "hint": "Use range(len(data)) to stop safely before reaching the length.",
                    "solution": "data = ['first', 'second', 'third']\nfor i in range(len(data)):\n    print(data[i])"
                }
            else:
                code_text = (
                    "// Boundary-Safe Iteration in C/C++\n"
                    "#include <stdio.h>\n\n"
                    "int main(void) {\n"
                    "    int arr[4] = {10, 20, 30, 40};\n"
                    "    // Correct loop bound: i < 4 (never i <= 4!)\n"
                    "    for (int i = 0; i < 4; i++) {\n"
                    "        printf(\"Index %d: %d\\n\", i, arr[i]);\n"
                    "    }\n"
                    "    return 0;\n"
                    "}\n"
                )
                practice_payload = {
                    "prompt": "Complete the boundary-safe iteration to print numbers up to 3.",
                    "starter_code": "#include <stdio.h>\n\nint main(void) {\n    for (int i = 0; i < 3; i++) {\n        printf(\"%d\\n\", i);\n    }\n    return 0;\n}\n",
                    "expected_output": "0\n1\n2",
                    "hint": "Use i < 3 as the termination condition.",
                    "solution": "#include <stdio.h>\n\nint main(void) {\n    for (int i = 0; i < 3; i++) {\n        printf(\"%d\\n\", i);\n    }\n    return 0;\n}"
                }
            mistakes_payload = [
                {
                    "mistake": "Treating range(start, stop) stop value as inclusive",
                    "why_wrong": "Python range stops before the stop integer. Expecting range(2, 6) to yield 6 leads to missing end logic.",
                    "fix": "Use range(start, stop + 1) if the stop integer must be processed."
                },
                {
                    "mistake": "Using `i <= len(sequence)` in indexing loops",
                    "why_wrong": "The maximum valid 0-based index is `len(sequence) - 1`. Accessing `sequence[len(sequence)]` throws IndexError.",
                    "fix": "Always use strict inequality `i < len(sequence)` or `for item in sequence:` directly."
                }
            ]
            quiz_questions = [
                {
                    "id": "kc-bnd-1",
                    "question": "What is the exact output of list(range(2, 6))?",
                    "options": ["[2, 3, 4, 5, 6]", "[2, 3, 4, 5]", "[2, 4, 6]", "[0, 2, 4, 6]"],
                    "correct_index": 1,
                    "explanation": "In Python, range(start, stop) stops before reaching stop, producing [2, 3, 4, 5]."
                },
                {
                    "id": "kc-bnd-2",
                    "question": "For a sequence with length 5, what is the highest valid 0-based index?",
                    "options": ["5", "4", "6", "0"],
                    "correct_index": 1,
                    "explanation": "With zero-based indexing, a sequence of length 5 has valid indices 0, 1, 2, 3, and 4."
                }
            ]

        elif gap_key == "loop_termination_and_control_flow":
            lesson_title = f"Targeted Revision: Loop Termination Guarantees in {topic_title}"
            intro = f"Personalized for you based on your recent quiz. On your assessment, questions concerning **Loop Termination & Control Flow Guarantees** indicated an area for improvement. This lesson clarifies condition updates, sentinel checks, and early exit control flow."
            objectives = [
                "Construct condition-driven loops with mathematical termination guarantees",
                "Prevent CPU-locking infinite loops through state updates",
                "Differentiate break (immediate exit) from continue (skip iteration)"
            ]
            explanation_content = (
                f"### 🔄 Loop Invariants and Termination Guarantees\n\n"
                f"Every condition-driven loop (such as `while`) relies on three critical pillars:\n\n"
                f"1. **Initialization:** The loop sentinel or state variable must be initialized before the loop starts.\n"
                f"2. **Condition Test:** The expression is evaluated before each iteration. The loop body executes only while this remains `True`.\n"
                f"3. **Guaranteed State Progression:** The loop body MUST modify the sentinel variable towards the exit threshold on every iteration.\n\n"
                f"If the state variable never changes, the condition never becomes `False`, resulting in an **infinite loop** that locks process execution."
            )
            analogy_content = (
                "Think of a while loop like a digital kitchen timer:\n\n"
                "- **Starting Time:** You set it to 5 minutes.\n"
                "- **Countdown Tick:** Every 60 seconds, the counter decrements by 1.\n"
                "- **Termination:** Once the timer hits 0, it rings and stops.\n\n"
                "If the countdown circuit breaks and never decrements the time, the microwave will run forever."
            )
            diagram_content = (
                "+-----------------------------------------------------------------------------------------+\n"
                "|       [ Initialize: counter = 3 ]                                                       |\n"
                "|                    |                                                                    |\n"
                "|                    v                                                                    |\n"
                "|           /------------------\\                                                          |\n"
                "|          /  counter > 0 ?     \\ ---- (False) ----> [ Safe Loop Exit: Execution Proceeds]|\n"
                "|          \\                    /                                                         |\n"
                "|           \\------------------/                                                          |\n"
                "|                    | (True)                                                             |\n"
                "|                    v                                                                    |\n"
                "|          [ Execute Body Logic ]                                                         |\n"
                "|                    |                                                                    |\n"
                "|                    v                                                                    |\n"
                "|          [ GUARANTEE: counter -= 1 ] ---> Returns to condition check                    |\n"
                "+-----------------------------------------------------------------------------------------+"
            )
            diagram_caption = "State transition flow for guaranteed while loop termination."
            code_text = (
                "# Demonstrating Condition-Driven While Loop with Guaranteed Termination\n"
                "counter = 3\n"
                "while counter > 0:\n"
                "    print(f'Processing step, counter = {counter}')\n"
                "    counter -= 1  # Crucial state update towards termination\n\n"
                "print('Loop safely terminated! State is verified.')\n"
            )
            practice_payload = {
                "prompt": "Complete the while loop so that it counts down from 3 to 1 and terminates safely.",
                "starter_code": "n = 3\nwhile n > 0:\n    print(n)\n    # Decrement n by 1 to ensure termination\n    n -= 1\n",
                "expected_output": "3\n2\n1",
                "hint": "Ensure n is decremented on each iteration with n -= 1.",
                "solution": "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1"
            }
            mistakes_payload = [
                {
                    "mistake": "Omitting the state update variable inside a while loop body",
                    "why_wrong": "The loop condition remains True indefinitely, freezing program execution.",
                    "fix": "Always verify that every execution path inside the loop progresses the state variable."
                },
                {
                    "mistake": "Confusing break with continue",
                    "why_wrong": "break completely terminates the loop; continue only skips to the next iteration.",
                    "fix": "Use break for early exit conditions and continue to skip unwanted data."
                }
            ]
            quiz_questions = [
                {
                    "id": "kc-term-1",
                    "question": "What is the primary danger of failing to update the loop sentinel variable inside a while loop?",
                    "options": ["Syntax error during compilation", "An infinite loop that never terminates", "Automatic garbage collection", "Variable scope leaks"],
                    "correct_index": 1,
                    "explanation": "If the condition variable never updates towards false, the loop runs indefinitely."
                },
                {
                    "id": "kc-term-2",
                    "question": "Which statement immediately exits the entire loop, regardless of condition status?",
                    "options": ["continue", "break", "pass", "yield"],
                    "correct_index": 1,
                    "explanation": "The break statement unconditionally terminates the enclosing loop immediately."
                }
            ]

        elif gap_key == "variable_scope_and_state":
            lesson_title = f"Targeted Revision: Variable Scoping & State Mutability in {topic_title}"
            intro = f"Personalized for you based on your recent quiz. On your assessment, questions concerning **Variable Scoping & State Mutability** indicated an area for improvement. This targeted lesson breaks down local function frames, outer identifier shadowing, and mutable state references."
            objectives = [
                f"Differentiate local function frame bindings from global module scope in {subject.capitalize()}",
                "Trace identifier resolution order and eliminate UnboundLocalError",
                "Safely manipulate data structures without unintended outer state mutation"
            ]
            explanation_content = (
                f"### 📦 Understanding Variable Scoping & Frame Resolution\n\n"
                f"In {subject.capitalize()}, identifier resolution adheres to strict LEGB (Local, Enclosing, Global, Built-in) scope boundaries:\n\n"
                f"- **Local Scope:** Variables assigned inside a function frame exist solely within that function's lifecycle.\n"
                f"- **Shadowing:** Assigning to a name inside a function shadows any outer identifier with the same name, without altering the outer value.\n"
                f"- **Reference Assignment vs Mutation:** Reassigning a parameter does not change the caller's reference. However, mutating a shared collection (like a list or dict) modifies the underlying heap object directly."
            )
            analogy_content = (
                "Think of variable scoping like a private hotel room safe versus the hotel lobby:\n\n"
                "- **Private Room Safe (Local Scope):** You place items in your room's safe. No one in another room or in the lobby can access or modify them.\n"
                "- **Hotel Lobby Desk (Global Scope):** Anything left on the front desk is visible and mutable by any guest or staff member.\n\n"
                "Relying on global variables is like leaving personal cash on the lobby desk—anyone can overwrite it, causing chaotic side effects."
            )
            diagram_content = (
                "+-----------------------------------------------------------------------------------------+\n"
                "| Global Module Scope:                                                                    |\n"
                "|   app_stage = 'PRODUCTION'                                                              |\n"
                "|                                                                                         |\n"
                "|   +---------------------------------------------------------------------------------+   |\n"
                "|   | Function Frame: process_transaction(amount)                                     |   |\n"
                "|   |   Local Scope Bindings:                                                         |   |\n"
                "|   |     fee_rate = 0.05               (Private to this invocation frame)            |   |\n"
                "|   |     app_stage = 'LOCAL_OVERRIDE'  (Shadows identifier; does NOT alter outer)    |   |\n"
                "|   +---------------------------------------------------------------------------------+   |\n"
                "|                                                                                         |\n"
                "| Outer app_stage remains: 'PRODUCTION' (Protected from unintended mutation)              |\n"
                "+-----------------------------------------------------------------------------------------+"
            )
            diagram_caption = "Lexical scope stack frames and identifier resolution boundaries."
            if subject == "python":
                code_text = (
                    "# Demonstrating Local Scope Isolation and Safe Returns\n"
                    "app_stage = 'PRODUCTION'\n\n"
                    "def process_transaction(amount):\n"
                    "    # Local frame variable: isolated from outer module scope\n"
                    "    fee_rate = 0.05\n"
                    "    total = amount + (amount * fee_rate)\n"
                    "    return total\n\n"
                    "result = process_transaction(100)\n"
                    "print(f'Processed result: {result}')\n"
                    "print(f'Global environment unchanged: {app_stage}')\n"
                )
                practice_payload = {
                    "prompt": "Complete the function so that it computes and returns the doubled value within its local frame without modifying outer scope.",
                    "starter_code": "base_val = 15\n\ndef compute_local(x):\n    # Calculate and return x multiplied by 2\n    local_result = x * 2\n    return local_result\n\nprint(compute_local(base_val))\n",
                    "expected_output": "30",
                    "hint": "Assign local_result = x * 2 and return local_result.",
                    "solution": "base_val = 15\ndef compute_local(x):\n    local_result = x * 2\n    return local_result\nprint(compute_local(base_val))"
                }
            else:
                code_text = (
                    "// Demonstrating Scope Scoping in C/C++\n"
                    "#include <stdio.h>\n\n"
                    "int global_val = 100;\n\n"
                    "int compute_step(int x) {\n"
                    "    int local_step = x * 2;\n"
                    "    return local_step;\n"
                    "}\n\n"
                    "int main(void) {\n"
                    "    int res = compute_step(15);\n"
                    "    printf(\"Result: %d\\n\", res);\n"
                    "    return 0;\n"
                    "}\n"
                )
                practice_payload = {
                    "prompt": "Complete the C code to return the doubled value within the local function frame.",
                    "starter_code": "#include <stdio.h>\n\nint compute_local(int x) {\n    return x * 2;\n}\n\nint main(void) {\n    printf(\"%d\\n\", compute_local(15));\n    return 0;\n}\n",
                    "expected_output": "30",
                    "hint": "Use return x * 2 inside compute_local.",
                    "solution": "#include <stdio.h>\n\nint compute_local(int x) {\n    return x * 2;\n}\n\nint main(void) {\n    printf(\"%d\\n\", compute_local(15));\n    return 0;\n}"
                }
            mistakes_payload = [
                {
                    "mistake": "UnboundLocalError: local variable referenced before assignment in Python",
                    "why_wrong": "Assigning to a variable anywhere in a function marks it as local to that frame. Referencing it before assignment raises UnboundLocalError.",
                    "fix": "Pass the variable as a parameter or explicitly declare global or nonlocal if intentional."
                },
                {
                    "mistake": "Accidental mutation of outer or mutable default arguments",
                    "why_wrong": "Mutating shared collections in outer scope causes subtle state corruption across function calls.",
                    "fix": "Return new values from functions instead of mutating external collections."
                }
            ]
            quiz_questions = [
                {
                    "id": "kc-scp-1",
                    "question": "When a variable is assigned inside a function without global declaration, where is it bound?",
                    "options": ["In the local function frame", "In the global module frame", "In the built-in namespace", "In the parent thread pool"],
                    "correct_index": 0,
                    "explanation": "Variable assignment inside a function binds the identifier strictly to that function's local frame."
                },
                {
                    "id": "kc-scp-2",
                    "question": "What occurs if a function references an identifier before assigning to it in the same local frame?",
                    "options": ["It reads the global value, then creates a local copy", "Python raises UnboundLocalError", "It initializes the variable to None", "It produces a compiler warning"],
                    "correct_index": 1,
                    "explanation": "Python treats any assigned variable in a function as local; accessing it before assignment raises UnboundLocalError."
                }
            ]

        elif gap_key == "pointer_addressing_and_dereference":
            lesson_title = f"Targeted Revision: Pointer Addressing & Safe Dereferencing in {topic_title}"
            intro = f"Personalized for you based on your recent quiz. On your assessment, questions concerning **Pointer Addressing & Dereferencing Safety** indicated an area for improvement. This lesson clarifies address-of operations (&), safe dereferencing (*), and defensive NULL pointer checks."
            objectives = [
                "Differentiate memory addresses (&) from dereferenced values (*)",
                "Prevent segmentation faults through defensive NULL pointer verification",
                "Safely read and modify values across function boundaries using pointers"
            ]
            explanation_content = (
                f"### 📍 Pointer Addressing and Safe Dereferencing\n\n"
                f"In {subject.capitalize()}, a pointer is a variable that stores the **memory address** of another variable:\n\n"
                f"- **Address-of Operator (`&`):** Retrieves the numeric memory location of a variable in address space.\n"
                f"- **Dereference Operator (`*`):** Accesses or modifies the value stored at that specific address.\n"
                f"- **Defensive NULL Checking:** Always verify `if (ptr != NULL)` before dereferencing to prevent fatal segmentation faults."
            )
            analogy_content = (
                "Think of a pointer like a house street address written on an envelope:\n\n"
                "- The envelope itself is the pointer variable.\n"
                "- The address written on it (`742 Evergreen Terrace`) is the memory address.\n"
                "- Walking into the house to sit on the sofa is **dereferencing** (`*ptr`).\n\n"
                "If the envelope holds an empty or invalid address (`NULL`), walking through the door causes a crash."
            )
            diagram_content = (
                "+-----------------------------------------------------------------------------------------+\n"
                "| Pointer Variable 'ptr':              Target Variable 'val':                             |\n"
                "|   Address in RAM: 0x7ffd_10          Address in RAM: 0x7ffd_80                          |\n"
                "|   Stored Value:   0x7ffd_80  ----->  Stored Value:   42                                 |\n"
                "|                                                                                         |\n"
                "|   *ptr reads / writes directly to 0x7ffd_80 -> returns 42                              |\n"
                "+-----------------------------------------------------------------------------------------+"
            )
            diagram_caption = "Memory address pointing to allocated storage."
            code_text = (
                "#include <stdio.h>\n\n"
                "int main(void) {\n"
                "    int val = 42;\n"
                "    int *ptr = &val; // Safe initialization to valid address\n\n"
                "    if (ptr != NULL) { // Defensive NULL guard\n"
                "        printf(\"Address: %p, Value: %d\\n\", (void*)ptr, *ptr);\n"
                "        *ptr = 100; // Safe modification through pointer\n"
                "    }\n"
                "    printf(\"Updated target value: %d\\n\", val);\n"
                "    return 0;\n"
                "}\n"
            )
            practice_payload = {
                "prompt": "Complete the C code to assign value 99 through the pointer and print it.",
                "starter_code": "#include <stdio.h>\n\nint main(void) {\n    int num = 10;\n    int *p = &num;\n    // Assign 99 through pointer p\n    *p = 99;\n    printf(\"%d\\n\", num);\n    return 0;\n}\n",
                "expected_output": "99",
                "hint": "Use *p = 99; to dereference and assign.",
                "solution": "#include <stdio.h>\n\nint main(void) {\n    int num = 10;\n    int *p = &num;\n    *p = 99;\n    printf(\"%d\\n\", num);\n    return 0;\n}"
            }
            mistakes_payload = [
                {
                    "mistake": "Dereferencing uninitialized or NULL pointer",
                    "why_wrong": "Uninitialized pointers contain garbage addresses; dereferencing triggers segmentation faults or memory corruption.",
                    "fix": "Always initialize pointers to NULL or a valid address, and assert `ptr != NULL`."
                },
                {
                    "mistake": "Confusing pointer address (&var) with dereferenced value (*var)",
                    "why_wrong": "Assigning an address to an integer or dereferencing an integer causes compilation errors or crash.",
                    "fix": "Keep pointer types (int*) distinct from value types (int)."
                }
            ]
            quiz_questions = [
                {
                    "id": "kc-ptr-1",
                    "question": "Which operator retrieves the memory address of a variable in C/C++?",
                    "options": ["& (address-of)", "* (dereference)", "-> (member access)", "% (modulo)"],
                    "correct_index": 0,
                    "explanation": "The & operator returns the memory address of the operand."
                },
                {
                    "id": "kc-ptr-2",
                    "question": "What is the recommended practice before dereferencing any pointer received from an external function?",
                    "options": ["Cast to void*", "Verify that pointer is not NULL", "Reallocate memory", "Call free() immediately"],
                    "correct_index": 1,
                    "explanation": "Checking `if (ptr != NULL)` prevents fatal segmentation faults."
                }
            ]

        elif strategy == "advanced_mastery_extension":
            lesson_title = f"Architectural Mastery & Performance: {topic_title}"
            intro = f"Personalized for you based on your recent quiz. You demonstrated exceptional mastery on your assessment! This advanced edition explores low-level runtime mechanics, compiler optimizations, memory efficiency, and defensive design patterns."
            objectives = [
                f"Inspect bytecode and execution frame lifecycles for {topic_title}",
                "Analyze memory locality and cache performance trade-offs",
                "Implement defensive programming and boundary invariant guards"
            ]
            explanation_content = (
                f"### 🔬 Architectural Depth and Execution Mechanics\n\n"
                f"Beyond baseline syntax, production-grade {subject.capitalize()} systems optimize runtime transitions:\n\n"
                f"- **Evaluation Pipeline:** Instructions transition through symbol tables, lexical scopes, and runtime frames.\n"
                f"- **Memory Mechanics:** Minimizing allocations and maintaining contiguous data structures prevents cache misses.\n"
                f"- **Defensive Invariants:** Production systems guard preconditions explicitly rather than relying on implicit fallbacks."
            )
            analogy_content = (
                "Think of architectural optimization like an automated express logistics sorting hub:\n\n"
                "- Standard sorting handles parcels one by one.\n"
                "- An optimized hub pre-allocates conveyor bins (contiguous memory) and batches items (vectorized operations), maximizing throughput and eliminating bottlenecks."
            )
            diagram_content = (
                "+-----------------------------------------------------------------------------------------+\n"
                "| Source Expression  --->  AST & Symbol Resolution  --->  Runtime Frame (Heap/Stack)       |\n"
                "|                                                                |                        |\n"
                "|                                                                v                        |\n"
                "| Verified Output    <---  Direct Evaluation Buffer   <--- Cache L1/L2 Execution          |\n"
                "+-----------------------------------------------------------------------------------------+"
            )
            diagram_caption = "Optimized execution pipeline and frame state management."
            code_text = (
                f"# Advanced Idiomatic Pattern: {topic_title}\n"
                "def process_optimized(data_stream):\n"
                "    assert isinstance(data_stream, list), 'Precondition: list required'\n"
                "    # Vectorized / generator-based comprehension minimizes memory footprint\n"
                "    return [item * 2 for item in data_stream if item > 0]\n\n"
                "stream = [1, 2, 3, 4, 5]\n"
                "print('Optimized Output:', process_optimized(stream))\n"
            )
            practice_payload = {
                "prompt": f"Write an optimized snippet for {topic_title} that doubles positive values and prints the result.",
                "starter_code": "data = [2, 4, 6]\n# Compute and print doubled list\nresult = [x * 2 for x in data]\nprint(result)\n",
                "expected_output": "[4, 8, 12]",
                "hint": "Use a list comprehension: [x * 2 for x in data]",
                "solution": "data = [2, 4, 6]\nresult = [x * 2 for x in data]\nprint(result)"
            }
            mistakes_payload = [
                {
                    "mistake": "Premature optimization without profiling",
                    "why_wrong": "Overcomplicating code without empirical telemetry often degrades maintainability without measurable gain.",
                    "fix": "Profile bottlenecks first, then apply targeted algorithmic improvements."
                },
                {
                    "mistake": "Silent exception suppression in core execution loops",
                    "why_wrong": "Hiding exceptions masks subtle state corruption and makes debugging difficult.",
                    "fix": "Always handle specific exceptions and maintain defensive invariant assertions."
                }
            ]
            quiz_questions = [
                {
                    "id": "kc-adv-1",
                    "question": "What is the primary architectural advantage of utilizing contiguous memory structures?",
                    "options": ["Maximizes CPU cache locality and throughput", "Bypasses all type checks", "Disables stack overflow guards", "Eliminates pointer indirection entirely"],
                    "correct_index": 0,
                    "explanation": "Contiguous memory layouts minimize cache misses, dramatically boosting execution speed."
                },
                {
                    "id": "kc-adv-2",
                    "question": "Why is defensive precondition assertion recommended in production systems?",
                    "options": ["Catches invalid state early before corruption propagates", "Disables compiler optimizations", "Replaces unit testing completely", "Forces garbage collection"],
                    "correct_index": 0,
                    "explanation": "Validating preconditions immediately isolates faults at their origin."
                }
            ]

        else:
            # Baseline or balanced standard adaptation
            is_baseline = strategy == "baseline_orientation"
            lesson_title = f"{'Foundational Guide' if is_baseline else 'Adapted Guide'}: {topic_title}"
            intro = (
                f"Welcome to your structured guide for **{topic_title}**. "
                f"{'No prior quiz attempts are recorded for your profile on this topic; this baseline edition introduces core mental models, idiomatic code examples, and diagnostic checkpoints.' if is_baseline else 'This edition is calibrated to your learning pace, delivering clear mental models, runnable examples, and targeted practice.'}"
            )
            explanation_content = (
                f"### 📘 Conceptual Overview: {topic_title}\n\n"
                f"{base_explanation}\n\n"
                f"**Core Principles:**\n"
                f"- Understand syntax structure and operational semantics.\n"
                f"- Trace variable bindings and memory lifecycle.\n"
                f"- Apply best practices for maintainable code."
            )
            analogy_content = (
                f"Think of **{topic_title}** like an organized postal sorting office:\n\n"
                f"- **Input Items:** Raw values arriving at the workstation.\n"
                f"- **Processors:** Dedicated workers following precise recipe steps without ambiguity.\n"
                f"- **Result:** A packaged product ready for delivery.\n\n"
                f"Just like sorting parcels with explicit labels, {subject.capitalize()} processes instructions sequentially so every state is predictable."
            )
            diagram_content = (
                f"+-----------------------------+       +-----------------------------+       +-----------------------------+\n"
                f"|    Input / Source Code      |  -->  |    Execution & Evaluation   |  -->  |    State / Console Result   |\n"
                f"|    ({subject} statements)   |       |    (runtime transformation) |       |    (verified output)        |\n"
                f"+-----------------------------+       +-----------------------------+       +-----------------------------+"
            )
            diagram_caption = f"Structural lifecycle of {topic_title} execution in {subject.capitalize()}."
            if subject == "python":
                code_text = f"# Exploring {topic_title}\ndata = [1, 2, 3, 4, 5]\nresult = [x * 2 for x in data]\nprint('Processed output:', result)\n"
                practice_payload = {
                    "prompt": f"Write a clean Python snippet demonstrating {topic_title}. Create a variable and print the output.",
                    "starter_code": f"# Complete the solution for {topic_title}\nvalue = 10\n# Print value multiplied by 2\n",
                    "expected_output": "20",
                    "hint": "Use print(value * 2) to display the calculated result.",
                    "solution": "value = 10\nprint(value * 2)"
                }
            else:
                code_text = f"#include <stdio.h>\n\nint main(void) {{\n    printf(\"Exploring {topic_title}\\n\");\n    return 0;\n}}\n"
                practice_payload = {
                    "prompt": f"Complete the C code for {topic_title}.",
                    "starter_code": "#include <stdio.h>\n\nint main(void) {\n    // Print 'Success'\n    printf(\"Success\\n\");\n    return 0;\n}\n",
                    "expected_output": "Success",
                    "hint": "Use printf(\"Success\\n\");",
                    "solution": "#include <stdio.h>\n\nint main(void) {\n    printf(\"Success\\n\");\n    return 0;\n}"
                }
            mistakes_payload = [
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
            quiz_questions = [
                {
                    "id": "kc-base-1",
                    "question": f"What is the primary benefit of understanding {topic_title}?",
                    "options": ["Enables predictable memory management and modular execution", "Bypasses all type checks", "Replaces operating system entirely", "Disables debugging logs permanently"],
                    "correct_index": 0,
                    "explanation": f"Understanding {topic_title} gives you precise control over state management and runtime execution."
                },
                {
                    "id": "kc-base-2",
                    "question": f"When applying {topic_title} in production code, what is the recommended practice?",
                    "options": ["Write monolithic scripts without unit tests", "Validate boundaries, use idiomatic constructs, and write clean comments", "Ignore runtime exceptions", "Avoid checking return codes"],
                    "correct_index": 1,
                    "explanation": "Defensive programming and boundary validation ensure high system reliability."
                }
            ]

        # Assemble modular sections conforming strictly to LessonSection schema
        sections = [
            {
                "id": "core-intuition",
                "type": "explanation",
                "title": "1. Conceptual Foundation",
                "content": explanation_content,
                "importance": "primary"
            },
            {
                "id": "everyday-analogy",
                "type": "analogy",
                "title": "2. Everyday Analogy",
                "content": analogy_content,
                "importance": "primary"
            },
            {
                "id": "visual-flow",
                "type": "visual_diagram",
                "title": "3. Visual System Flow",
                "diagram_type": "ascii",
                "diagram_content": diagram_content,
                "diagram_caption": diagram_caption,
                "importance": "secondary"
            },
            {
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
            },
            {
                "id": "worked-code-example",
                "type": "code_example",
                "title": "5. Runnable Code Demonstration",
                "language": subject,
                "code": code_text,
                "code_explanation": f"This snippet demonstrates idiomatic {subject.capitalize()} implementation for {topic_title}.",
                "line_by_line": [
                    {"line": "Initialization", "explanation": "Sets up required identifiers in local scope."},
                    {"line": "Operation", "explanation": "Executes core computational logic."},
                    {"line": "Output", "explanation": "Emits verified result to console standard output."}
                ],
                "importance": "primary"
            },
            {
                "id": "common-pitfalls",
                "type": "common_mistakes",
                "title": "6. Common Bugs & Pitfalls",
                "mistakes": mistakes_payload,
                "importance": "secondary"
            },
            {
                "id": "guided-practice",
                "type": "guided_practice",
                "title": "7. Guided Hands-on Practice",
                "practice": practice_payload,
                "importance": "primary"
            },
            {
                "id": "knowledge-check",
                "type": "quiz",
                "title": "8. Knowledge Check",
                "questions": quiz_questions,
                "importance": "primary"
            }
        ]

        return {
            "title": lesson_title,
            "subject": subject,
            "topic": topic_title,
            "topic_id": topic_id,
            "adaptation": {
                "strategy": strategy,
                "detail_level": detail_level.lower(),
                "cognitive_load": pred_load,
                "confidence": confidence,
                "reason": reason,
                "signals_used": signals_used,
                "specific_learning_gaps": diag.get("specific_learning_gaps", []),
                "target_concepts": diag.get("target_concepts", []),
                "quiz_performance_summary": diag.get("quiz_performance_summary")
            },
            "learning_objectives": objectives,
            "introduction": intro,
            "sections": sections,
            "key_takeaways": [
                f"Mastered core conceptual primitives for {topic_title} in {subject.capitalize()}.",
                "Learned idiomatic implementation patterns and common pitfall avoidance.",
                "Reinforced understanding through hands-on sandbox execution and self-check."
            ],
            "next_step": f"Continue with the next module in {subject.capitalize()} or solidify mastery in the Coding Studio."
        }


adapted_lesson_service = AdaptedLessonService()
