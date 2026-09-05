import React, { useState, useEffect } from 'react';
import { ShieldQuestion, AlertTriangle, Play, RefreshCw, Clock } from 'lucide-react';
import { InvestigationModal } from '../components/InvestigationModal';
import api from '../lib/api';

export default function Investigations() {
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRandomTransaction = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sample_transaction');
      setTransactions([res.data]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomTransaction();
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6 text-white w-full h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldQuestion className="text-[#00e5ff]" />
            Active Investigations Queue
          </h1>
          <p className="text-[#A7B4C5] text-sm mt-1">
            Incoming high-risk transactions awaiting AI processing.
          </p>
        </div>
        <button 
          onClick={fetchRandomTransaction}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#050a11] border border-[#2a3441] rounded-lg hover:bg-[#0a111a] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="text-sm">Simulate Stream</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        {loading ? (
          <div className="text-[#A7B4C5] text-sm flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Fetching stream...
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((tx, idx) => (
            <div key={idx} className="bg-[#050a11] border border-[rgba(0,229,255,0.2)] p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(255,61,0,0.1)] border border-[#ff3d00] flex items-center justify-center text-[#ff3d00]">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="font-semibold text-[15px]">TXN-{tx.txn_id || tx.nameOrig}</div>
                  <div className="text-[12px] text-[#A7B4C5]">
                    {tx.type || 'TRANSFER'} • Amount: ${Number(tx.amount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] bg-[#1e293b] px-2 py-0.5 rounded text-[#94a3b8] ml-2">
                  <Clock size={10} /> 
                  Just now
                </div>
              </div>
              <button 
                onClick={() => setSelectedTx(tx)}
                className="flex items-center gap-2 px-4 py-2 bg-[rgba(0,229,255,0.1)] text-[#00e5ff] hover:bg-[rgba(0,229,255,0.2)] rounded-lg transition-colors text-sm font-semibold border border-[rgba(0,229,255,0.3)]"
              >
                <Play size={14} />
                Investigate
              </button>
            </div>
          ))
        ) : (
          <div className="text-[#A7B4C5] text-sm">No incoming transactions.</div>
        )}
      </div>

      {selectedTx && (
        <InvestigationModal 
          transaction={selectedTx} 
          onClose={() => {
            setSelectedTx(null);
            fetchRandomTransaction();
          }} 
        />
      )}
    </div>
  );
}
