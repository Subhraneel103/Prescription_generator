import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { ConsultationProvider, useConsultation } from './context/ConsultationContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Consultation from './pages/Consultation';
import PatientHistory from './pages/PatientHistory';

// ─── Icons ─────────────────────────────────────────────
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const LogOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// ─── Notification Toast ───────────────────────────────
function Notifications() {
  const { notifications } = useConsultation();
  const TYPE_STYLES = {
    success: { border: 'rgba(16,185,129,0.4)', bg: 'rgba(16,185,129,0.08)', color: 'var(--accent-green)', icon: '✓' },
    error: { border: 'rgba(239,68,68,0.4)', bg: 'rgba(239,68,68,0.08)', color: 'var(--accent-red)', icon: '✕' },
    info: { border: 'rgba(59,130,246,0.4)', bg: 'rgba(59,130,246,0.08)', color: 'var(--accent-blue)', icon: 'ℹ' },
  };

  if (!notifications.length) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notifications.map((n) => {
        const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
        return (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-card)',
            border: `1px solid ${style.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            minWidth: 280,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'modal-in 0.2s ease',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: style.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: style.color, fontWeight: 700,
            }}>{style.icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{n.message}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────
function Sidebar({ onLogout }) {
  const { user, currentPatient, consultationStatus } = useConsultation();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✚</div>
        <div>
          <div className="sidebar-logo-text">Prescription_Generator</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>

        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <GridIcon /> Dashboard
        </NavLink>

        <NavLink to="/consultation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MicIcon /> Consultation
          {consultationStatus === 'active' && <span className="nav-badge">Live</span>}
        </NavLink>

        <NavLink to="/patients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UsersIcon /> Patient History
        </NavLink>

        <span className="nav-section-label" style={{ marginTop: 8 }}>System</span>
        <div style={{
          padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderRadius: 6,
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-green)',
        }}>
          <ShieldIcon /> ABDM Connected
        </div>
        <div style={{
          padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderRadius: 6,
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-blue)',
        }}>
          <ShieldIcon /> FHIR R4 Active
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {(user?.name || 'D').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name || 'Dr. Anon'}</div>
            <div className="user-role">{user?.speciality || 'General Physician'}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ padding: '4px', color: 'var(--text-muted)' }}>
            <LogOutIcon />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Topbar ───────────────────────────────────────────
function Topbar() {
  const location = useLocation();
  const { consultationStatus } = useConsultation();

  const titles = {
    '/': { title: 'Dashboard', sub: 'Overview & recent sessions' },
    '/consultation': { title: 'Consultation', sub: 'Active documentation session' },
    '/patients': { title: 'Patient History', sub: 'EHR & consultation records' },
  };

  const { title, sub } = titles[location.pathname] || { title: 'ClinDoc AI', sub: '' };

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        {sub && <div className="topbar-sub">{sub}</div>}
      </div>
      <div className="topbar-spacer" />
      {consultationStatus === 'active' && (
        <div className="status-pill">
          <span className="status-dot" /> Session Active
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </header>
  );
}

// ─── Protected Route ──────────────────────────────────
function AppLayout({ onLogout }) {
  return (
    <div className="app-shell">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/patients" element={<PatientHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Notifications />
    </div>
  );
}

// ─── Inner App with auth ──────────────────────────────
function InnerApp() {
  const { isAuthenticated, logoutUser } = useConsultation();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return <AppLayout onLogout={logoutUser} />;
}

// ─── Root App ─────────────────────────────────────────
export default function App() {
  return (
    <ConsultationProvider>
      <BrowserRouter>
        <InnerApp />
      </BrowserRouter>
    </ConsultationProvider>
  );
}
