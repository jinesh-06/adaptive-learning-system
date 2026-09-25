# Cognitive Load Prediction Model

This Machine Learning component is built for the **Adaptive Learning System** by **Member 1 (ML Engineer)**.

It analyzes real-time student engagement and behavioral patterns to predict their cognitive load level as **LOW**, **MEDIUM**, or **HIGH**. The adaptive engine can then tailor the difficulty, pace, or explanations accordingly.

---

## 1. What the Cognitive Load Model Does

During an online learning session, students exhibit specific behavioral signals (such as reading pace, hesitating before answering, or repeatedly backtracking across pages). 

This model takes these behavioral signals and classifies the student's cognitive state:
- **LOW**: The student finds the material easy, understands the content quickly, and experiences minimal friction.
- **MEDIUM**: The student is moderately engaged, processing information with normal pauses and reasonable comprehension.
- **HIGH**: The student is struggling, experiencing confusion or cognitive overload, and may require assistance or simplified explanations.

---

## 2. Input Features

The model uses 7 input features representing student interaction:

| Feature Name | Data Type | Description |
|---|---|---|
| `time_spent_minutes` | Float / Int | Total duration the student spent on the module (in minutes). |
| `scroll_speed` | Float | Average scrolling pace (pixels/second or normalized index). |
| `rereads` | Integer | Number of times the student re-read a paragraph or section. |
| `backtracking` | Integer | Number of times the student navigated back to previous slides or pages. |
| `quiz_attempts` | Integer | Number of attempts taken on practice questions/quizzes. |
| `hesitation_time_seconds` | Float / Int | Time elapsed before the student took action or submitted an answer. |
| `accuracy` | Float / Int | Percentage score on questions or quizzes (0 to 100). |

---

## 3. Output Classes

The target variable is `cognitive_load`, which outputs one of three categories:
- **LOW**
- **MEDIUM**
- **HIGH**

---

## 4. Algorithm Used

- **Algorithm**: `RandomForestClassifier` from `scikit-learn`
- **Parameters**: `n_estimators=100`, `random_state=42`
- **Why Random Forest?**
  - Handles non-linear relationships between engagement features effectively.
  - Robust against overfitting through ensemble averaging.
  - Fast inference time, ideal for real-time backend API integration.

---

## 5. How to Install Dependencies

Make sure you have Python 3.9+ installed. From the project root, install required packages:

```bash
pip install -r requirements.txt
```

Or install them directly:

```bash
pip install pandas scikit-learn joblib
```

---

## 6. How to Train the Model

Run the training script from the project root:

```bash
python ml/cognitive_load.py
```

This will:
1. Load `ml/data/cognitive_load_dataset.csv`.
2. Check data validity and split into 80% train and 20% test sets (`random_state=42`).
3. Train the `RandomForestClassifier`.
4. Evaluate and display metrics (Accuracy, Precision, Recall, F1-score, and Classification Report).
5. Save the trained model artifact to `ml/models/cognitive_load_model.pkl`.

---

## 7. How to Run Prediction

To test inference on a sample student profile:

```bash
python ml/predict.py
```

Sample output:
```text
==================================================
COGNITIVE LOAD PREDICTION
==================================================
Loading model from: .../ml/models/cognitive_load_model.pkl

Input Features:
  - time_spent_minutes: 45
  - scroll_speed: 2.5
  - rereads: 4
  - backtracking: 3
  - quiz_attempts: 2
  - hesitation_time_seconds: 12
  - accuracy: 65
--------------------------------------------------
Predicted Cognitive Load: HIGH
--------------------------------------------------
```

---

## 8. Expected Integration Format for Backend (FastAPI Developer)

The backend developer can directly import and call the `predict_cognitive_load` helper function from `ml.cognitive_load`.

### Python Import & Call:

```python
from ml.cognitive_load import predict_cognitive_load

# Input payload as a standard Python dictionary
student_features = {
    "time_spent_minutes": 45,
    "scroll_speed": 2.5,
    "rereads": 4,
    "backtracking": 3,
    "quiz_attempts": 2,
    "hesitation_time_seconds": 12,
    "accuracy": 65
}

prediction = predict_cognitive_load(student_features)
# prediction will be: "HIGH"
```

### JSON Request / Response Schema:

**Request (POST body):**
```json
{
    "time_spent_minutes": 45,
    "scroll_speed": 2.5,
    "rereads": 4,
    "backtracking": 3,
    "quiz_attempts": 2,
    "hesitation_time_seconds": 12,
    "accuracy": 65
}
```

**Response:**
```json
{
    "cognitive_load": "HIGH"
}
```
