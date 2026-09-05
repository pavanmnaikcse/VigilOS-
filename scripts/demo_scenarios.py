import random
import requests
import time

BASE_URL = "http://localhost:8000/api/investigate"

# Example 1: High Risk (Mule Pattern)
scenario_1 = {
    "transaction": {
        "type": "CASH_OUT",
        "amount": 339682.13,
        "nameOrig": "C1231006815",
        "oldbalanceOrg": 339682.13,
        "newbalanceOrig": 0.0,
        "nameDest": "C1979888765",
        "oldbalanceDest": 0.0,
        "newbalanceDest": 0.0,
        "step": 3
    },
    "messages": [
        "Act now to verify your account details",
        "Wire transfer pending"
    ],
    "urls": ["http://chase-security-verify.com/login"]
}

# Example 2: Medium Risk (Suspicious Transfer)
scenario_2 = {
    "transaction": {
        "type": "TRANSFER",
        "amount": 50000.00,
        "nameOrig": "C234123",
        "oldbalanceOrg": 100000.00,
        "newbalanceOrig": 50000.00,
        "nameDest": "C54321",
        "oldbalanceDest": 1200.00,
        "newbalanceDest": 51200.00,
        "step": 4
    },
    "messages": [
        "Can you send the money for the car?"
    ],
    "urls": []
}

# Example 3: Low Risk (Normal Payment)
scenario_3 = {
    "transaction": {
        "type": "TRANSFER",
        "amount": 250.00,
        "nameOrig": "C998877",
        "oldbalanceOrg": 5250.00,
        "newbalanceOrig": 5000.00,
        "nameDest": "C112233",
        "oldbalanceDest": 500.00,
        "newbalanceDest": 750.00,
        "step": 5
    },
    "messages": [
        "Dinner split"
    ],
    "urls": []
}

def run_scenario(name, payload):
    print(f"\n--- Running {name} ---")
    try:
        response = requests.post(BASE_URL, json=payload, timeout=30)
        if response.status_code == 200:
            print("Success! Case created.")
            case = response.json()
            score = case.get('fraud_score', {}).get('risk_score', 'N/A')
            print(f"Case ID: {case.get('case_id')}")
            print(f"Risk Score: {score}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Failed to submit: {e}")

if __name__ == "__main__":
    print("Submitting demo scenarios to VigilOS API...")
    run_scenario("High Risk Mule", scenario_1)
    time.sleep(1)
    run_scenario("Medium Risk Transfer", scenario_2)
    time.sleep(1)
    run_scenario("Low Risk Normal Payment", scenario_3)
    print("\nFinished submitting demo cases.")
