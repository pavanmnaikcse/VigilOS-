import asyncio
from app.orchestrator import run_investigation_pipeline, InvestigationProgress

async def test():
    try:
        prog = InvestigationProgress("TEST-PROG")
        await run_investigation_pipeline({"transaction": {"amount": 500, "nameOrig": "C123", "nameDest": "C456", "txn_id": "TEST1"}}, prog)
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
