import React, { useState } from 'react';
import { useConsultation } from '../../context/ConsultationContext';

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Highlights doctor/patient speaker segments safely
function formatTranscript(safeText) {
  if (!safeText) return null;

  const lines = safeText.split('\n');
  return lines.map((line, i) => {
    const isDoctor = /^(Dr\.|Doctor|D:)/i.test(line);
    const isPatient = /^(Patient|P:|Pt:)/i.test(line);
    return (
      <div key={i} style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 6,
        background: isDoctor ? 'rgba(59, 130, 246, 0.06)' : isPatient ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
        borderLeft: isDoctor ? '2px solid var(--accent-blue)' : isPatient ? '2px solid var(--accent-green)' : '2px solid transparent',
      }}>
        {isDoctor && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', display: 'block', marginBottom: 2 }}>DOCTOR</span>}
        {isPatient && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', display: 'block', marginBottom: 2 }}>PATIENT</span>}
        <span style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-primary)' }}>{line}</span>
      </div>
    );
  });
}

export default function TranscriptViewer() {
  const { transcript, transcriptStatus, setTranscript } = useConsultation();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copied, setCopied] = useState(false);

  // 100% BULLETPROOF STRING EXTRACTION
  // This ensures no matter what the backend sends (Object, null, undefined, array), it forces it into a safe string.
  const transcriptStr = typeof transcript === 'string' 
  ? transcript 
  : (transcript?.text ? String(transcript.text) : "");

  const handleEdit = () => {
    setEditValue(transcriptStr);
    setEditing(true);
  };

  const handleSave = () => {
    setTranscript(editValue);
    setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcriptStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEmpty = !transcriptStr && transcriptStatus !== 'processing';

  return (
    <div className="card fade-in" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-accent" />
          Transcript
          {transcriptStatus === 'done' && <span className="tag tag-green" style={{ fontSize: 10 }}>Live</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {transcriptStr && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                {copied ? <CheckIcon /> : <CopyIcon />} {copied ? 'Copied' : 'Copy'}
              </button>
              {!editing && (
                <button className="btn btn-secondary btn-sm" onClick={handleEdit}>
                  <EditIcon /> Edit
                </button>
              )}
              {editing && (
                <button className="btn btn-primary btn-sm" onClick={handleSave}>
                  <CheckIcon /> Save
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        minHeight: 220,
        maxHeight: 340,
        overflowY: 'auto',
        padding: 16,
        position: 'relative',
      }}>
        {transcriptStatus === 'processing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div className="loading-spinner" />
            <div>
              <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>Transcribing audio...</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Using Whisper ASR</div>
            </div>
          </div>
        )}

        {isEmpty && transcriptStatus !== 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              No transcript yet.<br />Record or upload audio to begin.
            </p>
          </div>
        )}

        {editing ? (
          <textarea
            className="textarea"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              minHeight: 200,
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              lineHeight: 1.7,
              padding: 0,
              color: 'var(--text-primary)',
              width: '100%'
            }}
          />
        ) : (
          transcriptStr && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {formatTranscript(transcriptStr)}
            </div>
          )
        )}
      </div>

      {/* Safe Word Count using the guaranteed string */}
      {transcriptStr && !editing && (
        <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {transcriptStr.split(/\s+/).filter(Boolean).length} words
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {transcriptStr.length} chars
          </span>
        </div>
      )}
    </div>
  );
}