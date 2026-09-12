# LLM / Gemini Adaptive Explanation Module (Member 3)

Part of the **Cognitive Load-Aware Adaptive Learning Engine**.

---

## 1. Purpose of the Module

The **LLM / Gemini Adaptive Explanation Module** dynamically generates educational explanations tailored to the learner's predicted cognitive load (`LOW`, `MEDIUM`, or `HIGH`). It grounds all explanations in retrieved knowledge contexts provided by the RAG subsystem (Member 2), preventing hallucinations while calibrating complexity, length, vocabulary, structure, and examples.

---

## 2. Installation & Dependencies

Compatible with Python 3.11+. Install dependencies using:

```bash
pip install google-genai python-dotenv pydantic
```

---

## 3. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

* **`GEMINI_API_KEY`** *(Required)*: Your Google Gemini API Key. Never hardcode or commit this key to version control.
* **`GEMINI_MODEL`** *(Optional)*: The Gemini model to target. Defaults to `gemini-2.5-flash`.

---

## 4. Input Format

The module expects:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `question` | `str` | Yes | The student's inquiry (non-empty). |
| `retrieved_context` | `str` | Yes | Grounding text retrieved from RAG (Member 2). |
| `cognitive_load` | `str` / `Enum` | Yes | `"LOW"`, `"MEDIUM"`, or `"HIGH"` (case/whitespace insensitive). |
| `topic` | `str` | Optional | Subject domain or concept tag (e.g., `"Biology"`). |

---

## 5. Output Format

The generator returns a predictable dictionary conforming to `AdaptiveResponse`:

### Success Response
```json
{
  "success": true,
  "cognitive_load": "HIGH",
  "question": "What is photosynthesis?",
  "explanation": "Photosynthesis is how green plants make their food using sunlight...",
  "adaptation": {
    "detail_level": "low",
    "style": "step-by-step",
    "examples": 1
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation error: Question cannot be empty."
}
```

---

## 6. Cognitive Load Adaptation Behavior

| Level | Learner State | Explanation Strategy | Structure & Style |
| :--- | :--- | :--- | :--- |
| **`LOW`** | Comfortable / High mastery | In-depth conceptual reasoning, moderate-to-advanced technical terminology, 2+ rich examples, interdisciplinary connections, and a critical-thinking challenge question. | Concept &rarr; Deep explanation &rarr; Why it works &rarr; Examples &rarr; Real-world connection &rarr; Challenge question |
| **`MEDIUM`** | Standard support needed | Balanced explanation, clear vocabulary, 1-2 practical examples, key steps, and concise summary without dense theoretical tangents. | Simple definition &rarr; Key explanation &rarr; Example &rarr; Short summary |
| **`HIGH`** | Struggling / Cognitive overload | Maximum cognitive load reduction: plain vocabulary, bite-sized numbered steps, short paragraphs (<=3 sentences), 1 simple everyday analogy, and a 2-3 bullet quick recap. | Simple definition &rarr; Step 1 &rarr; Step 2 &rarr; Simple example &rarr; 2-3 point recap |

---

## 7. How to Run Tests

### Run Automated Unit Tests
```bash
python -m unittest llm/test_adaptive_generator.py -v
```

### Run Standalone Demo & Tests
```bash
python -m llm.test_adaptive_generator
```

*All unit tests use mock clients and run reliably even without an active internet connection or `GEMINI_API_KEY`.*

---

## 8. Integration Guide for Member 4 (Backend / API)

Member 4 can import and use the generator directly without managing Gemini internals:

### Direct Python Usage
```python
from llm import generate_adaptive_explanation

response = generate_adaptive_explanation(
    question="What is photosynthesis?",
    retrieved_context="Photosynthesis is the process through which green plants use sunlight, water, and CO2 to produce glucose and oxygen.",
    cognitive_load="HIGH",
    topic="Biology"
)

if response["success"]:
    print(response["explanation"])
else:
    print(f"Error: {response['error']}")
```

### FastAPI Endpoint Integration Snippet
```python
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from llm import generate_adaptive_explanation

router = APIRouter(prefix="/api")

class AdaptiveExplanationRequest(BaseModel):
    question: str
    retrieved_context: str
    cognitive_load: str
    topic: Optional[str] = None

@router.post("/adaptive-explanation")
def create_adaptive_explanation(payload: AdaptiveExplanationRequest):
    return generate_adaptive_explanation(
        question=payload.question,
        retrieved_context=payload.retrieved_context,
        cognitive_load=payload.cognitive_load,
        topic=payload.topic,
    )
```

---

## 9. Example Request & Response

### Request
```json
{
  "question": "What is photosynthesis?",
  "retrieved_context": "Photosynthesis is the process by which green plants use sunlight, water and carbon dioxide to produce glucose and oxygen.",
  "cognitive_load": "HIGH",
  "topic": "Biology"
}
```

### Response
```json
{
  "success": true,
  "cognitive_load": "HIGH",
  "question": "What is photosynthesis?",
  "explanation": "Photosynthesis is how green plants make their food using sunlight.\n\n1. Plant leaves absorb sunlight and carbon dioxide from the air.\n2. Plant roots draw water up from the soil.\n3. The plant combines sunlight, water, and gas to make sugar (glucose) and oxygen.\n\nSimple Example: Think of a plant leaf as a solar-powered kitchen baking sugar!\n\nQuick Recap:\n- Uses sunlight, water, and carbon dioxide.\n- Makes food (glucose) for the plant.\n- Releases fresh oxygen into the air.",
  "adaptation": {
    "detail_level": "low",
    "style": "step-by-step",
    "examples": 1
  }
}
```
