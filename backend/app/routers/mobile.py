from fastapi import APIRouter, HTTPException, Depends, Header, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import asyncio
from bson import ObjectId

from app.database import get_mongo_db
from app.routers.auth import create_access_token
from app.orchestrator import investigate

router = APIRouter()

# Global WebSocket manager for connected mobile devices
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, account_id: str):
        await websocket.accept()
        self.active_connections[account_id] = websocket

    def disconnect(self, account_id: str):
        if account_id in self.active_connections:
            del self.active_connections[account_id]

    async def send_personal_message(self, message: dict, account_id: str):
        if account_id in self.active_connections:
            try:
                await self.active_connections[account_id].send_json(message)
            except Exception:
                self.disconnect(account_id)

manager = ConnectionManager()

import time
from fastapi import Request

# Track active devices (account_id -> {"ip": str, "last_seen": float})
active_devices = {}

def track_device(account_id: str, request: Request):
    ip = request.client.host if request.client else "Unknown"
    active_devices[account_id] = {"ip": ip, "last_seen": time.time()}

@router.get("/connections")
def get_active_connections():
    connections = []
    current_time = time.time()
    # Also include WS connections just in case
    for account_id, ws in manager.active_connections.items():
        client = ws.client
        ip = client.host if client else "Unknown"
        active_devices[account_id] = {"ip": ip, "last_seen": current_time}
        
    for account_id, data in list(active_devices.items()):
        # Expire after 2 minutes
        if current_time - data["last_seen"] > 120:
            del active_devices[account_id]
        else:
            connections.append({"account_id": account_id, "ip": data["ip"]})
            
    return {"status": "success", "connections": connections}

# Data models
class RegisterRequest(BaseModel):
    device_id: str
    device_model: str

class Location(BaseModel):
    lat: float
    lng: float

class TransactionSubmitRequest(BaseModel):
    sender_account_id: str
    receiver_account_id: str
    amount: float
    timestamp: str
    location: Optional[Location] = None
    location_permission_denied: bool

class TransactionOut(BaseModel):
    transaction_id: str
    type: str
    counterparty_account_id: str
    amount: float
    timestamp: str
    status: str

# 1. Registration
@router.post("/register")
async def register_device(req: RegisterRequest, request: Request):
    db = get_mongo_db()
    
    # Generate unique account ID
    account_id = f"ACC-{uuid.uuid4().hex[:5].upper()}"
    
    track_device(account_id, request)
    
    user_doc = {
        "account_id": account_id,
        "device_id": req.device_id,
        "device_model": req.device_model,
        "balance": 10000.00,  # Starting balance for testing
        "created_at": datetime.utcnow()
    }
    
    result = db.mobile_users.insert_one(user_doc)
    
    # We use the generated account_id as the subject for the token
    token = create_access_token(data={"user_id": account_id})
    
    return {
        "account_id": account_id,
        "token": token,
        "initial_balance": 10000.00
    }

# Auth dependency specific to mobile uses account_id
def get_mobile_user(authorization: str = Header(...)):
    try:
        from app.routers.auth import SECRET_KEY, ALGORITHM
        from jose import jwt, JWTError
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        account_id = payload.get("user_id")
        if not account_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return account_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# 2. Balance Fetch
@router.get("/balance")
async def get_balance(request: Request, account_id: str = Depends(get_mobile_user)):
    track_device(account_id, request)
    db = get_mongo_db()
    user = db.mobile_users.find_one({"account_id": account_id})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return {
        "account_id": account_id,
        "balance": user.get("balance", 0.0)
    }

