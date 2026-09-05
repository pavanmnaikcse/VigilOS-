from app.config import get_settings
from langchain_groq import ChatGroq
import os
from langchain_core.messages import SystemMessage, HumanMessage
import json

def explain(case_data: dict) -> dict:
    llm = ChatGroq(model="openai/gpt-oss-120b", model_kwargs={"response_format": {"type": "json_object"}}, temperature=0.1, api_key=os.getenv("GROQ_API_KEY"))
    
    rbi_guidelines = """
# RBI Fraud Detection Logic
EWS: High-value transfers, circular fund movement, heavy cash withdrawals.
Classify as: Misappropriation, Fraudulent encashment, Digital payment frauds.
Timelines: RFA tagging (30 days), SCN (21 days).
"""
    system_prompt = f"""You are a senior RBI compliance and fraud analyst. Write a 2-paragraph executive summary explaining the fraud risk.
Use RBI rules: {rbi_guidelines}
In 'risk_narrative', quote the RBI EWS, Legal Classification, and Timeline Actions.
You must return your response strictly as a JSON object with exactly these keys: 'summary', 'key_findings' (list of strings), and 'risk_narrative'."""
    
    # Send only essential data to avoid hitting Groq's 8000 TPM limit
    clean_case = {
        "transaction": case_data.get("transaction", {}),
        "risk_score": case_data.get("risk_score", 0.0),
        "risk_level": case_data.get("risk_level", "")
    }
    human_prompt = f"Case Data: {json.dumps(clean_case)}"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ]
    
    try:
        response = llm.invoke(messages)
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        result = json.loads(content)
        return {
            "summary": result.get("summary", ""),
            "key_findings": result.get("key_findings", []),
            "risk_narrative": result.get("risk_narrative", "")
        }
    except Exception as e:
        return {
            "summary": "Failed to generate explanation.",
            "key_findings": [f"Error: {str(e)}"],
            "risk_narrative": response.content if 'response' in locals() else ""
        }









