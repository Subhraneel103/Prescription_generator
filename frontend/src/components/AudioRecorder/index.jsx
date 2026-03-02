import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useConsultation } from '../../context/ConsultationContext';
import { io } from 'socket.io-client';

// Connect to Flask WebSocket server
const socket = io('http://localhost:5000', { autoConnect: false });

// ─── Icons ─────────────────────────────────────────────
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Format duration ──────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Waveform ─────────────────────────────────────────
function Waveform({ active }) {
  const bars = [20, 35, 18, 40, 25, 32, 15, 38, 28, 12, 36, 22];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 44 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: active ? `${h}px` : '8px',
            background: active ? 'var(--accent-cyan)' : 'var(--border-bright)',
            borderRadius: 2,
            transition: active ? 'none' : 'height 0.4s ease',
            
            /* REPLACE your two animation lines with this single combined line: */
            animation: active ? `wave ${0.6 + (i % 4) * 0.15}s ease-in-out ${i * 0.07}s infinite` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────
export default function AudioRecorder({ onAudioReady }) {
  const { 
    isRecording, 
    setRecording, 
    setAudio, 
    audioUrl, 
    processConsultationAudio, // We use the combined AI pipeline function here
    transcriptStatus, 
    notify,
    setTranscript 
  } = useConsultation();
  
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState('idle'); // idle | recording | recorded | uploaded

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const sessionIdRef = useRef(`session_${Date.now()}`);

  // ─── Socket Initialization ───
  useEffect(() => {
    socket.connect();
    socket.on('live_transcript', (data) => {
      setTranscript((prev) => prev + " " + data.text);
    });
    
    return () => {
      socket.disconnect();
      clearInterval(timerRef.current);
    };
  }, [setTranscript]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunksRef.current = [];
      
      // Tell Flask we are starting a live stream
      socket.emit('start_stream', { session_id: sessionIdRef.current });

      mr.ondataavailable = (e) => { 
        if (e.data.size > 0) {
          chunksRef.current.push(e.data); 
          // Send live chunk to Flask for instant Whisper transcription
          socket.emit('audio_chunk', { session_id: sessionIdRef.current, audio_data: e.data });
        }
      };
      
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudio(blob, url);
        setMode('recorded');
        stream.getTracks().forEach((t) => t.stop());
      };
      
      // Capture audio in 3-second chunks for the live stream
      mr.start(3000); 
      mediaRecorderRef.current = mr;
      setRecording(true);
      setDuration(0);
      setMode('recording');
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      notify('Microphone access denied', 'error');
    }
  }, [setRecording, setAudio, notify]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    socket.emit('stop_stream', { session_id: sessionIdRef.current });
    setRecording(false);
    sessionIdRef.current = `session_${Date.now()}`; // Reset for next time
  }, [setRecording]);

  const discardRecording = useCallback(() => {
    setAudio(null, null);
    setTranscript(""); // Clear any live transcript text
    setMode('idle');
    setDuration(0);
  }, [setAudio, setTranscript]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudio(file, url);
    setMode('uploaded');
    notify('Audio file loaded', 'success');
  }, [setAudio, notify]);

  const handleTranscribe = useCallback(async () => {
    // This now hits the Flask POST /api/consultations/upload route, 
    // generating the final SOAP note and Prescriptions
    await processConsultationAudio(); 
    if (onAudioReady) onAudioReady();
  }, [processConsultationAudio, onAudioReady]);

  const isProcessing = transcriptStatus === 'processing';

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-accent" />
          Audio Capture
          {isRecording && <span className="tag tag-red" style={{ marginLeft: 8 }}>● REC</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="tag tag-cyan" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Waveform area */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 84,
      }}>
        <Waveform active={isRecording} />
        <div style={{ textAlign: 'right' }}>
          {mode === 'idle' && <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>Ready to record</p>}
          {mode === 'recording' && <p style={{ color: 'var(--accent-red)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>Recording...</p>}
          {(mode === 'recorded' || mode === 'uploaded') && (
            <p style={{ color: 'var(--accent-green)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {mode === 'uploaded' ? 'File loaded' : 'Recording complete'}
            </p>
          )}
        </div>
      </div>

      {/* Audio playback */}
      {audioUrl && (
        <div style={{ marginBottom: 16 }}>
          <audio controls src={audioUrl} style={{ width: '100%', height: 36, filter: 'invert(0.85) hue-rotate(180deg)' }} />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {mode === 'idle' && (
          <>
            <button className="btn btn-primary" onClick={startRecording}>
              <MicIcon /> Start Recording
            </button>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon /> Upload Audio
            </button>
          </>
        )}

        {mode === 'recording' && (
          <button className="btn btn-danger recording-active" onClick={stopRecording}>
            <StopIcon /> Stop Recording
          </button>
        )}

        {(mode === 'recorded' || mode === 'uploaded') && (
          <>
            <button
              className="btn btn-primary"
              onClick={handleTranscribe}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><div className="loading-spinner" style={{ width: 16, height: 16, marginRight: 4 }} /> AI Processing...</>
              ) : (
                <><CheckIcon /> Generate AI Notes</>
              )}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={discardRecording}>
              <TrashIcon /> Discard
            </button>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon /> Replace
            </button>
          </>
        )}

        {transcriptStatus === 'done' && (
          <span className="tag tag-green" style={{ padding: '6px 12px', fontSize: 12 }}>
            ✓ Notes Generated
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </div>
  );
}