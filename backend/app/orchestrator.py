import httpx
import uuid
import asyncio

import time
from datetime import datetime, timezone

def build_rationale(agent_num, output):
    if not isinstance(output, dict):
        if isinstance(output, list):
            return f"Returned array of {len(output)} items."
        return str(output)
    if agent_num == 1:
        s = f"Assigned Risk Score: {output.get('risk_score', 'Unknown')} ({output.get('risk_level', 'Unknown')}). "
        if output.get('reasoning'):
            s += output.get('reasoning')
        else:
            sigs = output.get('signals_fired', {})
            if sigs:
                s += "Signals: " + ", ".join([f"{k}={v}" for k,v in sigs.items()])
        return s
    if agent_num == 2:
        return f"Analyzed messages. Spam prob: {output.get('spam_probability', 0)}."
    if agent_num == 3:
        return f"Analyzed links."
    if agent_num == 4:
        return f"Rings found: {output.get('rings_found', False)}. Ring count: {output.get('ring_count', 0)}."
    if agent_num == 5:
        return f"Traced {output.get('trace_percentage', 0)}% of funds (${output.get('total_traced', 0)})."
    if agent_num == 6:
        matches = len(output.get('matches', []))
        return f"Found {matches} compliance matches."
    if agent_num == 7:
        return f"Reconstructed timeline events."
    if agent_num == 8:
        return "Executive summary and risk narrative generated."
    if agent_num == 9:
        return f"Recommended action: {output.get('action', 'Unknown')} (confidence: {output.get('confidence', 0)})."
    return "Execution complete."

async def record_agent_execution(case_id, agent_num, agent_name, fed_into, input_summary, func, *args):
    from app.database import get_mongo_db
    start_time = time.time()
    started_at = datetime.now(timezone.utc).isoformat()
    db = get_mongo_db()
    
    try:
        import asyncio
        output = await asyncio.to_thread(func, *args)
        status = "completed"
    except Exception as e:
        output = {"error": str(e)}
        status = "failed"
        
    finished_at = datetime.now(timezone.utc).isoformat()
    duration_ms = int((time.time() - start_time) * 1000)
    
    rationale = build_rationale(agent_num, output)
    
    trace_entry = {
        "agent_name": agent_name,
        "agent_number": agent_num,
        "started_at": started_at,
        "finished_at": finished_at,
        "duration_ms": duration_ms,
        "status": status,
        "input_summary": input_summary,
        "output": output,
        "decision_rationale": rationale,
        "fed_into": fed_into
    }
    
    db.cases.update_one(
        {"case_id": case_id},
        {"$push": {"agent_trace": trace_entry}}
    )
    
    if status == "failed":
        raise Exception(f"Agent {agent_num} failed: {output['error']}")
        
    return output

async def record_skipped_agent(case_id, agent_num, agent_name, reason):
    from app.database import get_mongo_db
    db = get_mongo_db()
    trace_entry = {
        "agent_name": agent_name,
        "agent_number": agent_num,
        "status": "skipped",
        "input_summary": reason,
        "output": None,
        "decision_rationale": reason,
        "fed_into": []
    }
    db.cases.update_one({"case_id": case_id}, {"$push": {"agent_trace": trace_entry}})
    return None

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.database import get_mongo_db
from app.agents import (
    fraud_scorer, ring_detector, compliance, timeline, explainer,
    recommender, message_analyzer, link_analyzer, correlator
)

active_investigations = {}

class InvestigationProgress:
    def __init__(self, inv_id: str):
        self.inv_id = inv_id
        self.status = "running"
        self.steps = []
        self.start_time = datetime.now()
        self.time_taken = 0.0
        self.case_file = None
        self.event = asyncio.Event()

    def add_step(self, name: str, details: dict = None):
        self.steps.append({"name": name, "status": "completed", "details": details})
        old_event = self.event
        self.event = asyncio.Event()
        old_event.set()

    def complete(self, case_file: dict):
        self.status = "completed"
        self.case_file = case_file
        self.time_taken = (datetime.now() - self.start_time).total_seconds()
        old_event = self.event
        self.event = asyncio.Event()
        old_event.set()


def start_investigation(request: Dict[str, Any]) -> str:
    inv_id = f"INV-{uuid.uuid4().hex[:8].upper()}"
    prog = InvestigationProgress(inv_id)
    active_investigations[inv_id] = prog
    asyncio.create_task(run_investigation_pipeline(request, prog))
    return inv_id




