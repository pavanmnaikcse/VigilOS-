import json
import re
import uuid
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from app.config import get_settings
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from app.database import get_mongo_db
from app.orchestrator import investigate

router = APIRouter()

current_case_context = None

async def call_llm(prompt: str, max_tokens: int = 500) -> str:
    settings = get_settings()
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.1,
        max_tokens=max_tokens,
        api_key=settings.GEMINI_API_KEY
    )
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content.strip()

async def deep_rag_query(question: str, context_obj: dict = None) -> str:
    db = get_mongo_db()
    
    case_match = re.search(r'(VIG-[A-Z0-9]+|CASE-[A-Z0-9]+)', question.upper())
    case_id = case_match.group(1) if case_match else (context_obj.get("case_id") if context_obj else None)
    
    if case_id:
        case = db.cases.find_one({"case_id": case_id}, {"_id": 0})
        if case:
            cases = [case]
            txns = list(db.mobile_transactions.find({"transaction_id": {"$in": [t.get("txn_id") for t in case.get("money_flow", [])]}}, {"_id": 0}))
            if not txns:
                txns = list(db.mobile_transactions.find({}, {"_id": 0}).sort("timestamp", -1).limit(5))
        else:
            cases = []
            txns = []
    else:
        cases = list(db.cases.find({}, {"_id": 0}).sort("created_at", -1).limit(5))
        txns = list(db.mobile_transactions.find({}, {"_id": 0}).sort("timestamp", -1).limit(10))
    
    context = f"Relevant Cases: {json.dumps(cases, default=str)[:3000]}\nRelevant Transactions: {json.dumps(txns, default=str)[:3000]}"
    
    prompt = f"""You are Vigil OS Commando, an elite autonomous military-grade AI investigation system.
The user asked a deep analytical question.

Database Context:
{context}

User Question: "{question}"

Analyze the context and answer the user's question directly. Use military Commando phrasing (e.g. "Sir, analysis indicates..."). Keep it brief and concise, but answer the question deeply based on the data."""
    
    return await call_llm(prompt, 500)

async def process_command(text: str, context: dict) -> list:
    context_str = f"Current case context: {context['case_id']}" if context else "No active case context."
    prompt = f"""You are Vigil OS Commando, an autonomous military-grade AI investigation commander.
{context_str}

User command: "{text}"

CRITICAL INSTRUCTIONS:
1. Tolerate speech-to-text typos (e.g. "open paste" -> "open case", "anlyze" -> "analyze").
2. Extract ALL tasks the user wants you to do. You can execute multiple tasks simultaneously.
3. If the user asks to "open a case and analyze it", you MUST output BOTH a 'navigate' action AND a 'rag_query' action!
4. Output ONLY a valid JSON array of action objects. Do not output any markdown formatting, backticks, or other text.

Valid action objects:
1. {{"action": "navigate", "path": "..."}}
   Paths:
   - "/investigations" for general case list
   - "/case/latest" or "/case/<ID>" to open a specific case
   - "/case/latest#Network%20Graph" to open the Network Graph for the latest case
   - "/case/latest#Q&A" to open the Q&A tab
   - "/reports" for reports
2. {{"action": "open_tab", "url": "https://..."}}
   Use for external sites.
3. {{"action": "investigate_latest"}}
   Use if they explicitly ask to investigate a transaction or case.
4. {{"action": "rag_query", "question": "..."}}
   Use this if the user is asking a deep analytical question about data (e.g. "Analyze case ID 123", "explain the data", "why is this fraud").
5. {{"action": "speak", "text": "..."}} 
   Provide a confident, military-style "Commando" response acknowledging the commands.

Example output:
[
  {{"action": "speak", "text": "Yes sir, opening case 123 and analyzing the data."}},
  {{"action": "navigate", "path": "/case/CASE-123"}},
  {{"action": "rag_query", "question": "Analyze the data for case CASE-123 and explain it."}}
]
"""
    
    result = await call_llm(prompt, 500)
    
    if result.startswith("`json"): result = result[7:]
    elif result.startswith("`"): result = result[3:]
    if result.endswith("`"): result = result[:-3]
        
    try:
        actions = json.loads(result.strip())
        if not isinstance(actions, list):
            actions = [actions]
            
        for act in actions:
            if act.get("action") == "navigate" and "path" in act:
                path = act["path"]
                path = path.replace("/case/CASE ", "/case/CASE-")
                path = path.replace("/case/case ", "/case/CASE-")
                path = path.replace("/case/VIG ", "/case/VIG-")
                path = path.replace("/case/vig ", "/case/VIG-")
                
                if "#" in path:
                    base, hash_part = path.split("#", 1)
                    base = base.replace(" ", "")
                    path = base + "#" + hash_part
                else:
                    path = path.replace(" ", "")
                    
                act["path"] = path
                
        return actions
    except Exception as e:
        print(f"Error parsing command result: {e}")
        return [{{"action": "speak", "text": "Command misunderstood, sir."}}]

@router.websocket("/ws")
async def commando_ws(websocket: WebSocket):
    await websocket.accept()
    global current_case_context
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "set_context":
                path = data.get("path", "")
                if path.startswith("/case/"):
                    case_id = path.split("/")[-1]
                    current_case_context = {"case_id": case_id}
                else:
                    current_case_context = None
            elif data.get("type") == "command":
                command = data.get("text", "")
                actions = await process_command(command, current_case_context)
                
                for action in actions:
                    act_type = action.get("action")
                    if act_type == "investigate_latest":
                        await websocket.send_json({"type": "status", "message": "Risk Analysis"})
                        db = get_mongo_db()
                        txn = db.mobile_transactions.find_one({}, sort=[("timestamp", -1)])
                        if not txn:
                            txn = {"transaction_id": "TXN-AUTO", "amount": 50000.0, "sender_account_id": "ACC-UNK", "receiver_account_id": "ACC-MULE"}
                            
                        payload = {"txn_id": txn["transaction_id"], "amount": txn["amount"], "nameOrig": txn["sender_account_id"], "nameDest": txn["receiver_account_id"], "type": "TRANSFER"}
                        
                        try:
                            investigation_task = asyncio.create_task(investigate({"transaction": payload}))
                            result = await investigation_task
                            case_id = result.get("case_id", f"VIG-{uuid.uuid4().hex[:6].upper()}")
                            risk_score = result.get("fraud_score", {}).get("risk_score", 0.95)
                            risk_pct = round(risk_score * 100, 1)
                            
                            current_case_context = {"case_id": case_id, "risk": risk_pct, "reasons": "High risk"}
                            await websocket.send_json({"type": "speech_text", "text": f"Investigation complete, sir. Case {case_id} is high risk with {risk_pct} percent score."})
                        except Exception as e:
                            await websocket.send_json({"type": "speech_text", "text": "Investigation failed, sir."})
                            
                    elif act_type == "navigate":
                        await websocket.send_json({"type": "action", "action": "navigate", "path": action.get("path")})
                        
                    elif act_type == "open_tab":
                        await websocket.send_json({"type": "action", "action": "open_tab", "url": action.get("url")})
                        
                    elif act_type == "rag_query":
                        await websocket.send_json({"type": "status", "message": "Accessing Database"})
                        answer = await deep_rag_query(action.get("question"), current_case_context)
                        await websocket.send_json({"type": "speech_text", "text": answer})
                        
                    elif act_type == "speak":
                        await websocket.send_json({"type": "speech_text", "text": action.get("text")})
                        
    except WebSocketDisconnect:
        pass
