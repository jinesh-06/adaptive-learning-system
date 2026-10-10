"""Lesson Adaptation routes integrating AI personalization engine and feedback."""

from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from backend.services.adapted_lesson_service import adapted_lesson_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id
from llm.lesson_schemas import AdaptedLessonRequest, AdaptationFeedbackRequest

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("/adapt")
async def adapt_lesson(payload: AdaptedLessonRequest, request: Request):
    """
    Generate or retrieve a genuinely personalized AI-adapted lesson.
    Grounded in curriculum context, ML cognitive load prediction, and learner preferences.
    """
    user_id = get_current_user_id(request)
    
    result = adapted_lesson_service.generate_adapted_lesson(
        user_id=user_id,
        topic_id=payload.topic_id,
        detail_level=payload.detail_level or "STANDARD",
        signals=payload.signals,
        force_refresh=bool(payload.force_refresh),
        learner_feedback=payload.learner_feedback
    )
    return result


@router.get("/adapt/{topic_id}")
async def get_adapted_lesson_by_topic(
    topic_id: str,
    request: Request,
    detail_level: Optional[str] = Query(default=None)
):
    """Retrieve an existing generated adapted lesson for the authenticated learner."""
    user_id = get_current_user_id(request)
    cached = state_store.get_adapted_lesson(user_id, topic_id, detail_level)
    if not cached or not cached.get("lesson_data"):
        # Auto-generate if missing so learner gets immediate content
        return adapted_lesson_service.generate_adapted_lesson(
            user_id=user_id,
            topic_id=topic_id,
            detail_level=detail_level or "STANDARD"
        )
    return {
        "success": True,
        "cached": True,
        "topic_id": topic_id,
        "detail_level": detail_level or cached.get("adaptation_strategy", "STANDARD"),
        "lesson": cached["lesson_data"]
    }


@router.post("/adapt/feedback")
async def submit_adaptation_feedback(payload: AdaptationFeedbackRequest, request: Request):
    """Store learner feedback on an AI-adapted lesson."""
    user_id = get_current_user_id(request)
    result = state_store.record_adaptation_feedback(
        user_id=user_id,
        topic_id=payload.topic_id,
        detail_level=payload.detail_level,
        helpful=payload.helpful,
        rating=payload.rating or "just_right",
        comment=payload.comment,
        completed_practice=payload.completed_practice
    )
    return result
