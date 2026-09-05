"""
Docker Healthcheck Script for VigilOS.

Pings all 3 containerized services (Neo4j, MongoDB, ChromaDB) and reports real status.
Usage: python scripts/docker_healthcheck.py
"""

import os
import sys
from pathlib import Path
from typing import Tuple

import requests
from dotenv import load_dotenv

# Ensure project root is in sys.path and load .env
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(dotenv_path=PROJECT_ROOT / ".env")


def check_neo4j() -> Tuple[bool, str]:
    """Check Neo4j connectivity and fetch server version."""
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "")

    try:
        from neo4j import GraphDatabase

        auth = (user, password) if password else None
        driver = GraphDatabase.driver(uri, auth=auth)
        driver.verify_connectivity()

        # Query version / server info
        with driver.session() as session:
            result = session.run(
                "CALL dbms.components() YIELD name, versions, edition RETURN name, versions, edition"
            )
            record = result.single()
            if record:
                version_info = f"{record['name']} {record['versions'][0]} ({record['edition']})"
                driver.close()
                return True, f"Connected ({version_info})"

        driver.close()
        return True, "Connected"
    except Exception as e:
        return False, f"Failed — {e}"


def check_mongodb() -> Tuple[bool, str]:
    """Check MongoDB connectivity and fetch server version."""
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

    try:
        from pymongo import MongoClient

        client: MongoClient = MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        server_info = client.server_info()
        version = server_info.get("version", "unknown")
        client.close()
        return True, f"Connected (MongoDB v{version})"
    except Exception as e:
        return False, f"Failed — {e}"


def check_chromadb() -> Tuple[bool, str]:
    """Check ChromaDB HTTP heartbeat endpoint."""
    base_url = os.getenv("CHROMA_URL", "http://localhost:8001").rstrip("/")
    heartbeat_url = f"{base_url}/api/v2/heartbeat"
    version_url = f"{base_url}/api/v2/version"

    try:
        res = requests.get(heartbeat_url, timeout=3)
        res.raise_for_status()

        # Fetch ChromaDB version
        try:
            ver_res = requests.get(version_url, timeout=2)
            if ver_res.status_code == 200:
                version = ver_res.json()
                return True, f"Connected (ChromaDB v{version})"
        except Exception:
            pass

        return True, "Connected (Heartbeat OK)"
    except Exception as e:
        return False, f"Failed — {e}"


def main() -> None:
    """Run healthchecks on all services and print summary."""
    services = [
        ("Neo4j", check_neo4j),
        ("MongoDB", check_mongodb),
        ("ChromaDB", check_chromadb),
    ]

    healthy_count = 0

    print("Checking VigilOS Docker Services...\n")
    for name, check_fn in services:
        is_healthy, message = check_fn()
        if is_healthy:
            healthy_count += 1
            print(f"✅ {name}: {message}")
        else:
            print(f"❌ {name}: {message}")

    print(f"\n{healthy_count}/{len(services)} services healthy")
    if healthy_count < len(services):
        sys.exit(1)


if __name__ == "__main__":
    main()
