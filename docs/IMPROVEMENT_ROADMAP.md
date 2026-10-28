# Technical Improvement Roadmap & Target Architecture
## Cognitive Load-Aware Adaptive Learning Engine

> **Document Type:** Prioritized Engineering Roadmap & Architectural Specification
> **Repository:** `jinesh-06/adaptive-learning-system`
> **Complementary Documents:** `docs/PROJECT_REVIEW.md`, `docs/FEATURE_INVENTORY.md`

---

## 1. Overview & Roadmap Philosophy

This document translates the findings of the comprehensive technical audit into a concrete, phased engineering roadmap.

The primary objective is to transition the platform from an **AI-Assisted Educational Platform with Heuristic/ML Adaptation** to a true **Closed-Loop Cognitive-Load-Aware Adaptive Learning Engine** while eliminating critical security vulnerabilities, repairing broken API contracts, and establishing genuine student topic-mastery modeling.

---

## 2. Phase 1: Essential Fixes & Security Hardening (Priority 1)

**Target Completion:** Immediate Sprint
**Goal:** Fix confirmed bugs, repair broken contracts, secure user credentials, and sandbox untrusted code execution.

### Task 1.1: Fix Learner Dashboard Analytics Contract Mismatch & Hardcoding
- **Problem:** `/api/dashboard/snapshot` returns hardcoded numbers and flat keys, while `src/pages/LearnerDashboardPage.tsx` expects nested object `snapshot.learning_snapshot`, causing the dashboard to always display static client fallback data.
- **Action Items:**
  1. Refactor `get_dashboard_snapshot()` in `backend/routes/stats_routes.py`.
  2. Query `backend/services/state_store.py` for actual counts:
     - `SELECT COUNT(DISTINCT topic_id) FROM user_progress WHERE user_id = ? AND status = 'COMPLETED'`
     - `SELECT AVG(score) FROM quiz_attempts WHERE user_id = ?`
     - `SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ?`
  3. Structure the JSON response to include `learning_snapshot` matching the TypeScript interface in `src/pages/LearnerDashboardPage.tsx`.

### Task 1.2: Fix Diagnostic Cognitive Load Key Bug
- **Problem:** In `backend/routes/diagnostic_routes.py` (line 110), the code looks up `ml_eval.get("predicted_cognitive_load", "MEDIUM")`, but `ml_service.evaluate()` returns keys `"cognitive_load"` and `"cognitive_level"`. As a result, all diagnostic evaluations default to `"MEDIUM"`.
- **Action Items:**
  1. Update line 110 in `backend/routes/diagnostic_routes.py` to:
     ```python
     predicted_load = ml_eval.get("cognitive_load") or ml_eval.get("cognitive_level", "MEDIUM")
     ```
  2. Verify that `diagnostic_result["cognitive_load"]` correctly propagates the ML prediction.

### Task 1.3: Remediate Plaintext Passwords & Cryptographic Secret Defaults
- **Problem:** Passwords are saved in plain text in `users.password_hash`. `JWT_SECRET` defaults to `"cognitive-adaptive-secret-key-2026"` in source code.
- **Action Items:**
  1. Add `passlib[bcrypt]` or `bcrypt` to `requirements.txt`.
  2. Hash passwords with bcrypt upon registration and verify during login.
  3. Enforce that `JWT_SECRET` must be set via environment variable; fail fast or warn in production if default is detected.

### Task 1.4: Cryptographically Verify Firebase ID Tokens
- **Problem:** `backend/routes/auth_routes.py` decodes Firebase tokens with `options={"verify_signature": False}`, allowing arbitrary user identity spoofing.
- **Action Items:**
  1. Use `firebase-admin` (already in `requirements.txt`) with `auth.verify_id_token(token)`.
  2. Alternatively, verify JWT signatures using PyJWT against Google's public JWKS endpoint (`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`).

