import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Pause, Play, Search, Filter, Download, 
  Briefcase, Clock, ArrowRight, ChevronLeft, ChevronRight,
  ShieldAlert, ShieldCheck, ChevronDown, Calendar, RefreshCw, AlertTriangle, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '../lib/api';

function CustomDropdown({ label, options, value, onChange }: { label: string, options: {label: string, value: string}[], value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="flex flex-col" ref={dropdownRef}>
      <span className="mb-0.5 text-[10px] text-muted-foreground pl-1">{label}</span>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-32 items-center justify-between rounded-md border px-3 py-1.5 text-xs transition-colors",
            isOpen ? "border-cyan/50 bg-cyan/10 text-white" : "border-cyan/15 bg-white/5 text-white/80 hover:bg-white/10"
          )}
        >
          <span className="truncate">{selectedOption.label}</span>
          <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", isOpen && "rotate-180 text-cyan")} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-cyan/20 bg-[#061423] shadow-lg shadow-black/50">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-cyan/10",
                  value === opt.value ? "text-cyan bg-cyan/5 font-medium" : "text-white/80"
                )}
              >
                {opt.label}
                {value === opt.value && <Check size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const KPI_CARDS = [
  { label: "Total Cases", value: "12", delta: "↑ 8% vs yesterday", icon: Briefcase, color: "text-cyan", border: "border-cyan/30" },
  { label: "New Cases", value: "5", delta: "↑ 25% vs yesterday", icon: Clock, color: "text-purple-400", border: "border-purple-500/30" },
  { label: "High Risk", value: "4", delta: "↑ 12% vs yesterday", icon: Activity, color: "text-blue-400", border: "border-blue-500/30" },
  { label: "Escalated", value: "3", delta: "↑ 3% vs yesterday", icon: ShieldAlert, color: "text-warning", border: "border-warning/30" },
  { label: "Pending Review", value: "7", delta: "↑ 5% vs yesterday", icon: ShieldCheck, color: "text-teal-400", border: "border-teal-400/30" },
];

const getRiskStyles = (level: string) => {
  if (!level) return 'text-muted-foreground border-white/10';
  switch (level.toUpperCase()) {
    case 'HIGH': return 'text-[#FF3B30] border-[#FF3B30]/40 bg-[#FF3B30]/10 shadow-[0_0_10px_-2px_rgba(255,59,48,0.2)]';
    case 'MEDIUM': return 'text-[#FFB020] border-[#FFB020]/40 bg-[#FFB020]/10 shadow-[0_0_10px_-2px_rgba(255,176,32,0.2)]';
    case 'LOW': return 'text-[#00E5B0] border-[#00E5B0]/40 bg-[#00E5B0]/10 shadow-[0_0_10px_-2px_rgba(0,229,176,0.2)]';
    default: return 'text-muted-foreground border-white/10';
  }
};

const getDecisionStyles = (decision: string) => {
  if (!decision) return 'text-cyan border-cyan/30 bg-cyan/10';
  switch (decision) {
    case 'BLOCK': return 'text-[#FF3B30] border-[#FF3B30]/30 bg-[#FF3B30]/10';
    case 'ESCALATE': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
    case 'Pending': return 'text-cyan border-cyan/30 bg-cyan/10';
    default: return 'text-muted-foreground border-white/10';
  }
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  const diffMs = new Date().getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} days ago`;
};

export default function CaseQueue() {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 13;
  
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get('/cases?skip=0&limit=1000');
      setCases(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load cases.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [filterDecision, setFilterDecision] = useState("ALL");

  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => {
        fetchCases(false);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Apply filters
  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = q === "" || 
      c.case_id?.toLowerCase().includes(q) || 
      c.transaction?.type?.toLowerCase().includes(q) ||
      c.transaction?.amount?.toString().includes(q);

    const matchType = filterType === "ALL" || (c.transaction?.type || 'N/A').toUpperCase() === filterType;
    const matchRisk = filterRisk === "ALL" || (c.fraud_score?.risk_level || 'UNKNOWN').toUpperCase() === filterRisk;
    
    const cDecision = (c.human_decision || c.recommendation?.action || 'PENDING').toUpperCase();
    const matchDecision = filterDecision === "ALL" || cDecision === filterDecision;

    return matchSearch && matchType && matchRisk && matchDecision;
  });

  // Ensure current page is valid after filtering
  useEffect(() => {
    const maxPage = Math.ceil(filteredCases.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredCases.length, currentPage]);

  // Dynamically compute KPIs from live cases
  const totalCases = cases.length;
  const newCases = cases.filter(c => {
    const diffMs = new Date().getTime() - new Date(c.created_at).getTime();
    return diffMs < 24 * 60 * 60 * 1000; // last 24 hours
  }).length;
  const highRisk = cases.filter(c => c.fraud_score?.risk_level === 'HIGH').length;
  const escalated = cases.filter(c => c.human_decision === 'ESCALATE').length;
  const pendingReview = cases.filter(c => !c.human_decision).length;

  const DYNAMIC_KPI_CARDS = [
    { label: "Total Cases", value: totalCases.toString(), delta: "Active tracking", icon: Briefcase, color: "text-cyan", border: "border-cyan/30" },
    { label: "New Cases", value: newCases.toString(), delta: "Last 24 hours", icon: Clock, color: "text-purple-400", border: "border-purple-500/30" },
    { label: "High Risk", value: highRisk.toString(), delta: "Requires attention", icon: Activity, color: "text-blue-400", border: "border-blue-500/30" },
    { label: "Escalated", value: escalated.toString(), delta: "Priority review", icon: ShieldAlert, color: "text-warning", border: "border-warning/30" },
    { label: "Pending Review", value: pendingReview.toString(), delta: "Awaiting decision", icon: ShieldCheck, color: "text-teal-400", border: "border-teal-400/30" },
  ];

  return (
    <div className="flex h-full flex-col lg:overflow-hidden w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-3 px-1">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <Activity className="text-white/70" size={22} />
          Case Queue
        </h1>
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all border",
            isPaused 
              ? "bg-warning/10 text-warning border-warning/40 shadow-[0_0_15px_-3px_rgba(255,176,32,0.2)]" 
              : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
          {isPaused ? "Resume Updates" : "Pause Updates"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3 shrink-0 mb-3">
        {DYNAMIC_KPI_CARDS.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={cn("glass rounded-lg border flex items-center p-3 gap-3", kpi.border)}>
              <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-md bg-black/40 border border-white/5", kpi.color)}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold leading-none text-white">{kpi.value}</div>
                <div className="mt-1 truncate text-[10.5px] font-medium text-muted-foreground">{kpi.label}</div>
                <div className="mt-0.5 text-[9.5px] font-medium text-[#00E5B0]">{kpi.delta}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between gap-3 shrink-0 mb-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input 
            type="text" 
            placeholder="Search cases, ID, type, or notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-cyan/20 bg-black/40 py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-muted-foreground/60 focus:border-cyan/50 focus:outline-none focus:ring-1 focus:ring-cyan/50 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <CustomDropdown 
            label="Type" 
            value={filterType} 
            onChange={setFilterType} 
            options={[
              { label: 'All Types', value: 'ALL' },
              { label: 'Transfer', value: 'TRANSFER' },
              { label: 'Withdrawal', value: 'WITHDRAWAL' },
              { label: 'Deposit', value: 'DEPOSIT' }
            ]} 
          />
          
          <CustomDropdown 
            label="Risk Level" 
            value={filterRisk} 
            onChange={setFilterRisk} 
            options={[
              { label: 'All Risks', value: 'ALL' },
              { label: 'High', value: 'HIGH' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'Low', value: 'LOW' }
            ]} 
          />

          <CustomDropdown 
            label="Decision" 
            value={filterDecision} 
            onChange={setFilterDecision} 
            options={[
              { label: 'All Decisions', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Block', value: 'BLOCK' },
              { label: 'Escalate', value: 'ESCALATE' },
              { label: 'Monitor', value: 'MONITOR' }
            ]} 
          />

          <div className="flex flex-col">
            <span className="mb-0.5 text-[10px] text-muted-foreground pl-1">Date Range</span>
            <button className="flex items-center justify-between gap-6 rounded-md border border-cyan/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors">
              <span className="flex items-center gap-2"><Calendar size={13} className="text-muted-foreground" /> Last 7 Days</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex items-end gap-2 h-[46px]">
          <button className="flex h-[30px] items-center gap-2 rounded-md border border-cyan/20 bg-white/5 px-3 text-xs font-medium text-white transition-colors hover:bg-cyan/10 hover:border-cyan/40">
            <Filter size={14} className="text-muted-foreground" /> Filters
          </button>
          <button className="flex h-[30px] items-center gap-2 rounded-md border border-cyan/20 bg-white/5 px-3 text-xs font-medium text-white transition-colors hover:bg-cyan/10 hover:border-cyan/40">
            <Download size={14} className="text-muted-foreground" /> Export
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="glass flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-cyan/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative">
        {loading && cases.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <RefreshCw size={32} className="text-cyan animate-spin mb-4" />
            <div className="text-sm font-medium text-white">Loading live cases...</div>
          </div>
        ) : error && cases.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <AlertTriangle size={32} className="text-warning mb-4" />
            <div className="text-sm font-medium text-warning mb-4">{error}</div>
            <button onClick={() => fetchCases(true)} className="rounded bg-cyan/20 px-4 py-2 text-cyan border border-cyan/40 hover:bg-cyan/30">Retry</button>
          </div>
        ) : null}
      
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          <table className="w-full text-left text-[11.5px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[rgba(3,17,29,0.95)] backdrop-blur-md shadow-[0_1px_0_rgba(0,229,255,0.15)]">
              <tr className="text-muted-foreground">
                <th className="py-2.5 px-4 font-medium whitespace-nowrap w-8">No.</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Case ID ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Date ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Type ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Amount ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Risk Score ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Risk Level ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Decision ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Assigned To ↕</th>
                <th className="py-2.5 px-4 font-medium whitespace-nowrap">Last Updated ↕</th>
                <th className="py-2.5 px-4 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((c, index) => {
                const assignedTo = "Unassigned"; // Database doesn't have assignment yet
                const caseNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                
                return (
                  <tr 
                    key={c.case_id} 
                    onClick={() => navigate(`/case/${c.case_id}`)}
                    className="group cursor-pointer transition-colors hover:bg-white/[0.04]"
                  >
                    <td className="py-2 px-4 text-muted-foreground/50 font-mono">{caseNumber}</td>
                    <td className="py-2 px-4 font-mono text-white/90">{c.case_id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}</td>
                    <td className="py-2 px-4 text-muted-foreground">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="py-2 px-4 text-white/80">{c.transaction?.type?.toUpperCase() || 'TRANSFER'}</td>
                    <td className="py-2 px-4 font-mono text-white">
                      ${c.transaction?.amount ? parseFloat(c.transaction.amount).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-2 px-4 font-mono text-white/90">
                      {c.fraud_score?.risk_score !== undefined ? (c.fraud_score.risk_score * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                    <td className="py-2 px-4">
                      <span className={cn("inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider", getRiskStyles(c.fraud_score?.risk_level))}>
                        {c.fraud_score?.risk_level || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span className={cn("inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider", getDecisionStyles(c.human_decision || 'PENDING'))}>
                        {c.human_decision || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-muted-foreground">{assignedTo}</td>
                    <td className="py-2 px-4 text-muted-foreground">{formatTimeAgo(c.created_at)}</td>
                    <td className="py-2 px-4 text-right">
                      <ArrowRight size={14} className="inline-block text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-cyan" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination */}
        <div className="flex items-center justify-between shrink-0 border-t border-cyan/15 bg-black/20 px-4 py-2">
          <div className="text-[11px] text-muted-foreground">
            Showing {filteredCases.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCases.length)} of {filteredCases.length} cases
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <button className="grid h-7 w-7 place-items-center rounded-md border border-cyan/40 bg-cyan/15 text-cyan shadow-[0_0_10px_rgba(0,229,255,0.15)] text-[11px] font-bold">
              {currentPage}
            </button>
            <button 
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredCases.length / ITEMS_PER_PAGE), currentPage + 1))}
              disabled={currentPage === Math.ceil(filteredCases.length / ITEMS_PER_PAGE) || filteredCases.length === 0}
              className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
