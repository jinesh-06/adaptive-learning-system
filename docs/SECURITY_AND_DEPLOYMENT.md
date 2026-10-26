# Security and Deployment Architecture Specification

**Role:** Member 1 â€” Security and Deployment Engineer
**System:** Adaptive Learning System
**Repository:** `jinesh-06/adaptive-learning-system`
**Branch:** `feature/security-deployment`
**Base:** `feature/full-integration`

---

## 1. Executive Summary

This document specifies the security controls, authentication mechanisms, authorization boundaries, environment secret validation, and production deployment configurations implemented across the Adaptive Learning System. All controls have been implemented in strict accordance with the principle of least privilege, zero-trust token verification, and non-interference with Member 2 (code sandbox), Member 3 (mastery tracking), and Member 4 (learning outcome metrics).

---

## 2. Authentication & Identity Management

### 2.1 Dual Token Architecture & Provenance Neutralization
The system supports two distinct token mechanisms:
1. **Google Firebase ID Tokens**: Used for external identity provider authentication (Google, GitHub, and email/password through Firebase Auth).
2. **Internal HS256 Tokens**: Used for local session authentication issued by the FastAPI backend upon verification or local login.

#### Server-Assigned Provenance
Clients cannot forge token provenance:
- In `AuthService.verify_request()`, the server cryptographically verifies the token and binds `token_type` directly (`"firebase"` or `"internal_hs256"`).
- Any client-supplied claims attempting to spoof `role` or `token_type` are completely ignored.
- PyJWT strictly verifies required claims `exp` and `sub` (`options={"require": ["exp", "sub"]}`).

### 2.2 Firebase ID Token Verification Policy
`AuthService.verify_firebase_id_token()` enforces strict cryptographic verification:
- **Issuer Validation**: Enforces exact match against `https://securetoken.google.com/{FIREBASE_PROJECT_ID}`.
- **Audience Validation**: Enforces match against `FIREBASE_PROJECT_ID`.
- **Subject Validation**: Rejects missing, empty, or whitespace-only `sub`.
- **Timestamp (`auth_time`) Rigor**:
  - Rejects booleans (guarding against Python `isinstance(True, int)` pitfall).
  - Enforces numeric type and finite value (`math.isfinite`, rejecting `NaN`, `+Inf`, `-Inf`).
  - Enforces non-negative values and bounds checking with clock skew (max +10 seconds into the future).
- **Pluggable Verifier Provider**: Production validates against Google's public x509 certificates; in-memory dependency injection enables fully offline unit/integration test isolation.

### 2.3 Safe Account-Linking Rules
`AuthService.link_account()` protects local accounts against unauthorized account takeovers:
- ID provider email must be verified (`email_verified == True`).
- Linking an existing local account strictly requires local password proof (`LOCAL_CREDENTIALS_REQUIRED`).
- Atomic SQL updates guard against concurrent race conditions.

---

## 3. Authorization & Role Security

### 3.1 Role Hierarchy & Privilege Separation
The platform defines two user roles:
- `student`: Standard learner role with access to personal workspace, curriculum, quizzes, coding sandbox, and telemetry.
- `admin`: Elevated platform management role with access to model retraining, RAG reindexing, platform analytics, and system diagnostics.

### 3.2 Registration Escalation Guard
Public registration (`POST /api/auth/register`) strictly assigns the default role `"student"`. Any `role` field present in the registration request body is unconditionally overwritten to `"student"`.

### 3.3 Production Administrator Authorization Matrix
Administrative endpoints (`/api/admin/*`) are defended by `Depends(auth_service.require_admin)`:
- In `production`:
  - Internal HS256 tokens are **unconditionally rejected** with `403 Forbidden`. Admin rights cannot be granted by local JWTs in production.
  - Requires a verified Firebase identity token (`token_type == 'firebase'`).
  - The token must either have the custom claim `admin: True` OR have a verified email matching the explicit `PRODUCTION_ADMIN_EMAILS` allowlist.
- In `development`/`test`:
  - Demo admin access is disabled by default unless explicitly permitted via `ENABLE_DEMO_ADMIN=true`.

### 3.4 Resource Ownership & Personal Workspace Isolation
All user-specific routes (`/api/bookmarks`, `/api/notes`, `/api/learning-history`, `/api/dashboard/*`, `/api/adaptive/*`, `/api/topics/*/quiz/submit`, `/api/code/submit`, etc.) derive user identity solely from verified credentials (`get_current_user_id(request)`).

#### Explicit Ownership Checks:
- **`PUT /api/notes/{note_id}`**:
  - If note does not exist -> `404 Not Found`.
  - If note exists but belongs to another student -> `403 Forbidden`.
  - If note belongs to the authenticated student -> updates successfully (`200 OK`).
