import pymongo
import json
import random

def fetch_seeds():
    print("Connecting to MongoDB...")
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["vigilos"]
    transactions_collection = db["transactions"]
    
    # We want to pick a few distinct origin accounts that have some transactions
    pipeline = [
        {"$group": {"_id": "$nameOrig", "count": {"$sum": 1}, "oldbalanceOrg": {"$first": "$oldbalanceOrg"}}},
        {"$match": {"count": {"$gt": 0}}},
        {"$sample": {"size": 10}}
    ]
    
    print("Fetching sample accounts...")
    results = list(transactions_collection.aggregate(pipeline))
    
    seed_data = []
    for row in results:
        account_id = row["_id"]
        balance = row["oldbalanceOrg"]
        
        # Get their recent transactions
        history = list(transactions_collection.find({"nameOrig": account_id}).sort("step", -1).limit(5))
        
        history_clean = []
        for h in history:
            history_clean.append({
                "type": h["type"],
                "amount": h["amount"],
                "nameDest": h["nameDest"],
                "step": h["step"]
            })
            
        seed_data.append({
            "account_id": account_id,
            "balance": balance,
            "history": history_clean
        })
        
    with open("src/seed_data.json", "w") as f:
        json.dump(seed_data, f, indent=2)
        
    print(f"Saved {len(seed_data)} seed accounts to src/seed_data.json")

if __name__ == "__main__":
    fetch_seeds()
