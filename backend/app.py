from flask import Flask
from extensions import db, jwt, cors
from routes.consultations import consultations_bp
import os
from routes.auth import auth_bp
from routes.patients import patients_bp
from routes.notes import notes_bp
def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clinic.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'your-super-secret-key' # Use env variables in prod
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'media')
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # Register Blueprints
    # Register Blueprints
    app.register_blueprint(consultations_bp, url_prefix='/api/consultations')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    # app.register_blueprint(auth_bp, url_prefix='/api/auth')
    # app.register_blueprint(patients_bp, url_prefix='/api/patients')

    # Create tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)