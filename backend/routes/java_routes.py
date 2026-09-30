"""Java Core Architecture & Basics Curriculum, Dashboard, and Progress Tracking Routes."""

import json
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.state_store import state_store
from backend.services.curriculum_service import curriculum_service
from backend.services.ml_service import ml_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/java", tags=["java-fundamentals"])

JAVA_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "java_topics_data.json"
JAVA_TOPICS: List[Dict[str, Any]] = []
JAVA_TOPIC_MAP: Dict[str, Dict[str, Any]] = {}
TOPIC_METADATA: List[Dict[str, Any]] = []

if JAVA_DATA_PATH.exists():
    try:
        with open(JAVA_DATA_PATH, "r", encoding="utf-8") as f:
            _java_data = json.load(f)
            JAVA_TOPICS = _java_data.get("topics", [])
            for t in JAVA_TOPICS:
                JAVA_TOPIC_MAP[t["id"]] = t
                TOPIC_METADATA.append({
                    "id": t["id"],
                    "number": t["number"],
                    "numberDisplay": t["numberDisplay"],
                    "moduleId": t.get("moduleId", "mod-java-architecture-basics"),
                    "moduleTitle": t.get("moduleTitle", "Module 01: Java Core Architecture & Basics"),
                    "title": t["title"],
                    "slug": t["slug"],
                    "difficulty": t["difficulty"],
                    "estimatedMinutes": t["estimatedMinutes"],
                    "desc": t.get("shortDescription", ""),
                    "shortDescription": t.get("shortDescription", ""),
                    "prerequisiteId": t.get("prerequisiteId")
                })
    except Exception as e:
        print(f"[java_routes] Error loading Java topics data: {e}")


class JavaProgressUpdatePayload(BaseModel):
    topic_id: str
    status: Optional[str] = "IN_PROGRESS"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


