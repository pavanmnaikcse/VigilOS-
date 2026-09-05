from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import LinkAnalysis
from app.agents import link_analyzer

router = APIRouter(tags=["link"])

class LinkRequest(BaseModel):
    url: str

@router.post("/links", response_model=LinkAnalysis)
async def analyze_link(req: LinkRequest):
    try:
        return await link_analyzer.analyze_link(req.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
