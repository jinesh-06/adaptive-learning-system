"""Curriculum Service providing access to courses, modules, topics, quizzes, and coding challenges."""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.services.state_store import state_store


class CurriculumService:
    """Manages course catalog, syllabus modules, topic details, quizzes, and challenges."""

    def __init__(self):
        self.data = state_store.platform_data

        # Load authoritative C topics data
        self.c_topics: Dict[str, Any] = {}
        c_path = Path(__file__).resolve().parent.parent / "data" / "c_topics_data.json"
        if c_path.exists():
            try:
                with open(c_path, "r", encoding="utf-8") as f:
                    c_json = json.load(f)
                    for t in c_json.get("topics", []):
                        self.c_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load c_topics_data.json: {e}")

        # Load authoritative Python topics data
        self.python_topics: Dict[str, Any] = {}
        py_path = Path(__file__).resolve().parent.parent / "data" / "python_topics_data.json"
        if py_path.exists():
            try:
                with open(py_path, "r", encoding="utf-8") as f:
                    py_json = json.load(f)
                    for key in ["fundamentals", "intermediate", "advanced"]:
                        for t in py_json.get(key, []):
                            self.python_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load python_topics_data.json: {e}")

        # Load authoritative Java topics data
        self.java_topics: Dict[str, Any] = {}
        java_path = Path(__file__).resolve().parent.parent / "data" / "java_topics_data.json"
        if java_path.exists():
            try:
                with open(java_path, "r", encoding="utf-8") as f:
                    java_json = json.load(f)
                    for t in java_json.get("topics", []):
                        self.java_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load java_topics_data.json: {e}")

        # Load Java Object-Oriented Design topics data
        java_oop_path = Path(__file__).resolve().parent.parent / "data" / "java_oop_topics_data.json"
        if java_oop_path.exists():
            try:
                with open(java_oop_path, "r", encoding="utf-8") as f:
                    java_oop_json = json.load(f)
                    for t in java_oop_json.get("topics", []):
                        self.java_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load java_oop_topics_data.json: {e}")

        # Load Java Advanced topics data
        java_adv_path = Path(__file__).resolve().parent.parent / "data" / "java_adv_topics_data.json"
        if java_adv_path.exists():
            try:
                with open(java_adv_path, "r", encoding="utf-8") as f:
                    java_adv_json = json.load(f)
                    for t in java_adv_json.get("topics", []):
                        self.java_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load java_adv_topics_data.json: {e}")

        # Load authoritative C++ topics data
        self.cpp_topics: Dict[str, Any] = {}
        cpp_path = Path(__file__).resolve().parent.parent / "data" / "cpp_topics_data.json"
        if cpp_path.exists():
            try:
                with open(cpp_path, "r", encoding="utf-8") as f:
                    cpp_json = json.load(f)
                    for t in cpp_json.get("topics", []):
                        self.cpp_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load cpp_topics_data.json: {e}")

        # Load C++ OOP topics data
        cpp_oop_path = Path(__file__).resolve().parent.parent / "data" / "cpp_oop_topics_data.json"
        if cpp_oop_path.exists():
            try:
                with open(cpp_oop_path, "r", encoding="utf-8") as f:
                    cpp_oop_json = json.load(f)
                    for t in cpp_oop_json.get("topics", []):
                        self.cpp_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load cpp_oop_topics_data.json: {e}")

        # Load C++ Advanced topics data
        cpp_adv_path = Path(__file__).resolve().parent.parent / "data" / "cpp_advanced_topics_data.json"
        if cpp_adv_path.exists():
            try:
                with open(cpp_adv_path, "r", encoding="utf-8") as f:
                    cpp_adv_json = json.load(f)
                    for t in cpp_adv_json.get("topics", []):
                        self.cpp_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load cpp_advanced_topics_data.json: {e}")

        # Load C Advanced Systems & Data Structures topics data
        self.c_adv_topics: Dict[str, Any] = {}
        c_adv_path = Path(__file__).resolve().parent.parent / "data" / "c_advanced_topics_data.json"
        if c_adv_path.exists():
            try:
                with open(c_adv_path, "r", encoding="utf-8") as f:
                    c_adv_json = json.load(f)
                    for t in c_adv_json.get("topics", []):
                        self.c_adv_topics[t["id"]] = t
                        self.c_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load c_advanced_topics_data.json: {e}")

        # Load C Intermediate Pointers & Memory Management topics data
        self.c_int_topics: Dict[str, Any] = {}
        c_int_path = Path(__file__).resolve().parent.parent / "data" / "c_intermediate_topics_data.json"
        if c_int_path.exists():
            try:
                with open(c_int_path, "r", encoding="utf-8") as f:
                    c_int_json = json.load(f)
                    for t in c_int_json.get("topics", []):
                        self.c_int_topics[t["id"]] = t
                        self.c_topics[t["id"]] = t
            except Exception as e:
                print(f"[CurriculumService] Failed to load c_intermediate_topics_data.json: {e}")



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

            c_id = c.get("id")
            if c_id == "py-beg":
                try:
                    from backend.routes.python_routes import TOPIC_METADATA
                    structured_modules = [
                        {
                            "id": "mod-py-fund-core",
                            "title": "Python Core & Syntax",
                            "order": 1,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "COMPLETED" if idx == 0 else "NOT_STARTED"} for idx, t in enumerate(TOPIC_METADATA[:8])]
                        },
                        {
                            "id": "mod-py-fund-advanced",
                            "title": "Data Structures & Modules",
                            "order": 2,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "LOCKED"} for idx, t in enumerate(TOPIC_METADATA[8:])]
                        }
                    ]
                except Exception:
                    structured_modules = []
            elif c_id == "c-beg":
                try:
                    from backend.routes.c_routes import TOPIC_METADATA as C_TOPIC_METADATA
                    structured_modules = [
                        {
                            "id": "mod-c-core",
                            "title": "C Core & Logic",
                            "order": 1,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "COMPLETED" if idx == 0 else "NOT_STARTED"} for idx, t in enumerate(C_TOPIC_METADATA[:8])]
                        },
                        {
                            "id": "mod-c-advanced",
                            "title": "Pointers & Systems",
                            "order": 2,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "LOCKED"} for idx, t in enumerate(C_TOPIC_METADATA[8:])]
                        }
                    ]
                except Exception:
                    structured_modules = []
            elif c_id in ("c-int", "c-intermediate") or (c.get("language") == "c" and c.get("level") == "intermediate"):
                try:
                    from backend.routes.c_int_routes import TOPIC_METADATA as C_INT_TOPIC_METADATA, MODULE_INFO as C_INT_MODULE_INFO
                    mod_map = {}
                    for m in C_INT_MODULE_INFO:
                        mod_map[m["id"]] = {
                            "id": m["id"],
                            "title": m["title"],
                            "order": m.get("number", 1),
                            "topics": []
                        }
                    for idx, t in enumerate(C_INT_TOPIC_METADATA):
                        m_id = t["moduleId"]
                        if m_id in mod_map:
                            mod_map[m_id]["topics"].append({
                                "id": t["id"],
                                "title": t["title"],
                                "level": "intermediate",
                                "status": "COMPLETED" if idx == 0 else "NOT_STARTED"
                            })
                    structured_modules = list(mod_map.values())
                except Exception as e:
                    print(f"[curriculum_service] error building c-int modules: {e}")
                    structured_modules = []
            elif c_id in ("c-advanced-systems", "c-adv") or (c.get("language") == "c" and c.get("level") == "advanced"):
                try:
                    from backend.routes.c_adv_routes import TOPIC_METADATA as C_ADV_TOPIC_METADATA, MODULE_INFO as C_ADV_MODULE_INFO
                    mod_map = {}
                    for m in C_ADV_MODULE_INFO:
                        mod_map[m["id"]] = {
                            "id": m["id"],
                            "title": m["title"],
                            "order": m.get("number", 1),
                            "topics": []
                        }
                    for idx, t in enumerate(C_ADV_TOPIC_METADATA):
                        m_id = t["moduleId"]
                        if m_id in mod_map:
                            mod_map[m_id]["topics"].append({
                                "id": t["id"],
                                "title": t["title"],
                                "level": "advanced",
                                "status": "COMPLETED" if idx == 0 else "NOT_STARTED"
                            })
                    structured_modules = list(mod_map.values())
                except Exception as e:
                    print(f"[curriculum_service] error building c-adv modules: {e}")
                    structured_modules = []
            elif c_id in ("java-adv", "java-advanced") or (c.get("language") == "java" and c.get("level") == "advanced"):
                try:
                    from backend.routes.java_adv_routes import TOPIC_METADATA as JAVA_ADV_TOPIC_METADATA, MODULE_INFO as JAVA_ADV_MODULE_INFO
                    mod_map = {}
                    for m in JAVA_ADV_MODULE_INFO:
                        mod_map[m["id"]] = {
                            "id": m["id"],
                            "title": m["title"],
                            "order": m["number"],
                            "topics": []
                        }
                    for idx, t in enumerate(JAVA_ADV_TOPIC_METADATA):
                        m_id = t["moduleId"]
                        if m_id in mod_map:
                            mod_map[m_id]["topics"].append({
                                "id": t["id"],
                                "title": t["title"],
                                "level": "advanced",
                                "status": "COMPLETED" if idx == 0 else "NOT_STARTED"
                            })
                    structured_modules = list(mod_map.values())
                except Exception as e:
                    print(f"[curriculum_service] error building java-adv modules: {e}")
                    structured_modules = []
            elif c_id in ("java-int", "java-oop") or (c.get("language") == "java" and c.get("level") == "intermediate"):
                try:
                    from backend.routes.java_oop_routes import TOPIC_METADATA as JAVA_OOP_TOPIC_METADATA, MODULE_INFO as JAVA_OOP_MODULE_INFO
                    mod_map = {}
                    for m in JAVA_OOP_MODULE_INFO:
                        mod_map[m["id"]] = {
                            "id": m["id"],
                            "title": m["title"],
                            "order": m["number"],
                            "topics": []
                        }
                    for idx, t in enumerate(JAVA_OOP_TOPIC_METADATA):
                        m_id = t["moduleId"]
                        if m_id in mod_map:
                            mod_map[m_id]["topics"].append({
                                "id": t["id"],
                                "title": t["title"],
                                "level": "intermediate",
                                "status": "COMPLETED" if idx == 0 else "NOT_STARTED"
                            })
                    structured_modules = list(mod_map.values())
                except Exception as e:
                    print(f"[curriculum_service] error building java-oop modules: {e}")
                    structured_modules = []
            elif c_id in ("java-beg", "java-basics") or (c.get("language") == "java" and c.get("level") in ("beginner", None)):
                try:
                    from backend.routes.java_routes import TOPIC_METADATA as JAVA_TOPIC_METADATA
                    structured_modules = [
                        {
                            "id": "mod-java-architecture-basics",
                            "title": "Module 01: Java Core Architecture & Basics",
                            "order": 1,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "COMPLETED" if idx == 0 else "NOT_STARTED"} for idx, t in enumerate(JAVA_TOPIC_METADATA[:6])]
                        },
                        {
                            "id": "mod-java-fundamentals-control",
                            "title": "Module 02: Java Fundamentals & Control Structures",
                            "order": 2,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "LOCKED"} for idx, t in enumerate(JAVA_TOPIC_METADATA[6:17])]
                        },
                        {
                            "id": "mod-java-methods-arrays",
                            "title": "Module 03: Java Methods & Arrays",
                            "order": 3,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "LOCKED"} for idx, t in enumerate(JAVA_TOPIC_METADATA[17:])]
                        }
                    ]
                except Exception:
                    structured_modules = []
            elif c_id in ("cpp-beg", "cpp-fundamentals") or (c.get("language") == "cpp" and c.get("level") == "beginner"):
                try:
                    from backend.routes.cpp_routes import TOPIC_METADATA as CPP_TOPIC_METADATA
                    structured_modules = [
                        {
                            "id": "mod-cpp-foundations",
                            "title": "MODULE 01: C++ Introduction & Programming Foundations",
                            "order": 1,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "COMPLETED" if idx == 0 else "NOT_STARTED"} for idx, t in enumerate(CPP_TOPIC_METADATA[:8])]
                        },
                        {
                            "id": "mod-cpp-control-flow",
                            "title": "MODULE 02: Control Flow & Problem Solving",
                            "order": 2,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "LOCKED"} for idx, t in enumerate(CPP_TOPIC_METADATA[8:16])]
                        },
                        {
                            "id": "mod-cpp-functions-memory",
                            "title": "MODULE 03: Functions, References & Memory Fundamentals",
                            "order": 3,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "beginner", "status": "LOCKED"} for idx, t in enumerate(CPP_TOPIC_METADATA[16:])]
                        }
                    ]
                except Exception:
                    structured_modules = []
            elif c_id in ("cpp-int", "cpp-oop") or (c.get("language") == "cpp" and c.get("level") == "intermediate"):
                try:
                    from backend.routes.cpp_oop_routes import TOPIC_METADATA as CPP_OOP_TOPIC_METADATA
                    structured_modules = [
                        {
                            "id": "mod-cpp-oop-core",
                            "title": "Module 01: Object-Oriented C++ Architecture & Design",
                            "order": 1,
                            "topics": [{"id": t["id"], "title": t["title"], "level": "intermediate", "status": "COMPLETED" if idx == 0 else "NOT_STARTED"} for idx, t in enumerate(CPP_OOP_TOPIC_METADATA)]
                        }
                    ]
                except Exception:
                    structured_modules = []
            elif c_id in ("cpp-adv", "cpp-advanced") or (c.get("language") == "cpp" and c.get("level") == "advanced"):
                try:
                    from backend.routes.cpp_adv_routes import TOPIC_METADATA as CPP_ADV_TOPIC_METADATA, MODULE_INFO as CPP_ADV_MODULE_INFO
                    mod_map = {}
                    for m in CPP_ADV_MODULE_INFO:
                        mod_map[m["id"]] = {
                            "id": m["id"],
                            "title": m["title"],
                            "order": m["number"],
                            "topics": []
                        }
                    for idx, t in enumerate(CPP_ADV_TOPIC_METADATA):
                        m_id = t["moduleId"]
                        if m_id in mod_map:
                            mod_map[m_id]["topics"].append({
                                "id": t["id"],
                                "title": t["title"],
                                "level": "advanced",
                                "status": "COMPLETED" if idx == 0 else "NOT_STARTED"
                            })
                    structured_modules = list(mod_map.values())
                except Exception as e:
                    print(f"[curriculum_service] error building cpp-adv modules: {e}")
                    structured_modules = []
            else:
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
        # 1. Check C Topics
        if topic_id in self.c_topics:
            t = dict(self.c_topics[topic_id])
            if not t.get("sections"):
                t["sections"] = [
                    {
                        "id": f"{topic_id}-sec-1",
                        "title": "1. Core Conceptual Overview",
                        "order_index": 1,
                        "content": t.get("conceptExplanation", ""),
                        "code_snippet": t.get("syntax", ""),
                        "pitfalls": t.get("commonMistakes", [{}])[0].get("mistake", "") if t.get("commonMistakes") else ""
                    },
                    {
                        "id": f"{topic_id}-sec-2",
                        "title": "2. Syntax & Implementation",
                        "order_index": 2,
                        "content": t.get("conceptExplanation", ""),
                        "code_snippet": t.get("codeExample", ""),
                        "pitfalls": t.get("commonMistakes", [{}])[0].get("whyWrong", "") if t.get("commonMistakes") else ""
                    }
                ]
            if not t.get("content_standard"):
                t["content_standard"] = t.get("conceptExplanation", "")
            return t

        # 2. Check Python Topics
        if topic_id in self.python_topics:
            t = dict(self.python_topics[topic_id])
            if not t.get("sections"):
                t["sections"] = [
                    {
                        "id": f"{topic_id}-sec-1",
                        "title": "1. Core Conceptual Overview",
                        "order_index": 1,
                        "content": t.get("conceptExplanation", t.get("content_standard", "")),
                        "code_snippet": t.get("syntax", ""),
                        "pitfalls": t.get("commonMistakes", [{}])[0].get("mistake", "") if t.get("commonMistakes") else ""
                    }
                ]
            if not t.get("content_standard"):
                t["content_standard"] = t.get("conceptExplanation", "")
            return t

        # 3. Check Java Topics
        if topic_id in self.java_topics:
            t = dict(self.java_topics[topic_id])
            if not t.get("sections"):
                t["sections"] = [
                    {
                        "id": f"{topic_id}-sec-1",
                        "title": "1. Core Conceptual Overview",
                        "order_index": 1,
                        "content": t.get("conceptExplanation", ""),
                        "code_snippet": t.get("syntax", ""),
                        "pitfalls": t.get("commonMistakes", [{}])[0].get("mistake", "") if t.get("commonMistakes") else ""
                    },
                    {
                        "id": f"{topic_id}-sec-2",
                        "title": "2. Syntax & Implementation",
                        "order_index": 2,
                        "content": t.get("conceptExplanation", ""),
                        "code_snippet": t.get("codeExample", ""),
                        "pitfalls": t.get("commonMistakes", [{}])[0].get("explanation", "") if t.get("commonMistakes") else ""
                    }
                ]
            if not t.get("content_standard"):
                t["content_standard"] = t.get("conceptExplanation", "")
            return t

        # 4. Check C++ Topics
        cpp_aliases = {
            "top-cpp-fundamentals": "top-cpp-intro",
            "top-cpp-control-functions": "top-cpp-conditional-statements",
            "top-cpp-references-memory": "top-cpp-adv-generic-programming-intro",
            "top-cpp-adv": "top-cpp-adv-generic-programming-intro",
            "top-cpp-adv-intro": "top-cpp-adv-generic-programming-intro",
            "top-cpp-oop": "top-cpp-oop-intro"
        }
        resolved_topic_id = cpp_aliases.get(topic_id, topic_id)
        if resolved_topic_id in self.cpp_topics:
            t = dict(self.cpp_topics[resolved_topic_id])
            if not t.get("sections"):
                t["sections"] = [
                    {
                        "id": f"{resolved_topic_id}-sec-1",
                        "title": "1. Core Conceptual Overview",
                        "order_index": 1,
                        "content": t.get("conceptExplanation", ""),
                        "code_snippet": t.get("syntax", ""),
                        "pitfalls": t.get("commonMistakes", [{}])[0].get("mistake", "") if t.get("commonMistakes") else ""
                    },
                    {
                        "id": f"{resolved_topic_id}-sec-2",
                        "title": "2. Syntax & Implementation",
                        "order_index": 2,
                        "content": t.get("conceptExplanation", ""),
                        "code_snippet": t.get("codeExample", ""),
                        "pitfalls": t.get("commonMistakes", [{}])[0].get("explanation", "") if t.get("commonMistakes") else ""
                    }
                ]
            if not t.get("content_standard"):
                t["content_standard"] = t.get("conceptExplanation", "")
            return t

        # 5. Check platform_data.json topics
        topics = self.data.get("topics", [])
        for t in topics:
            if t.get("id") == topic_id:
                topic_copy = dict(t)
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

    def get_topic_quiz(self, topic_id: str, force_regenerate: bool = False) -> Dict[str, Any]:
        """Retrieve authoritative 10-question quiz for any lesson via quiz_service."""
        from backend.services.quiz_service import quiz_service
        return quiz_service.get_quiz_for_topic(topic_id, force_regenerate=force_regenerate)


    def get_coding_challenge(self, topic_id: str, language: Optional[str] = "python") -> Dict[str, Any]:
        lang_key = (language or "python").lower()
        if lang_key in ("c++", "cpp"):
            lang_key = "c"

        # 1. Check if C topic has coding challenge
        if topic_id in self.c_topics and self.c_topics[topic_id].get("codingChallenge"):
            cc = self.c_topics[topic_id]["codingChallenge"]
            starter = cc.get("starter_code", "")
            prob_desc = cc.get("problem_statement") or cc.get("description", "Write the program to solve the challenge.")
            return {
                "id": f"code-{topic_id}",
                "topic_id": topic_id,
                "title": cc.get("title", f"Coding Challenge: {self.c_topics[topic_id].get('title', topic_id)}"),
                "difficulty": cc.get("difficulty", "Easy"),
                "problem_statement": prob_desc,
                "description": prob_desc,
                "input_format": cc.get("input_format", "Standard input format."),
                "output_format": cc.get("output_format", "Standard output format."),
                "constraints": cc.get("constraints", "Standard constraints apply."),
                "sample_input": cc.get("test_cases", [{}])[0].get("input", "") if cc.get("test_cases") else "",
                "sample_output": cc.get("test_cases", [{}])[0].get("expected_output", "") if cc.get("test_cases") else "",
                "starter_code": starter,
                "starter_codes": {"c": starter, "python": starter},
                "test_cases": cc.get("test_cases", []),
                "solution": cc.get("solution_code", starter)
            }

        # 2. Check if Python topic has coding challenge
        if topic_id in self.python_topics and self.python_topics[topic_id].get("codingChallenge"):
            cc = self.python_topics[topic_id]["codingChallenge"]
            starter = cc.get("starter_code", "")
            if isinstance(starter, dict):
                selected_sc = starter.get(lang_key) or starter.get("python") or ""
                all_sc = starter
            else:
                selected_sc = str(starter)
                all_sc = {"python": selected_sc, "c": selected_sc, "java": selected_sc}
            prob_desc = cc.get("problem_statement") or cc.get("description", "Write the program to solve the challenge.")
            return {
                "id": f"code-{topic_id}",
                "topic_id": topic_id,
                "title": cc.get("title", f"Coding Challenge: {self.python_topics[topic_id].get('title', topic_id)}"),
                "difficulty": cc.get("difficulty", "Easy"),
                "problem_statement": prob_desc,
                "description": prob_desc,
                "input_format": cc.get("input_format", "Standard input format."),
                "output_format": cc.get("output_format", "Standard output format."),
                "constraints": cc.get("constraints", "Standard constraints apply."),
                "sample_input": cc.get("test_cases", [{}])[0].get("input", "") if cc.get("test_cases") else "",
                "sample_output": cc.get("test_cases", [{}])[0].get("expected_output", "") if cc.get("test_cases") else "",
                "starter_code": selected_sc,
                "starter_codes": all_sc,
                "test_cases": cc.get("test_cases", []),
                "solution": cc.get("solution_code", selected_sc)
            }

        # 3. Check if Java topic has coding challenge
        if topic_id in self.java_topics and self.java_topics[topic_id].get("codingChallenge"):
            cc = self.java_topics[topic_id]["codingChallenge"]
            starter = cc.get("starter_code", "")
            if isinstance(starter, dict):
                selected_sc = starter.get(lang_key) or starter.get("java") or ""
                all_sc = starter
            else:
                selected_sc = str(starter)
                all_sc = {"java": selected_sc, "python": selected_sc, "c": selected_sc}
            prob_desc = cc.get("problem_statement") or cc.get("description", "Write the program to solve the challenge.")
            return {
                "id": f"code-{topic_id}",
                "topic_id": topic_id,
                "title": cc.get("title", f"Coding Challenge: {self.java_topics[topic_id].get('title', topic_id)}"),
                "difficulty": cc.get("difficulty", "Easy"),
                "problem_statement": prob_desc,
                "description": prob_desc,
                "input_format": cc.get("input_format", "Standard input format."),
                "output_format": cc.get("output_format", "Standard output format."),
                "constraints": cc.get("constraints", "Standard constraints apply."),
                "sample_input": cc.get("test_cases", [{}])[0].get("input", "") if cc.get("test_cases") else "",
                "sample_output": cc.get("test_cases", [{}])[0].get("expected_output", "") if cc.get("test_cases") else "",
                "starter_code": selected_sc,
                "starter_codes": all_sc,
                "test_cases": cc.get("test_cases", []),
                "solution": cc.get("solution_code", selected_sc)
            }

        # 4. Check if C++ topic has coding challenge
        cpp_aliases = {
            "top-cpp-fundamentals": "top-cpp-intro",
            "top-cpp-control-functions": "top-cpp-conditional-statements",
            "top-cpp-references-memory": "top-cpp-adv-generic-programming-intro",
            "top-cpp-adv": "top-cpp-adv-generic-programming-intro",
            "top-cpp-adv-intro": "top-cpp-adv-generic-programming-intro",
            "top-cpp-oop": "top-cpp-oop-intro"
        }
        resolved_topic_id = cpp_aliases.get(topic_id, topic_id)
        if resolved_topic_id in self.cpp_topics and self.cpp_topics[resolved_topic_id].get("codingChallenge"):
            cc = self.cpp_topics[resolved_topic_id]["codingChallenge"]
            starter = cc.get("starter_code", "")
            if isinstance(starter, dict):
                selected_sc = starter.get(lang_key) or starter.get("cpp") or ""
                all_sc = starter
            else:
                selected_sc = str(starter)
                all_sc = {"cpp": selected_sc, "c": selected_sc, "python": selected_sc}
            prob_desc = cc.get("problem_statement") or cc.get("description", "Write the program to solve the challenge.")
            return {
                "id": f"code-{resolved_topic_id}",
                "topic_id": resolved_topic_id,
                "title": cc.get("title", f"Coding Challenge: {self.cpp_topics[resolved_topic_id].get('title', resolved_topic_id)}"),
                "difficulty": cc.get("difficulty", "Easy"),
                "problem_statement": prob_desc,
                "description": prob_desc,
                "input_format": cc.get("input_format", "Standard input format."),
                "output_format": cc.get("output_format", "Standard output format."),
                "constraints": cc.get("constraints", "Standard constraints apply."),
                "sample_input": cc.get("test_cases", [{}])[0].get("input", "") if cc.get("test_cases") else "",
                "sample_output": cc.get("test_cases", [{}])[0].get("expected_output", "") if cc.get("test_cases") else "",
                "starter_code": selected_sc,
                "starter_codes": all_sc,
                "test_cases": cc.get("test_cases", []),
                "solution": cc.get("solution_code", selected_sc)
            }

        # 5. Existing logic from platformData
        coding_qs = self.data.get("coding_questions", [])
        challenges = [c for c in coding_qs if c.get("topic_id") == topic_id]
        if not challenges:
            if lang_key == "c" and not topic_id.startswith("top-c-"):
                c_equivalent = topic_id.replace("top-py-", "top-c-")
                challenges = [c for c in coding_qs if c.get("topic_id") == c_equivalent]
            elif lang_key == "python" and not topic_id.startswith("top-py-"):
                py_equivalent = topic_id.replace("top-c-", "top-py-")
                challenges = [c for c in coding_qs if c.get("topic_id") == py_equivalent]
            if not challenges:
                challenges = coding_qs[:1]

        if challenges:
            c = challenges[0]
            raw_sc = c.get("starter_code", {})
            if isinstance(raw_sc, dict):
                selected_sc = raw_sc.get(lang_key) or raw_sc.get("python") or raw_sc.get("c") or ""
                all_sc = raw_sc
            else:
                selected_sc = str(raw_sc)
                all_sc = {"python": selected_sc, "c": selected_sc}

            prob_desc = c.get("problem_statement") or c.get("description", "Solve the challenge.")
            return {
                "id": c.get("id"),
                "topic_id": c.get("topic_id", topic_id),
                "title": c.get("title", "Coding Challenge"),
                "difficulty": c.get("difficulty", "Easy"),
                "problem_statement": prob_desc,
                "description": prob_desc,
                "input_format": c.get("input_format", "Standard input format."),
                "output_format": c.get("output_format", "Standard output format."),
                "constraints": c.get("constraints", "1 <= N <= 10^5"),
                "sample_input": c.get("sample_input", ""),
                "sample_output": c.get("sample_output", ""),
                "starter_code": selected_sc,
                "starter_codes": all_sc,
                "test_cases": c.get("test_cases", []),
                "solution": c.get("solution_code", "") or selected_sc
            }

        # Default starter challenge with complete rich fields
        fallback_desc = "Write a program that reads input and generates the required output."
        return {
            "id": f"code-{topic_id}",
            "topic_id": topic_id,
            "title": "Interactive Programming Exercise",
            "difficulty": "Easy",
            "problem_statement": fallback_desc,
            "description": fallback_desc,
            "input_format": "Standard input as specified.",
            "output_format": "Standard output as specified.",
            "constraints": "Standard execution time limit 5000ms.",
            "sample_input": "10",
            "sample_output": "10",
            "starter_code": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    print(raw)\n" if lang_key != "c" else "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", n);\n    }\n    return 0;\n}\n",
            "starter_codes": {
                "python": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    print(raw)\n",
                "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", n);\n    }\n    return 0;\n}\n"
            },
            "test_cases": [{"input": "10", "expected_output": "10", "is_hidden": False}],
            "solution": ""
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
        lang_key = (language or "python").lower()
        if lang_key in ("c++", "cpp"):
            lang_key = "cpp"

        question_bank: Dict[str, List[Dict[str, Any]]] = {
            "python": [
                {
                    "id": "diag-py-1",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "What is the output of type(5 / 2) in Python 3?",
                    "code_snippet": "result = type(5 / 2)\nprint(result)",
                    "options": ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"],
                    "correct_index": 1,
                    "explanation": "In Python 3, single-slash division (/) always returns a float (2.5), whereas double-slash (//) performs floor division.",
                    "concept": "top-py-fundamentals"
                },
                {
                    "id": "diag-py-2",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "Which of the following built-in data structures is immutable in Python?",
                    "options": ["List", "Dictionary", "Tuple", "Set"],
                    "correct_index": 2,
                    "explanation": "Tuples cannot be altered, appended, or mutated after instantiation, guaranteeing hash stability.",
                    "concept": "top-py-tuples-sets"
                },
                {
                    "id": "diag-py-3",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "What will this code print to stdout?",
                    "code_snippet": "out = []\nfor x in [1, 2, 3, 4]:\n    if x % 2 == 0:\n        continue\n    out.append(x * 10)\nprint(out)",
                    "options": ["[10, 20, 30, 40]", "[10, 30]", "[20, 40]", "[10, 20]"],
                    "correct_index": 1,
                    "explanation": "When x is even (2 and 4), the continue statement skips the rest of the loop block, leaving only 1 and 3 multiplied by 10.",
                    "concept": "top-py-loops"
                },
                {
                    "id": "diag-py-4",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "What is the average time complexity for key lookup in a Python dictionary (Hash Table)?",
                    "options": ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
                    "correct_index": 0,
                    "explanation": "Python dictionaries use hash tables under the hood, yielding O(1) amortized constant time lookups on average.",
                    "concept": "top-py-dictionaries"
                },
                {
                    "id": "diag-py-5",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "Which list comprehension correctly filters all non-negative even integers from a list nums?",
                    "code_snippet": "# nums = [-4, -2, 0, 1, 2, 5, 8]",
                    "options": [
                        "[x for x in nums if x >= 0 and x % 2 == 0]",
                        "[x if x >= 0 else x % 2 == 0 for x in nums]",
                        "[for x in nums if x % 2 == 0 and x >= 0]",
                        "[x % 2 == 0 for x in nums if x >= 0]"
                    ],
                    "correct_index": 0,
                    "explanation": "The standard comprehension syntax is [expr for item in iterable if condition]. Conditionals placed at the end filter items.",
                    "concept": "top-py-lists"
                },
                {
                    "id": "diag-py-6",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "Which keyword transforms a Python function into an iterable generator that yields values lazily?",
                    "code_snippet": "def count_up(n):\n    for i in range(n):\n        ___ i",
                    "options": ["yield", "emit", "return", "generate"],
                    "correct_index": 0,
                    "explanation": "The yield keyword pauses the function execution, returning values one at a time and preserving local state across iterations.",
                    "concept": "top-py-functions"
                }
            ],
            "c": [
                {
                    "id": "diag-c-1",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "What is the size in bytes of any pointer (e.g., int*, char*) on a standard 64-bit operating system?",
                    "options": ["4 bytes", "8 bytes", "16 bytes", "Depends on the data type pointed to"],
                    "correct_index": 1,
                    "explanation": "On a 64-bit architecture, memory addresses are 64 bits wide, meaning all pointers occupy exactly 8 bytes regardless of target type.",
                    "concept": "top-c-pointers"
                },
                {
                    "id": "diag-c-2",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "What is the crucial difference between malloc() and calloc() in standard C?",
                    "options": [
                        "calloc() zero-initializes allocated memory, while malloc() leaves it with indeterminate garbage values",
                        "malloc() allocates on the stack, while calloc() allocates on the heap",
                        "calloc() cannot be freed using free()",
                        "malloc() accepts two parameters, while calloc() accepts only one"
                    ],
                    "correct_index": 0,
                    "explanation": "calloc(num, size) zeroes out all bytes in the allocated block, whereas malloc(total_bytes) performs no zero initialization.",
                    "concept": "top-c-malloc"
                },
                {
                    "id": "diag-c-3",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "What will be the final value of variable 'val' after this code executes?",
                    "code_snippet": "int val = 15;\nint *ptr = &val;\n*ptr = *ptr + 10;\n*ptr *= 2;",
                    "options": ["15", "25", "50", "Segment Fault"],
                    "correct_index": 2,
                    "explanation": "*ptr accesses the memory location of val directly. 15 + 10 = 25; 25 * 2 = 50.",
                    "concept": "top-c-pointers"
                },
                {
                    "id": "diag-c-4",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "How many times does this while loop body execute?",
                    "code_snippet": "int i = 0;\nwhile (i++ < 3) {\n    // do work\n}",
                    "options": ["2 times", "3 times", "4 times", "Infinite loop"],
                    "correct_index": 1,
                    "explanation": "Postfix i++ tests the condition before incrementing: for i=0 (test 0<3, true, i becomes 1), i=1 (test 1<3, true, i becomes 2), i=2 (test 2<3, true, i becomes 3), i=3 (test 3<3, false). Exactly 3 iterations.",
                    "concept": "top-c-loops"
                },
                {
                    "id": "diag-c-5",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "Which code sequence properly frees dynamically allocated memory and defends against dangling pointers?",
                    "options": [
                        "free(ptr); ptr = NULL;",
                        "delete ptr;",
                        "ptr = NULL; free(ptr);",
                        "free(&ptr);"
                    ],
                    "correct_index": 0,
                    "explanation": "Calling free(ptr) releases heap memory back to the allocator, and setting ptr = NULL prevents accidental dangling pointer dereferencing.",
                    "concept": "top-c-pointers"
                },
                {
                    "id": "diag-c-6",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "Which syntax correctly declares a function pointer named 'op' that takes two ints and returns an int?",
                    "options": [
                        "int (*op)(int, int);",
                        "int *op(int, int);",
                        "func<int(int, int)> op;",
                        "(*op)(int, int) -> int;"
                    ],
                    "correct_index": 0,
                    "explanation": "In C, parentheses around (*op) bind the pointer operator to the identifier before the function call operator (), yielding int (*op)(int, int).",
                    "concept": "top-c-functions"
                }
            ],
            "cpp": [
                {
                    "id": "diag-cpp-1",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "In C++, what is the ONLY fundamental difference between a 'class' and a 'struct'?",
                    "options": [
                        "Members and base classes are private by default in class, and public by default in struct",
                        "struct cannot have member functions or constructors",
                        "class objects are allocated on heap, struct on stack",
                        "struct does not support inheritance"
                    ],
                    "correct_index": 0,
                    "explanation": "In C++, struct and class are identical in capability; their only distinction is default member and inheritance visibility (public vs private).",
                    "concept": "top-cpp-fundamentals"
                },
                {
                    "id": "diag-cpp-2",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "What is the core idea of RAII (Resource Acquisition Is Initialization) in modern C++?",
                    "options": [
                        "Tying the lifecycle of resources (heap memory, sockets, locks) to stack object scope and destructors",
                        "Initializing every variable to zero at program launch",
                        "Executing all constructors in parallel threads",
                        "Garbage collecting unused objects automatically"
                    ],
                    "correct_index": 0,
                    "explanation": "RAII ensures resources are acquired in a constructor and deterministically released in the destructor upon exiting scope, preventing leaks.",
                    "concept": "top-cpp-oop"
                },
                {
                    "id": "diag-cpp-3",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "What keyword must you place on a base class member function to enable runtime dynamic polymorphism?",
                    "code_snippet": "class Shape {\npublic:\n    _____ void draw() const;\n};",
                    "options": ["virtual", "override", "dynamic", "polymorphic"],
                    "correct_index": 0,
                    "explanation": "The virtual keyword instructs the C++ compiler to generate a vtable entry for runtime dynamic dispatch.",
                    "concept": "top-cpp-oop"
                },
                {
                    "id": "diag-cpp-4",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "What is the performance advantage of passing large objects as 'const std::string& str' instead of 'std::string str'?",
                    "options": [
                        "Avoids an expensive deep copy of string heap buffers",
                        "Forces the function to run asynchronously",
                        "Compiles the string to raw byte assembly",
                        "Enables multi-threading locking"
                    ],
                    "correct_index": 0,
                    "explanation": "Passing by const reference passes an alias (pointer under the hood), completely avoiding memory allocation and copying overhead.",
                    "concept": "top-cpp-fundamentals"
                },
                {
                    "id": "diag-cpp-5",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "Which C++ smart pointer represents exclusive, zero-overhead ownership of a heap resource?",
                    "options": ["std::unique_ptr", "std::shared_ptr", "std::weak_ptr", "std::auto_ptr"],
                    "correct_index": 0,
                    "explanation": "std::unique_ptr enforces single ownership with move-only semantics and zero memory overhead compared to raw pointers.",
                    "concept": "top-cpp-memory"
                },
                {
                    "id": "diag-cpp-6",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "What does calling std::vector::reserve(100) achieve?",
                    "options": [
                        "Pre-allocates memory capacity for 100 elements without increasing the vector size",
                        "Inserts 100 default-constructed elements into the vector",
                        "Locks the vector so it cannot exceed 100 elements",
                        "Clears the first 100 elements"
                    ],
                    "correct_index": 0,
                    "explanation": "reserve(n) pre-allocates memory capacity to avoid repeated reallocations, leaving size() unchanged until elements are added.",
                    "concept": "top-cpp-containers"
                }
            ],
            "java": [
                {
                    "id": "diag-java-1",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "What is the crucial difference between '==' and '.equals()' when comparing Strings in Java?",
                    "options": [
                        "'==' compares memory reference identity, while '.equals()' compares character contents",
                        "'==' checks case-insensitive content, '.equals()' is case-sensitive",
                        "There is no difference; they behave identically for Strings",
                        "'.equals()' only works with primitive types"
                    ],
                    "correct_index": 0,
                    "explanation": "In Java, == checks if two reference variables point to the exact same memory address. .equals() checks character-by-character semantic equality.",
                    "concept": "top-java-fundamentals"
                },
                {
                    "id": "diag-java-2",
                    "category": "concept",
                    "difficulty_weight": 1.0,
                    "question": "Which access modifier restricts member visibility strictly to the enclosing class?",
                    "options": ["private", "protected", "default (package-private)", "public"],
                    "correct_index": 0,
                    "explanation": "The private modifier ensures that fields, methods, or inner classes are only accessible within the declaring class.",
                    "concept": "top-java-fundamentals"
                },
                {
                    "id": "diag-java-3",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "What happens when code tries to invoke a method on a reference that points to null?",
                    "code_snippet": "String s = null;\nSystem.out.println(s.length());",
                    "options": [
                        "Throws a NullPointerException at runtime",
                        "Prints 0 to stdout",
                        "Fails compilation with a type error",
                        "Prints 'null' safely"
                    ],
                    "correct_index": 0,
                    "explanation": "Attempting to dereference a null pointer throws a java.lang.NullPointerException at runtime.",
                    "concept": "top-java-exceptions"
                },
                {
                    "id": "diag-java-4",
                    "category": "problem_solving",
                    "difficulty_weight": 1.5,
                    "question": "In Java inheritance, which keyword invokes a constructor or method from the immediate parent class?",
                    "options": ["super", "this", "parent", "base"],
                    "correct_index": 0,
                    "explanation": "super() invokes the parent class constructor and super.method() invokes overridden superclass implementations.",
                    "concept": "top-java-oop"
                },
                {
                    "id": "diag-java-5",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "Which Java Collection interface implementation guarantees unique elements and O(1) average lookup?",
                    "options": ["HashSet", "ArrayList", "TreeSet", "LinkedList"],
                    "correct_index": 0,
                    "explanation": "HashSet implements the Set interface using a HashMap under the hood, delivering O(1) amortized add, remove, and contains.",
                    "concept": "top-java-collections"
                },
                {
                    "id": "diag-java-6",
                    "category": "coding_ability",
                    "difficulty_weight": 2.0,
                    "question": "What guarantees the execution of code inside a 'finally' block in a Java try-catch-finally construct?",
                    "options": [
                        "The finally block always executes whether an exception is caught, uncaught, or no exception occurs (unless System.exit() is invoked)",
                        "It only executes if an exception was thrown",
                        "It only executes if no exception was thrown",
                        "It executes in a separate background daemon thread"
                    ],
                    "correct_index": 0,
                    "explanation": "finally blocks are guaranteed to execute during stack unwind, ensuring cleanup of resources like streams and file handles.",
                    "concept": "top-java-exceptions"
                }
            ]
        }

        return question_bank.get(lang_key, question_bank["python"])


curriculum_service = CurriculumService()
