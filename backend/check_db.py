import sqlite3
import os

# Update these two lines to 'clinic.db'
db_path = 'instance/clinic.db' 

if not os.path.exists(db_path):
    db_path = 'clinic.db'

if not os.path.exists(db_path):
    print("Database file not found! Make sure you run the Flask app first so SQLAlchemy can create it.")
else:
    print(f"\n--- DATABASE CHECK ({db_path}) ---")
    
    # Connect directly to the raw SQLite file
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Check what tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Tables found: {', '.join(tables)}")
    
    # 2. Check the Patients table
    if 'patient' in tables:
        cursor.execute("SELECT id, name, age, gender FROM patient;")
        patients = cursor.fetchall()
        print(f"\nPatients Registered: {len(patients)}")
        for p in patients:
            print(f" - ID: {p[0]} | Name: {p[1]} | Age: {p[2]} | Gender: {p[3]}")
            
    # 3. Check the Users/Doctors table
    if 'user' in tables:
        cursor.execute("SELECT id, username FROM user;")
        users = cursor.fetchall()
        print(f"\nDoctors Registered: {len(users)}")
        for u in users:
            print(f" - ID: {u[0]} | Email: {u[1]}")
            
    print("\n----------------------\n")
    conn.close()