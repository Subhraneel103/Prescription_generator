import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models import Consultation, SOAPNote, Prescription
from services.transcription import transcribe_audio
from services.soap_generator import generate_soap
from services.prescription import extract_prescriptions

consultations_bp = Blueprint('consultations', __name__)

@consultations_bp.route('/upload', methods=['POST'])
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
        # 2. Transcription using Sanchit Gandhi Medical Whisper
        transcript = transcribe_audio(filepath)
        
        # 3. Generate SOAP using Medical LLM
        soap_data = generate_soap(transcript)
        
        # 4. Extract Prescriptions using combined context
        medication_context = f"ASSESSMENT: {soap_data.get('assessment', '')}\nPLAN: {soap_data.get('plan', '')}"
        prescriptions_data = extract_prescriptions(medication_context)

        # 5. Save everything to Database
        doctor_id = 1 

        consultation = Consultation(
            patient_id=patient_id,
            doctor_id=doctor_id,
            audio_file=filepath,
            raw_transcript=str(transcript)
        )
        db.session.add(consultation)
        db.session.flush()

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
            if isinstance(rx, dict):
                # Now using the dedicated 'timing' column from your updated models.py
                prescription = Prescription(
                    soap_note_id=soap_note.id,
                    medicine_name=str(rx.get('medicine_name', 'Unknown')),
                    dosage=str(rx.get('dosage', 'As directed')),
                    frequency=str(rx.get('frequency', '1-0-0')),
                    duration=str(rx.get('duration', 'As directed')),
                    timing=str(rx.get('timing', 'After Food (PC)')) # Dedicated field
                )
                db.session.add(prescription)

        db.session.commit()

        # 6. Return payload
        return jsonify({
            "message": "Consultation processed successfully",
            "consultation_id": consultation.id,
            "transcript": transcript,
            "soap_note": soap_data,
            "prescriptions": prescriptions_data
        }), 201

    except Exception as e:
        db.session.rollback()
        # Log the error for debugging
        print(f"Error processing consultation: {str(e)}")
        return jsonify({"error": str(e)}), 500