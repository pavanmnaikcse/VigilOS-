from app.agents.fraud_scorer import score
import traceback

transaction = {
    "amount": 500,
    "nameOrig": "C123",
    "nameDest": "C456",
    "txn_id": "TEST1",
    "oldbalanceOrg": 1000,
    "newbalanceOrig": 500,
    "oldbalanceDest": 0
}

try:
    result = score(transaction)
    print("Success:", result)
except Exception as e:
    traceback.print_exc()
