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
    You are a professional clinical pharmacist. Extract medications from the treatment plan into a structured JSON array.
    
    STANDARDS TO FOLLOW:
    1. DOSAGE: Use metric units (mg, mcg, ml) or counts (1 tab, 2 caps).
    2. FREQUENCY: Convert to standard clinical shorthand:
       - "1-0-1" (Twice daily: Morning and Night)
       - "1-1-1" (Thrice daily)
       - "1-0-0" (Once daily: Morning / OD)
       - "0-0-1" (Once daily: Night / HS)
       - "SOS" (Only when needed / PRN)
    3. TIMING: Note if "Before Food" (AC) or "After Food" (PC).

    Return ONLY a JSON array of objects with keys: 
    "medicine_name", "dosage", "frequency", "timing", "duration".
    If no medications are found, return [].

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