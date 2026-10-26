"""Unit tests for Student Mastery Calculation Service (Task 3 & Task 6).

Verifies:
- Configurable weights and formula calculation
- Missing assessment types and explicit fallback rules
- Invalid scores validation
- Database persistence for quiz and coding assessments
- Idempotency / duplicate submission handling
- Historical score change tracking
"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

# Setup disposable isolated test database before backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_mastery_unit.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from backend.services.state_store import state_store
from backend.services.mastery_service import MasteryService, get_mastery_status


class TestMasteryService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        # Seed test users
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    ("student-alice", "alice@test.edu", "Alice", "student"))
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    ("student-bob", "bob@test.edu", "Bob", "student"))
        conn.commit()
        conn.close()

    @classmethod
    def tearDownClass(cls):
        _TEST_TEMP_DIR.cleanup()

    def setUp(self):
        self.service = MasteryService()

    # --- 1. Formula & Weight Calculations ---
    def test_default_formula_weights(self):
        """Test default formula: (Quiz * 0.6) + (Coding * 0.4)."""
        calc = self.service.calculate_mastery(quiz_accuracy=80.0, coding_score=90.0)
        # 80 * 0.6 + 90 * 0.4 = 48 + 36 = 84.0
        self.assertEqual(calc["current_mastery"], 84.0)
        self.assertEqual(calc["status"], "PROFICIENT")
        self.assertEqual(calc["assessment_mode"], "HYBRID")
        self.assertFalse(calc["provisional"])
        self.assertEqual(calc["missing_components"], [])

    def test_custom_formula_weights(self):
        """Test configurable weights adjustment."""
        self.service.set_weights(quiz_weight=0.5, coding_weight=0.5)
        calc = self.service.calculate_mastery(quiz_accuracy=80.0, coding_score=90.0)
        # 80 * 0.5 + 90 * 0.5 = 85.0
        self.assertEqual(calc["current_mastery"], 85.0)

        # Unequal custom weights
        self.service.set_weights(quiz_weight=0.7, coding_weight=0.3)
        calc = self.service.calculate_mastery(quiz_accuracy=100.0, coding_score=50.0)
        # 100 * 0.7 + 50 * 0.3 = 70 + 15 = 85.0
        self.assertEqual(calc["current_mastery"], 85.0)

    def test_invalid_weights_rejected(self):
        """Test negative or zero sum weights are rejected."""
        with self.assertRaises(ValueError):
            self.service.set_weights(quiz_weight=-0.5, coding_weight=0.5)
        with self.assertRaises(ValueError):
            self.service.set_weights(quiz_weight=0.0, coding_weight=0.0)

    # --- 2. Missing Assessment Types & Fallbacks ---
    def test_no_assessments_completed(self):
        """Rule 1: If no assessment completed, show 'Not assessed' rather than 0%."""
        calc = self.service.calculate_mastery(quiz_accuracy=None, coding_score=None)
        self.assertIsNone(calc["current_mastery"])
        self.assertEqual(calc["mastery_display"], "Not assessed")
        self.assertEqual(calc["status"], "NOT_ASSESSED")
        self.assertEqual(calc["assessment_mode"], "NOT_ASSESSED")
        self.assertFalse(calc["provisional"])
        self.assertEqual(set(calc["missing_components"]), {"quiz", "coding"})

    def test_quiz_only_fallback(self):
        """Rule 2: Quiz-only fallback uses 100% of quiz accuracy, provisional=True."""
        calc = self.service.calculate_mastery(quiz_accuracy=85.0, coding_score=None)
        self.assertEqual(calc["current_mastery"], 85.0)
        self.assertEqual(calc["mastery_display"], "85.0%")
        self.assertEqual(calc["status"], "PROFICIENT")
        self.assertEqual(calc["assessment_mode"], "QUIZ_ONLY")
        self.assertTrue(calc["provisional"])
        self.assertEqual(calc["missing_components"], ["coding"])

    def test_coding_only_fallback(self):
        """Rule 2: Coding-only fallback uses 100% of coding score, provisional=True."""
        calc = self.service.calculate_mastery(quiz_accuracy=None, coding_score=95.0)
        self.assertEqual(calc["current_mastery"], 95.0)
        self.assertEqual(calc["mastery_display"], "95.0%")
        self.assertEqual(calc["status"], "MASTERED")
        self.assertEqual(calc["assessment_mode"], "CODING_ONLY")
        self.assertTrue(calc["provisional"])
        self.assertEqual(calc["missing_components"], ["quiz"])

    # --- 3. Invalid Scores Validation ---
    def test_invalid_scores(self):
        """Reject scores outside [0.0, 100.0] or non-numeric."""
        with self.assertRaises(ValueError):
            self.service.validate_score(-1.0)
        with self.assertRaises(ValueError):
            self.service.validate_score(100.5)
        with self.assertRaises(ValueError):
            self.service.validate_score("not-a-number")
        with self.assertRaises(ValueError):
            self.service.validate_score(float("nan"))
        with self.assertRaises(ValueError):
            self.service.validate_score(float("inf"))

    # --- 4. Database Persistence & Transitions ---
    def test_assessment_lifecycle_and_history(self):
        """Test sequential quiz and coding ingestion, score updates, and history tracking."""
        user_id = "student-alice"
        topic_id = "top-py-variables"
        subject_id = "py-beg"

        # 1. Topic starts unassessed
        initial = self.service.get_topic_mastery(user_id, topic_id)
        self.assertIsNone(initial["current_mastery"])
        self.assertEqual(initial["mastery_display"], "Not assessed")
        self.assertEqual(initial["mastery_status"], "NOT_ASSESSED")

        # 2. Ingest Quiz: 90% accuracy
        quiz_res = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=90.0,
            assessment_id="quiz_att_001",
            details={"correct_count": 9, "total_questions": 10}
        )
        self.assertEqual(quiz_res["current_mastery"], 90.0)
        self.assertEqual(quiz_res["mastery_status"], "MASTERED")
        self.assertTrue(quiz_res["provisional"])
        self.assertEqual(quiz_res["total_attempts"], 1)
        self.assertEqual(quiz_res["completed_assessments"], 1)
        self.assertEqual(quiz_res["quiz_performance"]["correct_answers"], 9)
        self.assertEqual(quiz_res["quiz_performance"]["incorrect_answers"], 1)

        # Check history contains 1 entry
        hist = self.service.get_mastery_history(user_id, topic_id=topic_id)
        self.assertEqual(len(hist), 1)
        self.assertEqual(hist[0]["assessment_type"], "quiz")
        self.assertIsNone(hist[0]["previous_mastery"])
        self.assertEqual(hist[0]["new_mastery"], 90.0)

        # 3. Ingest Coding: 70% accuracy
        coding_res = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="coding",
            score=70.0,
            assessment_id="code_att_001",
            details={"passed_tests": 7, "total_tests": 10}
        )
        # Expected: (90 * 0.6) + (70 * 0.4) = 54 + 28 = 82.0
        self.assertEqual(coding_res["current_mastery"], 82.0)
        self.assertEqual(coding_res["previous_mastery"], 90.0)
        self.assertEqual(coding_res["mastery_status"], "PROFICIENT")
        self.assertFalse(coding_res["provisional"])
        self.assertEqual(coding_res["total_attempts"], 2)
        self.assertEqual(coding_res["completed_assessments"], 2)

        # Check history contains 2 entries
        hist2 = self.service.get_mastery_history(user_id, topic_id=topic_id)
        self.assertEqual(len(hist2), 2)
        self.assertEqual(hist2[0]["assessment_type"], "coding")
        self.assertEqual(hist2[0]["previous_mastery"], 90.0)
        self.assertEqual(hist2[0]["new_mastery"], 82.0)
        self.assertEqual(hist2[0]["change_delta"], -8.0)

    # --- 5. Idempotency & Duplicate Prevention ---
    def test_duplicate_assessment_prevention(self):
        """Test submitting the exact same assessment_id twice does not double count."""
        user_id = "student-bob"
        topic_id = "top-py-loops"
        subject_id = "py-beg"

        # First submission
        res1 = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=80.0,
            assessment_id="idemp_quiz_123"
        )
        self.assertEqual(res1["total_attempts"], 1)
        self.assertEqual(res1["completed_assessments"], 1)

        # Duplicate submission with same assessment_id
        res2 = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=80.0,
            assessment_id="idemp_quiz_123"
        )
        self.assertTrue(res2.get("is_duplicate"))
        self.assertEqual(res2["total_attempts"], 1)  # NOT incremented to 2!
        self.assertEqual(res2["completed_assessments"], 1)

        # Verify only 1 history entry exists
        hist = self.service.get_mastery_history(user_id, topic_id=topic_id)
        self.assertEqual(len(hist), 1)


if __name__ == "__main__":
    unittest.main()