def send_alert_email(case_file: dict):
    from app.config import get_settings
    settings = get_settings()
    if not settings.RESEND_API_KEY:
        print("No RESEND_API_KEY found, skipping real email send.")
        return "Not sent (Missing API Key)"
        
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    case_id = case_file.get("case_id", "Unknown")
    txn = case_file.get("transaction", {})
    txn_id = txn.get("txn_id") or txn.get("transaction_id", "Unknown")
    amount = float(txn.get("amount", 0))
    txn_type = txn.get("type", "TRANSFER")
    timestamp = case_file.get("created_at", "Unknown")
    
    fraud = case_file.get("fraud_score", {})
    risk_score = fraud.get("risk_score", 0.0)
    risk_level = fraud.get("risk_level", "LOW")
    risk_reasoning = fraud.get("reasoning", "No specific reasoning provided.")
    
    ring = case_file.get("ring_detection", {})
    ring_count = ring.get("ring_count", 0)
    ring_text = f"Found {ring_count} rings involving {len(ring.get('accounts_involved', []))} accounts." if ring_count > 0 else "No obvious fan-in or fan-out money mule patterns detected in immediate neighborhood."
    
    flow = case_file.get("money_flow", {})
    flow_text = f"Traced ${flow.get('total_traced', 0)} ({flow.get('trace_percentage', 0)}%) of funds."
    
    comp = case_file.get("compliance", {})
    matches = comp.get("matches", [])
    if matches:
        comp_text = "".join([f"<li>{m.get('regulation')}: {m.get('text')}</li>" for m in matches])
    else:
        comp_text = "<li>No specific RBI violations detected.</li>"
        
    expl = case_file.get("explanation", {})
    summary = expl.get("summary", "No summary.")
    
    html_content = f"""
    <div style="font-family: sans-serif; color: #333;">
        <h1>High-Risk Transaction Alert</h1>
        <p><strong>Case ID:</strong> {case_id}</p>
        <p><strong>Transaction ID:</strong> {txn_id}</p>
        
        <h2>Transaction Details</h2>
        <p><strong>Amount:</strong> ${amount:,.2f}</p>
        <p><strong>Type:</strong> {txn_type}</p>
        <p><strong>Risk Score:</strong> {risk_score} (Level: {risk_level})</p>
        <p><strong>Timestamp:</strong> {timestamp}</p>
        
        <h2>Network Topology</h2>
        <p><strong>Connected Accounts:</strong> {len(ring.get('accounts_involved', []))}</p>
        <p><strong>Related Transactions (2-hop):</strong> {len(case_file.get('hops', []))}</p>
        
        <h2>Primary Risk Reasons</h2>
        <p><strong>Executive Summary:</strong> {summary}</p>
        
        <h2>Agent Findings Breakdown</h2>
        <ul>
            <li><strong>Risk Analyst (Risk Analysis):</strong> {risk_reasoning}</li>
            <li><strong>Behaviour Investigator:</strong> {ring_text}</li>
            <li><strong>Network Investigator:</strong> {flow_text}</li>
            <li><strong>Timeline Investigator:</strong> Found related transactions across {len(case_file.get('timeline', []))} timeline events.</li>
            <li><strong>RBI Compliance Agent:</strong>
                <ul>
                    {comp_text}
                </ul>
            </li>
        </ul>
    </div>
    """
    
    from app.report import generate_report
    import base64
    
    try:
        pdf_bytes = generate_report(case_file)
        pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
        attachments = [{"filename": f"VigilOS_Report_{case_id}.pdf", "content": pdf_b64}]
    except Exception as e:
        print(f"Failed to generate PDF: {e}")
        attachments = []
        
    payload = {
        "from": "VigilOS Alerts <onboarding@resend.dev>",
        "to": [settings.COMPLIANCE_OFFICER_EMAIL],
        "subject": f"High Risk Transaction Alert - {case_id}",
        "html": html_content,
        "attachments": attachments
    }
    
    import httpx
    try:
        response = httpx.post(url, headers=headers, json=payload, timeout=10.0)
        response.raise_for_status()
        return "Sent successfully via Resend"
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")
        return f"Failed: {e}"


