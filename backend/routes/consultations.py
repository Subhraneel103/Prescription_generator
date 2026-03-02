import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models import Consultation, SOAPNote, Prescription
from services.transcription import transcribe_audio
from services.soap_generator import generate_soap
from services.prescription import extract_prescriptions
# from flask_jwt_extended import jwt_required, get_jwt_identity 

consultations_bp = Blueprint('consultations', __name__)

@consultations_bp.route('/upload', methods=['POST'])
# @jwt_required() # Uncomment when auth is ready
def upload_consultation():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    audio_file = request.files['audio']
    patient_id = request.form.get('patient_id')
    
    if not patient_id:
         return jsonify({"error": "patient_id is required"}), 400

    # 1. Save File securely
    filename = secure_filename(audio_file.filename)
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    audio_file.save(filepath)

    try:
        # 2. Transcribe using Whisper
        transcript = transcribe_audio(filepath)
        
        # 3. Generate SOAP using LLM
        soap_data = generate_soap(transcript)
        
        # 4. Extract Prescriptions using LLM
        prescriptions_data = extract_prescriptions(soap_data['plan'])

        # 5. Save everything to SQLite Database via SQLAlchemy
        # doctor_id = get_jwt_identity() # Use this when JWT is active

        doctor_id=1

        consultation = Consultation(
            patient_id=patient_id,
            doctor_id=doctor_id,
            audio_file=filepath,
            raw_transcript=str(transcript) # Force string conversion
        )
        db.session.add(consultation)
        db.session.flush()

        # Ensure these are strings, not dictionaries
        soap_note = SOAPNote(
            consultation_id=consultation.id,
            subjective=str(soap_data.get('subjective', '')),
            objective=str(soap_data.get('objective', '')),
            assessment=str(soap_data.get('assessment', '')),
            plan=str(soap_data.get('plan', ''))
        )
        db.session.add(soap_note)
        db.session.flush()

        for rx in prescriptions_data:
            # If rx is a dict, get() works; if it's already a string, this needs handling
            prescription = Prescription(
                soap_note_id=soap_note.id,
                medicine_name=str(rx.get('medicine_name', '')),
                dosage=str(rx.get('dosage', '')),
                frequency=str(rx.get('frequency', '')),
                duration=str(rx.get('duration', ''))
            )
            db.session.add(prescription)

        db.session.commit()

        # 6. Return full payload to React Frontend
        return jsonify({
            "message": "Consultation processed successfully",
            "consultation_id": consultation.id,
            "transcript": transcript,
            "soap_note": soap_data,
            "prescriptions": prescriptions_data
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500