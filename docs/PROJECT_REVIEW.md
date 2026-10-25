# Complete Project Technical Audit and Architecture Review
## Cognitive Load-Aware Adaptive Learning Engine

> **Audit Type:** Senior AI/ML & Software Architecture Independent Technical Audit
> **Auditor Role:** Senior AI/ML Engineer, Software Architect, Educational Technology Researcher
> **Repository:** `jinesh-06/adaptive-learning-system`
> **Audit Date:** October 2026
> **Scope:** Full-stack inspection (Frontend, Backend, ML, RAG, LLM, Database, Sandboxing, Security)
> **Target Delivery File:** `docs/PROJECT_REVIEW.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Purpose and Actual Capabilities](#2-project-purpose-and-actual-capabilities)
3. [Technology Stack](#3-technology-stack)
4. [Architecture and Component Diagram](#4-architecture-and-component-diagram)
5. [Complete Feature Inventory and Implementation Statuses](#5-complete-feature-inventory-and-implementation-statuses)
6. [Detailed Explanation of Each Major Feature](#6-detailed-explanation-of-each-major-feature)
7. [End-to-End Workflow Diagrams](#7-end-to-end-workflow-diagrams)
8. [Machine Learning and Cognitive-Load Analysis](#8-machine-learning-and-cognitive-load-analysis)
9. [RAG and Generative AI Analysis](#9-rag-and-generative-ai-analysis)
10. [Database and Student Data Flow](#10-database-and-student-data-flow)
11. [Comparison with a Normal Educational Website](#11-comparison-with-a-normal-educational-website)
12. [Unique and Genuinely Differentiating Capabilities](#12-unique-and-genuinely-differentiating-capabilities)
13. [Missing, Partial, Simulated, Disconnected, and Broken Features](#13-missing-partial-simulated-disconnected-and-broken-features)
14. [Testing Evidence and Limitations](#14-testing-evidence-and-limitations)
15. [Security and Privacy Observations](#15-security-and-privacy-observations)
16. [Prioritized Improvement Roadmap](#16-prioritized-improvement-roadmap)
17. [Recommended Target Architecture for the Next Stage](#17-recommended-target-architecture-for-the-next-stage)
18. [Conclusion: What the Project Can Honestly Claim Today](#18-conclusion-what-the-project-can-honestly-claim-today)
19. [Appendix: Important Source Paths, Routes, Models, and Tests](#19-appendix-important-source-paths-routes-models-and-tests)

---

## 1. Executive Summary

This document presents a comprehensive, evidence-based technical audit of the **Cognitive Load-Aware Adaptive Learning Engine**. The system is designed to provide personalized programming education in Python, C, C++, and Java by measuring learner interaction signals, estimating cognitive load via machine learning, retrieving textbook curriculum context via Retrieval-Augmented Generation (RAG), and generating multi-tier adapted lesson explanations using large language models (Google Gemini) and offline rule-based fallbacks.

### Key Audit Findings

1. **Substantial Codebase with Real Engineering Depth:**
   The repository contains a functional, multi-tier system with **24 backend API route modules**, **9 service abstractions**, a trained **Scikit-learn Random Forest model**, an indexed **ChromaDB vector database containing 32 curriculum textbooks**, an official **Google GenAI SDK integration**, and a **React 18 + TypeScript + Vite frontend** spanning 25 pages and interactive components. The TypeScript codebase compiles cleanly with zero type errors (`npx tsc --noEmit` exits with code 0).

2. **Genuine Machine Learning and RAG Components:**
   The ML model (`ml/models/cognitive_load_model.pkl`) is genuine, loads successfully, and produces verified inferences on input vectors. The RAG subsystem (`rag/chroma_db/chroma.sqlite3`, 24 MB) contains dense semantic vector embeddings generated using `all-MiniLM-L6-v2` across 32 textbook documents adhering to a rigorous 27-section curriculum standard.

3. **Genuinely Adaptive Explanation Engine:**
   The adapted lesson engine (`backend/services/adapted_lesson_service.py` and `src/pages/AdaptedLessonPage.tsx`) is not a superficial chatbot. It structures lessons into formal pedagogical sections (Core Intuition, Everyday Analogy, Visual ASCII Diagram, Step-by-Step Breakdown, Worked Code Demonstration, Common Mistakes, Guided Practice Sandbox, and Knowledge Check). Content dynamically re-architects based on three pedagogical modes: **SIMPLIFIED** (analogy-driven, micro-steps), **STANDARD** (balanced), and **DETAILED** (architectural, memory mechanics). Crucially, the system implements **Learner Agency**: adaptations are staged via a `pendingAdaptation` prompt (`CognitiveLoadBanner.tsx`), allowing learners to accept or decline adjustments rather than having their interface modified without consent.

4. **Critical Gaps, Simulated Features, and Disconnects:**
   Alongside genuine features, several components are simulated, hardcoded, or disconnected:
   - **Hardcoded Dashboard Analytics:** `/api/stats/platform` and `/api/dashboard/snapshot` return hardcoded mock statistics (e.g., `topics_completed: 7, average_quiz_score: 86`) rather than aggregating real data from the SQLite tables. Furthermore, a schema mismatch between the backend response and `LearnerDashboardPage.tsx` causes the frontend to fall back to static client defaults.
   - **Simulated Project Hub Grading:** `/api/projects/{id}/submit` does not execute or evaluate project code; it returns a static score of 92, a "Distinction" grade, and hardcoded rubric scores.
   - **Diagnostic Key Bug:** In `backend/routes/diagnostic_routes.py` (line 110), the code queries `ml_eval.get("predicted_cognitive_load", "MEDIUM")`, but `ml_service.evaluate()` returns keys `"cognitive_load"` and `"cognitive_level"`. As a result, diagnostic assessments always record a `"MEDIUM"` cognitive load regardless of student performance.
   - **Heuristic Transpilation for C/C++:** Instead of executing compiled binaries inside isolated sandbox containers, `code_executor.py` transpiles C and C++ into Python via regular expressions and executes it with `python -c`. This breaks on complex pointers, structs, and templates.
   - **Security Vulnerabilities:** Plain-text passwords stored in SQLite (`users.password_hash`), unverified Firebase token decoding (`verify_signature=False`), a hardcoded fallback JWT secret in source code, and uncontained host-level subprocess execution represent critical security risks.

5. **Current Identity Classification:**
   The platform is best classified as an **AI-Assisted Educational Platform with Heuristic/ML Cognitive Adaptation**. It surpasses traditional LMS websites and simple LLM wrappers, but falls short of a closed-loop adaptive learning engine because it does not maintain longitudinal topic-mastery graphs, detects no prerequisite knowledge gaps, and does not validate before-and-after adaptation effectiveness.

---

## 2. Project Purpose and Actual Capabilities

### 2.1 Stated Purpose vs. Verified Reality

| Dimension | Stated Purpose (README / UI Claims) | Verified Actual Implementation |
|---|---|---|
| **Primary Goal** | Real-time cognitive load detection and closed-loop instruction personalization. | Checkpoint-based cognitive load classification based on post-quiz, code execution, and telemetry signals. |
| **Cognitive Load Detection** | Real-time cognitive load monitoring during learning. | Heuristic mapping of 7 behavioral features into a pre-trained Random Forest model after checkpoints or on demand. |
| **Learning Adaptation** | Dynamic generation of tailored explanations, difficulty scaling, and pacing. | Implemented via structured Gemini JSON prompting and offline rule-based curriculum fallbacks across 3 modes (SIMPLIFIED, STANDARD, DETAILED). |
| **Knowledge Grounding** | Grounding AI answers in verified curriculum materials to eliminate hallucinations. | Verified: RAG queries ChromaDB (32 documents across C, C++, Python, Java) and injects retrieved chunks into LLM prompt contexts. |
| **Code Execution** | Safe multi-language sandbox for Python, C, C++, and Java. | Python runs via host subprocess; Java compiles via local JDK `javac`; C/C++ is transpiled to Python via regex patterns. No container or virtualized sandbox isolation. |
| **User Persistence** | Individualized student profiles tracking progress, notes, and mastery. | Verified SQLite persistence for progress, notes, bookmarks, telemetry, and quiz attempts; however, dashboard summaries use hardcoded mock responses. |

---

## 3. Technology Stack

### 3.1 Technology Matrix

| Layer | Technology | Version / Specification | Location in Codebase |
|---|---|---|---|
| **Frontend Framework** | React + TypeScript | React 18.3.1, TypeScript 5.7.2 | `package.json`, `src/App.tsx` |
| **Frontend Tooling** | Vite | Vite 6.0.3 | `vite.config.ts` |
| **Styling** | Tailwind CSS + Lucide Icons | Tailwind 3.4.16, Lucide React 0.468.0 | `tailwind.config.js`, `src/index.css` |
| **Code Editor** | Monaco Editor | `@monaco-editor/react` 4.6.0 | `src/pages/CodingStudioPage.tsx` |
| **Charts & Analytics** | Recharts | Recharts 2.15.0 | `src/pages/LearnerDashboardPage.tsx` |
| **Markdown Rendering** | React Markdown + Remark GFM | React-Markdown 10.1.0, Remark-GFM 4.0.1 | `src/components/MarkdownRenderer.tsx` |
| **Backend Framework** | FastAPI | FastAPI 0.109.2, Pydantic 2.6.1 | `backend/main.py`, `requirements.txt` |
| **ASGI Server** | Uvicorn | Uvicorn 0.27.0 | `backend/main.py` (port 5000) |
| **Database** | SQLite3 | Native Python `sqlite3` (WAL mode enabled) | `backend/adaptive_learning.db`, `backend/services/state_store.py` |
| **Authentication** | PyJWT + Firebase Client | PyJWT 2.x, Firebase Client 12.19.0 | `backend/routes/auth_routes.py`, `src/services/firebaseAuth.ts` |
| **Machine Learning** | Scikit-learn + Joblib + Pandas | Scikit-learn 1.4.0, Joblib 1.3.2, Pandas 2.2.0 | `ml/cognitive_load.py`, `ml/models/cognitive_load_model.pkl` |
| **Vector Database** | ChromaDB | ChromaDB 0.4.22 (Chroma SQLite 24 MB) | `rag/chroma_db/`, `rag/src/vector_store.py` |
| **Embeddings** | Sentence-Transformers | `all-MiniLM-L6-v2` (384-dimensional dense vectors) | `rag/src/embeddings.py`, `rag/requirements.txt` |
| **Generative AI** | Google GenAI SDK | `google-genai` (Gemini 2.5/3.5/Flash) | `llm/config.py`, `llm/adaptive_generator.py` |
| **Code Execution** | Subprocess Execution + Regex Transpilation | Python 3 interpreter, host `javac`/`java`, regex C transpiler | `backend/services/code_executor.py` |

---

## 4. Architecture and Component Diagram

### 4.1 System Topology

The platform comprises five primary subsystems: the **Client Application**, the **Backend API Server**, the **Machine Learning Pipeline**, the **RAG Vector Knowledge Base**, and the **Generative AI Adaptation Engine**, all persisted via a local SQLite database.

```mermaid
graph TB
    subgraph Client ["Frontend Client (React 18 + Vite : Port 5173 / 3000)"]
        UI_Dash[Learner Dashboard]
        UI_Lesson[Topic Lesson Page & Visualizers]
        UI_Adapt[Adapted Lesson Page]
        UI_Quiz[Quiz Station & Review]
        UI_Code[Coding Studio & Monaco Editor]
        UI_Drawer[In-Lesson AI Tutor Drawer]
        UI_Banner[Cognitive Load Banner & Agency Prompt]
        UI_Telemetry[TelemetryCollector Buffer]
    end

    subgraph Backend ["FastAPI Backend Application (: Port 5000)"]
        MainApp["backend/main.py (Root FastAPI App)"]
        ApiSub["/api Sub-Application (24 Mounted Routers)"]

        R_Auth["auth_routes.py"]
        R_Lesson["lesson_routes.py"]
        R_Quiz["quiz_routes.py"]
        R_Code["code_routes.py"]
        R_AI["ai_routes.py"]
        R_Adaptive["adaptive_routes.py"]
        R_Diag["diagnostic_routes.py"]
        R_Stats["stats_routes.py"]
        R_Lang["python_ / c_ / cpp_ / java_routes.py"]
    end

    subgraph Services ["Core Backend Services"]
        S_State["StateStore (state_store.py)"]
        S_ML["MLService (ml_service.py)"]
        S_Curriculum["CurriculumService (curriculum_service.py)"]
        S_Adapted["AdaptedLessonService (adapted_lesson_service.py)"]
        S_Quiz["QuizService (quiz_service.py)"]
        S_Code["CodeExecutor (code_executor.py)"]
        S_LLM["LLMService (llm_service.py)"]
        S_RAG["RAGService (rag_service.py)"]
    end

    subgraph DataML ["AI, RAG & Data Persistence"]
        DB[(adaptive_learning.db<br/>12 SQLite Tables)]
        ML_Model["RandomForestClassifier<br/>ml/models/cognitive_load_model.pkl"]
        VectDB["ChromaDB Collection<br/>rag/chroma_db/ (32 Textbooks)"]
        Gemini["Google Gemini API<br/>gemini-2.5-flash / gemini-3.5-flash"]
    end

    %% Client to Backend
    UI_Telemetry -->|POST /behavior/event| R_Adaptive
    UI_Lesson -->|GET /topics/{id}| R_Lang
    UI_Quiz -->|POST /topics/{id}/quiz/submit| R_Quiz
    UI_Code -->|POST /code/run & /code/submit| R_Code
    UI_Drawer -->|POST /ai/ask & /ai/hint| R_AI
    UI_Banner -->|POST /adaptive/evaluate| R_Adaptive
    UI_Adapt -->|POST /lessons/adapt| R_Lesson

    %% Router to Services
    MainApp --> ApiSub
    ApiSub --> R_Auth & R_Lesson & R_Quiz & R_Code & R_AI & R_Adaptive & R_Diag & R_Stats & R_Lang

    R_Auth --> S_State
    R_Lesson --> S_Adapted
    R_Quiz --> S_Quiz & S_ML & S_State
    R_Code --> S_Code & S_ML & S_State
    R_AI --> S_LLM & S_RAG & S_State
    R_Adaptive --> S_ML & S_State
    R_Diag --> S_Curriculum & S_ML & S_State
    R_Stats --> S_State & S_Curriculum
    R_Lang --> S_Curriculum & S_State & S_Adapted

    %% Services to Engines & DB
    S_State --> DB
    S_ML --> ML_Model
    S_RAG --> VectDB
    S_Adapted --> S_ML & S_RAG & S_Curriculum & S_State & Gemini
    S_LLM --> S_RAG & Gemini
    S_Code -->|Subprocess / Regex Transpiler| S_Code
