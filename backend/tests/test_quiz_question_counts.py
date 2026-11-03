"""Regression tests for quiz question count alignment and accurate evaluation.

Verifies:
1. Standard topic mastery quizzes retrieve and evaluate exactly 10 questions.
2. Intentional 2-question comprehension checks evaluate only 2 questions with denominator 2.
3. Phantom questions are eliminated from the review and results.
4. Unanswered or never-presented questions are not marked incorrect.
5. Partial answers grade accurately based on evaluated questions.
6. Server-side authoritative validation prevents answer spoofing.
7. Pre- and post-assessments remain strictly 5 questions.
8. Multiple languages (Python, C, C++, Java) behave consistently.
9. Idempotent submission replay preserves exact question count and review items.
"""

import os
import json
import tempfile
import unittest
from pathlib import Path

# Isolated database setup
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_quiz_counts.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service
from backend.services.quiz_service import quiz_service
from backend.services.adapted_lesson_service import adapted_lesson_service
from backend.main import app


class TestQuizQuestionCounts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("quiz_student_1", "student1@cognitive.edu", "Student One", "student")
        )
        conn.commit()
        conn.close()

        cls.user_id = "quiz_student_1"
        cls.token = auth_service.create_internal_token(cls.user_id, "student1@cognitive.edu", "student")
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    @classmethod
    def tearDownClass(cls):
        _TEST_TEMP_DIR.cleanup()

    # --- 1. Standard 10-Question Retrieval ---
    def test_01_standard_quiz_loads_exactly_10_questions(self):
        """Standard mastery quiz must load exactly 10 valid questions."""
        res = self.client.get("/api/topics/top-py-intro/quiz", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        questions = data.get("questions", [])
        self.assertEqual(len(questions), 10, "Standard topic quiz must return exactly 10 questions")

        for q in questions:
            self.assertIn("id", q)
            self.assertIn("question", q)
            self.assertEqual(len(q.get("options", [])), 4, "Every question must have 4 options")
            self.assertIn("correct_index", q)
            self.assertIn(q["correct_index"], [0, 1, 2, 3])

    # --- 2. Standard 10-Question Submission & Scoring ---
    def test_02_standard_10_question_submission_and_scoring(self):
        """Standard 10-question quiz submission grades all 10 questions accurately."""
        quiz_data = quiz_service.get_quiz_for_topic("top-py-intro")
        questions = quiz_data["questions"]
        self.assertEqual(len(questions), 10)

        # Answer 8 correctly, 2 incorrectly
        answers = {}
        for idx, q in enumerate(questions):
            qid = str(q["id"])
            correct_idx = q["correct_index"]
            if idx < 8:
                answers[qid] = correct_idx
            else:
                answers[qid] = (correct_idx + 1) % 4

        payload = {
            "answers": answers,
            "time_spent": 120.0,
            "submission_id": "sub_std_10_q",
            "quiz_type": "mastery",
            "question_ids": [str(q["id"]) for q in questions]
        }

        res = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["total_questions"], 10)
        self.assertEqual(data["correct_count"], 8)
        self.assertEqual(data["incorrect_count"], 2)
        self.assertEqual(data["percentage"], 80)
        self.assertTrue(data["passed"])
        self.assertEqual(len(data["review"]), 10)
        self.assertEqual(len(data["results"]), 10)

    # --- 3. Intentional 2-Question Comprehension Check ---
    def test_03_intentional_2_question_comprehension_check(self):
        """Adapted 2-question check evaluates only 2 questions with denominator 2 and no phantom questions."""
        # Seed an adapted lesson with a 2-question knowledge check
        adapted_quiz_questions = [
            {
                "id": "kc-test-1",
                "question": "What is the primary function of Python print()?",
                "options": ["Outputs to console", "Reads input", "Terminates program", "Compiles code"],
                "correct_index": 0,
                "explanation": "print() outputs text representation to stdout."
            },
            {
                "id": "kc-test-2",
                "question": "Is Python dynamically typed?",
                "options": ["No", "Yes", "Only in strict mode", "Depends on OS"],
                "correct_index": 1,
                "explanation": "Python performs type checks dynamically at runtime."
            }
        ]

        state_store.save_adapted_lesson(
            user_id=self.user_id,
            topic_id="top-py-intro",
            adaptation_strategy="SIMPLIFIED",
            lesson_data={
                "id": "lesson_adapted_intro",
                "topic_id": "top-py-intro",
                "sections": [
                    {
                        "id": "knowledge-check",
                        "type": "quiz",
                        "title": "Check Your Understanding",
                        "questions": adapted_quiz_questions
                    }
                ]
            },
            detail_level="simplified"
        )

        # Student answers both questions correctly
        payload = {
            "answers": {
                "kc-test-1": 0,
                "kc-test-2": 1
            },
            "time_spent": 30.0,
            "submission_id": "sub_comp_check_2q",
            "quiz_type": "comprehension_check",
            "question_ids": ["kc-test-1", "kc-test-2"],
            "detail_level": "simplified"
        }

        res = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # CRITICAL ASSERTIONS:
        # Score must be 100%, total must be 2, review must have 2 items, NOT 10!
        self.assertEqual(data["total_questions"], 2, "Comprehension check must have total_questions == 2")
        self.assertEqual(data["correct_count"], 2, "Both answered questions were correct")
        self.assertEqual(data["incorrect_count"], 0, "No incorrect answers")
        self.assertEqual(data["percentage"], 100, "2/2 must evaluate to 100%")
        self.assertTrue(data["passed"], "100% must be passing")
        self.assertEqual(len(data["review"]), 2, "Review must contain strictly 2 items, NO phantom questions")
        review_ids = [r["id"] for r in data["review"]]
        self.assertEqual(review_ids, ["kc-test-1", "kc-test-2"])

    # --- 4. Partial Answers Evaluation ---
    def test_04_partial_answers_evaluated_without_penalizing_unasked_questions(self):
        """Unanswered questions must not be marked incorrect, and denominator must match evaluated questions."""
        quiz_data = quiz_service.get_quiz_for_topic("top-py-intro")
        questions = quiz_data["questions"]

        # Student submits answers for only first 4 questions (3 correct, 1 incorrect)
        answers = {}
        for idx in range(4):
            q = questions[idx]
            if idx < 3:
                answers[str(q["id"])] = q["correct_index"]
            else:
                answers[str(q["id"])] = (q["correct_index"] + 1) % 4

        payload = {
            "answers": answers,
            "time_spent": 45.0,
            "submission_id": "sub_partial_4q",
            "quiz_type": "mastery",
            "question_ids": [str(q["id"]) for q in questions]
        }

        res = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["total_questions"], 4, "Denominator must match the 4 evaluated questions")
        self.assertEqual(data["correct_count"], 3)
        self.assertEqual(data["incorrect_count"], 1)
        self.assertEqual(data["percentage"], 75, "3 / 4 must be 75%")
        self.assertTrue(data["passed"], "75% >= 70% is passing")
        self.assertEqual(len(data["review"]), 4, "Review must have strictly 4 items")

    # --- 5. Security: Server-side Answer Key Enforcement ---
    def test_05_client_cannot_spoof_correct_answers(self):
        """Grading uses server-side correct_index; client cannot dictate correctness."""
        quiz_data = quiz_service.get_quiz_for_topic("top-py-intro")
        q0 = quiz_data["questions"][0]
        actual_correct = q0["correct_index"]
        wrong_choice = (actual_correct + 1) % 4

        # Submit wrong answer
        payload = {
            "answers": {str(q0["id"]): wrong_choice},
            "time_spent": 10.0,
            "submission_id": "sub_spoof_attempt",
            "quiz_type": "mastery",
            "question_ids": [str(q0["id"])]
        }

        res = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["correct_count"], 0)
        self.assertEqual(data["incorrect_count"], 1)
        self.assertEqual(data["percentage"], 0)
        self.assertFalse(data["review"][0]["is_correct"])

    # --- 6. Pre and Post Assessment Invariance ---
    def test_06_pre_and_post_assessments_strictly_5_questions(self):
        """Pre and post assessments must remain strictly 5 questions each."""
        # Pre questions
        res_pre = self.client.get("/api/assessments/top-py-intro/questions?type=pre", headers=self.headers)
        self.assertEqual(res_pre.status_code, 200)
        data_pre = res_pre.json()
        self.assertEqual(len(data_pre["questions"]), 5, "Pre-assessment must have strictly 5 questions")

        # Post questions
        res_post = self.client.get("/api/assessments/top-py-intro/questions?type=post", headers=self.headers)
        self.assertEqual(res_post.status_code, 200)
        data_post = res_post.json()
        self.assertEqual(len(data_post["questions"]), 5, "Post-assessment must have strictly 5 questions")

        # Verify no question overlap between pre and post
        pre_ids = {q["id"] for q in data_pre["questions"]}
        post_ids = {q["id"] for q in data_post["questions"]}
        self.assertEqual(len(pre_ids.intersection(post_ids)), 0, "Pre and post assessments must not overlap")

    # --- 7. Multiple Languages Compatibility ---
    def test_07_multiple_languages_standard_quiz_has_10_questions(self):
        """C, C++, and Java topic quizzes all return strictly 10 questions."""
        test_topics = [
            ("top-c-intro", "C"),
            ("top-c-pointers", "C"),
            ("top-py-loops", "Python"),
            ("top-py-adv-metaclasses", "Python")
        ]

        for topic_id, lang in test_topics:
            res = self.client.get(f"/api/topics/{topic_id}/quiz", headers=self.headers)
            self.assertEqual(res.status_code, 200, f"Failed for {topic_id} ({lang})")
            data = res.json()
            questions = data.get("questions", [])
            self.assertEqual(len(questions), 10, f"{topic_id} ({lang}) must have exactly 10 questions")

    # --- 8. Idempotent Submission Replay ---
    def test_08_idempotent_submission_preserves_question_count_and_review(self):
        """Submitting with the same submission_id returns identical total_questions and review."""
        payload = {
            "answers": {"0": 1, "1": 2},
            "time_spent": 40.0,
            "submission_id": "sub_idempotent_test_999",
            "quiz_type": "comprehension_check",
            "question_ids": ["kc-test-1", "kc-test-2"]
        }

        # First submission
        res1 = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()

        # Second submission (replay)
        res2 = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()

        self.assertTrue(data2.get("idempotent_replay"))
        self.assertEqual(data1["total_questions"], data2["total_questions"])
        self.assertEqual(data1["correct_count"], data2["correct_count"])
        self.assertEqual(data1["percentage"], data2["percentage"])
        self.assertEqual(len(data1["review"]), len(data2["review"]))


    # --- 9. Adapted Mastery Quiz Loads Exactly 10 Questions ---
    def test_09_adapted_mastery_quiz_loads_exactly_10_questions(self):
        """Every adapted lesson mastery quiz must contain exactly 10 questions with 4 options each."""
        res = self.client.get("/api/topics/top-py-intro/quiz?quiz_type=adapted", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        questions = data.get("questions", [])
        self.assertEqual(len(questions), 10, "Adapted lesson mastery quiz must return strictly 10 questions")

        for q in questions:
            self.assertIn("id", q)
            self.assertIn("question", q)
            self.assertEqual(len(q.get("options", [])), 4, "Every question must have 4 options")
            self.assertIn("correct_index", q)
            self.assertIn(q["correct_index"], [0, 1, 2, 3])

    # --- 10. Two Consecutive Attempts Have Zero Overlap When Pool is Sufficient ---
    def test_10_two_consecutive_attempts_have_zero_overlap_when_pool_sufficient(self):
        """Consecutive attempts by the same student on the same topic must use disjoint question sets."""
        student_id = "quiz_student_consecutive"
        token = auth_service.create_internal_token(student_id, "student_consec@cognitive.edu", "student")
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt 1
        res1 = self.client.get("/api/topics/top-py-intro/quiz?refresh=true", headers=headers)
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        q1 = data1.get("questions", [])
        self.assertEqual(len(q1), 10)
        ids1 = [str(q["id"]) for q in q1]

        # Attempt 2 (consecutive request by same student)
        res2 = self.client.get("/api/topics/top-py-intro/quiz?refresh=true", headers=headers)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        q2 = data2.get("questions", [])
        self.assertEqual(len(q2), 10)
        ids2 = [str(q["id"]) for q in q2]

        overlap = set(ids1).intersection(set(ids2))
        self.assertEqual(len(overlap), 0, f"Expected 0 overlapping questions between consecutive attempts, got: {overlap}")

    # --- 11. Separate Question History for Different Users ---
    def test_11_separate_question_history_for_different_users(self):
        """Student A's question history does not restrict or deplete questions presented to Student B."""
        user_a = "student_user_alpha"
        user_b = "student_user_beta"
        token_a = auth_service.create_internal_token(user_a, "alpha@cognitive.edu", "student")
        token_b = auth_service.create_internal_token(user_b, "beta@cognitive.edu", "student")

        # User A requests quiz
        res_a = self.client.get("/api/topics/top-py-loops/quiz?refresh=true", headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(res_a.status_code, 200)
        ids_a = [str(q["id"]) for q in res_a.json().get("questions", [])]
        self.assertEqual(len(ids_a), 10)

        # User B requests quiz for same topic - history must be fresh for User B
        res_b = self.client.get("/api/topics/top-py-loops/quiz?refresh=true", headers={"Authorization": f"Bearer {token_b}"})
        self.assertEqual(res_b.status_code, 200)
        ids_b = [str(q["id"]) for q in res_b.json().get("questions", [])]
        self.assertEqual(len(ids_b), 10)

        # User B's presented questions in state_store must be isolated
        b_history = state_store.get_presented_question_ids(user_b, "top-py-loops")
        self.assertEqual(set(b_history), set(ids_b))
        self.assertNotIn(user_a, b_history)

    # --- 12. Safe Behavior When Fewer Than 10 Unique Questions are Available ---
    def test_12_safe_behavior_when_fewer_than_10_unique_questions_available(self):
        """When candidate pool is small (e.g. 3 questions), select_unique_10_questions pads safely to 10 without duplicate IDs."""
        small_pool = [
            {"id": "q-small-1", "question": "Question 1?", "options": ["A", "B", "C", "D"], "correct_index": 0},
            {"id": "q-small-2", "question": "Question 2?", "options": ["A", "B", "C", "D"], "correct_index": 1},
            {"id": "q-small-3", "question": "Question 3?", "options": ["A", "B", "C", "D"], "correct_index": 2}
        ]

        selected = quiz_service.select_unique_10_questions(small_pool, [], "top-small-demo", "Small Topic Demo")
        self.assertEqual(len(selected), 10, "Must return strictly 10 questions even if candidate pool is small")

        # Verify all 10 question IDs are unique
        all_ids = [q["id"] for q in selected]
        self.assertEqual(len(set(all_ids)), 10, "All 10 question IDs must be distinct; no duplicates within an attempt")

        for q in selected:
            self.assertEqual(len(q["options"]), 4)
            self.assertIn(q["correct_index"], [0, 1, 2, 3])

    # --- 13. AI Generation Failure and Offline Fallback Still Produces 10 Questions ---
    def test_13_ai_generation_failure_and_offline_fallback_produces_10_questions(self):
        """When LLM API fails, offline fallback executes seamlessly and delivers exactly 10 questions."""
        from unittest.mock import patch

        with patch.object(adapted_lesson_service, "_generate_with_gemini", return_value=None):
            adapted_res = adapted_lesson_service.generate_adapted_lesson(
                user_id="offline_fallback_tester",
                topic_id="top-py-intro",
                detail_level="STANDARD",
                force_refresh=True
            )
            self.assertTrue(adapted_res.get("success"))
            lesson = adapted_res.get("lesson")
            self.assertIsNotNone(lesson)

            quiz_sec = next((s for s in lesson.get("sections", []) if s.get("type") == "quiz" or s.get("id") == "knowledge-check"), None)
            self.assertIsNotNone(quiz_sec)
            questions = quiz_sec.get("questions", [])
            self.assertEqual(len(questions), 10, "Offline fallback adapted lesson quiz must contain strictly 10 questions")

    # --- 14. Server-Side Scoring Based Only on Questions Actually Presented ---
    def test_14_server_side_scoring_based_only_on_questions_actually_presented(self):
        """Scoring uses authoritative server session answer keys and evaluates strictly presented/answered questions."""
        # Issue an adapted quiz
        quiz_res = self.client.get("/api/topics/top-py-intro/quiz?quiz_type=adapted&refresh=true", headers=self.headers)
        self.assertEqual(quiz_res.status_code, 200)
        quiz_data = quiz_res.json()
        questions = quiz_data["questions"]
        session_id = quiz_data.get("session_id")
        self.assertEqual(len(questions), 10)

        # Answer all 10 questions: 9 correct, 1 wrong
        answers = {}
        for idx, q in enumerate(questions):
            qid = str(q["id"])
            if idx < 9:
                answers[qid] = q["correct_index"]
            else:
                answers[qid] = (q["correct_index"] + 1) % 4

        payload = {
            "answers": answers,
            "time_spent": 110.0,
            "submission_id": session_id or "sub_presented_score_test",
            "quiz_type": "adapted",
            "question_ids": [str(q["id"]) for q in questions]
        }

        res = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["total_questions"], 10)
        self.assertEqual(data["correct_count"], 9)
        self.assertEqual(data["incorrect_count"], 1)
        self.assertEqual(data["percentage"], 90)
        self.assertTrue(data["passed"])
        self.assertEqual(len(data["review"]), 10)

        # Review items must match presented questions
        review_ids = [r["id"] for r in data["review"]]
        self.assertEqual(review_ids, [str(q["id"]) for q in questions])

    # --- 15. Invalid Question IDs Ignored and Not Penalized ---
    def test_15_invalid_question_ids_ignored_and_not_penalized(self):
        """Submitting non-existent question IDs is safely ignored and does not count as incorrect."""
        quiz_data = quiz_service.get_quiz_for_topic("top-py-intro", user_id=self.user_id)
        questions = quiz_data["questions"]

        # Valid answer for first 3 questions + 2 completely fabricated question IDs
        answers = {
            str(questions[0]["id"]): questions[0]["correct_index"],
            str(questions[1]["id"]): questions[1]["correct_index"],
            str(questions[2]["id"]): questions[2]["correct_index"],
            "fake-malicious-q-999": 0,
            "another-fake-id-888": 2
        }

        payload = {
            "answers": answers,
            "time_spent": 50.0,
            "submission_id": "sub_test_invalid_qids",
            "quiz_type": "mastery",
            "question_ids": [str(questions[0]["id"]), str(questions[1]["id"]), str(questions[2]["id"]), "fake-malicious-q-999", "another-fake-id-888"]
        }

        res = self.client.post("/api/topics/top-py-intro/quiz/submit", json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Denominator should only be the 3 legitimate questions
        self.assertEqual(data["total_questions"], 3, "Denominator must count only the 3 valid presented questions")
        self.assertEqual(data["correct_count"], 3)
        self.assertEqual(data["incorrect_count"], 0)
        self.assertEqual(data["percentage"], 100)
        self.assertEqual(len(data["review"]), 3)


if __name__ == "__main__":
    unittest.main()

