import datetime

def to_fhir(soap_note: dict, patient: dict, doctor_name: str) -> dict:
    """Converts a parsed SOAP note and Patient details to a FHIR R4 Composition resource."""
    return {
        "resourceType": "Composition",
        "status": "final",
        "type": {
            "coding": [{
                "system": "http://loinc.org",
                "code": "11506-3",
                "display": "Progress note"
            }]
        },
        "subject": {
            "reference": f"Patient/{patient['abha_id']}",
            "display": patient['name']
        },
        "date": datetime.datetime.utcnow().isoformat() + "Z",
        "author": [{
            "display": doctor_name
        }],
        "title": "Clinical Consultation Note",
        "section": [
            {
                "title": "Subjective",
                "text": {"status": "generated", "div": f"<div xmlns='http://www.w3.org/1999/xhtml'>{soap_note['subjective']}</div>"}
            },
            {
                "title": "Objective",
                "text": {"status": "generated", "div": f"<div xmlns='http://www.w3.org/1999/xhtml'>{soap_note['objective']}</div>"}
            },
            {
                "title": "Assessment",
                "text": {"status": "generated", "div": f"<div xmlns='http://www.w3.org/1999/xhtml'>{soap_note['assessment']}</div>"}
            },
            {
                "title": "Plan",
                "text": {"status": "generated", "div": f"<div xmlns='http://www.w3.org/1999/xhtml'>{soap_note['plan']}</div>"}
            }
        ]
    }