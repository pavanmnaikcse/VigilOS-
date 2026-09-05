
with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\backend\app\routers\mobile.py", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Inject Request import
if "from fastapi import Request" not in content:
    content = content.replace("from fastapi import APIRouter", "from fastapi import APIRouter, Request")

# Inject request into balance
content = content.replace("async def get_balance(account_id: str = Depends(get_mobile_user)):", "async def get_balance(request: Request, account_id: str = Depends(get_mobile_user)):\n    track_device(account_id, request)")

# Inject request into register
content = content.replace("async def register_device(request: RegisterRequest):", "async def register_device(request_obj: RegisterRequest, request: Request):")
content = content.replace("device_id=request.device_id", "device_id=request_obj.device_id")
content = content.replace("device_model=request.device_model", "device_model=request_obj.device_model")

# Inject request into history
content = content.replace("async def get_transaction_history(account_id: str = Depends(get_mobile_user)):", "async def get_transaction_history(request: Request, account_id: str = Depends(get_mobile_user)):\n    track_device(account_id, request)")

# Inject request into submit
content = content.replace("async def submit_transaction(", "async def submit_transaction(request: Request, ")
content = content.replace("request: TransactionSubmitRequest,", "request_obj: TransactionSubmitRequest,")
content = content.replace("sender_account_id=request.sender_account_id", "sender_account_id=request_obj.sender_account_id")
content = content.replace("request.amount", "request_obj.amount")
content = content.replace("request.receiver_account_id", "request_obj.receiver_account_id")
content = content.replace("request.location", "request_obj.location")
# Add track_device call inside submit_transaction
content = content.replace("db = get_mongo_db()", "track_device(account_id, request)\n    db = get_mongo_db()", 1) # Only first occurrence (which is in submit_transaction)


with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\backend\app\routers\mobile.py", "w", encoding="utf-8") as f:
    f.write(content)

