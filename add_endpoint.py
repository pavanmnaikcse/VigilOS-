
with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\backend\app\routers\mobile.py", "r", encoding="utf-8") as f:
    content = f.read()

new_endpoint = """@router.get("/connections")
def get_active_connections():
    connections = []
    for account_id, ws in manager.active_connections.items():
        client = ws.client
        ip = client.host if client else "Unknown"
        connections.append({"account_id": account_id, "ip": ip})
    return {"status": "success", "connections": connections}

@router.post("/login")"""

content = content.replace("@router.post(\"/login\")", new_endpoint)

with open(r"C:\Users\pn466\OneDrive\Documents\VigilOS\backend\app\routers\mobile.py", "w", encoding="utf-8") as f:
    f.write(content)

