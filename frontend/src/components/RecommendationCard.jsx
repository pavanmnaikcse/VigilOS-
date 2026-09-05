import React from 'react';
import { BrainCircuit } from 'lucide-react';

const RecommendationCard = ({ recommendation = {} }) => {
  const { action = 'MONITOR', confidence = 0, reasoning = 'No recommendation available.' } = recommendation;

  const getActionStyle = (act) => {
    switch (act) {
      case 'BLOCK': return 'bg-red-900/30 text-red-400 border border-red-500/30';
      case 'ESCALATE': return 'bg-amber-900/30 text-amber-400 border border-amber-500/30';
      default: return 'bg-green-900/30 text-green-400 border border-green-500/30';
    }
  };

  return (
    <div className="bg-[#0b111a] border border-[#1e293b] rounded-xl p-5 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-900/30 border border-indigo-500/20">
            <BrainCircuit className="text-indigo-400" size={18} />
          </div>
          <h3 className="font-semibold text-slate-200">AI Recommendation</h3>
        </div>
        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getActionStyle(action)}`}>
          {action}
        </span>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-slate-400">Confidence</span>
          <span className="font-bold text-slate-200">{(confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, confidence * 100))}%` }} 
          />
        </div>
      </div>
      
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex-1">
        <strong className="block text-slate-300 text-sm mb-2">Reasoning</strong>
        <p className="text-sm text-slate-400 leading-relaxed">
          {reasoning}
        </p>
      </div>
    </div>
  );
};

export default RecommendationCard;