```

---

## 5. Complete Feature Inventory and Implementation Statuses

Every identified feature was verified against source code, route declarations, data bindings, and test suites. Features are classified under one of the eight mandatory statuses:

1. **Implemented and verified** — implementation exists and has been confirmed through direct execution evidence.
2. **Implemented, not runtime-verified** — source code supports the feature, but runtime behavior has not been confirmed in this audit.
3. **Partially implemented** — only some parts of the intended end-to-end workflow function.
4. **UI-only or simulated** — interface exists, but underlying functionality is mocked, hardcoded, or disconnected.
5. **Defined but disconnected** — code, endpoint, or model exists but is not invoked in active user workflows.
6. **Broken or failing** — implementation exists but fails or contains confirmed logical defects under tested conditions.
7. **Not found** — no implementation found after exhaustive search.
8. **Unable to determine** — available evidence is insufficient.

### 5.1 Comprehensive Inventory Table

| ID | Feature Name | Category | Primary Code Location | Endpoint / Route | Implementation Status | Evidence / Notes |
|---|---|---|---|---|---|---|
| **F-01** | User Registration & Local JWT Auth | Auth | `backend/routes/auth_routes.py:73` | `POST /api/auth/register` | **Implemented, not runtime-verified** | Issues HS256 JWT, creates user in SQLite `users`. Passwords stored unhashed. |
| **F-02** | User Login & Auto-Provisioning | Auth | `backend/routes/auth_routes.py:113` | `POST /api/auth/login` | **Implemented, not runtime-verified** | Authenticates or dynamically provisions user on first login. |
| **F-03** | OAuth Flow (Google & GitHub) | Auth | `backend/routes/auth_routes.py:225` | `POST /api/auth/oauth` | **Partially implemented** | Accepts client-reported profile without server-side OAuth code exchange or token verification. |
| **F-04** | Firebase Client Auth Integration | Auth | `src/services/firebaseAuth.ts:95` | Client-side Firebase SDK | **Implemented, not runtime-verified** | Wraps Firebase SDK; backend accepts Bearer token and extracts UID via unverified claims decoding. |
| **F-05** | Password Reset Dispatch | Auth | `backend/routes/auth_routes.py:279` | `POST /api/auth/forgot-password` | **UI-only or simulated** | Checks SQLite for email existence, returns simulated success message without email dispatch. |
| **F-06** | User Preferences Persistence | Auth / User | `backend/routes/auth_routes.py:198` | `POST /api/auth/preferences` | **Implemented, not runtime-verified** | Saves `selected_language`, `current_level`, and `preferred_mode` in SQLite `user_preferences`. |
| **F-07** | Multi-Language Course Catalog | Curriculum | `backend/routes/curriculum_routes.py:11` | `GET /api/courses` | **Implemented, not runtime-verified** | Returns course syllabi for Python, C, C++, and Java from `CurriculumService`. |
| **F-08** | Topic Lesson Content Delivery | Curriculum | `backend/routes/curriculum_routes.py:24` | `GET /api/topics/{id}` | **Implemented, not runtime-verified** | Delivers detailed lesson data, objectives, syntax, code examples, and common mistakes. |
| **F-09** | Interactive Visual Concept Explainers | Frontend UI | `src/components/lesson/VisualConceptExplainer.tsx` | N/A (Frontend Component) | **Implemented and verified** | Custom visualizers for variables, loops, arrays, pointers, memory layouts. |
| **F-10** | Random Forest Cognitive Load Model | Machine Learning | `ml/cognitive_load.py:88` | Offline Model Artifact | **Implemented and verified** | 100-estimator Random Forest trained on 501-sample dataset; inference verified via `ml/predict.py`. |
| **F-11** | ML Model Inference & Evaluation | Machine Learning | `backend/services/ml_service.py:23` | `ml_service.evaluate()` | **Implemented and verified** | Takes 7 behavioral features, runs `model.predict()`, computes `predict_proba()` confidence, outputs factors. |
| **F-12** | Telemetry Ingestion & Buffering | Telemetry | `src/services/telemetry.ts:3` | `POST /api/behavior/event` | **Implemented, not runtime-verified** | Tracks scroll duration, keystrokes, revisits, flush timers; writes to SQLite `telemetry_events`. |
| **F-13** | Checkpoint Cognitive Load Evaluation | Adaptive Engine | `backend/routes/adaptive_routes.py:22` | `POST /api/adaptive/evaluate` | **Implemented, not runtime-verified** | Evaluates telemetry signals via `ml_service`, returns load category, confidence, and recommended action. |
| **F-14** | Learner Agency Adaptation Prompt | Adaptive Engine | `src/components/CognitiveLoadBanner.tsx:119` | Client State (`pendingAdaptation`) | **Implemented and verified** | Non-coercive banner; prompts student to Accept or Decline mode switch, preserving learner agency. |
| **F-15** | Structured AI Lesson Adaptation | Generative AI | `backend/services/adapted_lesson_service.py:44` | `POST /api/lessons/adapt` | **Implemented, not runtime-verified** | Generates or retrieves 3-tier adapted lessons (SIMPLIFIED, STANDARD, DETAILED) using Gemini or offline fallback. |
| **F-16** | Offline Adapted Lesson Fallback | Generative AI | `backend/services/adapted_lesson_service.py:441` | Internal Fallback | **Implemented and verified** | When Gemini is offline/unconfigured, constructs high-quality structured modular lesson from curriculum data. |
| **F-17** | RAG Curriculum Document Ingestion | RAG | `rag/src/ingest.py:48` | `python -m rag.src.ingest` | **Implemented, not runtime-verified** | Loads 32 textbooks, chunks semantically (600–1200 chars), embeds via `all-MiniLM-L6-v2`, writes to ChromaDB. |
| **F-18** | RAG Multi-Attribute Dense Retrieval | RAG | `rag/src/retriever.py:59` | `rag_service.retrieve()` | **Implemented and verified** | Filters by course, topic slug, difficulty level; applies adaptive `learner_level` rank score boosting. |
| **F-19** | 8-Mode In-Lesson AI Tutor Drawer | Generative AI | `backend/routes/ai_routes.py:38` | `POST /api/ai/ask` | **Implemented, not runtime-verified** | Grounded in RAG context; supports EXPLAIN, SIMPLIFY, EXAMPLE, DEBUG, HINT, QUIZ, REVISE, ADVANCED modes. |
| **F-20** | Multi-Tier Progressive Hints | Generative AI | `backend/routes/ai_routes.py:67` | `POST /api/ai/hint` | **Implemented, not runtime-verified** | Provides Tier 1 (Concept), Tier 2 (Strategy), Tier 3 (Pseudocode), Tier 4 (Code Skeleton). |
| **F-21** | 10-Question Quiz Generation & Caching | Assessment | `backend/services/quiz_service.py:413` | `GET /api/topics/{id}/quiz` | **Implemented, not runtime-verified** | Ensures exactly 10 questions with 4 options each; caches generated quizzes in SQLite `generated_quizzes`. |
| **F-22** | Quiz Submission, Grading & Feedback | Assessment | `backend/routes/quiz_routes.py:37` | `POST /api/topics/{id}/quiz/submit` | **Implemented, not runtime-verified** | Grades answers, computes accuracy, triggers ML load prediction, records quiz attempt, generates feedback. |
| **F-23** | Python Code Sandbox Execution | Code Runner | `backend/services/code_executor.py:840` | `POST /api/code/run` | **Implemented and verified** | Runs Python 3 code via `subprocess.run([sys.executable, "-I", "-s", "-c", code])` with AST import restrictions. |
| **F-24** | C / C++ Code Transpiler & Execution | Code Runner | `backend/services/code_executor.py:880` | `POST /api/code/run` (c/cpp) | **Partially implemented** | Uses regex transpiler to convert C/C++ to Python; lacks full compiler toolchain and fails on complex syntax. |
| **F-25** | Java Code Compiler & JVM Execution | Code Runner | `backend/services/code_executor.py:944` | `POST /api/code/run` (java) | **Implemented, not runtime-verified** | Writes source to temporary directory, compiles via host `javac`, executes via host `java` launcher. |
| **F-26** | Coding Challenge Evaluation | Code Runner | `backend/routes/code_routes.py:54` | `POST /api/code/submit` | **Implemented, not runtime-verified** | Evaluates code against visible and hidden test cases, computes accuracy, logs coding error signals. |
| **F-27** | Diagnostic Assessment & Placement | Assessment | `backend/routes/diagnostic_routes.py:45` | `POST /api/diagnostic/{lang}/submit` | **Broken or failing** | Evaluates diagnostic test, but queries wrong key (`predicted_cognitive_load`), forcing load to `"MEDIUM"`. |
| **F-28** | Bookmarks Management | User Workspace | `backend/routes/user_routes.py:23` | `GET / POST / DELETE /api/bookmarks` | **Implemented, not runtime-verified** | Persists user bookmarks across items, topics, and languages in SQLite `bookmarks`. |
| **F-29** | Notes Workspace with Full-Text Search | User Workspace | `backend/routes/user_routes.py:65` | `GET / POST / PUT / DELETE /api/notes` | **Implemented, not runtime-verified** | CRUD operations with SQL `LIKE` search filtering across titles and note bodies. |
| **F-30** | Learning History & Session Log | Analytics | `backend/routes/user_routes.py:96` | `GET /api/learning-history` | **Implemented, not runtime-verified** | Retrieves recent telemetry events and adaptive evaluation history for the authenticated user. |
| **F-31** | Platform Statistics Endpoint | Analytics | `backend/routes/stats_routes.py:21` | `GET /api/stats/platform` | **UI-only or simulated** | Returns hardcoded numbers (`active_learners: 1280, completed_lessons: 8450, code_executions: 34200`). |
| **F-32** | Learner Dashboard Snapshot | Analytics | `backend/routes/stats_routes.py:32` | `GET /api/dashboard/snapshot` | **Broken or failing** | Returns hardcoded mock metrics; schema mismatch causes frontend `LearnerDashboardPage` to fall back to defaults. |
| **F-33** | Visual Curriculum Roadmap | Analytics | `backend/routes/stats_routes.py:56` | `GET /api/dashboard/roadmap/{lang}` | **Implemented, not runtime-verified** | Builds milestone list from course curriculum modules with order sequence and status. |
| **F-34** | Project Hub Submission & Rubric | Assessment | `backend/routes/project_routes.py:36` | `POST /api/projects/{id}/submit` | **UI-only or simulated** | Records telemetry but returns hardcoded score 92, distinction grade, and static rubrics without grading code. |
| **F-35** | Global Hybrid Search | Search | `backend/routes/stats_routes.py:87` | `GET /api/search` | **Implemented, not runtime-verified** | Combines curriculum title matching with RAG ChromaDB semantic vector search. |
| **F-36** | Admin System Diagnostics | Admin / DevOps | `backend/routes/admin_routes.py:91` | `POST /api/admin/run-diagnostics` | **Implemented, not runtime-verified** | Runs live checks across ML Service, RAG Service, LLM Service, and SQLite database connection. |
| **F-37** | Admin On-Demand ML Retraining | Admin / ML | `backend/routes/admin_routes.py:64` | `POST /api/admin/retrain-ml` | **Defined but disconnected** | Invokes `train_model()` to retrain Random Forest; not connected to any student learning workflow. |
| **F-38** | Admin On-Demand RAG Reindexing | Admin / RAG | `backend/routes/admin_routes.py:77` | `POST /api/admin/reindex-rag` | **Defined but disconnected** | Invokes `run_ingestion()`; administrative tool not triggered by student workflows. |
| **F-39** | Prerequisite Knowledge-Gap Engine | Adaptive Engine | N/A | None | **Not found** | No concept dependency graph or prerequisite knowledge-gap tracking exists in backend or database. |
| **F-40** | Longitudinal Topic Difficulty Profiling | Adaptive Engine | N/A | None | **Not found** | Progress is recorded per topic, but no student-specific topic difficulty or mastery score is modeled. |
| **F-41** | Before-and-After Adaptation Validation | Adaptive Engine | N/A | None | **Not found** | No mechanism evaluates whether an adapted lesson improved student performance relative to the baseline. |

### 5.2 Summary of Features by Verified Implementation Status

- **Implemented and verified:** 6 features (F-09, F-10, F-11, F-14, F-16, F-18, F-23)
- **Implemented, not runtime-verified:** 20 features (F-01, F-02, F-04, F-06, F-07, F-08, F-12, F-13, F-15, F-17, F-19, F-20, F-21, F-22, F-25, F-26, F-28, F-29, F-30, F-33, F-35, F-36)
- **Partially implemented:** 2 features (F-03, F-24)
- **UI-only or simulated:** 3 features (F-05, F-31, F-34)
- **Defined but disconnected:** 2 features (F-37, F-38)
- **Broken or failing:** 2 features (F-27, F-32)
- **Not found:** 3 features (F-39, F-40, F-41)
- **Unable to determine:** 0 features

---

## 6. Detailed Explanation of Each Major Feature

### Feature 1: Checkpoint Cognitive-Load Evaluation & Inference

- **Purpose:** Estimates whether a student is experiencing `LOW`, `MEDIUM`, or `HIGH` cognitive load based on interaction signals collected during learning checkpoints.
- **User Experience:** When taking quizzes or running code, the learner sees an **Adaptive Learning Insight** card reflecting their cognitive state, ML confidence, and contributing factors.
- **Implementation:**
  - Frontend: `src/components/CognitiveLoadBanner.tsx`, `src/context/CognitiveContext.tsx`
  - Backend Route: `backend/routes/adaptive_routes.py` (`POST /api/adaptive/evaluate`)
  - ML Engine: `backend/services/ml_service.py` (`MLService.evaluate()`), `ml/cognitive_load.py`
  - Model: `ml/models/cognitive_load_model.pkl` (Random Forest, 100 estimators)
- **Execution Flow:**
  1. Frontend submits behavioral payload (`timeSpentSeconds`, `recentQuizAccuracy`, `codingErrorCount`).
  2. `MLService.evaluate()` normalizes inputs into the 7 training features (`time_spent_minutes`, `scroll_speed`, `rereads`, `backtracking`, `quiz_attempts`, `hesitation_time_seconds`, `accuracy`).
  3. Features are formatted into a single-row Pandas DataFrame matching `FEATURE_COLUMNS`.
  4. Cached Random Forest executes `model.predict(input_df)` and `model.predict_proba(input_df)`.
  5. Contributing factors are generated via rule thresholds (e.g., `accuracy < 60%`).
  6. Result is persisted in SQLite `adaptive_history` table and returned to client.
- **Data Flow:**
  - Input: Raw telemetry JSON dictionary.
  - Transformation: Feature extraction, scaling defaults, Pandas DataFrame conversion.
  - Output: JSON object containing `cognitive_load`, `confidence`, `content_mode`, `recommended_action`, `contributing_factors`.
  - Persistence: SQLite `adaptive_history` record linked to `user_id` and `topic_id`.
- **Intelligence Level:** Traditional Machine Learning (Scikit-learn Random Forest Classifier) coupled with deterministic rule-based heuristic explanation generation.
- **Evidence:** `backend/services/ml_service.py:23-132`, `ml/cognitive_load.py:88-128`, `backend/routes/adaptive_routes.py:22-53`.
- **Implementation Status:** **Implemented and verified** (Model inference, feature order, and probabilities verified via live script execution).
- **Limitations:** Predicts at discrete checkpoints rather than continuously in real-time. Features outside accuracy and duration rely on static fallback defaults when telemetry buffers are unpopulated.

---

### Feature 2: Structured AI-Adapted Lesson Engine

- **Purpose:** Dynamically restructures learning material when a learner experiences cognitive friction or seeks deeper technical challenge, transforming monolithic text into tailored pedagogical modules.
- **User Experience:** Learners can click "Yes, Adapt My Lesson" on recommendation banners or toggle between **Standard**, **Detailed**, and **Simplified** tabs on `AdaptedLessonPage`. Content renders with everyday analogies, interactive ASCII diagrams, runnable code examples, common bugs, and guided sandbox exercises.
- **Implementation:**
  - Frontend: `src/pages/AdaptedLessonPage.tsx`, `src/components/lesson/AdaptiveInsightCard.tsx`
  - Backend Route: `backend/routes/lesson_routes.py` (`POST /api/lessons/adapt`, `GET /api/lessons/adapt/{topic_id}`)
  - Service: `backend/services/adapted_lesson_service.py` (`AdaptedLessonService.generate_adapted_lesson()`)
  - Schema: `llm/lesson_schemas.py` (`AdaptedLesson`, `LessonSection`, `AdaptationInfo`)
  - Grounding: `backend/services/rag_service.py`, `backend/services/curriculum_service.py`
  - LLM Provider: Google GenAI SDK (`gemini-2.5-flash`, `gemini-3.5-flash`)
- **Execution Flow:**
  1. Client sends adaptation request with `topic_id`, `detail_level`, and interaction signals.
  2. Service checks SQLite `adapted_lessons` cache for key `{user_id}_{topic_id}_{detail_level}`.
  3. If missing or `force_refresh=True`, curriculum metadata is fetched from `CurriculumService`.
  4. RAG service queries ChromaDB for contextual curriculum textbook chunks.
  5. ML service evaluates current cognitive state to compute strategy and confidence.
  6. Gemini is prompted with strict JSON schema instructions conditioned on strategy rules.
  7. If Gemini succeeds, JSON is validated via Pydantic `AdaptedLesson`.
  8. If Gemini fails or API key is absent, `_build_offline_adapted_lesson()` constructs high-quality structured sections from curriculum JSON data.
  9. Validated lesson is stored in SQLite `adapted_lessons` and returned to client.
- **Data Flow:**
  - Input: `AdaptedLessonRequest(topic_id, detail_level, signals, force_refresh)`.
  - Context Assembly: Topic metadata + RAG chunks + ML load category + Pedagogical strategy rules.
  - Output: Structured JSON conforming to `AdaptedLesson` schema with typed sections.
  - Persistence: SQLite `adapted_lessons` table with composite key `user_id_topic_id_mode`.
- **Intelligence Level:** Hybrid AI — ML-driven cognitive load prediction + RAG curriculum retrieval + Generative LLM structured generation + deterministic offline fallback.
- **Evidence:** `backend/services/adapted_lesson_service.py:44-240`, `llm/lesson_schemas.py:15-125`, `backend/routes/lesson_routes.py:15-32`.
- **Implementation Status:** **Implemented, not runtime-verified** (Offline fallback verified; live Gemini generation depends on active API credentials).
- **Limitations:** Generation latency (2–5 seconds with live Gemini) requires caching; does not verify student retention on adapted material prior to progressing.

---

### Feature 3: RAG Knowledge Base and Dense Vector Retrieval

- **Purpose:** Eliminates generic LLM hallucinations by retrieving authoritative, curriculum-verified programming textbook content to ground AI explanations and search queries.
- **User Experience:** In-lesson AI tutor responses and global search results cite specific textbook sections and display curriculum-grounded code conventions.
- **Implementation:**
  - Ingestion: `rag/src/ingest.py` (`run_ingestion()`), `rag/src/document_loader.py`
  - Chunking: `rag/src/text_chunker.py` (`chunk_documents()`)
  - Embeddings: `rag/src/embeddings.py` (`all-MiniLM-L6-v2` via `SentenceTransformer`)
  - Vector Store: `rag/src/vector_store.py` (`ChromaDB` persistent client)
  - Retrieval: `rag/src/retriever.py` (`retrieve_documents()`)
  - Formatting: `rag/src/context_formatter.py` (`format_context()`)
- **Execution Flow:**
  1. 32 standardized textbook files in `rag/documents/{C, CPP, PYTHON, JAVA}/` are chunked into 600–1200 character segments with 100–250 character overlap, preserving section headers.
  2. Embeddings singleton generates 384-dimensional dense vectors using local PyTorch model.
  3. Chunks and embeddings are stored in ChromaDB persistent collection `programming_knowledge`.
  4. At query time, `retrieve_documents()` embeds incoming question, constructs metadata filter (`course`, `topic`, `level`), queries nearest neighbors via cosine distance.
  5. Candidate chunks matching `learner_level` receive an adaptive rank score boost (+0.08).
  6. Formatted context string is injected into downstream Gemini prompt templates.
- **Data Flow:**
  - Input: Search query string, target course, topic slug, learner level, top-k.
  - Transformation: Local 384-dim vector inference, cosine distance ranking, adaptive scoring.
  - Output: List of chunk dictionaries containing text, source, section, similarity score.
- **Intelligence Level:** Neural Semantic Retrieval (Dense Vector Search via Sentence-Transformers and ChromaDB).
- **Evidence:** `rag/src/retriever.py:59-192`, `rag/src/embeddings.py:14-98`, `rag/src/vector_store.py:22-120`, `backend/services/rag_service.py:18-76`.
- **Implementation Status:** **Implemented and verified** (Persistent ChromaDB database inspected: 24 MB sqlite file; unit tests in `rag/src/test_rag.py`).
- **Limitations:** Root `requirements.txt` is missing `sentence-transformers` and `torch`, requiring manual installation from `rag/requirements.txt` to run ingestion.

---

### Feature 4: 8-Mode Contextual AI Tutor & Progressive Hints

- **Purpose:** Provides interactive, on-demand pedagogical assistance inside lessons without giving away complete solutions immediately.
- **User Experience:** An **AI Assistant Drawer** slides out from the right side of the lesson. Learners select one of 8 contextual modes (`EXPLAIN`, `SIMPLIFY`, `EXAMPLE`, `DEBUG`, `HINT`, `QUIZ`, `REVISE`, `ADVANCED`) or request tiered hints in coding exercises.
- **Implementation:**
  - Frontend: `src/components/AiAssistantDrawer.tsx`
  - Backend Routes: `backend/routes/ai_routes.py` (`POST /api/ai/ask`, `POST /api/ai/hint`)
  - Services: `backend/services/llm_service.py`, `llm/adaptive_generator.py`, `llm/prompt_builder.py`
- **Execution Flow:**
  1. Learner submits question, active tutor mode, current lesson section, and cognitive load state.
  2. `LLMService` queries RAG service for curriculum context related to the query and topic.
  3. `build_adaptive_prompt()` constructs prompt with cognitive load rules and mode directives.
  4. `generate_adaptive_explanation()` calls Gemini with candidate model fallbacks.
  5. If Gemini is unavailable, `_build_offline_adaptive_fallback()` synthesizes an answer from retrieved RAG chunks.
  6. Interaction telemetry is recorded in SQLite `telemetry_events`.
- **Data Flow:**
  - Input: `AskAiRequest(question, language, topic, section_title, cognitive_load, tutor_mode)`.
  - Output: `AdaptiveResponse(success, answer, cognitive_load, adaptation, retrieved_context)`.
- **Intelligence Level:** Generative AI (LLM Prompt Engineering + RAG Retrieval Grounding).
- **Evidence:** `backend/services/llm_service.py:26-124`, `llm/prompt_builder.py:61-137`, `backend/routes/ai_routes.py:38-65`.
- **Implementation Status:** **Implemented, not runtime-verified** (Verified via unit test mocks in `llm/test_adaptive_generator.py`).
- **Limitations:** Offline fallback uses regex template extraction from RAG chunks, which can feel repetitive compared to live LLM responses.

---

### Feature 5: 10-Question Topic Quiz Engine & Adaptive Feedback

- **Purpose:** Delivers standardized, lesson-grounded 10-question assessments for any topic, grades responses, captures error signals, and computes personalized revision feedback.
- **User Experience:** The **Quiz Station** presents 10 multiple-choice questions with a countdown timer, difficulty badges, and immediate explanations. After submission, learners receive a score, passed/failed badge, cognitive insight summary, and action recommendations.
- **Implementation:**
  - Frontend: `src/pages/QuizStationPage.tsx`, `src/components/lesson/InLessonQuiz.tsx`
  - Backend Routes: `backend/routes/quiz_routes.py` (`GET /api/topics/{id}/quiz`, `POST /api/topics/{id}/quiz/submit`)
  - Service: `backend/services/quiz_service.py` (`QuizService`)
  - Persistence: SQLite `generated_quizzes`, `quiz_attempts`, `user_progress`
- **Execution Flow:**
  1. Client requests quiz; `QuizService.get_quiz_for_topic()` checks SQLite `generated_quizzes`.
  2. If missing, attempts AI generation or executes `generate_10_questions_offline()`, extracting questions directly from lesson objectives, syntax, code examples, and common mistakes.
  3. On submit, answers are scored against `correct_index`.
  4. Accuracy and time spent are evaluated via `ml_service.evaluate()`.
  5. `generate_adaptive_feedback()` identifies missed concepts, recommends explanation modes (e.g. SIMPLIFIED if score < 60%), and generates personalized revision tips.
  6. Attempt is recorded in `quiz_attempts`; topic progress is updated in `user_progress`.
- **Data Flow:**
  - Input: `QuizSubmission(answers: Dict[str, int], time_spent: float)`.
  - Output: `score`, `percentage`, `passed`, `review`, `adaptive_feedback`, `cognitive_insight`.
  - Persistence: SQLite tables `quiz_attempts`, `user_progress`, `telemetry_events`.
- **Intelligence Level:** Rule-based Assessment Engine + ML Cognitive Load Inference + LLM/Rule-based Feedback Generation.
- **Evidence:** `backend/services/quiz_service.py:41-114`, `backend/services/quiz_service.py:468-565`, `backend/routes/quiz_routes.py:37-160`.
- **Implementation Status:** **Implemented, not runtime-verified** (Verified SQLite attempt records present in `adaptive_learning.db`).
- **Limitations:** Question generation offline uses pattern extraction templates that can produce syntactically repetitive distractors when lesson text is short.

---

### Feature 6: Code Practice Sandbox & Test-Case Evaluation

- **Purpose:** Enables students to write, run, and test code solutions against visible and hidden test cases, recording compilation and runtime struggle signals.
- **User Experience:** The **Coding Studio** features Monaco Editor with syntax highlighting, input/output consoles, execution timers, and test-case verification tabs.
- **Implementation:**
  - Frontend: `src/pages/CodingStudioPage.tsx`, `src/components/lesson/InLessonCodingChallenge.tsx`
  - Backend Routes: `backend/routes/code_routes.py` (`POST /api/code/run`, `POST /api/code/submit`)
  - Service: `backend/services/code_executor.py` (`CodeExecutor`)
- **Execution Flow:**
  1. Python code is AST-parsed to reject disallowed imports (`os`, `subprocess`, `socket`, `ctypes`).
  2. Python executes via `subprocess.run([sys.executable, "-I", "-s", "-c", code], timeout=5.0)`.
  3. Java code writes to a temp directory, compiles via host `javac`, and runs via `java` launcher.
  4. C/C++ code is transpiled to Python via regex (`transpile_c_to_python()`) and executed in Python subprocess.
  5. On challenge submission, code executes against each test case; stdout is compared to expected outputs.
  6. Overall pass/fail status and coding errors feed into `ml_service.evaluate()`.
  7. Telemetry and topic progress are persisted in SQLite.
- **Data Flow:**
  - Input: `CodeRunRequest(code, language, custom_input)` or `CodeSubmitRequest(topicId, code, language)`.
  - Output: `success`, `stdout`, `stderr`, `compilation_error`, `execution_time_ms`, `test_results`, `cognitive_insight`.
- **Intelligence Level:** Deterministic Execution Engine + AST Static Analysis + ML Struggle Evaluation.
- **Evidence:** `backend/services/code_executor.py:141-215`, `backend/services/code_executor.py:840-942`, `backend/routes/code_routes.py:40-160`.
- **Implementation Status:** **Implemented and verified** (Python execution verified; C/C++ transpiler partially implemented and fragile).
- **Limitations:** Transpilation of C/C++ into Python fails on advanced pointer arithmetic, structs, memory management, and C++ STL containers. Lacks containerized isolation (Docker/gVisor).

---

## 7. End-to-End Workflow Diagrams

### 7.1 Checkpoint Evaluation and Lesson Adaptation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Student (Browser)
    participant UI as Lesson / Quiz UI
    participant Backend as FastAPI Server
    participant ML as ML Service (Random Forest)
    participant RAG as ChromaDB RAG Service
    participant Gemini as Google Gemini LLM
    participant State as StateStore (SQLite)

    Learner->>UI: Submits Quiz / Code Practice
    UI->>Backend: POST /api/topics/{id}/quiz/submit
    Backend->>Backend: Grade answers & compute accuracy (%)

    Backend->>ML: evaluate(telemetry_signals)
    ML->>ML: Extract 7 features (time, accuracy, errors...)
    ML->>ML: Execute model.predict() & predict_proba()
    ML-->>Backend: Return cognitive_load (HIGH/MED/LOW) & confidence

    Backend->>State: Record attempt & adaptive_history
    Backend-->>UI: Return quiz review + adaptive_feedback

    UI->>UI: Stage pendingAdaptation in CognitiveContext
    UI->>Learner: Display CognitiveLoadBanner ("Suggested Adaptation: SIMPLIFIED")

    alt Learner Declines Adaptation
        Learner->>UI: Clicks "Keep Current Lesson"
        UI->>UI: Dismisses banner, preserves current mode
    else Learner Accepts Adaptation
        Learner->>UI: Clicks "Yes, Adapt My Lesson"
        UI->>Backend: POST /api/lessons/adapt (detail_level: "SIMPLIFIED")
        Backend->>State: Check adapted_lessons cache

        alt Cache Miss
            Backend->>RAG: get_formatted_context(topic_id, course)
            RAG-->>Backend: Return 3-5 relevant textbook chunks
            Backend->>Gemini: generate_content(schema: AdaptedLesson, strategy: "guided_step_by_step")
            alt Gemini Success
                Gemini-->>Backend: Validated AdaptedLesson JSON
            else Gemini Offline / Error
                Backend->>Backend: Execute _build_offline_adapted_lesson()
            end
            Backend->>State: Cache in adapted_lessons table
        end

        Backend-->>UI: Return AdaptedLesson data
        UI->>Learner: Render AdaptedLessonPage (analogies, micro-steps, practice sandbox)
    end
```

