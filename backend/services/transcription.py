import whisper
import torch

# Load model globally to save memory
# Use fp16=False to prevent the CPU warning/error
model = whisper.load_model("base", device="cpu")

def transcribe_audio(file_path):
    try:
        # Explicitly set fp16=False for CPU processing
        result = model.transcribe(file_path, fp16=False)
        return result["text"]
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return None