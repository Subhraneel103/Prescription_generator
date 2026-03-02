import React, { useState } from 'react';
import { useConsultation } from '../context/ConsultationContext';
import PatientSearch from '../components/PatientSearch';
import EHRDashboard from '../components/EHRDashboard';

export default function PatientHistory() {
  const { currentPatient } = useConsultation();

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1>Patient History</h1>
        <p>Search for a patient to view their full EHR and consultation history</p>
      </div>

      <div style={{ maxWidth: 680, marginBottom: 24 }}>
        <PatientSearch />
      </div>

      {currentPatient ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff',
            }}>
              {currentPatient.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>{currentPatient.name}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {currentPatient.age && <span className="tag tag-cyan">{currentPatient.age} years</span>}
                {currentPatient.gender && <span className="tag tag-blue">{currentPatient.gender}</span>}
                {currentPatient.bloodGroup && <span className="tag tag-red">{currentPatient.bloodGroup}</span>}
                {currentPatient.abhaId && <span className="tag tag-violet">{currentPatient.abhaId}</span>}
                {currentPatient.phone && <span className="tag tag-green">{currentPatient.phone}</span>}
              </div>
            </div>
          </div>
          <EHRDashboard patientId={currentPatient.id} />
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>No patient selected</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Use the search above to find a patient and view their complete medical history, lab reports, and consultation records.
          </p>
        </div>
      )}
    </div>
  );
}
