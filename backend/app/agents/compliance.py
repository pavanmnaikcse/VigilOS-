import json
from langchain_groq import ChatGroq
import os
from langchain_core.messages import HumanMessage

RBI_GUIDELINES = """
RBI Fraud Detection Logic & Framework
1. Legal Classification & Definitions
- Misappropriation and criminal breach of trust: Intentional misdirection of allocated capital or assets.
- Fraudulent encashment: Via forged financial instruments, malicious book manipulation, or dummy accounts.
- Unauthorized credit facilities: Extension of credit or waivers for illegal personal gratification.
- Cash shortages: Deficits where malicious intent is established.
- Cheating and forgery: Fabrication or altering of original records.
- Irregularities in foreign exchange transactions: Cross-border transactions breaching FEMA.
- Digital payment frauds: Card, net banking, UPI, and digital wallet payment vulnerabilities exploited.
- Third-party breaches: Vendor, evaluator, or external intermediary data and asset compromises.

2. Red-Flag Statements & Early Warning Signals (EWS)
Operational Discrepancies:
- Frequent change in project scope, fake invoices, costing variance, inventory mismatch.
Transactional Flow Anomaly Signals:
- High-value RTGS/NEFT payments made rapidly to unrelated third-party entities.
- Substantial interactions, high transaction volume, or circular fund movement through interconnected or shell companies.
- Non-routing of sales proceeds.
- Frequent bouncing of high-value cheques.
- Heavy, continuous cash withdrawals.
"""

def match_compliance(transaction: dict, risk_score: float) -> dict:
    prompt = f"""
You are an expert RBI compliance AI.
Given the following transaction, determine which rules from the RBI framework are potentially violated.
Risk Score assigned by prior agent: {risk_score} (0.0 to 1.0)

Transaction Details:
{json.dumps(transaction, indent=2)}

RBI Guidelines:
{RBI_GUIDELINES}

You must identify 4 to 5 distinct rules from the guidelines that apply to this transaction context (e.g., related to anomalies, digital payments, third-party entities, misappropriation, etc.).
Return a JSON object with exactly one key "matches", which is a list of objects.
For each matched rule, provide:
- "regulation": A short title of the rule (e.g. "RBI EWS: High-value RTGS/NEFT")
- "section": The section it falls under (e.g. "Transactional Flow Anomaly Signals")
- "text": The exact text snippet of the rule from the PDF.
- "severity": "High", "Medium", or "Low"
- "relevance_score": A float between 0.0 and 1.0 representing how confident you are it matches (e.g. 0.85).
- "citation_summary": A 1-2 sentence explanation of why this rule applies to the transaction.

If no rules apply, return {{"matches": []}}.
Return ONLY valid JSON.
"""
    llm = ChatGroq(model="openai/gpt-oss-120b", model_kwargs={"response_format": {"type": "json_object"}}, temperature=0.1, api_key=os.getenv("GROQ_API_KEY"))
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content
        if isinstance(content, str):
            result = json.loads(content)
        else:
            result = content
            
        matches = result.get("matches", [])
        
        # Determine if low confidence based on the highest relevance score
        low_confidence = False
        if matches:
            best_score = max(float(m.get("relevance_score", 0.0)) for m in matches)
            if best_score < 0.6:
                low_confidence = True
        
        return {
            "matches": matches,
            "low_confidence": low_confidence
        }
    except Exception as e:
        print("Llama3 Compliance error:", e)
        return {
            "matches": [],
            "low_confidence": True
        }









