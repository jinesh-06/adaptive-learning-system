"""Comprehensive test script validating Python 3 execution and RAG AI Tutor 8 modes."""

import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:5000/api"


def make_post(endpoint: str, payload: dict) -> dict:
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def test_python3_execution():
    print("\n" + "=" * 60)
    print("TEST 1: Python 3 Code Execution")
    print("=" * 60)

    # 1. Hello, Python
    r1 = make_post("/code/run", {"code": 'print("Hello, Python")', "language": "python"})
    print("1. print('Hello, Python'):")
    print(f"   Success: {r1.get('success')}, Status: {r1.get('status')}")
    print(f"   Stdout: {repr(r1.get('stdout'))}")
    assert r1.get("success") is True
    assert "Hello, Python" in r1.get("stdout")

    # 2. Hello, Python 3
    r2 = make_post("/code/run", {"code": 'print("Hello, Python 3")', "language": "python"})
    print("2. print('Hello, Python 3'):")
    print(f"   Success: {r2.get('success')}, Status: {r2.get('status')}")
    print(f"   Stdout: {repr(r2.get('stdout'))}")
    assert r2.get("success") is True
    assert "Hello, Python 3" in r2.get("stdout")

    # 3. Dynamic typing & object id in Python 3
    r3 = make_post("/code/run", {
        "code": 'x = 42\nprint(f"Type: {type(x).__name__}, ID: {type(id(x)).__name__}")',
        "language": "python"
    })
    print("3. Python 3 Typing & ID:")
    print(f"   Stdout: {repr(r3.get('stdout'))}")
    assert r3.get("success") is True
    assert "int" in r3.get("stdout")

    # 4. Security Sandbox check
    r4 = make_post("/code/run", {"code": "import os", "language": "python"})
    print("4. Security Check (import os):")
    print(f"   Success: {r4.get('success')}, Error: {r4.get('stderr') or r4.get('compilation_error')}")
    assert r4.get("success") is False
    assert "SecurityError" in (r4.get("stderr") or r4.get("compilation_error") or "")

    print("\n>>> ALL PYTHON 3 EXECUTION TESTS PASSED! <<<")


def test_rag_retrieval_and_8_tutor_modes():
    print("\n" + "=" * 60)
    print("TEST 2: RAG Retrieval & In-Lesson AI Tutor (8 Modes)")
    print("=" * 60)

    lesson_data = {
        "topic": "Language Fundamentals, Datatypes & Immutability",
        "topic_id": "top-py-fundamentals",
        "section_id": "sec-py-fund-1",
        "section_title": "1. Python 3 Architecture & Standard Runtime",
        "section_content": "Python 3 is the modern standard for Python development, executed by the reference CPython 3 interpreter. Guido Van Rossum designed Python with clear syntax, automatic memory management via the Python Virtual Machine (PVM), and rich standard libraries.",
        "language": "python",
        "cognitive_load": "MEDIUM"
    }

    modes = [
        ("EXPLAIN", "Explain this", "Explain 1. Python 3 Architecture & Standard Runtime in detail"),
        ("SIMPLIFY", "Make it simpler", "Simplify Python 3 Architecture with a real-world analogy"),
        ("EXAMPLE", "Give an example", "Provide a minimal Python 3 code example of object identity and types"),
        ("DEBUG", "Why is this wrong?", "What common bugs occur with immutability and variables?"),
        ("HINT", "Show a hint", "Give me a hint on understanding object interning"),
        ("QUIZ", "Quiz me", "Ask me a practice question on Python 3 fundamentals"),
        ("REVISE", "Summarize", "Summarize key takeaways for Python 3 architecture"),
        ("ADVANCED", "Advanced deep dive", "Give an advanced technical breakdown of CPython internals"),
    ]

    for mode, label, question in modes:
        print(f"\n--- Testing Mode [{mode}]: '{label}' ---")
        payload = {
            **lesson_data,
            "tutor_mode": mode,
            "question": question
        }
        res = make_post("/ai/ask", payload)
        answer = res.get("answer", "")
        source = res.get("source", "")
        context = res.get("retrieved_context", "")

        print(f"Source: {source}")
        print(f"RAG Context Provided: {'Yes (' + str(len(context)) + ' chars)' if context and 'No relevant context' not in context else 'NO/EMPTY'}")
        clean_preview = answer[:200].encode("ascii", "replace").decode("ascii")
        print(f"Answer Preview (first 200 chars):\n{clean_preview}...")

        # Strict Assertions:
        assert "No relevant context found in knowledge base." not in answer, f"Mode {mode} returned 'No relevant context found'!"
        assert "No relevant context found in knowledge base." not in context, f"Mode {mode} RAG context is empty!"
        assert len(answer) > 50, f"Mode {mode} answer is too short!"
        assert res.get("success") is True

    print("\n>>> ALL 8 AI TUTOR MODES PASSED WITH LESSON CONTEXT GROUNDING! <<<")


