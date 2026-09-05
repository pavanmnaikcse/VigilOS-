import requests
import json

payload = {
    "case_id": "TEST-1234",
    "transaction": {
        "amount": 500,
        "oldbalanceOrg": 1000,
        "newbalanceOrig": 500
    }
}
r = requests.post("http://localhost:8000/api/investigate_async", json=payload)
print(r.status_code, r.text)
