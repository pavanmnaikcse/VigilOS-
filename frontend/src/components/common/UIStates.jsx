import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';

export const LoadingState = ({ message = "Loading...", skeletonType = "default" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full h-full text-secondary animate-pulse">
      {skeletonType === "list" ? (
        <div className="w-full space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-[#1E2A38] rounded-md w-full"></div>
          ))}
        </div>
      ) : skeletonType === "card" ? (
        <div className="h-48 bg-[#1E2A38] rounded-md w-full"></div>
      ) : (
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin mb-4" size={24} />
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
};

export const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-950/20 border border-red-900/50 rounded-md">
      <AlertTriangle className="text-red-500 mb-3" size={32} />
      <h3 className="text-red-400 font-semibold mb-1">Error Loading Data</h3>
      <p className="text-secondary text-sm mb-4 max-w-md">{message || "A network or server error occurred."}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 bg-[#1E2A38] hover:bg-[#2A3B4D] px-4 py-2 rounded-md text-sm transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <RefreshCw size={14} /> Retry Request
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ title = "No data found", message, icon: Icon = AlertCircle, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#1E2A38] rounded-md">
      <Icon className="text-muted mb-4" size={40} />
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {message && <p className="text-secondary text-sm mb-4 max-w-sm">{message}</p>}
      {action}
    </div>
  );
};

export const RiskBadge = ({ level }) => {
  const normalized = (level || '').toUpperCase();
  let colorClass = 'bg-gray-800 text-gray-300 border-gray-600';
  let dotClass = 'bg-gray-400';
  let Icon = AlertCircle;
  let label = 'UNKNOWN';

  if (normalized === 'HIGH') {
    colorClass = 'bg-red-950/40 text-red-400 border-red-900';
    dotClass = 'bg-red-500';
    Icon = ShieldAlert;
    label = 'HIGH RISK';
  } else if (normalized === 'MEDIUM') {
    colorClass = 'bg-amber-950/40 text-amber-400 border-amber-900';
    dotClass = 'bg-amber-500';
    Icon = AlertTriangle;
    label = 'MEDIUM RISK';
  } else if (normalized === 'LOW') {
    colorClass = 'bg-green-950/40 text-green-400 border-green-900';
    dotClass = 'bg-green-500';
    Icon = CheckCircle;
    label = 'LOW RISK';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`} aria-label={`Risk Level: ${label}`}>
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
};

export const DecisionBadge = ({ decision }) => {
  const normalized = (decision || '').toUpperCase();
  let colorClass = 'bg-gray-800 text-gray-400 border-gray-600';
  
  if (normalized === 'BLOCK') colorClass = 'bg-red-900/40 text-red-400 border-red-800';
  else if (normalized === 'ESCALATE') colorClass = 'bg-amber-900/40 text-amber-400 border-amber-800';
  else if (normalized === 'MONITOR') colorClass = 'bg-green-900/40 text-green-400 border-green-800';
  else if (normalized === 'PENDING' || !decision) return null; // No badge if pending

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border tracking-wider ${colorClass}`} aria-label={`Decision: ${normalized}`}>
      {normalized}
    </span>
  );
};
