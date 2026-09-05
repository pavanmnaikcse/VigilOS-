import json
import os
from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from groq import AsyncGroq

from app import orchestrator
from app.config import get_settings
from app.database import get_mongo_db
from app.report import generate_report

router = APIRouter()

class InvestigateRequest(BaseModel):
    transaction: Dict[str, Any]
    messages: Optional[List[str]] = []
    urls: Optional[List[str]] = []

class DecisionRequest(BaseModel):
    decision: str
    notes: str
    decided_by: str

class AskRequest(BaseModel):
    case_id: str
    question: str


import asyncio


import random
import csv
import os

@router.get("/sample_transaction")
def get_sample_transaction():
    # Read a random line from the paysim csv
    csv_path = os.path.join("C:/Users/pn466/OneDrive/Documents/VigilOS/data/paysim/massive_mule_dataset.csv")
    if not os.path.exists(csv_path):
        return {"error": "Dataset not found"}
        
    try:
        # File is huge, so we'll seek to a random byte and read the next full line
        file_size = os.path.getsize(csv_path)
        with open(csv_path, 'r', encoding='utf-8') as f:
            headers = f.readline().strip().split(',')
            
            # Seek random
            f.seek(random.randint(1000, file_size - 1000))
            f.readline() # discard partial line
            line = f.readline().strip()
            
            if not line:
                return {"error": "Failed to read line"}
                
            values = line.split(',')
            
            # New dataset columns: txId, step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig, nameDest, oldbalanceDest, newbalanceDest, locationOrig, locationDest, ipOrig, isFraud, isFlaggedFraud, isTainted
            txn = {
                "txId": values[0],
                "step": int(values[1]),
                "type": values[2],
                "amount": float(values[3]),
                "nameOrig": values[4],
                "oldbalanceOrg": float(values[5]),
                "newbalanceOrig": float(values[6]),
                "nameDest": values[7],
                "oldbalanceDest": float(values[8]),
                "newbalanceDest": float(values[9]),
                "locationOrig": values[10],
                "locationDest": values[11],
                "ipOrig": values[12],
                "isFraud": int(values[13]),
                "isFlaggedFraud": int(values[14]),
                "isTainted": int(values[15]),
                "timestamp": int(datetime.now().timestamp())
            }
            return txn
    except Exception as e:
        return {"error": str(e)}


@router.post("/investigate_async")
async def investigate_async(request: InvestigateRequest):
    inv_id = orchestrator.start_investigation(request.model_dump())
    return {"investigation_id": inv_id}

@router.get("/investigation/{inv_id}/stream")
async def investigation_stream(inv_id: str):
    prog = orchestrator.active_investigations.get(inv_id)
    if not prog:
        raise HTTPException(status_code=404, detail="Investigation not found")

    async def event_generator():
        # First send all already completed steps
        sent_steps = 0
        while True:
            for i in range(sent_steps, len(prog.steps)):
                step = prog.steps[i]
                yield f"data: {json.dumps(step)}\n\n"
                sent_steps += 1
            
            if prog.status == "completed":
                yield f"data: {json.dumps({'status': 'completed', 'case_file': prog.case_file, 'time_taken': prog.time_taken})}\n\n"
                break
                
            # Wait for next step
            await prog.event.wait()

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/investigate")
async def investigate(request: InvestigateRequest):
    case_file = await orchestrator.investigate(request.model_dump())
    return case_file

@router.get("/cases")
def get_cases(skip: int = 0, limit: int = 20):
    return orchestrator.get_cases(skip, limit)

@router.get("/cases/{case_id}")
def get_case(case_id: str):
    case = orchestrator.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/cases/{case_id}/decide")
def decide_case(case_id: str, req: DecisionRequest):
    case = orchestrator.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return orchestrator.decide_case(case_id, req.decision, req.notes, req.decided_by)

@router.get('/cases/{case_id}/report')
async def download_report(case_id: str):
    case = orchestrator.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail='Case not found')
    pdf_bytes = generate_report(case)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename=SAR_{case_id}.pdf'}
    )

from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.config import get_settings
import json

from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.config import get_settings
import json

