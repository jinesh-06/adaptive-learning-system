"""Tests for Learning Outcomes and Feedback Module (Member 4).

Covers:
- Pre-assessment question retrieval & submission
- Post-assessment submission & improvement calculation
- Formulas:
    Score improvement = Post score - Pre score
    Accuracy (%) = (Correct / Total) * 100
    Completion rate (%) = (Completed / Assigned) * 100
- Missing pre-assessment handling (graceful, no crash)
- Zero questions & edge cases
- Student feedback CRUD & validation (1-5 rating, comments)
- Security: Unauthorized rejection (401) and student data isolation (403)
"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

# Establish isolated database environment before any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_learning_outcomes.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service
from backend.services.learning_outcomes_service import learning_outcomes_service
from backend.main import app


class TestLearningOutcomesAndFeedback(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

        # Seed two students for data isolation testing
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_alice", "alice@cognitive.edu", "Alice", "student")
        )
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_bob", "bob@cognitive.edu", "Bob", "student")
        )
        conn.commit()
        conn.close()

        cls.token_alice = auth_service.create_internal_token("student_alice", "alice@cognitive.edu", "student")
        cls.token_bob = auth_service.create_internal_token("student_bob", "bob@cognitive.edu", "student")
        cls.headers_alice = {"Authorization": f"Bearer {cls.token_alice}"}
        cls.headers_bob = {"Authorization": f"Bearer {cls.token_bob}"}

    @classmethod
    def tearDownClass(cls):
        _TEST_TEMP_DIR.cleanup()

    # --- 1. Question Retrieval ---
    def test_01_get_assessment_questions_sanitized(self):
        """Pre and post assessment questions must be sanitized (no correct answers leaked)."""
        # Pre-assessment questions
        res_pre = self.client.get("/api/assessments/top-py-intro/questions?type=pre")
        self.assertEqual(res_pre.status_code, 200)
        data_pre = res_pre.json()
        self.assertEqual(data_pre["assessment_type"], "pre")
        self.assertEqual(data_pre["topic_id"], "top-py-intro")
        self.assertGreaterEqual(len(data_pre["questions"]), 1)

        for q in data_pre["questions"]:
            self.assertNotIn("correct_index", q, "Pre-assessment must NOT leak correct_index")
            self.assertNotIn("correctIndex", q, "Pre-assessment must NOT leak correctIndex")
            self.assertNotIn("explanation", q, "Pre-assessment must NOT leak explanation")
            self.assertIn("question", q)
            self.assertEqual(len(q["options"]), 4)

        # Post-assessment questions
        res_post = self.client.get("/api/assessments/top-py-intro/questions?type=post")
        self.assertEqual(res_post.status_code, 200)
        data_post = res_post.json()
        self.assertEqual(data_post["assessment_type"], "post")
        self.assertGreaterEqual(len(data_post["questions"]), 1)

    # --- 2. Pre-Assessment Submission ---
    def test_02_pre_assessment_submission_and_scoring(self):
        """Submit pre-assessment: validates score, marks, accuracy = (correct/total)*100."""
        topic_id = "top-py-intro"
        # Get questions to know question IDs
        q_res = self.client.get(f"/api/assessments/{topic_id}/questions?type=pre")
        questions = q_res.json()["questions"]
        self.assertTrue(len(questions) > 0)

        # Submit answers: answering 0 for all
        answers = {q["id"]: 0 for q in questions}

        payload = {
            "assessment_type": "pre",
            "answers": answers,
            "time_spent": 42.5
        }

        res = self.client.post(
            f"/api/assessments/{topic_id}/submit",
            json=payload,
            headers=self.headers_alice
        )
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["student_id"], "student_alice")
        self.assertEqual(body["topic_id"], topic_id)
        self.assertEqual(body["assessment_type"], "pre")
        self.assertGreaterEqual(body["total_questions"], 1)
        self.assertGreaterEqual(body["correct_answers"], 0)
        self.assertLessEqual(body["correct_answers"], body["total_questions"])
        self.assertEqual(body["score"], float(body["correct_answers"]))

        # Accuracy (%) = (Correct answers / Total questions) * 100
        expected_accuracy = round((body["correct_answers"] / body["total_questions"]) * 100.0, 2)
        self.assertEqual(body["accuracy"], expected_accuracy)

    # --- 3. Post-Assessment Submission & Score Improvement ---
    def test_03_post_assessment_submission_and_improvement(self):
        """Submit post-assessment: compares against pre-assessment and computes score improvement."""
        topic_id = "top-py-variables-datatypes"

        # 1. Take Pre-Assessment with deliberate answer choices
        from backend.services.quiz_service import quiz_service
        raw_quiz = quiz_service.get_quiz_for_topic(topic_id)
        raw_pre_q = raw_quiz["questions"][:5]

        # Give intentionally wrong answers on pre-assessment so score is low (0 or 1)
        pre_answers = {}
        for q in raw_pre_q:
            wrong_idx = (q["correct_index"] + 1) % 4
            pre_answers[str(q["id"])] = wrong_idx

        pre_res = self.client.post(
            f"/api/assessments/{topic_id}/submit",
            json={"assessment_type": "pre", "answers": pre_answers, "time_spent": 50.0},
            headers=self.headers_alice
        )
        self.assertEqual(pre_res.status_code, 200)
        pre_data = pre_res.json()
        self.assertEqual(pre_data["correct_answers"], 0)
        self.assertEqual(pre_data["accuracy"], 0.0)

        # 2. Take Post-Assessment with all correct answers
        raw_post_q = raw_quiz["questions"][5:10]
        post_answers = {}
        for q in raw_post_q:
            post_answers[str(q["id"])] = q["correct_index"]

        post_res = self.client.post(
            f"/api/assessments/{topic_id}/submit",
            json={"assessment_type": "post", "answers": post_answers, "time_spent": 65.0},
            headers=self.headers_alice
        )
        self.assertEqual(post_res.status_code, 200)
        post_data = post_res.json()
        self.assertEqual(post_data["correct_answers"], len(raw_post_q))
        self.assertEqual(post_data["accuracy"], 100.0)

        # Check comparison
        comp = post_data["comparison"]
        self.assertIsNotNone(comp)
        self.assertTrue(comp["has_pre_assessment"])
        self.assertEqual(comp["pre_score"], pre_data["score"])
        self.assertEqual(comp["post_score"], post_data["score"])

        # Score improvement = Post-assessment score − Pre-assessment score
        expected_score_improvement = round(post_data["score"] - pre_data["score"], 2)
        self.assertEqual(comp["score_improvement"], expected_score_improvement)

        # Percentage-point improvement = Post accuracy - Pre accuracy
        expected_pct_improvement = round(post_data["accuracy"] - pre_data["accuracy"], 2)
        self.assertEqual(comp["percentage_point_improvement"], expected_pct_improvement)
        self.assertTrue(comp["improved"])

    # --- 4. Post-Assessment Missing Pre-Assessment ---
    def test_04_post_assessment_missing_pre_record(self):
        """Taking a post-assessment without any pre-assessment must handle missing pre gracefully without crashing."""
        topic_id = "top-c-intro"

        post_res = self.client.post(
            f"/api/assessments/{topic_id}/submit",
            json={"assessment_type": "post", "answers": {"q1": 0}, "time_spent": 30.0},
            headers=self.headers_alice
        )
        self.assertEqual(post_res.status_code, 200)
        post_data = post_res.json()
        self.assertTrue(post_data["success"])

        comp = post_data["comparison"]
        self.assertIsNotNone(comp)
        self.assertFalse(comp["has_pre_assessment"])
        self.assertIsNone(comp["pre_score"])
        self.assertIsNone(comp["score_improvement"])
        self.assertIn("No prior pre-assessment", comp["summary_text"])

    # --- 5. Learning Outcome Calculations ---
    def test_05_learning_outcome_calculations(self):
        """Verify summary metrics: score improvement, accuracy %, completion rate %, topic progress."""
        res = self.client.get("/api/learning-outcomes", headers=self.headers_alice)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        summary = data["summary"]
        self.assertIn("number_of_completed_assessments", summary)
        self.assertIn("number_of_assigned_assessments", summary)
        self.assertIn("assessment_completion_rate", summary)
        self.assertIn("accuracy_percentage", summary)
        self.assertIn("average_score_improvement", summary)
        self.assertIn("average_percentage_point_improvement", summary)

        # Completion rate = (completed / assigned) * 100
        completed = summary["number_of_completed_assessments"]
        assigned = summary["number_of_assigned_assessments"]
        expected_rate = round((completed / assigned) * 100.0, 2)
        self.assertEqual(summary["assessment_completion_rate"], expected_rate)

        # Topic outcomes list
        topic_outcomes = data["topic_outcomes"]
        self.assertTrue(len(topic_outcomes) > 0)
        var_topic = next((t for t in topic_outcomes if t["topic_id"] == "top-py-variables-datatypes"), None)
        self.assertIsNotNone(var_topic)
        self.assertEqual(var_topic["status"], "COMPLETED")
        self.assertTrue(var_topic["has_pre_assessment"])
        self.assertTrue(var_topic["has_post_assessment"])
        self.assertGreater(var_topic["score_improvement"], 0)

    # --- 6. Edge Cases: Zero Questions & Invalid Inputs ---
    def test_06_edge_cases_zero_questions_and_invalid_inputs(self):
        """Zero questions handle division safely; invalid types and scores are rejected."""
        # 1. Invalid assessment type
        res_invalid_type = self.client.get("/api/assessments/top-py-intro/questions?type=midterm")
        self.assertEqual(res_invalid_type.status_code, 400)

        # 2. Submission with invalid assessment type
        res_sub_bad = self.client.post(
            "/api/assessments/top-py-intro/submit",
            json={"assessment_type": "invalid_type", "answers": {}},
            headers=self.headers_alice
        )
        self.assertEqual(res_sub_bad.status_code, 400)

        # 3. Direct service call with simulated zero questions
        zero_res = learning_outcomes_service.grade_and_record_assessment(
            student_id="student_alice",
            topic_id="top-py-intro",
            assessment_type="pre",
            user_answers={}
        )
        self.assertGreaterEqual(zero_res["accuracy"], 0.0)

        # 4. Empty topic ID rejected
        res_empty_topic = self.client.get("/api/assessments/%20/questions?type=pre")
        self.assertEqual(res_empty_topic.status_code, 400)

    # --- 7. Student Feedback CRUD & Validation ---
    def test_07_student_feedback_crud_and_validation(self):
        """Submit feedback (1-5 rating, comments, category), retrieve, edit, and delete."""
        # 1. Validation: rating > 5 rejected
        res_bad_rating = self.client.post(
            "/api/student-feedback",
            json={"topic_id": "top-py-intro", "rating": 6, "comments": "Too high rating"},
            headers=self.headers_alice
        )
        self.assertEqual(res_bad_rating.status_code, 422)  # Pydantic validation error

        # 2. Validation: rating < 1 rejected
        res_zero_rating = self.client.post(
            "/api/student-feedback",
            json={"topic_id": "top-py-intro", "rating": 0, "comments": "Zero rating"},
            headers=self.headers_alice
        )
        self.assertEqual(res_zero_rating.status_code, 422)

        # 3. Validation: empty comments rejected
        res_empty_comment = self.client.post(
            "/api/student-feedback",
            json={"topic_id": "top-py-intro", "rating": 5, "comments": ""},
            headers=self.headers_alice
        )
        self.assertEqual(res_empty_comment.status_code, 422)

        # 4. Valid Feedback Submission
        res_create = self.client.post(
            "/api/student-feedback",
            json={
                "topic_id": "top-py-intro",
                "rating": 5,
                "comments": "The interactive exercises and pre-assessment really helped clarify concepts!",
                "feedback_type": "lesson"
            },
            headers=self.headers_alice
        )
        self.assertEqual(res_create.status_code, 200)
        created_body = res_create.json()
        self.assertTrue(created_body["success"])
        fb = created_body["feedback"]
        self.assertEqual(fb["student_id"], "student_alice")
        self.assertEqual(fb["rating"], 5)
        self.assertEqual(fb["feedback_type"], "lesson")
        feedback_id = fb["id"]

        # 5. List Student Feedback
        res_list = self.client.get("/api/student-feedback", headers=self.headers_alice)
        self.assertEqual(res_list.status_code, 200)
        items = res_list.json()["feedback"]
        self.assertTrue(any(item["id"] == feedback_id for item in items))

        # 6. Update Student Feedback
        res_update = self.client.put(
            f"/api/student-feedback/{feedback_id}",
            json={"rating": 4, "comments": "Updated comment: very clear explanations."},
            headers=self.headers_alice
        )
        self.assertEqual(res_update.status_code, 200)
        updated_fb = res_update.json()["feedback"]
        self.assertEqual(updated_fb["rating"], 4)
        self.assertEqual(updated_fb["comments"], "Updated comment: very clear explanations.")

        # 7. Delete Student Feedback
        res_del = self.client.delete(f"/api/student-feedback/{feedback_id}", headers=self.headers_alice)
        self.assertEqual(res_del.status_code, 200)
        self.assertTrue(res_del.json()["success"])

        # Verify it is deleted
        res_verify_del = self.client.get(f"/api/student-feedback/{feedback_id}", headers=self.headers_alice)
        self.assertEqual(res_verify_del.status_code, 404)

    # --- 8. Security: Unauthorized Requests ---
    def test_08_unauthorized_requests_rejected(self):
        """Endpoints requiring authentication must reject unauthenticated requests with HTTP 401."""
        res_outcomes = self.client.get("/api/learning-outcomes")
        self.assertEqual(res_outcomes.status_code, 401)

        res_submit = self.client.post(
            "/api/assessments/top-py-intro/submit",
            json={"assessment_type": "pre", "answers": {}}
        )
        self.assertEqual(res_submit.status_code, 401)

        res_fb = self.client.post(
            "/api/student-feedback",
            json={"topic_id": "top-py-intro", "rating": 5, "comments": "Nice"}
        )
        self.assertEqual(res_fb.status_code, 401)

    # --- 9. Security: Student Data Isolation ---
    def test_09_security_student_data_isolation(self):
        """Students can only access, edit, and delete their own feedback and assessment data."""
        # Alice creates feedback
        res_create = self.client.post(
            "/api/student-feedback",
            json={"topic_id": "top-py-intro", "rating": 5, "comments": "Alice's secret note", "feedback_type": "lesson"},
            headers=self.headers_alice
        )
        alice_fb_id = res_create.json()["feedback"]["id"]

        # Bob attempts to read Alice's feedback directly -> 403 Forbidden
        res_bob_read = self.client.get(f"/api/student-feedback/{alice_fb_id}", headers=self.headers_bob)
        self.assertEqual(res_bob_read.status_code, 403)

        # Bob attempts to update Alice's feedback -> 403 Forbidden
        res_bob_update = self.client.put(
            f"/api/student-feedback/{alice_fb_id}",
            json={"rating": 1, "comments": "Tampered by Bob"},
            headers=self.headers_bob
        )
        self.assertEqual(res_bob_update.status_code, 403)

        # Bob attempts to delete Alice's feedback -> 403 Forbidden
        res_bob_del = self.client.delete(f"/api/student-feedback/{alice_fb_id}", headers=self.headers_bob)
        self.assertEqual(res_bob_del.status_code, 403)

        # Bob's feedback list does NOT include Alice's feedback
        res_bob_list = self.client.get("/api/student-feedback", headers=self.headers_bob)
        self.assertEqual(res_bob_list.status_code, 200)
        bob_feedbacks = res_bob_list.json()["feedback"]
        self.assertFalse(any(fb["id"] == alice_fb_id for fb in bob_feedbacks))

        # Bob's learning outcomes show 0 assessments completed despite Alice having completed assessments
        res_bob_outcomes = self.client.get("/api/learning-outcomes", headers=self.headers_bob)
        self.assertEqual(res_bob_outcomes.status_code, 200)
        bob_summary = res_bob_outcomes.json()["summary"]
        self.assertEqual(bob_summary["number_of_completed_assessments"], 0)

    # --- 10. Assessment-to-Mastery Integration ---
    def test_10_post_assessment_updates_mastery_and_pre_does_not(self):
        """Pre-assessments remain diagnostic baselines, while post-assessments update topic mastery."""
        test_topic = "top-py-intro"

        # 1. Submit pre-assessment for Alice
        pre_res = self.client.post(
            f"/api/assessments/{test_topic}/submit",
            json={
                "assessment_type": "pre",
                "answers": {"0": 0, "1": 0},
                "time_spent": 12.0
            },
            headers=self.headers_alice
        )
        self.assertEqual(pre_res.status_code, 200)
        self.assertTrue(pre_res.json()["success"])

        # Check topic mastery for Alice - should NOT exist for this topic yet
        topic_m_before = self.client.get(f"/api/mastery/topics/{test_topic}", headers=self.headers_alice)
        self.assertEqual(topic_m_before.status_code, 200)
        before_data = topic_m_before.json()["data"]
        self.assertIsNone(before_data["current_mastery"])
        self.assertEqual(before_data["mastery_status"], "NOT_ASSESSED")

        # 2. Submit post-assessment for Alice
        post_res = self.client.post(
            f"/api/assessments/{test_topic}/submit",
            json={
                "assessment_type": "post",
                "answers": {"0": 0, "1": 1, "2": 2, "3": 0, "4": 1},
                "time_spent": 30.0
            },
            headers=self.headers_alice
        )
        self.assertEqual(post_res.status_code, 200)
        self.assertTrue(post_res.json()["success"])

        # Check topic mastery for Alice - must now be updated
        topic_m_after = self.client.get(f"/api/mastery/topics/{test_topic}", headers=self.headers_alice)
        self.assertEqual(topic_m_after.status_code, 200)
        after_data = topic_m_after.json()["data"]
        self.assertIsNotNone(after_data["current_mastery"])
        self.assertNotEqual(after_data["mastery_status"], "NOT_ASSESSED")
        self.assertGreaterEqual(after_data["quiz_performance"]["attempts"], 1)
        self.assertGreaterEqual(after_data["total_attempts"], 1)

        # 3. Verify Bob cannot see Alice's mastery
        bob_m = self.client.get(f"/api/mastery/topics/{test_topic}", headers=self.headers_bob)
        self.assertEqual(bob_m.status_code, 200)
        bob_data = bob_m.json()["data"]
        self.assertIsNone(bob_data["current_mastery"])
        self.assertEqual(bob_data["mastery_status"], "NOT_ASSESSED")


if __name__ == "__main__":
    unittest.main()
