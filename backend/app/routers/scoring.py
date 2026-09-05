from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.agents import fraud_scorer
from app.models import Transaction, FraudScore

router = APIRouter(tags=['scoring'])

@router.post("/score", response_model=FraudScore)
async def score_transaction(transaction: Transaction):
    try:
        if hasattr(transaction, 'model_dump'):
            transaction_dict = transaction.model_dump()
        else:
            transaction_dict = transaction.dict()
            
        result = fraud_scorer.score(transaction_dict)
        return FraudScore(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
