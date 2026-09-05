import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, r"C:\Users\pn466\OneDrive\Documents\VigilOS\backend")

from app.orchestrator import investigate

async def main():
    payload = {
        "txn_id": "TXN-12345",
        "amount": 100.0,
        "nameOrig": "ACC-TEST",
        "nameDest": "ACC-TEST2",
        "type": "TRANSFER",
        "oldbalanceOrg": 500.0,
        "newbalanceOrig": 400.0,
        "oldbalanceDest": 0.0,
        "newbalanceDest": 100.0
    }
    print("Testing investigate...")
    result = await investigate({"transaction": payload})
    print(result)

if __name__ == '__main__':
    asyncio.run(main())