def test_quiz_station_flow():
    print("\n" + "=" * 60)
    print("TEST 3: Quiz Station Contract & Data Flow Verification")
    print("=" * 60)

    # 1. Fetch Quiz for topic
    quiz_url = f"{BASE_URL}/topics/top-py-fundamentals/quiz"
    req = urllib.request.Request(quiz_url)
    with urllib.request.urlopen(req) as resp:
        quiz_data = json.loads(resp.read().decode("utf-8"))

    print("1. GET /topics/top-py-fundamentals/quiz:")
    assert "questions" in quiz_data, "Quiz data missing 'questions' key"
    questions = quiz_data["questions"]
    assert isinstance(questions, list), "'questions' must be a list"
    assert len(questions) > 0, "No questions returned for top-py-fundamentals"
    print(f"   Questions loaded: {len(questions)}")

    for idx, q in enumerate(questions):
        assert "id" in q, f"Question {idx} missing 'id'"
        assert "question" in q, f"Question {idx} missing 'question'"
        assert "options" in q, f"Question {idx} missing 'options'"
        assert isinstance(q["options"], list), f"Question {idx} options must be a list"
        assert len(q["options"]) >= 2, f"Question {idx} has fewer than 2 options"
        assert "correct_index" in q, f"Question {idx} missing 'correct_index'"
    print("   All questions and options validated successfully.")

    # 2. Submit Quiz Answers
    selected_answers = {
        str(questions[0]["id"]): questions[0]["correct_index"],
        str(questions[1]["id"]): questions[1]["correct_index"],
    }
    submit_payload = {
        "answers": selected_answers,
        "time_spent": 45.0
    }
    sub_res = make_post("/topics/top-py-fundamentals/quiz/submit", submit_payload)

    print("2. POST /topics/top-py-fundamentals/quiz/submit:")
    print(f"   Score: {sub_res.get('score')}%, Passed: {sub_res.get('passed')}")
    print(f"   Correct Count: {sub_res.get('correct_count')}/{sub_res.get('total_questions')}")

    # Verify all fields expected by QuizStationPage (which previously threw .map of undefined)
    assert "review" in sub_res, "Submit response must contain 'review' for QuizStationPage.tsx line 295"
    assert isinstance(sub_res["review"], list), "'review' must be a list"
    assert len(sub_res["review"]) == len(questions), "'review' length must match total questions"

    for idx, rev_item in enumerate(sub_res["review"]):
        assert "id" in rev_item, f"Review item {idx} missing 'id'"
        assert "question" in rev_item, f"Review item {idx} missing 'question'"
        assert "options" in rev_item, f"Review item {idx} missing 'options'"
        assert isinstance(rev_item["options"], list), f"Review item {idx} options must be list"
        assert "is_correct" in rev_item, f"Review item {idx} missing 'is_correct'"
        assert "user_choice" in rev_item, f"Review item {idx} missing 'user_choice'"

    # Simulate exact QuizStationPage evaluation
    display_questions = (sub_res.get("review") if (sub_res and isinstance(sub_res.get("review"), list) and len(sub_res.get("review")) > 0) else questions)
    mapped_count = 0
    for q in display_questions:
        options = q.get("options", [])
        for opt in options:
            mapped_count += 1

    print(f"   Simulated frontend mapping: {mapped_count} total options rendered across {len(display_questions)} review questions.")
    assert mapped_count > 0, "Simulation failed to map options"

    print("\n>>> ALL QUIZ STATION DATA FLOW TESTS PASSED! <<<")


if __name__ == "__main__":
    test_python3_execution()
    test_rag_retrieval_and_8_tutor_modes()
    test_quiz_station_flow()
