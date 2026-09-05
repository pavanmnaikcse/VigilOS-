from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import RingDetection, MoneyFlow
from app.agents import ring_detector

router = APIRouter(tags=["graph"])

class AccountRequest(BaseModel):
    account_id: str

@router.post("/graph", response_model=RingDetection)
async def detect_ring(req: AccountRequest):
    try:
        return await ring_detector.detect_ring(req.account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/money-trail", response_model=MoneyFlow)
async def trace_money_flow(req: AccountRequest):
    try:
        return await ring_detector.trace_money_flow(req.account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
