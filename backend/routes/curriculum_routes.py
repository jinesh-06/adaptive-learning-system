"""Curriculum routes for courses and topics."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from backend.services.curriculum_service import curriculum_service

router = APIRouter(tags=["curriculum"])


@router.get("/courses")
async def get_courses(language: Optional[str] = Query(None), level: Optional[str] = Query(None)):
    return curriculum_service.get_courses(language=language, level=level)


@router.get("/courses/{course_id}")
async def get_course_detail(course_id: str):
    course = curriculum_service.get_course_detail(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/topics/{topic_id}")
async def get_topic_detail(topic_id: str):
    topic = curriculum_service.get_topic_detail(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic
