from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.database import get_mongo_db
from app.routers.auth import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

from app.orchestrator import investigate

router = APIRouter()

class TransferRequest(BaseModel):
    recipient_username: str
    amount: float

class TransactionOut(BaseModel):
    txn_id: str
    sender_id: str
    receiver_id: str
    amount: float
    timestamp: str
    status: str
    risk_score: Optional[float] = None
    decision: Optional[str] = None
    reason: Optional[str] = None

def get_current_user_id(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/balance")
async def get_balance(user_id: str = Depends(get_current_user_id)):
    db = get_mongo_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"balance": user.get("balance", 0.0)}

@router.get("/history", response_model=List[TransactionOut])
async def get_history(user_id: str = Depends(get_current_user_id)):
    db = get_mongo_db()
    # Find transactions where user is sender or receiver
    txns = list(db.transactions.find({
        "$or": [
            {"sender_id": user_id},
            {"receiver_id": user_id}
        ]
    }).sort("timestamp", -1))
    
    result = []
    for t in txns:
        result.append({
            "txn_id": str(t["_id"]),
            "sender_id": t["sender_id"],
            "receiver_id": t["receiver_id"],
            "amount": t["amount"],
            "timestamp": t["timestamp"].isoformat() if isinstance(t.get("timestamp"), datetime) else str(t.get("timestamp")),
            "status": t.get("status", "COMPLETED"),
            "risk_score": t.get("risk_score"),
            "decision": t.get("decision"),
            "reason": t.get("reason")
        })
    return result

@router.post("/transfer")
async def initiate_transfer(request: TransferRequest, user_id: str = Depends(get_current_user_id)):
    db = get_mongo_db()
    
    sender = db.users.find_one({"_id": ObjectId(user_id)})
    receiver = db.users.find_one({"username": request.recipient_username})
    
    if not sender or not receiver:
        raise HTTPException(status_code=404, detail="User not found")
        
    if sender["balance"] < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
        
    receiver_id = str(receiver["_id"])
    
    # 1. Create a pending transaction record
    txn_doc = {
        "sender_id": user_id,
        "receiver_id": receiver_id,
        "amount": request.amount,
        "timestamp": datetime.utcnow(),
        "status": "PENDING"
    }
    result = db.transactions.insert_one(txn_doc)
    txn_id = str(result.inserted_id)
    
    # 2. Call VigilOS Orchestrator to score the transaction
    # We map the real wallet IDs into the orchestrator payload
    payload = {
        "txn_id": txn_id,
        "amount": request.amount,
        "sender_account_id": user_id,
        "receiver_account_id": receiver_id,
        "device_id": "app_device",
        "ip_address": "127.0.0.1"
    }
    
    # Run the investigation
    investigation_result = await investigate(payload)
    
    decision = investigation_result.get("decision", "MONITOR")
    risk_score = investigation_result.get("risk_score", 0.0)
    reason = investigation_result.get("reason", "")
    
    # 3. Handle decision
    if decision == "BLOCK":
        db.transactions.update_one({"_id": ObjectId(txn_id)}, {"$set": {
            "status": "BLOCKED",
            "decision": decision,
            "risk_score": risk_score,
            "reason": reason
        }})
        raise HTTPException(status_code=403, detail=f"Transaction blocked by security policy: {reason}")
        
    elif decision == "ESCALATE":
        db.transactions.update_one({"_id": ObjectId(txn_id)}, {"$set": {
            "status": "HELD_FOR_REVIEW",
            "decision": decision,
            "risk_score": risk_score,
            "reason": reason
        }})
        # Deduct from sender, but don't give to receiver yet. (Or just hold).
        # For simplicity, we just leave it pending.
        return {"status": "HELD_FOR_REVIEW", "message": "Transaction held for manual review."}
        
    else:
        # APPROVE / MONITOR - Execute ledger update
        db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"balance": -request.amount}})
        db.users.update_one({"_id": ObjectId(receiver_id)}, {"$inc": {"balance": request.amount}})
        
        db.transactions.update_one({"_id": ObjectId(txn_id)}, {"$set": {
            "status": "COMPLETED",
            "decision": decision,
            "risk_score": risk_score,
            "reason": reason
        }})
        
        return {"status": "COMPLETED", "message": "Transfer successful"}
