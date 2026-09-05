import React from 'react';
import { Settings } from 'lucide-react';

export default function SystemSettings() {
  return (
    <div className="flex flex-col h-full w-full bg-[#060608] text-white p-6 relative">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-[#00e5ff]" size={28} />
        <h1 className="text-2xl font-bold tracking-wider">System Settings</h1>
      </div>
      
      <div className="bg-[#0a0f18] rounded-xl border border-[rgba(0,229,255,0.2)] p-6 shadow-[0_4px_20px_rgba(0,229,255,0.05)] max-w-2xl">
        <h2 className="text-lg font-semibold text-[#00e5ff] mb-4 border-b border-[rgba(0,229,255,0.1)] pb-2">Modules Configuration</h2>
        
        <div className="flex items-center justify-between py-4 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400 mt-1">No additional configurations available.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
