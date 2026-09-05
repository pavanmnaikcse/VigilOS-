from pymongo import MongoClient
import json
client = MongoClient('mongodb://localhost:27017/')
db = client['vigilos']
case = db.cases.find_one({})
for key, value in case.items():
    size = len(json.dumps(value, default=str))
    print(f"{key}: {size} bytes")
