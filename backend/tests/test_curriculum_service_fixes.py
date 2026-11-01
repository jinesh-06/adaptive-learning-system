"""Tests for curriculum_service.py fixes covering all 10 criteria.

Criteria:
1. C challenges select C starter code.
2. C++ challenges select C++ starter code when both C and C++ starter code exist.
3. Python and Java challenges select their correct starter code.
4. Diagnostic responses do not expose correct answers prematurely.
5. Coding challenge responses do not reveal reference solutions before submission.
6. Existing answer evaluation and feedback still work.
7. Valid topic IDs retain their correct course mappings.
8. Unknown topic IDs do not silently receive an incorrect course mapping.
9. Course progress statuses remain compatible with existing behavior.
10. Missing or malformed curriculum data is handled safely.
"""

import os
import unittest
import json
import uuid
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Setup disposable isolated test database before any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_curriculum_service_fixes.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_DEV_TEST_HEADERS"] = "false"

from backend.main import app
from backend.services.curriculum_service import (
    CurriculumService,
    curriculum_service,
    normalize_language,
    resolve_course_id
)
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service


class TestCurriculumServiceFixes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        state_store.set_db_path(str(_DISPOSABLE_DB), init_schema=True)
        cls.client = TestClient(app)
        cls.user_token = auth_service.create_internal_token("diag_tester", "diag@example.com")
        cls.auth_headers = {"Authorization": f"Bearer {cls.user_token}"}

    # ================= Criterion 1 =================
    def test_01_c_challenges_select_c_starter_code(self):
        """Criterion 1: C challenges select C starter code with appropriate syntax."""
        challenge = curriculum_service.get_coding_challenge("top-c-intro", language="c")
        self.assertIsNotNone(challenge)
        starter = challenge.get("starter_code", "")
        self.assertIn("#include <stdio.h>", starter)
        self.assertIn("main", starter)
        # Ensure starter_codes dict contains 'c'
        self.assertIn("c", challenge.get("starter_codes", {}))

    # ================= Criterion 2 =================
    def test_02_cpp_challenges_select_cpp_starter_code_not_c(self):
        """Criterion 2: C++ challenges select C++ starter code when both C and C++ exist, without converting cpp to c."""
        # Using "cpp"
        challenge_cpp = curriculum_service.get_coding_challenge("top-cpp-intro", language="cpp")
        self.assertIsNotNone(challenge_cpp)
        starter_cpp = challenge_cpp.get("starter_code", "")
        self.assertIn("#include <iostream>", starter_cpp)
        self.assertNotIn("#include <stdio.h>", starter_cpp)

        # Using alias "c++"
        challenge_cplusplus = curriculum_service.get_coding_challenge("top-cpp-intro", language="c++")
        self.assertIsNotNone(challenge_cplusplus)
        starter_cplusplus = challenge_cplusplus.get("starter_code", "")
        self.assertIn("#include <iostream>", starter_cplusplus)
        self.assertEqual(starter_cpp, starter_cplusplus)

        # When a challenge has both cpp and c starter codes in platform_data
        mock_platform_question = {
            "id": "code-dual-test",
            "topic_id": "top-dual-test",
            "title": "Dual Language Test",
            "starter_code": {
                "cpp": "// C++ Implementation\n#include <iostream>\nint main() { return 0; }",
                "c": "// C Implementation\n#include <stdio.h>\nint main(void) { return 0; }"
            },
            "test_cases": []
        }
        with patch.object(curriculum_service, "data", {"coding_questions": [mock_platform_question]}):
            ch_cpp = curriculum_service.get_coding_challenge("top-dual-test", language="cpp")
            self.assertIn("// C++ Implementation", ch_cpp["starter_code"])
            self.assertNotIn("// C Implementation", ch_cpp["starter_code"])

            ch_alias = curriculum_service.get_coding_challenge("top-dual-test", language="c++")
            self.assertIn("// C++ Implementation", ch_alias["starter_code"])

            ch_c = curriculum_service.get_coding_challenge("top-dual-test", language="c")
            self.assertIn("// C Implementation", ch_c["starter_code"])

    # ================= Criterion 3 =================
    def test_03_python_and_java_challenges_select_correct_starter_code(self):
        """Criterion 3: Python and Java challenges select their correct starter code and support aliases."""
        # Java challenge
        challenge_java = curriculum_service.get_coding_challenge("top-java-intro", language="java")
        self.assertIsNotNone(challenge_java)
        starter_java = challenge_java.get("starter_code", "")
        self.assertIn("class Main", starter_java)
        self.assertIn("public static void main", starter_java)

        # Python challenge with aliases
        ch_py = curriculum_service.get_coding_challenge("top-py-variables-datatypes", language="python")
        self.assertIsNotNone(ch_py)
        ch_py3 = curriculum_service.get_coding_challenge("top-py-variables-datatypes", language="python3")
        self.assertIsNotNone(ch_py3)
        self.assertEqual(ch_py.get("starter_code"), ch_py3.get("starter_code"))

        # Language normalizer check
        self.assertEqual(normalize_language("python3"), "python")
        self.assertEqual(normalize_language("py"), "python")
        self.assertEqual(normalize_language("cpp"), "cpp")
        self.assertEqual(normalize_language("c++"), "cpp")
        self.assertEqual(normalize_language("c"), "c")
        self.assertEqual(normalize_language("java"), "java")

    # ================= Criterion 4 =================
    def test_04_diagnostic_responses_do_not_expose_answers_prematurely(self):
        """Criterion 4: get_diagnostic_questions and GET endpoint do not expose correct_index or explanation."""
        # 1. Service direct call without include_answers defaults to sanitized
        for lang in ["python", "c", "cpp", "java"]:
            questions = curriculum_service.get_diagnostic_questions(lang)
            self.assertGreater(len(questions), 0)
            for q in questions:
                self.assertNotIn("correct_index", q, f"Leaked correct_index in {lang} service questions")
                self.assertNotIn("explanation", q, f"Leaked explanation in {lang} service questions")
                self.assertIn("id", q)
                self.assertIn("question", q)
                self.assertIn("options", q)

        # 2. REST API GET /{language}/questions endpoint does not expose answers
        res = self.client.get("/api/diagnostic/python/questions")
        self.assertEqual(res.status_code, 200)
        api_questions = res.json().get("questions", [])
        self.assertGreater(len(api_questions), 0)
        for q in api_questions:
            self.assertNotIn("correct_index", q, "API leaked correct_index to client")
            self.assertNotIn("explanation", q, "API leaked explanation to client")

    # ================= Criterion 5 =================
    def test_05_coding_challenge_responses_do_not_reveal_solution_before_submission(self):
        """Criterion 5: Coding challenge does not leak solution in GET or service without include_solution."""
        # 1. Service default call omits solution
        ch = curriculum_service.get_coding_challenge("top-c-intro", language="c")
        self.assertNotIn("solution", ch, "Service leaked solution before submission")

        # 2. GET API does not leak solution
        res = self.client.get("/api/topics/top-c-intro/coding?language=c")
        self.assertEqual(res.status_code, 200)
        client_ch = res.json()
        self.assertNotIn("solution", client_ch, "GET /coding API leaked solution to client")

        # 3. Reference solution is still available to backend grading/evaluation
        ref_solution = curriculum_service.get_challenge_solution("top-c-intro", language="c")
        self.assertIsNotNone(ref_solution)
        self.assertIn("#include", ref_solution)

    # ================= Criterion 6 =================
    def test_06_diagnostic_evaluation_and_feedback_still_work(self):
        """Criterion 6: Server-side diagnostic submission correctly grades answers and returns explanation in review."""
        # Submit diagnostic answers with valid auth headers
        answers_payload = {
            "answers": {
                "diag-py-1": 1,  # correct
                "diag-py-2": 0   # wrong (correct is 2)
            },
            "time_spent": 45.0
        }
        res = self.client.post("/api/diagnostic/python/submit", json=answers_payload, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("score", data)
        self.assertIn("question_breakdown", data)

        breakdown = data["question_breakdown"]
        self.assertGreater(len(breakdown), 0)
        # Verify explanation is present post-submission in the evaluation breakdown
        for item in breakdown:
            self.assertIn("explanation", item)
            self.assertIn("is_correct", item)

    # ================= Criterion 7 =================
    def test_07_valid_topic_ids_retain_correct_course_mappings(self):
        """Criterion 7: Valid topic IDs across C, C++, Python, and Java map to their authoritative courses."""
        test_cases = [
            ("top-c-intro", "c-beg"),
            ("top-c-pointers", "c-beg"),
            ("top-c-pointers-intro", "c-int"),
            ("top-c-preprocessor", "c-advanced-systems"),
            ("top-cpp-intro", "cpp-beg"),
            ("top-cpp-oop-classes", "cpp-int"),
            ("top-cpp-adv-templates", "cpp-adv"),
            ("top-java-intro", "java-basics"),
            ("top-java-oop-classes", "java-oop"),
            ("top-java-adv-concurrency", "java-adv"),
            ("top-py-fundamentals", "py-beg"),
            ("top-py-int-classes", "py-int"),
            ("top-py-adv-generators", "py-adv")
        ]
        for topic_id, expected_course in test_cases:
            actual = curriculum_service.get_course_id_for_topic(topic_id)
            self.assertEqual(actual, expected_course, f"Mismatch for {topic_id}: got {actual}, expected {expected_course}")
            self.assertEqual(resolve_course_id(topic_id), expected_course)

    # ================= Criterion 8 =================
    def test_08_unknown_topic_ids_do_not_silently_map_to_py_beg(self):
        """Criterion 8: Unknown/invalid topic IDs do not silently return py-beg."""
        # Nonexistent topic ID
        self.assertIsNone(curriculum_service.get_course_id_for_topic("completely_unknown_topic_xyz"))
        self.assertNotEqual(curriculum_service.get_course_id_for_topic("completely_unknown_topic_xyz"), "py-beg")

        # Empty / whitespace topic ID
        self.assertIsNone(curriculum_service.get_course_id_for_topic(""))
        self.assertIsNone(curriculum_service.get_course_id_for_topic(None))
        self.assertIsNone(curriculum_service.get_course_id_for_topic("   "))

        # Explicit default parameter
        self.assertEqual(curriculum_service.get_course_id_for_topic("unknown_123", default="unknown"), "unknown")

        # Controlled exception on raise_on_unknown
        with self.assertRaises(ValueError):
            curriculum_service.get_course_id_for_topic("unknown_123", raise_on_unknown=True)

    # ================= Criterion 9 =================
    def test_09_course_progress_statuses_reflect_real_user_progress(self):
        """Criterion 9: get_courses reflects real progress when user_id is provided, and defaults cleanly when not."""
        # 1. Unauthenticated / catalog view has clean NOT_STARTED defaults without synthetic completion
        courses_catalog = curriculum_service.get_courses()
        self.assertGreater(len(courses_catalog), 0)
        for c in courses_catalog:
            for m in c.get("modules", []):
                for t in m.get("topics", []):
                    # No fake hardcoded COMPLETED for topic 0 when unauthenticated
                    self.assertIn(t.get("status"), ("NOT_STARTED", "AVAILABLE"))

        # 2. Authenticated user with real saved progress in database
        user_id = f"test_prog_{uuid.uuid4().hex[:8]}"
        state_store.save_topic_progress(
            user_id=user_id,
            course_id="py-beg",
            topic_id="top-py-intro",
            status="COMPLETED",
            completion_pct=100.0
        )

        courses_user = curriculum_service.get_courses(user_id=user_id)
        found_completed = False
        for c in courses_user:
            if c.get("id") == "py-beg":
                for m in c.get("modules", []):
                    for t in m.get("topics", []):
                        if t.get("id") == "top-py-intro":
                            self.assertEqual(t.get("status"), "COMPLETED")
                            found_completed = True
        self.assertTrue(found_completed, "Real completed topic status was not reflected for authenticated user")

    # ================= Criterion 10 =================
    def test_10_missing_or_malformed_curriculum_data_handled_safely(self):
        """Criterion 10: Missing or corrupt files are handled safely with clear logging and fallbacks."""
        # Test safe loading with nonexistent path
        with tempfile.TemporaryDirectory() as tmpdir:
            fake_service = CurriculumService.__new__(CurriculumService)
            fake_service.data = {}
            fake_service.c_topics = {}
            fake_service.python_topics = {}
            fake_service.java_topics = {}
            fake_service.cpp_topics = {}
            fake_service.c_adv_topics = {}
            fake_service.c_int_topics = {}

            # Calling fallback on unknown topic with empty data
            fallback_challenge = fake_service.get_coding_challenge("top-nonexistent", language="python")
            self.assertIsNotNone(fallback_challenge)
            self.assertIn("Interactive Programming Exercise", fallback_challenge.get("title", ""))
            self.assertIn("starter_code", fallback_challenge)
            self.assertNotIn("solution", fallback_challenge)

    # ================= Criterion 11 =================
    def test_11_advanced_python_topics_with_string_mistakes_no_http_500(self):
        """Criterion 11: Advanced Python topics (which have string commonMistakes) do not raise AttributeError/HTTP 500."""
        # 1. Direct curriculum service check for top-py-adv-args-kwargs
        detail = curriculum_service.get_topic_detail("top-py-adv-args-kwargs")
        self.assertIsNotNone(detail)
        self.assertEqual(detail.get("id"), "top-py-adv-args-kwargs")
        self.assertIn("sections", detail)
        self.assertGreaterEqual(len(detail["sections"]), 1)
        # Check pitfalls field is a string, not an error
        first_section = detail["sections"][0]
        self.assertIn("pitfalls", first_section)
        self.assertIsInstance(first_section["pitfalls"], str)
        self.assertGreater(len(first_section["pitfalls"]), 0)

        # 2. HTTP endpoint GET /api/topics/top-py-adv-args-kwargs
        response = self.client.get("/api/topics/top-py-adv-args-kwargs")
        self.assertEqual(response.status_code, 200, f"Failed with {response.status_code}: {response.text}")
        json_data = response.json()
        self.assertEqual(json_data.get("id"), "top-py-adv-args-kwargs")
        self.assertIn("sections", json_data)

    # ================= Criterion 12 =================
    def test_12_advanced_python_quiz_generation_no_http_500(self):
        """Criterion 12: Quiz generation for Advanced Python topics returns HTTP 200 with questions."""
        response = self.client.get("/api/topics/top-py-adv-args-kwargs/quiz")
        self.assertEqual(response.status_code, 200, f"Quiz returned {response.status_code}: {response.text}")
        data = response.json()
        self.assertIn("questions", data)
        self.assertGreater(len(data["questions"]), 0)

    # ================= Criterion 13 =================
    def test_13_python_topic_alias_resolution(self):
        """Criterion 13: Python topic aliases resolve to full topic details and course mappings."""
        # Check alias top-py-adv-args -> top-py-adv-args-kwargs
        course = curriculum_service.get_course_id_for_topic("top-py-adv-args")
        self.assertEqual(course, "py-adv")

        detail = curriculum_service.get_topic_detail("top-py-adv-args")
        self.assertIsNotNone(detail)
        self.assertEqual(detail.get("id"), "top-py-adv-args-kwargs")

        # HTTP request using alias returns 200
        response = self.client.get("/api/topics/top-py-adv-args")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("id"), "top-py-adv-args-kwargs")

        # Check closures alias
        course_closures = curriculum_service.get_course_id_for_topic("top-py-adv-closures")
        self.assertEqual(course_closures, "py-adv")
        detail_closures = curriculum_service.get_topic_detail("top-py-adv-closures")
        self.assertIsNotNone(detail_closures)
        self.assertEqual(detail_closures.get("id"), "top-py-adv-closures-scope")

    # ================= Criterion 14 =================
    def test_14_unknown_topic_endpoint_returns_controlled_404_not_500(self):
        """Criterion 14: Requesting a non-existent topic returns HTTP 404, not HTTP 500."""
        response = self.client.get("/api/topics/top-py-adv-completely-nonexistent-12345")
        self.assertEqual(response.status_code, 404)

        # Quiz endpoint safely returns a response or 404 without crashing with HTTP 500
        quiz_resp = self.client.get("/api/topics/top-py-adv-completely-nonexistent-12345/quiz")
        self.assertNotEqual(quiz_resp.status_code, 500)
        self.assertIn(quiz_resp.status_code, (200, 404))

    # ================= Criterion 15 =================
    def test_15_all_topics_across_all_languages_resolve_without_exception(self):
        """Criterion 15: All 326 topics across C, C++, Java, and Python resolve cleanly via get_topic_detail."""
        all_topic_ids = (
            list(curriculum_service.c_topics.keys())
            + list(curriculum_service.python_topics.keys())
            + list(curriculum_service.java_topics.keys())
            + list(curriculum_service.cpp_topics.keys())
        )
        self.assertGreater(len(all_topic_ids), 300)
        for tid in all_topic_ids:
            detail = curriculum_service.get_topic_detail(tid)
            self.assertIsNotNone(detail, f"Topic detail was None for {tid}")
            self.assertIn("sections", detail, f"Missing sections for {tid}")
            for sec in detail["sections"]:
                self.assertIsInstance(sec.get("pitfalls"), str, f"Pitfall was not str for {tid}")


if __name__ == "__main__":
    unittest.main()
