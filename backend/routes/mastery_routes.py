"""Student-Specific Mastery API Routes.

Provides endpoints for:
- Student's aggregate and topic-level mastery (/api/mastery/me)
- Subject-level mastery breakdown (/api/mastery/subjects/{subject_id})
- Individual topic mastery status and performance (/api/mastery/topics/{topic_id})
- Historical mastery changes (/api/mastery/history)
- Ingesting verified assessment results (/api/mastery/assessment-result)
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


@router.get("/mastery/me")
async def get_my_mastery(request: Request):
    """Retrieve the authenticated student's overall cross-subject mastery profile."""
    user_id = get_current_user_id(request)
    return {
        "success": True,
        "data": mastery_service.get_student_overall_mastery(user_id)
    }


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


@router.post("/mastery/assessment-result")
async def record_assessment_result(payload: AssessmentResultPayload, request: Request):
    """
    Process a verified assessment result through the backend service.
    Note: Client cannot supply arbitrary user IDs; student identity is strictly derived
    from the verified session/token.
    """
    user_id = get_current_user_id(request)

    clean_type = payload.assessment_type.strip().lower()
    if clean_type not in ("quiz", "coding"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid assessment_type '{payload.assessment_type}'. Must be 'quiz' or 'coding'."
        )

    try:
        updated_mastery = mastery_service.process_assessment_result(
            user_id=user_id,
            topic_id=payload.topic_id.strip(),
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
