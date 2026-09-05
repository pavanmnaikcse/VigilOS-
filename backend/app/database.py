import urllib.parse
from neo4j import GraphDatabase, Driver
from pymongo import MongoClient
from pymongo.database import Database
import chromadb
from app.config import get_settings

_neo4j_driver = None
_mongo_client = None
_chroma_client = None

def get_neo4j_driver() -> Driver:
    """Return a singleton Neo4j driver. Verifies connectivity on first call."""
    global _neo4j_driver
    if _neo4j_driver is None:
        settings = get_settings()
        _neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        _neo4j_driver.verify_connectivity()
    return _neo4j_driver

def get_neo4j_database() -> str:
    """Return the configured Neo4j database name."""
    return get_settings().NEO4J_DATABASE

def get_mongo_client() -> MongoClient:
    """Return a singleton MongoDB client."""
    global _mongo_client
    if _mongo_client is None:
        settings = get_settings()
        _mongo_client = MongoClient(settings.MONGODB_URI)
    return _mongo_client

def get_mongo_db() -> Database:
    """Return the 'vigilos' database from MongoDB."""
    client = get_mongo_client()
    return client['vigilos']

def get_chroma_client():
    """Return a singleton ChromaDB HTTP client."""
    global _chroma_client
    if _chroma_client is None:
        settings = get_settings()
        parsed_url = urllib.parse.urlparse(settings.CHROMA_URL)
        host = parsed_url.hostname or "localhost"
        port = parsed_url.port or 8001
        _chroma_client = chromadb.HttpClient(host=host, port=port)
    return _chroma_client

def check_health() -> dict:
    """Ping all 3 services and return real status for each."""
    status = {}

    # Check Neo4j
    try:
        driver = get_neo4j_driver()
        driver.verify_connectivity()
        status['neo4j'] = 'ok'
    except Exception as e:
        status['neo4j'] = f'error: {str(e)}'

    # Check MongoDB
    try:
        client = get_mongo_client()
        client.admin.command('ping')
        status['mongodb'] = 'ok'
    except Exception as e:
        status['mongodb'] = f'error: {str(e)}'

    # Check ChromaDB
    try:
        client = get_chroma_client()
        client.heartbeat()
        status['chromadb'] = 'ok'
    except Exception as e:
        status['chromadb'] = f'error: {str(e)}'

    return status

# Phase 17: Taint Propagation and Idempotency

def is_txn_processed(txn_id: str) -> bool:
    """Idempotency check: returns True if this txn_id was already processed."""
    db = get_mongo_db()
    # Check if transaction exists in processed_txns collection
    doc = db.processed_txns.find_one({"txn_id": txn_id})
    return bool(doc)

def mark_txn_processed(txn_id: str):
    """Mark a transaction as processed to prevent duplicates."""
    db = get_mongo_db()
    db.processed_txns.update_one(
        {"txn_id": txn_id},
        {"$set": {"txn_id": txn_id}},
        upsert=True
    )

def get_tainted_case(account_id: str):
    """
    Returns the active case_id if the account is currently tainted and not expired,
    otherwise returns None.
    """
    import datetime
    db = get_mongo_db()
    now = datetime.datetime.utcnow()
    doc = db.tainted_accounts.find_one({
        "account_id": account_id,
        "expires_at": {"$gt": now}
    })
    return doc.get("case_id") if doc else None

def taint_account(account_id: str, case_id: str):
    """
    Taint an account with a 2 minute expiry.
    """
    import datetime
    db = get_mongo_db()
    now = datetime.datetime.utcnow()
    expires_at = now + datetime.timedelta(minutes=2)
    db.tainted_accounts.update_one(
        {"account_id": account_id},
        {"$set": {
            "account_id": account_id,
            "case_id": case_id,
            "tainted_at": now,
            "expires_at": expires_at
        }},
        upsert=True
    )

def append_hop_to_case(case_id: str, transaction: dict):
    """
    Atomically push a transaction as a new hop in the case's 'hops' array.
    """
    db = get_mongo_db()
    db.cases.update_one(
        {"case_id": case_id},
        {"$push": {"hops": transaction}}
    )