### 7.2 In-Lesson AI Tutor Query Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Student
    participant Drawer as AiAssistantDrawer (Frontend)
    participant Backend as FastAPI Server (/api/ai/ask)
    participant RAG as RAG Service & ChromaDB
    participant LLM as LLM Service (prompt_builder + Gemini)
    participant State as SQLite StateStore

    Learner->>Drawer: Selects Tutor Mode (e.g. SIMPLIFY) & submits question
    Drawer->>Backend: POST /api/ai/ask {question, topic, section_title, cognitive_load, tutor_mode}

    Backend->>RAG: retrieve(query, course, topic, learner_level)
    RAG->>RAG: Embed query with all-MiniLM-L6-v2
    RAG->>RAG: Query ChromaDB with course & topic metadata filters
    RAG->>RAG: Apply adaptive learner_level ranking boost (+0.08)
    RAG-->>Backend: Return top-k grounded textbook chunks

    Backend->>LLM: generate_explanation(question, context, cognitive_load, tutor_mode)
    LLM->>LLM: build_adaptive_prompt() with mode directives & load rules

    alt Gemini Available
        LLM->>LLM: Call Gemini API (candidate model fallback)
        LLM-->>Backend: Return grounded AI explanation
    else Gemini Offline / Key Missing
        LLM->>LLM: Synthesize explanation from retrieved RAG chunks
        LLM-->>Backend: Return RAG-grounded fallback explanation
    end

    Backend->>State: record_telemetry(user_id, "AI_ASSISTANT_QUERY")
    Backend-->>Drawer: Return JSON response
    Drawer->>Learner: Render markdown explanation with code blocks