@router.get("/fundamentals")
async def get_java_fundamentals_dashboard(request: Request):
    """Retrieve full dashboard overview for Java Core Architecture & Basics with live progress from SQLite."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "java-basics")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0

    topics_output = []
    current_topic_id = TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-java-intro"
    first_incomplete_found = False

    for idx, meta in enumerate(TOPIC_METADATA):
        t_id = meta["id"]
        prog = progress_map.get(t_id, {})
        status = prog.get("status", "NOT_STARTED")
        comp_pct = float(prog.get("completion_pct") or 0.0)
        quiz_score = prog.get("quiz_score")
        time_spent = float(prog.get("time_spent_seconds") or 0.0)
        total_time_spent += time_spent

        if status == "COMPLETED" or comp_pct >= 95.0:
            status = "COMPLETED"
            completed_count += 1
            if quiz_score is not None and quiz_score > 0:
                quiz_completed_count += 1
        elif status == "IN_PROGRESS" or comp_pct > 0.0:
            status = "IN_PROGRESS"
            if not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True
        else:
            # Sequential topic unlock rule
            if idx == 0:
                status = "NOT_STARTED"
            elif idx > 0 and (topics_output[idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS")):
                status = "NOT_STARTED"
            else:
                status = "LOCKED"

            if status != "LOCKED" and not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True

        topics_output.append({
            **meta,
            "status": status,
            "completion_percentage": comp_pct,
            "quiz_score": quiz_score,
            "attempts": prog.get("attempts", 0),
            "time_spent_seconds": time_spent,
            "has_adapted_lesson": False
        })

    total_topics = len(TOPIC_METADATA)
    overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0
    remaining_minutes = sum(
        t["estimatedMinutes"] for t in topics_output if t["status"] != "COMPLETED"
    )

    # Determine completed modules (Module 1: 0..5, Module 2: 6..16, Module 3: 17..27)
    mod1_done = all(t["status"] == "COMPLETED" for t in topics_output[0:6]) if len(topics_output) >= 6 else False
    mod2_done = all(t["status"] == "COMPLETED" for t in topics_output[6:17]) if len(topics_output) >= 17 else False
    mod3_done = all(t["status"] == "COMPLETED" for t in topics_output[17:28]) if len(topics_output) >= 28 else False
    completed_modules = sum([1 for m in [mod1_done, mod2_done, mod3_done] if m])

    return {
        "title": "Java Core Architecture & Basics",
        "subtitle": "Build a strong foundation in Java by understanding its architecture, programming fundamentals, control structures, methods, arrays, and problem-solving techniques.",
        "language": "java",
        "level": "Beginner",
        "total_modules": 3,
        "completed_modules": completed_modules,
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 3,
        "estimated_remaining_minutes": remaining_minutes,
        "total_duration_hours": 8,
        "learning_signals_status": "Calibrated & Active",
        "topics": topics_output
    }


@router.get("/topic/{topic_id}")
async def get_java_topic_detail(topic_id: str, request: Request):
    """Retrieve full curriculum details for a specific Java topic."""
    # Check legacy aliases
    if topic_id == "top-java-fundamentals":
        topic_id = "top-java-intro"
    elif topic_id == "top-java-control-flow":
        topic_id = "top-java-conditionals"
    elif topic_id == "top-java-methods-arrays":
        topic_id = "top-java-methods-intro"

    topic = JAVA_TOPIC_MAP.get(topic_id)
    if not topic:
        # Fallback to curriculum service
        topic = curriculum_service.get_topic_detail(topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail=f"Java topic {topic_id} not found")

    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "java-basics")
    progress_map = {p["topic_id"]: p for p in raw_progress}
    p = progress_map.get(topic_id, {})

    return {
        **topic,
        "user_progress": {
            "status": p.get("status", "NOT_STARTED"),
            "completion_pct": p.get("completion_pct", 0),
            "quiz_score": p.get("quiz_score"),
            "attempts": p.get("attempts", 0),
            "time_spent_seconds": p.get("time_spent_seconds", 0)
        }
    }


@router.post("/progress")
async def update_java_progress(payload: JavaProgressUpdatePayload, request: Request):
    """Save user progress and quiz scores for a Java topic."""
    user_id = get_current_user_id(request)
    state_store.save_topic_progress(
        user_id=user_id,
        course_id="java-basics",
        topic_id=payload.topic_id,
        status=payload.status,
        completion_pct=payload.completion_pct,
        quiz_score=payload.quiz_score,
        attempts_delta=payload.attempts_delta,
        time_spent_delta=payload.time_spent_delta
    )
    return {
        "success": True,
        "message": f"Updated Java progress for {payload.topic_id}",
        "topic_id": payload.topic_id,
        "status": payload.status
    }


@router.post("/analyze-signals")
@router.post("/adaptation/analyze")
async def analyze_java_signals(request: Request):
    """Analyze learner behavioral signals and return cognitive load insights."""
    body = await request.json()
    user_id = get_current_user_id(request)
    topic_id = body.get("topic_id", "top-java-intro")

    eval_result = ml_service.evaluate({
        "timeSpentSeconds": body.get("time_spent_seconds", 60.0),
        "codingErrorCount": body.get("coding_error_count", 0),
        "accuracy": body.get("accuracy", 100),
        "backtracking": body.get("backtracking", 0),
        "quiz_attempts": body.get("quiz_attempts", 1),
        "hesitation_time_seconds": body.get("hesitation_time_seconds", 5.0)
    })

    state_store.record_adaptive_evaluation(user_id, topic_id, eval_result)

    return {
        "topic_id": topic_id,
        "cognitive_load": eval_result.get("cognitive_load", "MEDIUM"),
        "confidence": eval_result.get("confidence", 0.85),
        "action": eval_result.get("action", "MAINTAIN_PACE"),
        "recommendation": eval_result.get("recommendation", "Your cognitive load is optimal. Keep building your Java skills!"),
        "features": eval_result.get("features", {})
    }
