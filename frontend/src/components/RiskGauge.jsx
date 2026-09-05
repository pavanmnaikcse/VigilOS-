import React from 'react';
import { Shield } from 'lucide-react';

const RiskGauge = ({ score = 0, riskLevel = 'LOW' }) => {
  const percentage = score * 100;
  // Circumference for a semicircle (only half of full circle)
  // But SVG strokeDasharray expects full path length.
  // The path length of "M 20 110 A 80 80 0 0 1 180 110" is PI * 80 ~= 251.3
  const pathLength = Math.PI * 80;
  const strokeDasharray = `${(percentage / 100) * pathLength} ${pathLength}`;

  const getColor = (level) => {
    if (level === 'HIGH') return 'text-red-500';
    if (level === 'MEDIUM') return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-[#0b111a] border border-[#1e293b] rounded-xl p-5 shadow-lg h-full flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1)_0%,rgba(11,17,26,0)_70%)] pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 rounded-lg bg-indigo-900/30 border border-indigo-500/20">
          <Shield className="text-indigo-400" size={18} />
        </div>
        <h3 className="font-semibold text-slate-200">Risk Score</h3>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-4">
        <div className="relative w-48 h-28">
          <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Background Arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="#1e293b"
              strokeWidth="24"
              strokeLinecap="round"
            />
            {/* Colored Arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              filter="url(#glow)"
            />
          </svg>
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <div className="text-5xl font-bold text-white tracking-tight">{Number(score).toFixed(2)}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center w-full px-8 mt-2 text-sm">
          <span className="text-slate-500 font-medium">0</span>
          <span className={`font-bold tracking-wider ${getColor(riskLevel)}`}>
            {riskLevel} RISK
          </span>
          <span className="text-slate-500 font-medium">1</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
