"""
Prediction Script for Cognitive Load Model
Author: Member 1 (ML Engineer)
Project: Adaptive Learning System

This script loads the trained model from ml/models/cognitive_load_model.pkl
and demonstrates a sample prediction using student behavioral features.
"""

import os
import joblib
import pandas as pd

# Paths setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "cognitive_load_model.pkl")


def main():
    print("=" * 50)
    print("COGNITIVE LOAD PREDICTION")
    print("=" * 50)

    # 1. Load the trained model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at: {MODEL_PATH}. Please run 'python ml/cognitive_load.py' first."
        )

    print(f"Loading model from: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)

    # 2. Define example input features
    time_spent_minutes = 45
    scroll_speed = 2.5
    rereads = 4
    backtracking = 3
    quiz_attempts = 2
    hesitation_time_seconds = 12
    accuracy = 65

    sample_features = {
        "time_spent_minutes": time_spent_minutes,
        "scroll_speed": scroll_speed,
        "rereads": rereads,
        "backtracking": backtracking,
        "quiz_attempts": quiz_attempts,
        "hesitation_time_seconds": hesitation_time_seconds,
        "accuracy": accuracy
    }

    print("\nInput Features:")
    for key, value in sample_features.items():
        print(f"  - {key}: {value}")

    # 3. Prepare input DataFrame
    input_df = pd.DataFrame([sample_features])

    # 4. Predict cognitive load
    prediction = model.predict(input_df)[0]

    # 5. Print prediction result
    print("-" * 50)
    print(f"Predicted Cognitive Load: {prediction}")
    print("-" * 50)


if __name__ == "__main__":
    main()
