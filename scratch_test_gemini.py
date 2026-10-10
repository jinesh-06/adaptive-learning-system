from llm.config import get_gemini_client, get_model_name
from google.genai import types

client = get_gemini_client()
resp = client.models.generate_content(
    model=get_model_name(),
    contents='Respond strictly with valid JSON: {"status": "ok", "message": "Gemini JSON mode works"}',
    config=types.GenerateContentConfig(response_mime_type="application/json")
)
print("Response text:", resp.text)
