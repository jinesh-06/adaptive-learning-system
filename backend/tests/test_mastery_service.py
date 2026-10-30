"""Unit tests for Student-Specific Mastery Service (Member 3).

Verifies:
- Formula weights and calculations
- Fallback rules for missing assessments
- Initial mastery creation with all required fields
- Correct and incorrect quiz attempts
- Multiple attempts, score updates, previous mastery tracking, improvement/decline
- Coding submission processing and hybrid calculation
- Accuracy percentage and correct attempts calculations
- Empty and invalid input validation
- Missing student, subject, or topic handling
- Idempotency and duplicate assessment prevention
- Overall student statistics and improvement metrics
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

    # --- 3. Invalid Inputs Validation ---
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

    def test_empty_or_invalid_inputs(self):
        """Validate empty student ID, empty topic ID, or invalid assessment type."""
        with self.assertRaises(ValueError):
            self.service.process_assessment_result(
                user_id="", topic_id="top-py-variables", assessment_type="quiz", score=80.0
            )
        with self.assertRaises(ValueError):
            self.service.process_assessment_result(
                user_id="student-alice", topic_id="", assessment_type="quiz", score=80.0
            )
        with self.assertRaises(ValueError):
            self.service.process_assessment_result(
                user_id="student-alice", topic_id="top-py-variables", assessment_type="unknown_type", score=80.0
            )

    # --- 4. Initial Mastery Creation ---
    def test_initial_mastery_creation(self):
        """Test initial record creation contains all required model fields."""
        user_id = "student-alice"
        topic_id = "top-py-intro"
        subject_id = "py-beg"

        res = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=75.0,
            assessment_id="init_test_quiz_1",
            details={"correct_count": 7, "total_questions": 10}
        )

        # Verify all required student mastery fields are present
        self.assertEqual(res["student_id"], user_id)
        self.assertEqual(res["user_id"], user_id)
        self.assertEqual(res["subject_id"], subject_id)
        self.assertEqual(res["topic_id"], topic_id)
        self.assertEqual(res["mastery_score"], 75.0)
        self.assertEqual(res["current_mastery"], 75.0)
        self.assertEqual(res["total_attempts"], 1)
        self.assertEqual(res["correct_attempts"], 7)
        self.assertIsNotNone(res["accuracy_percentage"])
        self.assertIsNone(res["previous_mastery"])
        self.assertIsNone(res["improvement"])
        self.assertIsNotNone(res["last_activity_at"])
        self.assertEqual(res["mastery_status"], "PROGRESSING")

    # --- 5. Correct and Incorrect Quiz Attempts ---
    def test_correct_and_incorrect_quiz_attempts(self):
        """Test accuracy and status for perfect, failing, and partial quiz attempts."""
        user_id = "student-alice"

        # Perfect score: 10/10 (100%)
        res_perfect = self.service.process_assessment_result(
            user_id=user_id,
            topic_id="top-py-perfect",
            assessment_type="quiz",
            score=100.0,
            details={"correct_count": 10, "total_questions": 10}
        )
        self.assertEqual(res_perfect["mastery_score"], 100.0)
        self.assertEqual(res_perfect["mastery_status"], "MASTERED")
        self.assertEqual(res_perfect["quiz_performance"]["correct_answers"], 10)
        self.assertEqual(res_perfect["quiz_performance"]["incorrect_answers"], 0)

        # Zero score: 0/10 (0%)
        res_zero = self.service.process_assessment_result(
            user_id=user_id,
            topic_id="top-py-zero",
            assessment_type="quiz",
            score=0.0,
            details={"correct_count": 0, "total_questions": 10}
        )
        self.assertEqual(res_zero["mastery_score"], 0.0)
        self.assertEqual(res_zero["mastery_status"], "NOVICE")
        self.assertEqual(res_zero["quiz_performance"]["correct_answers"], 0)
        self.assertEqual(res_zero["quiz_performance"]["incorrect_answers"], 10)

    # --- 6. Multiple Attempts, Updates, and Improvement/Decline ---
    def test_multiple_attempts_and_score_updates(self):
        """Sequential attempts update previous mastery, current mastery, and improvement."""
        user_id = "student-bob"
        topic_id = "top-py-functions"
        subject_id = "py-beg"

        # Attempt 1: 60.0%
        att1 = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=60.0,
            details={"correct_count": 6, "total_questions": 10}
        )
        self.assertEqual(att1["current_mastery"], 60.0)
        self.assertIsNone(att1["previous_mastery"])
        self.assertIsNone(att1["improvement"])
        self.assertEqual(att1["total_attempts"], 1)

        # Attempt 2: Improved to 85.0%
        att2 = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=85.0,
            details={"correct_count": 8, "total_questions": 10}
        )
        self.assertEqual(att2["current_mastery"], 85.0)
        self.assertEqual(att2["previous_mastery"], 60.0)
        self.assertEqual(att2["improvement"], 25.0)  # +25.0 improvement
        self.assertEqual(att2["total_attempts"], 2)

        # Attempt 3: Declined to 70.0%
        att3 = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=70.0,
            details={"correct_count": 7, "total_questions": 10}
        )
        self.assertEqual(att3["current_mastery"], 70.0)
        self.assertEqual(att3["previous_mastery"], 85.0)
        self.assertEqual(att3["improvement"], -15.0)  # -15.0 decline
        self.assertEqual(att3["total_attempts"], 3)

    # --- 7. Coding-Submission Processing & Hybrid Mastery ---
    def test_coding_submission_processing(self):
        """Coding submissions integrate with quiz accuracy into weighted hybrid mastery."""
        user_id = "student-bob"
        topic_id = "top-py-classes"
        subject_id = "py-beg"

        # Quiz first: 80%
        self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=80.0,
            details={"correct_count": 8, "total_questions": 10}
        )

        # Coding second: 100% (all tests passed)
        code_res = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="coding",
            score=100.0,
            details={"passed_tests": 10, "total_tests": 10}
        )

        # Expected: 80 * 0.6 + 100 * 0.4 = 48 + 40 = 88.0
        self.assertEqual(code_res["current_mastery"], 88.0)
        self.assertEqual(code_res["previous_mastery"], 80.0)
        self.assertEqual(code_res["improvement"], 8.0)
        self.assertEqual(code_res["assessment_mode"], "HYBRID")
        self.assertFalse(code_res["provisional"])
        self.assertEqual(code_res["coding_performance"]["passed_tests"], 10)

    # --- 8. Missing Student, Subject, or Topic Handling ---
    def test_missing_student_subject_topic_handling(self):
        """Unassessed topic or new student returns clean 'Not assessed' structure."""
        unassessed = self.service.get_topic_mastery("student-alice", "top-completely-unassessed")
        self.assertIsNone(unassessed["current_mastery"])
        self.assertEqual(unassessed["mastery_display"], "Not assessed")
        self.assertEqual(unassessed["mastery_status"], "NOT_ASSESSED")
        self.assertEqual(unassessed["total_attempts"], 0)
        self.assertEqual(unassessed["correct_attempts"], 0)
        self.assertIsNone(unassessed["accuracy_percentage"])

    # --- 9. Duplicate Assessment Idempotency ---
    def test_duplicate_assessment_prevention(self):
        """Resubmitting with the same assessment_id does not duplicate or increment attempts."""
        user_id = "student-bob"
        topic_id = "top-py-loops"
        subject_id = "py-beg"

        res1 = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=80.0,
            assessment_id="idemp_quiz_999"
        )
        self.assertEqual(res1["total_attempts"], 1)

        res2 = self.service.process_assessment_result(
            user_id=user_id,
            topic_id=topic_id,
            subject_id=subject_id,
            assessment_type="quiz",
            score=80.0,
            assessment_id="idemp_quiz_999"
        )
        self.assertTrue(res2.get("is_duplicate"))
        self.assertEqual(res2["total_attempts"], 1)

    # --- 10. Overall Student Statistics & Trend Calculation ---
    def test_student_statistics_calculation(self):
        """Verifies get_student_statistics computes overall mastery, trend, attempts, and improvements."""
        user_id = "student-alice"
        stats = self.service.get_student_statistics(user_id)

        self.assertEqual(stats["student_id"], user_id)
        self.assertGreaterEqual(stats["total_assessed_topics"], 1)
        self.assertIsNotNone(stats["overall_mastery"])
        self.assertIn(stats["improvement_trend"], ["IMPROVING", "DECLINING", "STEADY", "NO_DATA"])
        self.assertIn("breakdown", stats)
        self.assertIn("mastered", stats["breakdown"])
        self.assertIn("proficient", stats["breakdown"])
        self.assertIn("subjects", stats)


if __name__ == "__main__":
    unittest.main()
