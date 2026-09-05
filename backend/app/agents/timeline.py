from typing import List
from datetime import datetime, timezone

def build_timeline(fraud_score: dict, ring_detection: dict, money_flow: dict, compliance: dict, message_analysis: dict, link_analysis: dict) -> List[dict]:
    events = []
    now = datetime.now(timezone.utc).isoformat()
    
    if fraud_score and fraud_score.get("timestamp"):
        events.append({
            "timestamp": fraud_score["timestamp"],
            "event_type": "transaction",
            "title": "Fraud Score Evaluated",
            "description": f"Score: {fraud_score.get('score')}",
            "source_agent": "fraud_scorer"
        })
        
    if money_flow and money_flow.get("paths"):
        events.append({
            "timestamp": now,
            "event_type": "network",
            "title": "Money Flow Traced",
            "description": f"Total traced: {money_flow.get('total_traced')}",
            "source_agent": "ring_detector"
        })
        
    if compliance and compliance.get("matches"):
        events.append({
            "timestamp": now,
            "event_type": "compliance",
            "title": "Compliance Match Found",
            "description": f"{len(compliance['matches'])} matches found.",
            "source_agent": "compliance_matcher"
        })
        
    if message_analysis and message_analysis.get("flags"):
        events.append({
            "timestamp": now,
            "event_type": "message",
            "title": "Suspicious Messages Detected",
            "description": f"Found {len(message_analysis['flags'])} flags.",
            "source_agent": "message_analyzer"
        })
        
    if link_analysis and link_analysis.get("domain"):
        events.append({
            "timestamp": now,
            "event_type": "link",
            "title": "Link Analysis Performed",
            "description": f"Domain: {link_analysis['domain']}, Suspicious: {link_analysis.get('is_suspicious')}",
            "source_agent": "link_analyzer"
        })
        
    events.sort(key=lambda x: x.get("timestamp", ""))
    return events