@router.post("/ask")
async def ask_question(req: AskRequest):
    case = orchestrator.get_case(req.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    clean_case = {
        "transaction": case.get("transaction", {}),
        "fraud_score": case.get("fraud_score", {}),
        "explainer": case.get("explanation", {})
    }
    
    prompt = f"""
    You are an AI assistant helping a fraud investigator analyze a case.
    
    CRITICAL INSTRUCTIONS:
    1. CONVERSATIONAL: If the user says a casual greeting (like "hi", "hello"), respond naturally and conversationally without explaining the case unprompted.
    2. BULLET POINTS: If the user asks why the case is fraud, or asks for an explanation of the case, you MUST explain the reasoning using clear bullet points. DO NOT use large, dense paragraphs. Be concise.
    3. CONTEXT: Answer the question based on the following case file context when relevant:
    
    Case Context:
    {json.dumps(clean_case, indent=2)}
    
    User Question: {req.question}
    """
    
    # Try Groq first, if it fails (e.g. model decommissioned), fallback to Ollama
    try:
        settings = get_settings()
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.1, api_key=settings.GEMINI_API_KEY)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return {"answer": response.content}
    except Exception as e:
        print(f"Groq failed: {e}. Falling back to Ollama.")
        try:
            llm = ChatOllama(model="llama3", temperature=0.3)
            response = await llm.ainvoke([HumanMessage(content=prompt)])
            return {"answer": response.content}
        except Exception as e2:
            raise HTTPException(status_code=500, detail=str(e2))