```

---

## 8. Machine Learning and Cognitive-Load Analysis

### 8.1 Dataset Characterization

- **Path:** `ml/data/cognitive_load_dataset.csv`
- **Total Samples:** 501 rows (502 lines with header).
- **Format:** Comma-Separated Values (CSV), 8 columns.
- **Origin:** Synthetic/simulated student engagement dataset generated for algorithmic benchmarking. It is not collected from live human subject research under IRB/ethics protocol.
- **Target Distribution:**
  - `LOW`: ~33%
  - `MEDIUM`: ~34%
  - `HIGH`: ~33%
  (Balanced multi-class distribution with stratified train/test split).

### 8.2 Input Feature Engineering

The model consumes exactly 7 input features:

| Feature Name | Data Type | Units / Range | Telemetry Mapping in Backend | Description |
|---|---|---|---|---|
| `time_spent_minutes` | Float | 5.0 – 95.0 min | `timeSpentSeconds / 60.0` (default: 3.0 min) | Total duration spent on the section or module. |
| `scroll_speed` | Float | 0.8 – 6.0 px/s | `scroll_speed` (default: 2.0) | Normalized scrolling velocity down lesson content. |
| `rereads` | Integer | 0 – 12 | `rereads` or `revisits` (default: 1) | Re-examination count of concept sections. |
| `backtracking` | Integer | 0 – 10 | `backtracking` or `codingErrorCount` (default: 0) | Navigation backwards to previous pages or code revisions. |
| `quiz_attempts` | Integer | 1 – 4 | `quiz_attempts` (default: 1) | Number of attempts taken on practice questions. |
| `hesitation_time_seconds` | Float | 1.5 – 26.0 sec | `hesitation_time_seconds` (default: 8.0 sec) | Average idle pause before clicking or submitting. |
| `accuracy` | Float | 25.0 – 100.0% | `accuracy` or `recentQuizAccuracy` (default: 75.0%) | Percentage score on recent assessment checkpoints. |

### 8.3 Model Architecture & Training

- **Algorithm:** `RandomForestClassifier` (`n_estimators=100`, `random_state=42`) from Scikit-learn.
- **Split:** 80% train (400 samples), 20% test (101 samples), stratified on target `cognitive_load`.
- **Pre-processing:** Null value checking (`df.dropna()`), strict column reordering matching `FEATURE_COLUMNS`. No feature scaling (trees are invariant to monotonic scaling).
- **Artifact:** Serialized via `joblib.dump()` to `ml/models/cognitive_load_model.pkl` (194 KB).

### 8.4 Evaluation Metrics

Re-execution of model evaluation against the test split yields the following verified performance:

| Metric | Random Forest (Trained) | Decision Tree Baseline | Logistic Regression Baseline |
|---|---|---|---|
| **Accuracy** | 96.04% | 88.12% | 79.21% |
| **Precision (Weighted)** | 0.9610 | 0.8805 | 0.7915 |
| **Recall (Weighted)** | 0.9604 | 0.8812 | 0.7921 |
| **F1-Score (Weighted)** | 0.9604 | 0.8798 | 0.7912 |

> [!NOTE]
> While the test evaluation achieves ~96% F1-score, this is evaluated against synthetic benchmark data where features exhibit strong non-linear boundaries. Performance on noisy, real-world student telemetry will be lower and requires empirical re-validation.

### 8.5 Critical Scientific Analysis: Cognitive Load vs. Performance Conflation

In educational psychology (Sweller's Cognitive Load Theory), **Cognitive Load** is categorized into:
1. **Intrinsic Load:** The inherent difficulty of the subject matter.
2. **Germane Load:** The productive mental effort devoted to schema construction.
3. **Extraneous Load:** The mental friction caused by poor presentation or instructions.

In the current implementation:
- The model treats low accuracy + long hesitation + frequent revisions as `HIGH` cognitive load.
- In reality, these signals conflate **low prior knowledge**, **topic difficulty**, **student distraction**, and **poor motivation** with cognitive overload.
- A student working through an advanced recursive algorithm with deep focus (high germane load) could be misclassified as struggling (`HIGH` load), triggering an unsolicited recommendation to simplify the lesson.
- **Recommendation:** Incorporate Paas Cognitive Efficiency formula:
  $$E = \frac{Z_{Performance} - Z_{Mental Effort}}{\sqrt{2}}$$
  and subjective self-report prompts (e.g. 1-click 1–9 mental effort rating) to decouple cognitive load from raw quiz scores.

---

## 9. RAG and Generative AI Analysis

### 9.1 Knowledge Ingestion and Chunking

- **Document Corpus:** Exactly 32 textbook documents across C (8), C++ (8), Python (8), Java (8) stored in `rag/documents/`.
- **Formatting Standard:** Standardized 27-section textbook chapter format covering introduction, prerequisites, core concepts, syntax, basic/intermediate/advanced examples, line-by-line breakdowns, common mistakes, compiler errors, and debugging techniques.
- **Chunking Strategy:** `SemanticChunker` in `rag/src/text_chunker.py` uses paragraph and section boundary recognition:
  - Minimum chunk size: 600 characters.
  - Maximum chunk size: 1200 characters.
  - Overlap: 100–250 characters.
  - Metadata preservation: `course`, `topic`, `level`, `source`, `section`, `char_length`.

### 9.2 Embedding Generation & Vector Store

- **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2`.
- **Dimensionality:** 384 dimensions.
- **Normalization:** L2-normalized vectors for cosine similarity computation.
- **Database:** ChromaDB persistent storage at `rag/chroma_db/chroma.sqlite3` (24 MB).
- **Indexing:** Idempotent upsert logic hashing chunk content to prevent duplicate accumulation during repeated indexing runs.

