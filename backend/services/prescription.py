import json
from openai import OpenAI
import os
import dotenv
dotenv.load_dotenv()
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

def extract_prescriptions(plan_text: str) -> list[dict]:
    prompt = f"""
    Extract all medications prescribed in the following treatment plan.
    Return ONLY a JSON array of objects with keys: "medicine_name", "dosage", "frequency", "duration".
    If no medications are found, return an empty array [].
    
    Plan:
    "{plan_text}"
    """
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        response_format={ "type": "json_object" } 
    )
    
    # OpenAI JSON mode requires a top-level object, so we wrap the array in prompt mentally, 
    # but practically we can instruct it to return an object containing the array.
    # Adjusting prompt logic for safe JSON parsing:
    prompt_adjusted = prompt + "\nWrap the array in a JSON object with the key 'prescriptions'."
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt_adjusted}],
        temperature=0.0,
        response_format={ "type": "json_object" }
    )
    
    try:
        data = json.loads(response.choices[0].message.content)
        return data.get("prescriptions", [])
    except json.JSONDecodeError:
        return []