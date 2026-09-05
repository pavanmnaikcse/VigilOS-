import json
import random
from typing import Dict, Any
from langchain_ollama import ChatOllama
import os
from langchain_core.messages import SystemMessage, HumanMessage
import xgboost as xgb
import pandas as pd
from pathlib import Path

# Load XGBoost Model
model_path = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "model" / "fraud_scorer.json"
xgb_model = xgb.XGBClassifier()
xgb_model.load_model(str(model_path))

def score(transaction: Dict[str, Any]) -> Dict[str, Any]:
    amount = float(transaction.get("amount", 0.0))
    old_orig = float(transaction.get("oldbalanceOrg", transaction.get("original_balance", 10000.0)))
    new_orig = float(transaction.get("newbalanceOrig", transaction.get("updated_balance", old_orig - amount)))
    old_dest = float(transaction.get("oldbalanceDest", 0.0))
    
    # Map raw transaction to the 2M synthetic dataset features
    customer_risk_tier = 3 if old_orig < 5000.0 else (2 if old_orig < 20000.0 else 1)
    
    simulated_90d_avg = random.uniform(500, 3000)
    amount_vs_90d_avg = round((amount / simulated_90d_avg), 2) if simulated_90d_avg > 0 else 0.0
    account_balance_ratio = round((amount / old_orig), 2) if old_orig > 0 else 0.0
    
    new_device = 1 if amount > 60000 else 0
    odd_hour = 1 if amount > 80000 else 0
    new_payee = 1 if old_dest == 0.0 else 0
    
    velocity_1h = random.randint(1, 15) if amount > 50000 else random.randint(1, 3)
    velocity_spike = 1 if velocity_1h > 10 else 0
    
    account_drained = 1 if new_orig == 0.0 and amount > 0.0 else 0
    
    # Construct DataFrame for XGBoost
    df_features = pd.DataFrame([{
        'customer_risk_tier': customer_risk_tier,
        'original_balance': old_orig,
        'amount': amount,
        'updated_balance': new_orig,
        'amount_vs_90d_avg': amount_vs_90d_avg,
        'new_device': new_device,
        'odd_hour': odd_hour,
        'new_payee': new_payee,
        'velocity_1h': velocity_1h,
        'velocity_spike': velocity_spike,
        'account_drained': account_drained
    }])
    
    # Predict using the newly trained XGBoost model
    xgb_prob = float(xgb_model.predict_proba(df_features)[0, 1])
    xgb_risk_level = "HIGH" if xgb_prob > 0.7 else ("MEDIUM" if xgb_prob > 0.3 else "LOW")
    
    # Compile the layered signals for the LLM explainer
    signals_fired = {
        "account_balance_ratio": account_balance_ratio,
        "90_days_average_transaction": simulated_90d_avg,
        "customer_risk_tier": "HIGH" if customer_risk_tier == 3 else ("MEDIUM" if customer_risk_tier == 2 else "LOW"),
        "amount_vs_90d_avg": amount_vs_90d_avg,
        "contextual_new_device": bool(new_device),
        "contextual_odd_hour": bool(odd_hour),
        "contextual_new_payee": bool(new_payee),
        "velocity_txns_1h": velocity_1h,
        "velocity_spike_flag": bool(velocity_spike),
        "account_drained_flag": bool(account_drained),
        "xgboost_ensemble_probability": xgb_prob
    }

    prompt = f'''
You are the VigilOS Real-Time Fraud Risk Scorer, operating as a mesh on top of the Ollama AI engine.
Your task is to segregate and evaluate this transaction based on strict Reserve Bank of India (RBI) rules and regulations.

You must analyze the transaction specifically using the following key parameters:
1. account_balance_ratio
2. 90_days_average_transaction
3. customer_risk_tier
4. amount_vs_90d_avg
5. contextual_new_device
6. contextual_odd_hour
7. contextual_new_payee
8. velocity_txns_1h
9. velocity_spike_flag
10. account_drained_flag
11. xgboost_ensemble_probability

Transaction Data:
{json.dumps(transaction, indent=2)}

Extracted RBI & Behavioral Parameters:
{json.dumps(signals_fired, indent=2)}

Instructions:
1. Evaluate the transaction using the RBI parameters above.
2. Determine if it violates RBI anti-fraud regulations (e.g. account draining, velocity spikes, massive deviations from 90-day average).
3. The final risk_score MUST match the 'xgboost_ensemble_probability'.

You must return ONLY a valid JSON object with exactly these keys:
- "risk_score": The exact float value from the 'xgboost_ensemble_probability' signal.
- "risk_level": "LOW", "MEDIUM", or "HIGH" based on the XGBoost probability (>0.7 is HIGH, >0.3 is MEDIUM).
- "reasoning": A robust explanation (2-3 sentences) explicitly citing the RBI parameters listed above, how they segregate the transaction, and the final decision based on RBI guidelines.

Return valid JSON only. No markdown, no extra text.
'''

    llm = ChatOllama(model="llama3:latest", format="json", temperature=0.1)
    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        content = response.content
        if isinstance(content, str):
            result = json.loads(content)
        else:
            result = content
            
        prob = float(result.get("risk_score", xgb_prob))
        risk_level = result.get("risk_level", xgb_risk_level)
        reasoning = result.get("reasoning", "")
        
        return {
            'risk_score': prob,
            'risk_level': risk_level,
            'signals_fired': signals_fired,
            'confidence': 'high',
            'ood_features': [],
            'reasoning': reasoning,
            'model_version': 'ollama_mesh_rbi_xgboost_2M'
        }
    except Exception as e:
        print("Ollama Scorer error:", e)
        return {
            'risk_score': xgb_prob,
            'risk_level': xgb_risk_level,
            'signals_fired': signals_fired,
            'confidence': 'high',
            'ood_features': [],
            'reasoning': 'Error parsing LLM output. Fallback to XGBoost prediction.',
            'model_version': 'ollama_mesh_rbi_fallback'
        }
