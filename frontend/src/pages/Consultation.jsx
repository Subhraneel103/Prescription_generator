import React, { useState } from 'react';
import { useConsultation } from '../context/ConsultationContext';
import AudioRecorder from '../components/AudioRecorder';
import TranscriptViewer from '../components/TranscriptViewer';
import SOAPNoteEditor from '../components/SOAPNoteEditor';
import PrescriptionCard from '../components/PrescriptionCard';
import PatientSearch from '../components/PatientSearch';
import EHRDashboard from '../components/EHRDashboard';

const STEPS = [
  { key: 'patient', label: 'Patient', desc: 'Select patient' },
  { key: 'record', label: 'Record', desc: 'Capture audio' },
  { key: 'transcript', label: 'Transcribe', desc: 'Review text' },
  { key: 'soap', label: 'SOAP Note', desc: 'Clinical note' },
  { key: 'rx', label: 'Prescription', desc: 'Medicines' },
];

function StepIndicator({ current, steps }) {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i < idx ? 'var(--accent-green)' : i === idx ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-elevated)',
              border: i === idx ? '2px solid var(--accent-cyan)' : i < idx ? '2px solid var(--accent-green)' : '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
              color: i <= idx ? '#fff' : 'var(--text-muted)',
              boxShadow: i === idx ? '0 0 16px rgba(0,212,232,0.3)' : 'none',
              transition: 'all 0.3s',
            }}>
              {i < idx ? '✓' : i + 1}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: i === idx ? 'var(--accent-cyan)' : i < idx ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                {step.label}
              </div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1,
              height: 2,
              background: i < idx ? 'var(--accent-green)' : 'var(--border)',
              margin: '-16px 4px 16px',
              transition: 'background 0.3s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Consultation() {
  const { currentPatient, consultation, startConsultation, endConsultation, consultationStatus, transcript, soap, notify } = useConsultation();
  const [step, setStep] = useState('patient');
  const [ehrVisible, setEhrVisible] = useState(false);

  const handlePatientSelected = (p) => {
    setStep('record');
  };

  const handleStartSession = async () => {
    if (!currentPatient) { notify('Select a patient first', 'error'); return; }
    await startConsultation(currentPatient.id);
    setStep('record');
  };

  const handleAudioReady = () => setStep('transcript');

  const nextStep = () => {
    const keys = STEPS.map((s) => s.key);
    const i = keys.indexOf(step);
    if (i < keys.length - 1) setStep(keys[i + 1]);
  };

  const prevStep = () => {
    const keys = STEPS.map((s) => s.key);
    const i = keys.indexOf(step);
    if (i > 0) setStep(keys[i - 1]);
  };

  return (
    <div className="page-content fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>New Consultation</h1>
          <p>AI-powered SOAP documentation session</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {currentPatient && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEhrVisible(!ehrVisible)}
            >
              {ehrVisible ? '← Hide EHR' : '📋 View EHR'}
            </button>
          )}
          {consultationStatus === 'active' && (
            <button className="btn btn-danger btn-sm" onClick={endConsultation}>
              End Session
            </button>
          )}
        </div>
      </div>

      <StepIndicator current={step} steps={STEPS} />

      <div style={{ display: 'grid', gridTemplateColumns: ehrVisible ? '1fr 380px' : '1fr', gap: 20 }}>
        <div>
          {/* Step: Patient */}
          {step === 'patient' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PatientSearch onSelect={handlePatientSelected} />
              {currentPatient && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary btn-lg" onClick={handleStartSession}>
                    {consultationStatus === 'active' ? 'Session Active →' : 'Start Session →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: Record */}
          {step === 'record' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {currentPatient && (
                <div style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-blue))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff',
                  }}>
                    {currentPatient.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{currentPatient.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {currentPatient.age}y · {currentPatient.gender} · {currentPatient.abhaId || 'No ABHA'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {consultationStatus === 'active' && <span className="status-pill"><span className="status-dot" />Session Active</span>}
                  </div>
                </div>
              )}
              <AudioRecorder onAudioReady={handleAudioReady} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button className="btn btn-secondary" onClick={nextStep}>Skip to Transcript →</button>
              </div>
            </div>
          )}

          {/* Step: Transcript */}
          {step === 'transcript' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TranscriptViewer />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button className="btn btn-primary" onClick={nextStep} disabled={!transcript}>
                  Generate SOAP →
                </button>
              </div>
            </div>
          )}

          {/* Step: SOAP */}
          {step === 'soap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SOAPNoteEditor />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Generate Prescription →
                </button>
              </div>
            </div>
          )}

          {/* Step: Prescription */}
          {step === 'rx' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PrescriptionCard />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary">Save Draft</button>
                  <button className="btn btn-primary btn-lg">
                    ✓ Complete & Save to EHR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EHR side panel */}
        {ehrVisible && currentPatient && (
          <div style={{ position: 'sticky', top: 72, height: 'fit-content', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            <EHRDashboard patientId={currentPatient.id} />
          </div>
        )}
      </div>
    </div>
  );
}
