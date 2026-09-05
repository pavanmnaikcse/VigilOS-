from pymongo import MongoClient
import json
client = MongoClient('mongodb://localhost:27017/')
db = client['vigilos']
cases = db.cases.find({})
sizes = []
for idx, case in enumerate(cases):
    size = len(json.dumps(case, default=str))
    sizes.append((idx, size))
sizes.sort(key=lambda x: x[1], reverse=True)
print("Top 5 largest cases:")
for idx, size in sizes[:5]:
    print(f"Case index {idx}: {size} bytes")
    # let's print the largest fields of the largest case
    if idx == sizes[0][0]:
        case = db.cases.find({}).skip(idx).limit(1)[0]
        for key, value in case.items():
            field_size = len(json.dumps(value, default=str))
            if field_size > 10000:
                print(f"  Field {key}: {field_size} bytes")
