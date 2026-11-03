"""Quiz routes for retrieving, generating, and grading 10-question topic quizzes with cognitive load evaluation and adaptive feedback."""

from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import json
from datetime import datetime, timezone

from backend.services.curriculum_service import curriculum_service
from backend.services.quiz_service import quiz_service
from backend.services.ml_service import ml_service
from backend.services.state_store import state_store
from backend.services.concept_service import concept_service
from backend.routes.auth_routes import get_current_user_id
from backend.routes.c_adv_routes import C_ADV_TOPIC_MAP

router = APIRouter(tags=["quizzes"])


class QuizSubmission(BaseModel):
    answers: Dict[str, int]
    time_spent: Optional[float] = 60.0
    submission_id: Optional[str] = None
    quiz_type: Optional[str] = "mastery"
    question_ids: Optional[List[str]] = None
    detail_level: Optional[str] = None


@router.get("/topics/{topic_id}/quiz")
async def get_topic_quiz(
    topic_id: str,
    request: Request,
    refresh: bool = Query(default=False, description="Force regenerate 10 quiz questions"),
    quiz_type: Optional[str] = Query(default="mastery", description="Quiz type: mastery, adapted, or comprehension_check"),
    detail_level: Optional[str] = Query(default=None, description="Detail level for adapted quiz")
):
    """Retrieve exactly 10 questions for any lesson, generating dynamically or retrieving from verified cache."""
    user_id = get_current_user_id(request)
    if quiz_type in ("adapted", "comprehension_check"):
        from backend.services.adapted_lesson_service import adapted_lesson_service
        return adapted_lesson_service.get_adapted_lesson_quiz(user_id, topic_id, detail_level=detail_level, refresh=refresh)
    return quiz_service.get_quiz_for_topic(topic_id, user_id=user_id, quiz_type=quiz_type, force_regenerate=refresh)


@router.post("/topics/{topic_id}/quiz/regenerate")
async def regenerate_topic_quiz(topic_id: str):
    """Force regenerate exactly 10 questions for the topic."""
    return quiz_service.get_quiz_for_topic(topic_id, force_regenerate=True)


