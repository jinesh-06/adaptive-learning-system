"""Telemetry routes for receiving behavioral learning events."""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional

from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(tags=["telemetry"])


class TelemetryEventPayload(BaseModel):
    topic_id: Optional[str] = None
    event_type: str
    duration: Optional[float] = 0.0
    metadata: Optional[Dict[str, Any]] = None


@router.post("/behavior/event")
async def record_behavior_event(payload: TelemetryEventPayload, request: Request):
    user_id = get_current_user_id(request)
    state_store.record_telemetry(
        user_id=user_id,
        topic_id=payload.topic_id,
        event_type=payload.event_type,
        duration=payload.duration or 0.0,
        metadata=payload.metadata or {}
    )
    return {"success": True, "event": payload.event_type}
