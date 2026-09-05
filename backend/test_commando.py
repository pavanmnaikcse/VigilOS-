import asyncio
from app.routers.commando import process_command

async def run():
    res = await process_command("open youtube, google, and the network graph", {})
    print(res)

asyncio.run(run())