@router.post("/topics/{topic_id}/quiz/submit")
async def submit_topic_quiz(topic_id: str, payload: QuizSubmission, request: Request):
    """Grade 10-question quiz submission, evaluate cognitive load signals, persist attempt, and generate adaptive feedback."""
    user_id = get_current_user_id(request)
    clean_sub_id = str(payload.submission_id).strip() if payload.submission_id and str(payload.submission_id).strip() else None

    # Idempotency check: if client submission_id was already recorded, return preserved attempt without duplicate counting
    if clean_sub_id:
        existing_attempt = state_store.get_quiz_attempt_by_submission_id(user_id, clean_sub_id)
        if existing_attempt:
            rev = []
            if existing_attempt.get("review_json"):
                try:
                    rev = json.loads(existing_attempt["review_json"])
                except Exception:
                    rev = []
            ad_fb = {}
            if existing_attempt.get("adaptive_feedback_json"):
                try:
                    ad_fb = json.loads(existing_attempt["adaptive_feedback_json"])
                except Exception:
                    ad_fb = {}
            tot = int(existing_attempt.get("total_questions") or 10)
            corr = int(existing_attempt.get("correct_count") or 0)
            pct = int(existing_attempt.get("percentage") or 0)
            prof = concept_service.get_learner_concept_profile(user_id, topic_id)
            return {
                "attempt_id": existing_attempt.get("id"),
                "score": pct,
                "correct_count": corr,
                "incorrect_count": tot - corr,
                "total_questions": tot,
                "total": tot,
                "percentage": pct,
                "passed": pct >= 70,
                "review": rev,
                "results": rev,
                "adaptive_feedback": ad_fb,
                "cognitive_insight": ad_fb,
                "mastery": None,
                "concept_updates": [],
                "concept_profile": prof,
                "idempotent_replay": True
            }

    is_comprehension_check = (payload.quiz_type == "comprehension_check")
    if not is_comprehension_check and payload.question_ids:
        if any(str(qid).startswith("kc-") for qid in payload.question_ids):
            is_comprehension_check = True

    trusted_questions: List[Dict[str, Any]] = []

    # 1. First check if submission_id maps to an active session in quiz_sessions
    if clean_sub_id:
        sess = state_store.get_quiz_session(clean_sub_id)
        if sess and sess.get("questions"):
            trusted_questions = sess["questions"]

    if not trusted_questions and is_comprehension_check:
        # Retrieve trusted server-side questions from adapted lesson cache
        adapted_row = state_store.get_adapted_lesson(user_id, topic_id, payload.detail_level)
        if adapted_row and adapted_row.get("lesson_data_json"):
            try:
                lesson_data = json.loads(adapted_row["lesson_data_json"])
                for sec in lesson_data.get("sections", []):
                    if sec.get("type") == "quiz" or sec.get("id") == "knowledge-check":
                        trusted_questions = sec.get("questions", [])
                        break
            except Exception:
                trusted_questions = []

        if not trusted_questions:
            try:
                from backend.services.adapted_lesson_service import adapted_lesson_service
                adapt_res = adapted_lesson_service.get_adapted_lesson(
                    user_id=user_id,
                    topic_id=topic_id,
                    detail_level=payload.detail_level or "standard"
                )
                lesson = adapt_res.get("lesson") or adapt_res.get("lesson_data") or {}
                for sec in lesson.get("sections", []):
                    if sec.get("type") == "quiz" or sec.get("id") == "knowledge-check":
                        trusted_questions = sec.get("questions", [])
                        break
            except Exception:
                trusted_questions = []

    # 3. Load authoritative topic candidate bank
    candidates = quiz_service.get_candidate_questions_for_topic(topic_id)
    if not trusted_questions:
        trusted_questions = candidates
    else:
        existing_ids = {str(q.get("id")) for q in trusted_questions if q.get("id")}
        trusted_questions = trusted_questions + [c for c in candidates if str(c.get("id")) not in existing_ids]

    topic_title = topic_id.replace("top-", "").replace("-", " ").title()

    # Map trusted questions by string ID
    trusted_by_id = {str(q.get("id")): q for q in trusted_questions if q.get("id")}

    # Determine presented questions
    if payload.question_ids and len(payload.question_ids) > 0:
        presented_questions = []
        for qid in payload.question_ids:
            sqid = str(qid)
            if sqid in trusted_by_id:
                presented_questions.append(trusted_by_id[sqid])
        if not presented_questions:
            presented_questions = trusted_questions
    else:
        presented_questions = trusted_questions

    # Identify questions actually evaluated:
    # A question is evaluated if the learner submitted an answer for it.
    # Unanswered and never-presented questions are NOT marked as incorrect.
    evaluated_questions = []
    evaluated_user_answers = {}
    for idx, q in enumerate(presented_questions):
        q_id = str(q.get("id"))
        user_answer = payload.answers.get(q_id)
        if user_answer is None:
            user_answer = payload.answers.get(str(idx))
        if user_answer is not None:
            evaluated_questions.append(q)
            evaluated_user_answers[q_id] = user_answer

    # Edge case: If no answers were provided at all, evaluate presented questions with score 0
    if not evaluated_questions:
        evaluated_questions = presented_questions
        evaluated_user_answers = {}

    correct_count = 0
    feedback = []
    review = []

    for idx, q in enumerate(evaluated_questions):
        q_id = str(q.get("id"))
        user_answer = evaluated_user_answers.get(q_id)
        trusted_correct = q.get("correct_index")
        if trusted_correct is None:
            trusted_correct = q.get("correctIndex", 0)

        is_correct = user_answer is not None and user_answer == trusted_correct
        if is_correct:
            correct_count += 1

        c_meta = quiz_service.get_concept_for_question(q, topic_id, topic_title)
        concept_id = c_meta["concept_id"]
        concept_title = c_meta["concept"]

        feedback.append({
            "question_id": q_id,
            "correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": trusted_correct,
            "explanation": q.get("explanation", ""),
            "concept_id": concept_id,
            "concept": concept_title
        })

        review.append({
            "id": q_id,
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "correct_index": trusted_correct,
            "explanation": q.get("explanation", ""),
            "difficulty": q.get("difficulty", "medium"),
            "is_correct": is_correct,
            "user_choice": user_answer,
            "concept_id": concept_id,
            "concept": concept_title
        })

    total = len(evaluated_questions) if len(evaluated_questions) > 0 else 10
    percentage = round((correct_count / total) * 100) if total > 0 else 0
    passed = percentage >= 70

    # Trigger ML cognitive evaluation based on real learning signals
    ml_eval = ml_service.evaluate({
        "timeSpentSeconds": payload.time_spent,
        "recentQuizAccuracy": percentage,
        "accuracy": percentage,
        "quiz_attempts": 1,
        "backtracking": 0 if passed else 2,
        "hesitation_time_seconds": max(2.0, (payload.time_spent or 60.0) / total)
    })

    # Generate personalized adaptive feedback based on missed concepts and learning signals
    adaptive_feedback = quiz_service.generate_adaptive_feedback(
        topic_title=topic_title,
        topic_id=topic_id,
        questions=evaluated_questions,
        review=review,
        score=correct_count,
        percentage=percentage,
        ml_eval=ml_eval
    )

    # Record in history and telemetry
    state_store.record_adaptive_evaluation(user_id, topic_id, ml_eval)
    state_store.record_telemetry(user_id, topic_id, "QUIZ_SUBMIT", payload.time_spent, {
        "percentage": percentage,
        "correct_count": correct_count,
        "total_questions": total,
        "passed": passed,
        "cognitive_load": ml_eval.get("cognitive_load")
    })

    # Save quiz attempt record to SQLite with submission_id for idempotency
    attempt_id = state_store.save_quiz_attempt(user_id, topic_id, {
        "score": correct_count,
        "percentage": percentage,
        "correct_count": correct_count,
        "total_questions": total,
        "answers": payload.answers,
        "review": review,
        "adaptive_feedback": adaptive_feedback,
        "time_spent": payload.time_spent or 0.0,
        "submission_id": clean_sub_id
    })

    # Invalidate stale adapted lesson cache so subsequent lesson loads use updated quiz evidence
    state_store.invalidate_adapted_lessons(user_id, topic_id)

    # Persist topic progress into SQLite user_progress table
    course_id = curriculum_service.get_course_id_for_topic(topic_id) or "unknown"
    state_store.save_topic_progress(
        user_id=user_id,
        course_id=course_id,
        topic_id=topic_id,
        status="COMPLETED" if passed else "IN_PROGRESS",
        quiz_score=percentage,
        completion_pct=100.0 if passed else max(50.0, float(percentage)),
        attempts_delta=1,
        time_spent_delta=payload.time_spent or 0.0
    )

    # Record concept-level assessment evidence into ConceptService
    concept_updates = []
    for r in review:
        # Do not classify skipped questions as selected wrong answers
        if r.get("user_choice") is not None:
            q_id = str(r.get("id"))
            c_id = r.get("concept_id") or "core_topic_mechanics"
            is_q_correct = bool(r.get("is_correct"))
            evidence_id = f"quiz_{clean_sub_id or attempt_id}_{q_id}"

            try:
                rec = concept_service.record_concept_evidence(
                    user_id=user_id,
                    concept_id=c_id,
                    topic_id=topic_id,
                    is_correct=is_q_correct,
                    evidence_id=evidence_id,
                    source="quiz_submission",
                    metadata={
                        "attempt_id": attempt_id,
                        "question_id": q_id,
                        "user_choice": r.get("user_choice"),
                        "correct_index": r.get("correct_index")
                    }
                )
                concept_updates.append({
                    "concept_id": c_id,
                    "concept": r.get("concept"),
                    "knowledge_state": rec["knowledge_state"],
                    "correct_count": rec["correct_count"],
                    "incorrect_count": rec["incorrect_count"]
                })
            except Exception as ce:
                print(f"[ConceptEvidence] Failed to record quiz concept evidence for {c_id}: {ce}")

    learner_concept_profile = concept_service.get_learner_concept_profile(user_id, topic_id)

    # Recalculate and update student-specific topic mastery
    mastery_snapshot = None
    try:
        from backend.services.mastery_service import mastery_service
        mastery_snapshot = mastery_service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=course_id,
            assessment_type="quiz",
            score=float(percentage),
            assessment_id=f"quiz_attempt_{attempt_id}",
            details={
                "attempt_id": attempt_id,
                "correct_count": correct_count,
                "total_questions": total,
                "passed": passed,
                "time_spent": payload.time_spent or 0.0
            }
        )
    except Exception as e:
        print(f"[MasteryIntegration] Failed to process quiz mastery: {e}")

    return {
        "attempt_id": attempt_id,
        "score": percentage,
        "correct_count": correct_count,
        "incorrect_count": total - correct_count,
        "total_questions": total,
        "total": total,
        "percentage": percentage,
        "passed": passed,
        "review": review,
        "results": feedback,
        "adaptive_feedback": adaptive_feedback,
        "cognitive_insight": adaptive_feedback,
        "mastery": mastery_snapshot,
        "concept_updates": concept_updates,
        "concept_profile": learner_concept_profile
    }


