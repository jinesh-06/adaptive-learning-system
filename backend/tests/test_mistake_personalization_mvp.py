"""End-to-End Integration Tests for Mistake-Based Personalization MVP.

Verifies:
1. An incorrect quiz answer creates persistent concept-level negative evidence (NEEDS_REVIEW).
2. A correct answer creates positive evidence (LEARNING / MASTERED according to rules).
3. A later correct practice answer updates concept state according to established mastery rules.
4. Historical quiz attempts remain unchanged in quiz_attempts table.
5. Repeated submissions do not duplicate evidence or counters (idempotency).
6. Unmapped questions are handled safely with documented fallbacks.
7. Unanswered questions remain distinguishable from selected wrong answers.
8. One student's concept history is never visible to another student (isolation).
9. Adapted lesson generation receives the appropriate known concepts and weak concepts.
10. Existing cognitive-load adaptation and quiz functionality continue to work seamlessly.
"""

import os
import json
import tempfile
import unittest
from pathlib import Path

# Establish isolated disposable database before backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_mistake_personalization_mvp.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service
from backend.services.concept_service import concept_service
from backend.services.quiz_service import quiz_service
from backend.services.adapted_lesson_service import adapted_lesson_service
from backend.main import app


class TestMistakePersonalizationMVP(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)

        # Seed isolated test learners
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_alpha", "alpha@cognitive.edu", "Alpha Learner", "student")
        )
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_beta", "beta@cognitive.edu", "Beta Learner", "student")
        )
        conn.commit()
        conn.close()

        cls.token_alpha = auth_service.create_internal_token("student_alpha", "alpha@cognitive.edu", "student")
        cls.token_beta = auth_service.create_internal_token("student_beta", "beta@cognitive.edu", "student")

        cls.headers_alpha = {"Authorization": f"Bearer {cls.token_alpha}"}
        cls.headers_beta = {"Authorization": f"Bearer {cls.token_beta}"}
        cls.topic_id = "top-py-fundamentals"

    def test_01_quiz_submission_updates_concept_evidence_for_correct_and_incorrect(self):
        """Item 1 & 2: Submitting a quiz records positive evidence for correct and negative evidence for mistakes."""
        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        self.assertEqual(quiz_res.status_code, 200)
        questions = quiz_res.json().get("questions", [])
        self.assertEqual(len(questions), 10)

        # Verify explicit concept_id exists on questions
        for q in questions:
            self.assertIn("concept_id", q)
            self.assertIn("concept", q)
            self.assertTrue(bool(q["concept_id"]))

        # Answer 8 correctly, 2 incorrectly
        answers = {}
        for idx, q in enumerate(questions):
            q_id = str(q["id"])
            c_idx = q["correct_index"]
            if idx in (0, 1):
                # Deliberate wrong answer
                answers[q_id] = (c_idx + 1) % 4
            else:
                answers[q_id] = c_idx

        res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=self.headers_alpha,
            json={"answers": answers, "time_spent": 75.0}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["correct_count"], 8)
        self.assertEqual(data["incorrect_count"], 2)
        self.assertIn("concept_updates", data)
        self.assertIn("concept_profile", data)

        # Inspect concept knowledge state in ConceptService
        profile = concept_service.get_learner_concept_profile("student_alpha", self.topic_id)
        self.assertGreater(profile["summary"]["total_tracked"], 0)

        # The concepts associated with questions 0 and 1 should now be in review_needed_concept_ids
        q0_concept = questions[0]["concept_id"]
        q1_concept = questions[1]["concept_id"]

        rec0 = concept_service.get_concept_knowledge("student_alpha", q0_concept, self.topic_id)
        self.assertIsNotNone(rec0)
        self.assertEqual(rec0["knowledge_state"], "NEEDS_REVIEW")
        self.assertGreaterEqual(rec0["incorrect_count"], 1)

        # Concepts with correct answers should have positive evidence
        q8_concept = questions[8]["concept_id"]
        rec8 = concept_service.get_concept_knowledge("student_alpha", q8_concept, self.topic_id)
        self.assertIsNotNone(rec8)
        self.assertIn(rec8["knowledge_state"], ("LEARNING", "MASTERED"))
        self.assertGreaterEqual(rec8["correct_count"], 1)

    def test_02_unanswered_questions_not_penalized_as_selected_mistakes(self):
        """Item 7: An unanswered question does not record a student selection misconception in concept service."""
        # Clean test user
        user_id = "student_gamma"
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    (user_id, "gamma@cognitive.edu", "Gamma Learner", "student"))
        conn.commit()
        conn.close()
        token_gamma = auth_service.create_internal_token(user_id, "gamma@cognitive.edu", "student")
        headers_gamma = {"Authorization": f"Bearer {token_gamma}"}

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Only answer the first 3 questions, leave 7 unanswered
        answers = {str(questions[i]["id"]): questions[i]["correct_index"] for i in range(3)}

        res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers_gamma,
            json={"answers": answers, "time_spent": 30.0}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # In review, verify unanswered questions have user_choice: None
        unanswered_review = [r for r in data["review"] if r["user_choice"] is None]
        self.assertEqual(len(unanswered_review), 7)
        for u in unanswered_review:
            self.assertFalse(u["is_correct"])

        # In concept knowledge, verify that unanswered concepts have NOT been marked with incorrect_count
        gamma_profile = concept_service.get_learner_concept_profile(user_id, self.topic_id)
        # Only the 3 answered questions should have been evaluated into concept records
        for concept in gamma_profile["concepts"]:
            # None of the concepts should have incorrect_count > 0 from unanswered questions
            self.assertEqual(concept["incorrect_count"], 0)

    def test_03_corrective_practice_resolves_mistake_and_updates_concept_state(self):
        """Item 3 & 4: Submitting corrective practice updates concept state without mutating historical quiz attempt."""
        # Check initial attempts count
        attempts_before = state_store.get_quiz_attempts("student_alpha", self.topic_id)
        self.assertEqual(len(attempts_before), 1)
        orig_attempt_id = attempts_before[0]["id"]
        orig_score = attempts_before[0]["score"]
        orig_percentage = attempts_before[0]["percentage"]
        orig_created_at = attempts_before[0]["created_at"]

        # Get latest attempt to identify incorrect questions
        latest_res = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=self.headers_alpha)
        self.assertEqual(latest_res.status_code, 200)
        incorrect_qs = latest_res.json()["attempt"]["incorrect_questions"]
        self.assertEqual(len(incorrect_qs), 2)

        # Submit corrective practice resolving the first missed question
        q0 = incorrect_qs[0]
        practice_payload = {
            "answers": {
                str(q0["id"]): q0["correct_index"]
            },
            "original_attempt_id": orig_attempt_id,
            "time_spent": 20.0
        }

        practice_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/practice/submit",
            headers=self.headers_alpha,
            json=practice_payload
        )
        self.assertEqual(practice_res.status_code, 200)
        pdata = practice_res.json()
        self.assertTrue(pdata["success"])
        self.assertIn(str(q0["id"]), pdata["resolved_questions"])
        self.assertIn("concept_updates", pdata)

        # Verify historical quiz_attempts table is completely untouched
        attempts_after = state_store.get_quiz_attempts("student_alpha", self.topic_id)
        self.assertEqual(len(attempts_after), 1, "quiz_attempts row count must NOT change")
        self.assertEqual(attempts_after[0]["id"], orig_attempt_id)
        self.assertEqual(attempts_after[0]["score"], orig_score)
        self.assertEqual(attempts_after[0]["percentage"], orig_percentage)
        self.assertEqual(attempts_after[0]["created_at"], orig_created_at)

        # Verify concept service recorded the positive practice evidence
        q0_concept = q0.get("concept_id") or quiz_service.get_concept_for_question(q0, self.topic_id, self.topic_id)["concept_id"]
        rec = concept_service.get_concept_knowledge("student_alpha", q0_concept, self.topic_id)
        self.assertIsNotNone(rec)
        self.assertGreaterEqual(rec["correct_count"], 1)

    def test_04_idempotent_practice_submission_prevents_duplicate_counters(self):
        """Item 5: Duplicate submissions do not duplicate evidence or increment counters twice."""
        # Get latest attempt
        latest_res = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=self.headers_alpha)
        incorrect_qs = latest_res.json()["attempt"]["incorrect_questions"]
        q1 = incorrect_qs[1]
        q1_concept = q1.get("concept_id") or quiz_service.get_concept_for_question(q1, self.topic_id, self.topic_id)["concept_id"]

        rec_before = concept_service.get_concept_knowledge("student_alpha", q1_concept, self.topic_id, default_if_missing=True)
        initial_correct = rec_before["correct_count"]

        practice_payload = {
            "answers": {str(q1["id"]): q1["correct_index"]},
            "original_attempt_id": latest_res.json()["attempt"]["id"],
            "time_spent": 15.0
        }

        # First submission
        res1 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/practice/submit",
            headers=self.headers_alpha,
            json=practice_payload
        )
        self.assertEqual(res1.status_code, 200)

        rec_after_first = concept_service.get_concept_knowledge("student_alpha", q1_concept, self.topic_id)
        self.assertEqual(rec_after_first["correct_count"], initial_correct + 1)

        # Second submission of identical attempt
        res2 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/practice/submit",
            headers=self.headers_alpha,
            json=practice_payload
        )
        self.assertEqual(res2.status_code, 200)

        rec_after_second = concept_service.get_concept_knowledge("student_alpha", q1_concept, self.topic_id)
        self.assertEqual(rec_after_second["correct_count"], initial_correct + 1, "Duplicate submission must not double-increment correct_count")

    def test_05_multi_student_concept_history_isolation(self):
        """Item 8: Student Alpha's concept history is completely isolated from Student Beta."""
        alpha_profile = concept_service.get_learner_concept_profile("student_alpha", self.topic_id)
        beta_profile = concept_service.get_learner_concept_profile("student_beta", self.topic_id)

        # Alpha has tracked concepts from prior tests
        self.assertGreater(alpha_profile["summary"]["total_tracked"], 0)

        # Beta has zero tracked concepts
        self.assertEqual(beta_profile["summary"]["total_tracked"], 0)
        self.assertEqual(len(beta_profile["concepts"]), 0)

        # API isolation
        beta_latest = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=self.headers_beta).json()
        self.assertFalse(beta_latest["has_attempt"])
        self.assertIsNone(beta_latest["attempt"])

    def test_06_adapted_lesson_receives_mastered_prerequisites_and_learning_gaps(self):
        """Item 9 & 10: Adapted lesson generation receives mastered prerequisites and diagnosed gaps, respecting cognitive load."""
        # Seed verified mastery for a prerequisite concept for student_alpha
        concept_service.update_concept_state(
            user_id="student_alpha",
            concept_id="variable_scope_and_state",
            topic_id=self.topic_id,
            state="MASTERED"
        )

        res = self.client.post(
            "/api/lessons/adapt",
            headers=self.headers_alpha,
            json={"topic_id": self.topic_id, "force_refresh": True, "detail_level": "STANDARD"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])

        lesson = data["lesson"]
        adaptation = lesson["adaptation"]
        self.assertIn("strategy", adaptation)
        self.assertIn("cognitive_load", adaptation)
        self.assertIn("mastered_prerequisites", adaptation)
        self.assertIn("active_learning_gaps", adaptation)

        # Verify prerequisite knowledge was passed to adaptation
        mastered_prereqs = adaptation.get("mastered_prerequisites", [])
        self.assertIn("variable_scope_and_state", mastered_prereqs)

    def test_07_safe_fallback_for_unmapped_questions(self):
        """Item 6: Unmapped questions fall back safely to deterministic topic mechanics without crashing."""
        dummy_q = {
            "question": "A completely novel question without recognizable keywords?",
            "options": ["A", "B", "C", "D"],
            "correct_index": 0
        }
        c_meta = quiz_service.get_concept_for_question(dummy_q, "top-novel-topic", "Novel Topic")
        self.assertEqual(c_meta["concept_id"], "top_novel_topic_core_mechanics")
        self.assertEqual(c_meta["concept"], "Novel Topic Mechanics")


    def test_08_quiz_submission_idempotency_via_submission_id(self):
        """Phase 3: Retrying with the same submission_id does not duplicate attempts or concept evidence."""
        user_id = "student_idempotent_test"
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    (user_id, "idem@test.edu", "Idempotent User", "student"))
        conn.commit()
        conn.close()

        token = auth_service.create_internal_token(user_id, "idem@test.edu", "student")
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch quiz
        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]
        answers = {str(q["id"]): q["correct_index"] for q in questions}

        sub_id = "sub_client_stable_token_001"
        payload = {
            "answers": answers,
            "time_spent": 50.0,
            "submission_id": sub_id
        }

        # First submission
        res1 = self.client.post(f"/api/topics/{self.topic_id}/quiz/submit", headers=headers, json=payload)
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        orig_attempt_id = data1["attempt_id"]

        attempts_1 = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts_1), 1)

        # Count evidence entries
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM concept_evidence_log WHERE user_id = ?", (user_id,))
        evidence_count_1 = cur.fetchone()[0]
        self.assertGreater(evidence_count_1, 0)

        # Second submission (retry with same submission_id)
        res2 = self.client.post(f"/api/topics/{self.topic_id}/quiz/submit", headers=headers, json=payload)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2["attempt_id"], orig_attempt_id)
        self.assertTrue(data2.get("idempotent_replay", False))

        attempts_2 = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts_2), 1, "Repeated submission with same submission_id must NOT create another quiz_attempt")

        cur.execute("SELECT COUNT(*) FROM concept_evidence_log WHERE user_id = ?", (user_id,))
        evidence_count_2 = cur.fetchone()[0]
        self.assertEqual(evidence_count_1, evidence_count_2, "Repeated submission must NOT record duplicate concept evidence")
        conn.close()

    def test_09_new_submission_id_creates_legitimate_new_attempt(self):
        """Phase 3: An intentional retake with a new submission_id creates a new attempt."""
        user_id = "student_retake_test"
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    (user_id, "retake@test.edu", "Retake User", "student"))
        conn.commit()
        conn.close()

        token = auth_service.create_internal_token(user_id, "retake@test.edu", "student")
        headers = {"Authorization": f"Bearer {token}"}

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]
        answers = {str(q["id"]): q["correct_index"] for q in questions}

        # Attempt 1
        res1 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 50.0, "submission_id": "sub_intentional_1"}
        )
        self.assertEqual(res1.status_code, 200)

        # Attempt 2 (New submission_id, representing intentional retake)
        res2 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 45.0, "submission_id": "sub_intentional_2"}
        )
        self.assertEqual(res2.status_code, 200)

        attempts = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts), 2, "Intentional retakes with distinct submission IDs must create legitimate new attempts")

    def test_10_latest_attempt_restoration_api_contract(self):
        """Phase 2 & 4: getLatestQuizAttempt returns authoritative server score and concept profile for restoration."""
        # student_alpha has completed attempts from test_01
        res = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=self.headers_alpha)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["has_attempt"])
        att = data["attempt"]
        self.assertIsNotNone(att)
        self.assertEqual(att["total_questions"], 10)
        self.assertIn("score", att)
        self.assertIn("percentage", att)
        self.assertIn("review", att)
        self.assertIn("incorrect_questions", att)
        self.assertIn("concept_profile", att)

        # Brand new learner without attempts
        user_new = "student_brand_new"
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    (user_new, "new@test.edu", "New User", "student"))
        conn.commit()
        conn.close()

        tok_new = auth_service.create_internal_token(user_new, "new@test.edu", "student")
        res_new = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers={"Authorization": f"Bearer {tok_new}"})
        self.assertEqual(res_new.status_code, 200)
        data_new = res_new.json()
        self.assertFalse(data_new["has_attempt"])
        self.assertIsNone(data_new["attempt"])

    def test_11_concurrent_duplicate_submission_protection(self):
        """Phase 3: Concurrent duplicate requests with the same submission_id do not create duplicate attempts."""
        import concurrent.futures

        user_id = "student_concurrent_test"
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                    (user_id, "concurrent@test.edu", "Concurrent User", "student"))
        conn.commit()
        conn.close()

        token = auth_service.create_internal_token(user_id, "concurrent@test.edu", "student")
        headers = {"Authorization": f"Bearer {token}"}

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]
        answers = {str(q["id"]): q["correct_index"] for q in questions}

        sub_id = "sub_concurrent_race_test_999"
        payload = {
            "answers": answers,
            "time_spent": 30.0,
            "submission_id": sub_id
        }

        def post_quiz():
            return self.client.post(f"/api/topics/{self.topic_id}/quiz/submit", headers=headers, json=payload)

        # Fire two concurrent POST requests with the identical submission_id
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            f1 = executor.submit(post_quiz)
            f2 = executor.submit(post_quiz)
            r1 = f1.result()
            r2 = f2.result()

        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r2.status_code, 200)

        # Exactly 1 attempt must exist in DB
        attempts = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts), 1, "Concurrent requests with same submission_id must only create 1 quiz_attempt")


if __name__ == "__main__":
    unittest.main()

