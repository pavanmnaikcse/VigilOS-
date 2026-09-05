import time
from app.database import get_mongo_db
start = time.time()
db = get_mongo_db()
cursor = db.cases.find({}, {'_id': 0}).sort('created_at', -1).limit(1000)
list(cursor)
print('Mongo Query time:', time.time() - start)