class CorrectivePracticeSubmission(BaseModel):
    answers: Dict[str, int]
    original_attempt_id: Optional[str] = None
    time_spent: Optional[float] = 30.0


@router.get("/topics/{topic_id}/quiz/attempts/latest")
async def get_latest_quiz_attempt(topic_id: str, request: Request):
    """Retrieve the latest preserved quiz attempt and assessment summary for the student."""
    user_id = get_current_user_id(request)
    clean_topic = topic_id.strip() if topic_id else ""
    attempts = state_store.get_quiz_attempts(user_id, clean_topic)
    if not attempts:
        return {"has_attempt": False, "attempt": None}

    latest = attempts[0]
    review = []
    if latest.get("review_json"):
        try:
            review = json.loads(latest["review_json"])
        except Exception:
            review = []

    adaptive_feedback = {}
    if latest.get("adaptive_feedback_json"):
        try:
            adaptive_feedback = json.loads(latest["adaptive_feedback_json"])
        except Exception:
            adaptive_feedback = {}

    answers = {}
    if latest.get("answers_json"):
        try:
            answers = json.loads(latest["answers_json"])
        except Exception:
            answers = {}

    incorrect_questions = [r for r in review if not r.get("is_correct")]
    for q in incorrect_questions:
        if not q.get("concept_id") or not q.get("concept"):
            c_meta = quiz_service.get_concept_for_question(q, clean_topic, clean_topic)
            q["concept_id"] = c_meta["concept_id"]
            q["concept"] = c_meta["concept"]

    learner_concept_profile = concept_service.get_learner_concept_profile(user_id, clean_topic)
    return {
        "has_attempt": True,
        "attempt": {
            "id": latest.get("id"),
            "score": latest.get("score"),
            "percentage": latest.get("percentage"),
            "correct_count": latest.get("correct_count"),
            "incorrect_count": latest.get("total_questions", 10) - (latest.get("correct_count") or 0),
            "total_questions": latest.get("total_questions", 10),
            "passed": float(latest.get("percentage", 0)) >= 70,
            "time_spent": latest.get("time_spent", 0.0),
            "created_at": latest.get("created_at"),
            "review": review,
            "answers": answers,
            "adaptive_feedback": adaptive_feedback,
            "incorrect_questions": incorrect_questions,
            "concept_profile": learner_concept_profile
        }
    }


