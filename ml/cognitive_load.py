"""
Cognitive Load Prediction Model
Author: Member 1 (ML Engineer)
Project: Adaptive Learning System

This script:
1. Loads the student behavioral dataset.
2. Trains a Random Forest Classifier to predict cognitive load (LOW, MEDIUM, HIGH).
3. Evaluates performance (Accuracy, Precision, Recall, F1-score).
4. Saves the trained model to ml/models/cognitive_load_model.pkl.
5. Provides a clean predict_cognitive_load() function for backend integration.
"""

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)
import joblib

# Paths setup (relative to this script's directory for robust execution)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "data", "cognitive_load_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "cognitive_load_model.pkl")

# Define the exact 7 features required by the system
FEATURE_COLUMNS = [
    "time_spent_minutes",
    "scroll_speed",
    "rereads",
    "backtracking",
    "quiz_attempts",
    "hesitation_time_seconds",
    "accuracy"
]

TARGET_COLUMN = "cognitive_load"


def train_model():
    """
    Loads dataset, trains RandomForestClassifier, prints evaluation metrics,
    and saves model to disk.
    """
    print("=" * 50)
    print("TRAINING COGNITIVE LOAD CLASSIFIER")
    print("=" * 50)

    # 1. Load the dataset
    print(f"\n[1] Loading dataset from: {DATASET_PATH}")
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset file not found at: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    print(f"    Dataset loaded successfully with {df.shape[0]} rows and {df.shape[1]} columns.")

    # 2. Check for missing values
    missing_counts = df.isnull().sum().sum()
    print(f"    Missing values in dataset: {missing_counts}")
    if missing_counts > 0:
        print("    Dropping missing values...")
        df = df.dropna()

    # 3. Separate features (X) and target (y)
    print("\n[2] Separating features (X) and target (y)...")
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    print(f"    Features: {FEATURE_COLUMNS}")
    print(f"    Target classes: {list(y.unique())}")

    # 4. Split data into training and testing sets (80% train, 20% test)
    print("\n[3] Splitting dataset into train (80%) and test (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"    Training samples: {len(X_train)}")
    print(f"    Testing samples:  {len(X_test)}")

    # 5. Train Random Forest Classifier
    print("\n[4] Training RandomForestClassifier (n_estimators=100, random_state=42)...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    print("    Model training completed.")

    # 6. Predict test data and evaluate
    print("\n[5] Evaluating model performance on test set...")
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted")
    rec = recall_score(y_test, y_pred, average="weighted")
    f1 = f1_score(y_test, y_pred, average="weighted")

    print("\n--- Model Metrics ---")
    print(f"Accuracy:  {acc:.4f} ({acc * 100:.2f}%)")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-score:  {f1:.4f}")

    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred))

    # 7. Print sample test predictions
    print("--- Sample Predictions vs Actual ---")
    sample_df = X_test.head(5).copy()
    sample_df["Actual"] = y_test.head(5).values
    sample_df["Predicted"] = y_pred[:5]
    print(sample_df[["Actual", "Predicted"]])

    # 8. Save trained model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\n[6] Trained model saved successfully to: {MODEL_PATH}")

    return model, {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1
    }


# Global model cache to avoid re-loading from disk on every API call
_CACHED_MODEL = None


def get_model(model_path=None):
    """
    Loads and caches the model for fast inference.
    """
    global _CACHED_MODEL
    if _CACHED_MODEL is not None:
        return _CACHED_MODEL

    path = model_path or MODEL_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found at: {path}. Please run training first.")

    _CACHED_MODEL = joblib.load(path)
    return _CACHED_MODEL


def predict_cognitive_load(features, model_path=None):
    """
    Predicts the cognitive load for a student given behavioral features.
    
    This function provides a clean, simple interface for the backend / FastAPI developer.

    Expected input format:
    ----------------------
    features: dict
        {
            "time_spent_minutes": 45,
            "scroll_speed": 2.5,
            "rereads": 4,
            "backtracking": 3,
            "quiz_attempts": 2,
            "hesitation_time_seconds": 12,
            "accuracy": 65
        }

    Returns:
    --------
    str: Exactly one of "LOW", "MEDIUM", "HIGH"
    """
    model = get_model(model_path)

    # Validate that all required keys are present
    missing_keys = [col for col in FEATURE_COLUMNS if col not in features]
    if missing_keys:
        raise ValueError(f"Missing required feature keys: {missing_keys}")

    # Build single-row DataFrame in the exact training feature order
    input_data = {col: [features[col]] for col in FEATURE_COLUMNS}
    input_df = pd.DataFrame(input_data)

    # Predict
    prediction = model.predict(input_df)[0]
    return str(prediction)


if __name__ == "__main__":
    train_model()