import pandas as pd
_df = None
def get_hops_from_csv(name_orig, max_depth=5):
    global _df
    if _df is None:
        try:
            _df = pd.read_csv("C:/Users/pn466/OneDrive/Documents/VigilOS/data/paysim/massive_mule_dataset.csv")
        except Exception as e:
            print("Failed to load massive dataset:", e)
            return [], []
            
    hops = []
    accounts_involved = [name_orig]
    current = name_orig
    for _ in range(max_depth):
        matches = _df[_df['nameOrig'] == current]
        if matches.empty:
            break
        nxt = matches.iloc[0].to_dict()
        hops.append(nxt)
        current = nxt['nameDest']
        if current not in accounts_involved:
            accounts_involved.append(current)
        else:
            break
    return hops, accounts_involved

async def run_investigation_pipeline(request: Dict[str, Any], prog: InvestigationProgress):
    transaction = request.get("transaction", {})
    messages = request.get("messages", [])
    urls = request.get("urls", [])
    
    txn_id = transaction.get("txn_id")
    sender_account_id = transaction.get("nameOrig", "")
    receiver_account_id = transaction.get("nameDest", "")
    case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
    prog.add_step("Transaction Ingestion", details={"transaction": transaction})

    from app.database import get_tainted_case, append_hop_to_case, get_mongo_db
    db = get_mongo_db()
    tainted_case_id = get_tainted_case(sender_account_id)
    
    if tainted_case_id:
        case_id = tainted_case_id
        append_hop_to_case(tainted_case_id, transaction)
        existing_case = db.cases.find_one({"case_id": tainted_case_id})
        if existing_case and "agent_trace" not in existing_case:
            db.cases.update_one({"case_id": case_id}, {"$set": {"agent_trace": []}})
    else:
        # Create skeleton case early
        initial_case = {
            "case_id": case_id,
            "transaction": transaction,
            "status": "running",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "agent_trace": []
        }
        db.cases.insert_one(initial_case)


    # SYNC TO NEO4J IMMEDIATELY SO RING DETECTOR SEES THE LIVE DATA
    from app.database import get_neo4j_driver
    try:
        driver = get_neo4j_driver()
        with driver.session() as session:
            session.run("""
                MERGE (a:Account {id: $orig})
                MERGE (b:Account {id: $dest})
                MERGE (a)-[r:TRANSFER {txn_id: $txn_id, amount: $amount, timestamp: $time, case_id: $case_id}]->(b)
            """, orig=sender_account_id, dest=receiver_account_id, 
                 txn_id=txn_id or "unknown", amount=transaction.get("amount", 0), 
                 time=transaction.get("timestamp", 0), case_id=case_id)
        prog.add_step("Neo4j Network Build", details={"nodes_added": 2, "edges_added": 1})
    except Exception as e:
        print(f"Failed to sync to Neo4j early: {e}")

    batch1_tasks = [record_agent_execution(case_id, 1, "Agent 1 - Fraud Scorer", ["Agent 4 - Ring Detector", "Agent 5 - Money Flow", "Agent 6 - Compliance Analysis"], f"Transaction: ${transaction.get('amount')} from {transaction.get('nameOrig')} to {transaction.get('nameDest')}", fraud_scorer.score, transaction)]
    if messages:
        batch1_tasks.append(record_agent_execution(case_id, 2, "Agent 2 - Message Analyzer", ["Agent 7 - Timeline Reconstruction"], f"Analyzed {len(messages)} messages.", message_analyzer.analyze_messages, messages))
    else:
        batch1_tasks.append(record_skipped_agent(case_id, 2, "Agent 2 - Message Analyzer", "No messages provided in transaction payload."))
    if urls:
        batch1_tasks.append(record_agent_execution(case_id, 3, "Agent 3 - Link Analyzer", ["Agent 7 - Timeline Reconstruction"], f"Analyzed {len(urls)} URLs.", lambda: link_analyzer.analyze_link(urls[0]) if len(urls) == 1 else {"results": [link_analyzer.analyze_link(u) for u in urls]}))
    else:
        batch1_tasks.append(record_skipped_agent(case_id, 3, "Agent 3 - Link Analyzer", "No URLs provided in transaction payload."))

    results_batch1 = await asyncio.gather(*batch1_tasks, return_exceptions=True)
    score_result = results_batch1[0] if not isinstance(results_batch1[0], Exception) else {"risk_score": 0, "risk_level": "LOW", "signals_fired": {}}
    message_result = results_batch1[1] if not isinstance(results_batch1[1], Exception) else None
    link_result = results_batch1[2] if not isinstance(results_batch1[2], Exception) else None

    prog.add_step("Risk Analysis", details={"score": score_result})

    account_id = sender_account_id
    risk_score = score_result.get("risk_score", 0) if isinstance(score_result, dict) else 0

    try:
        ring_result = await record_agent_execution(case_id, 4, "Agent 4 - Ring Detector", ["Agent 7 - Timeline Reconstruction", "Agent 9 - Recommender"], f"Detecting rings for account {account_id}", ring_detector.detect_ring, account_id)
        money_flow_result = await record_agent_execution(case_id, 5, "Agent 5 - Money Flow Analyzer", ["Agent 7 - Timeline Reconstruction", "Agent 9 - Recommender"], f"Tracing money flow for account {account_id}", ring_detector.trace_money_flow, account_id)
    except Exception:
        ring_result = {}
        money_flow_result = {}

    if score_result.get("risk_level") == "HIGH":
        actual_hops, involved = get_hops_from_csv(transaction.get("nameOrig"))
        if not actual_hops:
            hops = [transaction]
        else:
            hops = actual_hops
            
        ring_result = {
            "rings_found": len(hops) > 1,
            "ring_count": 1 if len(hops) > 1 else 0,
            "max_ring_size": len(involved),
            "accounts_involved": involved
        }
        
        # Calculate money flow metrics
        initial_amt = hops[0].get("amount", 0)
        final_amt = hops[-1].get("amount", 0)
        traced_pct = (final_amt / initial_amt * 100) if initial_amt else 0
        
        money_flow_result = {
            "total_traced": final_amt,
            "trace_percentage": round(traced_pct, 2),
            "time_to_cashout": f"{len(hops) * 1.5} hrs"
        }
    else:
        hops = [transaction]
        ring_result = {"rings_found": False, "ring_count": 0, "max_ring_size": 0, "accounts_involved": []}
        money_flow_result = {"total_traced": transaction.get("amount", 0), "trace_percentage": 100.0, "time_to_cashout": "0 hrs"}
        
    prog.add_step("Behavior Analysis", details={"ring_detection": ring_result})
    prog.add_step("Network Analysis", details={"money_flow": money_flow_result})

    try:
        compliance_result = await record_agent_execution(case_id, 6, 'Agent 6 - Compliance Analysis', ['Agent 7 - Timeline Reconstruction', 'Agent 8 - Explainer', 'Agent 9 - Recommender'], f'Matching compliance for Risk Score {risk_score}', compliance.match_compliance, transaction, risk_score)
    except Exception:
        compliance_result = {}

    prog.add_step("Compliance Analysis", details={"compliance": compliance_result})

    try:
        timeline_result = await record_agent_execution(case_id, 7, 'Agent 7 - Timeline Reconstruction', ['Agent 8 - Explainer'], 'Synthesizing timeline from previous agent outputs', timeline.build_timeline, score_result, ring_result, money_flow_result, compliance_result, message_result, link_result)
    except Exception:
        timeline_result = []

    prog.add_step("Timeline Reconstruction", details={"timeline": timeline_result})

    case_context = {
        "transaction": transaction, "fraud_score": score_result, "ring_detection": ring_result,
        "money_flow": money_flow_result, "compliance": compliance_result, "timeline": timeline_result,
        "message_analysis": message_result, "link_analysis": link_result,
    }
    try:
        explanation_result = await record_agent_execution(case_id, 8, 'Agent 8 - Explainer', [], 'Generating executive summary of the case context', explainer.explain, case_context)
    except Exception:
        explanation_result = {}

    ring_count = ring_result.get("ring_count", 0) if isinstance(ring_result, dict) else 0
    comp_count = len(compliance_result.get("matches", [])) if isinstance(compliance_result, dict) else 0
    signals = score_result.get("signals_fired", {}) if isinstance(score_result, dict) else {}
    try:
        recommendation_result = await record_agent_execution(case_id, 9, 'Agent 9 - Recommender', [], 'Generating final recommendation (BLOCK/MONITOR/ESCALATE)', recommender.recommend, risk_score, ring_count, comp_count, signals)
    except Exception:
        recommendation_result = {}

    try:
        correlation_result = await asyncio.to_thread(correlator.find_correlations, account_id, case_id)
    except Exception:
        correlation_result = {}

    case_file = {
        "case_id": case_id,
        "transaction": transaction,
        "hops": hops,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "fraud_score": score_result,
        "ring_detection": ring_result,
        "money_flow": money_flow_result,
        "compliance": compliance_result,
        "timeline": timeline_result,
        "explanation": explanation_result,
        "recommendation": recommendation_result,
        "message_analysis": message_result,
        "link_analysis": link_result,
        "correlation": correlation_result,
        "human_decision": None
    }
    
    from app.database import is_txn_processed, mark_txn_processed, taint_account, get_neo4j_driver, get_mongo_db
               
    db = get_mongo_db()
    
    
    # Update the case_file with the final fields, and update MongoDB document
    case_file.pop("_id", None)
    db.cases.update_one({"case_id": case_id}, {"$set": {
        "transaction": transaction,
        "hops": hops,
        "status": "pending",
        "fraud_score": score_result,
        "ring_detection": ring_result,
        "money_flow": money_flow_result,
        "compliance": compliance_result,
        "timeline": timeline_result,
        "explanation": explanation_result,
        "recommendation": recommendation_result,
        "message_analysis": message_result,
        "link_analysis": link_result,
        "correlation": correlation_result,
        "human_decision": None
    }})
    
    if tainted_case_id:
        amt = transaction.get("amount", 0)
        msg = f"\n\nUPDATE: A subsequent transaction of ${amt} to {receiver_account_id} was attempted from this tainted account. It has been linked to this existing case (Case: {tainted_case_id}) instead of creating a new one."
        
        existing_case = db.cases.find_one({"case_id": tainted_case_id})
        if existing_case:
            if "explanation" not in existing_case:
                existing_case["explanation"] = {"summary": ""}
            elif "summary" not in existing_case["explanation"]:
                existing_case["explanation"]["summary"] = ""
            existing_case["explanation"]["summary"] += msg
            
            db.cases.update_one({"case_id": tainted_case_id}, {"$set": {"explanation": existing_case["explanation"]}})
            if "_id" in existing_case:
                del existing_case["_id"]
            case_file = existing_case
            
        prog.add_step("Tainted Account Detected", details={"linked_to_case": tainted_case_id})
    else:
        prog.add_step("Case Creation", details={"case_id": case_id, "explanation": explanation_result, "recommendation": recommendation_result})
        
    if score_result.get("risk_level") == "HIGH":
        taint_account(sender_account_id, case_id)
        taint_account(receiver_account_id, case_id)
    if txn_id:
        mark_txn_processed(txn_id)

    email_status = await asyncio.to_thread(send_alert_email, case_file)
    from app.config import get_settings
    prog.add_step("Email Notification", details={"sent_to": get_settings().COMPLIANCE_OFFICER_EMAIL, "status": email_status})

    prog.complete(case_file)


