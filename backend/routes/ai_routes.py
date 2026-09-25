"""AI Assistant and Progressive Hints routes connecting Gemini and RAG."""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.services.llm_service import llm_service
from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/ai", tags=["ai"])


class AskAiRequest(BaseModel):
    question: str
    language: Optional[str] = "python"
    topic: Optional[str] = None
    cognitive_load: Optional[str] = "MEDIUM"
    tutor_mode: Optional[str] = None
    level: Optional[str] = None
    code_context: Optional[str] = None


class ProgressiveHintRequest(BaseModel):
    question: str
    code_snippet: Optional[str] = None
    hint_level: int = 1
    topic: Optional[str] = None
    language: Optional[str] = "python"
    cognitive_load: Optional[str] = "MEDIUM"


@router.post("/ask")
async def ask_ai_assistant(payload: AskAiRequest, request: Request):
    user_id = get_current_user_id(request)

    response = llm_service.generate_explanation(
        question=payload.question,
        cognitive_load=payload.cognitive_load or "MEDIUM",
        course=payload.language,
        topic=payload.topic,
        level=payload.level,
        tutor_mode=payload.tutor_mode,
        code_context=payload.code_context
    )

    # Record telemetry
    state_store.record_telemetry(user_id, payload.topic, "AI_ASSISTANT_QUERY", 0.0, {
        "question": payload.question[:100],
        "mode": payload.tutor_mode,
        "cognitive_load": payload.cognitive_load
    })

    return response


@router.post("/hint")
async def request_progressive_hint(payload: ProgressiveHintRequest, request: Request):
    user_id = get_current_user_id(request)

    response = llm_service.generate_hint(
        question=payload.question,
        hint_level=payload.hint_level,
        code_snippet=payload.code_snippet,
        cognitive_load=payload.cognitive_load or "MEDIUM",
        topic=payload.topic,
        language=payload.language
    )

    state_store.record_telemetry(user_id, payload.topic, "HINT_REQUEST", 0.0, {
        "hint_level": payload.hint_level,
        "topic": payload.topic
    })

    return response
