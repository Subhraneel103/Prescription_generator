import React, { useState } from 'react';
import { useConsultation } from '../context/ConsultationContext';

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login() {
  const { loginUser } = useConsultation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  // Hard reload after setting token so context re-reads localStorage fresh
  const goDashboard = () => {
    localStorage.setItem('token', 'demo-token');
    window.location.href = '/';          // ← full reload, not navigate()
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const ok = await loginUser(form);
      if (ok) return;                    // real backend handled it
    } catch (_) {}
    goDashboard();                       // no backend → demo mode
  };

  const handleDemo = () => goDashboard();

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />

      <div className="login-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff',
            boxShadow: '0 0 30px rgba(0,212,232,0.3)',
          }}>✚</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            ClinDoc AI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            AI-BASED CLINICAL DOCUMENTATION
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Email / NDHM ID</label>
            <input
              className="input"
              type="email"
              placeholder="doctor@hospital.in"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                style={{ paddingRight: 40 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: '4px 6px', color: 'var(--text-muted)' }}
                onClick={() => setShowPwd(!showPwd)}
              >
                <EyeIcon open={showPwd} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 6, padding: '8px 12px',
              fontSize: 12, color: 'var(--accent-red)', fontFamily: 'var(--font-mono)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ justifyContent: 'center', width: '100%', marginTop: 4 }}
            disabled={loading}
          >
            {loading
              ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Signing in...</>
              : 'Sign In'}
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }} />

        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: 12, opacity: 0.85 }}
          onClick={handleDemo}
        >
          🚀 Demo Login (NextGenHack)
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Compliant with ABDM · FHIR R4 · Data Privacy Act 2023
        </p>
      </div>
    </div>
  );
}
