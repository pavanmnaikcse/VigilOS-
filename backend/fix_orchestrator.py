import os
from typing import Dict, Any, List, Optional
from pymongo import MongoClient

def get_mongo_db():
    client = MongoClient("mongodb://localhost:27017/")
    return client.vigilos

def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    db = get_mongo_db()
    if case_id.lower() == "latest":
        return db.cases.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    return db.cases.find_one({"case_id": case_id}, {"_id": 0})
