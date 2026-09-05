import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CaseQueue from './pages/CaseQueue';
import CaseRoom from './pages/CaseRoom';
import Investigations from './pages/Investigations';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Users from './pages/Users';
import TransactionData from './pages/TransactionData';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

import { Dashboard } from './components/vigilos/Dashboard';
import { Sidebar } from './components/vigilos/Sidebar';
import { TopHeader } from './components/vigilos/TopHeader';
import { VigilosHud } from './components/hud/VigilosHud';
import { X } from 'lucide-react';
import './index.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [commandoActive, setCommandoActive] = useState(false);
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('dashboard_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('dashboard_user');
      setAuth(null);
      setShowLanding(true);
    };
    const handleToggle = () => setCommandoActive(prev => !prev);
    
    window.addEventListener('vigil-logout', handleLogout);
    window.addEventListener('toggle-commando', handleToggle);
    return () => {
      window.removeEventListener('vigil-logout', handleLogout);
      window.removeEventListener('toggle-commando', handleToggle);
    };
  }, []);

  if (showLanding) {
    return <LandingPage onEnter={() => {
      setShowLanding(false);
      if (!auth) {
        setAuth({ user: 'demo', role: 'admin' });
        localStorage.setItem('dashboard_user', JSON.stringify({ user: 'demo', role: 'admin' }));
      }
    }} />;
  }

  if (!auth) {
    return <Login setAuth={setAuth} />;
  }

  return (
    <Router>
      <div className="app-bg flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden relative">
          <TopHeader />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/queue" element={
              <div className="flex flex-col gap-2 px-3 pt-2 pb-3 sm:px-4 h-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <CaseQueue />
              </div>
            } />
            <Route path="/case/:caseId" element={
              <div className="flex flex-col gap-2 px-3 pt-2 pb-3 sm:px-4 h-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <CaseRoom />
              </div>
            } />
          
            <Route path="/investigations" element={
              <div className="flex flex-col gap-2 px-3 pt-2 pb-3 sm:px-4 h-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <Investigations />
              </div>
            } />
            <Route path="/reports" element={
              <div className="flex flex-col gap-2 px-3 pt-2 pb-3 sm:px-4 h-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <Reports />
              </div>
            } />
            <Route path="/audit" element={
              <div className="flex flex-col gap-2 h-full w-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <AuditLogs />
              </div>
            } />
            <Route path="/transaction-data" element={
              <div className="flex flex-col gap-2 h-full w-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <TransactionData />
              </div>
            } />
            <Route path="/settings" element={
              <div className="flex flex-col gap-2 h-full w-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <Settings />
              </div>
            } />
            <Route path="/users" element={
              <div className="flex flex-col gap-2 h-full w-full overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <Users />
              </div>
            } />
          </Routes>
          
          {commandoActive && (
            <div className="absolute bottom-6 right-6 z-[9999] pointer-events-auto transform scale-50 origin-bottom-right drop-shadow-2xl">
              <button 
                onClick={() => setCommandoActive(false)}
                className="absolute -top-4 -right-4 z-10 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 hover:text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>
              <div className="bg-[#060608]/90 backdrop-blur-xl border border-cyan/20 rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.15)]">
                <div className="pointer-events-auto" style={{ width: '760px', height: '760px' }}>
                  <VigilosHud />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;



