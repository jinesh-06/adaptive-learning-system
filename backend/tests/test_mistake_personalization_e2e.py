"""End-to-End Integration Tests for Mistake-Based Personalization.

Tests all 12 key scenarios across quiz submission, mistake tracking, concept mastery,
learning history, corrective practice, and adapted lesson generation:
1. Submit a quiz with a mixture of correct and incorrect answers.
2. Verify that incorrect answers are persisted and linked to the appropriate concepts.
3. Verify that the server calculates the score rather than trusting a score submitted by the frontend.
4. Submit a new attempt containing repeated mistakes and verify that the learning state reflects the recurring weakness.
5. Verify that corrective practice targets the concepts associated with the student's mistakes.
6. Verify that completing corrective practice does not modify the original quiz attempt or score.
7. Refresh the page and verify that persisted mistakes and learning history are restored.
8. Verify that retrying the same submission ID does not create duplicate attempts if idempotency is supported.
9. Verify that a different submission ID creates a new attempt.
10. Verify that one student's mistakes, mastery, and history cannot leak to another student.
11. Verify that unknown or unmapped concepts are handled safely.
12. Verify that the adapted lesson uses relevant weak concepts and prerequisite information when available.
"""

import os
import sys
import json
import tempfile
import unittest
from pathlib import Path

# Setup disposable isolated test database before any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_mistake_personalization_e2e.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient

from backend.main import app
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service
from backend.services.concept_service import concept_service
from backend.services.quiz_service import quiz_service
from backend.services.adapted_lesson_service import adapted_lesson_service


