import os
import requests
import jwt
from datetime import datetime, timedelta, timezone

url = "https://vigilos-x404iyh2.livekit.cloud"
api_key = "APIS6AreGGJg8RV"

secrets = [
    "xe99XuhLjqRA425ftcwHYMBSIEIbRvEect20ncLK2FqA",
    "xe99XuhLjqRA425ftcwHYMBSlElbRvEect20ncLK2FqA",
    "xe99XuhLjqRA425ftcwHYMBSIElbRvEect20ncLK2FqA",
    "xe99XuhLjqRA425ftcwHYMBSlEIbRvEect20ncLK2FqA",
    "xe99XuhLjqRA425ftcwHYMBSIElbRvEect20ncLK2FqA"
]

for secret in secrets:
    token = jwt.encode(
        {"iss": api_key, "sub": "test", "exp": datetime.now(timezone.utc) + timedelta(minutes=1), "video": {"roomList": True}},
        secret,
        algorithm="HS256"
    )
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    r = requests.post(f"{url}/twirp/livekit.RoomService/ListRooms", headers=headers, json={})
    if r.status_code == 200:
        print(f"SUCCESS: {secret}")
        break
    else:
        print(f"FAILED: {secret} - {r.status_code}")
