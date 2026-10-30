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
from backend.routes.auth_routes import get_current_user_id
from backend.routes.c_adv_routes import C_ADV_TOPIC_MAP

router = APIRouter(tags=["quizzes"])


class QuizSubmission(BaseModel):
    answers: Dict[str, int]
    time_spent: Optional[float] = 60.0


@router.get("/topics/{topic_id}/quiz")
async def get_topic_quiz(
    topic_id: str,
    refresh: bool = Query(default=False, description="Force regenerate 10 quiz questions")
):
    """Retrieve exactly 10 questions for any lesson, generating dynamically or retrieving from verified cache."""
    return quiz_service.get_quiz_for_topic(topic_id, force_regenerate=refresh)


@router.post("/topics/{topic_id}/quiz/regenerate")
async def regenerate_topic_quiz(topic_id: str):
    """Force regenerate exactly 10 questions for the topic."""
    return quiz_service.get_quiz_for_topic(topic_id, force_regenerate=True)


@router.post("/topics/{topic_id}/quiz/submit")
async def submit_topic_quiz(topic_id: str, payload: QuizSubmission, request: Request):
    """Grade 10-question quiz submission, evaluate cognitive load signals, persist attempt, and generate adaptive feedback."""
    user_id = get_current_user_id(request)
    quiz_data = quiz_service.get_quiz_for_topic(topic_id)
    questions = quiz_data.get("questions", [])

    correct_count = 0
    feedback = []
    review = []

    for idx, q in enumerate(questions):
        q_id = str(q.get("id"))
        # Support answers keyed by question ID or 0-indexed position
        user_answer = payload.answers.get(q_id)
        if user_answer is None:
            user_answer = payload.answers.get(str(idx))

        is_correct = user_answer is not None and user_answer == q.get("correct_index")
        if is_correct:
            correct_count += 1

        feedback.append({
            "question_id": q_id,
            "correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": q.get("correct_index"),
            "explanation": q.get("explanation", "")
        })

        review.append({
            "id": q_id,
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "correct_index": q.get("correct_index", 0),
            "explanation": q.get("explanation", ""),
            "difficulty": q.get("difficulty", "medium"),
            "is_correct": is_correct,
            "user_choice": user_answer
        })

    total = len(questions) if len(questions) > 0 else 10
    percentage = round((correct_count / total) * 100)
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
    topic_title = quiz_data.get("title", topic_id).replace("Mini Quiz: ", "").replace("Knowledge Check: ", "")
    adaptive_feedback = quiz_service.generate_adaptive_feedback(
        topic_title=topic_title,
        topic_id=topic_id,
        questions=questions,
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

    # Save quiz attempt record to SQLite
    attempt_id = state_store.save_quiz_attempt(user_id, topic_id, {
        "score": correct_count,
        "percentage": percentage,
        "correct_count": correct_count,
        "total_questions": total,
        "answers": payload.answers,
        "review": review,
        "adaptive_feedback": adaptive_feedback,
        "time_spent": payload.time_spent or 0.0
    })

    # Invalidate stale adapted lesson cache so subsequent lesson loads use updated quiz evidence
    state_store.invalidate_adapted_lessons(user_id, topic_id)

    # Persist topic progress into SQLite user_progress table
    course_id = curriculum_service.get_course_id_for_topic(topic_id)
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
        "mastery": mastery_snapshot
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
            "incorrect_questions": incorrect_questions
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

        practice_review.append({
            "question_id": str(q_id),
            "is_correct": is_correct,
            "user_choice": user_choice,
            "correct_index": correct_idx,
            "explanation": q_obj.get("explanation", "Targeted corrective concept guidance.")
        })

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
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
