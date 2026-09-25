"""Curriculum Service providing access to courses, modules, topics, quizzes, and coding challenges."""

import json
from typing import List, Dict, Any, Optional
from backend.services.state_store import state_store


class CurriculumService:
    """Manages course catalog, syllabus modules, topic details, quizzes, and challenges."""

    def __init__(self):
        self.data = state_store.platform_data

    def get_courses(self, language: Optional[str] = None, level: Optional[str] = None) -> List[Dict[str, Any]]:
        raw_courses = self.data.get("courses", [])
        modules = self.data.get("modules", [])
        topics = self.data.get("topics", [])

        results = []
        for c in raw_courses:
            if language and c.get("language", "").lower() != language.lower():
                continue
            if level and c.get("level", "").lower() != level.lower():
                continue

            c_modules = [m for m in modules if m.get("course_id") == c.get("id")]
            c_modules.sort(key=lambda m: m.get("order_index", 0))

            structured_modules = []
            for m in c_modules:
                m_topics = [t for t in topics if t.get("module_id") == m.get("id")]
                m_topics.sort(key=lambda t: t.get("order_index", 0))

                structured_topics = []
                for idx, t in enumerate(m_topics):
                    structured_topics.append({
                        "id": t.get("id"),
                        "title": t.get("title"),
                        "level": c.get("level"),
                        "status": "COMPLETED" if idx == 0 else "IN_PROGRESS" if idx == 1 else "LOCKED"
                    })

                structured_modules.append({
                    "id": m.get("id"),
                    "title": m.get("title"),
                    "order": m.get("order_index", 1),
                    "topics": structured_topics
                })

            results.append({
                "id": c.get("id"),
                "language": c.get("language"),
                "level": c.get("level"),
                "title": c.get("title"),
                "description": c.get("description"),
                "modules": structured_modules
            })

        return results

    def get_course_detail(self, course_id: str) -> Optional[Dict[str, Any]]:
        courses = self.get_courses()
        for c in courses:
            if c.get("id") == course_id:
                return c
        return None

    def get_topic_detail(self, topic_id: str) -> Optional[Dict[str, Any]]:
        topics = self.data.get("topics", [])
        for t in topics:
            if t.get("id") == topic_id:
                topic_copy = dict(t)
                # Ensure sections structure is present
                if not topic_copy.get("sections"):
                    topic_copy["sections"] = [
                        {
                            "id": f"{topic_id}-sec-1",
                            "title": "1. Core Conceptual Overview",
                            "order_index": 1,
                            "content": topic_copy.get("content_standard", ""),
                            "code_snippet": topic_copy.get("syntax", ""),
                            "pitfalls": topic_copy.get("common_mistakes", "")
                        }
                    ]
                return topic_copy
        return None

    def get_topic_quiz(self, topic_id: str) -> Dict[str, Any]:
        mcqs = self.data.get("mcq_questions", [])
        topic_mcqs = [q for q in mcqs if q.get("topic_id") == topic_id]
        if not topic_mcqs:
            # Fallback question if not explicitly in platformData
            topic_mcqs = [
                {
                    "id": f"mcq-{topic_id}-1",
                    "topic_id": topic_id,
                    "question_text": f"What is the primary role of this concept in {topic_id}?",
                    "options": [
                        "Controls programmatic flow and data handling",
                        "Deletes system memory automatically",
                        "Translates high level syntax into pure assembler",
                        "Prevents any syntax errors from occurring"
                    ],
                    "correct_option_index": 0,
                    "explanation": "This construct manages operational control and state representations."
                }
            ]

        # Format questions for the frontend
        formatted_questions = []
        for q in topic_mcqs:
            formatted_questions.append({
                "id": q.get("id"),
                "question": q.get("question_text") or q.get("question"),
                "options": q.get("options", []),
                "correct_index": q.get("correct_option_index") if "correct_option_index" in q else q.get("correct_index", 0),
                "explanation": q.get("explanation", "Good job analyzing the concept!")
            })

        return {
            "topic_id": topic_id,
            "title": f"Knowledge Check: {topic_id}",
            "questions": formatted_questions
        }

    def get_coding_challenge(self, topic_id: str) -> Dict[str, Any]:
        coding_qs = self.data.get("coding_questions", [])
        challenges = [c for c in coding_qs if c.get("topic_id") == topic_id]
        if challenges:
            c = challenges[0]
            return {
                "id": c.get("id"),
                "topic_id": topic_id,
                "title": c.get("title", "Coding Challenge"),
                "description": c.get("problem_statement") or c.get("description", "Implement the solution."),
                "starter_code": c.get("starter_code", "# Write your solution here\n"),
                "test_cases": c.get("test_cases", []),
                "solution": c.get("solution_code", "")
            }

        # Default starter challenge
        return {
            "id": f"code-{topic_id}",
            "topic_id": topic_id,
            "title": "Interactive Programming Exercise",
            "description": "Complete the function according to the specifications.",
            "starter_code": "def solution():\n    # Implement here\n    pass\n\nprint(solution())",
            "test_cases": [{"input": "", "expected_output": "None"}],
            "solution": "def solution():\n    return 'Success'\n"
        }

    def get_projects(self, language: str = "python", level: Optional[str] = None) -> List[Dict[str, Any]]:
        projects = self.data.get("projects", [])
        filtered = [p for p in projects if p.get("language", "python").lower() == language.lower()]
        if level:
            filtered = [p for p in filtered if p.get("level", "").lower() == level.lower()]
        return filtered

    def get_project_detail(self, project_id: str) -> Optional[Dict[str, Any]]:
        projects = self.data.get("projects", [])
        for p in projects:
            if p.get("id") == project_id:
                return p
        return None

    def get_diagnostic_questions(self, language: str = "python") -> List[Dict[str, Any]]:
        mcqs = self.data.get("mcq_questions", [])
        # Return 5-10 curated diagnostic assessment questions
        diag = []
        for q in mcqs:
            if len(diag) >= 8:
                break
            diag.append({
                "id": q.get("id"),
                "question": q.get("question_text") or q.get("question"),
                "options": q.get("options", []),
                "correct_index": q.get("correct_option_index") if "correct_option_index" in q else q.get("correct_index", 0),
                "concept": q.get("topic_id", language)
            })
        return diag


curriculum_service = CurriculumService()
