from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

ELEVENLABS_API_KEY = "sk_180a6b268c2e2112be1d40e93090c160b35c9a6539cff9e9"
ELEVENLABS_VOICE_ID = "cCYjmrGZaI86GUJ7F2Nn"

class TTSRequest(BaseModel):
    text: str

@router.post("/generate")
async def generate_tts(req: TTSRequest):
    if not req.text or len(req.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text is required")
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "text": req.text,
        "model_id": "eleven_flash_v2_5",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=data, headers=headers, timeout=30.0)
            if resp.status_code == 200:
                return Response(content=resp.content, media_type="audio/mpeg")
            else:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

