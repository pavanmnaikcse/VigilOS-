import React from 'react';
import { Shield } from 'lucide-react';

const ShieldFooter = () => {
  return (
    <div className="flex justify-between items-center px-8 py-4 bg-[#080d14] border-t border-[#1e293b] text-slate-400 text-sm mt-auto">
      <div className="flex items-center gap-2">
        <Shield size={16} className="text-slate-500" />
        <span>Secure. Intelligent. Vigilant.</span>
      </div>
      <div>
        Timestamp: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
      </div>
    </div>
  );
};

export default ShieldFooter;
