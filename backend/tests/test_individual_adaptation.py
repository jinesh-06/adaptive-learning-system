"""Comprehensive tests for True Individual Learning Adaptation.

Verifies:
1. Baseline orientation for new students with zero quiz attempts (no fake telemetry/scores).
2. Targeted concept revision for Student A based on specific quiz mistakes (boundary conditions / range stop limits).
3. Different student adaptation: Student B failing different questions (variable scoping) receives different lesson.
4. Strict student data isolation: Student A's mistakes and adaptations never leak to Student B.
5. Progress & mastery advancement: When Student A improves to 100%, strategy updates to advanced mastery extension.
6. Repeated error detection: When a student fails the same concept across multiple attempts, strategy adapts to deep remedial scaffolding.
7. Cache invalidation on quiz submission: submitting a quiz refreshes subsequent lesson adaptation.
8. Security: 401 Unauthorized on unauthenticated requests.
9. Pydantic schema validation on all generated lesson payloads.
"""

import os
import sys
import json
import tempfile
import unittest
from pathlib import Path

# Establish isolated disposable database before backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_individual_adaptation.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from fastapi.testclient import TestClient
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service
from backend.services.adapted_lesson_service import adapted_lesson_service
from backend.main import app


class TestIndividualLearningAdaptation(unittest.TestCase):
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
        cur.execute(
            "INSERT OR REPLACE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
            ("student_gamma", "gamma@cognitive.edu", "Gamma Learner", "student")
        )
        conn.commit()
        conn.close()

        cls.token_alpha = auth_service.create_internal_token("student_alpha", "alpha@cognitive.edu", "student")
        cls.token_beta = auth_service.create_internal_token("student_beta", "beta@cognitive.edu", "student")
        cls.token_gamma = auth_service.create_internal_token("student_gamma", "gamma@cognitive.edu", "student")

        cls.headers_alpha = {"Authorization": f"Bearer {cls.token_alpha}"}
        cls.headers_beta = {"Authorization": f"Bearer {cls.token_beta}"}
        cls.headers_gamma = {"Authorization": f"Bearer {cls.token_gamma}"}

    def test_01_baseline_orientation_for_new_student(self):
        """Scenario: A new learner with zero quiz attempts receives baseline orientation without fabricated telemetry."""
        res = self.client.post(
            "/api/lessons/adapt",
            headers=self.headers_alpha,
            json={"topic_id": "top-py-loops", "detail_level": "STANDARD"}
        )
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertTrue(data.get("success"))

        lesson = data.get("lesson")
        self.assertIsNotNone(lesson)
        adaptation = lesson.get("adaptation")
        self.assertIsNotNone(adaptation)

        # Verify strategy is baseline orientation
        self.assertEqual(adaptation.get("strategy"), "baseline_orientation")
        self.assertIn("Baseline orientation: No quiz attempts recorded yet", adaptation.get("reason", ""))

        # Verify signals do not fabricate scores
        signals = adaptation.get("signals_used", [])
        self.assertTrue(any("Baseline pedagogical orientation" in s for s in signals))
        self.assertFalse(any("Assessment accuracy" in s for s in signals))

        # Check learning summary
        summary = adaptation.get("quiz_performance_summary", {})
        self.assertEqual(summary.get("attempt_count"), 0)
        self.assertIsNone(summary.get("latest_score"))

    def test_02_student_alpha_targeted_concept_revision(self):
        """Scenario: Student Alpha submits quiz failing boundary condition questions -> receives targeted lesson on boundary conditions."""
        topic_id = "top-py-loops"

        # Simulate quiz submission where student misses range stop limits / boundary questions
        submission_payload = {
            "answers": {
                "0": 0,  # Wrong: range(2, 6) stop limit question (selected 0: [2, 3, 4, 5, 6] instead of 1)
                "1": 0,  # Wrong
                "2": 0,  # Wrong
                "3": 0,  # Wrong
                "4": 0,  # Wrong
                "5": 0,  # Wrong
                "6": 1,  # Correct
                "7": 2,  # Correct
                "8": 3,  # Correct
                "9": 0   # Correct
            },
            "time_spent": 120.0
        }

        sub_res = self.client.post(
            f"/api/topics/{topic_id}/quiz/submit",
            headers=self.headers_alpha,
            json=submission_payload
        )
        self.assertEqual(sub_res.status_code, 200, sub_res.text)
        sub_data = sub_res.json()
        self.assertEqual(sub_data.get("score"), 40)
        self.assertFalse(sub_data.get("passed"))

        # Fetch adapted lesson for Student Alpha
        adapt_res = self.client.post(
            "/api/lessons/adapt",
            headers=self.headers_alpha,
            json={"topic_id": topic_id, "detail_level": "STANDARD"}
        )
        self.assertEqual(adapt_res.status_code, 200, adapt_res.text)
        lesson_data = adapt_res.json().get("lesson")
        adaptation = lesson_data.get("adaptation")

        # Verify strategy and reason target boundary conditions
        self.assertEqual(adaptation.get("strategy"), "targeted_concept_revision")
        self.assertIn("Boundary Conditions & Range Stop Limits", adaptation.get("reason", ""))
        self.assertIn("boundary_conditions_and_indexing", adaptation.get("target_concepts", []))

        # Verify actual content addresses boundary conditions
        intro = lesson_data.get("introduction", "")
        self.assertIn("Boundary Conditions & Range Stop Limits", intro)

        # Verify sections include boundary explanation, fencepost analogy, and boundary practice
        sections = lesson_data.get("sections", [])
        sec_types = [s.get("type") for s in sections]
        self.assertIn("explanation", sec_types)
        self.assertIn("analogy", sec_types)
        self.assertIn("guided_practice", sec_types)

        explanation_sec = next(s for s in sections if s.get("type") == "explanation")
        self.assertIn("half-open interval", explanation_sec.get("content", "").lower())

        practice_sec = next(s for s in sections if s.get("type") == "guided_practice")
        self.assertIn("boundary", practice_sec.get("practice", {}).get("prompt", "").lower())

    def test_03_student_beta_different_concept_adaptation(self):
        """Scenario: Student Beta fails variable scoping/mutation questions on Python fundamentals -> receives scoping adaptation."""
        topic_id = "top-py-fundamentals"

        # Simulate quiz submission where Student Beta misses variable scoping questions
        # First save an attempt directly with variable scoping review items
        review_beta = [
            {
                "id": "q-py-1",
                "question": "How does local variable assignment behave inside function scope in Python?",
                "options": ["Updates global frame", "Binds identifier to local frame", "Shares memory across threads", "Creates static constant"],
                "correct_index": 1,
                "user_choice": 0,
                "is_correct": False,
                "explanation": "Variables assigned inside functions are local to that function scope."
            },
            {
                "id": "q-py-2",
                "question": "What occurs when attempting to modify an outer variable without global or nonlocal declaration?",
                "options": ["Silent overwrite", "UnboundLocalError upon read or creates new local binding", "Recompiles module", "Garbage collects frame"],
                "correct_index": 1,
                "user_choice": 0,
                "is_correct": False,
                "explanation": "Assigning to a variable inside scope shadows outer names unless global or nonlocal is specified."
            }
        ]

        state_store.save_quiz_attempt(
            user_id="student_beta",
            topic_id=topic_id,
            attempt_data={
                "score": 4,
                "percentage": 40.0,
                "correct_count": 4,
                "total_questions": 10,
                "review": review_beta,
                "time_spent": 90.0
            }
        )
        state_store.invalidate_adapted_lessons("student_beta", topic_id)

        adapt_res = self.client.post(
            "/api/lessons/adapt",
            headers=self.headers_beta,
            json={"topic_id": topic_id, "detail_level": "STANDARD"}
        )
        self.assertEqual(adapt_res.status_code, 200, adapt_res.text)
        lesson_data = adapt_res.json().get("lesson")
        adaptation = lesson_data.get("adaptation")

        self.assertEqual(adaptation.get("strategy"), "targeted_concept_revision")
        self.assertIn("Variable Scoping & State Mutability", adaptation.get("reason", ""))
        self.assertIn("local versus global scoping frames", adaptation.get("reason", "").lower())
        self.assertNotIn("boundary-safe", adaptation.get("reason", "").lower())
        self.assertIn("variable_scope_and_state", adaptation.get("target_concepts", []))

        # Critical consistency check: lesson title, intro, explanation, analogy, pitfalls, practice match scoping
        self.assertIn("Variable Scoping & State Mutability", lesson_data.get("title", ""))
        self.assertIn("Variable Scoping & State Mutability", lesson_data.get("introduction", ""))

        sections = lesson_data.get("sections", [])
        explanation_sec = next(s for s in sections if s.get("type") == "explanation")
        self.assertIn("legb", explanation_sec.get("content", "").lower())
        self.assertNotIn("boundary", explanation_sec.get("content", "").lower())

        analogy_sec = next(s for s in sections if s.get("type") == "analogy")
        self.assertIn("hotel room safe", analogy_sec.get("content", "").lower())

        mistakes_sec = next(s for s in sections if s.get("type") == "common_mistakes")
        mistakes_str = str(mistakes_sec.get("mistakes", []))
        self.assertTrue("UnboundLocalError" in mistakes_str or "shadow" in mistakes_str.lower())

        practice_sec = next(s for s in sections if s.get("type") == "guided_practice")
        self.assertIn("local", practice_sec.get("practice", {}).get("prompt", "").lower())

    def test_04_strict_student_data_isolation(self):
        """Scenario: Student Alpha and Student Beta query the same topic; each gets their own independent adaptation."""
        topic_id = "top-py-loops"

        # Alpha has boundary error history on loops
        alpha_res = self.client.get(
            f"/api/lessons/adapt/{topic_id}",
            headers=self.headers_alpha
        )
        self.assertEqual(alpha_res.status_code, 200)
        alpha_lesson = alpha_res.json().get("lesson")
        alpha_adaptation = alpha_lesson.get("adaptation")

        # Beta has NO history on top-py-loops
        beta_res = self.client.get(
            f"/api/lessons/adapt/{topic_id}",
            headers=self.headers_beta
        )
        self.assertEqual(beta_res.status_code, 200)
        beta_lesson = beta_res.json().get("lesson")
        beta_adaptation = beta_lesson.get("adaptation")

        # Verify Alpha receives their targeted revision
        self.assertEqual(alpha_adaptation.get("strategy"), "targeted_concept_revision")
        self.assertIn("Boundary Conditions & Range Stop Limits", alpha_adaptation.get("reason", ""))

        # Verify Beta receives baseline orientation (NOT Alpha's boundary adaptation)
        self.assertEqual(beta_adaptation.get("strategy"), "baseline_orientation")
        self.assertIn("Baseline orientation: No quiz attempts recorded yet", beta_adaptation.get("reason", ""))

        # Verify database rows are strictly isolated
        alpha_attempts = state_store.get_quiz_attempts("student_alpha", topic_id)
        beta_attempts = state_store.get_quiz_attempts("student_beta", topic_id)
        self.assertGreaterEqual(len(alpha_attempts), 1)
        self.assertEqual(len(beta_attempts), 0)

    def test_05_student_alpha_improves_to_mastery(self):
        """Scenario: Student Alpha retakes quiz and scores 100% -> teaching strategy advances to advanced mastery extension."""
        topic_id = "top-py-loops"

        # Submit perfect 10/10 quiz
        perfect_answers = {str(i): 1 if i in (0, 1, 2) else 0 for i in range(10)}
        # Set all answers to match questions
        from backend.services.quiz_service import quiz_service
        qz = quiz_service.get_quiz_for_topic(topic_id)
        for idx, q in enumerate(qz.get("questions", [])):
            perfect_answers[str(idx)] = q.get("correct_index", 0)

        sub_res = self.client.post(
            f"/api/topics/{topic_id}/quiz/submit",
            headers=self.headers_alpha,
            json={"answers": perfect_answers, "time_spent": 150.0}
        )
        self.assertEqual(sub_res.status_code, 200)
        self.assertEqual(sub_res.json().get("percentage"), 100)

        # Subsequent adaptation request
        adapt_res = self.client.post(
            "/api/lessons/adapt",
            headers=self.headers_alpha,
            json={"topic_id": topic_id, "detail_level": "STANDARD"}
        )
        self.assertEqual(adapt_res.status_code, 200)
        lesson_data = adapt_res.json().get("lesson")
        adaptation = lesson_data.get("adaptation")

        # Verify strategy is now advanced_mastery_extension
        self.assertEqual(adaptation.get("strategy"), "advanced_mastery_extension")
        self.assertIn("high mastery", adaptation.get("reason", "").lower())
        self.assertIn("100%", adaptation.get("reason", ""))

        # Verify content shifted to architectural depth & performance
        sections = lesson_data.get("sections", [])
        explanation_sec = next(s for s in sections if s.get("type") == "explanation")
        self.assertIn("architectural", explanation_sec.get("content", "").lower())

    def test_06_repeated_error_triggers_deep_remedial_scaffolding(self):
        """Scenario: Student Gamma fails the same concept on two consecutive attempts -> triggers deep remedial scaffolding."""
        topic_id = "top-py-loops"

        review_item = {
            "id": "q-bnd-repeat",
            "question": "What is the output of list(range(1, 5))?",
            "options": ["[1, 2, 3, 4, 5]", "[1, 2, 3, 4]", "[1, 3, 5]", "[0, 1, 2, 3]"],
            "correct_index": 1,
            "user_choice": 0,
            "is_correct": False,
            "explanation": "range(start, stop) stops before stop value."
        }

        # Attempt 1: Score 30%, failed boundary
        state_store.save_quiz_attempt(
            user_id="student_gamma",
            topic_id=topic_id,
            attempt_data={
                "score": 3,
                "percentage": 30.0,
                "correct_count": 3,
                "total_questions": 10,
                "review": [review_item],
                "time_spent": 80.0
            }
        )

        # Attempt 2: Score 30%, failed boundary again
        state_store.save_quiz_attempt(
            user_id="student_gamma",
            topic_id=topic_id,
            attempt_data={
                "score": 3,
                "percentage": 30.0,
                "correct_count": 3,
                "total_questions": 10,
                "review": [review_item],
                "time_spent": 90.0
            }
        )
        state_store.invalidate_adapted_lessons("student_gamma", topic_id)

        adapt_res = self.client.post(
            "/api/lessons/adapt",
            headers=self.headers_gamma,
            json={"topic_id": topic_id, "detail_level": "STANDARD"}
        )
        self.assertEqual(adapt_res.status_code, 200)
        lesson_data = adapt_res.json().get("lesson")
        adaptation = lesson_data.get("adaptation")

        self.assertEqual(adaptation.get("strategy"), "deep_remedial_scaffolding")
        self.assertIn("repeated difficulty", adaptation.get("reason", "").lower())
        self.assertIn("Boundary Conditions & Range Stop Limits", adaptation.get("reason", ""))

    def test_07_unauthorized_rejection(self):
        """Scenario: Requests without Bearer token return 401 Unauthorized."""
        res_post = self.client.post(
            "/api/lessons/adapt",
            json={"topic_id": "top-py-loops"}
        )
        self.assertEqual(res_post.status_code, 401)

        res_get = self.client.get("/api/lessons/adapt/top-py-loops")
        self.assertEqual(res_get.status_code, 401)

    def test_08_pydantic_schema_validation_on_all_outputs(self):
        """Scenario: All generated offline and adapted lessons strictly conform to Pydantic AdaptedLesson schema."""
        from llm.lesson_schemas import AdaptedLesson

        # Check offline lesson generation directly
        lesson_dict = adapted_lesson_service._build_offline_adapted_lesson(
            topic_title="Loops",
            subject="python",
            topic_id="top-py-loops",
            topic_meta={"title": "Loops"},
            rag_context="",
            detail_level="STANDARD",
            strategy="targeted_concept_revision",
            pred_load="MEDIUM",
            confidence=0.88,
            reason="Testing Pydantic compliance",
            signals_used=["Signal 1", "Signal 2"],
            diagnosis={"target_concepts": ["boundary_conditions_and_indexing"], "diagnosed_gaps": [{"concept_key": "boundary_conditions_and_indexing", "title": "Boundary Conditions"}]}
        )

        validated = AdaptedLesson(**lesson_dict)
        self.assertEqual(validated.subject, "python")
        self.assertEqual(validated.topic, "Loops")
        self.assertGreater(len(validated.sections), 4)

    def test_09_mastery_requires_adequate_assessment_evidence(self):
        """Scenario: Sparse quiz (e.g. 2 questions) scoring 100% does NOT prematurely advance to advanced_mastery_extension.
        Requires adequate assessment evidence (>= 5 questions)."""
        sparse_topic = "top-sparse-test"
        state_store.save_quiz_attempt(
            user_id="student_gamma",
            topic_id=sparse_topic,
            attempt_data={
                "score": 2,
                "percentage": 100.0,
                "correct_count": 2,
                "total_questions": 2,  # Sparse: < 5 questions
                "review": [
                    {"id": "q1", "is_correct": True, "question": "Simple check", "explanation": "Ok"},
                    {"id": "q2", "is_correct": True, "question": "Simple check 2", "explanation": "Ok"}
                ],
                "time_spent": 30.0
            }
        )
        state_store.invalidate_adapted_lessons("student_gamma", sparse_topic)

        diag = adapted_lesson_service.diagnose_student_learning_evidence("student_gamma", sparse_topic, {"title": "Sparse Assessment Topic"})
        # Should NOT be advanced_mastery_extension because evidence is sparse (< 5 questions)
        self.assertNotEqual(diag.get("strategy"), "advanced_mastery_extension")
        self.assertEqual(diag.get("strategy"), "balanced_standard")
        self.assertIn("comprehensive assessment evidence", diag.get("reason", ""))

    def test_10_pointer_addressing_c_gap_adaptation(self):
        """Scenario: Student missing pointer dereference question in C receives pointer safety lesson, not boundary/loop/scope."""
        c_topic = "top-c-pointers"
        state_store.save_quiz_attempt(
            user_id="student_gamma",
            topic_id=c_topic,
            attempt_data={
                "score": 2,
                "percentage": 40.0,
                "correct_count": 2,
                "total_questions": 5,
                "review": [
                    {
                        "id": "q-c-ptr-1",
                        "question": "What is the danger of dereferencing an uninitialized pointer (*ptr)?",
                        "options": ["Syntax error at compile time", "Segmentation fault or undefined memory access", "Automatic NULL assignment", "Memory leak in heap"],
                        "correct_index": 1,
                        "user_choice": 0,
                        "is_correct": False,
                        "explanation": "Dereferencing invalid memory causes undefined behavior or segmentation fault."
                    }
                ],
                "time_spent": 75.0
            }
        )
        state_store.invalidate_adapted_lessons("student_gamma", c_topic)

        adapt_res = self.client.post(
            "/api/lessons/adapt",
            headers=self.headers_gamma,
            json={"topic_id": c_topic, "detail_level": "STANDARD"}
        )
        self.assertEqual(adapt_res.status_code, 200)
        lesson_data = adapt_res.json().get("lesson")
        adaptation = lesson_data.get("adaptation")

        self.assertEqual(adaptation.get("strategy"), "targeted_concept_revision")
        self.assertIn("Pointer Addressing & Dereferencing Safety", adaptation.get("reason", ""))
        self.assertIn("defensive null dereference guards", adaptation.get("reason", "").lower())
        self.assertNotIn("boundary-safe", adaptation.get("reason", "").lower())
        self.assertIn("pointer_addressing_and_dereference", adaptation.get("target_concepts", []))

        # Check content
        self.assertIn("Pointer Addressing & Safe Dereferencing", lesson_data.get("title", ""))
        sections = lesson_data.get("sections", [])
        explanation_sec = next(s for s in sections if s.get("type") == "explanation")
        self.assertIn("pointer", explanation_sec.get("content", "").lower())
        self.assertIn("address", explanation_sec.get("content", "").lower())

        practice_sec = next(s for s in sections if s.get("type") == "guided_practice")
        self.assertIn("pointer", practice_sec.get("practice", {}).get("prompt", "").lower())


if __name__ == "__main__":
    unittest.main()
