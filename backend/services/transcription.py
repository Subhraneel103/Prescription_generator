import whisper
import torch

# Load model globally to save memory
# Use fp16=False to prevent the CPU warning/error
model = whisper.load_model("base", device="cpu")

def transcribe_audio(file_path):
    try:
        prompt="""
            Patient presents with symptoms. Medications: Paracetamol, Pantocid, Amoxiclav, Azithromycin, Amlodipine, Telmisartan, Metformin, Glycomet, Cetirizine, Montelukast, Limcee, Calpol, Augmentin, Dolo etc. Dosages: 500mg, 650mg, 5mg, 40mg,300mg,1000mg. Instructions: 1-0-1, 1-1-1, 1-0-0, 0-0-1, BD, TID, OD, HS, SOS, AC, PC, Before Food, After Food. Vitals: BP 120/80, SpO2 98%, PR 72, Temp 98.6F. Note sections: Subjective, Objective, Assessment, Plan
        """
        # Explicitly set fp16=False for CPU processing
        result = model.transcribe(file_path, fp16=False,prompt=prompt)
        return result["text"]
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return None