# 3. Transaction Submit
@router.post("/transactions/submit")
async def submit_transaction(request: Request, req: TransactionSubmitRequest, account_id: str = Depends(get_mobile_user)):
    if account_id != req.sender_account_id:
        raise HTTPException(status_code=403, detail="Unauthorized sender")
        
    db = get_mongo_db()
    sender = db.mobile_users.find_one({"account_id": account_id})
    receiver = db.mobile_users.find_one({"account_id": req.receiver_account_id})
    
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
        
    if sender.get("balance", 0.0) < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
        
    # Create pending transaction
    txn_id = f"TXN-{uuid.uuid4().hex[:6].upper()}"
    import random
    txn_doc = {
        "transaction_id": txn_id,
        "sender_account_id": account_id,
        "receiver_account_id": req.receiver_account_id,
        "amount": req.amount,
        "timestamp": datetime.utcnow(),
        "status": "PENDING",
        "location": req.location.dict() if req.location else None,
        "location_permission_denied": req.location_permission_denied,
        "account_balance_ratio": round(random.uniform(0.1, 0.9), 2),
        "90_days_average_transaction": round(random.uniform(500, 5000), 2),
        "customer_risk_tier": random.choice(["LOW", "MEDIUM", "HIGH"]),
        "amount_vs_90d_avg": round(random.uniform(0.5, 5.0), 2),
        "contextual_new_device": random.choice([True, False]),
        "contextual_odd_hour": random.choice([True, False]),
        "contextual_new_payee": random.choice([True, False]),
        "velocity_txns_1h": random.randint(1, 10),
        "velocity_spike_flag": random.choice([True, False]),
        "account_drained_flag": random.choice([True, False]),
        "xgboost_ensemble_probability": round(random.uniform(0.01, 0.99), 4)
    }
    db.mobile_transactions.insert_one(txn_doc)
    
    new_sender_bal = sender.get("balance", 0.0) - req.amount
    new_receiver_bal = receiver.get("balance", 0.0) + req.amount

    # Integrate with VigilOS Orchestrator
    payload = {
        "txn_id": txn_id,
        "amount": req.amount,
        "nameOrig": account_id,
        "nameDest": req.receiver_account_id,
        "type": "TRANSFER",
        "device_id": sender.get("device_id"),
        "oldbalanceOrg": sender.get("balance", 0.0),
        "newbalanceOrig": new_sender_bal,
        "oldbalanceDest": receiver.get("balance", 0.0),
        "newbalanceDest": new_receiver_bal
    }
    
    # Mocking locationOrig for backend rules
    if req.location:
        payload["locationOrig"] = f"{req.location.lat},{req.location.lng}"
    
    investigation_result = await investigate({"transaction": payload})
    decision = investigation_result.get("explanation", {}).get("recommendation", {}).get("action", "MONITOR")
    
    # Process outcome - AS REQUESTED BY USER, ALWAYS TRANSFER THE MONEY
    
    # Update balances in DB
    db.mobile_users.update_one({"account_id": account_id}, {"$set": {"balance": new_sender_bal}})
    db.mobile_users.update_one({"account_id": req.receiver_account_id}, {"$set": {"balance": new_receiver_bal}})
    
    # Real-time WebSocket Push to receiver
    await manager.send_personal_message({
        "type": "BALANCE_UPDATE",
        "new_balance": new_receiver_bal,
        "trigger_transaction_id": txn_id
    }, req.receiver_account_id)
    
    if decision == "BLOCK" or decision == "ESCALATE":
        db.mobile_transactions.update_one({"transaction_id": txn_id}, {"$set": {"status": "HELD_FOR_REVIEW"}})
        return {"status": "HELD_FOR_REVIEW", "new_balance": new_sender_bal, "transaction_id": txn_id}
        
    else: # SUCCESS
        db.mobile_transactions.update_one({"transaction_id": txn_id}, {"$set": {"status": "SUCCESS"}})
        return {"status": "SUCCESS", "new_balance": new_sender_bal, "transaction_id": txn_id}

# 4. History
@router.get("/transactions")
async def get_history(limit: int = 20, offset: int = 0, account_id: str = Depends(get_mobile_user)):
    db = get_mongo_db()
    txns = list(db.mobile_transactions.find({
        "$or": [{"sender_account_id": account_id}, {"receiver_account_id": account_id}]
    }).sort("timestamp", -1).skip(offset).limit(limit))
    
    result = []
    for t in txns:
        is_sender = (t["sender_account_id"] == account_id)
        result.append({
            "transaction_id": t["transaction_id"],
            "type": "SENT" if is_sender else "RECEIVED",
            "counterparty_account_id": t["receiver_account_id"] if is_sender else t["sender_account_id"],
            "amount": t["amount"],
            "timestamp": t["timestamp"].isoformat() if isinstance(t["timestamp"], datetime) else t["timestamp"],
            "status": t["status"]
        })
        
    return {"transactions": result, "has_more": len(result) == limit}

# 5. WebSocket
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    account_id = None
    try:
        # Expect immediate auth message
        auth_msg = await websocket.receive_json()
        if auth_msg.get("type") == "AUTH":
            token = auth_msg.get("token")
            # Verify token
            from app.routers.auth import SECRET_KEY, ALGORITHM
            from jose import jwt
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            account_id = payload.get("user_id")
            
            if account_id:
                manager.active_connections[account_id] = websocket
                await websocket.send_json({"type": "AUTH_SUCCESS"})
            else:
                await websocket.close(code=1008)
                return
        else:
            await websocket.close(code=1008)
            return
            
        while True:
            # Keep connection alive
            await websocket.receive_text()
            
    except Exception:
        if account_id:
            manager.disconnect(account_id)

class AddFundsRequest(BaseModel):
    amount: float

@router.post("/add-funds")
async def add_funds(req: AddFundsRequest, account_id: str = Depends(get_mobile_user)):
    db = get_mongo_db()
    user = db.mobile_users.find_one({"account_id": account_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_balance = user.get("balance", 0.0) + req.amount
    db.mobile_users.update_one({"account_id": account_id}, {"$set": {"balance": new_balance}})
    
    return {"status": "SUCCESS", "new_balance": new_balance}

@router.get("/transactions/history")
async def get_transaction_history(request: Request, account_id: str = Depends(get_mobile_user)):
    track_device(account_id, request)
    db = get_mongo_db()
    
    # Find all transactions where this user is sender or receiver
    cursor = db.mobile_transactions.find({
        "$or": [
            {"sender_account_id": account_id},
            {"receiver_account_id": account_id}
        ]
    }).sort("timestamp", -1).limit(50)
    
    txns = []
    for doc in cursor:
        is_sender = doc["sender_account_id"] == account_id
        txns.append({
            "transaction_id": doc["transaction_id"],
            "type": "SENT" if is_sender else "RECEIVED",
            "counterparty": doc["receiver_account_id"] if is_sender else doc["sender_account_id"],
            "amount": doc["amount"],
            "status": doc.get("status", "UNKNOWN"),
            "timestamp": doc["timestamp"].isoformat() if hasattr(doc["timestamp"], "isoformat") else str(doc["timestamp"])
        })
        
    return {"transactions": txns}
