import re
from typing import List

def analyze_messages(messages: List[str]) -> dict:
    patterns = {
        "urgency": {
            "regex": r"\b(urgent|immediately|asap|hurry)\b",
            "severity": "MEDIUM"
        },
        "financial_pressure": {
            "regex": r"\b(wire transfer|account details|routing number|bank details)\b",
            "severity": "HIGH"
        },
        "social_engineering": {
            "regex": r"\b(verify your|confirm your|click here|act now)\b",
            "severity": "HIGH"
        }
    }
    
    flags = []
    risk_indicators = set()
    highest_severity = None
    severity_rank = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    
    for msg in messages:
        msg_lower = msg.lower()
        for pattern_name, pattern_info in patterns.items():
            if re.search(pattern_info["regex"], msg_lower):
                flags.append({
                    "text": msg,
                    "pattern": pattern_name,
                    "severity": pattern_info["severity"],
                    "note": "prototype-level detection"
                })
                risk_indicators.add(pattern_name)
                
                if highest_severity is None or severity_rank[pattern_info["severity"]] > severity_rank[highest_severity]:
                    highest_severity = pattern_info["severity"]
                    
    return {
        "flags": flags,
        "risk_indicators": list(risk_indicators),
        "pattern_type": highest_severity
    }


