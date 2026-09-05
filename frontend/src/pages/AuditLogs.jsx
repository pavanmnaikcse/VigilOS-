import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShieldAlert, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Activity, X } from 'lucide-react';

const StatusIcon = ({ status }) => {
  if (status === 'completed') return <CheckCircle size={18} className="text-green-400" />;
  if (status === 'failed') return <XCircle size={18} className="text-red-500" />;
  if (status === 'skipped') return <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-500" />;
  return <Clock size={18} className="text-yellow-400 animate-pulse" />;
};

const TraceNode = ({ trace, isLast }) => {
  const [expanded, setExpanded] = useState(false);

  const isSkipped = trace.status === 'skipped';
  const isFailed = trace.status === 'failed';

  return (
    <div className="relative pl-8 pb-6">
      {/* Vertical Line connecting nodes */}
      {!isLast && (
        <div className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${isSkipped ? 'bg-gray-700 border-dashed' : 'bg-[rgba(0,229,255,0.2)]'}`} />
      )}
      
      {/* Icon Node */}
      <div className="absolute left-0 top-1 bg-[#0a0f18] p-1">
        <StatusIcon status={trace.status} />
      </div>

      <div 
        className={`rounded-lg border ${isFailed ? 'border-red-900 bg-[rgba(255,0,0,0.02)]' : isSkipped ? 'border-gray-800 bg-[#0a0f18]/50 text-gray-400' : 'border-[rgba(0,229,255,0.15)] bg-[#0a0f18] hover:bg-[rgba(0,229,255,0.02)]'} p-4 cursor-pointer transition-colors`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold tracking-wide ${isSkipped ? 'text-gray-400' : 'text-white'}`}>
              {trace.agent_name}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isSkipped ? 'bg-gray-800 text-gray-400' : isFailed ? 'bg-red-900/50 text-red-400' : 'bg-[#00e5ff]/10 text-[#00e5ff]'}`}>
              {trace.status.toUpperCase()} {trace.duration_ms !== null && `· ${trace.duration_ms} ms`}
            </span>
          </div>
          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </div>

        <p className={`text-sm ${isSkipped ? 'text-gray-500' : 'text-gray-300'}`}>
          {trace.decision_rationale}
        </p>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
            {trace.input_summary && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Input</h4>
                <div className="bg-black/30 rounded p-2 text-xs font-mono text-gray-300">
                  {trace.input_summary}
                </div>
              </div>
            )}
            
            {trace.output && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Output</h4>
                <div className="bg-black/30 rounded p-2 text-xs font-mono text-gray-300 overflow-x-auto max-h-64 overflow-y-auto">
                  <pre>{JSON.stringify(trace.output, null, 2)}</pre>
                </div>
              </div>
            )}

            <div className="flex gap-6 text-xs text-gray-500">
              <div>Started: {new Date(trace.started_at).toLocaleTimeString()}</div>
              {trace.finished_at && <div>Finished: {new Date(trace.finished_at).toLocaleTimeString()}</div>}
            </div>
            
            {trace.fed_into && trace.fed_into.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Fed Into</h4>
                <div className="flex gap-2 flex-wrap">
                  {trace.fed_into.map((agent, i) => (
                    <span key={i} className="text-xs bg-black/40 px-2 py-1 rounded text-gray-400 border border-gray-800">{agent}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AuditLogs() {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseFull, setSelectedCaseFull] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);

  const handleSelectCase = async (caseId) => {
    setSelectedCaseId(caseId);
    setCaseLoading(true);
    try {
      const { data } = await api.get(`/cases/${caseId}`);
      setSelectedCaseFull(data);
    } catch (err) {
      console.error("Error fetching full case details:", err);
    } finally {
      setCaseLoading(false);
    }
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/cases?limit=20');
        setCases(data);
      } catch (err) {
        console.error('Error fetching cases for audit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
    const intervalId = setInterval(fetchCases, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const selectedCase = selectedCaseFull;

  return (
    <div className="flex flex-col h-full w-full bg-[#060608] text-white p-6 relative">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-[#00e5ff]" size={28} />
        <h1 className="text-2xl font-bold tracking-wider">AI Decision Trail</h1>
      </div>
      
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Side: Case List */}
        <div className="w-1/3 bg-[#0a0f18] rounded-xl border border-[rgba(0,229,255,0.2)] p-4 flex flex-col shadow-[0_4px_20px_rgba(0,229,255,0.05)]">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Investigations</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading && cases.length === 0 ? (
              <div className="animate-pulse text-gray-500 text-sm">Loading investigation logs...</div>
            ) : cases.length === 0 ? (
              <div className="text-gray-500 text-sm">No cases found.</div>
            ) : (
              cases.map(c => (
                <div 
                  key={c.case_id}
                  onClick={() => handleSelectCase(c.case_id)}
                  className={`p-3 rounded border cursor-pointer transition-all ${selectedCaseId === c.case_id ? 'border-[#00e5ff] bg-[#00e5ff]/5' : 'border-[rgba(255,255,255,0.05)] bg-black/20 hover:border-[rgba(0,229,255,0.2)]'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-sm font-semibold">{c.case_id}</span>
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${c.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Txn: {c.transaction?.txId} · ${c.transaction?.amount}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-2 flex justify-between">
                    <span>{c.agent_trace ? c.agent_trace.length : 0} trace nodes</span>
                    <span>{new Date(c.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Trace Details */}
        <div className="flex-1 bg-[#0a0f18] rounded-xl border border-[rgba(0,229,255,0.2)] p-6 flex flex-col shadow-[0_4px_20px_rgba(0,229,255,0.05)] relative overflow-hidden">
          {selectedCase ? (
            <div className="flex-1 overflow-y-auto pr-4">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold tracking-wide">{selectedCase.case_id}</h2>
                  <p className="text-sm text-gray-400 mt-1">Investigation Execution Graph</p>
                </div>
                <button onClick={() => {setSelectedCaseId(null); setSelectedCaseFull(null);}} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {!selectedCase.agent_trace || selectedCase.agent_trace.length === 0 ? (
                <div className="text-gray-500 text-sm">No trace data available yet. Waiting for agents...</div>
              ) : (
                <div className="mt-4">
                  {selectedCase.agent_trace.map((trace, idx) => (
                    <TraceNode 
                      key={idx} 
                      trace={trace} 
                      isLast={idx === selectedCase.agent_trace.length - 1} 
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
              <ShieldAlert size={48} className="mb-4 opacity-50" />
              <p>Select an investigation to view its decision trail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

