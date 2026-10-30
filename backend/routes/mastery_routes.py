"""Student-Specific Mastery API Routes.

Provides endpoints for:
1. Get mastery progress for the authenticated student (/api/mastery/me)
2. Get mastery progress for a particular subject (/api/mastery/subjects/{subject_id})
3. Get mastery progress for a particular topic (/api/mastery/topics/{topic_id})
4. Update mastery after a quiz attempt (/api/mastery/quiz-attempt, /api/mastery/quiz)
5. Update mastery after a coding submission (/api/mastery/coding-submission, /api/mastery/coding)
6. Get overall student progress and improvement statistics (/api/mastery/statistics, /api/mastery/stats)
7. Chronological mastery change history (/api/mastery/history)
8. Ingesting verified assessment results (/api/mastery/assessment-result)
"""

from fastapi import APIRouter, Request, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from backend.routes.auth_routes import get_current_user_id
from backend.services.mastery_service import mastery_service
from backend.services.curriculum_service import curriculum_service

router = APIRouter(tags=["student_mastery"])


class AssessmentResultPayload(BaseModel):
    topic_id: str = Field(..., description="Unique ID of the topic being assessed")
    assessment_type: str = Field(..., description="'quiz' or 'coding'")
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized score between 0.0 and 100.0")
    subject_id: Optional[str] = Field(default=None, description="Course / Subject ID (inferred if omitted)")
    assessment_id: Optional[str] = Field(default=None, description="Unique attempt/submission ID for idempotency")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata such as tests passed or correct answers")


class QuizAttemptPayload(BaseModel):
    topic_id: str = Field(..., description="Unique ID of the topic assessed by this quiz")
    score: float = Field(..., ge=0.0, le=100.0, description="Quiz accuracy/score between 0.0 and 100.0")
    subject_id: Optional[str] = Field(default=None, description="Optional Subject / Course ID")
    assessment_id: Optional[str] = Field(default=None, description="Unique quiz attempt ID for idempotency")
    correct_count: Optional[int] = Field(default=None, ge=0, description="Number of questions answered correctly")
    total_questions: Optional[int] = Field(default=None, ge=1, description="Total number of questions in quiz")
    time_spent: Optional[float] = Field(default=0.0, ge=0.0, description="Time spent on quiz in seconds")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional quiz metadata")


class CodingSubmissionPayload(BaseModel):
    topic_id: str = Field(..., description="Unique ID of the topic practiced with code")
    score: float = Field(..., ge=0.0, le=100.0, description="Coding pass percentage between 0.0 and 100.0")
    subject_id: Optional[str] = Field(default=None, description="Optional Subject / Course ID")
    assessment_id: Optional[str] = Field(default=None, description="Unique coding submission ID for idempotency")
    passed_tests: Optional[int] = Field(default=None, ge=0, description="Number of test cases passed")
    total_tests: Optional[int] = Field(default=None, ge=1, description="Total test cases evaluated")
    coding_time_seconds: Optional[float] = Field(default=0.0, ge=0.0, description="Coding duration in seconds")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional evaluation metadata")


# --- Operation 1: Get mastery progress for authenticated student ---
@router.get("/mastery/me")
async def get_my_mastery(request: Request):
    """Retrieve the authenticated student's overall cross-subject mastery profile."""
    user_id = get_current_user_id(request)
    return {
        "success": True,
        "data": mastery_service.get_student_overall_mastery(user_id)
    }


# --- Operation 2: Get mastery progress for a particular subject ---
@router.get("/mastery/subjects/{subject_id}")
async def get_subject_mastery(subject_id: str, request: Request):
    """Retrieve mastery score and all topic breakdowns for a specific subject."""
    user_id = get_current_user_id(request)
    if not subject_id or not subject_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject ID cannot be empty."
        )

    clean_subject = subject_id.strip()
    data = mastery_service.get_subject_mastery(user_id, clean_subject)
    return {
        "success": True,
        "data": data
    }


# --- Operation 3: Get mastery progress for a particular topic ---
@router.get("/mastery/topics/{topic_id}")
async def get_topic_mastery(topic_id: str, request: Request):
    """Retrieve detailed mastery status, quiz/coding metrics, and history for a specific topic."""
    user_id = get_current_user_id(request)
    if not topic_id or not topic_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic ID cannot be empty."
        )

    clean_topic = topic_id.strip()
    data = mastery_service.get_topic_mastery(user_id, clean_topic)
    return {
        "success": True,
        "data": data
    }


