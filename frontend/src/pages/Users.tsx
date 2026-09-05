import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, Search } from 'lucide-react';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/dashboard_users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#060608] text-white p-6 relative">
      <div className="flex items-center gap-3 mb-6">
        <UsersIcon className="text-[#00e5ff]" size={28} />
        <h1 className="text-2xl font-bold tracking-wider">System Users</h1>
      </div>
      
      <div className="bg-[#0a0f18] rounded-xl border border-[rgba(0,229,255,0.2)] p-6 shadow-[0_4px_20px_rgba(0,229,255,0.05)] flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Registered Clearance Personnel</h2>
            <div className="flex items-center gap-2 bg-[#050B14] border border-cyan/20 px-3 py-1.5 rounded-lg text-sm">
                <Search size={14} className="text-cyan/50" />
                <input type="text" placeholder="Search operatives..." className="bg-transparent focus:outline-none text-white w-48 placeholder:text-white/30" />
            </div>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin text-cyan rounded-full h-8 w-8 border-b-2 border-cyan"></div></div>
            ) : (
                <div className="grid gap-4">
                    {users.map((u, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#060608] border border-white/5 p-4 rounded-lg hover:border-cyan/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan/10 border border-cyan/30 text-lg font-bold text-cyan uppercase shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                                    {u.username.substring(0, 2)}
                                </div>
                                <div>
                                    <h4 className="text-md font-bold text-white">{u.username}</h4>
                                    <p className="text-xs text-muted-foreground">{u.email || 'No email provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Age</span>
                                    <span className="font-mono text-white">{u.age || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Role / Clearance</span>
                                    <span className="text-cyan flex items-center gap-1"><Shield size={12}/> {u.role || 'Compliance Officer'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No clearance personnel registered in the database.
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
