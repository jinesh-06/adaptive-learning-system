"""User personal workspace routes: bookmarks, notes, and learning history."""

from fastapi import APIRouter, Request, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

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
    conn = state_store.get_connection()
    cur = conn.cursor()

    # 1. Check if authenticated user owns a matching bookmark (by bookmark ID or item_id)
    cur.execute(
        "SELECT id, user_id FROM bookmarks WHERE user_id = ? AND (id = ? OR item_id = ?)",
        (user_id, bookmark_id, bookmark_id)
    )
    user_row = cur.fetchone()

    if user_row:
        conn.close()
        state_store.delete_bookmark(user_id, bookmark_id)
        return {"success": True}

    # 2. Check if the bookmark exists belonging to another user
    cur.execute(
        "SELECT id, user_id FROM bookmarks WHERE id = ? OR item_id = ?",
        (bookmark_id, bookmark_id)
    )
    other_row = cur.fetchone()
    conn.close()

    if other_row:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to delete this bookmark."
        )

    # 3. Not found anywhere
    raise HTTPException(status_code=404, detail="Bookmark not found.")


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
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, user_id FROM notes WHERE id = ?", (note_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Note not found.")
    if row["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to modify this note.")

    return state_store.update_note(user_id, note_id, payload.model_dump(exclude_unset=True))


@router.delete("/notes/{note_id}")
async def delete_note(note_id: str, request: Request):
    user_id = get_current_user_id(request)
    conn = state_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, user_id FROM notes WHERE id = ?", (note_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Note not found.")
    if row["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to delete this note.")

    state_store.delete_note(user_id, note_id)
    return {"success": True}


def _parse_iso_or_sql_timestamp(ts_val: Any) -> Optional[datetime]:
    if not ts_val:
        return None
    if isinstance(ts_val, datetime):
        if ts_val.tzinfo is None:
            return ts_val.replace(tzinfo=timezone.utc)
        return ts_val.astimezone(timezone.utc)
    try:
        s = str(ts_val).strip().replace("Z", "+00:00").replace(" ", "T")
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


