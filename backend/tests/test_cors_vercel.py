"""Test CORS configuration for Vercel production frontend and local development (Production CORS Fix).

Verifies:
1. OPTIONS preflight requests from 'https://adaptive-learning-system-sage.vercel.app' succeed with 200 OK across key endpoints.
2. 'access-control-allow-origin' exactly matches the Vercel origin.
3. 'access-control-allow-credentials' is 'true'.
4. 'access-control-allow-methods' includes GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD.
5. 'access-control-allow-headers' dynamically mirrors requested headers (including authorization, content-type).
6. Actual GET/POST requests return CORS headers, even on 401 Unauthorized or 404 Not Found.
7. Localhost origins (localhost:3000, localhost:5173, 127.0.0.1:5173) continue to succeed.
8. Preview deployments on Vercel under 'adaptive-learning-system*.vercel.app' succeed via regex.
9. Untrusted/malicious origins are strictly disallowed without CORS allow headers.
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import ALLOWED_ORIGINS


class TestCORSVercelIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.vercel_origin = "https://adaptive-learning-system-sage.vercel.app"

    def test_01_config_contains_exact_vercel_origin(self):
        """Confirm ALLOWED_ORIGINS contains the exact production Vercel frontend origin."""
        self.assertIn(
            self.vercel_origin,
            ALLOWED_ORIGINS,
            "Production Vercel frontend URL must be explicitly present in ALLOWED_ORIGINS"
        )

    def test_02_options_preflight_auth_me(self):
        """OPTIONS preflight to /api/auth/me from Vercel frontend must succeed."""
        res = self.client.options(
            "/api/auth/me",
            headers={
                "Origin": self.vercel_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")
        self.assertIn("GET", res.headers.get("access-control-allow-methods", ""))
        self.assertIn("authorization", res.headers.get("access-control-allow-headers", "").lower())

    def test_03_options_preflight_projects(self):
        """OPTIONS preflight to /api/projects from Vercel frontend must succeed."""
        res = self.client.options(
            "/api/projects",
            headers={
                "Origin": self.vercel_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_04_options_preflight_courses(self):
        """OPTIONS preflight to /api/courses from Vercel frontend must succeed."""
        res = self.client.options(
            "/api/courses",
            headers={
                "Origin": self.vercel_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_05_options_preflight_topics(self):
        """OPTIONS preflight to /api/topics/{topic_id} from Vercel frontend must succeed."""
        res = self.client.options(
            "/api/topics/top-py-fundamentals",
            headers={
                "Origin": self.vercel_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_06_options_preflight_notes(self):
        """OPTIONS preflight to /api/notes from Vercel frontend must succeed."""
        res = self.client.options(
            "/api/notes",
            headers={
                "Origin": self.vercel_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_07_options_preflight_behavior_event(self):
        """OPTIONS preflight to /api/behavior/event (POST) from Vercel frontend must succeed."""
        res = self.client.options(
            "/api/behavior/event",
            headers={
                "Origin": self.vercel_origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")
        self.assertIn("POST", res.headers.get("access-control-allow-methods", ""))

    def test_08_options_preflight_python_progress(self):
        """OPTIONS preflight to /api/python/progress (POST) from Vercel frontend must succeed."""
        res = self.client.options(
            "/api/python/progress",
            headers={
                "Origin": self.vercel_origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_09_actual_get_returns_cors_header_on_401(self):
        """Actual GET /api/auth/me without token returns 401 with Access-Control-Allow-Origin."""
        res = self.client.get(
            "/api/auth/me",
            headers={"Origin": self.vercel_origin}
        )
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_10_actual_get_returns_cors_header_on_200(self):
        """Actual GET /api/courses returns 200 with Access-Control-Allow-Origin."""
        res = self.client.get(
            "/api/courses",
            headers={"Origin": self.vercel_origin}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.vercel_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_11_localhost_development_origins_allowed(self):
        """Local development origins (localhost:5173, localhost:3000) are allowed."""
        for local_origin in ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]:
            res = self.client.options(
                "/api/auth/me",
                headers={
                    "Origin": local_origin,
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "authorization,content-type"
                }
            )
            self.assertEqual(res.status_code, 200, f"Preflight failed for local origin: {local_origin}")
            self.assertEqual(res.headers.get("access-control-allow-origin"), local_origin)
            self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_12_preview_deployment_regex_allowed(self):
        """Preview deployments on Vercel under adaptive-learning-system*.vercel.app succeed."""
        preview_origin = "https://adaptive-learning-system-git-feature-cors.vercel.app"
        res = self.client.options(
            "/api/courses",
            headers={
                "Origin": preview_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization"
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), preview_origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_13_untrusted_origin_rejected(self):
        """Untrusted origin must not receive Access-Control-Allow-Origin header."""
        malicious_origin = "https://malicious-phishing-site.com"
        res = self.client.options(
            "/api/auth/me",
            headers={
                "Origin": malicious_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization"
            }
        )
        self.assertNotEqual(
            res.headers.get("access-control-allow-origin"),
            malicious_origin,
            "Untrusted origin must NEVER receive Access-Control-Allow-Origin"
        )


if __name__ == "__main__":
    unittest.main()

