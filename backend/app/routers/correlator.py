from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import CorrelationResult
from app.agents import correlator

router = APIRouter(tags=["correlator"])

class CorrelatorRequest(BaseModel):
    account_id: str
    case_id: str

@router.post("/correlate", response_model=CorrelationResult)
async def find_correlations(req: CorrelatorRequest):
    try:
        return await correlator.find_correlations(req.account_id, req.case_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
