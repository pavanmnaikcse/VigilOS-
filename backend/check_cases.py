from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['vigilos']
print('Total Cases:', db.cases.count_documents({}))
