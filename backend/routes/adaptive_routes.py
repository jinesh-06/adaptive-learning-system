"""Adaptive Engine routes for real-time cognitive load evaluation and history."""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from backend.services.ml_service import ml_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/adaptive", tags=["adaptive"])


class AdaptiveEvaluatePayload(BaseModel):
    topicId: str
    recentQuizAccuracy: Optional[float] = 75.0
    codingErrorCount: Optional[int] = 0
    timeSpentSeconds: Optional[float] = 120.0
    features: Optional[Dict[str, Any]] = None


@router.post("/evaluate")
async def evaluate_adaptive(payload: AdaptiveEvaluatePayload, request: Request):
    user_id = get_current_user_id(request)

    eval_input = {
        "topicId": payload.topicId,
        "recentQuizAccuracy": payload.recentQuizAccuracy,
        "codingErrorCount": payload.codingErrorCount,
        "timeSpentSeconds": payload.timeSpentSeconds,
    }
    if payload.features:
        eval_input.update(payload.features)

    # Call ML Service
    result = ml_service.evaluate(eval_input)

    # Determine suggested adaptation description adhering to system terminology
    load = result.get("cognitive_load")
    if load == "HIGH":
        suggested_adaptation = "Suggested Adaptation: Break complex topic into micro-checkpoints, simplify syntax examples, and activate step-by-step guidance."
    elif load == "LOW":
        suggested_adaptation = "Suggested Adaptation: Accelerate pace, condense introductory explanations, and unlock advanced critical challenges."
    else:
        suggested_adaptation = "Suggested Adaptation: Maintain balanced pacing with standard practical code examples and concept recaps."

    result["suggested_adaptation"] = suggested_adaptation

    # Persist in state store
    state_store.record_adaptive_evaluation(user_id, payload.topicId, result)

    return result


@router.get("/history")
async def get_adaptive_history(request: Request):
    user_id = get_current_user_id(request)
    return state_store.get_adaptive_history(user_id)
