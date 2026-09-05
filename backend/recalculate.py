import asyncio
from app.database import get_mongo_db
from app.agents import fraud_scorer, recommender, explainer

async def recalculate(case_id):
    db = get_mongo_db()
    case = db.cases.find_one({"case_id": case_id})
    if not case:
        print("Case not found")
        return
        
    print(f"Recalculating {case_id} using Llama 3 for Scorer and Recommender...")
    txn = case.get("transaction", {})
    
    # 1. Llama 3 Scorer
    new_score_result = fraud_scorer.score(txn)
    print("New Score:", new_score_result)
    
    risk_score = new_score_result.get("risk_score", 0.0)
    
    # 2. Llama 3 Recommender
    ring_count = 0
    compliance_count = 0
    signals = new_score_result.get("signals_fired", {})
    
    new_rec_result = recommender.recommend(risk_score, ring_count, compliance_count, signals)
    print("New Rec:", new_rec_result)
    
    from app.agents import compliance
    print("Recalculating compliance matches...")
    new_compliance = compliance.match_compliance(txn, risk_score)
    print("New Compliance:", new_compliance)
    
    # 3. Explain
    case_context = {
        "transaction": txn,
        "fraud_score": new_score_result,
        "ring_detection": {},
        "money_flow": {},
        "compliance": new_compliance,
        "timeline": {},
        "message_analysis": {},
        "link_analysis": {},
    }
    new_explanation = explainer.explain(case_context)
    print("New Explanation:", str(new_explanation).encode('utf-8', 'replace'))
    
    db.cases.update_one(
        {"case_id": case_id},
        {"$set": {
            "fraud_score": new_score_result,
            "recommendation": new_rec_result,
            "explanation": new_explanation,
            "compliance": new_compliance
        }}
    )
    print("Successfully updated database!")

if __name__ == "__main__":
    asyncio.run(recalculate("CASE-8BDD5544"))