@router.post("/topics/{topic_id}/quiz/practice/submit")
async def submit_corrective_practice(topic_id: str, payload: CorrectivePracticeSubmission, request: Request):
    """
    Grade and record a targeted corrective-practice session.
    Preserves original quiz score and assessment history without altering quiz_attempts table.
    """
    user_id = get_current_user_id(request)
    clean_topic = topic_id.strip() if topic_id else ""

    quiz_data = quiz_service.get_quiz_for_topic(clean_topic)
    questions = quiz_data.get("questions", [])
    q_map = {str(q.get("id")): q for q in questions}

    # Inspect original attempt review first for the exact question details assessed
    original_review_map = {}
    attempts = state_store.get_quiz_attempts(user_id, clean_topic)
    for att in attempts:
        if not payload.original_attempt_id or att.get("id") == payload.original_attempt_id:
            if att.get("review_json"):
                try:
                    for rev in json.loads(att["review_json"]):
                        original_review_map[str(rev.get("id"))] = rev
                except Exception:
                    pass
            break

    practice_review = []
    resolved_questions = []
    unresolved_questions = []
    concept_updates = []

    for q_id, user_choice in payload.answers.items():
        q_obj = original_review_map.get(str(q_id)) or q_map.get(str(q_id))
        if not q_obj:
            continue

        correct_idx = q_obj.get("correct_index")
        if correct_idx is None:
            correct_idx = q_obj.get("correctIndex", 0)

        is_correct = user_choice is not None and user_choice == correct_idx
        if is_correct:
            resolved_questions.append(str(q_id))
        else:
            unresolved_questions.append(str(q_id))

        c_meta = quiz_service.get_concept_for_question(q_obj, clean_topic, clean_topic)
        concept_id = c_meta["concept_id"]
        concept_title = c_meta["concept"]

        practice_review.append({
            "question_id": str(q_id),
            "is_correct": is_correct,
            "user_choice": user_choice,
            "correct_index": correct_idx,
            "explanation": q_obj.get("explanation", "Targeted corrective concept guidance."),
            "concept_id": concept_id,
            "concept": concept_title
        })

        # Record verified corrective practice evidence into ConceptService
        practice_evidence_id = f"practice_{payload.original_attempt_id or 'latest'}_{q_id}"
        try:
            rec = concept_service.record_concept_evidence(
                user_id=user_id,
                concept_id=concept_id,
                topic_id=clean_topic,
                is_correct=is_correct,
                evidence_id=practice_evidence_id,
                source="corrective_practice",
                metadata={
                    "original_attempt_id": payload.original_attempt_id,
                    "question_id": str(q_id),
                    "user_choice": user_choice,
                    "correct_index": correct_idx
                }
            )
            concept_updates.append({
                "concept_id": concept_id,
                "concept": concept_title,
                "question_id": str(q_id),
                "is_correct": is_correct,
                "knowledge_state": rec["knowledge_state"],
                "correct_count": rec["correct_count"],
                "incorrect_count": rec["incorrect_count"]
            })
        except Exception as ce:
            print(f"[ConceptEvidence] Failed to record practice evidence for {concept_id}: {ce}")

    total_practice = len(practice_review) if practice_review else 1
    practice_score = len(resolved_questions)
    practice_percentage = round((practice_score / total_practice) * 100)

    # Record practice event in telemetry_events (separate from quiz_attempts)
    state_store.record_telemetry(user_id, clean_topic, "CORRECTIVE_PRACTICE_SUBMISSION", payload.time_spent or 0.0, {
        "original_attempt_id": payload.original_attempt_id,
        "practice_score": practice_score,
        "total_practice": total_practice,
        "practice_percentage": practice_percentage,
        "resolved_count": len(resolved_questions),
        "unresolved_count": len(unresolved_questions)
    })

    # Record completion in adaptation feedback store
    state_store.record_adaptation_feedback(
        user_id=user_id,
        topic_id=clean_topic,
        detail_level="STANDARD",
        helpful=True,
        rating="just_right",
        comment=f"Completed corrective practice: {practice_score}/{total_practice} resolved",
        completed_practice=True
    )

    return {
        "success": True,
        "topic_id": clean_topic,
        "original_attempt_id": payload.original_attempt_id,
        "practice_score": practice_score,
        "practice_percentage": practice_percentage,
        "total_practice_questions": total_practice,
        "resolved_questions": resolved_questions,
        "unresolved_questions": unresolved_questions,
        "practice_review": practice_review,
        "concept_updates": concept_updates,
        "concept_profile": concept_service.get_learner_concept_profile(user_id, clean_topic),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
