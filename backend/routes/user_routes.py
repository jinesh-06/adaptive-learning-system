"""User personal workspace routes: bookmarks, notes, and learning history."""

from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(tags=["user_workspace"])


# --- Bookmarks ---
class BookmarkPayload(BaseModel):
    item_type: str
    item_id: str
    title: str
    snippet: Optional[str] = None
    language: Optional[str] = "python"
    topic_id: Optional[str] = None


@router.get("/bookmarks")
async def get_bookmarks(type: Optional[str] = Query(None), request: Request = None):
    user_id = get_current_user_id(request)
    return state_store.get_bookmarks(user_id, item_type=type)


@router.post("/bookmarks")
async def add_bookmark(payload: BookmarkPayload, request: Request):
    user_id = get_current_user_id(request)
    return state_store.add_bookmark(user_id, payload.model_dump())


@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, request: Request):
    user_id = get_current_user_id(request)
    state_store.delete_bookmark(user_id, bookmark_id)
    return {"success": True}


@router.get("/bookmarks/check")
async def check_bookmark_status(item_type: str = Query(...), item_id: str = Query(...), request: Request = None):
    user_id = get_current_user_id(request)
    is_bookmarked = state_store.check_bookmark(user_id, item_type, item_id)
    return {"bookmarked": is_bookmarked}


# --- Notes ---
class CreateNotePayload(BaseModel):
    language: str
    course_id: Optional[str] = None
    topic_id: str
    subtopic_title: Optional[str] = None
    title: str
    content: str


class UpdateNotePayload(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    subtopic_title: Optional[str] = None


@router.get("/notes")
async def get_notes(
    q: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    topic_id: Optional[str] = Query(None),
    request: Request = None
):
    user_id = get_current_user_id(request)
    return state_store.get_notes(user_id, query=q, language=language, topic_id=topic_id)


@router.post("/notes")
async def create_note(payload: CreateNotePayload, request: Request):
    user_id = get_current_user_id(request)
    return state_store.create_note(user_id, payload.model_dump())


@router.put("/notes/{note_id}")
async def update_note(note_id: str, payload: UpdateNotePayload, request: Request):
    user_id = get_current_user_id(request)
    return state_store.update_note(user_id, note_id, payload.model_dump(exclude_unset=True))


@router.delete("/notes/{note_id}")
async def delete_note(note_id: str, request: Request):
    user_id = get_current_user_id(request)
    state_store.delete_note(user_id, note_id)
    return {"success": True}


# --- Learning History ---
@router.get("/learning-history")
async def get_learning_history(request: Request):
    user_id = get_current_user_id(request)
    events = state_store.get_telemetry_events(user_id, limit=30)
    adaptive_evals = state_store.get_adaptive_history(user_id, limit=20)

    formatted_history = []
    for ev in events:
        formatted_history.append({
            "id": f"ev-{ev.get('id')}",
            "type": ev.get("event_type"),
            "topic_id": ev.get("topic_id"),
            "duration_seconds": ev.get("duration", 0),
            "timestamp": ev.get("timestamp"),
            "metadata": ev.get("metadata", {})
        })

    return {
        "user_id": user_id,
        "total_sessions": len(events),
        "recent_events": formatted_history,
        "recent_adaptive_evaluations": adaptive_evals
    }
