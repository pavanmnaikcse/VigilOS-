from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env from project root (VigilOS/) regardless of CWD
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _PROJECT_ROOT / ".env"

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GEMINI_API_KEY: str = ''
    NEO4J_URI: str = 'bolt://localhost:7687'
    NEO4J_USER: str = 'neo4j'
    NEO4J_PASSWORD: str
    NEO4J_DATABASE: str = 'neo4j'
    MONGODB_URI: str = 'mongodb://localhost:27017'
    CHROMA_URL: str = 'http://localhost:8001'
    RESEND_API_KEY: str = ''
    COMPLIANCE_OFFICER_EMAIL: str = 'pavan.m.naik.cse@gmail.com'
    MODEL_PATH: str = str(_PROJECT_ROOT / 'ml' / 'model' / 'fraud_scorer.json')

    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), env_file_encoding='utf-8')

@lru_cache
def get_settings():
    return Settings()


