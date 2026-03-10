from app import create_app
from extensions import db
import os

app = create_app()

def reset_database():
    with app.app_context():
        db_path = os.path.join(app.instance_path, 'clinic.db')
        
        # 1. Remove the old database file if it exists
        if os.path.exists(db_path):
            print(f"Removing old database at {db_path}...")
            os.remove(db_path)
        
        # 2. Create all tables based on updated models.py
        print("Creating new database with updated schema (including 'timing' column)...")
        db.create_all()
        
        print("Success! Database reset and ready for medical AI integration.")

if __name__ == "__main__":
    reset_database()