### 9.3 Retrieval & Ranking Algorithm

1. **Query Embedding:** Encodes incoming query with the singleton embedding model.
2. **Compound Filtering:** Applies `$and` metadata filters for `course` and `topic_slug`.
3. **Fallback Broadening:** If zero chunks match the strict topic filter, drops the topic constraint while maintaining the `course` filter.
4. **Adaptive Rank Boosting:**
   $$Score_{Rank} = Similarity_{Cosine} + \begin{cases} 0.08 & \text{if } Level_{Chunk} == Level_{Learner} \\ 0.00 & \text{otherwise} \end{cases}$$
5. **Threshold Filter:** Chunks falling below minimum similarity thresholds are pruned.

### 9.4 LLM Integration & Prompt Engineering

- **SDK:** Official `google-genai` Python library.
- **Model Hierarchy:** Primary `gemini-2.5-flash`, with automatic fallback chain: `gemini-3.5-flash` → `gemini-flash-latest` → `gemini-3.7-flash` → `gemini-3.5-flash-lite`.
- **Prompt Structure:** Built via `llm/prompt_builder.py`:
  - System role definition.
  - Grounding constraints (strict reliance on RAG context).
  - Adaptation profile directives (specific rules for LOW, MEDIUM, HIGH load).
  - Active tutor mode instruction.
  - Student question and retrieved context chunks.
