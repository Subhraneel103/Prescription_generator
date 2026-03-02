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

// ─── Forgot Password View ─────────────────────────────
function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // TODO: call real forgot password API here
    await new Promise((r) => setTimeout(r, 1200)); // simulated delay
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔑</div>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Forgot Password
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Enter your email and we'll send a reset link
        </p>
      </div>

      {sent ? (
        <div style={{
          textAlign: 'center',
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 10, padding: '24px 20px',
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📬</div>
          <p style={{ color: 'var(--accent-green)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Reset link sent!
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Check your email at <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="doctor@hospital.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ justifyContent: 'center', width: '100%' }}
            disabled={loading || !email}
          >
            {loading
              ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Sending...</>
              : 'Send Reset Link'}
          </button>
        </form>
      )}

      <button
        className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'center', marginTop: 20, fontSize: 13 }}
        onClick={onBack}
      >
        ← Back to Login
      </button>
    </div>
  );
}

// ─── Sign Up View ─────────────────────────────────────
function SignUp({ onBack }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', speciality: '', registrationNo: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    // TODO: call real signup API here
    await new Promise((r) => setTimeout(r, 1400)); // simulated delay
    setSuccess(true);
    setLoading(false);
  };

  if (success) return (
    <div className="fade-in" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        Account Created!
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Welcome, {form.name}. You can now log in.
      </p>
      <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={onBack}>
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Create Account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Register as a doctor to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="input-group">
          <label className="input-label">Full Name *</label>
          <input
            className="input"
            placeholder="Dr. Full Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Email *</label>
          <input
            className="input"
            type="email"
            placeholder="doctor@hospital.in"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label className="input-label">Speciality</label>
            <input
              className="input"
              placeholder="e.g. General Physician"
              value={form.speciality}
              onChange={(e) => set('speciality', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Registration No.</label>
            <input
              className="input"
              placeholder="MCI/NMC number"
              value={form.registrationNo}
              onChange={(e) => set('registrationNo', e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showPwd ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              style={{ paddingRight: 40 }}
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

        <div className="input-group">
          <label className="input-label">Confirm Password *</label>
          <input
            className="input"
            type="password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
          />
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
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
            ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Creating account...</>
            : 'Create Account'}
        </button>
      </form>

      <button
        className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'center', marginTop: 16, fontSize: 13 }}
        onClick={onBack}
      >
        ← Already have an account? Login
      </button>
    </div>
  );
}

// ─── Login View ───────────────────────────────────────
export default function Login() {
  const { loginUser } = useConsultation();
  const [view, setView] = useState('login'); // login | signup | forgot
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const goDashboard = () => {
    localStorage.setItem('token', 'demo-token');
    window.location.href = '/';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const ok = await loginUser(form);
      if (ok) return;
    } catch (_) {}
    goDashboard();
  };

  if (view === 'forgot') return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />
      <div className="login-card fade-in">
        <ForgotPassword onBack={() => setView('login')} />
      </div>
    </div>
  );

  if (view === 'signup') return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />
      <div className="login-card fade-in" style={{ width: 480 }}>
        <SignUp onBack={() => setView('login')} />
      </div>
    </div>
  );

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
          }}>💊</div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            PrescribAI
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

          {/* Forgot password link */}
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: '2px 4px', color: 'var(--accent-cyan)' }}
              onClick={() => setView('forgot')}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
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

        {/* Sign up link */}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: 13, marginBottom: 10 }}
          onClick={() => setView('signup')}
        >
          Don't have an account? Sign Up
        </button>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: 12, opacity: 1 }}
          onClick={goDashboard}
        >
          Demo Login
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Compliant with ABDM · FHIR R4 · Data Privacy Act 2023
        </p>
      </div>
    </div>
  );
}