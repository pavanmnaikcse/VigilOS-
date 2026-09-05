from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.models import Recommendation
from app.agents import recommender

router = APIRouter(tags=["recommender"])

class RecommendationRequest(BaseModel):
    risk_score: float
    ring_count: int
    compliance_matches: int
    signals: Dict[str, Any]

@router.post("/recommend", response_model=Recommendation)
async def recommend_action(req: RecommendationRequest):
    try:
        return await recommender.recommend(
            risk_score=req.risk_score,
            ring_count=req.ring_count,
            compliance_matches=req.compliance_matches,
            signals=req.signals
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
