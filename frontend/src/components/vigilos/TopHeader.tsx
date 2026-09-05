import { useState, useEffect } from "react";
import { Bell, ChevronDown, Smartphone, Activity, Key, X, User } from "lucide-react";
import { NotificationsPopup, Notification } from "./NotificationsPopup";
import { ConnectionsModal } from "./ConnectionsModal";

import { useNavigate } from "react-router-dom";

export function TopHeader() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [keyStatus, setKeyStatus] = useState<any>(null); // { loading, valid, message }
  
  
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('dashboard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);


  useEffect(() => {
    // Sync key to backend on initial load if it exists
    const storedKey = localStorage.getItem("GEMINI_API_KEY");
    if (storedKey) {
      fetch("http://localhost:8000/api/commando/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_key: storedKey })
      }).catch(console.error);
    }
    
    fetch("http://localhost:8000/api/stats")
      .then(res => res.json())
      .then(data => {
        if (data.recent_activity) {
          const mapped = data.recent_activity.map((c: any) => {
            const date = new Date(c.created_at);
            const now = new Date();
            const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
            let timeStr = `${diffMin} min ago`;
            if (diffMin > 60) timeStr = `${Math.floor(diffMin / 60)} hr ago`;
            if (diffMin > 1440) timeStr = `${Math.floor(diffMin / 1440)} days ago`;
            if (diffMin < 1) timeStr = "Just now";

            const signals = c.fraud_score?.signals_fired || {};
            let topSignal = "Unknown Activity";
            let maxVal = -1;
            for (const [key, val] of Object.entries(signals)) {
              if (typeof val === 'number' && val > maxVal) {
                maxVal = val;
                topSignal = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              }
            }

            return {
              id: c.case_id,
              type: "new_case",
              title: `New ${c.fraud_score?.risk_level || 'UNKNOWN'} Risk Case`,
              risk: c.fraud_score?.risk_level?.toUpperCase() || "LOW",
              violation: topSignal,
              timestamp: timeStr,
              unread: true
            };
          });
          setNotifications(mapped.slice(0, 5));
        }
      })
      .catch(console.error);
  }, []);

  const saveApiKey = async () => {
    try {
      localStorage.setItem("GEMINI_API_KEY", geminiKey);
      await fetch("http://localhost:8000/api/commando/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_key: geminiKey })
      });
      setApiModalOpen(false);
      setKeyStatus(null);
    } catch (e) {
      console.error("Failed to save API key", e);
    }
  };

  const checkApiKey = async () => {
    if (!geminiKey) return;
    setKeyStatus({ loading: true, valid: false, message: "Checking..." });
    try {
      const res = await fetch("http://localhost:8000/api/commando/check_key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_key: geminiKey })
      });
      const data = await res.json();
      setKeyStatus({ loading: false, valid: data.valid, message: data.message });
    } catch (e) {
      setKeyStatus({ loading: false, valid: false, message: "Network error." });
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <ConnectionsModal isOpen={gatewayModalOpen} onClose={() => setGatewayModalOpen(false)} />
      <header className="flex h-[58px] shrink-0 items-center gap-2 border-b border-cyan/10 px-3 sm:gap-3 sm:px-4">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-commando'))}
          className="flex items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-[11px] font-bold tracking-widest text-cyan uppercase transition-colors hover:bg-cyan/20"
        >
          <span className="text-cyan animate-pulse">⚡</span>
          <span className="hidden sm:inline">Vigil OS Commando</span>
          <span className="sm:hidden">Commando</span>
        </button>
        <div className="flex-1" />

        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="glass relative grid h-9 w-9 place-items-center rounded-lg transition-colors hover:border-cyan/40"
            >
              <Bell size={16} className="text-cyan/80" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-[17px] w-[17px] place-items-center rounded-full bg-warning text-[9.5px] font-bold text-[#111]">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationsPopup 
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="glass flex items-center gap-2 rounded-lg px-2 py-[6px] transition-colors hover:border-cyan/40"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md border border-cyan/30 bg-cyan/10 text-[10.5px] font-bold text-cyan uppercase">{currentUser?.username?.substring(0, 2) || "CO"}</span>
              <span className="hidden text-[12px] text-foreground/90 sm:inline">{currentUser?.username || "Compliance Officer"}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {profileOpen ? (
              <div className="glass absolute right-0 z-30 mt-2 w-44 rounded-lg p-1 text-[12px]">
                <button onClick={() => { setProfileModalOpen(true); setProfileOpen(false); }} className="block w-full rounded-md px-2.5 py-1.5 text-left text-muted-foreground hover:bg-cyan/10 hover:text-foreground">Profile</button>
                <button className="block w-full rounded-md px-2.5 py-1.5 text-left text-muted-foreground hover:bg-cyan/10 hover:text-foreground">Preferences</button>
                <button 
                  onClick={() => { setApiModalOpen(true); setProfileOpen(false); }}
                  className="block w-full rounded-md px-2.5 py-1.5 text-left text-cyan hover:bg-cyan/10 hover:text-cyan/80 flex items-center gap-2"
                >
                  <Key size={12}/> API Settings
                </button>
                <button onClick={() => window.dispatchEvent(new Event('vigil-logout'))} className="block w-full rounded-md px-2.5 py-1.5 text-left text-muted-foreground hover:bg-cyan/10 hover:text-red-400">Sign out</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {apiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-[400px] rounded-lg p-6 relative">
            <button onClick={() => { setApiModalOpen(false); setKeyStatus(null); }} className="absolute right-4 top-4 text-white/50 hover:text-white">
              <X size={16} />
            </button>
            <h3 className="mb-4 text-lg font-bold text-cyan tracking-wide flex items-center gap-2"><Key size={18}/> API Settings</h3>
            <div className="mb-4">
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-widest">Gemini API Key</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIza..." 
                  className="flex-1 bg-[#050B14] border border-cyan/20 rounded p-2 text-white focus:outline-none focus:border-cyan"
                />
                <button 
                  onClick={checkApiKey}
                  className="bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/30 rounded px-3 text-xs font-bold tracking-widest transition-colors whitespace-nowrap"
                >
                  CHECK
                </button>
              </div>
              {keyStatus && (
                <div className={`mt-2 text-xs font-semibold ${keyStatus.loading ? 'text-white/60' : keyStatus.valid ? 'text-green-400' : 'text-red-400'}`}>
                  {keyStatus.message}
                </div>
              )}
            </div>
            <button 
              onClick={saveApiKey}
              className="w-full bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/40 rounded py-2 text-sm font-bold tracking-widest transition-colors mt-2"
            >
              SAVE CONFIGURATION
            </button>
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-[350px] rounded-lg p-6 relative border border-cyan/20">
            <button onClick={() => setProfileModalOpen(false)} className="absolute right-4 top-4 text-white/50 hover:text-white">
              <X size={16} />
            </button>
            <h3 className="mb-4 text-lg font-bold text-cyan tracking-wide flex items-center gap-2">User Profile</h3>
            {currentUser ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-cyan/10 border border-cyan/30 mb-3 text-2xl font-bold text-cyan uppercase">
                    {currentUser.username.substring(0, 2)}
                  </div>
                  <h4 className="text-xl font-bold">{currentUser.username}</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{currentUser.role || 'Compliance Officer'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#050B14] border border-cyan/10 p-3 rounded-lg text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Age</p>
                    <p className="font-mono text-white">{currentUser.age || 'N/A'}</p>
                  </div>
                  <div className="bg-[#050B14] border border-cyan/10 p-3 rounded-lg text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Clearance</p>
                    <p className="font-mono text-[#00e5ff]">Level 4</p>
                  </div>
                </div>
                <div className="bg-[#050B14] border border-cyan/10 p-3 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Email / Contact</p>
                    <p className="text-sm text-white">{currentUser.email || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active profile loaded.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}



