from fastapi import APIRouter, HTTPException
from typing import Any, Dict
from app.models import Explanation
from app.agents import explainer

router = APIRouter(tags=["explainer"])

@router.post("/explain", response_model=Explanation)
async def explain_case(case_data: Dict[str, Any]):
    try:
        return await explainer.explain(case_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
