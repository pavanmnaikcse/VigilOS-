import time
from pymongo import MongoClient

print('Testing localhost...')
start = time.time()
MongoClient('mongodb://localhost:27017/').admin.command('ping')
print('localhost time:', time.time() - start)

print('Testing 127.0.0.1...')
start = time.time()
MongoClient('mongodb://127.0.0.1:27017/').admin.command('ping')
print('127.0.0.1 time:', time.time() - start)
