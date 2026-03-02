import React, { createContext, useContext, useReducer, useCallback } from 'react';
import * as api from '../api/client';

// ─── Initial State ────────────────────────────────────
const initialState = {
  // Auth
  user: null,
  isAuthenticated: !!localStorage.getItem('token'), // picks up 'demo-token' too

  // Current patient
  currentPatient: null,

  // Current consultation session
  consultation: null,
  consultationStatus: 'idle', // idle | active | processing | complete

  // Audio
  audioBlob: null,
  audioUrl: null,
  isRecording: false,
  recordingDuration: 0,

  // Transcript
  transcript: '',
  transcriptStatus: 'idle', // idle | processing | done | error

  // SOAP
  soap: { subjective: '', objective: '', assessment: '', plan: '' },
  soapStatus: 'idle',

  // Prescription
  prescription: [],
  prescriptionStatus: 'idle',

  // UI
  loading: false,
  error: null,
  notifications: [],
};

// ─── Actions ──────────────────────────────────────────
const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_PATIENT: 'SET_PATIENT',
  SET_CONSULTATION: 'SET_CONSULTATION',
  SET_CONSULTATION_STATUS: 'SET_CONSULTATION_STATUS',
  SET_AUDIO: 'SET_AUDIO',
  SET_RECORDING: 'SET_RECORDING',
  SET_RECORDING_DURATION: 'SET_RECORDING_DURATION',
  SET_TRANSCRIPT: 'SET_TRANSCRIPT',
  SET_TRANSCRIPT_STATUS: 'SET_TRANSCRIPT_STATUS',
  SET_SOAP: 'SET_SOAP',
  UPDATE_SOAP_FIELD: 'UPDATE_SOAP_FIELD',
  SET_SOAP_STATUS: 'SET_SOAP_STATUS',
  SET_PRESCRIPTION: 'SET_PRESCRIPTION',
  SET_PRESCRIPTION_STATUS: 'SET_PRESCRIPTION_STATUS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  RESET_SESSION: 'RESET_SESSION',
};

// ─── Reducer ──────────────────────────────────────────
function consultationReducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.SET_USER:
      return { ...state, user: payload, isAuthenticated: !!payload };
    case ACTIONS.SET_PATIENT:
      return { ...state, currentPatient: payload };
    case ACTIONS.SET_CONSULTATION:
      return { ...state, consultation: payload };
    case ACTIONS.SET_CONSULTATION_STATUS:
      return { ...state, consultationStatus: payload };
    case ACTIONS.SET_AUDIO:
      return { ...state, audioBlob: payload.blob, audioUrl: payload.url };
    case ACTIONS.SET_RECORDING:
      return { ...state, isRecording: payload };
    case ACTIONS.SET_RECORDING_DURATION:
      return { ...state, recordingDuration: payload };
    case ACTIONS.SET_TRANSCRIPT:
      return { ...state, transcript: payload };
    case ACTIONS.SET_TRANSCRIPT_STATUS:
      return { ...state, transcriptStatus: payload };
    case ACTIONS.SET_SOAP:
      return { ...state, soap: payload };
    case ACTIONS.UPDATE_SOAP_FIELD:
      return { ...state, soap: { ...state.soap, [payload.field]: payload.value } };
    case ACTIONS.SET_SOAP_STATUS:
      return { ...state, soapStatus: payload };
    case ACTIONS.SET_PRESCRIPTION:
      return { ...state, prescription: payload };
    case ACTIONS.SET_PRESCRIPTION_STATUS:
      return { ...state, prescriptionStatus: payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: payload };
    case ACTIONS.ADD_NOTIFICATION:
      return { ...state, notifications: [payload, ...state.notifications].slice(0, 5) };
    case ACTIONS.REMOVE_NOTIFICATION:
      return { ...state, notifications: state.notifications.filter((n) => n.id !== payload) };
    case ACTIONS.RESET_SESSION:
      return {
        ...state,
        consultation: null,
        consultationStatus: 'idle',
        audioBlob: null,
        audioUrl: null,
        isRecording: false,
        recordingDuration: 0,
        transcript: '',
        transcriptStatus: 'idle',
        soap: { subjective: '', objective: '', assessment: '', plan: '' },
        soapStatus: 'idle',
        prescription: [],
        prescriptionStatus: 'idle',
        error: null,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────
const ConsultationContext = createContext(null);

export function ConsultationProvider({ children }) {
  const [state, dispatch] = useReducer(consultationReducer, initialState);

  // ── Notifications helper ──
  const notify = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: { id, message, type } });
    setTimeout(() => dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id }), 4000);
  }, []);

  // ── Auth ──
  const loginUser = useCallback(async (credentials) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const res = await api.login(credentials);
      localStorage.setItem('token', res.access_token);
      dispatch({ type: ACTIONS.SET_USER, payload: res.user });
      notify('Logged in successfully', 'success');
      return true;
    } catch (err) {
      notify(err.message || 'Login failed', 'error');
      return false;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [notify]);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: ACTIONS.SET_USER, payload: null });
    dispatch({ type: ACTIONS.RESET_SESSION });
  }, []);

  // ── Patient ──
  const selectPatient = useCallback((patient) => {
    dispatch({ type: ACTIONS.SET_PATIENT, payload: patient });
  }, []);

  // ── Consultation Session ──
  const startConsultation = useCallback(async (patientId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const consult = await api.createConsultation(patientId);
      dispatch({ type: ACTIONS.SET_CONSULTATION, payload: consult });
      dispatch({ type: ACTIONS.SET_CONSULTATION_STATUS, payload: 'active' });
      notify('Consultation session started', 'success');
      return consult;
    } catch (err) {
      notify('Failed to start consultation', 'error');
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [notify]);

  const endConsultation = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_SESSION });
  }, []);

  // ── Audio ──
  const setAudio = useCallback((blob, url) => {
    dispatch({ type: ACTIONS.SET_AUDIO, payload: { blob, url } });
  }, []);

  const setRecording = useCallback((isRecording) => {
    dispatch({ type: ACTIONS.SET_RECORDING, payload: isRecording });
  }, []);

  const setRecordingDuration = useCallback((duration) => {
    dispatch({ type: ACTIONS.SET_RECORDING_DURATION, payload: duration });
  }, []);

  // ── Transcription ──
