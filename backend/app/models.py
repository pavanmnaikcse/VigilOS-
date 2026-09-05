from pydantic import BaseModel
from typing import Optional, List, Dict

class Transaction(BaseModel):
    type: str
    amount: float
    nameOrig: str
    oldbalanceOrg: float
    newbalanceOrig: float
    nameDest: str
    oldbalanceDest: float
    newbalanceDest: float
    step: Optional[int] = None
    isFlaggedFraud: Optional[int] = None

class FraudScore(BaseModel):
    risk_score: float
    risk_level: str
    signals_fired: Dict[str, float]
    confidence: Optional[str] = None
    ood_features: Optional[List[str]] = None
    model_version: str = '1.0'

class RingDetection(BaseModel):
    rings_found: List[List[str]]
    ring_count: int
    max_ring_size: int
    accounts_involved: List[str]

class MoneyFlow(BaseModel):
    paths: List[dict]
    total_traced: float
    trace_percentage: float
    time_to_cashout: Optional[str] = None

class ComplianceMatch(BaseModel):
    matches: List[dict]
    low_confidence: bool = False

class TimelineEvent(BaseModel):
    timestamp: str
    event_type: str
    title: str
    description: str
    source_agent: str

class Explanation(BaseModel):
    summary: str
    key_findings: List[str]
    risk_narrative: str

class Recommendation(BaseModel):
    action: str
    confidence: float
    reasoning: str
    thresholds_used: dict

class MessageAnalysis(BaseModel):
    flags: List[dict]
    risk_indicators: List[str]
    pattern_type: Optional[str] = None

class LinkAnalysis(BaseModel):
    domain: str
    whois_age_days: Optional[int] = None
    similarity_score: Optional[float] = None
    is_suspicious: bool
    details: str

class CorrelationResult(BaseModel):
    correlated_cases: List[str]
    shared_accounts: List[str]
    pattern_type: Optional[str] = None

class CaseFile(BaseModel):
    case_id: str
    transaction: Transaction
    status: str = 'pending'
    created_at: str
    fraud_score: Optional[FraudScore] = None
    ring_detection: Optional[RingDetection] = None
    money_flow: Optional[MoneyFlow] = None
    compliance: Optional[ComplianceMatch] = None
    timeline: Optional[List[TimelineEvent]] = None
    explanation: Optional[Explanation] = None
    recommendation: Optional[Recommendation] = None
    message_analysis: Optional[MessageAnalysis] = None
    link_analysis: Optional[LinkAnalysis] = None
    correlation: Optional[CorrelationResult] = None
    human_decision: Optional[str] = None
    decision_notes: Optional[str] = None
    decided_by: Optional[str] = None
    decided_at: Optional[str] = None

class InvestigateRequest(BaseModel):
    transaction: Transaction
    messages: Optional[List[str]] = None
    urls: Optional[List[str]] = None

class DecisionRequest(BaseModel):
    decision: str
    notes: str = ''
    decided_by: str = 'compliance_officer'
