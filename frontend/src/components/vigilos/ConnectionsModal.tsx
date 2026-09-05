import { useState, useEffect } from "react";
import { X, Smartphone, Activity } from "lucide-react";

export function ConnectionsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [connections, setConnections] = useState<any[]>([]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchConnections = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/mobile/connections");
        const data = await res.json();
        if (data.status === "success") {
          setConnections(data.connections);
        }
      } catch (err) {
        console.error("Failed to fetch connections", err);
      }
    };
    
    fetchConnections();
    const interval = setInterval(fetchConnections, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[500px] rounded-xl border border-cyan/20 bg-[#060b14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-cyan/10 p-4">
          <div className="flex items-center gap-2">
            <Activity className="text-cyan animate-pulse" size={18} />
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Mobile Gateway Network</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          {connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <Smartphone size={40} className="mb-3 opacity-20" />
              <p>No active mobile connections detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-cyan/30 bg-cyan/5">
                  <Activity size={32} className="text-cyan" />
                  <div className="absolute inset-0 rounded-full animate-ping border border-cyan/50 opacity-20" style={{ animationDuration: '3s' }}></div>
                </div>
              </div>
              
              <div className="grid gap-3">
                {connections.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-cyan/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-cyan/20 text-cyan">
                        <Smartphone size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{c.account_id}</div>
                        <div className="text-[10px] text-gray-400">Connected Device</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div className="font-mono text-xs text-emerald-400">{c.ip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