async def investigate(request: Dict[str, Any]) -> Dict[str, Any]:
    inv_id = start_investigation(request)
    prog = active_investigations[inv_id]
    while prog.status != "completed":
        await prog.event.wait()
    return prog.case_file

def get_cases(skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
    db = get_mongo_db()
    cursor = db.cases.find({}, {"_id": 0, "agent_trace.output": 0}).sort("created_at", -1).skip(skip).limit(limit)
    return list(cursor)

def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    db = get_mongo_db()
    if case_id.lower() == "latest":
        return db.cases.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    return db.cases.find_one({"case_id": case_id}, {"_id": 0})

def decide_case(case_id: str, decision: str, notes: str, decided_by: str) -> Optional[Dict[str, Any]]:
    db = get_mongo_db()
    now = datetime.now(timezone.utc).isoformat()
    
    new_status = "escalated" if decision == "ESCALATE" else "decided"
    
    db.cases.update_one(
        {"case_id": case_id},
        {"$set": {
            "human_decision": decision,
            "decision_notes": notes,
            "decided_by": decided_by,
            "decided_at": now,
            "status": new_status,
        }}
    )
    
    # Sync the decision back to the underlying mobile transaction
    case = db.cases.find_one({"case_id": case_id})
    if case and "transaction" in case and "txn_id" in case["transaction"]:
        txn_id = case["transaction"]["txn_id"]
        if decision == "BLOCK":
            db.mobile_transactions.update_one({"transaction_id": txn_id}, {"$set": {"status": "BLOCKED"}})
        elif decision == "MONITOR" or decision == "ALLOW":
            db.mobile_transactions.update_one({"transaction_id": txn_id}, {"$set": {"status": "SUCCESS"}})
        elif decision == "ESCALATE":
            db.mobile_transactions.update_one({"transaction_id": txn_id}, {"$set": {"status": "HELD_FOR_REVIEW"}})
            
    return get_case(case_id)

def get_case_count() -> int:
    db = get_mongo_db()
    return db.cases.count_documents({})
