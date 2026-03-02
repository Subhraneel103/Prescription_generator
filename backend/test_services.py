# test_services.py
from services.transcription import transcribe_audio
from services.soap_generator import generate_soap
from services.prescription import extract_prescriptions

print("--- Testing Whisper ---")
transcript = transcribe_audio("test_audio.m4a")
print(f"Transcript: {transcript}")
print("\n--- Testing SOAP LLM ---")
soap = generate_soap(transcript)
print(f"SOAP JSON: {soap}")
print("\n--- Testing Prescription LLM ---")
rx = extract_prescriptions(soap.get('plan', ''))
print(f"Prescriptions: {rx}")

# print("\n--- Testing SOAP LLM ---")
# dummy_transcript = "Patient complains of a severe headache for 3 days. BP is 140/90. I think it's tension headache. Take Ibuprofen 400mg twice a day for 3 days."
# soap = generate_soap(dummy_transcript)
# print(f"SOAP JSON: {soap}")

# print("\n--- Testing Prescription LLM ---")
# rx = extract_prescriptions(soap.get('plan', ''))
# print(f"Prescriptions: {rx}")