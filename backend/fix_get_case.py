with open('app/orchestrator.py', 'r') as f:
    code = f.read()

old_get_case = '''def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    db = get_mongo_db()
    return db.cases.find_one({"case_id": case_id}, {"_id": 0})'''

new_get_case = '''def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    db = get_mongo_db()
    if case_id.lower() == "latest":
        return db.cases.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    return db.cases.find_one({"case_id": case_id}, {"_id": 0})'''

code = code.replace(old_get_case, new_get_case)

with open('app/orchestrator.py', 'w') as f:
    f.write(code)