### Task 1.5: Isolate Code Sandbox Execution
- **Problem:** User-submitted Python and Java code executes directly on the host operating system under the active user's OS privileges. AST checks are bypassable.
- **Action Items:**
  1. Integrate Docker or gVisor for sandbox execution:
     ```bash
     docker run --rm --network none --memory 256m --cpus 1.0 -v /tmp/code:/app alpine-runner python3 /app/solution.py
     ```
  2. Apply execution timeouts (5s max) and non-root execution.
  3. Alternatively, connect to an established isolated runner like Piston or Judge0.

### Task 1.6: Harmonize Root Dependencies
- **Problem:** Root `requirements.txt` lacks `sentence-transformers`, `torch`, and `tqdm`, which exist only in `rag/requirements.txt`.
- **Action Items:**
  1. Merge `sentence-transformers>=2.2.0`, `torch>=2.0.0`, and `tqdm>=4.65.0` into root `requirements.txt`.

---

## 3. Phase 2: Valuable Architectural Enhancements (Priority 2)

**Target Completion:** Next Milestone
**Goal:** Replace fragile transpilers, model student-specific topic difficulty, build prerequisite gap detection, and implement real project grading.

### Task 2.1: Student-Specific Topic Difficulty & Weakness Profiler
- **Problem:** The platform records topic progress as boolean/percentage, but does not model individual concept difficulty across sessions.
- **Action Items:**
  1. Create SQLite table `student_topic_mastery`:
     ```sql
     CREATE TABLE student_topic_mastery (
         user_id TEXT,
         topic_id TEXT,
         mastery_score REAL,
         difficulty_level REAL,
         attempts_count INTEGER,
         last_cognitive_load TEXT,
         updated_at TIMESTAMP,
         PRIMARY KEY (user_id, topic_id)
     );
     ```
  2. Implement Elo or Bayesian Knowledge Tracing (BKT) to update student concept mastery after each quiz and coding challenge attempt.

### Task 2.2: Prerequisite Knowledge-Gap Engine
- **Problem:** Stated prerequisites in textbook headers are static text; the system does not detect underlying prerequisite knowledge gaps when a student struggles.
- **Action Items:**
  1. Define a DAG (Directed Acyclic Graph) of curriculum topics in JSON:
     ```json
     {
       "top-py-recursion": ["top-py-functions", "top-py-conditionals"],
       "top-c-pointers": ["top-c-variables", "top-c-memory-model"]
     }
     ```
  2. When a student registers `HIGH` cognitive load or fails a quiz on a topic, traverse incoming edges in the DAG.
  3. Check `student_topic_mastery` for each prerequisite. If mastery < 70%, generate a recommendation: *"Recommendation: Review Functions before continuing Recursion"*.

### Task 2.3: Replace C/C++ Regex Transpiler with Genuine Clang/GCC Toolchain
- **Problem:** Regex string replacement in `backend/services/code_executor.py` fails on real-world C/C++ code.
- **Action Items:**
  1. Replace `transpile_c_to_python` with GCC or Clang compilation inside the container sandbox:
     ```bash
     clang -O2 -Wall -std=c11 solution.c -o solution.out && ./solution.out
     ```
  2. Parse native compiler error messages directly into frontend compilation error banners.

### Task 2.4: Real Automated Project Hub Rubric Evaluation
- **Problem:** `/api/projects/{id}/submit` returns a hardcoded score of 92 and static distinction rubric without testing project code.
- **Action Items:**
  1. Define automated test suites and linters for each project in `CurriculumService`.
  2. Run project submissions through:
     - Functional test cases (Unit tests / integration tests: 40% weight).
     - Static code analysis (Flake8 / Clang-Tidy: 30% weight).
     - Execution efficiency and memory profiling (30% weight).
  3. Output dynamic rubric breakdown based on actual test results.

---

## 4. Phase 3: Advanced Research & Pedagogical Capabilities (Priority 3)