- **`DELETE /api/notes/{note_id}`**:
  - If note does not exist -> `404 Not Found`.
  - If note exists but belongs to another student -> `403 Forbidden`.
  - If note belongs to the authenticated student -> deletes successfully (`200 OK`).
- **`DELETE /api/bookmarks/{bookmark_id}`**:
  - If bookmark does not exist -> `404 Not Found`.
  - If bookmark exists but belongs to another student -> `403 Forbidden`.
  - If bookmark belongs to the authenticated student -> deletes successfully (`200 OK`).
- **Query Isolation**: Notes, bookmarks, telemetry, quiz attempts, and learning history queries explicitly filter by `WHERE user_id = ?`, ensuring zero data leakage between students.

---

## 4. Configuration, Secrets, & Environment Validation

### 4.1 Strict Production Startup Security Guard
`validate_production_security()` in `backend/config.py` runs on startup when `ENVIRONMENT == "production"`:
1. **JWT Secret Validation**:
   - `JWT_SECRET` must be non-empty and explicitly set in the environment.
   - Known development placeholders (`cognitive-adaptive-secret-key-2026`, `secret`, `changeme`, etc.) trigger immediate startup abort.
   - Secret length must be at least 32 characters (`len(JWT_SECRET) >= 32`).
2. **CORS Allowlist Validation**:
   - `ALLOWED_ORIGINS` must be explicitly defined.
   - Wildcard origin (`*`) is **strictly forbidden** in production with credentialed requests (`allow_credentials=True`).
3. **Firebase Project ID Validation**:
   - `FIREBASE_PROJECT_ID` must be configured and cannot use dummy placeholders (`your_project_id`).
4. **Production Administrator Email Validation**:
   - `PRODUCTION_ADMIN_EMAILS` must be explicitly configured in the environment with genuine administrator email addresses and cannot use the placeholder `admin@cognitive.edu`.

### 4.2 Frontend vs Backend Secret Separation
- **Backend-Only Secrets**: `JWT_SECRET`, `GEMINI_API_KEY`, database credentials, and service accounts must NEVER be prefixed with `VITE_` or imported in frontend code.
- **Frontend Public Variables**: Only public client configuration (`VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.) may use the `VITE_` prefix, as Vite inlines these into client-side JavaScript.

---

## 5. Deployment Architecture

### 5.1 Backend Deployment (Render)
- **Manifest**: `render.yaml`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `GET /health`
- **Dependencies**: All runtime dependencies (`fastapi`, `uvicorn`, `pyjwt`, `bcrypt`, `google-auth`, `pydantic`, `python-dotenv`, `google-genai`, `chromadb`, `pandas`, `scikit-learn`, `joblib`) are declared in `requirements.txt`.
- **Uvicorn Reload**: In production, `reload` is automatically disabled (`reload=(ENVIRONMENT != "production")`).
- **Admin Configuration**: `PRODUCTION_ADMIN_EMAILS` is configured with `sync: false`, requiring the operator to specify the real administrator email.

### 5.2 Frontend Deployment (Vercel)
- **Manifest**: `vercel.json`
- **Framework**: Vite SPA (`dist`)
- **Routing**: Single-page application rewrites to `/index.html` strictly for non-API client routes (`"source": "/((?!api/).*)"`), preventing silent HTML fallbacks for backend requests.
- **Backend URL Binding**: In production, `VITE_API_URL` must be set in Vercel project environment variables pointing to the Render backend service (e.g. `https://adaptive-learning-backend.onrender.com`).
- **Security Headers Enforced**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 6. Environment Variables Reference

| Variable | Environment | Scope | Required in Prod | Description / Example |
| :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | All | Backend | Yes | `development`, `test`, or `production` |
| `BACKEND_HOST` | All | Backend | No | Server host interface (default `127.0.0.1` or `0.0.0.0`) |
| `BACKEND_PORT` | All | Backend | No | Server port (default `5000`) |
| `JWT_SECRET` | All | Backend | **Yes (min 32 chars)** | Secret key for internal session signing |
| `ALLOWED_ORIGINS` | All | Backend | **Yes (no wildcard)** | Comma-separated trusted URLs (e.g. `https://platform.vercel.app`) |
| `FIREBASE_PROJECT_ID` | All | Backend | Yes | Firebase project ID for ID token validation |
| `PRODUCTION_ADMIN_EMAILS`| Production | Backend | **Yes (explicit)** | Comma-separated admin emails (`admin@institution.edu`) |
| `GEMINI_API_KEY` | All | Backend | Yes (for AI) | Google AI Studio Gemini API key |
| `GEMINI_MODEL` | All | Backend | No | LLM model identifier (default `gemini-2.5-flash`) |
| `VITE_API_URL` | All | Frontend | **Yes** | Base URL pointing to FastAPI backend API root |
| `VITE_FIREBASE_API_KEY` | All | Frontend | Yes | Firebase Web Client API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | All | Frontend | Yes | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | All | Frontend | Yes | Firebase project ID |
