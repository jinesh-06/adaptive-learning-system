"""State and persistence store for users, telemetry, adaptive history, bookmarks, and notes."""

import json
import os
import sqlite3
import threading
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime, date, timedelta

from backend.config import DB_PATH, PLATFORM_DATA_PATH


class StateStore:
    """Thread-safe persistent data store."""

    _lock = threading.Lock()

    def __init__(self):
        self.db_path = str(DB_PATH)
        self._init_platform_data()
        self._init_sqlite()

    def _init_platform_data(self):
        """Load initial platform seed data."""
        self.platform_data: Dict[str, Any] = {}
        if PLATFORM_DATA_PATH.exists():
            try:
                with open(PLATFORM_DATA_PATH, "r", encoding="utf-8") as f:
                    self.platform_data = json.load(f)
            except Exception as e:
                print(f"[StateStore] Failed to load platform data: {e}")

    def _init_sqlite(self):
        """Create SQLite tables if they do not exist."""
        with self._lock:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()

            # Users table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE,
                    name TEXT,
                    password_hash TEXT,
                    role TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # User Preferences table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_preferences (
                    user_id TEXT PRIMARY KEY,
                    selected_language TEXT,
                    current_level TEXT,
                    preferred_mode TEXT
                )
            """)

            # Telemetry events table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS telemetry_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    topic_id TEXT,
                    event_type TEXT,
                    duration REAL,
                    metadata_json TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Adaptive evaluation history
            cur.execute("""
                CREATE TABLE IF NOT EXISTS adaptive_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    topic_id TEXT,
                    cognitive_load TEXT,
                    confidence REAL,
                    recommended_action TEXT,
                    reason TEXT,
                    metadata_json TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Bookmarks
            cur.execute("""
                CREATE TABLE IF NOT EXISTS bookmarks (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    item_type TEXT,
                    item_id TEXT,
                    title TEXT,
                    snippet TEXT,
                    language TEXT,
                    topic_id TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Notes
            cur.execute("""
                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    language TEXT,
                    course_id TEXT,
                    topic_id TEXT,
                    subtopic_title TEXT,
                    title TEXT,
                    content TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Feedback
            cur.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    topic_id TEXT,
                    feedback TEXT,
                    comment TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # User Progress table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_progress (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    course_id TEXT,
                    topic_id TEXT,
                    status TEXT DEFAULT 'NOT_STARTED',
                    completion_pct REAL DEFAULT 0.0,
                    quiz_score REAL DEFAULT 0.0,
                    attempts INTEGER DEFAULT 0,
                    time_spent_seconds REAL DEFAULT 0.0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # AI-Generated Adapted Lessons Cache
            cur.execute("""
                CREATE TABLE IF NOT EXISTS adapted_lessons (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    topic_id TEXT,
                    adaptation_strategy TEXT,
                    lesson_data_json TEXT,
                    signals_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Generated 10-Question Quizzes Cache
            cur.execute("""
                CREATE TABLE IF NOT EXISTS generated_quizzes (
                    topic_id TEXT PRIMARY KEY,
                    quiz_data_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Quiz Attempts and Scoring Persistence
            cur.execute("""
                CREATE TABLE IF NOT EXISTS quiz_attempts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    topic_id TEXT,
                    score REAL,
                    percentage REAL,
                    correct_count INTEGER,
                    total_questions INTEGER,
                    answers_json TEXT,
                    review_json TEXT,
                    adaptive_feedback_json TEXT,
                    time_spent REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.commit()

            # Seed default guest user if missing
            cur.execute("SELECT id FROM users WHERE id = 'guest-learner'")
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    ("guest-learner", "learner@cognitive.edu", "Learner", "student")
                )
                cur.execute(
                    "INSERT INTO user_preferences (user_id, selected_language, current_level, preferred_mode) VALUES (?, ?, ?, ?)",
                    ("guest-learner", "python", "beginner", "adaptive")
                )
                conn.commit()

            conn.close()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA busy_timeout=30000;")
        except Exception:
            pass
        return conn

    # --- Telemetry & Behavior ---
    def record_telemetry(self, user_id: str, topic_id: Optional[str], event_type: str, duration: float, metadata: Dict[str, Any]):
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO telemetry_events (user_id, topic_id, event_type, duration, metadata_json) VALUES (?, ?, ?, ?, ?)",
                (user_id, topic_id, event_type, duration, json.dumps(metadata or {}))
            )
            conn.commit()
            conn.close()

    def get_telemetry_events(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cur = conn.cursor()
        if user_id:
            cur.execute("SELECT * FROM telemetry_events WHERE user_id = ? ORDER BY id DESC LIMIT ?", (user_id, limit))
        else:
            cur.execute("SELECT * FROM telemetry_events ORDER BY id DESC LIMIT ?", (limit,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        for r in rows:
            if r.get("metadata_json"):
                try:
                    r["metadata"] = json.loads(r["metadata_json"])
                except Exception:
                    r["metadata"] = {}
        return rows

    # --- Adaptive Evaluation History ---
    def record_adaptive_evaluation(self, user_id: str, topic_id: str, eval_result: Dict[str, Any]):
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute(
                """INSERT INTO adaptive_history
                   (user_id, topic_id, cognitive_load, confidence, recommended_action, reason, metadata_json)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    user_id,
                    topic_id,
                    eval_result.get("cognitive_load", "MEDIUM"),
                    float(eval_result.get("confidence", 0.85)),
                    eval_result.get("recommended_action", "CONTINUE"),
                    eval_result.get("reason", ""),
                    json.dumps(eval_result)
                )
            )
            conn.commit()
            conn.close()

    def get_adaptive_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM adaptive_history WHERE user_id = ? ORDER BY id DESC LIMIT ?",
            (user_id, limit)
        )
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        for r in rows:
            if r.get("metadata_json"):
                try:
                    r["details"] = json.loads(r["metadata_json"])
                except Exception:
                    pass
        return rows

    # --- Bookmarks ---
    def get_bookmarks(self, user_id: str, item_type: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cur = conn.cursor()
        if item_type and item_type != "all":
            cur.execute("SELECT * FROM bookmarks WHERE user_id = ? AND item_type = ? ORDER BY created_at DESC", (user_id, item_type))
        else:
            cur.execute("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    def add_bookmark(self, user_id: str, bookmark: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            b_id = bookmark.get("id") or f"bm_{bookmark.get('item_type')}_{bookmark.get('item_id')}"
            cur.execute(
                """INSERT OR REPLACE INTO bookmarks (id, user_id, item_type, item_id, title, snippet, language, topic_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    b_id,
                    user_id,
                    bookmark.get("item_type"),
                    bookmark.get("item_id"),
                    bookmark.get("title"),
                    bookmark.get("snippet", ""),
                    bookmark.get("language", "python"),
                    bookmark.get("topic_id", "")
                )
            )
            conn.commit()
            conn.close()
            return {"success": True, "id": b_id}

    def delete_bookmark(self, user_id: str, bookmark_id: str) -> bool:
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute("DELETE FROM bookmarks WHERE user_id = ? AND (id = ? OR item_id = ?)", (user_id, bookmark_id, bookmark_id))
            conn.commit()
            conn.close()
            return True

    def check_bookmark(self, user_id: str, item_type: str, item_id: str) -> bool:
        conn = self.get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM bookmarks WHERE user_id = ? AND item_type = ? AND item_id = ?", (user_id, item_type, item_id))
        found = cur.fetchone() is not None
        conn.close()
        return found

    # --- Notes ---
    def get_notes(self, user_id: str, query: Optional[str] = None, language: Optional[str] = None, topic_id: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cur = conn.cursor()
        sql = "SELECT * FROM notes WHERE user_id = ?"
        params: List[Any] = [user_id]
        if language and language != "all":
            sql += " AND language = ?"
            params.append(language)
        if topic_id and topic_id != "all":
            sql += " AND topic_id = ?"
            params.append(topic_id)
        if query:
            sql += " AND (title LIKE ? OR content LIKE ?)"
            params.extend([f"%{query}%", f"%{query}%"])
        sql += " ORDER BY updated_at DESC"
        cur.execute(sql, tuple(params))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    def create_note(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            note_id = payload.get("id") or f"note_{int(os.times().system * 1000)}"
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute(
                """INSERT OR REPLACE INTO notes (id, user_id, language, course_id, topic_id, subtopic_title, title, content)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    note_id,
                    user_id,
                    payload.get("language", "python"),
                    payload.get("course_id", ""),
                    payload.get("topic_id", ""),
                    payload.get("subtopic_title", ""),
                    payload.get("title", "Untitled Note"),
                    payload.get("content", "")
                )
            )
            conn.commit()
            conn.close()
            return {"success": True, "id": note_id, "note": payload}

    def update_note(self, user_id: str, note_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            updates = []
            params = []
            for field in ["title", "content", "subtopic_title"]:
                if field in payload:
                    updates.append(f"{field} = ?")
                    params.append(payload[field])
            if updates:
                params.extend([user_id, note_id])
                cur.execute(f"UPDATE notes SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND id = ?", tuple(params))
                conn.commit()
            conn.close()
            return {"success": True, "id": note_id}

    def delete_note(self, user_id: str, note_id: str) -> bool:
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute("DELETE FROM notes WHERE user_id = ? AND id = ?", (user_id, note_id))
            conn.commit()
            conn.close()
            return True

    # --- Feedback ---
    def record_feedback(self, user_id: str, topic_id: str, feedback: str, comment: Optional[str] = None):
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO feedback (user_id, topic_id, feedback, comment) VALUES (?, ?, ?, ?)",
                (user_id, topic_id, feedback, comment or "")
            )
            conn.commit()
            conn.close()

    # --- Topic & Course Progress Persistence ---
    def get_user_course_progress(self, user_id: Optional[str] = "guest-learner", course_id: str = "py-beg") -> List[Dict[str, Any]]:
        safe_user_id = str(user_id or "guest-learner").strip() or "guest-learner"
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM user_progress WHERE user_id = ? AND course_id = ? ORDER BY topic_id ASC",
                (safe_user_id, course_id)
            )
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return rows
        except Exception as e:
            print(f"[StateStore] get_user_course_progress error: {e}")
            return []

    def get_user_adapted_topic_ids(self, user_id: Optional[str] = "guest-learner") -> set:
        safe_user_id = str(user_id or "guest-learner").strip() or "guest-learner"
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute("SELECT topic_id FROM adapted_lessons WHERE user_id = ?", (safe_user_id,))
            rows = cur.fetchall()
            conn.close()
            return {r["topic_id"] for r in rows if r["topic_id"]}
        except Exception as e:
            print(f"[StateStore] get_user_adapted_topic_ids error: {e}")
            return set()

    def get_topic_progress(self, topic_id: str, user_id: str = "guest-learner", course_id: Optional[str] = None) -> str:
        """Get progress status for a specific topic, defaulting to NOT_STARTED."""
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            row = None
            if course_id:
                cur.execute(
                    "SELECT status FROM user_progress WHERE topic_id = ? AND user_id = ? AND course_id = ? ORDER BY updated_at DESC LIMIT 1",
                    (topic_id, user_id, course_id)
                )
                row = cur.fetchone()
            if not row:
                cur.execute(
                    "SELECT status FROM user_progress WHERE topic_id = ? AND user_id = ? ORDER BY updated_at DESC LIMIT 1",
                    (topic_id, user_id)
                )
                row = cur.fetchone()
            conn.close()
            if row and row["status"]:
                return row["status"]
            return "NOT_STARTED"
        except Exception as e:
            print(f"[StateStore] get_topic_progress error: {e}")
            return "NOT_STARTED"

    def save_topic_progress(
        self,
        user_id: str = "guest-learner",
        course_id: str = "c-int",
        topic_id: Optional[str] = None,
        status: Optional[str] = None,
        completion_pct: Optional[float] = None,
        quiz_score: Optional[float] = None,
        attempts_delta: int = 0,
        time_spent_delta: float = 0.0,
        **kwargs
    ) -> Dict[str, Any]:
        # Handle cases where topic_id was passed positionally as first arg: save_topic_progress(topic_id, status)
        if topic_id is None and isinstance(user_id, str) and (user_id.startswith("top-") or user_id.startswith("mod-")):
            topic_id = user_id
            status = course_id if status is None else status
            user_id = kwargs.get("user_id", "guest-learner")
            course_id = kwargs.get("course_id", "c-int")
        elif not topic_id:
            topic_id = "top-unknown"

        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            rec_id = f"{user_id}_{course_id}_{topic_id}"
            cur.execute("SELECT * FROM user_progress WHERE id = ?", (rec_id,))
            existing = cur.fetchone()

            if existing:
                cur_status = status or existing["status"]
                cur_comp = completion_pct if completion_pct is not None else existing["completion_pct"]
                cur_quiz = quiz_score if quiz_score is not None else existing["quiz_score"]
                cur_attempts = (existing["attempts"] or 0) + attempts_delta
                cur_time = (existing["time_spent_seconds"] or 0.0) + time_spent_delta

                cur.execute(
                    """UPDATE user_progress
                       SET status = ?, completion_pct = ?, quiz_score = ?, attempts = ?, time_spent_seconds = ?, updated_at = CURRENT_TIMESTAMP
                       WHERE id = ?""",
                    (cur_status, cur_comp, cur_quiz, cur_attempts, cur_time, rec_id)
                )
            else:
                cur_status = status or "IN_PROGRESS"
                cur_comp = completion_pct if completion_pct is not None else (100.0 if cur_status == "COMPLETED" else 0.0)
                cur_quiz = quiz_score if quiz_score is not None else 0.0
                cur_attempts = attempts_delta
                cur_time = time_spent_delta

                cur.execute(
                    """INSERT INTO user_progress (id, user_id, course_id, topic_id, status, completion_pct, quiz_score, attempts, time_spent_seconds)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (rec_id, user_id, course_id, topic_id, cur_status, cur_comp, cur_quiz, cur_attempts, cur_time)
                )

            conn.commit()
            conn.close()
            return {
                "id": rec_id,
                "user_id": user_id,
                "course_id": course_id,
                "topic_id": topic_id,
                "status": cur_status,
                "completion_pct": cur_comp,
                "quiz_score": cur_quiz,
                "attempts": cur_attempts,
                "time_spent_seconds": cur_time
            }

    # --- Adapted Lessons Cache & Retrieval ---
    def save_adapted_lesson(
        self,
        user_id: str,
        topic_id: str,
        adaptation_strategy: str,
        lesson_data: Dict[str, Any],
        signals: Optional[Dict[str, Any]] = None,
        detail_level: str = "standard"
    ) -> Dict[str, Any]:
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()
            mode_key = (detail_level or "standard").lower().strip()
            rec_id = f"{user_id}_{topic_id}_{mode_key}"
            cur.execute(
                """INSERT OR REPLACE INTO adapted_lessons
                   (id, user_id, topic_id, adaptation_strategy, lesson_data_json, signals_json, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (
                    rec_id,
                    user_id,
                    topic_id,
                    adaptation_strategy,
                    json.dumps(lesson_data),
                    json.dumps(signals or {})
                )
            )
            # Also keep a legacy alias record without mode suffix for backward compatibility
            legacy_id = f"{user_id}_{topic_id}"
            cur.execute(
                """INSERT OR REPLACE INTO adapted_lessons
                   (id, user_id, topic_id, adaptation_strategy, lesson_data_json, signals_json, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (
                    legacy_id,
                    user_id,
                    topic_id,
                    adaptation_strategy,
                    json.dumps(lesson_data),
                    json.dumps(signals or {})
                )
            )
            conn.commit()
            conn.close()
            return {"success": True, "id": rec_id, "topic_id": topic_id, "strategy": adaptation_strategy}

    def get_adapted_lesson(self, user_id: Optional[str], topic_id: str, detail_level: Optional[str] = None) -> Optional[Dict[str, Any]]:
        safe_user_id = str(user_id or "guest-learner").strip() or "guest-learner"
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            
            row = None
            if detail_level:
                mode_key = str(detail_level).lower().strip()
                rec_id = f"{safe_user_id}_{topic_id}_{mode_key}"
                cur.execute("SELECT * FROM adapted_lessons WHERE id = ?", (rec_id,))
                row = cur.fetchone()

            if not row:
                legacy_id = f"{safe_user_id}_{topic_id}"
                cur.execute("SELECT * FROM adapted_lessons WHERE id = ?", (legacy_id,))
                row = cur.fetchone()

            if not row:
                # Try finding any adapted lesson for this user and topic
                cur.execute(
                    "SELECT * FROM adapted_lessons WHERE user_id = ? AND topic_id = ? ORDER BY created_at DESC LIMIT 1",
                    (safe_user_id, topic_id)
                )
                row = cur.fetchone()

            conn.close()
            if not row:
                return None
            res = dict(row)
            if res.get("lesson_data_json"):
                try:
                    res["lesson_data"] = json.loads(res["lesson_data_json"])
                except Exception:
                    res["lesson_data"] = {}
            if res.get("signals_json"):
                try:
                    res["signals"] = json.loads(res["signals_json"])
                except Exception:
                    res["signals"] = {}
            return res
        except Exception as e:
            print(f"[StateStore] get_adapted_lesson error: {e}")
            return None

    def record_adaptation_feedback(
        self,
        user_id: str,
        topic_id: str,
        detail_level: str,
        helpful: bool,
        rating: str,
        comment: Optional[str] = None,
        completed_practice: Optional[bool] = False
    ) -> Dict[str, Any]:
        """Record learner feedback on an adapted explanation."""
        try:
            with self._lock:
                conn = self.get_connection()
                cur = conn.cursor()
                cur.execute(
                    """INSERT INTO feedback (user_id, topic_id, feedback, comment, timestamp)
                       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                    (
                        user_id,
                        topic_id,
                        f"helpful:{helpful}|detail:{detail_level}|rating:{rating}|practice:{completed_practice}",
                        comment or ""
                    )
                )
                conn.commit()
                conn.close()
                return {"success": True}
        except Exception as e:
            print(f"[StateStore] record_adaptation_feedback error: {e}")
            return {"success": False, "error": str(e)}

    # --- Generated 10-Question Quizzes Persistence ---
    def save_generated_quiz(self, topic_id: str, quiz_data: Dict[str, Any]):
        """Persist generated 10-question quiz in SQLite cache."""
        try:
            with self._lock:
                conn = self.get_connection()
                cur = conn.cursor()
                cur.execute(
                    """INSERT OR REPLACE INTO generated_quizzes (topic_id, quiz_data_json, updated_at)
                       VALUES (?, ?, CURRENT_TIMESTAMP)""",
                    (topic_id, json.dumps(quiz_data))
                )
                conn.commit()
                conn.close()
        except Exception as e:
            print(f"[StateStore] save_generated_quiz error: {e}")

    def get_generated_quiz(self, topic_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached 10-question quiz if present and valid."""
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT quiz_data_json FROM generated_quizzes WHERE topic_id = ?",
                (topic_id,)
            )
            row = cur.fetchone()
            conn.close()
            if row and row["quiz_data_json"]:
                data = json.loads(row["quiz_data_json"])
                if isinstance(data, dict) and len(data.get("questions", [])) == 10:
                    return data
            return None
        except Exception as e:
            print(f"[StateStore] get_generated_quiz error: {e}")
            return None

    def save_quiz_attempt(self, user_id: str, topic_id: str, attempt_data: Dict[str, Any]) -> str:
        """Persist quiz attempt record for tracking and preventing duplicate submissions."""
        import uuid
        attempt_id = attempt_data.get("id") or f"attempt-{uuid.uuid4().hex[:12]}"
        try:
            with self._lock:
                conn = self.get_connection()
                cur = conn.cursor()
                cur.execute(
                    """INSERT INTO quiz_attempts (
                           id, user_id, topic_id, score, percentage, correct_count,
                           total_questions, answers_json, review_json, adaptive_feedback_json, time_spent
                       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        attempt_id,
                        user_id,
                        topic_id,
                        float(attempt_data.get("score", 0.0)),
                        float(attempt_data.get("percentage", 0.0)),
                        int(attempt_data.get("correct_count", 0)),
                        int(attempt_data.get("total_questions", 10)),
                        json.dumps(attempt_data.get("answers", {})),
                        json.dumps(attempt_data.get("review", [])),
                        json.dumps(attempt_data.get("adaptive_feedback", {})),
                        float(attempt_data.get("time_spent", 0.0))
                    )
                )
                conn.commit()
                conn.close()
                return attempt_id
        except Exception as e:
            print(f"[StateStore] save_quiz_attempt error: {e}")
            return attempt_id

    def get_quiz_attempts(self, user_id: str, topic_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve history of quiz attempts."""
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            if topic_id:
                cur.execute(
                    """SELECT * FROM quiz_attempts WHERE user_id = ? AND topic_id = ?
                       ORDER BY created_at DESC LIMIT 20""",
                    (user_id, topic_id)
                )
            else:
                cur.execute(
                    """SELECT * FROM quiz_attempts WHERE user_id = ?
                       ORDER BY created_at DESC LIMIT 50""",
                    (user_id,)
                )
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return rows
        except Exception as e:
            print(f"[StateStore] get_quiz_attempts error: {e}")
            return []

    def update_topic_progress(self, topic_id: str, status: str, time_spent: float = 0.0, user_id: str = "guest-learner", course_id: str = "course-py-fund"):
        return self.save_topic_progress(user_id=user_id, course_id=course_id, topic_id=topic_id, status=status, time_spent_delta=time_spent)

    def record_telemetry_event(self, user_id: str, topic_id: Optional[str], event_type: str, duration: float, metadata: Optional[Dict[str, Any]] = None):
        return self.record_telemetry(user_id=user_id, topic_id=topic_id, event_type=event_type, duration=duration, metadata=metadata or {})

    def record_quiz_attempt(self, user_id: str, topic_id: str, score: float, total_questions: int = 10, time_spent: float = 60.0):
        percentage = score if score > 10 else (score / total_questions) * 100
        return self.save_quiz_attempt(user_id=user_id, topic_id=topic_id, attempt_data={
            "score": score,
            "percentage": percentage,
            "correct_count": int(score) if score <= total_questions else int(round((score / 100) * total_questions)),
            "total_questions": total_questions,
            "time_spent": time_spent
        })

    # --- Consecutive Active Days (Streak) ---
    def get_user_streak(self, user_id: Optional[str]) -> int:
        """
        Calculate consecutive active learning days up to today (or yesterday).
        Rule: An active day is any calendar day with at least one recorded event
        in telemetry_events, quiz_attempts, or user_progress.
        A streak remains active if the most recent activity occurred today or yesterday.
        Returns 0 if no recent activity or if user has no records.
        """
        safe_uid = str(user_id or "").strip()
        if not safe_uid:
            return 0
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            cur.execute("""
                SELECT DISTINCT substr(timestamp, 1, 10) as act_date FROM telemetry_events WHERE user_id = ?
                UNION
                SELECT DISTINCT substr(created_at, 1, 10) as act_date FROM quiz_attempts WHERE user_id = ?
                UNION
                SELECT DISTINCT substr(updated_at, 1, 10) as act_date FROM user_progress
                WHERE user_id = ? AND (time_spent_seconds > 0 OR completion_pct > 0 OR status = 'COMPLETED')
            """, (safe_uid, safe_uid, safe_uid))
            rows = cur.fetchall()
            conn.close()

            raw_dates = []
            for r in rows:
                val = r["act_date"]
                if val and len(val) >= 10:
                    try:
                        raw_dates.append(date.fromisoformat(val[:10]))
                    except Exception:
                        pass

            if not raw_dates:
                return 0

            dates = sorted(set(raw_dates), reverse=True)
            today = date.today()
            if dates[0] < today - timedelta(days=1):
                return 0

            streak = 1
            curr = dates[0]
            for d in dates[1:]:
                if d == curr - timedelta(days=1):
                    streak += 1
                    curr = d
                elif d == curr:
                    continue
                else:
                    break
            return streak
        except Exception as e:
            print(f"[StateStore] get_user_streak error: {e}")
            return 0

    # --- Learner Dashboard Analytics Aggregator ---
    def get_learner_dashboard_stats(self, user_id: Optional[str]) -> Dict[str, Any]:
        """
        Aggregate genuine learner statistics from SQLite database records for user_id.
        Avoids division by zero, avoids invented statistics, and returns genuine zero-state
        for newly registered or inactive learners.
        """
        safe_uid = str(user_id or "guest-learner").strip() or "guest-learner"
        try:
            conn = self.get_connection()
            cur = conn.cursor()

            # 1. User Name
            cur.execute("SELECT name FROM users WHERE id = ?", (safe_uid,))
            user_row = cur.fetchone()
            user_name = user_row["name"] if user_row and user_row["name"] else "Learner"

            # 2. Completed Topics & Curriculum Progress
            cur.execute("""
                SELECT COUNT(DISTINCT topic_id) as comp_cnt
                FROM user_progress
                WHERE user_id = ? AND (status = 'COMPLETED' OR completion_pct >= 95.0)
            """, (safe_uid,))
            row = cur.fetchone()
            completed_topics = int(row["comp_cnt"] or 0) if row else 0

            total_curriculum_topics = 238
            overall_progress = round((completed_topics / total_curriculum_topics) * 100) if total_curriculum_topics > 0 else 0

            # 3. Quiz Attempts & Average Score
            cur.execute("""
                SELECT COUNT(*) as attempt_cnt, AVG(percentage) as avg_pct
                FROM quiz_attempts
                WHERE user_id = ?
            """, (safe_uid,))
            q_row = cur.fetchone()
            quiz_count = int(q_row["attempt_cnt"] or 0) if q_row else 0
            quiz_avg = float(q_row["avg_pct"] or 0.0) if q_row and q_row["avg_pct"] is not None else 0.0
            if quiz_count == 0:
                cur.execute("SELECT COUNT(*), AVG(quiz_score) FROM user_progress WHERE user_id = ? AND quiz_score > 0", (safe_uid,))
                up_q = cur.fetchone()
                if up_q and up_q[0] > 0:
                    quiz_count = int(up_q[0])
                    quiz_avg = float(up_q[1] or 0.0)

            # 4. Coding Accuracy
            cur.execute("""
                SELECT metadata_json
                FROM telemetry_events
                WHERE user_id = ? AND event_type = 'CODE_SUBMIT'
            """, (safe_uid,))
            code_events = cur.fetchall()
            if code_events:
                code_scores = []
                for ev in code_events:
                    try:
                        meta = json.loads(ev["metadata_json"] or "{}")
                        if "accuracy" in meta and meta["accuracy"] is not None:
                            code_scores.append(float(meta["accuracy"]))
                        elif "score" in meta and meta["score"] is not None:
                            code_scores.append(float(meta["score"]))
                        elif meta.get("passed") is True:
                            code_scores.append(100.0)
                        elif meta.get("passed") is False:
                            code_scores.append(0.0)
                    except Exception:
                        pass
                coding_accuracy = round(sum(code_scores) / len(code_scores)) if code_scores else None
            else:
                coding_accuracy = None

            # 5. Study Time (Minutes)
            # Avoid double-counting: telemetry_events and user_progress both receive duration on code submissions
            # and topic sessions. We aggregate per topic taking the maximum recorded duration between
            # telemetry and topic progress, plus any non-topic telemetry events.
            cur.execute("""
                SELECT topic_id, SUM(duration) as dur
                FROM telemetry_events
                WHERE user_id = ? AND topic_id IS NOT NULL AND topic_id != ''
                GROUP BY topic_id
            """, (safe_uid,))
            te_by_topic = {r["topic_id"]: float(r["dur"] or 0.0) for r in cur.fetchall()}

            cur.execute("""
                SELECT topic_id, SUM(time_spent_seconds) as dur
                FROM user_progress
                WHERE user_id = ? AND topic_id IS NOT NULL AND topic_id != ''
                GROUP BY topic_id
            """, (safe_uid,))
            up_by_topic = {r["topic_id"]: float(r["dur"] or 0.0) for r in cur.fetchall()}

            all_topic_ids = set(te_by_topic.keys()).union(set(up_by_topic.keys()))
            total_topic_duration = sum(max(te_by_topic.get(t, 0.0), up_by_topic.get(t, 0.0)) for t in all_topic_ids)

            cur.execute("""
                SELECT COALESCE(SUM(duration), 0.0)
                FROM telemetry_events
                WHERE user_id = ? AND (topic_id IS NULL OR topic_id = '')
            """, (safe_uid,))
            non_topic_te = float(cur.fetchone()[0] or 0.0)

            total_duration = total_topic_duration + non_topic_te
            study_time_minutes = round(total_duration / 60.0)

            # 6. Streak
            streak_days = self.get_user_streak(safe_uid)

            # 7. Language Progress
            cur.execute("""
                SELECT DISTINCT topic_id FROM user_progress
                WHERE user_id = ? AND (status = 'COMPLETED' OR completion_pct >= 95.0)
            """, (safe_uid,))
            comp_topic_rows = cur.fetchall()
            comp_set = {r["topic_id"] for r in comp_topic_rows if r["topic_id"]}

            py_comp = sum(1 for t in comp_set if t.startswith("top-py-"))
            c_comp = sum(1 for t in comp_set if t.startswith("top-c-") and not t.startswith("top-cpp-"))
            cpp_comp = sum(1 for t in comp_set if t.startswith("top-cpp-"))
            java_comp = sum(1 for t in comp_set if t.startswith("top-java-"))

            lang_progress = {
                "python": round((py_comp / 24.0) * 100) if py_comp else 0,
                "c": round((c_comp / 48.0) * 100) if c_comp else 0,
                "cpp": round((cpp_comp / 73.0) * 100) if cpp_comp else 0,
                "java": round((java_comp / 93.0) * 100) if java_comp else 0
            }

            # 8. User Preferences & Active Focus Topic
            cur.execute("SELECT selected_language, current_level FROM user_preferences WHERE user_id = ?", (safe_uid,))
            pref = cur.fetchone()
            sel_lang = pref["selected_language"].lower() if pref and pref["selected_language"] else "python"

            course_titles = {
                "python": "Python Fundamentals",
                "c": "C Programming Foundations",
                "cpp": "Modern C++ Fundamentals",
                "java": "Java Architecture Basics"
            }
            default_topics = {
                "python": ("top-py-fundamentals", "Python Fundamentals"),
                "c": ("top-c-intro", "C Language Foundations"),
                "cpp": ("top-cpp-intro", "Modern C++ Syntax & Setup"),
                "java": ("top-java-intro", "Java Environment & JVM Architecture")
            }
            current_course = course_titles.get(sel_lang, "Python Fundamentals")

            cur.execute("""
                SELECT topic_id, completion_pct, status FROM user_progress
                WHERE user_id = ? AND status != 'COMPLETED'
                ORDER BY updated_at DESC LIMIT 1
            """, (safe_uid,))
            active_p = cur.fetchone()
            if active_p and active_p["topic_id"]:
                current_topic_id = active_p["topic_id"]
                topic_progress = round(float(active_p["completion_pct"] or 0.0))
            else:
                def_id, _ = default_topics.get(sel_lang, ("top-py-fundamentals", "Python Fundamentals"))
                current_topic_id = def_id
                topic_progress = 0

            current_topic_title = (
                current_topic_id.replace("top-py-", "")
                .replace("top-c-", "")
                .replace("top-cpp-", "")
                .replace("top-java-", "")
                .replace("-", " ")
                .title()
            )

            # 9. Adaptive State & Cognitive Trend
            cur.execute("""
                SELECT cognitive_load, topic_id
                FROM adaptive_history
                WHERE user_id = ?
                ORDER BY id DESC LIMIT 7
            """, (safe_uid,))
            ah_rows = cur.fetchall()
            if ah_rows:
                current_load = ah_rows[0]["cognitive_load"] or "MEDIUM"
                cognitive_trend = [
                    {"state": r["cognitive_load"] or "MEDIUM", "label": r["topic_id"] or "Topic"}
                    for r in reversed(ah_rows)
                ]
            else:
                current_load = "MEDIUM"
                cognitive_trend = []

            content_mode = "SIMPLIFIED" if current_load == "HIGH" else "CONCISE" if current_load == "LOW" else "BALANCED"

            # 10. AI Recommendation
            cur.execute("""
                SELECT recommended_action, reason, topic_id
                FROM adaptive_history
                WHERE user_id = ?
                ORDER BY id DESC LIMIT 1
            """, (safe_uid,))
            latest_rec = cur.fetchone()
            if latest_rec and latest_rec["reason"]:
                rec_action = latest_rec["recommended_action"] or "CONTINUE"
                rec_reason = latest_rec["reason"]
                rec_topic_id = latest_rec["topic_id"] or current_topic_id
            elif completed_topics > 0:
                rec_action = "CONTINUE"
                rec_reason = f"Steady progress detected. Continue with {current_topic_title}."
                rec_topic_id = current_topic_id
            else:
                rec_action = "START"
                rec_reason = f"Welcome to the adaptive engine. Start your first lesson on {current_topic_title}."
                rec_topic_id = current_topic_id

            ai_recommendation = {
                "action": rec_action,
                "topic_id": rec_topic_id,
                "reason": rec_reason
            }

            # 11. Achievements
            all_achievements = self.platform_data.get("achievements", [])
            unlocked = []
            if coding_accuracy is not None and coding_accuracy > 0:
                unlocked.append({"achievement_code": "FIRST_CODE", "unlocked_at": "Active"})
            if completed_topics >= 1:
                unlocked.append({"achievement_code": "FIRST_TOPIC", "unlocked_at": "Active"})
            if quiz_avg >= 90.0 and quiz_count > 0:
                unlocked.append({"achievement_code": "QUIZ_MASTER", "unlocked_at": "Active"})
            if streak_days >= 7:
                unlocked.append({"achievement_code": "SEVEN_DAY_LEARNER", "unlocked_at": "Active"})
            if py_comp >= 3:
                unlocked.append({"achievement_code": "PYTHON_APPRENTICE", "unlocked_at": "Active"})

            for ua in self.platform_data.get("user_achievements", []):
                if ua.get("user_id") == safe_uid and not any(u["achievement_code"] == ua.get("achievement_code") for u in unlocked):
                    unlocked.append({"achievement_code": ua.get("achievement_code"), "unlocked_at": ua.get("unlocked_at", "")})

            achievements = {
                "all": all_achievements,
                "unlocked": unlocked
            }

            # 12. Recent Activity
            recent_activity = []
            cur.execute("""
                SELECT topic_id, percentage, created_at as dt
                FROM quiz_attempts WHERE user_id = ?
                ORDER BY created_at DESC LIMIT 3
            """, (safe_uid,))
            for qr in cur.fetchall():
                recent_activity.append({
                    "type": "QUIZ",
                    "title": f"Knowledge Check: {qr['topic_id']}",
                    "score": f"{round(qr['percentage'])}%",
                    "date": qr["dt"][:10] if qr["dt"] else "Recent"
                })
            cur.execute("""
                SELECT topic_id, duration, timestamp as dt
                FROM telemetry_events WHERE user_id = ?
                ORDER BY id DESC LIMIT 3
            """, (safe_uid,))
            for te in cur.fetchall():
                recent_activity.append({
                    "type": "LESSON",
                    "title": f"Lesson Activity: {te['topic_id']}",
                    "date": te["dt"][:10] if te["dt"] else "Recent"
                })

            conn.close()

            return {
                "success": True,
                "user_id": safe_uid,
                "user_name": user_name,
                "streak_days": streak_days,
                "snapshot": {
                    "streak_days": streak_days
                },
                "learning_snapshot": {
                    "overall_progress": overall_progress,
                    "quiz_accuracy": round(quiz_avg),
                    "coding_accuracy": round(coding_accuracy) if coding_accuracy is not None else None,
                    "learning_time_minutes": study_time_minutes,
                    "topics_completed": completed_topics
                },
                "language_progress": lang_progress,
                "current_course": current_course,
                "current_topic_id": current_topic_id,
                "current_topic_title": current_topic_title,
                "topic_progress": topic_progress,
                "ai_recommendation": ai_recommendation,
                "cognitive_trend": cognitive_trend,
                "achievements": achievements,
                "recent_activity": recent_activity,
                # Legacy flat fields for backward compatibility:
                "overall_progress": overall_progress,
                "quiz_accuracy": round(quiz_avg),
                "coding_accuracy": round(coding_accuracy) if coding_accuracy is not None else None,
                "learning_time_minutes": study_time_minutes,
                "quiz_attempts_count": quiz_count,
                "current_streak_days": streak_days,
                "topics_completed": completed_topics,
                "total_quizzes_taken": quiz_count,
                "average_quiz_score": round(quiz_avg),
                "current_cognitive_load": current_load,
                "current_content_mode": content_mode,
                "recommended_next_topic": current_topic_id,
                "recommended_next_topic_title": current_topic_title
            }
        except Exception as e:
            print(f"[StateStore] get_learner_dashboard_stats error: {e}")
            return {
                "success": False,
                "user_id": safe_uid,
                "streak_days": 0,
                "snapshot": {"streak_days": 0},
                "learning_snapshot": {
                    "overall_progress": 0,
                    "quiz_accuracy": 0,
                    "coding_accuracy": None,
                    "learning_time_minutes": 0,
                    "topics_completed": 0
                },
                "language_progress": {"python": 0, "c": 0, "cpp": 0, "java": 0},
                "cognitive_trend": [],
                "achievements": {"all": [], "unlocked": []},
                "recent_activity": []
            }


state_store = StateStore()

