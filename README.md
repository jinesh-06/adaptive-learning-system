# 🔄 Adaptive Learning System — Full Integration Branch

[![Branch](https://img.shields.io/badge/branch-feature%2Ffull--integration-blueviolet.svg)](https://github.com/jinesh-06/adaptive-learning-system/tree/feature/full-integration)
[![Integration Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](backend/test_verification.py)
[![Backend](https://img.shields.io/badge/FastAPI-0.100+-teal.svg)](backend/main.py)
[![Frontend](https://img.shields.io/badge/React%2018-TypeScript-blue.svg)](src/)

This branch represents the **complete end-to-end integration** of all individual subsystems into a cohesive, production-ready full-stack application. It bridges Member 1's Machine Learning Cognitive Load model, Member 2's RAG Knowledge Base, Member 3's Gemini LLM Adaptive Explanation Engine, and the React + Vite Frontend into a unified FastAPI backend.

---

## 🎯 Integration Goals & Achievements

| Milestone | Subsystem | Status | Description |
| :--- | :--- | :---: | :--- |
| **Cognitive ML Model** | Member 1 | ✅ **Integrated** | Connected Random Forest model to `/api/adaptive/evaluate` and `/api/topics/{id}/quiz/submit` to predict `LOW`, `MEDIUM`, and `HIGH` cognitive load. |
| **RAG Retrieval Engine** | Member 2 | ✅ **Integrated** | Embedded 32 textbook documents into ChromaDB (`all-MiniLM-L6-v2`), connected via `rag_service.py` to retrieve grounded lesson context. |
| **LLM Adaptive Generator**| Member 3 | ✅ **Integrated** | Integrated Google Gemini API across all 8 tutor modes (`EXPLAIN`, `SIMPLIFY`, `EXAMPLE`, `DEBUG`, `HINT`, `QUIZ`, `REVISE`, `ADVANCED`) with grounding fallbacks. |
| **Python 3 Sandbox** | Backend | ✅ **Integrated** | Native Python 3 execution sandbox with timeout control, input injection, and AST security inspection (disallowing Jython/unsafe modules). |
| **Quiz Station Contract** | Full-Stack | ✅ **Integrated** | Aligned frontend/backend contracts for quiz evaluation, dynamic difficulty tiering, and detailed question review mapping. |
| **React 18 SPA** | Frontend | ✅ **Integrated** | Responsive user interface with real-time Cognitive Load Alert Banners, 3-stage Learning Steppers, and Monaco Editor. |

---

## 🔄 End-to-End Data Pipeline

```
[ User Behavior / Telemetry ] ──► POST /api/adaptive/evaluate
                                         │
                                         ▼
                             [ ML Service (Member 1) ]
                                (Random Forest Model)
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
        [ Cognitive Load: HIGH ]                 [ Cognitive Load: LOW ]
                     │                                       │
                     ▼                                       ▼
   [ Adaptive Pacing: SIMPLIFY/HINT ]       [ Adaptive Pacing: ADVANCED/EXPLAIN ]
                     │                                       │
                     └───────────────────┬───────────────────┘
                                         ▼
                           [ In-Lesson AI Tutor Query ]
                                         │
                                         ▼
                            [ RAG Service (Member 2) ]
                             (ChromaDB + all-MiniLM)
                         Extracts Grounded Curriculum Text
                                         │
                                         ▼
                            [ LLM Service (Member 3) ]
                             (Gemini SDK / Generator)
                        Generates Structured Pedagogical Answer
                                         │
                                         ▼
                         [ React Monaco Code Sandbox ]
                       (Python 3 Native Execution Engine)
```

---

## 🚀 Running the Integrated System

### 1. Setup Environment
```bash
# Windows
Copy-Item .env.example .env

# Linux/macOS
cp .env.example .env
```
Ensure `GEMINI_API_KEY`, `BACKEND_PORT=5000`, and `VITE_API_URL=http://127.0.0.1:5000/api` are set.

### 2. Run Backend Server
```bash
pip install -r requirements.txt
python backend/main.py
```
*Backend runs on `http://127.0.0.1:5000` with interactive API docs at `/docs`.*

### 3. Run Frontend Client
```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🧪 Integration Verification

Run the full multi-module integration verification suite:

```bash
python backend/test_verification.py
```

This tests:
1. **Python 3 Execution**: Verifies execution, runtime type checks, stdout/stderr isolation, and security guards.
2. **RAG AI Tutor (8 Modes)**: Validates grounded answers across `EXPLAIN`, `SIMPLIFY`, `EXAMPLE`, `DEBUG`, `HINT`, `QUIZ`, `REVISE`, and `ADVANCED`.
3. **Quiz Station Contract**: Validates quiz fetching, submission, scoring, and review mappings.

```bash
python backend/test_integration.py
```
Validates all REST endpoints, authentication tokens, course hierarchies, and ML cognitive predictions.

---

## 📁 Key Integration Files

- [backend/main.py](file:///backend/main.py) — FastAPI application entry point.
- [backend/services/ml_service.py](file:///backend/services/ml_service.py) — ML model wrapper and feature pipeline.
- [backend/services/rag_service.py](file:///backend/services/rag_service.py) — ChromaDB semantic retriever integration.
- [backend/services/llm_service.py](file:///backend/services/llm_service.py) — Gemini LLM integration with grounded prompt building.
- [backend/routes/code_routes.py](file:///backend/routes/code_routes.py) — Secure Python 3 code execution sandbox.
- [backend/routes/quiz_routes.py](file:///backend/routes/quiz_routes.py) — Quiz evaluation and review generation.
- [src/pages/QuizStationPage.tsx](file:///src/pages/QuizStationPage.tsx) — Interactive Quiz Station component.
- [backend/test_verification.py](file:///backend/test_verification.py) — Automated test verification script.
