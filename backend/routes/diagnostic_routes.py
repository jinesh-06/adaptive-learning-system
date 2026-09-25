"""Diagnostic Assessment routes for onboarding and placement testing."""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional

from backend.services.curriculum_service import curriculum_service
from backend.services.ml_service import ml_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/diagnostic", tags=["diagnostic"])


class DiagnosticSubmission(BaseModel):
    answers: Dict[str, int]
    time_spent: Optional[float] = 120.0


@router.get("/{language}/questions")
async def get_diagnostic_questions(language: str):
    return curriculum_service.get_diagnostic_questions(language=language)


@router.post("/{language}/submit")
async def submit_diagnostic(language: str, payload: DiagnosticSubmission, request: Request):
    user_id = get_current_user_id(request)
    questions = curriculum_service.get_diagnostic_questions(language=language)

    correct_count = 0
    total = len(questions) if questions else 1
    for q in questions:
        q_id = str(q.get("id"))
        if payload.answers.get(q_id) == q.get("correct_index"):
            correct_count += 1

    score_pct = round((correct_count / total) * 100)

    # Determine recommended placement and cognitive level
    if score_pct >= 80:
        recommended_level = "advanced"
        suggested_mode = "CONCISE"
    elif score_pct >= 50:
        recommended_level = "intermediate"
        suggested_mode = "BALANCED"
    else:
        recommended_level = "beginner"
        suggested_mode = "SIMPLIFIED"

    # Update preferences in state store
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT OR REPLACE INTO user_preferences (user_id, selected_language, current_level, preferred_mode)
           VALUES (?, ?, ?, ?)""",
        (user_id, language, recommended_level, "adaptive")
    )
    conn.commit()
    conn.close()

    state_store.record_telemetry(user_id, f"diagnostic_{language}", "DIAGNOSTIC_SUBMIT", payload.time_spent, {
        "score_pct": score_pct,
        "recommended_level": recommended_level
    })

    return {
        "success": True,
        "score": correct_count,
        "total": total,
        "score_percentage": score_pct,
        "recommended_level": recommended_level,
        "suggested_content_mode": suggested_mode,
        "analysis": f"Based on your diagnostic accuracy of {score_pct}%, your starting track is calibrated to {recommended_level.capitalize()} level."
    }
