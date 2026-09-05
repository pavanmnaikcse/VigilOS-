import React, { useState, useEffect } from 'react';
import { FileText, Download, AlertTriangle, Calendar, Filter, FileBarChart2 } from 'lucide-react';
import api from '../lib/api';

export default function Reports() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/cases?limit=1000');
        // Only show cases that have a decision or high risk
        setCases(data.filter(c => c.human_decision || c.fraud_score?.risk_level === 'HIGH'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleDownload = (caseId) => {
    window.open(`http://localhost:8000/api/cases/${caseId}/report`, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 p-6 text-white w-full h-full lg:overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart2 className="text-[#00e5ff]" />
            Compliance Reports & SARs
          </h1>
          <p className="text-[#A7B4C5] text-sm mt-1">
            Generate and download Suspicious Activity Reports (SAR) for flagged cases.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#050a11] border border-[#2a3441] rounded-lg hover:bg-[#0a111a] transition-colors">
          <Filter size={14} />
          <span className="text-sm">Filter Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-[#050a11] border border-[#1f2937] p-4 rounded-xl">
          <div className="text-[#A7B4C5] text-sm mb-1">Total Generated SARs</div>
          <div className="text-2xl font-bold">{cases.length}</div>
        </div>
        <div className="bg-[#050a11] border border-[#1f2937] p-4 rounded-xl">
          <div className="text-[#A7B4C5] text-sm mb-1">Pending Review</div>
          <div className="text-2xl font-bold text-amber-500">
            {cases.filter(c => !c.human_decision).length}
          </div>
        </div>
        <div className="bg-[#050a11] border border-[#1f2937] p-4 rounded-xl">
          <div className="text-[#A7B4C5] text-sm mb-1">Auto-Filed Reports</div>
          <div className="text-2xl font-bold text-[#00e5ff]">0</div>
        </div>
      </div>

      <div className="bg-[#050a11] border border-[#1f2937] rounded-xl overflow-hidden mt-2 flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-[#1f2937] bg-[#0a111a] flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-sm">Available Reports</h3>
        </div>
        <div className="p-0 overflow-auto flex-1 min-h-0 custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-[#A7B4C5]">Loading reports...</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-[#A7B4C5]">No cases available for reporting.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#A7B4C5] text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Case ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Risk Level</th>
                  <th className="p-4 font-medium">Decision</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {cases.map((c, i) => (
                  <tr key={i} className="border-b border-[#1f2937]/50 hover:bg-[#0a111a]/50 transition-colors">
                    <td className="p-4 font-mono text-[#00e5ff]">{c.case_id}</td>
                    <td className="p-4 text-[#A7B4C5]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {c.fraud_score?.risk_level === 'HIGH' ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-max">
                          <AlertTriangle size={12} /> HIGH
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 w-max">
                          {c.fraud_score?.risk_level || 'MEDIUM'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {c.human_decision ? (
                        <span className="text-[#00e5ff] capitalize">{c.human_decision.toLowerCase()}</span>
                      ) : (
                        <span className="text-[#A7B4C5]">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDownload(c.case_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 rounded hover:bg-[#00e5ff]/20 transition-colors text-xs font-medium"
                      >
                        <Download size={14} /> SAR PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
