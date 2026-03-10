import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsultation } from '../context/ConsultationContext';
import * as api from '../api/client';

function AnimatedGreeting({ text }) {
  const words = text.split(' ');
  
  return (
    <h1 style={{ fontFamily: 'var(--font-display)' }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: 8,
            opacity: 0,
            animation: `wordFadeIn 0.4s ease forwards`,
            animationDelay: `${i * 0.2}s`,
          }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}

// Fallback data if the backend database is empty or unreachable
const MOCK_STATS = {
  todayConsultations: 0,
  pendingNotes: 0,
  totalPatients: 0,
  avgDuration: '0 min',
};

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch real data from your clinic.db via the Flask backend
        const [statsRes, recentRes] = await Promise.all([
          api.getDashboardStats(),
          api.getRecentConsultations()
        ]);
        
        setStats(statsRes);

        // Map backend naming conventions (SQL) to frontend UI keys
        const formattedRecent = (recentRes.consultations || recentRes || []).map(c => ({
          id: c.id,
          patientName: c.patient_name || "Unknown Patient",
          time: c.time || new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          diagnosis: c.diagnosis || "No diagnosis recorded",
          soapReady: !!c.soap_ready,
          status: c.status || 'complete'
        }));

        setRecent(formattedRecent);
      } catch (err) {
        console.warn("Backend unreachable or routes missing. Showing placeholder data.");
        // We keep the UI beautiful even if the server is starting up
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const s = stats || MOCK_STATS;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="page-content fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <AnimatedGreeting text={`${greeting()}, ${user?.name || 'Dr. Anonymous'}`} />
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
              <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
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

      {/* Today's Sessions Table */}
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
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🩺</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              No sessions found in the database.<br />Start a consultation to see live data.
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#fff',
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
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/consultation/${c.id}`)}>
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

      {/* Action Footer */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,212,232,0.08), rgba(59,130,246,0.08))', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
            Ready to record a new session?
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 500 }}>
            Our AI pipeline will automatically transcribe the audio, generate structured SOAP clinical notes, and extract medication plans for you.
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/consultation')}>
          Begin AI Session →
        </button>
      </div>
    </div>
  );
}