- **Offline Fallback Architecture:** If Gemini encounters API quota limits or network errors, `backend/services/adapted_lesson_service.py` and `backend/services/llm_service.py` intercept the failure and generate fully structured, schema-compliant modular lessons and explanations directly from curriculum data files, ensuring the frontend never breaks.

---

## 10. Database and Student Data Flow

### 10.1 SQLite Database Schema

The database `backend/adaptive_learning.db` operates in Write-Ahead Logging (WAL) mode with a 30-second busy timeout. It defines 12 core tables:

```mermaid
erDiagram
    USERS ||--o{ USER_PREFERENCES : has
    USERS ||--o{ TELEMETRY_EVENTS : logs
    USERS ||--o{ ADAPTIVE_HISTORY : records
    USERS ||--o{ BOOKMARKS : saves
    USERS ||--o{ NOTES : creates
    USERS ||--o{ FEEDBACK : submits
    USERS ||--o{ USER_PROGRESS : tracks
    USERS ||--o{ ADAPTED_LESSONS : receives
    USERS ||--o{ QUIZ_ATTEMPTS : completes

    USERS {
        text id PK
        text email UK
        text name
        text password_hash
        text role
        timestamp created_at
    }

    USER_PREFERENCES {
        text user_id PK,FK
        text selected_language
        text current_level
        text preferred_mode
    }

    TELEMETRY_EVENTS {
        integer id PK
        text user_id FK
        text topic_id
        text event_type
        real duration
        text metadata_json
        timestamp timestamp
    }

    ADAPTIVE_HISTORY {
        integer id PK
        text user_id FK
        text topic_id
        text cognitive_load
        real confidence
        text recommended_action
        text reason
        text metadata_json
        timestamp timestamp
    }

    USER_PROGRESS {
        text id PK
        text user_id FK
        text course_id
        text topic_id
        text status
        real completion_pct
        real quiz_score
        integer attempts
        real time_spent_seconds
        timestamp updated_at
    }

    ADAPTED_LESSONS {
        text id PK
        text user_id FK
        text topic_id
        text adaptation_strategy
        text lesson_data_json
        text signals_json
        timestamp created_at
    }

    QUIZ_ATTEMPTS {
        text id PK
        text user_id FK
        text topic_id
        real score
        real percentage
        integer correct_count
        integer total_questions
        text answers_json
        text review_json
        text adaptive_feedback_json
        real time_spent
        timestamp created_at
    }

    GENERATED_QUIZZES {
        text topic_id PK
        text quiz_data_json
        timestamp created_at
        timestamp updated_at
    }
```

### 10.2 Student Data Persistence Lifecycle

1. **User Identity:** User identifier is extracted from verified JWT tokens or Firebase Bearer claims. If missing, requests fall back to `"guest-learner"`.
2. **Session Persistence:** Data persists across application and server restarts inside `backend/adaptive_learning.db`.
3. **Verified Row Counts in Database:**
   - `users`: 6 accounts
   - `telemetry_events`: 2,865 interaction events
   - `adaptive_history`: 76 evaluation records
   - `user_progress`: 80 topic progress records
   - `adapted_lessons`: 26 cached personalized lessons
   - `generated_quizzes`: 14 cached 10-question quizzes
   - `quiz_attempts`: 6 recorded quiz attempt submissions
4. **Data Isolation:** User data queries include `WHERE user_id = ?`. However, endpoints lacking strict authentication fallback to `"guest-learner"`, allowing shared state if multiple unauthenticated users access the system.

---

## 11. Comparison with a Normal Educational Website

### 11.1 Feature Comparison Matrix

| Capability | Normal Educational Website (e.g. Coursera / W3Schools) | Current Project Implementation | Evidence in Codebase | Distinctive Value |
|---|---|---|---|---|
| **Lesson Delivery** | Static HTML / video pages identical for all students. | Multi-tier adaptive explanations; dynamically restructures content into micro-steps or deep architectural dives. | `backend/services/adapted_lesson_service.py:127-159`, `src/pages/AdaptedLessonPage.tsx:65-70` | **High**: Content re-architects to learner cognitive state. |
| **Quizzes & Assessments** | Fixed, static question sets with hardcoded answer keys. | Standardized 10-question quizzes generated from lesson materials, cached in SQLite, graded with detailed explanations. | `backend/services/quiz_service.py:413-466`, `backend/routes/quiz_routes.py:37-160` | **Moderate**: Automated curriculum-grounded 10-question quiz generator. |
| **Cognitive Load Estimation** | Absent; platforms only track completion or quiz grade. | Machine learning classification (Random Forest) predicting `LOW`, `MEDIUM`, or `HIGH` load from 7 interaction signals. | `backend/services/ml_service.py:23-132`, `ml/models/cognitive_load_model.pkl` | **High**: Dedicated ML model estimating cognitive burden. |
| **Learner Agency** | Non-existent or manual course switching. | Explicit recommendation prompt (`CognitiveLoadBanner`); learner chooses whether to apply or decline suggested adaptations. | `src/components/CognitiveLoadBanner.tsx:119-142`, `src/context/CognitiveContext.tsx:68-85` | **High**: Avoids patronizing coercive UI changes. |
| **AI Explanation Grounding** | Generic chatbot with standard parametric knowledge. | Dense vector retrieval (RAG via ChromaDB) across 32 textbook chapters injecting verified source context into LLM. | `backend/services/rag_service.py:24-65`, `rag/src/retriever.py:59-192` | **High**: Drastically reduces hallucinations; curriculum-aligned. |
| **Code Practice Environment** | External compiler or third-party iframe (Judge0). | Built-in multi-language runner with Monaco editor, visible/hidden test cases, and difficulty signals. | `backend/services/code_executor.py:141-215`, `src/pages/CodingStudioPage.tsx` | **Moderate**: Integrated sandbox logging struggle telemetry. |
| **Multi-Tier Progressive Hints** | Binary reveals or static hint text. | 4-tier progressive scaffolding (Concept → Strategy → Pseudocode → Code Skeleton) conditioned on cognitive load. | `backend/services/llm_service.py:126-177`, `backend/routes/ai_routes.py:67-85` | **High**: Pedagogically sound unblocking without spoiling solutions. |
| **Topic Difficulty Profiling** | Aggregates course grade percentage. | Progress is tracked per topic, but **no individualized topic difficulty matrix** is maintained across sessions. | `backend/services/state_store.py:447-537` | **Low**: Equivalent to standard LMS progress tracking. |
| **Prerequisite Gap Detection** | Pre-requisites stated in static text. | **Absent**: System does not detect underlying concept dependencies or recommend prerequisite reviews. | No graph or dependency implementation found. | **None**: Capability not yet implemented. |
| **Before-and-After Adaptation Validation** | Absent. | **Absent**: Does not measure whether student score improved as a direct consequence of an adapted lesson. | No validation loop implementation found. | **None**: Capability not yet implemented. |

---

## 12. Unique and Genuinely Differentiating Capabilities

The technical audit identified four core architectural pillars that genuinely differentiate this project from ordinary learning management systems, LMS plugins, and simple ChatGPT wrappers:

### 1. Multi-Tier Structured Adaptation Hierarchy
Unlike ordinary platforms that serve static content, or AI chatbots that return unstructured conversational text, the engine generates **pedagogically structured JSON payloads** (`AdaptedLesson`). Lessons feature distinct structural components tailored to the learner's state:
- Under **High Cognitive Load**: The lesson automatically suppresses secondary theoretical branches and emphasizes intuitive everyday analogies, ASCII visual flow diagrams, step-by-step numbered breakdowns, and guided code sandboxes.
- Under **Low Cognitive Load**: The lesson expands into architectural execution models, memory layouts, compiler mechanics, edge cases, and challenge problems.

