import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 600000, // AI processing takes long so 10 mins
});

// Auth token interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response error interceptor
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { message: 'Network error' });
  }
);

// ─── Auth ─────────────────────────────────────────────
export const login = (credentials) => client.post('/auth/login', credentials);
export const register = (credentials) => client.post('/auth/register', credentials);
export const logout = () => client.post('/auth/logout');
export const getMe = () => client.get('/auth/me');

// ─── Patients ─────────────────────────────────────────
export const getPatients = () => client.get('/patients'); // <--- ADD THIS LINE
export const searchPatients = (query) => client.get('/patients/search', { params: { q: query } });
export const createPatient = (data) => client.post('/patients', data);
export const updatePatient = (id, data) => client.put(`/patients/${id}`, data);
export const getPatientHistory = (id) => client.get(`/patients/${id}/history`);

// ─── Consultations ────────────────────────────────────
export const createConsultation = (patientId) => client.post('/consultations', { patient_id: patientId });
export const getConsultation = (id) => client.get(`/consultations/${id}`);
export const updateConsultation = (id, data) => client.put(`/consultations/${id}`, data);
export const getConsultations = (params) => client.get('/consultations', { params });

// ─── Audio & Transcription ────────────────────────────
export const uploadAudio = (formData) =>
  client.post(`/consultations/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getTranscript = (consultationId) =>
  client.get(`/consultations/${consultationId}/transcript`);

// ─── SOAP Notes ───────────────────────────────────────
export const generateSOAP = (consultationId) =>
  client.post(`/consultations/${consultationId}/generate-soap`);

export const updateSOAP = (noteId, soapData) => 
  client.patch(`/notes/${noteId}`, soapData);

export const getSOAP = (consultationId) => 
  client.get(`/notes/${consultationId}`);

// ─── Prescriptions ────────────────────────────────────
export const generatePrescription = (consultationId) =>
  client.post(`/consultations/${consultationId}/generate-prescription`);

export const updatePrescription = (consultationId, data) =>
  client.put(`/consultations/${consultationId}/prescription`, data);

export const getPrescription = (consultationId) =>
  client.get(`/consultations/${consultationId}/prescription`);

export const exportPrescriptionPDF = (consultationId) =>
  client.get(`/consultations/${consultationId}/prescription/pdf`, { responseType: 'blob' });

// ─── EHR ──────────────────────────────────────────────
export const getEHRRecord = (patientId) => client.get(`/ehr/${patientId}`);
export const exportFHIR = (noteId) => 
  client.get(`/notes/${noteId}/export/fhir`);

// ─── Dashboard ────────────────────────────────────────
export const getDashboardStats = () => client.get('/dashboard/stats');
export const getRecentConsultations = () => client.get('/dashboard/recent');

export default client;
