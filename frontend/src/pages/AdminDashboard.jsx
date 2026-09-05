import React from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Server, Shield, Database, ShieldAlert, Cpu, 
  TrendingUp, TrendingDown, ClipboardList, Map, Globe, ShieldCheck, 
  Clock, CheckCircle, Search, ArrowUp, ArrowDown, Bell
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-3 w-full mx-auto text-white">
      <div>
        <h1 className="text-[12px] font-bold tracking-[0.2em] text-[#F5F7FA] uppercase mb-1">Command Overview</h1>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {/* Total Cases */}
        <div className="bg-[#050a11] border border-[rgba(0,229,255,0.3)] rounded-xl p-3 relative overflow-hidden flex flex-col justify-between h-[90px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#A7B4C5] font-semibold tracking-wider uppercase mb-1">Total Cases</span>
              <span className="text-[28px] font-bold text-white leading-none tracking-tight">247</span>
            </div>
            <div className="w-7 h-7 rounded-lg border border-[rgba(0,229,255,0.3)] flex items-center justify-center bg-[rgba(0,229,255,0.05)] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <ClipboardList size={14} className="text-[#00e5ff]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 relative z-10 mt-auto">
            <span className="text-[#00e676] text-[11px] font-bold flex items-center"><ArrowUp size={12} className="mr-0.5" /> 8%</span>
            <span className="text-[#A7B4C5] text-[10px]">vs yesterday</span>
          </div>
          <div className="absolute bottom-0 right-0 w-[55%] h-[55%] pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{v:10},{v:15},{v:12},{v:24},{v:18},{v:30},{v:22}]}>
                <defs>
                  <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#00e5ff" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCyan)" style={{filter: 'drop-shadow(0 0 4px rgba(0,229,255,0.6))'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="bg-[#050a11] border border-[rgba(124,58,237,0.3)] rounded-xl p-3 relative overflow-hidden flex flex-col justify-between h-[90px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#A7B4C5] font-semibold tracking-wider uppercase mb-1">Avg Risk Score</span>
              <span className="text-[28px] font-bold text-white leading-none tracking-tight">26.8%</span>
            </div>
            <div className="w-7 h-7 rounded-lg border border-[rgba(124,58,237,0.3)] flex items-center justify-center bg-[rgba(124,58,237,0.05)] shadow-[0_0_10px_rgba(124,58,237,0.2)]">
              <Activity size={14} className="text-[#7C3AED]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 relative z-10 mt-auto">
            <span className="text-[#00e676] text-[11px] font-bold flex items-center"><ArrowUp size={12} className="mr-0.5" /> 4.2%</span>
            <span className="text-[#A7B4C5] text-[10px]">vs yesterday</span>
          </div>
          <div className="absolute bottom-0 right-0 w-[55%] h-[55%] pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{v:5},{v:12},{v:8},{v:16},{v:10},{v:20},{v:14}]}>
                <defs>
                  <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPurple)" style={{filter: 'drop-shadow(0 0 4px rgba(124,58,237,0.6))'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Open Investigations */}
        <div className="bg-[#050a11] border border-[rgba(0,102,255,0.3)] rounded-xl p-3 relative overflow-hidden flex flex-col justify-between h-[90px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#A7B4C5] font-semibold tracking-wider uppercase mb-1">Open Investigations</span>
              <span className="text-[28px] font-bold text-white leading-none tracking-tight">42</span>
            </div>
            <div className="w-7 h-7 rounded-lg border border-[rgba(0,102,255,0.3)] flex items-center justify-center bg-[rgba(0,102,255,0.05)] shadow-[0_0_10px_rgba(0,102,255,0.2)]">
              <Search size={14} className="text-[#0066ff]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 relative z-10 mt-auto">
            <span className="text-[#00e676] text-[11px] font-bold flex items-center"><ArrowUp size={12} className="mr-0.5" /> 12%</span>
            <span className="text-[#A7B4C5] text-[10px]">vs yesterday</span>
          </div>
          <div className="absolute bottom-0 right-0 w-[55%] h-[55%] pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{v:2},{v:6},{v:4},{v:10},{v:5},{v:12},{v:9}]}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066ff" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#0066ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#0066ff" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBlue)" style={{filter: 'drop-shadow(0 0 4px rgba(0,102,255,0.6))'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escalated Cases */}
        <div className="bg-[#050a11] border border-[rgba(255,145,0,0.3)] rounded-xl p-3 relative overflow-hidden flex flex-col justify-between h-[90px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#A7B4C5] font-semibold tracking-wider uppercase mb-1">Escalated Cases</span>
              <span className="text-[28px] font-bold text-white leading-none tracking-tight">6</span>
            </div>
            <div className="w-7 h-7 rounded-lg border border-[rgba(255,145,0,0.3)] flex items-center justify-center bg-[rgba(255,145,0,0.05)] shadow-[0_0_10px_rgba(255,145,0,0.2)]">
              <ShieldAlert size={14} className="text-[#ff9100]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 relative z-10 mt-auto">
            <span className="text-[#ff3d00] text-[11px] font-bold flex items-center"><ArrowDown size={12} className="mr-0.5" /> 1</span>
            <span className="text-[#A7B4C5] text-[10px]">vs yesterday</span>
          </div>
          <div className="absolute bottom-0 right-0 w-[55%] h-[55%] pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{v:8},{v:5},{v:7},{v:4},{v:6},{v:2},{v:3}]}>
                <defs>
                  <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff9100" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#ff9100" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#ff9100" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOrange)" style={{filter: 'drop-shadow(0 0 4px rgba(255,145,0,0.6))'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Main Command Center Feature (spans 2 cols) */}
        <div className="col-span-2 bg-[rgba(10,17,26,0.6)] border border-[rgba(0,229,255,0.2)] rounded-xl relative overflow-hidden flex backdrop-blur-md p-3" style={{boxShadow: '0 0 30px rgba(0,229,255,0.05) inset'}}>
          <div className="text-[12px] text-[#F5F7FA] font-bold tracking-widest uppercase absolute top-3 left-5">Command Center</div>
          
          <div className="w-[45%] relative flex items-center justify-center">
            {/* Simple globe mock for now using css radial gradients */}
            <div className="w-40 h-40 rounded-full border border-[rgba(0,229,255,0.3)] shadow-[0_0_50px_rgba(0,229,255,0.2)] relative flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.15)_0%,transparent_70%)] overflow-hidden">
               {/* Globe lines mock */}
               <div className="absolute w-full h-[1px] bg-[rgba(0,229,255,0.4)] rotate-45"></div>
               <div className="absolute h-full w-[1px] bg-[rgba(0,229,255,0.4)] rotate-45"></div>
               <div className="absolute w-[200%] h-[200%] border border-[rgba(0,229,255,0.3)] rounded-[50%] scale-x-50"></div>
               <div className="absolute w-[200%] h-[200%] border border-[rgba(0,229,255,0.3)] rounded-[50%] scale-y-50"></div>
               {/* Dots representing connections */}
               <div className="absolute w-1.5 h-1.5 bg-[#00e5ff] rounded-full top-1/4 left-1/3 shadow-[0_0_8px_#00e5ff]"></div>
               <div className="absolute w-1 h-1 bg-[#7C3AED] rounded-full top-1/2 left-2/3 shadow-[0_0_8px_#7C3AED]"></div>
               <div className="absolute w-2 h-2 bg-[#00e5ff] rounded-full bottom-1/3 left-1/2 shadow-[0_0_10px_#00e5ff]"></div>
            </div>
          </div>
          
          <div className="w-[55%] flex flex-col justify-center pl-4">
            <h2 className="text-xl font-bold mb-3 tracking-wide text-white">VigilOS Command Center</h2>
            <div className="text-[#A7B4C5] mb-1 tracking-wide text-[11px]">Intelligence. Investigation. Impact.</div>
            <div className="w-20 h-0.5 bg-[#00e5ff] mb-3 shadow-[0_0_10px_#00e5ff]"></div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="flex justify-center mb-1"><ClipboardList size={16} className="text-[#00e5ff]" /></div>
                <div className="font-bold text-xl mb-1 text-white">247</div>
                <div className="text-[10px] text-[#F5F7FA] uppercase mb-1 font-semibold">Total Cases</div>
                <div className="text-[11px] text-[#00e676] font-bold flex items-center justify-center"><ArrowUp size={10} className="mr-0.5"/> 8%</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1"><Activity size={16} className="text-[#00e5ff]" /></div>
                <div className="font-bold text-xl mb-1 text-white">26.8%</div>
                <div className="text-[10px] text-[#F5F7FA] uppercase mb-1 font-semibold">Avg Risk Score</div>
                <div className="text-[11px] text-[#00e676] font-bold flex items-center justify-center"><ArrowUp size={10} className="mr-0.5"/> 4.2%</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1"><Search size={16} className="text-[#00e5ff]" /></div>
                <div className="font-bold text-xl mb-1 text-white">42</div>
                <div className="text-[10px] text-[#F5F7FA] uppercase mb-1 font-semibold">Open Investigations</div>
                <div className="text-[11px] text-[#00e676] font-bold flex items-center justify-center"><ArrowUp size={10} className="mr-0.5"/> 12%</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1"><ShieldAlert size={16} className="text-[#ff9100]" /></div>
                <div className="font-bold text-xl text-white mb-1">6</div>
                <div className="text-[10px] text-[#F5F7FA] uppercase mb-1 font-semibold">Escalated Cases</div>
                <div className="text-[11px] text-[#ff3d00] font-bold flex items-center justify-center"><ArrowDown size={10} className="mr-0.5"/> 1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stack: System Health & Model Perf */}
        <div className="flex flex-col gap-3">
          <div className="bg-[rgba(10,17,26,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 h-[48%] flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
            <div className="text-[11px] text-[#F5F7FA] font-bold tracking-widest uppercase mb-1">System Health</div>
            <div className="flex-1 flex justify-between items-center relative z-10 pl-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 justify-between w-36">
                  <div className="flex items-center gap-2"><Database size={14} className="text-[#00e5ff]" /> <span className="text-[13px] text-[#F5F7FA]">MongoDB</span></div>
                  <div className="flex items-center gap-2 text-[11px] text-[#F5F7FA]"><span className="w-2.5 h-2.5 rounded-full bg-[#00e676] shadow-[0_0_8px_#00e676]"></span> Online</div>
                </div>
                <div className="flex items-center gap-3 justify-between w-36">
                  <div className="flex items-center gap-2"><Database size={14} className="text-[#00e5ff]" /> <span className="text-[13px] text-[#F5F7FA]">Neo4j</span></div>
                  <div className="flex items-center gap-2 text-[11px] text-[#F5F7FA]"><span className="w-2.5 h-2.5 rounded-full bg-[#00e676] shadow-[0_0_8px_#00e676]"></span> Online</div>
                </div>
                <div className="flex items-center gap-3 justify-between w-36">
                  <div className="flex items-center gap-2"><Database size={14} className="text-[#00e5ff]" /> <span className="text-[13px] text-[#F5F7FA]">ChromaDB</span></div>
                  <div className="flex items-center gap-2 text-[11px] text-[#F5F7FA]"><span className="w-2.5 h-2.5 rounded-full bg-[#00e676] shadow-[0_0_8px_#00e676]"></span> Online</div>
                </div>
              </div>
              
              <div className="relative w-24 h-24 flex items-center justify-center mr-2">
                <div className="absolute inset-0 rounded-full border border-[rgba(0,229,255,0.1)]"></div>
                <div className="absolute inset-3 rounded-full border border-[rgba(0,229,255,0.15)]"></div>
                <div className="absolute inset-6 rounded-full border border-[rgba(0,229,255,0.2)]"></div>
                <div className="absolute w-full h-[1px] bg-[rgba(0,229,255,0.1)]"></div>
                <div className="absolute h-full w-[1px] bg-[rgba(0,229,255,0.1)]"></div>
                <div className="w-2 h-2 bg-[#00e5ff] rounded-full shadow-[0_0_10px_#00e5ff]"></div>
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(0,229,255,0.3))] animate-spin" style={{animationDuration: '3s'}}></div>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(10,17,26,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 h-[48%] flex flex-col justify-between backdrop-blur-md">
            <div className="text-[11px] text-[#F5F7FA] font-bold tracking-widest uppercase mb-1">Model Performance (XGBoost)</div>
            <div className="h-20 w-full mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{v:0.8},{v:0.85},{v:0.82},{v:0.9},{v:0.87},{v:0.95},{v:0.92}]}>
                  <Line type="monotone" dataKey="v" stroke="#00e5ff" strokeWidth={2} dot={{r:3, fill:'#00e5ff', strokeWidth:0}} />
                  <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} dot={{r:3, fill:'#7C3AED', strokeWidth:0}} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="text-[10px] text-[#A7B4C5] uppercase mb-1">Precision</div>
                <div className="text-[#00e5ff] font-bold text-[11px] leading-none">0.8624</div>
              </div>
              <div>
                <div className="text-[10px] text-[#A7B4C5] uppercase mb-1">Recall</div>
                <div className="text-[#00e5ff] font-bold text-[11px] leading-none">0.9957</div>
              </div>
              <div>
                <div className="text-[10px] text-[#A7B4C5] uppercase mb-1">F1 Score</div>
                <div className="text-[#7C3AED] font-bold text-[11px] leading-none">0.9243</div>
              </div>
              <div>
                <div className="text-[10px] text-[#A7B4C5] uppercase mb-1">AUC-ROC</div>
                <div className="text-[#7C3AED] font-bold text-[11px] leading-none">0.9993</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[rgba(10,17,26,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 backdrop-blur-md">
          <div className="text-[11px] text-[#F5F7FA] font-bold tracking-widest uppercase mb-1">Risk Distribution</div>
          <div className="flex items-center h-24">
            <div className="w-1/2 h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{v:52, c:'#ff3d00'}, {v:93, c:'#ffc400'}, {v:102, c:'#00e676'}]} 
                    dataKey="v" innerRadius={35} outerRadius={50} stroke="none" startAngle={90} endAngle={-270}>
                    {[{v:52, c:'#ff3d00'}, {v:93, c:'#ffc400'}, {v:102, c:'#00e676'}].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.c} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-white">247</div>
                <div className="text-[12px] text-[#F5F7FA]">Total</div>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-3 pl-4">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-white"><div className="w-2.5 h-2.5 rounded-full bg-[#ff3d00]"></div> High Risk</div>
                <div className="text-[#A7B4C5]">52 (21.1%)</div>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-white"><div className="w-2.5 h-2.5 rounded-full bg-[#ffc400]"></div> Medium Risk</div>
                <div className="text-[#A7B4C5]">93 (37.7%)</div>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-white"><div className="w-2.5 h-2.5 rounded-full bg-[#00e676]"></div> Low Risk</div>
                <div className="text-[#A7B4C5]">102 (41.3%)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(10,17,26,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 backdrop-blur-md">
          <div className="text-[11px] text-[#F5F7FA] font-bold tracking-widest uppercase mb-1">Decision Distribution</div>
          <div className="flex items-center h-24">
            <div className="w-5/12 h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{v:234, c:'#00e5ff'}, {v:13, c:'rgba(0,229,255,0.1)'}]} 
                    dataKey="v" innerRadius={35} outerRadius={50} stroke="none" startAngle={90} endAngle={-270}>
                    {[{v:234, c:'#00e5ff'}, {v:13, c:'rgba(0,229,255,0.1)'}].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.c} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-white">94.7%</div>
                <div className="text-[12px] text-[#F5F7FA]">Pending</div>
              </div>
            </div>
            <div className="w-7/12 flex flex-col gap-3 pl-4">
              <div>
                <div className="flex justify-between text-[13px] mb-1 text-white">
                  <span>Pending</span>
                  <span className="text-[#A7B4C5]">234 (94.7%)</span>
                </div>
                <div className="h-2 w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00e5ff]" style={{width: '94.7%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[13px] mb-1 text-white">
                  <span>Escalate</span>
                  <span className="text-[#A7B4C5]">9 (3.6%)</span>
                </div>
                <div className="h-2 w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7C3AED]" style={{width: '3.6%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[13px] mb-1 text-white">
                  <span>Block</span>
                  <span className="text-[#A7B4C5]">4 (1.7%)</span>
                </div>
                <div className="h-2 w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff3d00]" style={{width: '1.7%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(10,17,26,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 backdrop-blur-md">
          <div className="text-[11px] text-[#F5F7FA] font-bold tracking-widest uppercase mb-1">Risk Trend (Last 7 Days)</div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                {name: 'May 13', high: 65, med: 20, low: 10},
                {name: 'May 14', high: 70, med: 35, low: 15},
                {name: 'May 15', high: 60, med: 30, low: 12},
                {name: 'May 16', high: 55, med: 25, low: 20},
                {name: 'May 17', high: 75, med: 40, low: 18},
                {name: 'May 18', high: 65, med: 30, low: 25},
                {name: 'May 19', high: 80, med: 45, low: 30}
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#A7B4C5'}} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{fontSize: 10, fill: '#A7B4C5'}} axisLine={false} tickLine={false} width={25} />
                <Line type="monotone" dataKey="high" stroke="#ff3d00" strokeWidth={2} dot={{r:3, fill:'#ff3d00', strokeWidth:0}} />
                <Line type="monotone" dataKey="med" stroke="#ffc400" strokeWidth={2} dot={{r:3, fill:'#ffc400', strokeWidth:0}} />
                <Line type="monotone" dataKey="low" stroke="#00e676" strokeWidth={2} dot={{r:3, fill:'#00e676', strokeWidth:0}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-[11px] text-white"><span className="w-2.5 h-2.5 rounded-full bg-[#ff3d00]"></span> High Risk</div>
            <div className="flex items-center gap-2 text-[11px] text-white"><span className="w-2.5 h-2.5 rounded-full bg-[#ffc400]"></span> Medium Risk</div>
            <div className="flex items-center gap-2 text-[11px] text-white"><span className="w-2.5 h-2.5 rounded-full bg-[#00e676]"></span> Low Risk</div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[rgba(10,17,26,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 backdrop-blur-md flex flex-col h-[190px]">
          <div className="text-[11px] text-[#F5F7FA] font-bold tracking-widest uppercase mb-1">Recent Activity</div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[#A7B4C5] border-b border-[rgba(255,255,255,0.05)]">
                  <th className="pb-2 font-semibold">Case ID</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Risk Score</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Assigned To</th>
                  <th className="pb-2 font-semibold">Last Updated</th>
                </tr>
              </thead>
              <tbody className="text-[#F5F7FA]">
                <tr className="border-b border-[rgba(255,255,255,0.02)]">
                  <td className="py-2 font-mono text-[11px]">CASE-2024-0519-001</td>
                  <td className="py-2">Transaction Fraud</td>
                  <td className="py-2">87.4%</td>
                  <td className="py-2"><span className="px-2.5 py-1 rounded border border-[rgba(255,61,0,0.3)] text-[#ff3d00] text-[11px] font-bold flex items-center w-max gap-1.5"><span className="w-1.5 h-1.5 rounded-full border border-current"></span> High</span></td>
                  <td className="py-2 text-[#A7B4C5]">Analyst-07</td>
                  <td className="py-2 text-[#A7B4C5]">2 min ago</td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.02)]">
                  <td className="py-2 font-mono text-[11px]">CASE-2024-0519-002</td>
                  <td className="py-2">Account Takeover</td>
                  <td className="py-2">62.1%</td>
                  <td className="py-2"><span className="px-2.5 py-1 rounded border border-[rgba(255,196,0,0.3)] text-[#ffc400] text-[11px] font-bold flex items-center w-max gap-1.5"><span className="w-1.5 h-1.5 rounded-full border border-current"></span> Medium</span></td>
                  <td className="py-2 text-[#A7B4C5]">Analyst-12</td>
                  <td className="py-2 text-[#A7B4C5]">8 min ago</td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.02)]">
                  <td className="py-2 font-mono text-[11px]">CASE-2024-0519-003</td>
                  <td className="py-2">Money Mule</td>
                  <td className="py-2">34.2%</td>
                  <td className="py-2"><span className="px-2.5 py-1 rounded border border-[rgba(0,230,118,0.3)] text-[#00e676] text-[11px] font-bold flex items-center w-max gap-1.5"><span className="w-1.5 h-1.5 rounded-full border border-current"></span> Low</span></td>
                  <td className="py-2 text-[#A7B4C5]">Analyst-03</td>
                  <td className="py-2 text-[#A7B4C5]">15 min ago</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-[11px]">CASE-2024-0519-004</td>
                  <td className="py-2">Phishing</td>
                  <td className="py-2">73.5%</td>
                  <td className="py-2"><span className="px-2.5 py-1 rounded border border-[rgba(255,61,0,0.3)] text-[#ff3d00] text-[11px] font-bold flex items-center w-max gap-1.5"><span className="w-1.5 h-1.5 rounded-full border border-current"></span> High</span></td>
                  <td className="py-2 text-[#A7B4C5]">Analyst-09</td>
                  <td className="py-2 text-[#A7B4C5]">18 min ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[rgba(10,17,26,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 backdrop-blur-md flex flex-col h-[190px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-1 relative z-10">
            <div className="text-[11px] text-[#F5F7FA] font-bold tracking-widest uppercase">Threat Map</div>
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-[11px] flex items-center gap-2 cursor-pointer text-[#F5F7FA]">
              Global View <svg className="w-3.5 h-3.5 text-[#A7B4C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <div className="flex-1 relative rounded-lg overflow-hidden border border-[rgba(0,229,255,0.05)] bg-[rgba(0,0,0,0.3)]">
             <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.15)_0%,transparent_80%)]">
               <div className="w-full h-full relative" style={{backgroundImage: 'radial-gradient(rgba(0,229,255,0.2) 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
