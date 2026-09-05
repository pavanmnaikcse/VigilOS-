import React, { useState } from 'react';
import {
  CreditCard,
  ArrowLeftRight,
  Shield,
  Activity,
  BrainCircuit,
  Scale,
  FileText,
  Eye,
  ArrowUp,
  Ban
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import api from '../lib/api';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const toneStyles = {
  success: {
    dot: "bg-success",
    text: "text-success",
    bar: "bg-success",
    softBg: "bg-success/10",
    border: "border-success/40",
    glow: "shadow-[0_0_20px_-6px_var(--color-success)]",
  },
  warning: {
    dot: "bg-warning",
    text: "text-warning",
    bar: "bg-warning",
    softBg: "bg-warning/10",
    border: "border-warning/40",
    glow: "shadow-[0_0_20px_-6px_var(--color-warning)]",
  },
  danger: {
    dot: "bg-danger",
    text: "text-danger",
    bar: "bg-danger",
    softBg: "bg-danger/10",
    border: "border-danger/40",
    glow: "shadow-[0_0_20px_-6px_var(--color-danger)]",
  },
};

const decisions = [
  {
    id: "MONITOR",
    name: "Monitor",
    description: "Continue monitoring this transaction",
    icon: Eye,
    tone: "success",
  },
  {
    id: "ESCALATE",
    name: "Escalate",
    description: "Escalate for further review",
    icon: ArrowUp,
    tone: "warning",
  },
  {
    id: "BLOCK",
    name: "Block",
    description: "Block this transaction",
    icon: Ban,
    tone: "danger",
  },
];

function Card({ icon: Icon, title, action, children, className }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Icon className="size-4 text-info" />
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TransactionOverview({ transaction }) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <Card icon={CreditCard} title="Transaction Overview">
      <div className="flex items-center gap-5">
        <div className="grid size-20 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_28px_-8px_var(--color-primary)]">
          <ArrowLeftRight className="size-8 text-info" strokeWidth={1.75} />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-4">
          <Field label="TYPE">
            <p className="text-xl font-bold tracking-tight text-foreground">{transaction?.type || 'UNKNOWN'}</p>
          </Field>
          <Field label="AMOUNT">
            <p className="text-xl font-bold tracking-tight text-success">{formatCurrency(transaction?.amount)}</p>
          </Field>
          <Field label="TRANSACTION ID">
            <p className="text-sm font-semibold text-foreground">{transaction?.txn_id || 'N/A'}</p>
          </Field>
          <Field label="DATE & TIME">
            <p className="text-sm font-semibold text-foreground">
              {transaction?.timestamp ? new Date(transaction.timestamp * 1000).toLocaleString() : 'N/A'}
            </p>
          </Field>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-t border-border/50 pt-5">
        <Field label="FROM (ORIGIN)">
          <p className="truncate text-lg font-bold tracking-tight text-foreground">{transaction?.nameOrig || 'N/A'}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">(Old: {transaction?.oldbalanceOrg || 0}, New: {transaction?.newbalanceOrig || 0})</p>
        </Field>
        <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border/70 bg-surface">
          <ArrowLeftRight className="size-4 text-muted-foreground" />
        </div>
        <Field label="TO (DESTINATION)">
          <p className="truncate text-lg font-bold tracking-tight text-foreground">{transaction?.nameDest || 'N/A'}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">(Old: {transaction?.oldbalanceDest || 0}, New: {transaction?.newbalanceDest || 0})</p>
        </Field>
      </div>
    </Card>
  );
}

function RiskScore({ fraudScore }) {
  const score = fraudScore?.risk_score || 0;
  const angle = Math.PI * (1 - score); 
  const cx = 100;
  const cy = 96;
  const r = 72;
  const needleX = cx + r * Math.cos(angle);
  const needleY = cy - r * Math.sin(angle);

  return (
    <Card icon={Shield} title="Risk Score">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 118" className="w-full max-w-[260px]" role="img" aria-label={`Risk score gauge showing ${score.toFixed(2)}`}>
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-success)" />
              <stop offset="45%" stopColor="var(--color-warning)" />
              <stop offset="100%" stopColor="var(--color-danger)" />
            </linearGradient>
          </defs>
          <path
            d="M 28 96 A 72 72 0 0 1 172 96"
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="13"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 28 96 A 72 72 0 0 1 172 96"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="13"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--color-warning) 45%, transparent))" }}
          />
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="var(--color-foreground)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="5" fill="var(--color-foreground)" />
          <text x="28" y="114" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
            0
          </text>
          <text x="172" y="114" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
            1
          </text>
        </svg>
        <p className="-mt-10 text-4xl font-extrabold tracking-tight text-foreground">{score.toFixed(2)}</p>
        <p className="mt-1 text-xs font-bold tracking-[0.18em] text-warning uppercase">{fraudScore?.risk_level || 'UNKNOWN'} RISK</p>
        <div className="mt-4 w-full rounded-lg border border-border/50 bg-surface px-4 py-2.5 text-center">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground/90">Score Range: 0 – 1</span>
            <span className="mx-2 text-border">|</span>
            Calculated from behavioral, pattern & historical risk data
          </p>
        </div>
      </div>
    </Card>
  );
}

