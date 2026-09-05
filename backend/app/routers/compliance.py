from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import Transaction, ComplianceMatch
from app.agents import compliance

router = APIRouter(tags=["compliance"])

class ComplianceRequest(BaseModel):
    transaction: Transaction
    risk_score: float

@router.post("/compliance", response_model=ComplianceMatch)
async def match_compliance(req: ComplianceRequest):
    try:
        return compliance.match_compliance(req.transaction.dict(), req.risk_score)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