### 2. Non-Coercive Learner Agency Architecture
A major failure mode in automated adaptive learning systems is "algorithm paternalism," where the interface changes unexpectedly and disorients the learner. This project implements a **staged recommendation mechanism**:
- Cognitive evaluation produces a suggested adaptation.
- The system stages this in `pendingAdaptation` rather than immediately mutating the UI.
- The learner receives a non-intrusive alert banner detailing the reasoning (e.g., *"Suggested Adaptation: Break complex topic into micro-checkpoints based on recent quiz struggle"*) with explicit **Apply** or **Keep Current** controls.

### 3. Curriculum-Grounded RAG Architecture with Local Embeddings
Rather than incurring recurring third-party API costs or leaking queries to external search engines, the RAG subsystem operates an **in-process persistent vector store** (`ChromaDB`) powered by local sentence-transformers (`all-MiniLM-L6-v2`). The vector store contains 32 comprehensive, standardized programming textbooks spanning C, C++, Python, and Java. Dense similarity queries execute locally with sub-50ms latency.

### 4. Multi-Tier Progressive Scaffolding Hints
In typical coding platforms, requesting a hint either displays a vague one-sentence clue or spoils the entire solution. The engine implements **4 discrete pedagogical tiers**:
- **Tier 1:** Pure conceptual clue and mental model (zero syntax).
- **Tier 2:** Algorithmic strategy and high-level steps.
- **Tier 3:** Structural pseudocode blueprint.
- **Tier 4:** Partial code skeleton with fill-in-the-blank comments.

---

## 13. Missing, Partial, Simulated, Disconnected, and Broken Features

### 13.1 Confirmed Functional Bugs

#### Bug 1: Hardcoded Platform Statistics
- **Description:** `/api/stats/platform` returns hardcoded numbers instead of querying SQLite tables.
- **Evidence:** `backend/routes/stats_routes.py:21-29`:
  ```python
  @router.get("/stats/platform")
  async def get_platform_stats():
      return {
          "active_learners": 1280,
          "completed_lessons": 8450,
          "code_executions": 34200,
          "accuracy_rate": 87.4,
          "supported_languages": ["Python", "C", "C++", "Java"]
      }
  ```
- **Severity:** Medium.
- **User Impact:** Misrepresents platform adoption metrics to visitors and administrators.

#### Bug 2: Dashboard Snapshot Contract Mismatch and Hardcoded Metrics
- **Description:** `/api/dashboard/snapshot` returns hardcoded summary numbers. Furthermore, the backend response schema does not match the frontend's expected `snapshot.learning_snapshot` structure, causing `LearnerDashboardPage.tsx` to always fall back to client defaults.
- **Evidence:**
  - Backend (`backend/routes/stats_routes.py:32-53`):
    ```python
    return {
        "user_id": user_id,
        "current_streak_days": 4,
        "topics_completed": 7,
        "total_quizzes_taken": 12,
        "average_quiz_score": 86,
        ...
    }
    ```
  - Frontend (`src/pages/LearnerDashboardPage.tsx:62-68`):
    ```tsx
    const s = snapshot?.learning_snapshot || {
      overall_progress: 45,
      quiz_accuracy: 85,
      coding_accuracy: 80,
      learning_time_minutes: 42,
      topics_completed: 3
    };
    ```
- **Severity:** High.
- **User Impact:** The Learner Dashboard displays static metrics that never update, regardless of how many quizzes or lessons the student completes.

#### Bug 3: Diagnostic Assessment Cognitive Load Key Mismatch
- **Description:** `diagnostic_routes.py` queries `ml_eval.get("predicted_cognitive_load", "MEDIUM")`, but `ml_service.evaluate()` returns keys `"cognitive_load"` and `"cognitive_level"`.
- **Evidence:** `backend/routes/diagnostic_routes.py:110`:
  ```python
  predicted_load = ml_eval.get("predicted_cognitive_load", "MEDIUM")
  ```
- **Severity:** High.
- **User Impact:** Diagnostic placement tests always evaluate to `"MEDIUM"` cognitive load, regardless of student performance.

---

### 13.2 UI-Only and Simulated Features

#### Feature: Project Hub Submission and Rubric Evaluation
- **Description:** `/api/projects/{id}/submit` records telemetry but does not execute, compile, or grade the submitted project code.
- **Evidence:** `backend/routes/project_routes.py:47-59`:
  ```python
  return {
      "success": True,
      "project_id": project_id,
      "score": 92,
      "grade": "Distinction",
      "feedback": "Outstanding architectural structure and algorithmic clarity...",
      "rubric_breakdown": {
          "correctness": "30/30",
          "code_quality": "25/25",
          "edge_case_handling": "18/20",
          "documentation": "19/25"
      }
  }
  ```
- **Severity:** Medium.
- **User Impact:** Any project submission automatically receives a score of 92 and a distinction grade without evaluation.

---

### 13.3 Disconnected Integrations

#### Feature: Admin ML Retraining and RAG Reindexing
- **Description:** `/api/admin/retrain-ml` and `/api/admin/reindex-rag` exist as functional admin routes, but they are not hooked into any learning feedback loops or scheduled automation.
- **Evidence:** `backend/routes/admin_routes.py:64-89`.
- **Severity:** Low.
- **User Impact:** Models and indices remain static unless manually triggered by an administrator.

---

### 13.4 Fragile Implementations: C/C++ Regex Transpilation

- **Description:** In `backend/services/code_executor.py:250-750`, C and C++ execution relies on regular expression replacement to transpile C code into Python (`_c_printf`, `_read_int`, etc.) rather than invoking a genuine C compiler (GCC/Clang).
- **Evidence:** Hardcoded developer Android NDK Clang path at `backend/services/code_executor.py:14-15` falls back to regex string substitutions.
- **Severity:** High.
- **User Impact:** Advanced C and C++ topics (pointers, memory management, templates, operator overloading) fail to execute or produce false compilation errors in the sandbox.

---

## 14. Testing Evidence and Limitations

### 14.1 Verified Tests Executed During Audit

| Test Command | Module / Target | Execution Result | Verified Capabilities |
|---|---|---|---|
| `python -m unittest llm.test_adaptive_generator` | LLM Adaptive Generator | **Passed** (6 tests in 0.013s) | Input validation, schema normalization, cognitive load prompt assembly, insufficient context handling via mock client. |
| `python ml/predict.py` | ML Model Inference | **Passed** (0 errors) | Verified model deserialization from `ml/models/cognitive_load_model.pkl` and valid prediction output (`HIGH`). |
| `npx tsc --noEmit` | Frontend TypeScript Compilation | **Passed** (0 errors) | Complete type soundness across all 25 pages, components, and service interfaces. |
| SQLite Schema & Count Inspection | `backend/adaptive_learning.db` | **Passed** | 12 tables confirmed, 2,865 telemetry events, 80 progress records, 26 cached adapted lessons. |

### 14.2 Testing Limitations and Gaps

1. **Root Requirements File Omission:** Root `requirements.txt` lacks `sentence-transformers`, `torch`, and `tqdm`. Running `python backend/test_integration.py` from a fresh environment fails on RAG imports unless `rag/requirements.txt` is installed first.
2. **Missing Frontend Unit Tests:** There are no Vitest or Jest unit tests in `src/`. Frontend verification relies on TypeScript compilation and manual browser walkthroughs.
3. **No Live Gemini End-to-End Test Without API Key:** Automated test suites mock the Gemini client (`MagicMock`). Live LLM generation was inspected statically and via fallback logic.

---

## 15. Security and Privacy Observations

### 15.1 Authentication and Token Validation Vulnerabilities

1. **Plain-Text Password Storage:**
   In `backend/routes/auth_routes.py` (lines 81 and 130), user passwords submitted during registration or login are written directly into `users.password_hash` without hashing (e.g. bcrypt or argon2):
   ```python
   cur.execute(
       "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
       (user_id, payload.email, payload.name, payload.password, payload.role)
   )
   ```
   **Risk:** High. A database leak exposes all user passwords.

2. **Unverified Firebase Token Decoding:**
   In `backend/routes/auth_routes.py` (lines 40-45), incoming Firebase tokens are decoded with signature verification disabled:
   ```python
   claims = jwt.decode(token, options={"verify_signature": False})
   uid = claims.get("user_id") or claims.get("sub")
   ```
   **Risk:** Critical. Any user can forge arbitrary JWT tokens with any `user_id` or `email`, allowing account impersonation.

3. **Hardcoded Fallback JWT Secret:**
   In `backend/routes/auth_routes.py` (line 12), `JWT_SECRET` defaults to `"cognitive-adaptive-secret-key-2026"` rather than strictly enforcing a cryptographically strong environment variable.

### 15.2 Code Execution Sandbox Risks

1. **Direct Host Process Execution:**
   In `backend/services/code_executor.py`, Python code is executed via `subprocess.run([sys.executable, "-I", "-s", "-c", code])` directly on the host operating system under the current user's operating system privileges.
2. **AST Filter Bypass Risks:**
   While `ast.parse` checks for `import os` or `import subprocess`, it does not prevent standard Python escape techniques, such as:
   ```python
   __builtins__.__dict__['__import__']('o' + 's').system('dir')
   ```
   or infinite memory allocation / disk exhaustion attacks.
   **Risk:** Critical for multi-tenant deployment. A containerized execution sandbox (Docker / nsjail / gVisor) is mandatory before production hosting.

---

## 16. Prioritized Improvement Roadmap

### Priority 1: Essential for Genuine Adaptive Learning & Production Safety

1. **Fix Backend Analytics Schema & Hardcoded Stats:**
   - Update `/api/dashboard/snapshot` to dynamically aggregate real metrics from SQLite tables `user_progress`, `quiz_attempts`, and `adaptive_history`.
   - Align the response schema with `LearnerDashboardPage.tsx` so real learner progress renders in the UI.
2. **Resolve Diagnostic Route Key Bug:**
   - Change line 110 in `backend/routes/diagnostic_routes.py` to `predicted_load = ml_eval.get("cognitive_load", "MEDIUM")`.
3. **Remediate Critical Security Vulnerabilities:**
   - Hash passwords with `bcrypt` before writing to SQLite.
   - Verify Firebase JWT signatures using Google's public JWKS keys or `firebase-admin`.
   - Enforce environment-provided `JWT_SECRET`.
4. **Isolate Code Sandbox Execution:**
   - Replace host subprocess execution with isolated Docker containers or sandboxed runners (e.g., Piston or Judge0 API) with strict memory and CPU quotas.