const processConsultationAudio = useCallback(async () => {
    // Requires a selected patient and an audio file
    if (!state.currentPatient || !state.audioBlob) return;
    
    dispatch({ type: ACTIONS.SET_TRANSCRIPT_STATUS, payload: 'processing' });
    dispatch({ type: ACTIONS.SET_SOAP_STATUS, payload: 'processing' });
    dispatch({ type: ACTIONS.SET_PRESCRIPTION_STATUS, payload: 'processing' });
    
    try {
      const formData = new FormData();
      formData.append('audio', state.audioBlob, 'recording.webm');
      formData.append('patient_id', state.currentPatient.id);

      // This single call hits Flask, runs Whisper, runs Llama-3, and saves to SQLite
      const res = await api.uploadAudio(formData);
      
      // Update the entire UI state at once
      dispatch({ type: ACTIONS.SET_CONSULTATION, payload: { id: res.consultation_id } });
      dispatch({ type: ACTIONS.SET_TRANSCRIPT, payload: res.transcript });
      dispatch({ type: ACTIONS.SET_TRANSCRIPT_STATUS, payload: 'done' });
      
      dispatch({ type: ACTIONS.SET_SOAP, payload: res.soap_note });
      dispatch({ type: ACTIONS.SET_SOAP_STATUS, payload: 'done' });
      
      dispatch({ type: ACTIONS.SET_PRESCRIPTION, payload: res.prescriptions });
      dispatch({ type: ACTIONS.SET_PRESCRIPTION_STATUS, payload: 'done' });
      
      notify('AI processing complete!', 'success');
    } catch (err) {
      dispatch({ type: ACTIONS.SET_TRANSCRIPT_STATUS, payload: 'error' });
      dispatch({ type: ACTIONS.SET_SOAP_STATUS, payload: 'error' });
      dispatch({ type: ACTIONS.SET_PRESCRIPTION_STATUS, payload: 'error' });
      notify('AI processing failed. Check console.', 'error');
      console.error(err);
    }
  }, [state.currentPatient, state.audioBlob, notify]);

  const setTranscript = useCallback((text) => {
    dispatch({ type: ACTIONS.SET_TRANSCRIPT, payload: text });
  }, []);

  // ── SOAP ──
  const generateSOAP = useCallback(async () => {
    if (!state.consultation) return;
    dispatch({ type: ACTIONS.SET_SOAP_STATUS, payload: 'processing' });
    try {
      const res = await api.generateSOAP(state.consultation.id);
      dispatch({ type: ACTIONS.SET_SOAP, payload: res.soap });
      dispatch({ type: ACTIONS.SET_SOAP_STATUS, payload: 'done' });
      notify('SOAP note generated', 'success');
    } catch (err) {
      dispatch({ type: ACTIONS.SET_SOAP_STATUS, payload: 'error' });
      notify('SOAP generation failed', 'error');
    }
  }, [state.consultation, notify]);

  const updateSOAPField = useCallback((field, value) => {
    dispatch({ type: ACTIONS.UPDATE_SOAP_FIELD, payload: { field, value } });
  }, []);

  const saveSOAP = useCallback(async () => {
    if (!state.consultation) return;
    try {
      await api.updateSOAP(state.consultation.id, state.soap);
      notify('SOAP note saved', 'success');
    } catch (err) {
      notify('Failed to save SOAP note', 'error');
    }
  }, [state.consultation, state.soap, notify]);

  // ── Prescription ──
  const generatePrescription = useCallback(async () => {
    if (!state.consultation) return;
    dispatch({ type: ACTIONS.SET_PRESCRIPTION_STATUS, payload: 'processing' });
    try {
      const res = await api.generatePrescription(state.consultation.id);
      dispatch({ type: ACTIONS.SET_PRESCRIPTION, payload: res.medicines });
      dispatch({ type: ACTIONS.SET_PRESCRIPTION_STATUS, payload: 'done' });
      notify('Prescription generated', 'success');
    } catch (err) {
      dispatch({ type: ACTIONS.SET_PRESCRIPTION_STATUS, payload: 'error' });
      notify('Prescription generation failed', 'error');
    }
  }, [state.consultation, notify]);

  const setPrescription = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_PRESCRIPTION, payload: data });
  }, []);

  const value = {
    ...state,
    notify,
    loginUser,
    logoutUser,
    selectPatient,
    startConsultation,
    endConsultation,
    setAudio,
    setRecording,
    setRecordingDuration,
    processConsultationAudio,
    setTranscript,
    generateSOAP,
    updateSOAPField,
    saveSOAP,
    generatePrescription,
    setPrescription,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  const ctx = useContext(ConsultationContext);
  if (!ctx) throw new Error('useConsultation must be used within ConsultationProvider');
  return ctx;
}

export default ConsultationContext;
