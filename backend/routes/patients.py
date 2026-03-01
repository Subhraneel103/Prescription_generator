from flask import Blueprint, request, jsonify
from extensions import db
from models import Patient, Consultation

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    result = [{
        "id": p.id,
        "name": p.name,
        "age": p.age,
        "gender": p.gender,
        "phone": p.phone,
        "abha_id": p.abha_id
    } for p in patients]
    return jsonify(result), 200

@patients_bp.route('/', methods=['POST'])
def create_patient():
    data = request.get_json()
    
    if Patient.query.filter_by(abha_id=data.get('abha_id')).first():
        return jsonify({"error": "Patient with this ABHA ID already exists"}), 400

    new_patient = Patient(
        name=data.get('name'),
        age=data.get('age'),
        gender=data.get('gender'),
        phone=data.get('phone'),
        abha_id=data.get('abha_id')
    )
    db.session.add(new_patient)
    db.session.commit()

    return jsonify({"message": "Patient created", "patient_id": new_patient.id}), 201

@patients_bp.route('/<int:patient_id>/history', methods=['GET'])
def patient_history(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    consultations = Consultation.query.filter_by(patient_id=patient.id).order_by(Consultation.created_at.desc()).all()
    
    history = []
    for c in consultations:
        note_data = None
        if c.soap_note:
            note_data = {
                "id": c.soap_note.id,
                "assessment": c.soap_note.assessment,
                "is_finalized": c.soap_note.is_finalized
            }
        
        history.append({
            "consultation_id": c.id,
            "date": c.created_at.isoformat(),
            "note": note_data
        })

    return jsonify({
        "patient": {"name": patient.name, "abha_id": patient.abha_id},
        "history": history
    }), 200