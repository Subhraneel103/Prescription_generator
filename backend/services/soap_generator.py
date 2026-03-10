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
    You are a professional medical scribe. Convert the transcript into a high-accuracy, structured SOAP note.
    
    STRICT DEFINITIONS FOR JSON KEYS:
    1. "subjective": Patient's reported symptoms, pain levels, and history.
    2. "objective": ONLY physical exam findings (e.g., "BP 120/80", "Clear lungs"). 
       - CRITICAL: NEVER include medications, prescriptions, or follow-up orders here.
    3. "assessment": Clinical diagnosis or impression.
    4. "plan": ALL therapeutic interventions, including new/continued medications, dosages, frequency, and follow-up. 
       - CRITICAL: If a medication is mentioned as a treatment, it MUST be placed here. Never put dosages in the name of the medicine. It should be separate. For example, if i am saying Paracetamol 650 mg that means 650 mg is the dosage and name is only Paracetamol. If the intake route is not mentioned consider oral. Also if some term looks unfamiliar or weird with respect to the context then try to understand whether that could be an existing medicine name that exists in the market

    OUTPUT RULES:
    - Return ONLY a valid JSON object.
    - If a section has no data, use "Not discussed".
    - No markdown formatting, no backticks, no preamble.

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