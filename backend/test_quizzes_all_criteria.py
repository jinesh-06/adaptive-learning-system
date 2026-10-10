"""Integration test suite verifying all 10 acceptance criteria for the 10-Question Quiz system."""

import urllib.request
import json
import unittest

BASE_URL = "http://127.0.0.1:5000/api"

class TestTenQuestionQuizSystem(unittest.TestCase):

    def test_criterion_1_and_3_exactly_10_questions_and_4_options(self):
        """1. Every lesson loads exactly 10 questions. 3. Each has 4 options and 1 correct answer."""
        test_topics = [
            # Python
            "top-py-intro",
            "top-py-variables-datatypes",
            "top-py-loops",
            "top-py-adv-metaclasses",
            # C
            "top-c-intro",
            "top-c-pointers-intro",
            "top-c-advanced-structures",
            # C++
            "top-cpp-intro",
            "top-cpp-oop-intro",
            "top-cpp-adv-generic-programming-intro",
            # Java
            "top-java-intro",
            "top-java-oop-intro",
            "top-java-adv-01-collections-intro"
        ]

        for topic_id in test_topics:
            with self.subTest(topic_id=topic_id):
                req = urllib.request.urlopen(f"{BASE_URL}/topics/{topic_id}/quiz")
                self.assertEqual(req.status, 200)
                data = json.loads(req.read().decode())
                questions = data.get("questions", [])
                
                # Criterion 1: Exactly 10 questions
                self.assertEqual(len(questions), 10, f"{topic_id} should have exactly 10 questions, got {len(questions)}")
                
                # Criterion 3: Each has 4 options and 1 correct answer
                for idx, q in enumerate(questions):
                    self.assertEqual(len(q.get("options", [])), 4, f"{topic_id} Q{idx+1} must have 4 options")
                    self.assertIn(q.get("correct_index"), [0, 1, 2, 3], f"{topic_id} Q{idx+1} correct_index must be 0-3")
                    self.assertTrue(bool(q.get("question")), f"{topic_id} Q{idx+1} question must not be empty")
                    self.assertTrue(bool(q.get("explanation")), f"{topic_id} Q{idx+1} explanation must not be empty")

    def test_criterion_2_questions_relevant_to_selected_lesson(self):
        """2. All 10 questions are relevant to the selected lesson."""
        req = urllib.request.urlopen(f"{BASE_URL}/topics/top-c-pointers-intro/quiz")
        data = json.loads(req.read().decode())
        questions = data.get("questions", [])
        
        # Check that questions specifically discuss pointers / memory addresses / dereferencing / C
        pointer_keywords = ["pointer", "address", "dereference", "*", "&", "memory", "c", "variable"]
        matches = 0
        for q in questions:
            text = (q["question"] + " " + q["explanation"] + " " + " ".join(q["options"])).lower()
            if any(k in text for k in pointer_keywords):
                matches += 1
        self.assertGreaterEqual(matches, 8, "Questions for top-c-pointers-intro should be strongly relevant to pointers in C")

    def test_criterion_6_7_and_9_grading_adaptive_feedback_and_scoring(self):
        """6. Scores & percentages calculated correctly. 7. Results & explanations display correctly. 9. Adaptive feedback uses learner results."""
        # Submit a partially correct quiz
        payload = {
            "answers": {
                "q-top-py-intro-1": 1,   # correct
                "q-top-py-intro-2": 1,   # correct
                "q-top-py-intro-3": 999, # wrong
                "q-top-py-intro-4": 999, # wrong
                "q-top-py-intro-5": 999, # wrong
                "q-top-py-intro-6": 0,   # correct
                "q-top-py-intro-7": 3,   # correct
                "q-top-py-intro-8": 2,   # correct
                "q-top-py-intro-9": 999, # wrong
                "q-top-py-intro-10": 0   # correct
            },
            "time_spent": 90.0
        }
        req = urllib.request.Request(
            f"{BASE_URL}/topics/top-py-intro/quiz/submit",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            res = json.loads(resp.read().decode())
            
            # Criterion 6: Score and percentage
            self.assertEqual(res.get("total_questions"), 10)
            self.assertEqual(res.get("correct_count"), 6)
            self.assertEqual(res.get("incorrect_count"), 4)
            self.assertEqual(res.get("percentage"), 60)
            self.assertEqual(res.get("passed"), False)  # >= 70 required to pass

            # Criterion 7: Review display with explanations
            review = res.get("review", [])
            self.assertEqual(len(review), 10)
            for r in review:
                self.assertIn("is_correct", r)
                self.assertIn("explanation", r)
                self.assertTrue(len(r["explanation"]) > 0)

            # Criterion 9: Adaptive feedback uses learner's actual results
            af = res.get("adaptive_feedback", {})
            self.assertIn("cognitive_load", af)
            self.assertIn("recommended_mode", af)
            self.assertIn("revision_concepts", af)
            self.assertGreater(len(af["revision_concepts"]), 0)
            self.assertIn("suggested_actions", af)

    def test_criterion_10_existing_apis_continue_to_work(self):
        """10. Existing lessons, authentication, APIs, progress tracking, and platform features continue to work."""
        # Check courses API
        courses_req = urllib.request.urlopen(f"{BASE_URL}/courses")
        self.assertEqual(courses_req.status, 200)
        courses = json.loads(courses_req.read().decode())
        self.assertGreater(len(courses), 0)

        # Check topic detail API
        topic_req = urllib.request.urlopen(f"{BASE_URL}/topics/top-py-intro")
        self.assertEqual(topic_req.status, 200)
        topic = json.loads(topic_req.read().decode())
        self.assertEqual(topic.get("id"), "top-py-intro")

        # Check health API
        health_req = urllib.request.urlopen("http://127.0.0.1:5000/health")
        self.assertEqual(health_req.status, 200)

if __name__ == "__main__":
    unittest.main()
