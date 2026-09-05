import React from 'react';
import { ArrowRight, Star, Quote, Shield } from 'lucide-react';

export default function LandingPage({ onEnter }) {
  return (
    <div 
      className="relative w-full min-h-screen text-[#1A3C2B] font-sans selection:bg-[#FF8C69] selection:text-white cursor-pointer overflow-x-hidden"
      onClick={onEnter}
      style={{ backgroundColor: '#F7F7F5' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap');
        
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'General Sans', sans-serif; }

        .border-grid { border-color: rgba(58,58,56,0.2); }
        .bg-paper { background-color: #F7F7F5; }
        
        .mosaic-bg {
          background-image: linear-gradient(rgba(58,58,56,0.2) 0.5px, transparent 0.5px),
                            linear-gradient(90deg, rgba(58,58,56,0.2) 0.5px, transparent 0.5px);
          background-size: 64px 64px;
          background-position: center center;
        }

        .l-blend {
          mix-blend-mode: luminosity;
          opacity: 0.9;
          transition: all 0.3s ease-out;
        }
        .l-blend:hover {
          mix-blend-mode: normal;
          opacity: 1;
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-orbit {
          animation: orbit 20s linear infinite;
        }
      `}</style>

      {/* Mosaic Background Overlay */}
      <div className="absolute inset-0 mosaic-bg pointer-events-none opacity-50 z-0"></div>

      {/* Technical Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-grid bg-[#F7F7F5]/90 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#1A3C2B] flex items-center justify-center rounded-sm">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-grotesk font-bold tracking-widest text-lg">VIGILOS</span>
        </div>
        <div className="hidden md:flex gap-8 font-mono text-[10px] uppercase tracking-widest">
          <span className="hover:text-[#FF8C69] transition-colors cursor-pointer">01. Architecture</span>
          <span className="hover:text-[#9EFFBF] transition-colors cursor-pointer">02. Topologies</span>
          <span className="hover:text-[#F4D35E] transition-colors cursor-pointer">03. Synthesis</span>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-grid font-mono text-[10px] uppercase tracking-widest rounded-sm hover:bg-black/5 transition-colors">
            Documentation
          </button>
          <button className="px-4 py-2 bg-[#1A3C2B] text-white font-mono text-[10px] uppercase tracking-widest rounded-sm hover:bg-[#1A3C2B]/90 transition-colors">
            Initialize
          </button>
        </div>
      </nav>

      {/* Status Badge */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 flex justify-center md:justify-start">
        <div className="inline-flex items-center gap-3 border border-grid px-3 py-1 bg-[#F7F7F5]">
          <div className="w-2 h-2 bg-[#1A3C2B]"></div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">System Optimal / 99.9% Uptime</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="font-grotesk font-bold text-6xl md:text-8xl leading-[0.9] tracking-tighter text-[#1A3C2B]">
            EXPOSE <br/> THE UNSEEN.
          </h1>
          <div className="flex gap-4 items-stretch mt-4">
            <div className="w-[1px] bg-grid"></div>
            <p className="font-mono text-sm uppercase tracking-widest text-[#1A3C2B]/80 max-w-md leading-relaxed">
              Predictive structural analysis for zero-day money laundering. We trace the un-traceable financial networks before they execute.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#FF8C69] text-[#1A3C2B] px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#FF8C69]/90 transition-colors">
              Deploy VigilOS <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Abstract Graphic */}
        <div className="flex-1 flex justify-center w-full">
          <div className="relative w-full max-w-[450px] aspect-square border border-grid bg-[#F7F7F5] flex items-center justify-center p-8">
            <div className="absolute inset-4 border border-dashed border-grid rounded-full animate-orbit">
                {/* Orbiting nodes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#FF8C69]"></div>
                <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-3 h-3 bg-[#9EFFBF]"></div>
                <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-3 h-3 bg-[#F4D35E]"></div>
            </div>
            {/* Center Node */}
            <div className="w-16 h-16 bg-[#1A3C2B] z-10 flex items-center justify-center shadow-none rounded-sm">
                <Shield className="text-white" size={24} />
            </div>
            {/* Background connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <line x1="50%" y1="50%" x2="50%" y2="0" stroke="#1A3C2B" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="10%" y2="75%" stroke="#1A3C2B" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="90%" y2="75%" stroke="#1A3C2B" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </section>

      {/* Border Divider */}
      <div className="w-full h-[1px] bg-grid"></div>

      {/* Bento Feature Grid */}
      <section className="relative z-10 w-full max-w-7xl mx-auto bg-grid p-[1px] my-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px]">
          
          <div className="bg-[#F7F7F5] p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#FF8C69]"></div>
              <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Heuristic Mapping</h3>
            </div>
            <p className="font-sans text-[#1A3C2B]/80 text-lg">
              Dynamic multi-hop network graphing to detect synthetic identities and mule rings instantly.
            </p>
            <div className="mt-auto border border-grid p-4 bg-white/50">
              <code className="font-mono text-xs text-[#1A3C2B]">
                &gt; TARGET: Node-7A9<br/>
                &gt; HOP_COUNT: 3<br/>
                <span className="text-[#FF8C69]">&gt; RISK_SCORE: 0.98 [CRITICAL]</span>
              </code>
            </div>
          </div>

          <div className="bg-[#F7F7F5] p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#9EFFBF]"></div>
              <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Regulatory Sync</h3>
            </div>
            <p className="font-sans text-[#1A3C2B]/80 text-lg">
              Real-time FATF and RBI guideline enforcement powered by localized ChromaDB vector reasoning.
            </p>
            <div className="mt-auto flex gap-2">
              <div className="px-2 py-1 bg-[#1A3C2B] text-[#9EFFBF] font-mono text-[10px] uppercase">FATF v2.4</div>
              <div className="px-2 py-1 border border-grid font-mono text-[10px] uppercase">Synced: 0ms</div>
            </div>
          </div>

          <div className="bg-[#F7F7F5] p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#F4D35E]"></div>
              <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Automated SARs</h3>
            </div>
            <p className="font-sans text-[#1A3C2B]/80 text-lg">
              One-click generation of fully compliant Suspicious Activity Reports backed by irrefutable timeline ledgers.
            </p>
            <div className="mt-auto h-24 border border-grid flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center l-blend">
              <div className="bg-[#F7F7F5] px-4 py-2 border border-grid font-mono text-xs font-bold uppercase">
                Preview Document
              </div>
            </div>
          </div>

          <div className="bg-[#F7F7F5] p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#1A3C2B]"></div>
              <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Commando Mode</h3>
            </div>
            <p className="font-sans text-[#1A3C2B]/80 text-lg">
              Deploy autonomous AI agents to investigate sprawling networks while you focus on the verdict.
            </p>
            <div className="mt-auto">
              <div className="border border-grid border-b-0 px-4 py-2 bg-[#1A3C2B] text-white font-mono text-[10px]">ACTIVE_AGENTS: 4</div>
              <div className="border border-grid px-4 py-2 font-mono text-[10px]">STATUS: Investigating cluster #882...</div>
            </div>
          </div>

        </div>
      </section>

      {/* Border Divider */}
      <div className="w-full h-[1px] bg-grid"></div>

      {/* Testimonial & Form Area */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row gap-16 items-center">
        
        {/* Monospaced Testimonial Card */}
        <div className="w-full max-w-sm border border-grid bg-[#F7F7F5] flex flex-col rounded-sm">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Quote size={16} className="text-[#1A3C2B]" />
              <div className="flex gap-1 text-[#F4D35E]">
                {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
              </div>
            </div>
            <p className="font-mono text-xs leading-[1.6] text-[#1A3C2B]/90">
              "VigilOS reduced our false-positive rate by 84% within the first month. The topological graph reveals laundering layers we simply could not see before."
            </p>
          </div>
          <div className="border-t border-grid p-4 flex items-center gap-4 bg-white/30">
            <div className="w-10 h-10 bg-[#1A3C2B] l-blend bg-[url('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100')] bg-cover"></div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase">Marcus R.</span>
              <span className="font-mono text-[10px] text-[#1A3C2B]/60 uppercase">Chief Compliance Officer</span>
            </div>
          </div>
        </div>

        {/* Technical Form CTA */}
        <div className="flex-1 flex justify-center w-full">
          <div className="relative w-full max-w-[640px] border border-grid bg-[#F7F7F5] p-12">
            {/* Corner Markers */}
            <div className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t border-l border-[#1A3C2B]"></div>
            <div className="absolute top-[-1px] right-[-1px] w-2.5 h-2.5 border-t border-r border-[#1A3C2B]"></div>
            <div className="absolute bottom-[-1px] left-[-1px] w-2.5 h-2.5 border-b border-l border-[#1A3C2B]"></div>
            <div className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b border-r border-[#1A3C2B]"></div>

            <div className="flex flex-col gap-8 text-center items-center">
              <h2 className="font-grotesk font-bold text-4xl tracking-tight">INITIALIZE SYSTEM</h2>
              <p className="font-mono text-xs uppercase tracking-widest text-[#1A3C2B]/70 mb-4">
                Click anywhere to enter the dashboard.
              </p>
              <button 
                className="w-full max-w-xs py-4 bg-[#1A3C2B] text-[#9EFFBF] font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#1A3C2B]/90 transition-colors"
                onClick={(e) => { e.stopPropagation(); onEnter(); }}
              >
                ACCESS DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-grid px-6 py-6 bg-[#F7F7F5] flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-[#1A3C2B]/60">
        <span>© 2026 VigilOS System. All rights reserved.</span>
        <span>Secure. Deterministic. Precise.</span>
      </footer>

    </div>
  );
}