function RiskSignals({ signals }) {
  const activeSignals = signals || {};
  
  const signalArray = [];
  
  Object.entries(activeSignals).forEach(([key, val]) => {
    let level = 'High';
    let tone = 'danger';
    let strength = typeof val === 'number' ? Math.min(Math.max(val, 0.2), 1.0) : 0.85;
    
    if (typeof val === 'number') {
      if (val < 0.3) { level = 'Low'; tone = 'success'; }
      else if (val < 0.7) { level = 'Medium'; tone = 'warning'; }
      else { level = 'High'; tone = 'danger'; }
    } else if (typeof val === 'boolean') {
      level = val ? 'Yes' : 'No';
      tone = val ? 'danger' : 'success';
      strength = val ? 0.9 : 0.2;
    } else if (typeof val === 'string') {
      level = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      if (level === 'High') { tone = 'danger'; strength = 0.9; }
      else if (level === 'Medium') { tone = 'warning'; strength = 0.6; }
      else { tone = 'success'; strength = 0.2; }
    }
    
    signalArray.push({ name: key.replace(/_/g, ' '), level, tone, strength });
  });

  return (
    <Card icon={Activity} title="Risk Signals" className="flex-1">
      <ul className="space-y-3.5">
        {signalArray.map((signal) => {
          const tone = toneStyles[signal.tone] || toneStyles.success;
          return (
            <li key={signal.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={cn("size-2 shrink-0 rounded-full", tone.dot)} />
                <span className="truncate text-[13px] font-medium text-foreground/90 capitalize">
                  {signal.name}
                </span>
              </div>
              <span className={cn("w-14 text-right text-xs font-semibold", tone.text)}>
                {signal.level}
              </span>
              <div className="col-span-2 mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/70">
                <div
                  className={cn("h-full rounded-full", tone.bar)}
                  style={{
                    width: `${signal.strength * 100}%`,
                    boxShadow: `0 0 8px color-mix(in oklab, currentColor 60%, transparent)`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function AIRecommendation({ recommendation }) {
  const confPercent = Math.round((recommendation?.confidence || 0) * 100) + '%';
  const action = recommendation?.action || 'UNKNOWN';
  
  let actionColorClass = 'text-warning bg-warning/10 border-warning/40';
  if (action === 'BLOCK') actionColorClass = 'text-danger bg-danger/10 border-danger/40';
  else if (action === 'MONITOR' || action === 'ALLOW') actionColorClass = 'text-success bg-success/10 border-success/40';

  return (
    <Card
      icon={BrainCircuit}
      title="AI Recommendation"
      action={
        <span className={cn("rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-wider", actionColorClass)}>
          {action}
        </span>
      }
      className="flex-1"
    >
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">Confidence</span>
        <span className="font-bold text-foreground">{confPercent}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-info"
          style={{ width: confPercent, boxShadow: "0 0 10px color-mix(in oklab, var(--color-info) 50%, transparent)" }}
        />
      </div>
      <div className="mt-4 border-t border-border/50 pt-4">
        <p className="text-[13px] font-semibold text-foreground">Reasoning</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {recommendation?.reasoning || 'No reasoning available.'}
        </p>
      </div>
    </Card>
  );
}

function MakeDecision({ caseId, currentDecision, onDecisionUpdated }) {
  const [selected, setSelected] = useState(currentDecision || null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (decisionId) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post(`/cases/${caseId}/decide`, {
        decision: decisionId,
        notes: notes || "Submitted via Command Center",
        decided_by: "Compliance Officer"
      });
      setSelected(decisionId);
      if (onDecisionUpdated) onDecisionUpdated(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card icon={Scale} title="Make Decision">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Investigation Notes</p>
      <textarea
        placeholder="Reason for decision..."
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-2.5 text-[13px] text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
      {error && <p className="text-danger text-xs mt-2">{error}</p>}
      <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Decision Actions</p>
      <div className="space-y-2">
        {decisions.map((decision) => {
          const tone = toneStyles[decision.tone];
          const isSelected = selected === decision.id;
          return (
            <button
              key={decision.id}
              onClick={() => handleSubmit(decision.id)}
              disabled={loading}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all",
                isSelected
                  ? cn(tone.border, tone.softBg, tone.glow)
                  : "border-border/60 bg-surface hover:bg-accent/60"
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  tone.softBg,
                  tone.text
                )}
              >
                <decision.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[13px] font-semibold", isSelected ? tone.text : "text-foreground")}>
                  {decision.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {decision.description}
                </span>
              </span>
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                  isSelected ? cn(tone.border, tone.softBg) : "border-border"
                )}
              >
                {isSelected && <span className={cn("size-1.5 rounded-full", tone.dot)} />}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function QuickSummary({ summary }) {
  const text = typeof summary === 'object' ? JSON.stringify(summary) : summary;
  
  return (
    <Card icon={FileText} title="Quick Summary" className="flex-1">
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {text || 'No summary available for this case.'}
      </p>
    </Card>
  );
}

export default function CaseOverview({ caseData, setCaseData }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 h-full">
      <div className="flex flex-col gap-4">
        <TransactionOverview transaction={caseData.transaction} />
        <RiskSignals signals={caseData.fraud_score?.signals_fired} />
      </div>
      <div className="flex flex-col gap-4">
        <RiskScore fraudScore={caseData.fraud_score} />
        <AIRecommendation recommendation={caseData.recommendation} />
      </div>
      <div className="flex flex-col gap-4">
        <MakeDecision 
          caseId={caseData.case_id} 
          currentDecision={caseData.human_decision}
          onDecisionUpdated={setCaseData}
        />
        <QuickSummary summary={caseData.explanation?.summary} />
      </div>
    </div>
  );
}
