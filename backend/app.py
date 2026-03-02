from flask import Flask
from extensions import db, jwt, cors,socketio
from routes.consultations import consultations_bp
import os
from routes.auth import auth_bp
from routes.patients import patients_bp
from routes.notes import notes_bp
import sockets.audio_stream
import dotenv

dotenv.load_dotenv()
def create_app():
    app = Flask(__name__)

    app.url_map.strict_slashes = False
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clinic.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'media')
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    socketio.init_app(app)

    # Register Blueprints
    app.register_blueprint(consultations_bp, url_prefix='/api/consultations')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')

    # Create tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.url_map.strict_slashes = False
    # Explicitly bind to 0.0.0.0 to accept both localhost and 127.0.0.1
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)