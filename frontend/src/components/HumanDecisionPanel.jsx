import React, { useState } from 'react';
import { Scale, Ban, ArrowUp, Eye } from 'lucide-react';
import api from '../lib/api';

export default function HumanDecisionPanel({ caseId, currentDecision, onDecisionUpdated }) {
  const [notes, setNotes] = useState('');
  const [confirmDecision, setConfirmDecision] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (currentDecision) {
    return (
      <div className="bg-[#0b111a] border border-[#1e293b] rounded-xl p-4 h-full flex flex-col shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="text-violet-400" size={18} />
          <h3 className="font-semibold text-slate-200">Make Decision</h3>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 text-center flex-1 flex flex-col justify-center items-center">
          <span className={`px-4 py-2 font-bold rounded-full ${currentDecision === 'BLOCK' ? 'bg-red-900/40 text-red-400 border border-red-500/30' : currentDecision === 'ESCALATE' ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30' : 'bg-green-900/40 text-green-400 border border-green-500/30'}`}>
            {currentDecision}
          </span>
          <p className="text-xs text-slate-400 mt-4">Decision locked</p>
        </div>
      </div>
    );
  }

  const handleDecisionClick = async (decision) => {
    if (confirmDecision !== decision) {
      setConfirmDecision(decision);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post(`/cases/${caseId}/decide`, {
        decision,
        notes,
        decided_by: 'compliance_officer'
      });
      if (onDecisionUpdated) {
        onDecisionUpdated(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting decision');
      setConfirmDecision(null);
    } finally {
      setSubmitting(false);
    }
  };

  const getButtonClass = (type, isConfirm) => {
    const base = 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium w-full transition-all';
    const activeClass = isConfirm ? 'ring-2 ring-white/20 scale-[0.98]' : 'hover:scale-[1.02] shadow-lg';
    
    if (type === 'BLOCK') {
      return `${base} bg-gradient-to-r from-red-600 to-red-800 text-white ${activeClass}`;
    }
    if (type === 'ESCALATE') {
      return `${base} bg-gradient-to-r from-orange-500 to-amber-600 text-white ${activeClass}`;
    }
    if (type === 'MONITOR') {
      return `${base} bg-gradient-to-r from-green-500 to-green-700 text-white ${activeClass}`;
    }
    return base;
  };

  return (
    <div className="bg-[#0b111a] border border-[#1e293b] rounded-xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="text-violet-400" size={18} />
        <h3 className="font-semibold text-slate-200">Make Decision</h3>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 text-sm p-2 rounded mb-3 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 px-2">&times;</button>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs text-slate-400 mb-2">Investigation Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for decision..."
          className="w-full bg-[#06090e] border border-slate-700/50 rounded-lg p-3 text-sm text-slate-300 h-28 focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-slate-600 resize-none"
          disabled={submitting}
        />
      </div>

      <div className="space-y-3 mt-auto">
        <button
          onClick={() => handleDecisionClick('BLOCK')}
          disabled={submitting}
          className={getButtonClass('BLOCK', confirmDecision === 'BLOCK')}
        >
          <Ban size={16} />
          {confirmDecision === 'BLOCK' ? 'Confirm BLOCK?' : 'BLOCK'}
        </button>
        
        <button
          onClick={() => handleDecisionClick('ESCALATE')}
          disabled={submitting}
          className={getButtonClass('ESCALATE', confirmDecision === 'ESCALATE')}
        >
          <ArrowUp size={16} />
          {confirmDecision === 'ESCALATE' ? 'Confirm ESCALATE?' : 'ESCALATE'}
        </button>
        
        <button
          onClick={() => handleDecisionClick('MONITOR')}
          disabled={submitting}
          className={getButtonClass('MONITOR', confirmDecision === 'MONITOR')}
        >
          <Eye size={16} />
          {confirmDecision === 'MONITOR' ? 'Confirm MONITOR?' : 'MONITOR'}
        </button>
      </div>
      
      {submitting && <div className="text-center text-xs text-violet-400 mt-3 animate-pulse">Submitting...</div>}
      
      {confirmDecision && !submitting && (
        <div className="mt-3 text-center">
          <button onClick={() => setConfirmDecision(null)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
        </div>
      )}
    </div>
  );
}
