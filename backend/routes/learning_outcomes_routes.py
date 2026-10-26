"""FastAPI Routes for Learning Outcomes, Pre/Post Assessments, and Student Feedback."""

from fastapi import APIRouter, Request, HTTPException, Query, Path
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from backend.routes.auth_routes import get_current_user_id
from backend.services.learning_outcomes_service import learning_outcomes_service

router = APIRouter(tags=["learning_outcomes_and_feedback"])


# --- Request Payloads ---
class AssessmentSubmissionPayload(BaseModel):
    assessment_type: str = Field(..., description="Must be 'pre' or 'post'")
    answers: Dict[str, Any] = Field(default_factory=dict, description="Map of question_id to selected option index")
    time_spent: Optional[float] = Field(default=60.0, description="Time spent in seconds")


class CreateFeedbackPayload(BaseModel):
    topic_id: str = Field(..., description="Topic or activity identifier")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comments: str = Field(..., min_length=1, max_length=2000, description="Constructive comments and feedback")
    feedback_type: Optional[str] = Field(default="lesson", description="Category: 'lesson', 'quiz', 'recommendation', 'general'")


class UpdateFeedbackPayload(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Updated rating from 1 to 5")
    comments: Optional[str] = Field(None, min_length=1, max_length=2000, description="Updated comment text")
    feedback_type: Optional[str] = Field(None, description="Updated feedback category")


# --- Pre/Post Assessment Routes ---
@router.get("/assessments/{topic_id}/questions")
async def get_assessment_questions(
    topic_id: str,
    type: str = Query("pre", description="Assessment type: 'pre' or 'post'")
):
    """Retrieve sanitized assessment questions (5 questions) without revealing answers."""
    return learning_outcomes_service.get_assessment_questions(topic_id=topic_id, assessment_type=type)


@router.post("/assessments/{topic_id}/submit")
async def submit_assessment(
    topic_id: str,
    payload: AssessmentSubmissionPayload,
    request: Request
):
    """
    Submit a Pre-Assessment or Post-Assessment.
    Derives student_id strictly from authenticated session token,
    validates answers on backend, calculates score/accuracy,
    and returns progress & comparison against baseline.
    """
    student_id = get_current_user_id(request)
    return learning_outcomes_service.grade_and_record_assessment(
        student_id=student_id,
        topic_id=topic_id,
        assessment_type=payload.assessment_type,
        user_answers=payload.answers,
        time_spent=payload.time_spent or 0.0
    )


@router.get("/assessments/results")
async def get_all_assessment_results(
    request: Request,
    topic_id: Optional[str] = Query(None, description="Optional topic filter"),
    assessment_type: Optional[str] = Query(None, description="Optional assessment type ('pre' or 'post')")
):
    """Retrieve completed assessment records for the authenticated student."""
    student_id = get_current_user_id(request)
    from backend.services.state_store import state_store
    results = state_store.get_assessment_results(
        student_id=student_id,
        topic_id=topic_id,
        assessment_type=assessment_type
    )
    return {
        "success": True,
        "count": len(results),
        "results": results
    }


@router.get("/assessments/results/{topic_id}")
async def get_topic_assessment_results(topic_id: str, request: Request):
    """Retrieve pre/post assessment history for a specific topic for the authenticated student."""
    student_id = get_current_user_id(request)
    from backend.services.state_store import state_store
    results = state_store.get_assessment_results(
        student_id=student_id,
        topic_id=topic_id
    )
    return {
        "success": True,
        "topic_id": topic_id,
        "results": results
    }


# --- Learning Outcomes Calculation Routes ---
@router.get("/learning-outcomes")
async def get_learning_outcomes(
    request: Request,
    topic_id: Optional[str] = Query(None, description="Optional topic filter")
):
    """
    Calculate and return complete learning outcome metrics for the authenticated student:
    - Pre/Post assessment scores
    - Score improvement (Post - Pre)
    - Accuracy percentage
    - Assessment completion rate
    - Number of completed assessments
    - Topic-wise learning outcomes
    """
    student_id = get_current_user_id(request)
    return learning_outcomes_service.calculate_learning_outcomes(student_id=student_id, topic_id=topic_id)


@router.get("/learning-outcomes/{topic_id}")
async def get_topic_learning_outcomes(topic_id: str, request: Request):
    """Calculate and return learning outcomes for a specific topic."""
    student_id = get_current_user_id(request)
    return learning_outcomes_service.calculate_learning_outcomes(student_id=student_id, topic_id=topic_id)


# --- Student Feedback Routes ---
@router.post("/student-feedback")
async def submit_student_feedback(payload: CreateFeedbackPayload, request: Request):
    """
    Submit feedback with 1-5 rating, comments, and category (lesson/quiz/recommendation/general).
    Derives student identity from authenticated session.
    """
    student_id = get_current_user_id(request)
    feedback_record = learning_outcomes_service.create_student_feedback(
        student_id=student_id,
        topic_id=payload.topic_id,
        rating=payload.rating,
        comments=payload.comments,
        feedback_type=payload.feedback_type or "lesson"
    )
    return {
        "success": True,
        "message": "Feedback submitted successfully.",
        "feedback": feedback_record
    }


@router.get("/student-feedback")
async def list_student_feedback(
    request: Request,
    topic_id: Optional[str] = Query(None, description="Optional filter by topic")
):
    """List feedback records submitted by the authenticated student."""
    student_id = get_current_user_id(request)
    items = learning_outcomes_service.get_student_feedback_list(student_id=student_id, topic_id=topic_id)
    return {
        "success": True,
        "count": len(items),
        "feedback": items
    }


@router.get("/student-feedback/{feedback_id}")
async def get_single_student_feedback(feedback_id: str, request: Request):
    """Get single feedback record belonging to the authenticated student."""
    student_id = get_current_user_id(request)
    from backend.services.state_store import state_store
    record = state_store.get_student_feedback_by_id(feedback_id)
    if not record:
        raise HTTPException(status_code=404, detail="Feedback record not found.")
    if record["student_id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot view another student's feedback.")
    record["topic_title"] = learning_outcomes_service.get_topic_info(record["topic_id"])["title"]
    return {
        "success": True,
        "feedback": record
    }


@router.put("/student-feedback/{feedback_id}")
async def update_student_feedback(
    feedback_id: str,
    payload: UpdateFeedbackPayload,
    request: Request
):
    """Update feedback (rating, comments, category) owned by the authenticated student."""
    student_id = get_current_user_id(request)
    updated = learning_outcomes_service.update_student_feedback(
        feedback_id=feedback_id,
        student_id=student_id,
        rating=payload.rating,
        comments=payload.comments,
        feedback_type=payload.feedback_type
    )
    return {
        "success": True,
        "message": "Feedback updated successfully.",
        "feedback": updated
    }


@router.delete("/student-feedback/{feedback_id}")
async def delete_student_feedback(feedback_id: str, request: Request):
    """Delete feedback owned by the authenticated student."""
    student_id = get_current_user_id(request)
    return learning_outcomes_service.delete_student_feedback(feedback_id=feedback_id, student_id=student_id)
