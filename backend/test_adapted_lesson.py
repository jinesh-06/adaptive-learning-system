"""Integration tests for AI-Generated Personalized Adapted Lesson feature."""

import os
import sys
import tempfile
from pathlib import Path

# Establish isolated database environment BEFORE any backend imports
_TEST_TEMP_DIR = tempfile.TemporaryDirectory()
_DISPOSABLE_DB = Path(_TEST_TEMP_DIR.name) / "test_adapted_lesson.db"
os.environ["ADAPTIVE_LEARNING_DB_PATH"] = str(_DISPOSABLE_DB)
os.environ["ENVIRONMENT"] = "test"

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.adapted_lesson_service import adapted_lesson_service
from backend.services.rag_service import rag_service
from backend.services.state_store import state_store
from backend.services.auth_service import auth_service, set_firebase_verifier_for_testing

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolate_external_dependencies():
    """Ensure tests run deterministically and fast without external network dependencies."""
    def _mock_firebase_verifier(token: str):
        raise ValueError("Offline test mode: token is not a Firebase token")

    set_firebase_verifier_for_testing(_mock_firebase_verifier)
    with patch.object(adapted_lesson_service, "_generate_with_gemini", return_value=None), \
         patch.object(rag_service, "get_formatted_context", return_value="Sample curriculum context for tests."):
        yield
    set_firebase_verifier_for_testing(None)


def _auth_headers(user_id: str) -> dict:
    """Generate authenticated Bearer token headers for test user."""
    token = auth_service.create_internal_token(user_id=user_id, email=f"{user_id}@cognitive.edu")
    return {"Authorization": f"Bearer {token}"}


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
    response = client.post("/api/lessons/adapt", json=payload, headers=_auth_headers("test-learner-1"))
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
    response = client.post("/api/lessons/adapt", json=payload, headers=_auth_headers("test-learner-1"))
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
    r1 = client.post("/api/lessons/adapt", json=p1, headers=_auth_headers("user-struggling"))
    assert r1.status_code == 200
    lesson1 = r1.json()["lesson"]

    # User 2: Low cognitive load signals
    p2 = {
        "topic_id": "top-py-control-flow",
        "detail_level": "DETAILED",
        "force_refresh": True,
        "signals": {"recentQuizAccuracy": 100.0, "codingErrorCount": 0}
    }
    r2 = client.post("/api/lessons/adapt", json=p2, headers=_auth_headers("user-advanced"))
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
    response = client.post("/api/lessons/adapt", json=payload, headers=_auth_headers("brand-new-user-999"))
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["lesson"]["subject"] == "c"
    assert len(data["lesson"]["sections"]) >= 4


def test_get_cached_adapted_lesson():
    """Test retrieving cached lesson via GET /api/lessons/adapt/{topic_id}."""
    # Ensure lesson is cached
    client.post("/api/lessons/adapt", json={"topic_id": "top-py-fundamentals", "detail_level": "STANDARD"}, headers=_auth_headers("cache-tester"))
    
    response = client.get("/api/lessons/adapt/top-py-fundamentals?detail_level=STANDARD", headers=_auth_headers("cache-tester"))
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
    response = client.post("/api/lessons/adapt/feedback", json=payload, headers=_auth_headers("feedback-tester"))
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