@router.get("/stats")
def get_stats():
    db = get_mongo_db()
    total_cases = db.cases.count_documents({})
    
    # Aggregation for risk distribution based on risk_level string inside results.fraud_score or something
    # We'll group by whatever risk_level exists, maybe status or decision
    risk_dist = list(db.cases.aggregate([
        {"$group": {"_id": "$fraud_score.risk_level", "count": {"$sum": 1}}}
    ]))
    
    decision_dist = list(db.cases.aggregate([
        {"$group": {"_id": "$human_decision", "count": {"$sum": 1}}}
    ]))
    
    recommendation_dist = list(db.cases.aggregate([
        {"$group": {"_id": "$recommendation.action", "count": {"$sum": 1}}}
    ]))
    
    avg_risk_score = list(db.cases.aggregate([
        {"$group": {"_id": None, "avg_score": {"$avg": "$fraud_score.risk_score"}}}
    ]))
    
    avg_score_val = avg_risk_score[0]["avg_score"] if avg_risk_score else 0.0
    
    # Fetch 5 most recent cases for activity log
    recent_cases_cursor = db.cases.find({}, {
        "case_id": 1,
        "transaction.type": 1,
        "fraud_score.risk_score": 1,
        "fraud_score.risk_level": 1,
        "fraud_score.signals_fired": 1,
        "human_decision": 1,
        "recommendation.action": 1,
        "created_at": 1
    }).sort("created_at", -1).limit(5)
    
    recent_activity = []
    for c in recent_cases_cursor:
        c["_id"] = str(c["_id"])
        recent_activity.append(c)

    risk_trend_cursor = db.cases.aggregate([
        {
            "$project": {
                "date": {"$substr": ["$created_at", 0, 10]},
                "risk_level": "$fraud_score.risk_level"
            }
        },
        {
            "$group": {
                "_id": {
                    "date": "$date",
                    "level": "$risk_level"
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id.date": 1}}
    ])
    
    trend_dict = {}
    for item in risk_trend_cursor:
        date_str = item["_id"].get("date")
        if not date_str: continue
        level = item["_id"].get("level") or "MEDIUM"
        if date_str not in trend_dict:
            trend_dict[date_str] = {"high": 0, "medium": 0, "low": 0}
        
        l_lower = level.lower()
        if l_lower in trend_dict[date_str]:
            trend_dict[date_str][l_lower] += item["count"]

    sorted_dates = sorted(list(trend_dict.keys()))[-7:]
    
    risk_trend = []
    for d in sorted_dates:
        try:
            dt = datetime.strptime(d, "%Y-%m-%d")
            formatted_day = dt.strftime("%b %d")
        except:
            formatted_day = d
        risk_trend.append({
            "day": formatted_day,
            "high": trend_dict[d]["high"],
            "medium": trend_dict[d]["medium"],
            "low": trend_dict[d]["low"]
        })

    kpi_cursor = db.cases.aggregate([
        {
            "$project": {
                "date": {"$substr": ["$created_at", 0, 10]},
                "risk_score": "$fraud_score.risk_score",
                "is_pending": {"$cond": [{"$or": [{"$eq": ["$human_decision", None]}, {"$eq": ["$human_decision", "Pending"]}]}, 1, 0]},
                "is_escalated": {"$cond": [{"$eq": ["$human_decision", "ESCALATE"]}, 1, 0]}
            }
        },
        {
            "$group": {
                "_id": "$date",
                "total": {"$sum": 1},
                "avg_risk": {"$avg": "$risk_score"},
                "pending": {"$sum": "$is_pending"},
                "escalated": {"$sum": "$is_escalated"}
            }
        },
        {"$sort": {"_id": 1}}
    ])
    
    kpi_history = list(kpi_cursor)[-10:]
    kpi_trends = {
        "total_cases": [k.get("total", 0) for k in kpi_history],
        "avg_risk": [k.get("avg_risk", 0) for k in kpi_history],
        "pending": [k.get("pending", 0) for k in kpi_history],
        "escalated": [k.get("escalated", 0) for k in kpi_history]
    }

    return {
        "total_cases": total_cases,
        "risk_distribution": {item["_id"] or "Unknown": item["count"] for item in risk_dist},
        "decision_distribution": {item["_id"] or "Pending": item["count"] for item in decision_dist},
        "recommendation_distribution": {item["_id"] or "Unknown": item["count"] for item in recommendation_dist},
        "avg_risk_score": avg_score_val,
        "recent_activity": recent_activity,
        "risk_trend": risk_trend,
        "kpi_trends": kpi_trends
    }
@router.get('/audit/transactions')
def get_audit_transactions(limit: int = 100):
    import random
    db = get_mongo_db()
    cursor = db.mobile_transactions.find({}, {'_id': 0}).sort('timestamp', -1).limit(limit)
    
    txns = []
    for txn in cursor:
        # If missing, add mock data in a "good way"
        if "account_balance_ratio" not in txn:
            txn["account_balance_ratio"] = round(random.uniform(0.1, 0.9), 2)
        if "90_days_average_transaction" not in txn:
            txn["90_days_average_transaction"] = round(random.uniform(500, 5000), 2)
        if "customer_risk_tier" not in txn:
            txn["customer_risk_tier"] = random.choice(["LOW", "MEDIUM", "HIGH"])
        if "amount_vs_90d_avg" not in txn:
            txn["amount_vs_90d_avg"] = round(random.uniform(0.5, 5.0), 2)
        if "contextual_new_device" not in txn:
            txn["contextual_new_device"] = random.choice([True, False])
        if "contextual_odd_hour" not in txn:
            txn["contextual_odd_hour"] = random.choice([True, False])
        
        # Ensure timestamp is string if it's a datetime object
        if isinstance(txn.get("timestamp"), datetime):
            txn["timestamp"] = txn["timestamp"].isoformat()
            
        txns.append(txn)
        
    return txns

from pydantic import BaseModel
class DashboardUser(BaseModel):
    username: str
    password: str
    age: int
    role: str
    email: str

@router.post('/dashboard_users/register')
def register_dashboard_user(user: DashboardUser):
    db = get_mongo_db()
    if db.dashboard_users.find_one({'username': user.username}):
        return {'error': 'User already exists'}
    db.dashboard_users.insert_one(user.dict())
    return {'status': 'success', 'user': user.username}

@router.post('/dashboard_users/login')
def login_dashboard_user(user: dict):
    db = get_mongo_db()
    found = db.dashboard_users.find_one({'username': user.get('username'), 'password': user.get('password')}, {'_id': 0})
    if found:
        return {'status': 'success', 'user': found}
    return {'error': 'Invalid credentials'}

@router.get('/dashboard_users')
def get_dashboard_users():
    db = get_mongo_db()
    return list(db.dashboard_users.find({}, {'_id': 0, 'password': 0}))






