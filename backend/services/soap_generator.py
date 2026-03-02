import json
from openai import OpenAI
import dotenv
dotenv.load_dotenv()
import os
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
) 

def generate_soap(transcript: str) -> dict:
    prompt = f"""
    You are an expert clinical assistant. Convert the following doctor-patient transcript into a structured SOAP note.
    Return ONLY a valid JSON object with the exact keys: "subjective", "objective", "assessment", "plan".
    Do not include markdown blocks or any other text.
    
    Transcript:
    "{transcript}"
    """
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        response_format={ "type": "json_object" } # Forces strict JSON return
    )
    
    try:
        soap_json = json.loads(response.choices[0].message.content)
        return soap_json
    except json.JSONDecodeError:
        raise ValueError("LLM failed to return valid JSON for SOAP note.")