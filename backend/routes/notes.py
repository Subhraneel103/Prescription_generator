from flask import Blueprint, request, jsonify
from extensions import db
from models import SOAPNote, Consultation, Patient, User
from services.fhir_exporter import to_fhir

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/<int:consultation_id>', methods=['GET'])
def get_note(consultation_id):
    note = SOAPNote.query.filter_by(consultation_id=consultation_id).first_or_404()
    prescriptions = [{"medicine": p.medicine_name, "dosage": p.dosage, "freq": p.frequency, "duration": p.duration} for p in note.prescriptions]
    
    return jsonify({
        "id": note.id,
        "subjective": note.subjective,
        "objective": note.objective,
        "assessment": note.assessment,
        "plan": note.plan,
        "is_finalized": note.is_finalized,
        "prescriptions": prescriptions
    }), 200

@notes_bp.route('/<int:note_id>', methods=['PATCH'])
def update_note(note_id):
    note = SOAPNote.query.get_or_404(note_id)
    data = request.get_json()

    if 'subjective' in data: note.subjective = data['subjective']
    if 'objective' in data: note.objective = data['objective']
    if 'assessment' in data: note.assessment = data['assessment']
    if 'plan' in data: note.plan = data['plan']
    if 'is_finalized' in data: note.is_finalized = data['is_finalized']

    db.session.commit()
    return jsonify({"message": "Note updated successfully"}), 200

@notes_bp.route('/<int:note_id>/export/fhir', methods=['GET'])
def export_fhir(note_id):
    note = SOAPNote.query.get_or_404(note_id)
    consultation = Consultation.query.get(note.consultation_id)
    patient = Patient.query.get(consultation.patient_id)
    doctor = User.query.get(consultation.doctor_id)

    note_dict = {
        "subjective": note.subjective,
        "objective": note.objective,
        "assessment": note.assessment,
        "plan": note.plan
    }
    
    patient_dict = {
        "name": patient.name,
        "abha_id": patient.abha_id
    }

    fhir_json = to_fhir(note_dict, patient_dict, doctor.username)
    return jsonify(fhir_json), 200