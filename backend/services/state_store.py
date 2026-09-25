"""State and persistence store for users, telemetry, adaptive history, bookmarks, and notes."""

import json
import os
import sqlite3
import threading
from typing import Dict, Any, List, Optional
from pathlib import Path

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
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
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


state_store = StateStore()