# --- Operation 4: Update mastery after a quiz attempt ---
@router.post("/mastery/quiz-attempt")
@router.post("/mastery/quiz")
async def update_mastery_quiz_attempt(payload: QuizAttemptPayload, request: Request):
    """Update student-specific mastery record and history following a quiz attempt."""
    user_id = get_current_user_id(request)
    clean_topic = payload.topic_id.strip()
    if not clean_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic ID cannot be empty."
        )

    meta = payload.details or {}
    if payload.correct_count is not None:
        meta["correct_count"] = payload.correct_count
    if payload.total_questions is not None:
        meta["total_questions"] = payload.total_questions
    if payload.time_spent is not None:
        meta["time_spent"] = payload.time_spent

    try:
        updated = mastery_service.process_assessment_result(
            user_id=user_id,
            topic_id=clean_topic,
            subject_id=payload.subject_id.strip() if payload.subject_id else None,
            assessment_type="quiz",
            score=payload.score,
            assessment_id=payload.assessment_id.strip() if payload.assessment_id else None,
            details=meta
        )
        return {
            "success": True,
            "message": "Quiz mastery updated successfully.",
            "data": updated
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update quiz mastery: {str(e)}"
        )


# --- Operation 5: Update mastery after a coding submission ---
@router.post("/mastery/coding-submission")
@router.post("/mastery/coding")
async def update_mastery_coding_submission(payload: CodingSubmissionPayload, request: Request):
    """Update student-specific mastery record and history following a coding submission."""
    user_id = get_current_user_id(request)
    clean_topic = payload.topic_id.strip()
    if not clean_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic ID cannot be empty."
        )

    meta = payload.details or {}
    if payload.passed_tests is not None:
        meta["passed_tests"] = payload.passed_tests
    if payload.total_tests is not None:
        meta["total_tests"] = payload.total_tests
    if payload.coding_time_seconds is not None:
        meta["coding_time_seconds"] = payload.coding_time_seconds

    try:
        updated = mastery_service.process_assessment_result(
            user_id=user_id,
            topic_id=clean_topic,
            subject_id=payload.subject_id.strip() if payload.subject_id else None,
            assessment_type="coding",
            score=payload.score,
            assessment_id=payload.assessment_id.strip() if payload.assessment_id else None,
            details=meta
        )
        return {
            "success": True,
            "message": "Coding mastery updated successfully.",
            "data": updated
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update coding mastery: {str(e)}"
        )


# --- Operation 6: Get overall student progress and improvement statistics ---
@router.get("/mastery/statistics")
@router.get("/mastery/stats")
@router.get("/mastery/progress")
async def get_mastery_statistics(request: Request):
    """Retrieve comprehensive student progress, accuracy, improvement metrics, and trends."""
    user_id = get_current_user_id(request)
    stats = mastery_service.get_student_statistics(user_id)
    return {
        "success": True,
        "data": stats
    }


# --- Operation 7: Get chronological mastery change history ---
@router.get("/mastery/history")
async def get_mastery_history(
    request: Request,
    topic_id: Optional[str] = Query(None, description="Filter history by topic ID"),
    subject_id: Optional[str] = Query(None, description="Filter history by subject ID"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """Retrieve chronological mastery change history for the authenticated student."""
    user_id = get_current_user_id(request)
    history = mastery_service.get_mastery_history(
        user_id=user_id,
        topic_id=topic_id.strip() if topic_id else None,
        subject_id=subject_id.strip() if subject_id else None,
        limit=limit,
        offset=offset
    )
    return {
        "success": True,
        "total": len(history),
        "data": history
    }


# --- Generic unified assessment result endpoint (backwards compatible) ---
@router.post("/mastery/assessment-result")
async def record_assessment_result(payload: AssessmentResultPayload, request: Request):
    """
    Process a verified assessment result through the backend service.
    Student identity is strictly derived from the verified session/token.
    """
    user_id = get_current_user_id(request)

    clean_type = payload.assessment_type.strip().lower()
    if clean_type not in ("quiz", "coding"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid assessment_type '{payload.assessment_type}'. Must be 'quiz' or 'coding'."
        )

    clean_topic = payload.topic_id.strip()
    if not clean_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic ID cannot be empty."
        )

    try:
        updated_mastery = mastery_service.process_assessment_result(
            user_id=user_id,
            topic_id=clean_topic,
            subject_id=payload.subject_id.strip() if payload.subject_id else None,
            assessment_type=clean_type,
            score=payload.score,
            assessment_id=payload.assessment_id.strip() if payload.assessment_id else None,
            details=payload.details or {}
        )
        return {
            "success": True,
            "message": "Assessment result processed successfully.",
            "data": updated_mastery
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record assessment result: {str(e)}"
        )
