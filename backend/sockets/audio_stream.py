import os
import tempfile
from flask_socketio import emit
from extensions import socketio
from services.transcription import transcribe_audio

# In-memory store for active sessions 
active_sessions = {}

@socketio.on('connect')
def handle_connect():
    print("Client connected for live transcription")

@socketio.on('start_stream')
def handle_start_stream(data):
    session_id = data.get('session_id')
    # Creating a temporary file to hold the continuous audio for this session
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
    active_sessions[session_id] = {
        "file_path": temp_file.name,
        "full_transcript": ""
    }
    emit('stream_started', {"message": "Server ready to receive audio"})

@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """
    Receives a chunk of audio from React, appends it to the session's file,
    and transcribes the chunk.
    """
    session_id = data.get('session_id')
    audio_blob = data.get('audio_data') # Raw bytes from React MediaRecorder
    
    if session_id not in active_sessions:
        return

    session = active_sessions[session_id]
    
    # 1. Append the new chunk to the temporary audio file
    with open(session['file_path'], 'ab') as f:
        f.write(audio_blob)

    # 2. Run Whisper on the current accumulated file (or just the chunk)
    try:
        chunk_text = transcribe_audio(session['file_path'])
        
        # 3. Emit the live text back to React
        emit('live_transcript', {"text": chunk_text})
    except Exception as e:
        print(f"Transcription error: {e}")

@socketio.on('stop_stream')
def handle_stop_stream(data):
    session_id = data.get('session_id')
    if session_id in active_sessions:
        session = active_sessions[session_id]
        
        # Here, the live conversation is over. 
        
        final_text = transcribe_audio(session['file_path'])
        
        emit('stream_ended', {
            "message": "Audio processing complete",
            "final_transcript": final_text,
            "audio_path": session['file_path'] 
        })
        
        del active_sessions[session_id]