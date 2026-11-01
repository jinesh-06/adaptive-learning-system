"""Curriculum routes for courses and topics."""

from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional

from backend.services.curriculum_service import curriculum_service
from backend.services.auth_service import auth_service

router = APIRouter(tags=["curriculum"])


def _extract_optional_user_id(request: Request) -> Optional[str]:
    """Safely extract user_id if authenticated, otherwise return None."""
    try:
        identity = auth_service.verify_request(request)
        if identity and identity.user_id:
            return identity.user_id
    except Exception:
        pass
    return None


@router.get("/courses")
async def get_courses(
    request: Request,
    language: Optional[str] = Query(None),
    level: Optional[str] = Query(None)
):
    user_id = _extract_optional_user_id(request)
    return curriculum_service.get_courses(language=language, level=level, user_id=user_id)


@router.get("/courses/{course_id}")
async def get_course_detail(course_id: str, request: Request):
    user_id = _extract_optional_user_id(request)
    course = curriculum_service.get_course_detail(course_id, user_id=user_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/topics/{topic_id}")
async def get_topic_detail(topic_id: str):
    topic = curriculum_service.get_topic_detail(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic
