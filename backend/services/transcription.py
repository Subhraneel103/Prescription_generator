import whisper
import os

# Load model globally to avoid reloading on every request (keeps the API fast)
# Using 'base' model for speed; switch to 'small' or 'medium' for better accuracy if hardware permits
model = whisper.load_model("base")

def transcribe_audio(audio_path: str) -> str:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    result = model.transcribe(audio_path)
    return result["text"].strip()