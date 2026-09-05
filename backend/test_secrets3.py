import os
import requests
import jwt
import time
import itertools

url = "https://vigilos-x404iyh2.livekit.cloud"
api_key = "APIS6AreGGJg8RV"

base_secret = "xe99XuhLjqRA425ftcwHYMBSIEIbRvEect20ncLK2FqA"

# We will generate permutations for the following indices:
# 'q' at 10 (could be g)
# 'I' at 23, 25 (could be l)
# '0' at 34 (could be O)

chars = {
    10: ['q', 'g'],
    23: ['I', 'l', '1'],
    25: ['I', 'l', '1'],
    34: ['0', 'O', 'o']
}

keys = list(chars.keys())
lists = [chars[k] for k in keys]

for p in itertools.product(*lists):
    s = list(base_secret)
    for i, k in enumerate(keys):
        s[k] = p[i]
    secret = "".join(s)
    
    token = jwt.encode(
        {"iss": api_key, "sub": "test", "exp": int(time.time()) + 3600, "video": {"roomList": True}},
        secret,
        algorithm="HS256"
    )
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    r = requests.post(f"{url}/twirp/livekit.RoomService/ListRooms", headers=headers, json={})
    if r.status_code == 200:
        print(f"SUCCESS: {secret}")
        break
    else:
        # print(f"FAILED: {secret} - {r.status_code}")
        pass
print("Done testing.")
