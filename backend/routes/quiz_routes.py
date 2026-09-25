"""Quiz routes for retrieving and grading topic quizzes with cognitive load evaluation."""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

from backend.services.curriculum_service import curriculum_service
from backend.services.ml_service import ml_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(tags=["quizzes"])


class QuizSubmission(BaseModel):
    answers: Dict[str, int]
    time_spent: Optional[float] = 60.0


@router.get("/topics/{topic_id}/quiz")
async def get_topic_quiz(topic_id: str):
    return curriculum_service.get_topic_quiz(topic_id)


@router.post("/topics/{topic_id}/quiz/submit")
async def submit_topic_quiz(topic_id: str, payload: QuizSubmission, request: Request):
    user_id = get_current_user_id(request)
    quiz_data = curriculum_service.get_topic_quiz(topic_id)
    questions = quiz_data.get("questions", [])

    correct_count = 0
    feedback = []

    for q in questions:
        q_id = str(q.get("id"))
        user_answer = payload.answers.get(q_id)
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

    total = len(questions) if len(questions) > 0 else 1
    percentage = round((correct_count / total) * 100)
    passed = percentage >= 60

    # Trigger ML cognitive evaluation based on real learning signals
    ml_eval = ml_service.evaluate({
        "timeSpentSeconds": payload.time_spent,
        "recentQuizAccuracy": percentage,
        "accuracy": percentage,
        "quiz_attempts": 1,
        "backtracking": 0 if passed else 2,
        "hesitation_time_seconds": max(2.0, payload.time_spent / total)
    })

    # Record in history and telemetry
    state_store.record_adaptive_evaluation(user_id, topic_id, ml_eval)
    state_store.record_telemetry(user_id, topic_id, "QUIZ_SUBMIT", payload.time_spent, {
        "percentage": percentage,
        "passed": passed,
        "cognitive_load": ml_eval.get("cognitive_load")
    })

    return {
        "score": correct_count,
        "total": total,
        "percentage": percentage,
        "passed": passed,
        "results": feedback,
        "cognitive_insight": {
            "cognitive_level": ml_eval.get("cognitive_level"),
            "cognitive_load": ml_eval.get("cognitive_load"),
            "confidence": ml_eval.get("confidence"),
            "content_mode": ml_eval.get("content_mode"),
            "recommended_action": ml_eval.get("recommended_action"),
            "reason": ml_eval.get("reason"),
            "contributing_factors": ml_eval.get("contributing_factors"),
            "unusual_completion": ml_eval.get("unusual_completion")
        }
    }
