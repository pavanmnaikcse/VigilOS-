import React from 'react';

const signalNames = {
  type_eligible: 'Type Eligibility',
  amount_balance_ratio: 'Amount vs Balance',
  balance_mismatch: 'Balance Mismatch',
  mule_pattern: 'Mule Pattern',
  timing_gap: 'Timing Gap',
  velocity: 'Velocity'
};

const RiskSignalBars = ({ signals = {} }) => {
  const getBarColor = (val) => {
    if (val > 0.7) return 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (val > 0.3) return 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    return 'bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-hide h-full">
      {Object.entries(signals).map(([key, value]) => {
        // Exclude 0 value signals for cleaner UI, unless there are none
        if (value === 0 && Object.keys(signals).length > 2) return null;
        
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-400">{signalNames[key] || key}</span>
              <span className="font-bold text-slate-200">
                {key === 'velocity' || key === 'amount_balance_ratio' 
                  ? Number(value).toFixed(2) 
                  : (Number(value) * 100).toFixed(0) + '%'}
              </span>
            </div>
            <div className="h-2 bg-[#1e293b] rounded-full overflow-visible relative">
              <div 
                className={`absolute left-0 top-0 bottom-0 rounded-full ${getBarColor(value)}`}
                style={{ width: `${Math.min(100, Math.max(0, key === 'velocity' || key === 'amount_balance_ratio' ? value / 100 : value * 100))}%` }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RiskSignalBars;
