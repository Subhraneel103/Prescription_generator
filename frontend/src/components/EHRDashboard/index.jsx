import React, { useState, useEffect } from 'react';
import * as api from '../../api/client';

const MOCK_EHR = {
  vitals: { bp: '122/78', pulse: '72 bpm', temp: '98.4°F', spo2: '98%', weight: '68 kg', height: '165 cm' },
  allergies: ['Penicillin', 'Sulfa drugs'],
  chronicConditions: ['Hypertension', 'Mild Anemia'],
  consultations: [
    { id: 'c1', date: '2026-02-14', doctor: 'Dr. A. Mehta', diagnosis: 'Hypertension follow-up', soap: { subjective: 'BP controlled. No headaches.', objective: 'BP 122/78. Clear lungs.', assessment: 'Hypertension — controlled.', plan: 'Continue amlodipine 5mg. Review in 3 months.' }, prescriptions: ['Amlodipine 5mg', 'Aspirin 75mg'] },
    { id: 'c2', date: '2025-11-02', doctor: 'Dr. R. Singh', diagnosis: 'Viral fever', soap: { subjective: 'Fever for 3 days, body ache.', objective: 'Temp 101°F. Throat congested.', assessment: 'Viral URTI.', plan: 'Paracetamol 500mg TID. ORS. Rest.' }, prescriptions: ['Paracetamol 500mg', 'ORS'] },
    { id: 'c3', date: '2025-07-18', doctor: 'Dr. A. Mehta', diagnosis: 'Annual check-up', soap: { subjective: 'Routine check. No complaints.', objective: 'Normal findings.', assessment: 'Healthy adult.', plan: 'Continue current medications. Next review in 6 months.' }, prescriptions: [] },
  ],
  labReports: [
    { name: 'CBC', date: '2026-02-14', status: 'normal', summary: 'Hb 12.8, WBC 7200' },
    { name: 'Lipid Profile', date: '2025-11-02', status: 'borderline', summary: 'LDL 142 mg/dL' },
    { name: 'HbA1c', date: '2025-07-18', status: 'normal', summary: '5.4%' },
  ],
};

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

function VitalsGrid({ vitals }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {Object.entries(vitals).map(([key, val]) => (
        <div key={key} className="vital-item">
          <span className="vital-label">{key === 'bp' ? 'Blood Pressure' : key === 'spo2' ? 'SpO2' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
          <span className="vital-value">{val.split(' ')[0]}</span>
          {val.includes(' ') && <span className="vital-unit">{val.split(' ').slice(1).join(' ')}</span>}
        </div>
      ))}
    </div>
  );
}

function ConsultationTimeline({ consultations }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      {consultations.map((c) => (
        <div key={c.id} className="timeline-item">
          <div className="timeline-dot">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{c.diagnosis}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {c.doctor}
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                style={{ padding: '3px 8px', gap: 4 }}
              >
                Details <ChevronDownIcon />
              </button>
            </div>
            {c.prescriptions.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                {c.prescriptions.map((rx) => (
                  <span key={rx} className="tag tag-violet" style={{ fontSize: 10 }}>💊 {rx}</span>
                ))}
              </div>
            )}
            {expanded === c.id && (
              <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '12px', marginTop: 8,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
              }}>
                {['subjective', 'objective', 'assessment', 'plan'].map((field) => (
                  <div key={field}>
                    <div style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                      letterSpacing: '0.1em', marginBottom: 4,
                      color: field === 'subjective' ? 'var(--accent-cyan)' : field === 'objective' ? 'var(--accent-blue)' : field === 'assessment' ? 'var(--accent-amber)' : 'var(--accent-green)',
                    }}>
                      {field.charAt(0).toUpperCase()} — {field}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.soap[field]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EHRDashboard({ patientId }) {
  const [ehr, setEhr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('vitals');

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    api.getEHRRecord(patientId)
      .then(setEhr)
      .catch(() => setEhr(MOCK_EHR))
      .finally(() => setLoading(false));
  }, [patientId]);

  // Use mock if no patientId
  const data = ehr || (patientId ? null : MOCK_EHR);

  if (loading) return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <div className="loading-spinner" />
    </div>
  );

  if (!data) return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🏥</div>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Select a patient to view EHR</p>
    </div>
  );

  return (
    <div className="card fade-in" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-accent" />
          EHR Record
          <span className="tag tag-cyan" style={{ fontSize: 10 }}>ABDM/FHIR</span>
        </div>
        <button className="btn btn-secondary btn-sm">
          <ExternalLinkIcon /> Export FHIR
        </button>
      </div>

      {/* Allergies */}
      {data.allergies?.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 6, padding: '8px 12px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-red)' }}>ALLERGIES: </span>
            {data.allergies.map((a) => <span key={a} className="tag tag-red" style={{ margin: '0 3px', fontSize: 10 }}>{a}</span>)}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="segment-tabs" style={{ marginBottom: 16 }}>
        {[
          { key: 'vitals', label: 'Vitals' },
          { key: 'history', label: 'History' },
          { key: 'labs', label: 'Labs' },
        ].map(({ key, label }) => (
          <button key={key} className={`segment-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'vitals' && (
        <div>
          <VitalsGrid vitals={data.vitals} />
          {data.chronicConditions?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chronic Conditions</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {data.chronicConditions.map((c) => <span key={c} className="tag tag-amber">{c}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && <ConsultationTimeline consultations={data.consultations} />}

      {tab === 'labs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.labReports.map((lab) => (
            <div key={lab.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 14px',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{lab.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(lab.date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{lab.summary}</div>
              <span className={`tag ${lab.status === 'normal' ? 'tag-green' : lab.status === 'borderline' ? 'tag-amber' : 'tag-red'}`}>
                {lab.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
