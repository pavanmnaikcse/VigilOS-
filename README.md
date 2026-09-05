# VigilOS: Multi-Agent AI Platform for Financial Crime Investigation

> An AI-powered financial crime investigation platform that transforms suspicious activity into explainable, evidence-backed, investigator-ready cases.

## 1. Project Overview

**VigilOS** is a specialized, autonomous AI platform designed to modernize financial crime investigation. By orchestrating a swarm of specialized AI agents, VigilOS automatically detects anomalies, reconstructs money flow graphs, parses compliance regulations, and builds comprehensive, auditable case files—all before a human investigator even opens the dashboard.

## 2. Core Capabilities (Implemented)

- **XGBoost Fraud Scoring**: Real-time evaluation of transaction risk using a trained gradient boosting model.
- **Autonomous Multi-Agent Orchestration**: A 9-agent pipeline that sequentially processes flagged transactions.
- **Neo4j Graph Analysis**: Deep tracing of funds across accounts to detect cyclic patterns and mule rings.
- **RAG-Powered Compliance**: Automated matching of flagged activity against regulatory guidelines using ChromaDB.
- **Interactive Decision Trail**: A full logging system that records every agent's thought process, inputs, and outputs.
- **VigilOS Commando**: A floating AI copilot powered by Gemini 1.5 Flash that acts on voice/text commands, navigating the app and analyzing cases autonomously.
- **VigilPay Mobile App**: A companion Android application (built with Capacitor) that simulates the user transaction layer.

## 3. Technical Architecture

VigilOS relies on a modern, decoupled architecture.

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Flow (for Network Graphs), Recharts, and Three.js (for global visualization).
- **Backend**: FastAPI (Python), providing REST endpoints and WebSocket connections.
- **Machine Learning**: XGBoost and Scikit-Learn for tabular transaction classification.
- **Agent Orchestration**: Native Python orchestration (note: LangGraph is a planned future integration, current implementation uses native async pipelines).
- **LLM Layer**: Google Gemini 1.5 Flash (via langchain-google-genai),local LLM (ollama).
- **Vector Store**: ChromaDB for RAG (Retrieval-Augmented Generation).
- **Graph Database**: Neo4j for relationship mapping.
- **Document Store**: MongoDB for persisting structured case files and audit logs.

## 4. Multi-Agent Investigation Pipeline

When a transaction exceeds the risk threshold, an autonomous investigation is triggered. The pipeline executes 9 specialized agents:

1. **Agent 1 - Fraud Scorer**: Evaluates the transaction against the XGBoost model.
2. **Agent 2 - Message Analyzer**: Evaluates transaction memos for suspicious keywords. (Skipped if no messages).
3. **Agent 3 - Link Analyzer**: Scans URLs embedded in transaction metadata. (Skipped if no URLs).
4. **Agent 4 - Ring Detector**: Queries Neo4j to identify circular money movement and mule rings.
5. **Agent 5 - Money Flow Analyzer**: Traces N-degree transaction hops in Neo4j to map capital flight.
6. **Agent 6 - Compliance Analysis**: Uses ChromaDB RAG to match the activity against regulatory documents.
7. **Agent 7 - Timeline Reconstruction**: Synthesizes the outputs of previous agents into a chronological narrative.
8. **Agent 8 - Explainer**: Generates a high-level executive summary of the case for human review.
9. **Agent 9 - Recommender**: Outputs a final suggested decision (BLOCK, MONITOR, or ESCALATE).

## 5. System Workflow

\\\mermaid
flowchart TD
    A[VigilPay Android App] -->|Transaction Payload| B(FastAPI Backend)
    B --> C{XGBoost Model}
    C -->|> 75% Risk| D[Trigger Autonomous Investigation]
    C -->|< 75% Risk| E[Clear Transaction]
    
    D --> F[Agent 1: Scorer] -->(Agent 2 & 3 message analyzer,link analyzer)
    F --> G[Agent 4 & 5: Neo4j Graph Analysis]
    G --> H[Agent 6: ChromaDB Compliance RAG]
    H --> I[Agent 7 & 8: Synthesis & Explanation]
    I --> J[Agent 9: Recommendation]
    
    J --> K[(MongoDB: Case Generation)]
    K --> L[React Dashboard: Case Room]
    L --> M[Human Investigator Decision]
