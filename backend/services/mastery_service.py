"""Student-Specific Mastery Calculation & Tracking Service.

Calculates, normalizes, and persists student topic and subject mastery based on
verified quiz attempts and coding challenge evaluations.

Formula:
  Mastery Score = (Quiz Accuracy * Quiz Weight) + (Coding Assessment Score * Coding Weight)
Default weights:
  Quiz Weight = 0.6, Coding Weight = 0.4 (configurable via env or set_weights)

Rules for Missing Assessments & Fallbacks:
  1. No Assessments: If no assessment has been completed, mastery score is None and
     mastery_display is "Not assessed" rather than treating absence of data as 0%.
  2. Single Dimension Fallback: If only one assessment type is available (e.g., student has only
     taken the quiz or only completed the coding challenge), the available component represents
     100% of the provisional mastery score (normalized 0-100). The record is flagged with
     `provisional: True` and explicitly lists missing components (e.g. `['coding']`).
     This avoids artificially deflating a high-performing student's score before they have had the
     opportunity to attempt both assessment modalities.
  3. Hybrid (Both Available): When both quiz accuracy and coding scores exist, the weighted
     formula is applied and the score is normalized to 0-100.
"""

import json
import os
import math
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from backend.services.state_store import state_store
from backend.services.curriculum_service import curriculum_service

logger = logging.getLogger(__name__)


def get_mastery_status(score: Optional[float]) -> str:
    """Return categorical mastery status given a score 0-100."""
    if score is None:
        return "NOT_ASSESSED"
    if score >= 90.0:
        return "MASTERED"
    if score >= 80.0:
        return "PROFICIENT"
    if score >= 60.0:
        return "PROGRESSING"
    return "NOVICE"


