import React, { useState } from 'react';
import { useConsultation } from '../../context/ConsultationContext';

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const SOAP_FIELDS = [
  {
    key: 'subjective',
    label: 'S — Subjective',
    abbr: 'S',
    placeholder: "Patient's chief complaint, history of present illness, symptoms, pain levels, relevant medical/social history...",
    accent: 'var(--accent-cyan)',
    tagClass: 'tag-cyan',
    className: 'soap-s',
  },
  {
    key: 'objective',
    label: 'O — Objective',
    abbr: 'O',
    placeholder: 'Vital signs, physical examination findings, lab results, imaging, measurable data...',
    accent: 'var(--accent-blue)',
    tagClass: 'tag-blue',
    className: 'soap-o',
  },
  {
    key: 'assessment',
    label: 'A — Assessment',
    abbr: 'A',
    placeholder: 'Diagnosis, differential diagnoses, clinical impression, problem list...',
    accent: 'var(--accent-amber)',
    tagClass: 'tag-amber',
    className: 'soap-a',
  },
  {
    key: 'plan',
    label: 'P — Plan',
    abbr: 'P',
    placeholder: 'Treatment plan, medications, referrals, patient education, follow-up instructions...',
    accent: 'var(--accent-green)',
    tagClass: 'tag-green',
    className: 'soap-p',
  },
];

export default function SOAPNoteEditor() {
  const { soap, soapStatus, generateSOAP, updateSOAPField, saveSOAP, consultation } = useConsultation();
  const [saving, setSaving] = useState(false);

  const isGenerating = soapStatus === 'processing';
  const hasContent = Object.values(soap).some((v) => v.trim());

  const handleSave = async () => {
    setSaving(true);
    await saveSOAP();
    setSaving(false);
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-accent" />
          SOAP Clinical Note
          {soapStatus === 'done' && <span className="tag tag-green" style={{ fontSize: 10 }}>AI Generated</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={generateSOAP}
            disabled={isGenerating || !consultation}
          >
            {isGenerating ? (
              <><div className="loading-spinner" style={{ width: 14, height: 14 }} /> Generating...</>
            ) : (
              <><SparkleIcon /> Generate SOAP</>
            )}
          </button>
          {hasContent && (
            <button className="btn btn-secondary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <div className="loading-spinner" style={{ width: 14, height: 14 }} /> : <SaveIcon />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {!consultation && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 12,
          color: 'var(--accent-amber)',
          fontFamily: 'var(--font-mono)',
        }}>
          ⚠ Start a consultation session to enable SOAP generation
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SOAP_FIELDS.map(({ key, label, abbr, placeholder, accent, tagClass, className }) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 22, height: 22,
                borderRadius: 4,
                background: `${accent}20`,
                border: `1px solid ${accent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 11,
                color: accent,
              }}>
                {abbr}
              </div>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: accent,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {label}
              </label>
              {soap[key] && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {soap[key].split(' ').length} words
                </span>
              )}
            </div>
            <textarea
              className={`textarea ${className}`}
              value={soap[key]}
              onChange={(e) => updateSOAPField(key, e.target.value)}
              placeholder={placeholder}
              style={{
                minHeight: 90,
                background: isGenerating && !soap[key] ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 13.5,
                lineHeight: 1.65,
                paddingLeft: 14,
                borderLeftWidth: 3,
                borderLeftColor: accent,
                borderLeftStyle: 'solid',
                borderTopColor: 'var(--border)',
                borderRightColor: 'var(--border)',
                borderBottomColor: 'var(--border)',
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