# --- Learning History ---
@router.get("/learning-history")
async def get_learning_history(request: Request):
    user_id = get_current_user_id(request)
    events = state_store.get_telemetry_events(user_id, limit=50)
    adaptive_evals = state_store.get_adaptive_history(user_id, limit=20)
    quiz_attempts = state_store.get_quiz_attempts(user_id)

    eval_map = {}
    for ev in adaptive_evals:
        t_id = ev.get("topic_id")
        if t_id and t_id not in eval_map:
            eval_map[t_id] = ev.get("cognitive_load", "MEDIUM")

    formatted_history = []
    recent_events = []

    quiz_scores = []
    total_time_seconds = 0.0

    for q in quiz_attempts:
        t_id = q.get("topic_id", "quiz")
        lang = "python"
        if t_id.startswith("top-c-") and not t_id.startswith("top-cpp-"):
            lang = "c"
        elif t_id.startswith("top-cpp-"):
            lang = "cpp"
        elif t_id.startswith("top-java-"):
            lang = "java"

        raw_pct = q.get("percentage") if q.get("percentage") is not None else q.get("score")
        try:
            pct = float(raw_pct) if raw_pct is not None else 0.0
        except (ValueError, TypeError):
            pct = 0.0
        quiz_scores.append(pct)

        raw_spent = q.get("time_spent")
        try:
            time_spent = float(raw_spent) if raw_spent is not None else 0.0
        except (ValueError, TypeError):
            time_spent = 0.0
        total_time_seconds += time_spent

        ts = q.get("created_at") or datetime.utcnow().isoformat()

        h_item = {
            "id": f"qa-{q.get('id')}",
            "date": ts,
            "timestamp": ts,
            "language": lang,
            "topic_id": t_id,
            "topic_title": f"Knowledge Assessment: {t_id.replace('top-', '').replace('-', ' ').title()}",
            "quiz_score": round(pct),
            "coding_score": None,
            "time_spent_seconds": round(time_spent),
            "duration_seconds": round(time_spent),
            "adaptive_state": eval_map.get(t_id, "MEDIUM"),
            "cognitive_state": eval_map.get(t_id, "MEDIUM"),
            "improvement_summary": f"Scored {round(pct)}% with {q.get('correct_count', 0)}/{q.get('total_questions', 10)} correct answers",
            "type": "QUIZ",
            "metadata": {}
        }
        formatted_history.append(h_item)

    coding_scores = []
    matched_quiz_attempt_ids = set()

    for ev in events:
        t_id = ev.get("topic_id") or "general"
        ev_type = ev.get("event_type", "LESSON")
        raw_dur = ev.get("duration")
        try:
            dur = float(raw_dur) if raw_dur is not None else 0.0
        except (ValueError, TypeError):
            dur = 0.0

        ts = ev.get("timestamp") or datetime.utcnow().isoformat()
        meta = ev.get("metadata") or {}

        # Avoid double-counting duration when a QUIZ_SUBMIT telemetry event
        # corresponds to an existing quiz attempt record.
        is_duplicate_quiz_submit = False
        if ev_type == "QUIZ_SUBMIT":
            ev_dt = _parse_iso_or_sql_timestamp(ts)
            best_match_id = None
            min_time_diff = float("inf")

            for q in quiz_attempts:
                qid = q.get("id")
                if qid in matched_quiz_attempt_ids:
                    continue

                q_topic = q.get("topic_id")
                if t_id and q_topic and t_id != "general" and q_topic != "quiz" and t_id != q_topic:
                    continue

                raw_q_spent = q.get("time_spent")
                try:
                    q_spent = float(raw_q_spent) if raw_q_spent is not None else 0.0
                except (ValueError, TypeError):
                    q_spent = 0.0

                if abs(q_spent - dur) > 1.0 and round(q_spent) != round(dur):
                    continue

                if "percentage" in meta and meta["percentage"] is not None:
                    q_pct = float(q.get("percentage") if q.get("percentage") is not None else (q.get("score") or 0.0))
                    if abs(float(meta["percentage"]) - q_pct) > 1.0:
                        continue

                if "correct_count" in meta and meta["correct_count"] is not None:
                    if int(meta["correct_count"]) != int(q.get("correct_count") or 0):
                        continue

                q_dt = _parse_iso_or_sql_timestamp(q.get("created_at") or q.get("timestamp"))
                if ev_dt and q_dt:
                    diff = abs((ev_dt - q_dt).total_seconds())
                    if diff > 3600:
                        continue
                else:
                    diff = 0.0

                if diff < min_time_diff:
                    min_time_diff = diff
                    best_match_id = qid

            if best_match_id is not None:
                matched_quiz_attempt_ids.add(best_match_id)
                is_duplicate_quiz_submit = True

        if not is_duplicate_quiz_submit:
            total_time_seconds += dur

        lang = meta.get("language")
        if not lang:
            if t_id.startswith("top-c-") and not t_id.startswith("top-cpp-"):
                lang = "c"
            elif t_id.startswith("top-cpp-"):
                lang = "cpp"
            elif t_id.startswith("top-java-"):
                lang = "java"
            else:
                lang = "python"

        coding_score = None
        if ev_type == "CODE_SUBMIT":
            if "accuracy" in meta and meta["accuracy"] is not None:
                coding_score = round(float(meta["accuracy"]))
            elif meta.get("passed") is True:
                coding_score = 100
            elif meta.get("passed") is False:
                coding_score = 0
            if coding_score is not None:
                coding_scores.append(coding_score)

        h_item = {
            "id": f"ev-{ev.get('id')}",
            "date": ts,
            "timestamp": ts,
            "language": lang,
            "topic_id": t_id,
            "topic_title": f"{ev_type.replace('_', ' ').title()}: {t_id.replace('top-', '').replace('-', ' ').title()}",
            "quiz_score": None,
            "coding_score": coding_score,
            "time_spent_seconds": round(dur),
            "duration_seconds": round(dur),
            "adaptive_state": eval_map.get(t_id, "MEDIUM"),
            "cognitive_state": eval_map.get(t_id, "MEDIUM"),
            "improvement_summary": f"{ev_type.replace('_', ' ').title()} recorded ({round(dur)}s focus)",
            "type": ev_type,
            "metadata": meta
        }
        formatted_history.append(h_item)
        recent_events.append({
            "id": f"ev-{ev.get('id')}",
            "type": ev_type,
            "topic_id": t_id,
            "duration_seconds": round(dur),
            "timestamp": ts,
            "metadata": meta
        })

    formatted_history.sort(key=lambda x: str(x.get("date") or ""), reverse=True)

    avg_quiz = round(sum(quiz_scores) / len(quiz_scores)) if quiz_scores else 0
    avg_coding = round(sum(coding_scores) / len(coding_scores)) if coding_scores else 0
    total_time_min = round(total_time_seconds / 60.0)

    # Order quiz attempts newest-first defensively using timestamps
    def _quiz_sort_key(attempt: Dict[str, Any]):
        dt = _parse_iso_or_sql_timestamp(attempt.get("created_at") or attempt.get("timestamp"))
        return dt if dt is not None else datetime.min.replace(tzinfo=timezone.utc)

    sorted_attempts = sorted(quiz_attempts, key=_quiz_sort_key, reverse=True)
    if len(sorted_attempts) >= 2:
        latest_attempt = sorted_attempts[0]
        prev_attempt = sorted_attempts[1]
        latest_pct = float(
            latest_attempt.get("percentage")
            if latest_attempt.get("percentage") is not None
            else (latest_attempt.get("score") or 0.0)
        )
        prev_pct = float(
            prev_attempt.get("percentage")
            if prev_attempt.get("percentage") is not None
            else (prev_attempt.get("score") or 0.0)
        )
        improvement_delta = round(latest_pct - prev_pct)
    else:
        improvement_delta = 0

    adaptive_efficiency = f"{round((avg_quiz + avg_coding) / 2)}%" if (quiz_scores or coding_scores) else "--"

    insights = {
        "avg_quiz_score": avg_quiz,
        "avg_coding_score": avg_coding,
        "total_time_minutes": total_time_min,
        "improvement_delta": improvement_delta,
        "adaptive_efficiency_rate": adaptive_efficiency
    }

    return {
        "success": True,
        "user_id": user_id,
        "total_sessions": len(formatted_history),
        "history": formatted_history,
        "recent_events": recent_events,
        "recent_adaptive_evaluations": adaptive_evals,
        "insights": insights,
        "avg_quiz_score": avg_quiz,
        "avg_coding_score": avg_coding,
        "total_time_minutes": total_time_min,
        "improvement_delta": improvement_delta,
        "adaptive_efficiency_rate": adaptive_efficiency
    }