class MasteryService:
    """Core domain service for student-specific mastery tracking."""

    def __init__(self):
        # Configurable weights (default: Quiz 60%, Coding 40%)
        self.quiz_weight: float = float(os.getenv("MASTERY_QUIZ_WEIGHT", "0.6"))
        self.coding_weight: float = float(os.getenv("MASTERY_CODING_WEIGHT", "0.4"))

    def set_weights(self, quiz_weight: float, coding_weight: float):
        """Dynamically configure mastery weights with non-negative validation."""
        if quiz_weight < 0 or coding_weight < 0:
            raise ValueError("Mastery weights must be non-negative.")
        if quiz_weight + coding_weight <= 0:
            raise ValueError("Sum of mastery weights must be greater than zero.")
        self.quiz_weight = float(quiz_weight)
        self.coding_weight = float(coding_weight)

    def validate_score(self, score: Any) -> float:
        """Validate that score is a numeric value within [0.0, 100.0]."""
        if score is None:
            raise ValueError("Score cannot be None.")
        try:
            val = float(score)
        except (ValueError, TypeError):
            raise ValueError(f"Score must be a valid number, got {type(score).__name__}.")

        if math.isnan(val) or math.isinf(val):
            raise ValueError("Score cannot be NaN or Infinite.")

        if val < 0.0 or val > 100.0:
            raise ValueError(f"Score must be between 0.0 and 100.0 inclusive, got {val}.")

        return round(val, 2)

    def calculate_mastery(
        self,
        quiz_accuracy: Optional[float],
        coding_score: Optional[float]
    ) -> Dict[str, Any]:
        """
        Calculate topic mastery with verified component scores and explicit fallback rules.
        """
        # 1. No assessments completed
        if quiz_accuracy is None and coding_score is None:
            return {
                "current_mastery": None,
                "mastery_display": "Not assessed",
                "status": "NOT_ASSESSED",
                "assessment_mode": "NOT_ASSESSED",
                "provisional": False,
                "missing_components": ["quiz", "coding"],
                "weights_used": {
                    "quiz": self.quiz_weight,
                    "coding": self.coding_weight
                }
            }

        # Validate provided scores
        valid_quiz = self.validate_score(quiz_accuracy) if quiz_accuracy is not None else None
        valid_coding = self.validate_score(coding_score) if coding_score is not None else None

        # 2. Quiz-only fallback (100% provisional weight)
        if valid_quiz is not None and valid_coding is None:
            score = valid_quiz
            return {
                "current_mastery": score,
                "mastery_display": f"{score:.1f}%",
                "status": get_mastery_status(score),
                "assessment_mode": "QUIZ_ONLY",
                "provisional": True,
                "missing_components": ["coding"],
                "weights_used": {"quiz": 1.0, "coding": 0.0}
            }

        # 3. Coding-only fallback (100% provisional weight)
        if valid_coding is not None and valid_quiz is None:
            score = valid_coding
            return {
                "current_mastery": score,
                "mastery_display": f"{score:.1f}%",
                "status": get_mastery_status(score),
                "assessment_mode": "CODING_ONLY",
                "provisional": True,
                "missing_components": ["quiz"],
                "weights_used": {"quiz": 0.0, "coding": 1.0}
            }

        # 4. Hybrid (Both Quiz and Coding present)
        total_w = self.quiz_weight + self.coding_weight
        norm_quiz_w = self.quiz_weight / total_w
        norm_coding_w = self.coding_weight / total_w

        weighted_score = (valid_quiz * norm_quiz_w) + (valid_coding * norm_coding_w)
        score = round(min(100.0, max(0.0, weighted_score)), 2)

        return {
            "current_mastery": score,
            "mastery_display": f"{score:.1f}%",
            "status": get_mastery_status(score),
            "assessment_mode": "HYBRID",
            "provisional": False,
            "missing_components": [],
            "weights_used": {
                "quiz": round(norm_quiz_w, 4),
                "coding": round(norm_coding_w, 4)
            }
        }

    def process_assessment_result(
        self,
        user_id: str,
        topic_id: str,
        assessment_type: str,
        score: float,
        subject_id: Optional[str] = None,
        assessment_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Idempotently process a verified assessment result, update topic mastery,
        and log historical change.
        """
        if not user_id or not isinstance(user_id, str) or not user_id.strip():
            raise ValueError("Valid student user_id is required.")
        if not topic_id or not isinstance(topic_id, str) or not topic_id.strip():
            raise ValueError("Valid topic_id is required.")

        clean_type = (assessment_type or "").strip().lower()
        if clean_type not in ("quiz", "coding"):
            raise ValueError(f"Invalid assessment_type '{assessment_type}'. Must be 'quiz' or 'coding'.")

        valid_score = self.validate_score(score)
        metadata = details or {}

        # Resolve subject_id / course_id if missing
        if not subject_id or not str(subject_id).strip():
            subject_id = curriculum_service.get_course_id_for_topic(topic_id)
        subject_id = str(subject_id).strip()

        with state_store._lock:
            conn = state_store.get_connection()
            cur = conn.cursor()

            # --- Idempotency Check ---
            # If an assessment_id is provided, check if it was already processed
            if assessment_id:
                cur.execute(
                    "SELECT * FROM mastery_history WHERE assessment_id = ? AND user_id = ?",
                    (assessment_id, user_id)
                )
                duplicate = cur.fetchone()
                if duplicate:
                    logger.info(f"Duplicate assessment '{assessment_id}' detected for user '{user_id}'. Skipping reprocessing.")
                    # Fetch and return existing topic mastery record
                    cur.execute(
                        "SELECT * FROM student_topic_mastery WHERE user_id = ? AND topic_id = ?",
                        (user_id, topic_id)
                    )
                    existing_mastery = cur.fetchone()
                    conn.close()
                    return self._format_topic_mastery_row(existing_mastery, is_duplicate=True)

            # --- Load or Initialize Topic Mastery Record ---
            cur.execute(
                "SELECT * FROM student_topic_mastery WHERE user_id = ? AND topic_id = ?",
                (user_id, topic_id)
            )
            existing = cur.fetchone()

            rec_id = f"{user_id}_{subject_id}_{topic_id}"
            now_iso = datetime.now(timezone.utc).isoformat()

            if existing:
                total_attempts = (existing["total_attempts"] or 0) + 1
                completed_assessments = (existing["completed_assessments"] or 0) + 1

                quiz_attempts = existing["quiz_attempts"] or 0
                quiz_correct = existing["quiz_correct_answers"] or 0
                quiz_incorrect = existing["quiz_incorrect_answers"] or 0
                quiz_accuracy = existing["quiz_accuracy"]
                best_quiz_accuracy = existing["best_quiz_accuracy"]

                coding_attempts = existing["coding_attempts"] or 0
                coding_passed = existing["coding_passed_tests"] or 0
                coding_total = existing["coding_total_tests"] or 0
                coding_score = existing["coding_score"]
                best_coding_score = existing["best_coding_score"]

                previous_mastery = existing["current_mastery"]

                if clean_type == "quiz":
                    quiz_attempts += 1
                    quiz_accuracy = valid_score
                    best_quiz_accuracy = max(best_quiz_accuracy or 0.0, valid_score)
                    if "correct_count" in metadata:
                        quiz_correct += int(metadata.get("correct_count", 0))
                    if "total_questions" in metadata:
                        tot = int(metadata.get("total_questions", 0))
                        cor = int(metadata.get("correct_count", 0))
                        quiz_incorrect += max(0, tot - cor)

                elif clean_type == "coding":
                    coding_attempts += 1
                    coding_score = valid_score
                    best_coding_score = max(best_coding_score or 0.0, valid_score)
                    if "passed_tests" in metadata:
                        coding_passed += int(metadata.get("passed_tests", 0))
                    if "total_tests" in metadata:
                        coding_total += int(metadata.get("total_tests", 0))

                # Recalculate mastery
                calc = self.calculate_mastery(quiz_accuracy, coding_score)
                new_mastery = calc["current_mastery"]
                status = calc["status"]

                cur.execute(
                    """UPDATE student_topic_mastery
                       SET subject_id = ?,
                           total_attempts = ?,
                           completed_assessments = ?,
                           quiz_attempts = ?,
                           quiz_correct_answers = ?,
                           quiz_incorrect_answers = ?,
                           quiz_accuracy = ?,
                           best_quiz_accuracy = ?,
                           coding_attempts = ?,
                           coding_passed_tests = ?,
                           coding_total_tests = ?,
                           coding_score = ?,
                           best_coding_score = ?,
                           current_mastery = ?,
                           previous_mastery = ?,
                           mastery_status = ?,
                           last_activity_at = ?,
                           updated_at = ?
                       WHERE user_id = ? AND topic_id = ?""",
                    (
                        subject_id,
                        total_attempts,
                        completed_assessments,
                        quiz_attempts,
                        quiz_correct,
                        quiz_incorrect,
                        quiz_accuracy,
                        best_quiz_accuracy,
                        coding_attempts,
                        coding_passed,
                        coding_total,
                        coding_score,
                        best_coding_score,
                        new_mastery,
                        previous_mastery,
                        status,
                        now_iso,
                        now_iso,
                        user_id,
                        topic_id
                    )
                )

            else:
                total_attempts = 1
                completed_assessments = 1
                previous_mastery = None

                if clean_type == "quiz":
                    quiz_attempts = 1
                    quiz_accuracy = valid_score
                    best_quiz_accuracy = valid_score
                    quiz_correct = int(metadata.get("correct_count", 0))
                    tot = int(metadata.get("total_questions", 0))
                    quiz_incorrect = max(0, tot - quiz_correct)

                    coding_attempts = 0
                    coding_passed = 0
                    coding_total = 0
                    coding_score = None
                    best_coding_score = None
                else:
                    quiz_attempts = 0
                    quiz_correct = 0
                    quiz_incorrect = 0
                    quiz_accuracy = None
                    best_quiz_accuracy = None

                    coding_attempts = 1
                    coding_score = valid_score
                    best_coding_score = valid_score
                    coding_passed = int(metadata.get("passed_tests", 0))
                    coding_total = int(metadata.get("total_tests", 0))

                calc = self.calculate_mastery(quiz_accuracy, coding_score)
                new_mastery = calc["current_mastery"]
                status = calc["status"]

                cur.execute(
                    """INSERT INTO student_topic_mastery (
                           id, user_id, subject_id, topic_id, total_attempts, completed_assessments,
                           quiz_attempts, quiz_correct_answers, quiz_incorrect_answers,
                           quiz_accuracy, best_quiz_accuracy, coding_attempts, coding_passed_tests,
                           coding_total_tests, coding_score, best_coding_score,
                           current_mastery, previous_mastery, mastery_status,
                           last_activity_at, created_at, updated_at
                       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        rec_id,
                        user_id,
                        subject_id,
                        topic_id,
                        total_attempts,
                        completed_assessments,
                        quiz_attempts,
                        quiz_correct,
                        quiz_incorrect,
                        quiz_accuracy,
                        best_quiz_accuracy,
                        coding_attempts,
                        coding_passed,
                        coding_total,
                        coding_score,
                        best_coding_score,
                        new_mastery,
                        previous_mastery,
                        status,
                        now_iso,
                        now_iso,
                        now_iso
                    )
                )

            # --- Log into Mastery History ---
            hist_id = f"hist_{uuid.uuid4().hex[:16]}"
            change_delta = round(new_mastery - previous_mastery, 2) if (previous_mastery is not None and new_mastery is not None) else None
            meta_json = json.dumps(metadata)

            cur.execute(
                """INSERT INTO mastery_history (
                       id, user_id, subject_id, topic_id, assessment_id, assessment_type,
                       score, previous_mastery, new_mastery, change_delta, metadata_json, timestamp
                   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    hist_id,
                    user_id,
                    subject_id,
                    topic_id,
                    assessment_id or hist_id,
                    clean_type,
                    valid_score,
                    previous_mastery,
                    new_mastery,
                    change_delta,
                    meta_json,
                    now_iso
                )
            )

            conn.commit()

            # Retrieve updated row
            cur.execute("SELECT * FROM student_topic_mastery WHERE id = ?", (rec_id,))
            updated_row = cur.fetchone()
            conn.close()

            return self._format_topic_mastery_row(updated_row, is_duplicate=False)

    def get_topic_mastery(self, user_id: str, topic_id: str) -> Dict[str, Any]:
        """Retrieve topic-level mastery for a given authenticated student."""
        with state_store._lock:
            conn = state_store.get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM student_topic_mastery WHERE user_id = ? AND topic_id = ?",
                (user_id, topic_id)
            )
            row = cur.fetchone()
            conn.close()

        if not row:
            # Topic not assessed yet: return clean Not assessed structure
            subject_id = curriculum_service.get_course_id_for_topic(topic_id)
            return {
                "user_id": user_id,
                "subject_id": subject_id,
                "topic_id": topic_id,
                "current_mastery": None,
                "mastery_display": "Not assessed",
                "mastery_status": "NOT_ASSESSED",
                "previous_mastery": None,
                "total_attempts": 0,
                "completed_assessments": 0,
                "quiz_performance": {
                    "attempts": 0,
                    "accuracy": None,
                    "best_accuracy": None,
                    "correct_answers": 0,
                    "incorrect_answers": 0
                },
                "coding_performance": {
                    "attempts": 0,
                    "score": None,
                    "best_score": None,
                    "passed_tests": 0,
                    "total_tests": 0
                },
                "assessment_mode": "NOT_ASSESSED",
                "provisional": False,
                "missing_components": ["quiz", "coding"],
                "last_activity_at": None
            }

        return self._format_topic_mastery_row(row)

    def get_subject_mastery(self, user_id: str, subject_id: str) -> Dict[str, Any]:
        """Retrieve subject-level mastery metrics and all topics for that subject."""
        with state_store._lock:
            conn = state_store.get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM student_topic_mastery WHERE user_id = ? AND subject_id = ? ORDER BY topic_id ASC",
                (user_id, subject_id)
            )
            rows = cur.fetchall()
            conn.close()

        topic_masteries = [self._format_topic_mastery_row(r) for r in rows]

        # Calculate subject aggregate
        assessed_scores = [t["current_mastery"] for t in topic_masteries if t["current_mastery"] is not None]
        avg_score = round(sum(assessed_scores) / len(assessed_scores), 2) if assessed_scores else None

        mastered_count = sum(1 for t in topic_masteries if t["mastery_status"] == "MASTERED")
        proficient_count = sum(1 for t in topic_masteries if t["mastery_status"] == "PROFICIENT")
        progressing_count = sum(1 for t in topic_masteries if t["mastery_status"] == "PROGRESSING")
        novice_count = sum(1 for t in topic_masteries if t["mastery_status"] == "NOVICE")

        return {
            "user_id": user_id,
            "subject_id": subject_id,
            "current_mastery": avg_score,
            "mastery_display": f"{avg_score:.1f}%" if avg_score is not None else "Not assessed",
            "mastery_status": get_mastery_status(avg_score),
            "total_topics_assessed": len(assessed_scores),
            "breakdown": {
                "mastered": mastered_count,
                "proficient": proficient_count,
                "progressing": progressing_count,
                "novice": novice_count,
                "not_assessed": len(topic_masteries) - len(assessed_scores)
            },
            "topics": topic_masteries
        }

    def get_student_overall_mastery(self, user_id: str) -> Dict[str, Any]:
        """Retrieve comprehensive cross-subject mastery profile for the student."""
        with state_store._lock:
            conn = state_store.get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM student_topic_mastery WHERE user_id = ? ORDER BY last_activity_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            conn.close()

        topic_masteries = [self._format_topic_mastery_row(r) for r in rows]

        assessed_scores = [t["current_mastery"] for t in topic_masteries if t["current_mastery"] is not None]
        overall_avg = round(sum(assessed_scores) / len(assessed_scores), 2) if assessed_scores else None

        # Group by subject
        subject_groups: Dict[str, List[Dict[str, Any]]] = {}
        for t in topic_masteries:
            s_id = t["subject_id"]
            if s_id not in subject_groups:
                subject_groups[s_id] = []
            subject_groups[s_id].append(t)

        subjects_summary = []
        for s_id, t_list in subject_groups.items():
            sub_scores = [item["current_mastery"] for item in t_list if item["current_mastery"] is not None]
            sub_avg = round(sum(sub_scores) / len(sub_scores), 2) if sub_scores else None
            subjects_summary.append({
                "subject_id": s_id,
                "current_mastery": sub_avg,
                "mastery_display": f"{sub_avg:.1f}%" if sub_avg is not None else "Not assessed",
                "mastery_status": get_mastery_status(sub_avg),
                "topics_assessed": len(sub_scores),
                "total_attempts": sum(item["total_attempts"] for item in t_list)
            })

        return {
            "user_id": user_id,
            "overall_mastery": overall_avg,
            "mastery_display": f"{overall_avg:.1f}%" if overall_avg is not None else "Not assessed",
            "mastery_status": get_mastery_status(overall_avg),
            "total_assessed_topics": len(assessed_scores),
            "total_completed_assessments": sum(t["completed_assessments"] for t in topic_masteries),
            "breakdown": {
                "mastered": sum(1 for t in topic_masteries if t["mastery_status"] == "MASTERED"),
                "proficient": sum(1 for t in topic_masteries if t["mastery_status"] == "PROFICIENT"),
                "progressing": sum(1 for t in topic_masteries if t["mastery_status"] == "PROGRESSING"),
                "novice": sum(1 for t in topic_masteries if t["mastery_status"] == "NOVICE")
            },
            "subjects": subjects_summary,
            "topic_masteries": topic_masteries
        }

    def get_mastery_history(
        self,
        user_id: str,
        topic_id: Optional[str] = None,
        subject_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Retrieve chronological history of mastery-changing assessment events."""
        with state_store._lock:
            conn = state_store.get_connection()
            cur = conn.cursor()

            query = "SELECT * FROM mastery_history WHERE user_id = ?"
            params: List[Any] = [user_id]

            if topic_id:
                query += " AND topic_id = ?"
                params.append(topic_id)
            if subject_id:
                query += " AND subject_id = ?"
                params.append(subject_id)

            query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
            params.extend([max(1, min(200, limit)), max(0, offset)])

            cur.execute(query, tuple(params))
            rows = cur.fetchall()
            conn.close()

        history = []
        for r in rows:
            meta = {}
            if r["metadata_json"]:
                try:
                    meta = json.loads(r["metadata_json"])
                except Exception:
                    pass

            history.append({
                "id": r["id"],
                "user_id": r["user_id"],
                "subject_id": r["subject_id"],
                "topic_id": r["topic_id"],
                "assessment_id": r["assessment_id"],
                "assessment_type": r["assessment_type"],
                "score": r["score"],
                "previous_mastery": r["previous_mastery"],
                "new_mastery": r["new_mastery"],
                "change_delta": r["change_delta"],
                "metadata": meta,
                "timestamp": r["timestamp"]
            })
        return history

    def _format_topic_mastery_row(self, row: Any, is_duplicate: bool = False) -> Dict[str, Any]:
        """Format SQLite row into unified topic mastery dictionary."""
        if not row:
            return {}

        cur_score = row["current_mastery"]
        calc = self.calculate_mastery(row["quiz_accuracy"], row["coding_score"])

        res = {
            "id": row["id"],
            "user_id": row["user_id"],
            "subject_id": row["subject_id"],
            "topic_id": row["topic_id"],
            "current_mastery": cur_score,
            "mastery_display": f"{cur_score:.1f}%" if cur_score is not None else "Not assessed",
            "mastery_status": row["mastery_status"] or get_mastery_status(cur_score),
            "previous_mastery": row["previous_mastery"],
            "total_attempts": row["total_attempts"] or 0,
            "completed_assessments": row["completed_assessments"] or 0,
            "quiz_performance": {
                "attempts": row["quiz_attempts"] or 0,
                "accuracy": row["quiz_accuracy"],
                "best_accuracy": row["best_quiz_accuracy"],
                "correct_answers": row["quiz_correct_answers"] or 0,
                "incorrect_answers": row["quiz_incorrect_answers"] or 0
            },
            "coding_performance": {
                "attempts": row["coding_attempts"] or 0,
                "score": row["coding_score"],
                "best_score": row["best_coding_score"],
                "passed_tests": row["coding_passed_tests"] or 0,
                "total_tests": row["coding_total_tests"] or 0
            },
            "assessment_mode": calc["assessment_mode"],
            "provisional": calc["provisional"],
            "missing_components": calc["missing_components"],
            "last_activity_at": row["last_activity_at"],
            "updated_at": row["updated_at"]
        }
        if is_duplicate:
            res["is_duplicate"] = True
            res["message"] = "Assessment already recorded. Skipping duplicate processing."
        return res


mastery_service = MasteryService()