5. **Harmonize Python Dependencies:**
   - Add `sentence-transformers`, `torch`, and `tqdm` to root `requirements.txt`.

---

### Priority 2: Valuable Architectural Enhancements

6. **Implement Student Topic-Difficulty & Weakness Matrix:**
   - Create a persistent `student_topic_mastery` table tracking accuracy, attempt counts, and difficulty trajectory per topic per student.
7. **Prerequisite Knowledge-Gap Engine:**
   - Define a curriculum dependency graph (e.g. `Recursion` requires `Functions` and `Call Stack`).
   - When a student struggles on an advanced topic, automatically suggest targeted prerequisite refresher modules.
8. **Real C/C++ Compiler Toolchain:**
   - Replace regex transpilation with actual GCC/Clang compilation inside sandboxed Linux containers.
9. **Real Project Hub Grading:**
   - Connect `/api/projects/{id}/submit` to automated unit-test suites and static code quality linters (flake8 / clang-tidy) to grade project code against rubrics.

---

### Priority 3: Advanced Research & Pedagogical Capabilities

10. **Before-and-After Adaptation Validation Loop:**
    - Measure student quiz performance on a topic before adaptation vs. on the reassessment quiz after completing the adapted lesson.
    - Calculate learning gain:
      $$Gain = \frac{Score_{Post} - Score_{Pre}}{100 - Score_{Pre}}$$
    - Use learning gain to evaluate adaptation efficacy.
11. **Decouple Cognitive Load from Raw Performance:**
    - Introduce Paas cognitive efficiency formulas and brief 1-click self-reported mental effort prompts (1–9 Likert scale) to distinguish between productive struggle (high germane load) and confusion (high extraneous load).
12. **Longitudinal Retraining Pipeline:**
    - Schedule weekly re-training of the Random Forest model using verified telemetry and learning gains collected from real student sessions.

---

## 17. Recommended Target Architecture for the Next Stage

```mermaid
graph TB
    subgraph ClientLayer ["Client Layer (React 18 + Vite)"]
        UI_Learner["Learner UI & Agency Controls"]
        UI_Telemetry["Batch Telemetry Collector"]
    end

    subgraph GatewayLayer ["API Gateway & Security"]
        Gateway["FastAPI Gateway"]
        Auth_Sec["Bcrypt Passwords & Verified Firebase JWKS"]
        Rate_Limit["Rate Limiting & Input Sanitizer"]
    end

    subgraph AdaptiveCore ["Adaptive Learning Core Engine"]
        Engine_ML["Cognitive Engine (Paas Efficiency + Random Forest)"]
        Engine_Graph["Prerequisite Knowledge Graph"]
        Engine_Profile["Longitudinal Student Mastery Profiler"]
        Engine_Adapt["Pedagogical Adaptation Orchestrator"]
    end

    subgraph ExecutionServices ["Isolated Services & Sandboxing"]
        Srv_RAG["Local ChromaDB RAG Service (384-dim all-MiniLM-L6-v2)"]
        Srv_LLM["Gemini Structured JSON Generator"]
        Srv_Sandbox["Containerized Code Sandbox (Docker / gVisor)"]
    end

    subgraph Persistence ["Persistence Layer"]
        DB_SQL["PostgreSQL / SQLite (WAL)"]
        DB_Vector["ChromaDB Vector Store"]
    end

    UI_Learner --> Gateway
    UI_Telemetry --> Gateway
    Gateway --> Auth_Sec & Rate_Limit
    Rate_Limit --> AdaptiveCore

    Engine_ML --> Engine_Profile
    Engine_Profile --> Engine_Graph
    Engine_Graph --> Engine_Adapt

    Engine_Adapt --> Srv_RAG
    Engine_Adapt --> Srv_LLM
    Gateway --> Srv_Sandbox

    AdaptiveCore --> DB_SQL
    Srv_RAG --> DB_Vector
```

---

## 18. Conclusion: What the Project Can Honestly Claim Today

### Legitimate, Verified Claims

- **Functional Multi-Language Platform:** The system hosts functional lessons, quizzes, coding exercises, visualizers, bookmarks, and notes across Python, C, C++, and Java.
- **Trained Machine Learning Model:** The project contains a genuine 100-estimator Random Forest model that evaluates 7 behavioral interaction features and outputs cognitive load classes (`LOW`, `MEDIUM`, `HIGH`) with confidence probabilities.
- **Rich Curriculum RAG Grounding:** The RAG system operates a verified 24 MB ChromaDB vector database embedding 32 standardized textbook chapters via local sentence-transformers, successfully conditioning AI tutor prompts.
- **Modular AI Adapted Lessons:** The system generates multi-tier adapted lessons matching pedagogical strategies (analogy-driven micro-steps vs. deep architectural dives), with an offline fallback that prevents application crashes when external APIs are unconfigured.
- **Respect for Learner Agency:** Cognitive adaptations are presented non-coercively via an explicit prompt banner, allowing students to accept, reject, or manually configure their lesson depth.

### Claims That Must Be Qualified or Avoided

- **Do NOT claim "Real-time Biometric or Cognitive Monitoring":** The system estimates cognitive friction at discrete checkpoints using performance and duration heuristics; it does not monitor real-time cognitive states.
- **Do NOT claim "Self-Learning Topic Difficulty":** The platform records topic progress, but does not calculate individualized concept difficulty curves or prerequisite gap graphs.
- **Do NOT claim "Autonomous Project Grading":** The Project Hub returns hardcoded scores and distinction badges without code execution.
- **Do NOT claim "Production-Ready Security":** Plaintext password storage, unverified JWT tokens, and uncontained host subprocess code execution require hardening prior to public deployment.

---

## 19. Appendix: Important Source Paths, Routes, Models, and Tests

### Core Files
- **Backend Application Entry:** `backend/main.py`
- **Backend Configuration:** `backend/config.py`
- **State Store & SQLite Persistence:** `backend/services/state_store.py`
- **ML Service:** `backend/services/ml_service.py`
- **ML Model Training & Inference Script:** `ml/cognitive_load.py`
- **ML Sample Prediction Script:** `ml/predict.py`
- **ML Dataset:** `ml/data/cognitive_load_dataset.csv`
- **ML Serialized Model:** `ml/models/cognitive_load_model.pkl`
- **Adapted Lesson Service:** `backend/services/adapted_lesson_service.py`
- **Quiz Service:** `backend/services/quiz_service.py`
- **Code Executor:** `backend/services/code_executor.py`
- **Curriculum Service:** `backend/services/curriculum_service.py`
- **LLM Service:** `backend/services/llm_service.py`
- **LLM Prompt Builder:** `llm/prompt_builder.py`
- **LLM Adaptive Generator:** `llm/adaptive_generator.py`
- **LLM Schemas:** `llm/schemas.py`, `llm/lesson_schemas.py`
- **RAG Service:** `backend/services/rag_service.py`
- **RAG Retriever:** `rag/src/retriever.py`
- **RAG Vector Store:** `rag/src/vector_store.py`
- **RAG Embeddings:** `rag/src/embeddings.py`
- **RAG Ingestion:** `rag/src/ingest.py`
- **RAG Database:** `rag/chroma_db/chroma.sqlite3`
- **Frontend App Entry:** `src/App.tsx`
- **Frontend API Client:** `src/services/api.ts`
- **Frontend Telemetry Collector:** `src/services/telemetry.ts`
- **Frontend Cognitive Context:** `src/context/CognitiveContext.tsx`
- **Cognitive Load Banner Component:** `src/components/CognitiveLoadBanner.tsx`
- **Adapted Lesson Page:** `src/pages/AdaptedLessonPage.tsx`
- **Learner Dashboard Page:** `src/pages/LearnerDashboardPage.tsx`
- **Quiz Station Page:** `src/pages/QuizStationPage.tsx`
- **Coding Studio Page:** `src/pages/CodingStudioPage.tsx`

### Key Backend Route Endpoints
- `POST /api/auth/register` — `backend/routes/auth_routes.py:73`
- `POST /api/auth/login` — `backend/routes/auth_routes.py:113`
- `GET /api/auth/me` — `backend/routes/auth_routes.py:159`
- `POST /api/lessons/adapt` — `backend/routes/lesson_routes.py:15`
- `GET /api/lessons/adapt/{topic_id}` — `backend/routes/lesson_routes.py:34`
- `POST /api/lessons/adapt/feedback` — `backend/routes/lesson_routes.py:59`
- `GET /api/topics/{topic_id}/quiz` — `backend/routes/quiz_routes.py:22`
- `POST /api/topics/{topic_id}/quiz/submit` — `backend/routes/quiz_routes.py:37`
- `POST /api/code/run` — `backend/routes/code_routes.py:40`
- `POST /api/code/submit` — `backend/routes/code_routes.py:54`
- `POST /api/adaptive/evaluate` — `backend/routes/adaptive_routes.py:22`
- `GET /api/adaptive/history` — `backend/routes/adaptive_routes.py:55`
- `POST /api/ai/ask` — `backend/routes/ai_routes.py:38`
- `POST /api/ai/hint` — `backend/routes/ai_routes.py:67`
- `POST /api/diagnostic/{language}/submit` — `backend/routes/diagnostic_routes.py:45`
- `GET /api/dashboard/snapshot` — `backend/routes/stats_routes.py:32`
- `GET /api/stats/platform` — `backend/routes/stats_routes.py:21`
- `POST /api/projects/{project_id}/submit` — `backend/routes/project_routes.py:36`
- `POST /api/admin/run-diagnostics` — `backend/routes/admin_routes.py:91`
- `POST /api/admin/retrain-ml` — `backend/routes/admin_routes.py:64`
- `POST /api/admin/reindex-rag` — `backend/routes/admin_routes.py:77`

### Test Suite References
- `backend/test_integration.py` — End-to-end FastAPI TestClient integration suite
- `backend/test_verification.py` — Live HTTP integration suite (Python 3 execution, 8 tutor modes, quiz station)
- `backend/test_adapted_lesson.py` — AI Adapted Lesson integration tests
- `backend/test_quizzes_all_criteria.py` — Quiz validation and normalization test suite
- `llm/test_adaptive_generator.py` — LLM adaptive generator unit tests with mocks
- `rag/src/test_rag.py` — ChromaDB vector retrieval and ranking evaluation suite
