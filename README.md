# Prescription Generator

Project for NextGenHackathon 2026.

## Overview
Prescription Generator is a full-stack application designed to streamline clinical documentation and prescription creation. The platform combines a Flask backend with a React frontend to support consultation intake, transcription, SOAP note drafting, prescription generation, and FHIR-compatible export.

## Core Features
- Patient and consultation management
- Audio recording and transcription during consultations
- Automatic generation of SOAP notes
- Prescription drafting from consultation context
- Dashboard for reviewing consultations and generated outputs
- EHR-style patient history and search experience
- Optional export of structured clinical data for interoperability

## Main User Workflow
1. Authenticate into the application.
2. Search for or create a patient record.
3. Start a consultation and capture audio.
4. Transcribe the conversation and review the transcript.
5. Generate a SOAP note and prescription draft.
6. Review, edit, and export the results as needed.

## Project Structure
- Backend: `backend/`
  - Flask app and routes
  - Models, services, and database helpers
  - Transcription, SOAP generation, and prescription logic
- Frontend: `frontend/`
  - React pages and reusable UI components
  - Dashboard, consultation workflow, and patient history views
- Infrastructure: `docker-compose.yml`
- Dependency files:
  - `requirements.txt`
  - `backend/requirements.txt`
  - `frontend/package.json`

## Prerequisites
- Python 3.10+
- Node.js 18+
- Docker and Docker Compose (optional)
- Access to required environment variables for the backend

## Setup
1. Create and activate a Python virtual environment.
2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r backend/requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Create a `.env` file with the required backend environment variables.

## Running the Application
### Backend
```bash
cd backend
python app.py
```

### Frontend
```bash
cd frontend
npm start
```

### Docker
```bash
docker compose up --build
```

## Development Notes
- Local media files, audio uploads, and cache directories such as `whisper_cache/` should not be committed.
- If a file was already tracked by Git, remove it from the index before relying on `.gitignore`:
  ```bash
  git rm -r --cached whisper_cache
  ```
- The project uses Flask for the backend API and React for the user interface.

## Expected Outcome
After setup, users should be able to create or review patient consultations, record audio, generate structured clinical notes, and produce prescription drafts from the web interface.
