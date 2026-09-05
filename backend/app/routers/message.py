from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.models import MessageAnalysis
from app.agents import message_analyzer

router = APIRouter(tags=["message"])

class MessageRequest(BaseModel):
    messages: List[str]

@router.post("/messages", response_model=MessageAnalysis)
async def analyze_messages(req: MessageRequest):
    try:
        return await message_analyzer.analyze_messages(req.messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
