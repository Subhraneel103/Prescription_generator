import React, { useState } from 'react';
import { useConsultation } from '../../context/ConsultationContext';

const SparkleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// Updated 'name' to 'medicine_name' to match the Flask LLM output
const EMPTY_MED = { medicine_name: '', dosage: '', frequency: '', duration: '', route: '', notes: '' };
const ROUTES = ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaled', 'Sublingual', 'Rectal'];
const FREQUENCIES = ['Once daily', 'Twice daily', 'Thrice daily', 'Every 8 hrs', 'Every 6 hrs', 'At bedtime', 'As needed (PRN)', 'Stat'];

function MedicineRow({ med, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rx-card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 28, height: 28, minWidth: 28,
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(0,212,232,0.15), rgba(59,130,246,0.15))',
          border: '1px solid rgba(0,212,232,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--accent-cyan)',
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Drug name (generic / brand)"
              value={med.medicine_name || ''} // Updated to medicine_name
              onChange={(e) => onUpdate(index, 'medicine_name', e.target.value)}
              style={{ flex: 2, fontSize: 13, fontWeight: 600 }}
            />
            <input
              className="input"
              placeholder="Dosage (e.g. 500mg)"
              value={med.dosage || ''}
              onChange={(e) => onUpdate(index, 'dosage', e.target.value)}
              style={{ flex: 1, fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="select"
              value={med.frequency || ''}
              onChange={(e) => onUpdate(index, 'frequency', e.target.value)}
              style={{ flex: 1, fontSize: 12 }}
            >
              <option value="">Frequency</option>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <input
              className="input"
              placeholder="Duration (e.g. 7 days)"
              value={med.duration || ''}
              onChange={(e) => onUpdate(index, 'duration', e.target.value)}
              style={{ flex: 1, fontSize: 12 }}
            />
            <select
              className="select"
              value={med.route || ''}
              onChange={(e) => onUpdate(index, 'route', e.target.value)}
              style={{ flex: 1, fontSize: 12 }}
            >
              <option value="">Route</option>
              {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {expanded && (
            <input
              className="input"
              placeholder="Special instructions / notes"
              value={med.notes || ''}
              onChange={(e) => onUpdate(index, 'notes', e.target.value)}
              style={{ fontSize: 12 }}
            />
          )}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded(!expanded)}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              {expanded ? 'Hide notes' : '+ Add notes'}
            </button>
            {med.medicine_name && (
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {med.dosage && <span className="tag tag-cyan">{med.dosage}</span>}
                {med.frequency && <span className="tag tag-blue">{med.frequency}</span>}
                {med.duration && <span className="tag tag-amber">{med.duration}</span>}
              </div>
            )}
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => onRemove(index)} style={{ padding: '5px 8px' }}>
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function PrescriptionCard() {
  const { prescription, prescriptionStatus, generatePrescription, setPrescription, consultation, currentPatient, notify } = useConsultation();

  const isGenerating = prescriptionStatus === 'processing';

  const addMedicine = () => {
    setPrescription([...prescription, { ...EMPTY_MED }]);
  };

  const updateMed = (index, field, value) => {
    const updated = prescription.map((m, i) => i === index ? { ...m, [field]: value } : m);
    setPrescription(updated);
  };

  const removeMed = (index) => {
    setPrescription(prescription.filter((_, i) => i !== index));
  };

  const handleExport = () => {
    const lines = [
      '═══════════════════════════════════════',
      '        PRESCRIPTION',
      '═══════════════════════════════════════',
      `Patient: ${currentPatient?.name || 'N/A'}`,
      `Date: ${new Date().toLocaleDateString('en-IN')}`,
      '───────────────────────────────────────',
      '',
      ...prescription.map((m, i) =>
        `${i + 1}. ${m.medicine_name} ${m.dosage}\n   ${m.frequency} × ${m.duration}\n   Route: ${m.route || 'Oral'}\n   ${m.notes ? `Notes: ${m.notes}` : ''}`
      ),
      '',
      '═══════════════════════════════════════',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'prescription.txt'; a.click();
    notify('Prescription exported', 'success');
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-accent" />
          Rx Prescription
          {prescription.length > 0 && (
            <span className="tag tag-violet" style={{ fontSize: 10 }}>{prescription.length} med{prescription.length > 1 ? 's' : ''}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {prescription.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleExport}>
              <DownloadIcon /> Export
            </button>
          )}
          {/* Note: In our current architecture, generating happens automatically. 
              This button is safe to keep as a UI element, but it triggers the context function. */}
          <button
            className="btn btn-primary btn-sm"
            onClick={generatePrescription}
            disabled={isGenerating || !consultation}
          >
            {isGenerating ? (
              <><div className="loading-spinner" style={{ width: 14, height: 14 }} /> Generating...</>
            ) : (
              <><SparkleIcon /> AI Generate</>
            )}
          </button>
        </div>
      </div>

      {prescription.length === 0 && !isGenerating && (
        <div style={{
          textAlign: 'center', padding: '32px 20px',
          background: 'var(--bg-secondary)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💊</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            No medicines added.<br />Use AI to generate or add manually.
          </p>
        </div>
      )}

      {isGenerating && (
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            Analyzing clinical note to generate prescription...
          </p>
        </div>
      )}

      {prescription.map((med, i) => (
        <MedicineRow key={i} med={med} index={i} onUpdate={updateMed} onRemove={removeMed} />
      ))}

      <button className="btn btn-secondary" onClick={addMedicine} style={{ width: '100%', justifyContent: 'center', margin: '4px 0' }}>
        <PlusIcon /> Add Medicine
      </button>
    </div>
  );
}