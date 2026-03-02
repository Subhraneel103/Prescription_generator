import React, { useState, useRef, useCallback } from 'react';
import { useConsultation } from '../../context/ConsultationContext';
import * as api from '../../api/client';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Priya Sharma', age: 34, gender: 'Female', abha_id: 'ABHA-1234-5678', phone: '+91-98765-43210', condition: 'Hypertension' },
  { id: 'p2', name: 'Rajesh Kumar', age: 52, gender: 'Male', abha_id: 'ABHA-8765-4321', phone: '+91-87654-32109', condition: 'T2 Diabetes' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function NewPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', phone: '', bloodGroup: '', abhaId: '', address: '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.age) return;
    setSaving(true);
    try {
      // 1. Map frontend state to Flask database schema
      const payload = {
        name: form.name,
        age: parseInt(form.age, 10),
        gender: form.gender,
        phone: form.phone,
        abha_id: form.abhaId // Map camelCase to snake_case
      };
      
      const patientData = await api.createPatient(payload);
      // Flask returns { message: "...", patient_id: X }, so we construct the local object
      const newPatient = { ...payload, id: patientData.patient_id };
      onAdd(newPatient);
    } catch (err) {
      console.error("Failed to save to DB, using mock:", err);
      // Fallback for UI testing if DB is down
      onAdd({ ...form, id: `p_${Date.now()}`, abha_id: form.abhaId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">New Patient</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><XIcon /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input className="input" placeholder="Patient name" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Age *</label>
              <input className="input" type="number" placeholder="Age" value={form.age} onChange={(e) => set('age', e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Gender</label>
              <select className="select" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Blood Group</label>
              <select className="select" value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)}>
                <option value="">Unknown</option>
                {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input className="input" placeholder="+91-XXXXX-XXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">ABHA ID</label>
            <input className="input" placeholder="ABHA-XXXX-XXXX" value={form.abhaId} onChange={(e) => set('abhaId', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Address</label>
            <input className="input" placeholder="City, State" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !form.name}>
            {saving ? <div className="loading-spinner" style={{ width: 14, height: 14 }} /> : <PlusIcon />}
            {saving ? 'Adding...' : 'Add Patient'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientSearch({ onSelect }) {
  const { currentPatient, selectPatient, notify } = useConsultation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const debounceRef = useRef(null);

  // 2. Updated Search logic to hit our Flask GET /api/patients/ route
  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      try {
        // Fetch all patients from our DB
        const dbPatients = await api.getPatients();
        
        // Filter locally based on the query
        const filtered = dbPatients.filter((p) => 
          p.name.toLowerCase().includes(q.toLowerCase()) || 
          (p.abha_id && p.abha_id.toLowerCase().includes(q.toLowerCase())) ||
          (p.phone && p.phone.includes(q))
        );
        
        setResults(filtered.length > 0 ? filtered : MOCK_PATIENTS);
      } catch (err) {
        // Fallback to mock data if API fails
        setResults(MOCK_PATIENTS.filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.abha_id?.toLowerCase().includes(q.toLowerCase())
        ));
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = (patient) => {
    selectPatient(patient);
    setQuery('');
    setResults([]);
    if (onSelect) onSelect(patient);
    notify(`Selected: ${patient.name}`, 'success');
  };

  const handleAdd = (patient) => {
    selectPatient(patient);
    setShowModal(false);
    notify(`Patient ${patient.name} added`, 'success');
    if (onSelect) onSelect(patient); // Automatically advance wizard
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-accent" />
          Patient
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(true)}>
          <PlusIcon /> New Patient
        </button>
      </div>

      {currentPatient ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#fff',
          }}>
            {currentPatient.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
              {currentPatient.name}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {currentPatient.age && <span className="tag tag-cyan">{currentPatient.age}y</span>}
              {currentPatient.gender && <span className="tag tag-blue">{currentPatient.gender}</span>}
              {currentPatient.bloodGroup && <span className="tag tag-red">{currentPatient.bloodGroup}</span>}
              {currentPatient.abha_id && <span className="tag tag-violet">{currentPatient.abha_id}</span>}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { selectPatient(null); }}>
            <XIcon />
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <SearchIcon />
            </div>
            <input
              className="input"
              style={{ paddingLeft: 38 }}
              placeholder="Search by name, ABHA ID, or phone..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
            />
          </div>
          {(results.length > 0 || loading) && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-bright)',
              borderRadius: 'var(--radius-md)',
              marginTop: 6,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}>
              {loading && (
                <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="loading-spinner" style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Searching...</span>
                </div>
              )}
              {results.map((p) => (
                <div key={p.id} className="search-result-item" onClick={() => handleSelect(p)}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.3))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)',
                  }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {p.age}y · {p.gender} · {p.abha_id || p.phone}
                    </div>
                  </div>
                  {p.condition && <span className="tag tag-amber" style={{ fontSize: 10 }}>{p.condition}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && <NewPatientModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}