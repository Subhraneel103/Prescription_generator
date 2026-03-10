from transformers import pipeline
import torch

# Load model globally to save memory
# Use fp16=False to prevent the CPU warning/error
pipe = pipeline(
    "automatic-speech-recognition",
    model="Sanchit-Gandhi/whisper-medium-fleurs-medical",
    chunk_length_s=30,
    device="cpu",
    model_kwargs={"torch_dtype": torch.float32} 
)

def transcribe_audio(file_path):
    try:
        medical_context = (
            "Patient symptoms. Medications: Paracetamol, Pantocid, Amoxiclav, Azithromycin, "
            "Amlodipine, Telmisartan, Metformin, Glycomet, Cetirizine, Montelukast, Limcee, "
            "Calpol, Augmentin, Dolo. Dosage: 1-0-1, 1-1-1, 1-0-0, 0-0-1, BD, TID, SOS, AC, PC. "
            "Vitals: BP 120/80, SpO2 98%. Sections: Subjective, Objective, Assessment, Plan."
        )
        # Explicitly set fp16=False for CPU processing
        result = pipe(
            file_path, 
            generate_kwargs={
                "prompt_ids": pipe.tokenizer.get_prompt_ids(medical_context)
            }
        )
        return result["text"]
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return None