# 🧠 Cognitive Load Aware Adaptive Learning System

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, multi-agent educational platform that personalizes programming instruction in real time. By continuously assessing student cognitive load from behavioral signals and problem-solving telemetry, the system dynamically adapts curriculum pacing, lesson difficulty, in-editor AI tutor explanations, and practice challenges.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Core Subsystems](#-core-subsystems)
  - [1. Machine Learning Cognitive Engine](#1-machine-learning-cognitive-engine-member-1)
  - [2. RAG Knowledge & Retrieval System](#2-rag-knowledge--retrieval-system-member-2)
  - [3. LLM Adaptive Explanation Engine](#3-llm-adaptive-explanation-engine-member-3)
  - [4. Full-Stack Web Platform](#4-full-stack-web-platform-frontend--backend)
- [Project Directory Structure](#-project-directory-structure)
- [Tech Stack](#-tech-stack)
- [Installation & Quickstart](#-installation--quickstart)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Backend Installation & Startup](#3-backend-installation--startup)
  - [4. Frontend Installation & Startup](#4-frontend-installation--startup)
- [API Reference](#-api-reference)
- [Testing & Verification](#-testing--verification)
- [Git Branches & Team Structure](#-git-branches--team-structure)
- [License](#-license)

---

## 🌟 Overview

Traditional computer science learning platforms deliver static, one-size-fits-all content. When students face complex topics (e.g., pointers in C, recursion in Python, or virtual functions in C++), cognitive overload leads to frustration and high drop-out rates.

This **Adaptive Learning System** solves this through a closed-loop feedback pipeline:
1. **Tracks Behavioral Signals**: Captures time spent, hesitation intervals, keystroke rhythms, quiz attempt accuracy, code backtracking, and syntax error patterns.
2. **Predicts Cognitive Load**: Evaluates real-time signals using a trained Machine Learning model to classify mental state (`LOW`, `MEDIUM`, `HIGH`).
3. **Retrieves Grounded Knowledge**: Pulls semantically matched, authoritative curriculum content from a 32-document RAG vector store.
4. **Generates Adaptive AI Assistance**: Leverages Google Gemini with dynamic prompt structures tailored to the student's cognitive state (analogies for high load, deep architectural dives for low load).
5. **Calibrates Difficulty**: Automatically adjusts Quiz Station questions and coding challenge starter code to keep the learner in their optimal zone of proximal development.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 18 Frontend                               │
│  - Dashboard & Learning Stepper (Lesson ➔ Quiz ➔ Code Sandbox)         │
│  - Monaco Code Editor (Python 3 execution, real-time stdout/stderr)    │
│  - 8-Mode In-Lesson AI Tutor Sidebar & Cognitive Load Alert Banner     │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTP / REST APIs
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Server                          │
│                      (http://127.0.0.1:5000)                           │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  Auth & Users    │ Curriculum & Quiz│ Code Execution   │  Telemetry &  │
│  (/api/auth)     │ (/api/topics)    │ (/api/code/run)  │  Adaptive API │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴───────┬───────┘
         │                  │                  │                 │
         ▼                  ▼                  ▼                 ▼
┌──────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Member 1: ML     │ │ Member 2: RAG │ │ Member 3: LLM │ │ Python 3      │
│ Cognitive Load   │ │ ChromaDB &    │ │ Google Gemini │ │ Secure Run    │
│ Classifier       │ │ MiniLM-L6-v2  │ │ 8 Tutor Modes │ │ Sandbox       │
└──────────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

---

## 🧩 Core Subsystems

### 1. Machine Learning Cognitive Engine (Member 1)
- **Model**: Scikit-Learn Random Forest Classifier trained on student behavioral interaction datasets.
- **Input Features**: Keystroke timing, hesitation time (seconds), idle intervals, quiz score accuracy, backtracking count, code execution attempts.
- **Output Labels**: Cognitive Load classification (`LOW`, `MEDIUM`, `HIGH`) with confidence scoring.
- **Inference Pipeline**: [backend/services/ml_service.py](file:///backend/services/ml_service.py) & [ml/cognitive_load.py](file:///ml/cognitive_load.py).

### 2. RAG Knowledge & Retrieval System (Member 2)
- **Knowledge Base**: 32 curated textbook chapters covering C, C++, Python, and Java (8 comprehensive topics per language).
- **Embeddings**: SentenceTransformers `all-MiniLM-L6-v2` generating 384-dimensional dense semantic vectors.
- **Vector Database**: Persistent ChromaDB vector collection (`programming_knowledge`) with metadata filtering by language, topic, and learner level.
- **Implementation**: [rag/src/retriever.py](file:///rag/src/retriever.py) & [rag/src/indexer.py](file:///rag/src/indexer.py).

### 3. LLM Adaptive Explanation Engine (Member 3)
- **AI Model**: Google Gemini (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`).
- **8 Adaptive Tutor Modes**:
  1. `EXPLAIN`: Deep conceptual architectural breakdowns.
  2. `SIMPLIFY`: High-level real-world analogies (ideal for high cognitive load).
  3. `EXAMPLE`: Focused, runnable Python 3 code demonstrations.
  4. `DEBUG`: Bug diagnostics, common pitfalls, and error trace analysis.
  5. `HINT`: Socratic clues that guide without giving away answers.
  6. `QUIZ`: Formative concept validation questions.
  7. `REVISE`: Executive bullet-point lesson summaries.
  8. `ADVANCED`: Bytecode, memory models, and internal runtime mechanics.
- **Implementation**: [backend/services/llm_service.py](file:///backend/services/llm_service.py) & [llm/adaptive_generator.py](file:///llm/adaptive_generator.py).

### 4. Full-Stack Web Platform (Frontend & Backend)
- **Frontend**: Single-Page Application (SPA) built with React 18, Vite, TypeScript, and Tailwind CSS.
- **Interactive Monaco Editor**: Multi-tab code editor with syntax highlighting, input stream support, and instant execution output.
- **Quiz Station**: Interactive MCQs with dynamic difficulty adjustment and complete question review breakdowns.
- **Offline Fallback Engine**: In-browser execution (Pyodide) and mock state fallbacks ensuring zero disruptions if the network is disconnected.

---

## 📁 Project Directory Structure

```text
adaptive-learning-system/
├── backend/                  # FastAPI Application & Microservices
│   ├── main.py               # Server entry point & CORS configuration
│   ├── config.py             # App settings, environment vars, JWT secrets
│   ├── routes/               # API route handlers
│   │   ├── auth_routes.py    # Authentication, login, signup, preferences
│   │   ├── curriculum_routes.py # Courses and topic structures
│   │   ├── quiz_routes.py    # Quiz fetch & evaluation with review payloads
│   │   ├── code_routes.py    # Secure Python 3 code execution sandbox
│   │   ├── ai_routes.py      # In-lesson RAG AI Tutor endpoints
│   │   ├── adaptive_routes.py# Real-time cognitive load evaluation
│   │   ├── telemetry_routes.py # Interaction logging & behavioral signals
│   │   └── stats_routes.py   # Learner analytics & cognitive trajectories
│   ├── services/             # Core service integrations
│   │   ├── ml_service.py     # Random Forest ML model connector
│   │   ├── rag_service.py    # ChromaDB & semantic retrieval bridge
│   │   ├── llm_service.py    # Gemini API & grounded prompt builder
│   │   ├── curriculum_service.py # Courses, topics, quizzes, and exercises
│   │   └── state_store.py    # In-memory and persistent state store
│   ├── test_integration.py   # Full backend test suite
│   └── test_verification.py  # End-to-end multi-module verification script
├── ml/                       # Machine Learning Subsystem (Member 1)
│   ├── cognitive_load.py     # Training pipeline & behavioral model
│   ├── dataset/              # Student behavioral datasets
│   └── models/               # Saved model artifacts (.pkl)
├── rag/                      # RAG Subsystem (Member 2)
│   ├── documents/            # 32 Textbook chapters (C, CPP, PYTHON, JAVA)
│   ├── src/                  # Indexer, semantic chunker & retriever
│   ├── chromadb_store/       # Persistent vector database files
│   └── README.md             # Subsystem documentation
├── llm/                      # LLM Adaptive Engine (Member 3)
│   ├── adaptive_generator.py # Gemini generation pipeline
│   ├── prompt_builder.py     # Cognitive-load-aware system prompts
│   └── schemas.py            # Pydantic data schemas
├── src/                      # Frontend Application (React + Vite + TS)
│   ├── components/           # UI components (Monaco, Stepper, Banners)
│   ├── context/              # Auth, Cognitive Load, and Theme contexts
│   ├── pages/                # TopicLesson, QuizStation, Dashboard, Coding
│   ├── services/             # API client & Mock fallback system
│   └── data/                 # Platform curriculum definitions
├── package.json              # Frontend scripts & dependencies
├── requirements.txt          # Python dependencies
├── .env.example              # Template configuration file
└── README.md                 # Root documentation
```

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5, Vite 6, Tailwind CSS 3, Monaco Editor, Lucide Icons, Canvas Confetti |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2, PyJWT |
| **Machine Learning** | Scikit-Learn, Random Forest, NumPy, Pandas, Joblib |
| **RAG & Vector Store** | ChromaDB, Sentence-Transformers (`all-MiniLM-L6-v2`), PyTorch, HuggingFace |
| **Generative AI** | Google Gemini SDK (`google-genai`), Few-Shot Prompt Templates |
| **Code Execution** | Python 3 native subprocess sandbox (safe AST inspection + timeout enforcement) |

---

## 🚀 Installation & Quickstart

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.x or higher (with `npm`)
- **Git**
- *(Optional)* Google Gemini API Key (a built-in grounded RAG fallback engine activates if unconfigured or quota is exceeded)

---

### 1. Clone Repository

```bash
git clone https://github.com/jinesh-06/adaptive-learning-system.git
cd adaptive-learning-system
```

---

### 2. Environment Configuration

Copy the example environment configuration:

```bash
# On Windows PowerShell
Copy-Item .env.example .env

# On Linux/macOS
cp .env.example .env
```

Ensure your `.env` contains:
```env
# Gemini API Key (Get from https://aistudio.google.com/)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Backend Server Configuration
BACKEND_HOST=127.0.0.1
BACKEND_PORT=5000
JWT_SECRET=cognitive-adaptive-secret-key-2026

# Frontend Configuration
VITE_API_URL=http://127.0.0.1:5000/api
```

---

### 3. Backend Installation & Startup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the FastAPI backend server**:
   ```bash
   npm run server
   # Or directly:
   python backend/main.py
   ```
   *The backend will be running at `http://127.0.0.1:5000` (Swagger docs at `http://127.0.0.1:5000/docs`).*

---

### 4. Frontend Installation & Startup

1. **Open a new terminal and install NPM dependencies**:
   ```bash
   npm install
   ```
2. **Start the Vite dev server**:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:3000/
   ```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate learner and receive JWT token |
| `GET` | `/api/courses` | List all available programming courses |
| `GET` | `/api/topics/{id}` | Get lesson content, syntax, and section details |
| `GET` | `/api/topics/{id}/quiz` | Retrieve topic quiz questions & difficulty tier |
| `POST` | `/api/topics/{id}/quiz/submit` | Submit answers, evaluate ML cognitive load, return review breakdown |
| `POST` | `/api/code/run` | Execute Python 3 code in sandbox with input test cases |
| `POST` | `/api/ai/ask` | In-lesson RAG AI Tutor query across 8 pedagogical modes |
| `POST` | `/api/adaptive/evaluate` | Evaluate behavioral telemetry and update cognitive state |

---

## 🧪 Testing & Verification

The repository includes comprehensive automated test suites covering all modules:

### Run Full Integration Test Suite:
```bash
python backend/test_verification.py
```
This script tests:
1. **Python 3 Sandbox**: Validates clean execution, typing, and security guards.
2. **RAG AI Tutor (8 Modes)**: Validates semantic retrieval across all 8 tutor modes.
3. **Quiz Station Data Flow**: Verifies MCQ generation, score evaluation, and question review payloads.

### Run Backend Unit Tests:
```bash
python backend/test_integration.py
```

### Build Frontend Production Assets:
```bash
npm run build
```

---

## 🌿 Git Branches & Team Structure

| Branch Name | Subsystem / Focus | Owner |
| :--- | :--- | :--- |
| **`main`** | Production integration combining ML, RAG, LLM, and Frontend | Team Lead |
| **`feature/full-integration`** | Multi-service API bridges, contract alignment, and end-to-end tests | Integration |
| **`frontend-backend`** | React UI, Monaco Editor, Tailwind CSS, and FastAPI routing | Full-Stack |
| **`ml-development`** | Behavioral dataset, Random Forest Cognitive Load Model, inference API | Member 1 |
| **`rag-development`** | 32 Curriculum documents, ChromaDB vector store, SentenceTransformers | Member 2 |
| **`llm-development`** | Google Gemini prompt engineering, 8 tutor modes, and schema validation | Member 3 |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
