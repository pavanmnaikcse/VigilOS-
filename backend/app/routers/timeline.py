from fastapi import APIRouter, HTTPException
from typing import Any, Dict, List
from app.models import TimelineEvent
from app.agents import timeline

router = APIRouter(tags=["timeline"])

@router.post("/timeline", response_model=List[TimelineEvent])
async def build_timeline(agent_outputs: Dict[str, Any]):
    try:
        return await timeline.build_timeline(agent_outputs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
