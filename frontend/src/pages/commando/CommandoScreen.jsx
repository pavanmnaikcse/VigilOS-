import React from 'react';
import { VigilosHud } from '../../components/hud/VigilosHud';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CommandoScreen() {
  return (
    <div className="w-screen h-screen bg-[#060608] overflow-hidden text-white font-sans relative">
      <VigilosHud />
      
      <div className="absolute top-6 right-6 z-50">
        <Link 
          to="/investigations" 
          className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50 transition-all text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Return to VigilOS
        </Link>
      </div>
    </div>
  );
}
