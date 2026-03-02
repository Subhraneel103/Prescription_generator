import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsultation } from '../context/ConsultationContext';
import * as api from '../api/client';

const MOCK_STATS = {
  todayConsultations: 6,
  pendingNotes: 1,
  totalPatients: 142,
  avgDuration: '14 min',
};

const MOCK_RECENT = [
  { id: 'c1', patientName: 'Priya Sharma', time: '09:30 AM', diagnosis: 'Hypertension', soapReady: true, status: 'complete' },
  { id: 'c2', patientName: 'Rajesh Kumar', time: '11:15 AM', diagnosis: 'T2 Diabetes', soapReady: true, status: 'complete' },
  { id: 'c3', patientName: 'Anita Patel', time: '02:00 PM', diagnosis: 'Asthma follow-up', soapReady: false, status: 'pending-notes' },
];

const STATUS_MAP = {
  'complete': { label: 'Complete', tagClass: 'tag-green' },
  'in-progress': { label: 'In Progress', tagClass: 'tag-amber' },
  'pending-notes': { label: 'Pending Notes', tagClass: 'tag-red' },
  'upcoming': { label: 'Upcoming', tagClass: 'tag-blue' },
};

export default function Dashboard() {
  const { user } = useConsultation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // If the backend routes don't exist yet, it catches the error and populates the beautiful UI with mock data
    api.getDashboardStats().then(setStats).catch(() => setStats(MOCK_STATS));
    api.getRecentConsultations().then(setRecent).catch(() => setRecent(MOCK_RECENT));
  }, []);

  const s = stats || MOCK_STATS;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 style={{ fontFamily: "'Lora', serif" }}>{greeting()}, {user?.name || 'Dr. Anonymous'}</h1>
        <p>Here's your consultation overview for today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(0,212,232,0.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span className="stat-label">Today's Consultations</span>
          <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{s.todayConsultations}</span>
          <span className="stat-sub">Sessions today</span>
        </div>
        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <span className="stat-label">Pending Notes</span>
          <span className="stat-value" style={{ color: 'var(--accent-red)' }}>{s.pendingNotes}</span>
          <span className="stat-sub">Requires attention</span>
        </div>
        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span className="stat-label">Total Patients</span>
          <span className="stat-value" style={{ color: 'var(--accent-green)' }}>{s.totalPatients}</span>
          <span className="stat-sub">Active records</span>
        </div>
        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <span className="stat-label">Avg. Duration</span>
          <span className="stat-value" style={{ color: 'var(--accent-amber)', fontSize: 22 }}>{s.avgDuration}</span>
          <span className="stat-sub">Per consultation</span>
        </div>
      </div>

      {/* Today's Sessions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-accent" />
            Today's Sessions
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/consultation')}>
            + New Consultation
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--bg-secondary)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🩺</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              No sessions yet today.<br />Start a consultation to see it here.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Time</th>
                <th>Diagnosis</th>
                <th>SOAP</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => {
                const st = STATUS_MAP[c.status] || STATUS_MAP['upcoming'];
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.3))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--text-primary)',
                        }}>{c.patientName.charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{c.patientName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>{c.time}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.diagnosis}</td>
                    <td>
                      {c.soapReady
                        ? <span className="tag tag-green" style={{ fontSize: 10 }}>✓ Ready</span>
                        : <span className="tag tag-amber" style={{ fontSize: 10 }}>Pending</span>}
                    </td>
                    <td><span className={`tag ${st.tagClass}`} style={{ fontSize: 10 }}>{st.label}</span></td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate('/consultation')}
                        style={{ fontSize: 11 }}
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick action */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,212,232,0.05), rgba(59,130,246,0.05))', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            Start a new AI-powered consultation
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Record or upload audio → Auto-transcribe → Generate SOAP notes → Prescribe
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/consultation')}>
          Begin Session →
        </button>
      </div>
    </div>
  );
}