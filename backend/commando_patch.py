import os
from fastapi import APIRouter
from pydantic import BaseModel
from livekit import api

@router.get("/livekit-token")
async def get_livekit_token(participant_name: str = "VigilOS_User"):
    livekit_api_key = os.environ.get("LIVEKIT_API_KEY")
    livekit_api_secret = os.environ.get("LIVEKIT_API_SECRET")
    if not livekit_api_key or not livekit_api_secret:
        return {"error": "LiveKit credentials not configured"}
        
    token = api.AccessToken(livekit_api_key, livekit_api_secret)
    token = token.with_identity(participant_name).with_name(participant_name).with_grants(
        api.VideoGrants(
            room_join=True,
            room="vigilos-commando",
        )
    )
    return {"token": token.to_jwt()}