**Target Completion:** Research & Scale Phase
**Goal:** Measure learning gains, decouple cognitive load from raw performance, and schedule longitudinal re-training.

### Task 3.1: Before-and-After Adaptation Learning Gain Evaluation
- **Problem:** The platform does not track whether an adapted explanation actually helped the student master the concept.
- **Action Items:**
  1. Embed a 3-question diagnostic knowledge check in the standard lesson, and an isomorphic 3-question check in the adapted lesson.
  2. Compute normalized learning gain $g$:
     $$g = \frac{\text{Post-test} - \text{Pre-test}}{100 - \text{Pre-test}}$$
  3. Record learning gain in `adaptive_history`. If $g > 0.5$, tag adaptation strategy as successful for that cognitive profile.

### Task 3.2: Decouple Cognitive Load from Raw Performance via Paas Formula
- **Problem:** Random Forest currently treats low quiz accuracy as `HIGH` cognitive load, failing to distinguish productive challenge (germane load) from disorientation (extraneous load).
- **Action Items:**
  1. Add a 1-click self-reported mental effort prompt (1 to 9 Paas scale: *"How much mental effort did this topic require?"*) upon lesson completion.
  2. Compute Paas Cognitive Efficiency:
     $$E = \frac{Z_P - Z_R}{\sqrt{2}}$$
     where $Z_P$ is standardized performance and $Z_R$ is standardized mental effort.
  3. Positive efficiency ($E > 0$) indicates high mastery with low effort (low load). Negative efficiency ($E < 0$) indicates low mastery despite high effort (high extraneous load, requiring simplification).

### Task 3.3: Automated Longitudinal Retraining Pipeline
- **Problem:** Random Forest model remains static unless manually retrained via administrative command line.
- **Action Items:**
  1. Aggregate real interaction telemetry from `telemetry_events` and verified learning gains into a weekly training batch.
  2. Train candidate Random Forest and Gradient Boosted models.
  3. Validate against a held-out test set; automatically promote to production only if F1-score surpasses active model threshold.

---

## 5. Summary Roadmap Matrix

| Milestone | Task | Complexity | Impact | Primary Affected Subsystems |
|---|---|:---:|:---:|---|
| **Phase 1** | Dashboard Snapshot Dynamic Aggregation | Low | **Critical** | `stats_routes.py`, `LearnerDashboardPage.tsx` |
| **Phase 1** | Fix Diagnostic Load Key Bug | Low | **High** | `diagnostic_routes.py` |
| **Phase 1** | Bcrypt Password Hashing & Secret Enforcement | Low | **Critical** | `auth_routes.py`, `requirements.txt` |
| **Phase 1** | Verify Firebase Token JWKS Signatures | Medium | **Critical** | `auth_routes.py` |
| **Phase 1** | Containerized Code Sandbox (Docker) | High | **Critical** | `code_executor.py` |
| **Phase 1** | Root Requirements Dependency Harmonization | Low | **High** | `requirements.txt` |
| **Phase 2** | Student Topic-Difficulty & Mastery Tracking | Medium | **High** | `state_store.py`, `ml_service.py` |
| **Phase 2** | Prerequisite Knowledge-Gap DAG Engine | Medium | **High** | `curriculum_service.py`, `adapted_lesson_service.py` |
| **Phase 2** | Native Clang/GCC Compiler Sandbox | Medium | **High** | `code_executor.py` |
| **Phase 2** | Real Automated Project Hub Rubric Grading | Medium | **Medium** | `project_routes.py`, `curriculum_service.py` |
| **Phase 3** | Before-and-After Learning Gain Evaluation | High | **High** | `adapted_lesson_service.py`, `quiz_service.py` |
| **Phase 3** | Paas Mental Effort & Cognitive Decoupling | Medium | **High** | `ml_service.py`, `CognitiveContext.tsx` |
| **Phase 3** | Automated Longitudinal Model Retraining | High | **Medium** | `admin_routes.py`, `ml/cognitive_load.py` |
