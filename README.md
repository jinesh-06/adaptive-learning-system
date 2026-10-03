# Cognitive Load-Aware Adaptive Learning System

An adaptive learning platform that personalizes programming instruction using learner activity signals, machine learning, retrieval-augmented generation (RAG), and generative AI. The system is designed to adjust lesson explanations, practice difficulty, and learning pace while keeping learners involved in the learning process.

> **Project status:** Integrated development project. Verify the current implementation and environment variables in the repository before deploying.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Install Backend Dependencies](#3-install-backend-dependencies)
  - [4. Start the Backend](#4-start-the-backend)
  - [5. Install Frontend Dependencies](#5-install-frontend-dependencies)
  - [6. Start the Frontend](#6-start-the-frontend)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Testing and Verification](#testing-and-verification)
- [Git Branches](#git-branches)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Traditional learning platforms often provide the same material to every learner, regardless of their progress or difficulty with a topic. This project explores a feedback-driven approach to programming education.

The platform uses learning signals—such as time spent, hesitation, quiz performance, code attempts, and backtracking—to estimate when a learner may benefit from a different explanation or level of challenge. It combines those signals with curriculum retrieval and AI-generated assistance to support a more responsive learning experience.

The system is intended to support courses and topics in languages such as Python, C, C++, and Java. The available lessons and features depend on the current repository data and implementation.

## Key Features

- **Adaptive learning insights:** Uses learner interaction signals to estimate learning difficulty and inform possible adaptations.
- **Machine learning component:** Includes a Random Forest-based classification pipeline for cognitive-load estimation.
- **Retrieval-Augmented Generation (RAG):** Retrieves relevant curriculum material to ground AI assistance in learning content.
- **AI tutor modes:** Supports explanation, simplification, examples, debugging help, hints, quizzes, revision, and advanced explanations.
- **Interactive lessons and quizzes:** Provides structured learning content and knowledge checks.
- **Code practice:** Includes an editor and code-execution workflow for supported exercises.
- **Learner analytics:** Tracks progress and learning activity where supported by the current implementation.
- **Fallback behavior:** Includes fallback paths for selected services or disconnected environments.

## How It Works

1. **Capture learning signals:** The application records supported interactions, such as time spent, quiz responses, code attempts, and backtracking.
2. **Estimate learning load:** The machine learning service processes available signals and returns a predicted class, such as `LOW`, `MEDIUM`, or `HIGH`.
3. **Retrieve relevant material:** The RAG subsystem searches curriculum documents for context related to the learner's question or lesson.
4. **Generate assistance:** The LLM subsystem uses retrieved context and the selected tutor mode to generate an explanation or learning aid.
5. **Support adaptation:** The application can present a suggested change in explanation or difficulty. Learners should remain able to review and control learning adaptations.

Predictions are estimates based on available signals; they should not be treated as medical or psychological assessments.

## System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│ Dashboard • Lessons • Quizzes • Code Editor • AI Tutor       │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP / REST
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│ Authentication • Curriculum • Quiz • Code • Telemetry        │
│ Adaptive Insights • AI Tutor • Progress                       │
└───────────────┬────────────────┬────────────────┬────────────┘
                │                │                │
                ▼                ▼                ▼
       ┌────────────────┐ ┌──────────────┐ ┌─────────────────┐
       │ ML Subsystem   │ │ RAG Subsystem│ │ LLM Subsystem   │
       │ Random Forest  │ │ ChromaDB     │ │ Google Gemini   │
       │ Load estimate  │ │ Retrieval    │ │ Tutor responses │
       └────────────────┘ └──────────────┘ └─────────────────┘
```

The actual server framework, route names, and port configuration should be confirmed against the checked-out code and environment configuration.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| UI and code editor | Monaco Editor, Lucide Icons |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Machine learning | Scikit-learn, Random Forest, NumPy, Pandas, Joblib |
| RAG | ChromaDB, Sentence Transformers |
| Generative AI | Google Gemini SDK |
| Code practice | Python execution workflow and browser-based fallback where configured |
| Version control | Git and GitHub |

---

## Repository Structure

The following is a high-level guide. Individual files and folders may vary by branch or project version.

```text
adaptive-learning-system/
├── backend/
│   ├── main.py                 # Backend entry point
│   ├── config.py               # Configuration and environment settings
│   ├── routes/                 # API route handlers
│   ├── services/               # ML, RAG, LLM, curriculum, and state services
│   └── test_*.py               # Backend tests and verification scripts
├── ml/
│   ├── cognitive_load.py       # ML training and inference logic
│   ├── dataset/                # Training data
│   └── models/                 # Saved model artifacts
├── rag/
│   ├── documents/              # Curriculum source documents
│   ├── src/                    # Indexing and retrieval code
│   └── README.md               # RAG subsystem documentation
├── llm/
│   ├── adaptive_generator.py   # AI response generation
│   ├── prompt_builder.py       # Prompt construction
│   └── schemas.py              # Data schemas
├── src/
│   ├── components/             # Reusable frontend components
│   ├── context/                # Application contexts
│   ├── pages/                  # Application pages
│   ├── services/               # API clients and fallback logic
│   └── data/                   # Frontend curriculum data
├── package.json                # Frontend scripts and dependencies
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variable template
└── README.md
```

## Prerequisites

Install the following before running the project:

- Python 3.10 or later
- Node.js 18 or later and npm
- Git
- A Google Gemini API key if you want to use Gemini-powered features

Some machine-learning and embedding packages may download model files the first time they are used. An internet connection may be required for that initial setup.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jinesh-06/adaptive-learning-system.git
cd adaptive-learning-system
```

### 2. Configure Environment Variables

Create a local `.env` file from the example:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

Open `.env` and set the values required by your local configuration. Do not commit the `.env` file or put real API keys in source code.

### 3. Install Backend Dependencies

From the repository root, create and activate a virtual environment if desired.

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 4. Start the Backend

Use the backend command configured in your project. The repository documentation currently lists:

```bash
npm run server
```

Alternatively, if the Python entry point is configured for direct execution:

```bash
python backend/main.py
```

Check the startup logs for the actual host and port. If the API exposes interactive documentation, open:

```text
http://127.0.0.1:5000/docs
```

If this address does not load, check the backend logs and configuration for the correct port.

### 5. Install Frontend Dependencies

Open a second terminal in the repository root:

```bash
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal. By default, Vite serves the frontend at:

```text
http://localhost:5173/
```

If Vite selects a different port, use the URL shown in the terminal.

---

## Environment Variables

Use `.env.example` as the source of truth for the variable names supported by the current codebase. A typical local configuration may include values similar to the following:

```dotenv
# Generative AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Backend
BACKEND_HOST=127.0.0.1
BACKEND_PORT=5000
JWT_SECRET=replace_with_a_long_random_secret

# Frontend API base URL
# Do not include /api here; the frontend adds it automatically.
VITE_API_URL=http://localhost:5000
```

These are example names and development values. Confirm the exact variables consumed by the application before using them. Generate a unique, strong secret for `JWT_SECRET`; never use the example value in production.

---

## API Reference

The following routes are described by the project documentation. Confirm the current route definitions in `backend/routes/` before relying on them, as endpoints can change during development.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate a learner |
| `GET` | `/api/courses` | List available courses |
| `GET` | `/api/topics/{id}` | Retrieve lesson content |
| `GET` | `/api/topics/{id}/quiz` | Retrieve quiz questions |
| `POST` | `/api/topics/{id}/quiz/submit` | Submit quiz answers |
| `POST` | `/api/code/run` | Run supported code exercises |
| `POST` | `/api/ai/ask` | Ask the in-lesson AI tutor |
| `POST` | `/api/adaptive/evaluate` | Evaluate available learning signals |

For a running FastAPI server, interactive API documentation is commonly available at `/docs` on the backend host and port.

## AI Tutor Modes

The project documentation describes these tutor modes:

| Mode | Purpose |
|---|---|
| `EXPLAIN` | Detailed conceptual explanations |
| `SIMPLIFY` | Simpler explanations and analogies |
| `EXAMPLE` | Focused code demonstrations |
| `DEBUG` | Help understanding errors and debugging |
| `HINT` | Guided clues without immediately giving the answer |
| `QUIZ` | Questions to check understanding |
| `REVISE` | Concise lesson revision |
| `ADVANCED` | Deeper technical details |

The modes and their exact behavior depend on the active LLM implementation and prompt configuration.

## Testing and Verification

Run the tests that are available in the current checkout.

The project documentation lists these commands:

**Integration verification**

```bash
python backend/test_verification.py
```

**Backend integration tests**

```bash
python backend/test_integration.py
```

**Frontend production build**

```bash
npm run build
```

A successful frontend build verifies compilation and bundling; it does not by itself confirm that every backend integration or user flow works. Test authentication, lessons, quizzes, AI responses, and code execution in the running application before deployment.

---

## Git Branches

The repository has used the following branches for development:

| Branch | Focus |
|---|---|
| `main` | Integrated project branch |
| `feature/full-integration` | Integration work and cross-module alignment |
| `frontend-backend` | Frontend and backend development |
| `ml-development` | Machine-learning subsystem |
| `rag-development` | Retrieval and curriculum knowledge base |
| `llm-development` | Gemini integration and adaptive generation |

Branch availability and ownership can change. Check the repository's current branch list before creating or merging work.

## Security Notes

- Keep `.env` out of Git. Commit `.env.example` with placeholders only.
- Never publish API keys, passwords, tokens, or private credentials.
- Use a strong, unique secret for authentication in any deployed environment.
- Apply appropriate authentication, authorization, input validation, and execution limits to backend endpoints.
- Treat learner telemetry as sensitive application data. Collect only what is needed and explain its use to learners.
- Review the code-execution design and deployment isolation before exposing code execution to untrusted users.
- Do not treat estimated cognitive-load classes as clinical or psychological diagnoses.

## Troubleshooting

### Frontend cannot reach the backend

1. Confirm the backend is running.
2. Check the API base URL in the frontend environment.
3. Confirm that the backend CORS configuration allows the frontend origin.
4. Review the browser console and backend logs for the failing route.

### Gemini-powered responses are unavailable

1. Confirm that `GEMINI_API_KEY` is set in the backend environment.
2. Restart the backend after changing environment variables.
3. Check the backend logs for authentication, quota, or model errors.
4. Verify that the configured model is supported by the installed SDK and account.

### Python package installation fails

1. Confirm that the active Python version meets the project's requirements.
2. Activate the intended virtual environment.
3. Upgrade pip and retry the installation.
4. Review package-specific installation notes for your operating system.

### A documented endpoint returns 404

The route may have changed or may not be registered in the current backend. Inspect the route modules and the running API documentation rather than assuming the README endpoint list is current.

---

## Contributing

1. Create a feature branch from the appropriate base branch.
2. Keep changes focused and follow the existing project structure.
3. Run relevant tests and the frontend build before submitting changes.
4. Update documentation when APIs, configuration, or setup steps change.
5. Never include secrets or local environment files in commits.

## License

This repository does not currently include a `LICENSE` file in the checked-out project. If you plan to distribute or publish the project, add the appropriate open-source license before doing so.
