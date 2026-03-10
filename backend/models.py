from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

class Patient(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    abha_id = db.Column(db.String(50), unique=True, nullable=False,)
    
    consultations = db.relationship('Consultation', backref='patient', lazy=True)

class Consultation(db.Model):
    __tablename__ = 'consultations'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    audio_file = db.Column(db.String(255), nullable=False)
    raw_transcript = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    soap_note = db.relationship('SOAPNote', backref='consultation', uselist=False, lazy=True)

class SOAPNote(db.Model):
    __tablename__ = 'soap_notes'
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id'), nullable=False)
    subjective = db.Column(db.Text, nullable=False)
    objective = db.Column(db.Text, nullable=False)
    assessment = db.Column(db.Text, nullable=False)
    plan = db.Column(db.Text, nullable=False)
    is_finalized = db.Column(db.Boolean, default=False)

    prescriptions = db.relationship('Prescription', backref='soap_note', lazy=True, cascade="all, delete-orphan")

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    id = db.Column(db.Integer, primary_key=True)
    soap_note_id = db.Column(db.Integer, db.ForeignKey('soap_notes.id'), nullable=False)
    medicine_name = db.Column(db.String(150), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.String(100), nullable=False)
    