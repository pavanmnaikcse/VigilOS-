import React from 'react';

export default function AISummaryPanel({ data }) {
  if (!data) {
    return <div className="card p-8 text-center text-slate-400 bg-slate-800 border border-slate-700 rounded">No AI summary</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card bg-slate-800 border border-slate-700 rounded p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-700 pb-2">Executive Summary</h3>
        <div className="text-slate-300 text-sm leading-relaxed">
          {typeof data.summary === 'object' ? (
            <pre className="whitespace-pre-wrap">{JSON.stringify(data.summary, null, 2)}</pre>
          ) : (
            <p>{data.summary || 'No summary text provided.'}</p>
          )}
        </div>
      </div>

      {data.key_findings && data.key_findings.length > 0 && (
        <div className="card bg-slate-800 border border-slate-700 rounded p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-700 pb-2">Key Findings</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            {data.key_findings.map((finding, idx) => (
              <li key={idx}>{finding}</li>
            ))}
          </ul>
        </div>
      )}

      {data.risk_narrative && (
        <div className="card bg-slate-800 border border-slate-700 rounded p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-700 pb-2">Risk Narrative</h3>
          <div className="text-slate-300 text-sm leading-relaxed">
            {typeof data.risk_narrative === 'object' ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(data.risk_narrative, null, 2)}</pre>
            ) : (
              <p>{data.risk_narrative}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
