import React from 'react';

export default function RegulationPanel({ data }) {
  if (!data || !data.matches || data.matches.length === 0) {
    return <div className="card p-8 text-center text-slate-400 bg-slate-800 border border-slate-700 rounded">No regulation matches</div>;
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH': return 'bg-red-900 text-red-200 border border-red-700';
      case 'MEDIUM': return 'bg-amber-900 text-amber-200 border border-amber-700';
      case 'LOW': return 'bg-blue-900 text-blue-200 border border-blue-700';
      default: return 'bg-slate-700 text-slate-200 border border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {data.low_confidence && (
        <div className="bg-amber-900/50 border border-amber-500 text-amber-200 p-3 rounded text-sm">
          <strong>Warning:</strong> These regulatory matches have low confidence scores. Manual review is highly recommended.
        </div>
      )}

      {data.matches.map((match, idx) => (
        <div key={idx} className="card bg-slate-800 border border-slate-700 rounded p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-md font-semibold text-slate-200">{match.regulation}</h4>
              <div className="text-sm text-slate-400">Section: {match.section}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(match.severity)}`}>
              {match.severity || 'UNKNOWN'}
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded text-sm text-slate-300 italic border border-slate-700 mb-2">
            "{match.text || match.text_snippet}"
          </div>
          {match.citation_summary && (
            <div className="text-sm text-slate-200 mt-2 bg-blue-900/20 border border-blue-800/50 p-3 rounded">
              <span className="font-semibold text-blue-400">AI Explanation:</span> {match.citation_summary}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
