import React from 'react';

export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return <div className="card p-8 text-center text-slate-400 bg-slate-800 border border-slate-700 rounded">No timeline events</div>;
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'transaction': return 'bg-blue-500';
      case 'network': return 'bg-amber-500';
      case 'compliance': return 'bg-purple-500';
      case 'message': return 'bg-orange-500';
      case 'link': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="card bg-slate-800 border border-slate-700 rounded p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-6">Investigation Timeline</h3>
      <div className="relative border-l border-slate-600 ml-3 space-y-6">
        {events.map((event, idx) => (
          <div key={idx} className="pl-6 relative">
            <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${getTypeColor(event.event_type)}`}></div>
            <div className="text-xs text-slate-400 mb-1">{new Date(event.timestamp).toLocaleString()}</div>
            <div className="font-medium text-slate-200">{event.title}</div>
            <div className="text-sm text-slate-300 mt-1">{event.description}</div>
            {event.source_agent && (
              <div className="text-xs text-slate-500 mt-2 bg-slate-900 inline-block px-2 py-0.5 rounded border border-slate-700">
                Source: {event.source_agent}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
