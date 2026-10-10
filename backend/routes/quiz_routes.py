"""Quiz routes for retrieving, generating, and grading 10-question topic quizzes with cognitive load evaluation and adaptive feedback."""

from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, Optional

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

    # Persist topic progress into SQLite user_progress table
    course_id = (
        "c-advanced-systems" if topic_id in C_ADV_TOPIC_MAP else
        ("c-beg" if topic_id.startswith("top-c-") else
         ("py-adv" if topic_id.startswith("top-py-adv-") else
          ("py-int" if topic_id.startswith("top-py-int-") else
           ("cpp-beg" if topic_id.startswith("top-cpp-") else
            ("java-beg" if topic_id.startswith("top-java-") else "py-beg")))))
    )
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
        "cognitive_insight": adaptive_feedback
    }
