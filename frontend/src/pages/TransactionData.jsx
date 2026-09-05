import React, { useState, useEffect } from 'react';
import api from '../api';
import { Database, Terminal } from 'lucide-react';

export default function TransactionData() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/audit/transactions?limit=200');
        setLogs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transaction data:', err);
        setError('Failed to load transaction data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    const intervalId = setInterval(() => {
      fetchLogs();
    }, 17000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#060608] text-white p-6 relative">
      <div className="flex items-center gap-3 mb-6">
        <Database className="text-[#00e5ff]" size={28} />
        <h1 className="text-2xl font-bold tracking-wider">Transaction Data</h1>
      </div>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="flex-1 bg-[#0a0f18] rounded-xl border border-[rgba(0,229,255,0.2)] p-4 overflow-hidden shadow-[0_4px_20px_rgba(0,229,255,0.05)] relative flex flex-col">
        <div className="flex items-center gap-2 text-[#00e5ff] mb-4 pb-2 border-b border-[rgba(0,229,255,0.1)]">
          <Terminal size={16} />
          <span className="text-xs tracking-widest font-mono uppercase">system_audit_stream.json</span>
        </div>
        
        <div className="flex-1 overflow-y-auto font-mono text-sm pr-2 text-[#a7b4c5]">
          {loading ? (
            <div className="animate-pulse">Loading secure transmission...</div>
          ) : (
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(logs, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
