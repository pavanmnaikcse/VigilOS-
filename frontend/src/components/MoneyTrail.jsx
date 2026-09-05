import React from 'react';

export default function MoneyTrail({ data }) {
  if (!data || !data.paths || data.paths.length === 0) {
    return <div className="card p-8 text-center text-slate-400 bg-slate-800 border border-slate-700 rounded">No money trail data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-slate-800 border border-slate-700 rounded p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{data.trace_percentage}%</div>
          <div className="text-sm text-slate-400">Trace Percentage</div>
        </div>
        <div className="card bg-slate-800 border border-slate-700 rounded p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{data.time_to_cashout || 'N/A'}</div>
          <div className="text-sm text-slate-400">Time to Cashout</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Flow Paths</h3>
        {data.paths.map((pathArray, pathIdx) => (
          <div key={pathIdx} className="card bg-slate-800 border border-slate-700 rounded p-4 overflow-x-auto mb-4">
            <div className="flex items-center space-x-2 min-w-max">
              {pathArray.map((hop, hopIdx) => (
                <React.Fragment key={hopIdx}>
                  <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-center">
                    <div className="font-medium text-slate-200 text-sm">{hop.from || 'Unknown'}</div>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <div className="text-xs text-green-400 font-semibold mb-1">${hop.amount}</div>
                    <div className="text-slate-400 text-xl leading-none">→</div>
                  </div>
                  {hopIdx === pathArray.length - 1 && (
                    <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-center">
                      <div className="font-medium text-slate-200 text-sm">{hop.to || 'Unknown'}</div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
