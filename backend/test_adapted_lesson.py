"""Integration tests for AI-Generated Personalized Adapted Lesson feature."""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.adapted_lesson_service import adapted_lesson_service
from backend.services.state_store import state_store

client = TestClient(app)


def test_adapt_lesson_endpoint_simplified():
    """Test POST /api/lessons/adapt with SIMPLIFIED detail level."""
    payload = {
        "topic_id": "top-py-fundamentals",
        "detail_level": "SIMPLIFIED",
        "force_refresh": True,
        "signals": {
            "recentQuizAccuracy": 40.0,
            "codingErrorCount": 3,
            "timeSpentSeconds": 240.0
        }
    }
    response = client.post("/api/lessons/adapt", json=payload, headers={"X-User-Id": "test-learner-1"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "lesson" in data
    lesson = data["lesson"]
    assert lesson["topic_id"] == "top-py-fundamentals"
    assert lesson["adaptation"]["detail_level"] == "simplified"
    assert lesson["adaptation"]["strategy"] == "guided_step_by_step"
    assert len(lesson["sections"]) > 0

    # Verify section types include explanation, analogy, code_example, quiz
    section_types = [s["type"] for s in lesson["sections"]]
    assert "explanation" in section_types
    assert "code_example" in section_types


def test_adapt_lesson_endpoint_detailed():
    """Test that switching to DETAILED generates different strategy and content."""
    payload = {
        "topic_id": "top-py-fundamentals",
        "detail_level": "DETAILED",
        "force_refresh": True,
        "signals": {
            "recentQuizAccuracy": 95.0,
            "codingErrorCount": 0,
            "timeSpentSeconds": 60.0
        }
    }
    response = client.post("/api/lessons/adapt", json=payload, headers={"X-User-Id": "test-learner-1"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    lesson = data["lesson"]
    assert lesson["adaptation"]["detail_level"] == "detailed"
    assert lesson["adaptation"]["strategy"] == "deep_conceptual_dive"


def test_two_users_independent_personalization():
    """Test scenario 1: Two users opening the same topic receive independent context & adaptation."""
    # User 1: High cognitive load signals
    p1 = {
        "topic_id": "top-py-control-flow",
        "detail_level": "SIMPLIFIED",
        "force_refresh": True,
        "signals": {"recentQuizAccuracy": 35.0, "codingErrorCount": 4}
    }
    r1 = client.post("/api/lessons/adapt", json=p1, headers={"X-User-Id": "user-struggling"})
    assert r1.status_code == 200
    lesson1 = r1.json()["lesson"]

    # User 2: Low cognitive load signals
    p2 = {
        "topic_id": "top-py-control-flow",
        "detail_level": "DETAILED",
        "force_refresh": True,
        "signals": {"recentQuizAccuracy": 100.0, "codingErrorCount": 0}
    }
    r2 = client.post("/api/lessons/adapt", json=p2, headers={"X-User-Id": "user-advanced"})
    assert r2.status_code == 200
    lesson2 = r2.json()["lesson"]

    assert lesson1["adaptation"]["detail_level"] == "simplified"
    assert lesson2["adaptation"]["detail_level"] == "detailed"
    assert lesson1["adaptation"]["strategy"] != lesson2["adaptation"]["strategy"]


def test_missing_history_does_not_break_generation():
    """Test scenario 3: Brand new user with zero prior signals still gets a valid lesson."""
    payload = {
        "topic_id": "top-c-intro",
        "detail_level": "STANDARD",
        "force_refresh": True
    }
    response = client.post("/api/lessons/adapt", json=payload, headers={"X-User-Id": "brand-new-user-999"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["lesson"]["subject"] == "c"
    assert len(data["lesson"]["sections"]) >= 4


def test_get_cached_adapted_lesson():
    """Test retrieving cached lesson via GET /api/lessons/adapt/{topic_id}."""
    # Ensure lesson is cached
    client.post("/api/lessons/adapt", json={"topic_id": "top-py-fundamentals", "detail_level": "STANDARD"}, headers={"X-User-Id": "cache-tester"})
    
    response = client.get("/api/lessons/adapt/top-py-fundamentals?detail_level=STANDARD", headers={"X-User-Id": "cache-tester"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["topic_id"] == "top-py-fundamentals"


def test_adaptation_feedback_endpoint():
    """Test submitting feedback via POST /api/lessons/adapt/feedback."""
    payload = {
        "topic_id": "top-py-fundamentals",
        "detail_level": "SIMPLIFIED",
        "helpful": True,
        "rating": "just_right",
        "comment": "The analogy made memory labels crystal clear!",
        "completed_practice": True
    }
    response = client.post("/api/lessons/adapt/feedback", json=payload, headers={"X-User-Id": "feedback-tester"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
