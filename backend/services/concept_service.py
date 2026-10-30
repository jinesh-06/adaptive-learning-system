"""Concept-Level Learner Knowledge Service.

Provides granular, persistent tracking of learner knowledge for individual concepts within topics.
Enforces learner isolation, topic-scoped uniqueness, assessment evidence idempotency,
verifiable state transitions, and thread-safe SQLite persistence.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Set, Union

from backend.services.state_store import state_store

logger = logging.getLogger(__name__)

# Standardized knowledge state vocabulary
VALID_KNOWLEDGE_STATES: Set[str] = {
    "NOT_ASSESSED",
    "LEARNING",
    "NEEDS_REVIEW",
    "MASTERED",
}

# Configurable defaults for knowledge state transitions
DEFAULT_MASTERY_CORRECT_THRESHOLD: int = 3       # Minimum correct answers for MASTERED
DEFAULT_MASTERY_ACCURACY_THRESHOLD: float = 0.80  # Minimum accuracy (80%) for MASTERED
DEFAULT_REVIEW_ACCURACY_THRESHOLD: float = 0.60   # Accuracy below 60% flags NEEDS_REVIEW


class ConceptRecord(dict):
    """Predictable dictionary representation of a concept knowledge record.

    Supports string equality checks (e.g. 'sigmoid_function' in concepts_list)
    as well as standard dictionary key access (record['concept_id']).
    """

    def __eq__(self, other: Any) -> bool:
        if isinstance(other, str):
            return self.get("concept_id") == other
        return super().__eq__(other)

    def __hash__(self) -> int:
        return hash(self.get("concept_id"))


def determine_knowledge_state(
    correct_count: int,
    incorrect_count: int,
    last_is_correct: Optional[bool] = None,
    mastery_threshold: int = DEFAULT_MASTERY_CORRECT_THRESHOLD,
    mastery_accuracy: float = DEFAULT_MASTERY_ACCURACY_THRESHOLD,
    review_accuracy: float = DEFAULT_REVIEW_ACCURACY_THRESHOLD,
) -> str:
    """Evaluate and transition knowledge state based on accumulated assessment evidence.

    Transition Rules:
    1. Zero Evidence:
       - If correct_count == 0 and incorrect_count == 0 -> NOT_ASSESSED
    2. Needs Review:
       - If last_is_correct is False (recent mistake on this concept) -> NEEDS_REVIEW
       - If incorrect_count > 0 and correct_count == 0 -> NEEDS_REVIEW
       - If total attempts > 0 and accuracy < review_accuracy (e.g. < 60%) -> NEEDS_REVIEW
    3. Mastered:
       - If correct_count >= mastery_threshold (default 3) AND
         accuracy >= mastery_accuracy (default 80%) AND
         last_is_correct is not False -> MASTERED
    4. Learning:
       - In all other cases where some positive evidence exists (e.g., 1 or 2 correct answers,
         or recovering accuracy between 60% and 80%) -> LEARNING
    """
    total = correct_count + incorrect_count
    if total == 0:
        return "NOT_ASSESSED"

    accuracy = correct_count / total if total > 0 else 0.0

    # Rule 1: A recent failure signals immediate review need
    if last_is_correct is False:
        return "NEEDS_REVIEW"

    # Rule 2: Exclusively incorrect answers
    if incorrect_count > 0 and correct_count == 0:
        return "NEEDS_REVIEW"

    # Rule 3: Low overall accuracy
    if accuracy < review_accuracy:
        return "NEEDS_REVIEW"

    # Rule 4: Mastered - verified repeated evidence
    if correct_count >= mastery_threshold and accuracy >= mastery_accuracy:
        return "MASTERED"

    # Rule 5: Active learning / progressing
    return "LEARNING"


class ConceptService:
    """Core domain service for concept-level learner knowledge tracking."""

    def __init__(
        self,
        mastery_threshold: int = DEFAULT_MASTERY_CORRECT_THRESHOLD,
        mastery_accuracy: float = DEFAULT_MASTERY_ACCURACY_THRESHOLD,
        review_accuracy: float = DEFAULT_REVIEW_ACCURACY_THRESHOLD,
    ):
        self.mastery_threshold = mastery_threshold
        self.mastery_accuracy = mastery_accuracy
        self.review_accuracy = review_accuracy
        self._ensure_tables()

    def _ensure_tables(self) -> None:
        """Ensure concept knowledge tables exist idempotently in active database with topic-scoped uniqueness."""
        with state_store._lock:
            conn = state_store.get_connection()
            try:
                cur = conn.cursor()

                # Migration guard: Migrate legacy UNIQUE(user_id, concept_id) safely preserving all rows
                cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='student_concept_knowledge'")
                row_ck = cur.fetchone()
                if row_ck and "UNIQUE(user_id, concept_id)" in row_ck[0]:
                    cur.execute("""
                        CREATE TABLE student_concept_knowledge_migrated (
                            id TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            concept_id TEXT NOT NULL,
                            topic_id TEXT NOT NULL,
                            knowledge_state TEXT NOT NULL DEFAULT 'NOT_ASSESSED',
                            correct_count INTEGER DEFAULT 0,
                            incorrect_count INTEGER DEFAULT 0,
                            last_assessed_at TIMESTAMP DEFAULT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                            UNIQUE(user_id, topic_id, concept_id)
                        )
                    """)
                    cur.execute("""
                        INSERT OR IGNORE INTO student_concept_knowledge_migrated
                        SELECT id, user_id, concept_id, topic_id, knowledge_state, correct_count, incorrect_count, last_assessed_at, created_at, updated_at
                        FROM student_concept_knowledge
                    """)
                    cur.execute("DROP TABLE student_concept_knowledge")
                    cur.execute("ALTER TABLE student_concept_knowledge_migrated RENAME TO student_concept_knowledge")

                # Main table definition
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS student_concept_knowledge (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        concept_id TEXT NOT NULL,
                        topic_id TEXT NOT NULL,
                        knowledge_state TEXT NOT NULL DEFAULT 'NOT_ASSESSED',
                        correct_count INTEGER DEFAULT 0,
                        incorrect_count INTEGER DEFAULT 0,
                        last_assessed_at TIMESTAMP DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                        UNIQUE(user_id, topic_id, concept_id)
                    )
                """)

                # Migration guard: Migrate legacy concept_evidence_log safely
                cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='concept_evidence_log'")
                row_ev = cur.fetchone()
                if row_ev and "UNIQUE(user_id, concept_id, evidence_id)" in row_ev[0]:
                    cur.execute("""
                        CREATE TABLE concept_evidence_log_migrated (
                            id TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            concept_id TEXT NOT NULL,
                            topic_id TEXT NOT NULL,
                            evidence_id TEXT NOT NULL,
                            is_correct INTEGER NOT NULL,
                            source TEXT DEFAULT 'assessment',
                            metadata_json TEXT DEFAULT '{}',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                            UNIQUE(user_id, topic_id, concept_id, evidence_id)
                        )
                    """)
                    cur.execute("""
                        INSERT OR IGNORE INTO concept_evidence_log_migrated
                        SELECT id, user_id, concept_id, topic_id, evidence_id, is_correct, source, metadata_json, created_at
                        FROM concept_evidence_log
                    """)
                    cur.execute("DROP TABLE concept_evidence_log")
                    cur.execute("ALTER TABLE concept_evidence_log_migrated RENAME TO concept_evidence_log")

                # Evidence log table definition
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS concept_evidence_log (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        concept_id TEXT NOT NULL,
                        topic_id TEXT NOT NULL,
                        evidence_id TEXT NOT NULL,
                        is_correct INTEGER NOT NULL,
                        source TEXT DEFAULT 'assessment',
                        metadata_json TEXT DEFAULT '{}',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                        UNIQUE(user_id, topic_id, concept_id, evidence_id)
                    )
                """)

                # Indexes
                cur.execute("CREATE INDEX IF NOT EXISTS idx_concept_knowledge_user ON student_concept_knowledge(user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_concept_knowledge_user_topic ON student_concept_knowledge(user_id, topic_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_concept_knowledge_user_concept ON student_concept_knowledge(user_id, concept_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_concept_evidence_user_concept ON concept_evidence_log(user_id, concept_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_concept_evidence_user_topic ON concept_evidence_log(user_id, topic_id)")
                conn.commit()
            finally:
                conn.close()

    def _validate_user_id(self, user_id: Any) -> str:
        if not user_id or not isinstance(user_id, str) or not user_id.strip():
            raise ValueError("Valid user_id is required.")
        return user_id.strip()

    def _validate_concept_id(self, concept_id: Any) -> str:
        if not concept_id or not isinstance(concept_id, str) or not concept_id.strip():
            raise ValueError("Valid concept_id is required.")
        return concept_id.strip()

    def _validate_topic_id(self, topic_id: Any) -> str:
        if not topic_id or not isinstance(topic_id, str) or not topic_id.strip():
            raise ValueError("Valid topic_id is required.")
        return topic_id.strip()

    def _validate_state(self, state: Any) -> str:
        if not state or not isinstance(state, str) or state.strip() not in VALID_KNOWLEDGE_STATES:
            valid = sorted(list(VALID_KNOWLEDGE_STATES))
            raise ValueError(f"Invalid knowledge_state '{state}'. Must be one of {valid}.")
        return state.strip()

    def _format_row(self, row: Any) -> ConceptRecord:
        """Convert a database row into a standardized ConceptRecord dictionary."""
        correct = int(row["correct_count"] or 0)
        incorrect = int(row["incorrect_count"] or 0)
        return ConceptRecord({
            "id": row["id"],
            "user_id": row["user_id"],
            "concept_id": row["concept_id"],
            "topic_id": row["topic_id"],
            "knowledge_state": row["knowledge_state"],
            "correct_count": correct,
            "incorrect_count": incorrect,
            "total_attempts": correct + incorrect,
            "last_assessed_at": row["last_assessed_at"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        })

    def get_concept_knowledge(
        self,
        user_id: str,
        concept_id: str,
        topic_id: Optional[str] = None,
        default_if_missing: bool = False
    ) -> Optional[ConceptRecord]:
        """Retrieve concept knowledge for a specific learner, concept, and optional topic.

        Args:
            user_id: Authenticated learner identity.
            concept_id: Unique concept identifier.
            topic_id: Optional topic identifier. If provided, checks the specific topic.
                      If omitted, returns the latest record for this concept across topics.
            default_if_missing: If True, returns a default NOT_ASSESSED record when none exists.

        Returns:
            ConceptRecord dict if found (or if default_if_missing=True), otherwise None.
        """
        valid_user = self._validate_user_id(user_id)
        valid_concept = self._validate_concept_id(concept_id)

        conn = state_store.get_connection()
        try:
            cur = conn.cursor()
            if topic_id and str(topic_id).strip():
                valid_topic = str(topic_id).strip()
                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                    (valid_user, valid_topic, valid_concept)
                )
            else:
                valid_topic = ""
                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND concept_id = ?
                       ORDER BY updated_at DESC LIMIT 1""",
                    (valid_user, valid_concept)
                )

            row = cur.fetchone()
            if row:
                return self._format_row(row)
            if default_if_missing:
                return ConceptRecord({
                    "id": f"{valid_user}_{valid_topic}_{valid_concept}".strip("_"),
                    "user_id": valid_user,
                    "concept_id": valid_concept,
                    "topic_id": valid_topic,
                    "knowledge_state": "NOT_ASSESSED",
                    "correct_count": 0,
                    "incorrect_count": 0,
                    "total_attempts": 0,
                    "last_assessed_at": None,
                    "created_at": None,
                    "updated_at": None,
                })
            return None
        finally:
            conn.close()

    def get_learner_concept_profile(
        self,
        user_id: str,
        topic_id: str
    ) -> Dict[str, Any]:
        """Retrieve a topic-specific concept knowledge profile for a learner.

        Args:
            user_id: Authenticated learner identity.
            topic_id: Parent topic identifier.

        Returns:
            Profile dictionary distinguishing known, learning, review-needed, and unassessed concepts.
        """
        valid_user = self._validate_user_id(user_id)
        valid_topic = self._validate_topic_id(topic_id)

        conn = state_store.get_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM student_concept_knowledge WHERE user_id = ? AND topic_id = ? ORDER BY concept_id ASC",
                (valid_user, valid_topic)
            )
            rows = cur.fetchall()
            records = [self._format_row(r) for r in rows]

            known: List[ConceptRecord] = []
            learning: List[ConceptRecord] = []
            review_needed: List[ConceptRecord] = []
            unassessed: List[ConceptRecord] = []

            for r in records:
                state = r["knowledge_state"]
                if state == "MASTERED":
                    known.append(r)
                elif state == "LEARNING":
                    learning.append(r)
                elif state == "NEEDS_REVIEW":
                    review_needed.append(r)
                else:
                    unassessed.append(r)

            return {
                "user_id": valid_user,
                "topic_id": valid_topic,
                "concepts": records,
                "known_concepts": known,
                "learning_concepts": learning,
                "review_needed_concepts": review_needed,
                "unassessed_concepts": unassessed,
                "known_concept_ids": [r["concept_id"] for r in known],
                "review_needed_concept_ids": [r["concept_id"] for r in review_needed],
                "summary": {
                    "total_tracked": len(records),
                    "mastered_count": len(known),
                    "learning_count": len(learning),
                    "needs_review_count": len(review_needed),
                    "not_assessed_count": len(unassessed),
                }
            }
        finally:
            conn.close()

    def update_concept_state(
        self,
        user_id: str,
        concept_id: str,
        topic_id: str,
        state: str,
        source: str = "manual"
    ) -> ConceptRecord:
        """Update or initialize a concept's knowledge state for a learner within a specific topic.

        Args:
            user_id: Authenticated learner identity.
            concept_id: Unique concept identifier.
            topic_id: Parent topic identifier.
            state: Valid state string ('NOT_ASSESSED', 'LEARNING', 'NEEDS_REVIEW', 'MASTERED').
            source: Source of update ('manual', 'instructor', etc.).

        Returns:
            Updated ConceptRecord.
        """
        valid_user = self._validate_user_id(user_id)
        valid_concept = self._validate_concept_id(concept_id)
        valid_topic = self._validate_topic_id(topic_id)
        valid_state = self._validate_state(state)

        now_iso = datetime.now(timezone.utc).isoformat()
        rec_id = f"{valid_user}_{valid_topic}_{valid_concept}"

        with state_store._lock:
            conn = state_store.get_connection()
            try:
                conn.execute("BEGIN IMMEDIATE")
                cur = conn.cursor()

                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                    (valid_user, valid_topic, valid_concept)
                )
                existing = cur.fetchone()

                if existing:
                    cur.execute(
                        """UPDATE student_concept_knowledge
                           SET knowledge_state = ?,
                               updated_at = ?
                           WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                        (valid_state, now_iso, valid_user, valid_topic, valid_concept)
                    )
                else:
                    cur.execute(
                        """INSERT INTO student_concept_knowledge
                           (id, user_id, concept_id, topic_id, knowledge_state, correct_count, incorrect_count, last_assessed_at, created_at, updated_at)
                           VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?, ?)""",
                        (rec_id, valid_user, valid_concept, valid_topic, valid_state, now_iso, now_iso)
                    )

                conn.commit()

                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                    (valid_user, valid_topic, valid_concept)
                )
                row = cur.fetchone()
                return self._format_row(row)
            except Exception:
                conn.rollback()
                raise
            finally:
                conn.close()

    def record_concept_evidence(
        self,
        user_id: str,
        concept_id: str,
        topic_id: str,
        is_correct: bool,
        evidence_id: Optional[str] = None,
        source: str = "assessment",
        metadata: Optional[Dict[str, Any]] = None
    ) -> ConceptRecord:
        """Record verified assessment evidence for a learner and concept within a topic.

        Idempotent: If evidence_id is supplied and already recorded for this learner,
        topic, and concept, the existing record is returned with duplicate=True without double-counting.

        Args:
            user_id: Authenticated learner identity.
            concept_id: Unique concept identifier.
            topic_id: Parent topic identifier.
            is_correct: Whether the assessment attempt was correct.
            evidence_id: Optional stable submission/question attempt ID for idempotency.
            source: Source of evidence ('quiz', 'exercise', 'diagnostic', etc.).
            metadata: Optional additional context.

        Returns:
            ConceptRecord with duplicate indicator.
        """
        valid_user = self._validate_user_id(user_id)
        valid_concept = self._validate_concept_id(concept_id)
        valid_topic = self._validate_topic_id(topic_id)
        valid_is_correct = bool(is_correct)

        clean_evidence_id = str(evidence_id).strip() if evidence_id and str(evidence_id).strip() else None
        now_iso = datetime.now(timezone.utc).isoformat()
        rec_id = f"{valid_user}_{valid_topic}_{valid_concept}"

        with state_store._lock:
            conn = state_store.get_connection()
            try:
                conn.execute("BEGIN IMMEDIATE")
                cur = conn.cursor()

                # --- 1. Idempotency Check ---
                if clean_evidence_id:
                    cur.execute(
                        """SELECT id FROM concept_evidence_log
                           WHERE user_id = ? AND topic_id = ? AND concept_id = ? AND evidence_id = ?""",
                        (valid_user, valid_topic, valid_concept, clean_evidence_id)
                    )
                    existing_evidence = cur.fetchone()
                    if existing_evidence:
                        # Duplicate evidence: return current concept state without updating counts
                        cur.execute(
                            """SELECT * FROM student_concept_knowledge
                               WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                            (valid_user, valid_topic, valid_concept)
                        )
                        existing_record = cur.fetchone()
                        conn.commit()
                        if existing_record:
                            formatted = self._format_row(existing_record)
                        else:
                            formatted = ConceptRecord({
                                "id": rec_id,
                                "user_id": valid_user,
                                "concept_id": valid_concept,
                                "topic_id": valid_topic,
                                "knowledge_state": "NOT_ASSESSED",
                                "correct_count": 0,
                                "incorrect_count": 0,
                                "total_attempts": 0,
                                "last_assessed_at": None,
                                "created_at": now_iso,
                                "updated_at": now_iso,
                            })
                        formatted["duplicate"] = True
                        return formatted

                    # Log the new evidence entry
                    log_id = f"{valid_user}_{valid_topic}_{valid_concept}_{clean_evidence_id}"
                    cur.execute(
                        """INSERT INTO concept_evidence_log
                           (id, user_id, concept_id, topic_id, evidence_id, is_correct, source, metadata_json, created_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            log_id,
                            valid_user,
                            valid_concept,
                            valid_topic,
                            clean_evidence_id,
                            1 if valid_is_correct else 0,
                            source or "assessment",
                            json.dumps(metadata or {}),
                            now_iso
                        )
                    )

                # --- 2. Update Concept Knowledge Record ---
                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                    (valid_user, valid_topic, valid_concept)
                )
                existing = cur.fetchone()

                if existing:
                    new_correct = int(existing["correct_count"] or 0) + (1 if valid_is_correct else 0)
                    new_incorrect = int(existing["incorrect_count"] or 0) + (0 if valid_is_correct else 1)
                    new_state = determine_knowledge_state(
                        correct_count=new_correct,
                        incorrect_count=new_incorrect,
                        last_is_correct=valid_is_correct,
                        mastery_threshold=self.mastery_threshold,
                        mastery_accuracy=self.mastery_accuracy,
                        review_accuracy=self.review_accuracy
                    )
                    cur.execute(
                        """UPDATE student_concept_knowledge
                           SET knowledge_state = ?,
                               correct_count = ?,
                               incorrect_count = ?,
                               last_assessed_at = ?,
                               updated_at = ?
                           WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                        (new_state, new_correct, new_incorrect, now_iso, now_iso, valid_user, valid_topic, valid_concept)
                    )
                else:
                    new_correct = 1 if valid_is_correct else 0
                    new_incorrect = 0 if valid_is_correct else 1
                    new_state = determine_knowledge_state(
                        correct_count=new_correct,
                        incorrect_count=new_incorrect,
                        last_is_correct=valid_is_correct,
                        mastery_threshold=self.mastery_threshold,
                        mastery_accuracy=self.mastery_accuracy,
                        review_accuracy=self.review_accuracy
                    )
                    cur.execute(
                        """INSERT INTO student_concept_knowledge
                           (id, user_id, concept_id, topic_id, knowledge_state, correct_count, incorrect_count, last_assessed_at, created_at, updated_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (rec_id, valid_user, valid_concept, valid_topic, new_state, new_correct, new_incorrect, now_iso, now_iso, now_iso)
                    )

                conn.commit()

                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND topic_id = ? AND concept_id = ?""",
                    (valid_user, valid_topic, valid_concept)
                )
                updated_row = cur.fetchone()
                result = self._format_row(updated_row)
                result["duplicate"] = False
                return result
            except Exception:
                conn.rollback()
                raise
            finally:
                conn.close()

    def get_known_concepts(
        self,
        user_id: str,
        topic_id: Optional[str] = None,
        as_ids: bool = False
    ) -> List[Any]:
        """Retrieve concepts that have achieved verified mastery for a learner.

        Args:
            user_id: Authenticated learner identity.
            topic_id: Optional topic filter.
            as_ids: If True, returns a List[str] of concept IDs. If False, returns List[ConceptRecord].

        Returns:
            List of mastered concept records or list of concept ID strings.
        """
        valid_user = self._validate_user_id(user_id)
        conn = state_store.get_connection()
        try:
            cur = conn.cursor()
            if topic_id and str(topic_id).strip():
                valid_topic = str(topic_id).strip()
                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND topic_id = ? AND knowledge_state = 'MASTERED'
                       ORDER BY concept_id ASC""",
                    (valid_user, valid_topic)
                )
            else:
                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND knowledge_state = 'MASTERED'
                       ORDER BY concept_id ASC""",
                    (valid_user,)
                )
            rows = cur.fetchall()
            records = [self._format_row(r) for r in rows]
            if as_ids:
                return [r["concept_id"] for r in records]
            return records
        finally:
            conn.close()

    def get_concepts_needing_review(
        self,
        user_id: str,
        topic_id: Optional[str] = None,
        as_ids: bool = False
    ) -> List[Any]:
        """Retrieve concepts identified as needing additional review for a learner.

        Args:
            user_id: Authenticated learner identity.
            topic_id: Optional topic filter.
            as_ids: If True, returns a List[str] of concept IDs. If False, returns List[ConceptRecord].

        Returns:
            List of review-needed concept records or list of concept ID strings.
        """
        valid_user = self._validate_user_id(user_id)
        conn = state_store.get_connection()
        try:
            cur = conn.cursor()
            if topic_id and str(topic_id).strip():
                valid_topic = str(topic_id).strip()
                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND topic_id = ? AND knowledge_state = 'NEEDS_REVIEW'
                       ORDER BY concept_id ASC""",
                    (valid_user, valid_topic)
                )
            else:
                cur.execute(
                    """SELECT * FROM student_concept_knowledge
                       WHERE user_id = ? AND knowledge_state = 'NEEDS_REVIEW'
                       ORDER BY concept_id ASC""",
                    (valid_user,)
                )
            rows = cur.fetchall()
            records = [self._format_row(r) for r in rows]
            if as_ids:
                return [r["concept_id"] for r in records]
            return records
        finally:
            conn.close()


concept_service = ConceptService()
