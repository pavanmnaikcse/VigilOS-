import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import check_health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VigilOS — Fraud Investigation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("VigilOS server is starting...")

from app.routers.auth import router as auth_router
from app.routers.wallet import router as wallet_router
from app.routers.mobile import router as mobile_router
from app.routers.tts import router as tts_router
from app.routers.commando import router as commando_router

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(wallet_router, prefix="/api/wallet", tags=["wallet"])
app.include_router(mobile_router, prefix="/api/mobile", tags=["mobile"])
app.include_router(tts_router, prefix="/api/tts", tags=["tts"])
app.include_router(commando_router, prefix="/api/commando", tags=["commando"])

@app.get("/")
def read_root():
    return {"service": "VigilOS", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health_check():
    return check_health()

import subprocess

@app.post("/api/gateway/connect")
def connect_gateway():
    try:
        # Run adb reverse to map the Android emulator/device port to the local Gateway port
        result = subprocess.run(
            [r"C:\Users\pn466\AppData\Local\Android\Sdk\platform-tools\adb.exe", "reverse", "tcp:3001", "tcp:3001"],
            capture_output=True,
            text=True,
            check=True
        )
        return {"status": "success", "message": "Mobile Gateway reconnected", "output": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": f"ADB reverse failed: {e.stderr}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Agent routers — each wrapped in try/except so the app starts
# even when agent modules haven't been built yet.
_routers = [
    ("app.routers.scoring", "scoring"),
    ("app.routers.graph", "graph"),
    ("app.routers.compliance", "compliance"),
    ("app.routers.timeline", "timeline"),
    ("app.routers.explainer", "explainer"),
    ("app.routers.recommender", "recommender"),
    ("app.routers.message", "message"),
    ("app.routers.link", "link"),
    ("app.routers.correlator", "correlator"),
    ("app.routers.orchestrator", "orchestrator"),
]

for module_path, name in _routers:
    try:
        import importlib
        mod = importlib.import_module(module_path)
        app.include_router(mod.router, prefix="/api")
        logger.info(f"Loaded router: {name}")
    except Exception as e:
        logger.warning(f"Router '{name}' not yet available: {e}")