class TestMistakePersonalizationEndToEnd(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)
        cls.topic_id = "top-py-fundamentals"

        # Helper to seed a test user and generate auth headers
        cls.test_users = {}

    def _get_auth_headers(self, user_id: str, email: str, role: str = "student") -> dict:
        if user_id not in self.test_users:
            conn = state_store.get_connection()
            cur = conn.cursor()
            cur.execute(
                "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
                (user_id, email, f"Test User {user_id}", role)
            )
            conn.commit()
            conn.close()
            token = auth_service.create_internal_token(user_id, email, role)
            self.test_users[user_id] = {"token": token, "headers": {"Authorization": f"Bearer {token}"}}
        return self.test_users[user_id]["headers"]

    # ================= Scenario 1 =================
    def test_scenario_01_submit_quiz_mixture_correct_incorrect(self):
        """Scenario 1: Submit a quiz with a mixture of correct and incorrect answers."""
        user_id = "student_s1_mix"
        headers = self._get_auth_headers(user_id, "s1@example.com")

        # 1. Fetch official 10-question quiz
        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        self.assertEqual(quiz_res.status_code, 200)
        questions = quiz_res.json().get("questions", [])
        self.assertEqual(len(questions), 10, "Expected exactly 10 questions in lesson quiz")

        # 2. Answer 6 correctly and 4 incorrectly
        answers = {}
        for idx, q in enumerate(questions):
            q_id = str(q["id"])
            c_idx = q["correct_index"]
            if idx < 4:
                # Wrong answer
                answers[q_id] = (c_idx + 1) % 4
            else:
                # Correct answer
                answers[q_id] = c_idx

        # 3. Submit quiz
        sub_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 85.0, "submission_id": "sub_s1_001"}
        )
        self.assertEqual(sub_res.status_code, 200)
        data = sub_res.json()

        # 4. Verify server calculation
        self.assertIn("attempt_id", data)
        self.assertEqual(data["correct_count"], 6)
        self.assertEqual(data["incorrect_count"], 4)
        self.assertEqual(data["total_questions"], 10)
        self.assertEqual(data["percentage"], 60)
        self.assertFalse(data["passed"], "60% should be considered not passed (passing threshold is 70%)")

        # 5. Verify review items have correct is_correct tags
        review = data.get("review", [])
        self.assertEqual(len(review), 10)
        correct_in_review = sum(1 for r in review if r.get("is_correct"))
        incorrect_in_review = sum(1 for r in review if not r.get("is_correct"))
        self.assertEqual(correct_in_review, 6)
        self.assertEqual(incorrect_in_review, 4)

    # ================= Scenario 2 =================
    def test_scenario_02_incorrect_answers_persisted_and_linked_to_concepts(self):
        """Scenario 2: Verify that incorrect answers are persisted and linked to the appropriate concepts."""
        user_id = "student_s2_persist"
        headers = self._get_auth_headers(user_id, "s2@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Miss questions 0, 1, 6, answer other 7 correctly
        # In top-py-fundamentals:
        # q0 -> syntax_and_conventions
        # q1 & q6 -> oop_and_inheritance
        # Missing q0, q1, and q6 ensures all missed concepts have 0 correct answers and go directly to NEEDS_REVIEW
        answers = {}
        for idx, q in enumerate(questions):
            q_id = str(q["id"])
            c_idx = q["correct_index"]
            if idx in (0, 1, 6):
                answers[q_id] = (c_idx + 1) % 4
            else:
                answers[q_id] = c_idx

        sub_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 90.0, "submission_id": "sub_s2_001"}
        )
        self.assertEqual(sub_res.status_code, 200)
        data = sub_res.json()

        # Verify concept updates returned in response
        self.assertIn("concept_updates", data)
        self.assertGreaterEqual(len(data["concept_updates"]), 3)

        # Inspect database student_concept_knowledge directly
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute(
            """SELECT concept_id, knowledge_state, correct_count, incorrect_count
               FROM student_concept_knowledge
               WHERE user_id = ? AND topic_id = ?""",
            (user_id, self.topic_id)
        )
        concept_rows = cur.fetchall()
        self.assertGreater(len(concept_rows), 0, "Concept knowledge rows should be persisted")

        # Find concepts that correspond to the missed questions
        missed_concepts = {questions[i]["concept_id"] for i in (0, 1, 6)}
        found_review_needed = 0
        for row in concept_rows:
            cid = row["concept_id"]
            if cid in missed_concepts:
                self.assertEqual(row["knowledge_state"], "NEEDS_REVIEW", f"Concept {cid} should be NEEDS_REVIEW")
                self.assertGreaterEqual(row["incorrect_count"], 1)
                found_review_needed += 1

        self.assertGreaterEqual(found_review_needed, 2)

        # Verify concept_evidence_log contains negative evidence rows
        cur.execute(
            """SELECT concept_id, is_correct, source, evidence_id
               FROM concept_evidence_log
               WHERE user_id = ? AND is_correct = 0""",
            (user_id,)
        )
        evidence_rows = cur.fetchall()
        self.assertGreaterEqual(len(evidence_rows), 3)
        for ev in evidence_rows:
            self.assertEqual(ev["source"], "quiz_submission")
            self.assertTrue(ev["evidence_id"].startswith("quiz_"))
        conn.close()

    # ================= Scenario 3 =================
    def test_scenario_03_server_calculates_score_rather_than_trusting_frontend(self):
        """Scenario 3: Verify that the server calculates the score rather than trusting a score submitted by frontend."""
        user_id = "student_s3_tamper"
        headers = self._get_auth_headers(user_id, "s3@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Student answered ALL questions incorrectly
        wrong_answers = {str(q["id"]): (q["correct_index"] + 1) % 4 for q in questions}

        # Client attempts to spoof 100% score in payload
        tampered_payload = {
            "answers": wrong_answers,
            "score": 100,
            "percentage": 100,
            "correct_count": 10,
            "passed": True,
            "time_spent": 20.0,
            "submission_id": "sub_s3_tamper_001"
        }

        sub_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json=tampered_payload
        )
        self.assertEqual(sub_res.status_code, 200)
        data = sub_res.json()

        # Server must reject client claims and calculate actual 0%
        self.assertEqual(data["correct_count"], 0, "Server must compute 0 correct answers")
        self.assertEqual(data["incorrect_count"], 10, "Server must compute 10 incorrect answers")
        self.assertEqual(data["percentage"], 0, "Server must compute 0% score")
        self.assertFalse(data["passed"], "Server must mark attempt as not passed")

        # Inspect database record to ensure untrusted client score was not saved
        attempts = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts), 1)
        self.assertEqual(attempts[0]["score"], 0)
        self.assertEqual(attempts[0]["percentage"], 0)
        self.assertEqual(attempts[0]["correct_count"], 0)

    # ================= Scenario 4 =================
    def test_scenario_04_repeated_mistakes_reflect_recurring_weakness(self):
        """Scenario 4: Submit a new attempt containing repeated mistakes and verify learning state reflects recurring weakness."""
        user_id = "student_s4_repeat"
        headers = self._get_auth_headers(user_id, "s4@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        q0 = questions[0]
        q0_id = str(q0["id"])
        q0_concept = q0["concept_id"]
        wrong_q0 = (q0["correct_index"] + 1) % 4

        # Attempt 1: Miss q0 (and q1), pass others (score 80%)
        answers_1 = {str(q["id"]): q["correct_index"] for q in questions}
        answers_1[q0_id] = wrong_q0
        answers_1[str(questions[1]["id"])] = (questions[1]["correct_index"] + 1) % 4

        res1 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers_1, "time_spent": 60.0, "submission_id": "sub_s4_att1"}
        )
        self.assertEqual(res1.status_code, 200)

        # Check concept state after Attempt 1
        rec1 = concept_service.get_concept_knowledge(user_id, q0_concept, self.topic_id)
        self.assertIsNotNone(rec1)
        self.assertEqual(rec1["incorrect_count"], 1)
        self.assertEqual(rec1["knowledge_state"], "NEEDS_REVIEW")

        # Attempt 2: Repeat the exact mistake on q0, plus other mistakes (score 50%)
        answers_2 = {str(q["id"]): q["correct_index"] for q in questions}
        for i in range(5):
            answers_2[str(questions[i]["id"])] = (questions[i]["correct_index"] + 1) % 4

        res2 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers_2, "time_spent": 55.0, "submission_id": "sub_s4_att2"}
        )
        self.assertEqual(res2.status_code, 200)

        # Check concept state after Attempt 2: accumulated negative evidence
        rec2 = concept_service.get_concept_knowledge(user_id, q0_concept, self.topic_id)
        self.assertIsNotNone(rec2)
        self.assertEqual(rec2["incorrect_count"], 2, "Repeated mistake must increment incorrect_count to 2")
        self.assertEqual(rec2["knowledge_state"], "NEEDS_REVIEW")

        # Verify adapted lesson detects recurring weakness and selects deep_remedial_scaffolding
        adapt_res = self.client.post(
            "/api/lessons/adapt",
            headers=headers,
            json={"topic_id": self.topic_id, "force_refresh": True, "detail_level": "STANDARD"}
        )
        self.assertEqual(adapt_res.status_code, 200)
        adapt_data = adapt_res.json()["lesson"]["adaptation"]
        self.assertEqual(adapt_data["strategy"], "deep_remedial_scaffolding",
                         "Repeated error pattern must trigger deep remedial scaffolding")
        self.assertIn("Repeated error pattern", "".join(adapt_data.get("signals_used", [])))
        self.assertIn("repeated difficulty", adapt_data.get("reason", "").lower())

    # ================= Scenario 5 =================
    def test_scenario_05_corrective_practice_targets_mistake_concepts(self):
        """Scenario 5: Verify that corrective practice targets the concepts associated with the student's mistakes."""
        user_id = "student_s5_practice"
        headers = self._get_auth_headers(user_id, "s5@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Submit quiz with 2 specific incorrect questions
        answers = {str(q["id"]): q["correct_index"] for q in questions}
        q_missed_1 = questions[0]
        q_missed_2 = questions[1]
        answers[str(q_missed_1["id"])] = (q_missed_1["correct_index"] + 1) % 4
        answers[str(q_missed_2["id"])] = (q_missed_2["correct_index"] + 1) % 4

        sub_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 70.0, "submission_id": "sub_s5_001"}
        )
        orig_attempt_id = sub_res.json()["attempt_id"]

        # 1. Fetch latest attempt to retrieve targeted corrective practice questions
        latest_res = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=headers)
        self.assertEqual(latest_res.status_code, 200)
        latest_data = latest_res.json()
        self.assertTrue(latest_data["has_attempt"])
        incorrect_qs = latest_data["attempt"]["incorrect_questions"]
        self.assertEqual(len(incorrect_qs), 2)

        # Confirm incorrect_questions explicitly carries the target concept metadata
        target_concept_ids = [iq.get("concept_id") for iq in incorrect_qs]
        self.assertIn(q_missed_1["concept_id"], target_concept_ids)
        self.assertIn(q_missed_2["concept_id"], target_concept_ids)

        # 2. Submit corrective practice answering the first missed question correctly
        practice_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/practice/submit",
            headers=headers,
            json={
                "answers": {str(q_missed_1["id"]): q_missed_1["correct_index"]},
                "original_attempt_id": orig_attempt_id,
                "time_spent": 25.0
            }
        )
        self.assertEqual(practice_res.status_code, 200)
        pdata = practice_res.json()
        self.assertTrue(pdata["success"])
        self.assertIn(str(q_missed_1["id"]), pdata["resolved_questions"])
        self.assertEqual(pdata["practice_score"], 1)

        # 3. Verify concept service received positive evidence for that targeted concept
        concept_rec = concept_service.get_concept_knowledge(user_id, q_missed_1["concept_id"], self.topic_id)
        self.assertIsNotNone(concept_rec)
        self.assertGreaterEqual(concept_rec["correct_count"], 1)

    # ================= Scenario 6 =================
    def test_scenario_06_corrective_practice_does_not_modify_original_quiz_attempt(self):
        """Scenario 6: Verify that completing corrective practice does not modify original quiz attempt or score."""
        user_id = "student_s6_immutable"
        headers = self._get_auth_headers(user_id, "s6@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Score 70% with 3 mistakes
        answers = {str(q["id"]): q["correct_index"] for q in questions}
        for i in range(3):
            answers[str(questions[i]["id"])] = (questions[i]["correct_index"] + 1) % 4

        sub_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 80.0, "submission_id": "sub_s6_001"}
        )
        self.assertEqual(sub_res.status_code, 200)
        orig_attempt_id = sub_res.json()["attempt_id"]

        # Capture pre-practice DB snapshot of quiz_attempts table
        attempts_before = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts_before), 1)
        orig_record = attempts_before[0]
        orig_score = orig_record["score"]
        orig_percentage = orig_record["percentage"]
        orig_correct = orig_record["correct_count"]
        orig_created_at = orig_record["created_at"]
        orig_answers_json = orig_record["answers_json"]

        # Submit corrective practice resolving all 3 missed questions
        practice_answers = {str(questions[i]["id"]): questions[i]["correct_index"] for i in range(3)}
        practice_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/practice/submit",
            headers=headers,
            json={
                "answers": practice_answers,
                "original_attempt_id": orig_attempt_id,
                "time_spent": 40.0
            }
        )
        self.assertEqual(practice_res.status_code, 200)
        self.assertEqual(practice_res.json()["practice_score"], 3)

        # Inspect quiz_attempts table post-practice: MUST BE TOTALLY UNCHANGED
        attempts_after = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts_after), 1, "quiz_attempts table row count must not change")
        after_record = attempts_after[0]
        self.assertEqual(after_record["id"], orig_attempt_id)
        self.assertEqual(after_record["score"], orig_score, "Original quiz score must not be overwritten")
        self.assertEqual(after_record["percentage"], orig_percentage, "Original percentage must not be overwritten")
        self.assertEqual(after_record["correct_count"], orig_correct)
        self.assertEqual(after_record["created_at"], orig_created_at)
        self.assertEqual(after_record["answers_json"], orig_answers_json)

        # Query latest attempt via API: original assessment values remain intact
        latest_res = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=headers)
        att = latest_res.json()["attempt"]
        self.assertEqual(att["score"], orig_score)
        self.assertEqual(att["percentage"], orig_percentage)

    # ================= Scenario 7 =================
    def test_scenario_07_page_refresh_restores_persisted_mistakes_and_history(self):
        """Scenario 7: Refresh the page and verify that persisted mistakes and learning history are restored."""
        user_id = "student_s7_refresh"
        headers = self._get_auth_headers(user_id, "s7@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Submit quiz with 8/10 score, missing questions 0 and 1
        answers = {str(q["id"]): q["correct_index"] for q in questions}
        answers[str(questions[0]["id"])] = (questions[0]["correct_index"] + 1) % 4
        answers[str(questions[1]["id"])] = (questions[1]["correct_index"] + 1) % 4

        sub_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 95.0, "submission_id": "sub_s7_initial"}
        )
        self.assertEqual(sub_res.status_code, 200)

        # Simulate page refresh by calling getLatestQuizAttempt (same as InLessonQuiz.tsx on mount)
        refresh_res = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=headers)
        self.assertEqual(refresh_res.status_code, 200)
        data = refresh_res.json()

        self.assertTrue(data["has_attempt"], "Latest attempt must be found after page refresh")
        att = data["attempt"]
        self.assertIsNotNone(att)
        self.assertEqual(att["total_questions"], 10)
        self.assertIn(att["score"], (8, 8.0))
        self.assertEqual(att["percentage"], 80)
        self.assertEqual(att["correct_count"], 8)
        self.assertEqual(att["incorrect_count"], 2)
        self.assertTrue(att["passed"])

        # Verify review items are present with answers and explanations
        self.assertEqual(len(att["review"]), 10)
        self.assertEqual(len(att["incorrect_questions"]), 2)

        # Verify incorrect questions retain their concept bindings
        for iq in att["incorrect_questions"]:
            self.assertIn("concept_id", iq)
            self.assertIn("concept", iq)
            self.assertTrue(bool(iq["concept_id"]))

        # Verify cognitive adaptive feedback is restored
        self.assertIn("adaptive_feedback", att)
        self.assertTrue(bool(att["adaptive_feedback"]))

    # ================= Scenario 8 =================
    def test_scenario_08_retry_same_submission_id_is_idempotent(self):
        """Scenario 8: Verify that retrying the same submission ID does not create duplicate attempts if idempotency is supported."""
        user_id = "student_s8_idempotent"
        headers = self._get_auth_headers(user_id, "s8@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]
        answers = {str(q["id"]): q["correct_index"] for q in questions}

        stable_sub_id = "sub_s8_stable_token_unique_xyz"
        payload = {
            "answers": answers,
            "time_spent": 50.0,
            "submission_id": stable_sub_id
        }

        # 1. Initial submission
        res1 = self.client.post(f"/api/topics/{self.topic_id}/quiz/submit", headers=headers, json=payload)
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        attempt_id_1 = data1["attempt_id"]

        # Check database: 1 attempt, N evidence logs
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ?", (user_id,))
        count_attempts_1 = cur.fetchone()[0]
        self.assertEqual(count_attempts_1, 1)

        cur.execute("SELECT COUNT(*) FROM concept_evidence_log WHERE user_id = ?", (user_id,))
        count_evidence_1 = cur.fetchone()[0]
        self.assertGreater(count_evidence_1, 0)
        conn.close()

        # 2. Retry identical submission with the SAME submission_id
        res2 = self.client.post(f"/api/topics/{self.topic_id}/quiz/submit", headers=headers, json=payload)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()

        # Must return the preserved attempt with idempotent_replay flag
        self.assertEqual(data2["attempt_id"], attempt_id_1)
        self.assertTrue(data2.get("idempotent_replay", False))

        # Check database: NO DUPLICATE ATTEMPT OR EVIDENCE LOGS
        conn = state_store.get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ?", (user_id,))
        count_attempts_2 = cur.fetchone()[0]
        self.assertEqual(count_attempts_2, 1, "Retrying same submission_id must not create duplicate quiz_attempt")

        cur.execute("SELECT COUNT(*) FROM concept_evidence_log WHERE user_id = ?", (user_id,))
        count_evidence_2 = cur.fetchone()[0]
        self.assertEqual(count_evidence_1, count_evidence_2, "Retrying same submission_id must not double-count evidence")
        conn.close()

    # ================= Scenario 9 =================
    def test_scenario_09_new_submission_id_creates_new_attempt(self):
        """Scenario 9: Verify that a different submission ID creates a new attempt."""
        user_id = "student_s9_new_attempt"
        headers = self._get_auth_headers(user_id, "s9@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]
        answers = {str(q["id"]): q["correct_index"] for q in questions}

        # Submission 1
        res1 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 40.0, "submission_id": "sub_s9_first"}
        )
        self.assertEqual(res1.status_code, 200)
        att_id_1 = res1.json()["attempt_id"]

        # Submission 2 with DIFFERENT submission_id
        res2 = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 45.0, "submission_id": "sub_s9_second"}
        )
        self.assertEqual(res2.status_code, 200)
        att_id_2 = res2.json()["attempt_id"]

        self.assertNotEqual(att_id_1, att_id_2, "Distinct submission IDs must create separate attempt records")

        attempts = state_store.get_quiz_attempts(user_id, self.topic_id)
        self.assertEqual(len(attempts), 2, "Expected exactly 2 attempts in quiz_attempts table")

    # ================= Scenario 10 =================
    def test_scenario_10_student_mistakes_mastery_history_isolation(self):
        """Scenario 10: Verify that one student's mistakes, mastery, and history cannot leak to another student."""
        user_a = "student_s10_alice"
        user_b = "student_s10_bob"
        headers_a = self._get_auth_headers(user_a, "alice@example.com")
        headers_b = self._get_auth_headers(user_b, "bob@example.com")

        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Alice takes the quiz and makes mistakes
        answers_a = {str(q["id"]): (q["correct_index"] + 1) % 4 for q in questions}
        self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers_a,
            json={"answers": answers_a, "time_spent": 75.0, "submission_id": "sub_alice_001"}
        )

        # Alice's concept profile should show multiple tracked review-needed concepts
        prof_a = concept_service.get_learner_concept_profile(user_a, self.topic_id)
        self.assertGreater(prof_a["summary"]["total_tracked"], 0)
        self.assertGreater(prof_a["summary"]["needs_review_count"], 0)

        # Bob has NOT taken any quiz
        # 1. API: getLatestQuizAttempt for Bob must return has_attempt = False
        bob_latest = self.client.get(f"/api/topics/{self.topic_id}/quiz/attempts/latest", headers=headers_b).json()
        self.assertFalse(bob_latest["has_attempt"])
        self.assertIsNone(bob_latest["attempt"])

        # 2. ConceptService: Bob's concept profile must be empty
        prof_b = concept_service.get_learner_concept_profile(user_b, self.topic_id)
        self.assertEqual(prof_b["summary"]["total_tracked"], 0)
        self.assertEqual(len(prof_b["concepts"]), 0)

        # 3. DB Isolation: queries filtered by user_b return zero attempts
        attempts_b = state_store.get_quiz_attempts(user_b, self.topic_id)
        self.assertEqual(len(attempts_b), 0)

    # ================= Scenario 11 =================
    def test_scenario_11_unknown_or_unmapped_concepts_handled_safely(self):
        """Scenario 11: Verify that unknown or unmapped concepts are handled safely without crashing."""
        # 1. Fallback mapping for question with novel or missing text
        synthetic_q = {
            "id": "q-novel-001",
            "question": "Completely novel question without any keywords",
            "options": ["A", "B", "C", "D"],
            "correct_index": 1
        }
        meta = quiz_service.get_concept_for_question(synthetic_q, "top-novel-custom-topic", "Custom Novel Topic")
        self.assertIn("concept_id", meta)
        self.assertIn("concept", meta)
        self.assertEqual(meta["concept_id"], "top_novel_custom_topic_core_mechanics")
        self.assertEqual(meta["concept"], "Custom Novel Topic Mechanics")

        # 2. Recording evidence on unknown concept ID does not throw error
        self._get_auth_headers("student_s11_unknown", "s11@example.com")
        rec = concept_service.record_concept_evidence(
            user_id="student_s11_unknown",
            concept_id="unknown_synthetic_concept_abc",
            topic_id="top-py-fundamentals",
            is_correct=False,
            evidence_id="ev_unknown_test_001",
            source="unit_test"
        )
        self.assertIsNotNone(rec)
        self.assertEqual(rec["concept_id"], "unknown_synthetic_concept_abc")
        self.assertEqual(rec["knowledge_state"], "NEEDS_REVIEW")

        # 3. Quiz endpoint for non-existent topic returns safe response without HTTP 500
        quiz_res = self.client.get("/api/topics/top-py-completely-unknown-999/quiz")
        self.assertNotEqual(quiz_res.status_code, 500)
        self.assertIn(quiz_res.status_code, (200, 404))

    # ================= Scenario 12 =================
    def test_scenario_12_adapted_lesson_uses_weak_concepts_and_prerequisites(self):
        """Scenario 12: Verify that adapted lesson uses relevant weak concepts and prerequisite information when available."""
        user_id = "student_s12_adapted"
        headers = self._get_auth_headers(user_id, "s12@example.com")

        # 1. Seed prerequisite mastery: student has mastered 'variable_scope_and_state'
        concept_service.update_concept_state(
            user_id=user_id,
            concept_id="variable_scope_and_state",
            topic_id=self.topic_id,
            state="MASTERED"
        )

        # 2. Student takes quiz and fails 'boundary_conditions_and_indexing' questions
        quiz_res = self.client.get(f"/api/topics/{self.topic_id}/quiz")
        questions = quiz_res.json()["questions"]

        # Find questions matching boundary conditions
        answers = {str(q["id"]): q["correct_index"] for q in questions}
        found_gap = False
        for q in questions:
            if "boundary" in (q.get("concept_id") or "") or "index" in (q.get("concept_id") or ""):
                answers[str(q["id"])] = (q["correct_index"] + 1) % 4
                found_gap = True

        # If question bank doesn't have explicit boundary ID, miss first 4 questions
        if not found_gap:
            for i in range(4):
                answers[str(questions[i]["id"])] = (questions[i]["correct_index"] + 1) % 4

        sub_res = self.client.post(
            f"/api/topics/{self.topic_id}/quiz/submit",
            headers=headers,
            json={"answers": answers, "time_spent": 75.0, "submission_id": "sub_s12_quiz"}
        )
        self.assertEqual(sub_res.status_code, 200)

        # 3. Generate adapted lesson
        adapt_res = self.client.post(
            "/api/lessons/adapt",
            headers=headers,
            json={"topic_id": self.topic_id, "force_refresh": True, "detail_level": "STANDARD"}
        )
        self.assertEqual(adapt_res.status_code, 200)
        data = adapt_res.json()
        self.assertTrue(data["success"])

        lesson = data["lesson"]
        adaptation = lesson["adaptation"]

        # Strategy should be targeted concept revision
        self.assertEqual(adaptation["strategy"], "targeted_concept_revision")

        # Mastered prerequisites must include 'variable_scope_and_state'
        mastered_prereqs = adaptation.get("mastered_prerequisites", [])
        self.assertIn("variable_scope_and_state", mastered_prereqs)

        # Active learning gaps must be populated
        active_gaps = adaptation.get("active_learning_gaps", [])
        self.assertGreater(len(active_gaps), 0)

        # Adaptation reason must explain what was missed and how the lesson adapts
        reason = adaptation.get("reason", "")
        self.assertIn("Personalized for you", reason)
        self.assertTrue(any(term in reason.lower() for term in ("missed", "recent quiz", "score", "emphasizes", "targeted")))


if __name__ == "__main__":
    unittest.main()