\\\

## 6. AI/ML Implementation Details

### XGBoost Fraud Model
- **Dataset**: Trained on a 2-Million row synthetic dataset (synthetic_fraud_data_2M.csv) generated locally to mimic PaySim attributes.
- **Features**: Analyzes transaction amount, sender/receiver velocity, and behavioral velocity.
- **Artifact**: ml/model/fraud_scorer.json

### RAG (Retrieval-Augmented Generation)
- **Vector Database**: ChromaDB running locally.
- **Embedding/LLM**: Gemini 1.5 Flash.
- **Workflow**: Agent 6 queries ChromaDB using the transaction's risk profile to retrieve relevant RBI/regulatory chunks, injecting them into the LLM prompt to ground the compliance analysis.

## 7. Security and Privacy

### Current Controls (Prototype)
- **Environment Variables**: API keys, database credentials, and secrets are strictly managed via .env files and excluded from Git via .gitignore.
- **Sanitized Repository**: A thorough secret audit has been conducted to ensure no leakage of Groq, Gemini, or LiveKit keys.
- **Synthetic Data**: The platform operates entirely on synthetic data; no PII or real banking data is exposed.

### Future Production Hardening
- Implement JWT/OAuth2 authentication (currently mocked).
- Implement Role-Based Access Control (RBAC).
- Secure WebSocket endpoints against Cross-Site WebSocket Hijacking (CSWSH).
- Enforce strict input validation on LLM prompts to prevent prompt injection.

## 8. Repository Structure


VigilOS/
+-- backend/                  # FastAPI server, Agents, ML Inference, DB drivers
¦   +-- app/
¦   ¦   +-- routers/          # API endpoints (Commando, Cases, Graph)
¦   ¦   +-- services/         # Integrations (ChromaDB, Resend)
¦   ¦   +-- orchestrator.py   # 9-Agent Pipeline logic
¦   +-- requirements.txt      # Python dependencies
+-- frontend/                 # React 19 Dashboard
¦   +-- src/
¦   ¦   +-- components/       # UI Widgets, Graphs, HUD
¦   ¦   +-- pages/            # Case Room, Queue, Reports
¦   ¦   +-- hooks/            # Voice Engine, WebSockets
¦   +-- package.json          # Node dependencies
+-- bankapp/                  # VigilPay Android Companion App (Capacitor)
+-- docker/                   # Docker Compose configurations (Neo4j, MongoDB, Chroma)
+-- data/                     # Synthetic 2M row dataset & regulatory corpus
+-- ml/                       # XGBoost training and evaluation scripts
+-- scripts/                  # Utilities (Cloudflared tunnels, etc)
+-- .env.example              # Sanitized environment template
+-- .gitignore                # Git exclusions
\\\

## 9. Local Setup & Installation

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker Desktop
- Google Gemini API Key

### 1. Environment Configuration
\\\ash
git clone <repository_url>
cd VigilOS
cp .env.example .env
# Edit .env and insert your Gemini API Key and DB credentials
\\\

### 2. Infrastructure (Docker)
\\\ash
cd docker
docker-compose up -d
# Starts MongoDB (27017), Neo4j (7687), ChromaDB (8001)
\\\

### 3. Backend Setup
\\\ash
cd backend
python -m venv venv
source venv/Scripts/activate  # Or venv/bin/activate on Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
\\\

### 4. Frontend Setup
\\\ash
cd frontend
npm install
npm run dev
\\\

## 10. Known Limitations (Prototype)

- **Orchestration**: The pipeline is currently managed via native Python syncio logic. Migration to LangGraph for advanced cyclic graphs and fault tolerance is planned.
- **Commando Audio**: Commando currently utilizes browser Web Speech API for transcription.
- **Reporting**: PDF report generation via ReportLab is implemented, but email alerting (via Resend) is stubbed/configurable.

## 11. Future Enhancements

- **Federated Learning**: Implementing privacy-preserving cross-bank fraud intelligence sharing.
- **Enterprise Integrations**: MuleSoft integration to sit between legacy bank mainframes and VigilOS for robust API routing.
- **Red Team Agents**: Introducing adversarial AI agents to constantly probe the XGBoost model for weaknesses.

## 12. License

Proprietary - VigilOS Development Team.
