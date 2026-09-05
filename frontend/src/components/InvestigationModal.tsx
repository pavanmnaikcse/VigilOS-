import React, { useState, useEffect } from 'react';
import { 
  Download, BarChart2, User, Share2, Clock, ShieldAlert, Folder, LineChart, Mail, Check, X, ClipboardCheck, ArrowRight, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const ALL_STEPS = [
  { id: 'Transaction Ingestion', title: 'Transaction Ingestion', desc: 'Transaction investigation started', icon: Download, agent: 'System Gateway' },
  { id: 'Risk Analysis', title: 'Risk Analysis', desc: 'Risk analysis started', icon: BarChart2, agent: 'Fraud Scorer Agent' },
  { id: 'Behavior Analysis', title: 'Behavior Analysis', desc: 'Behavior analysis started', icon: User, agent: 'Message Analyzer Agent' },
  { id: 'Network Analysis', title: 'Network Analysis', desc: 'Network analysis started', icon: Share2, agent: 'Ring Detector Agent' },
  { id: 'Timeline Reconstruction', title: 'Timeline Reconstruction', desc: 'Timeline reconstruction started', icon: Clock, agent: 'Timeline Agent' },
  { id: 'Compliance Analysis', title: 'Compliance Analysis', desc: 'Compliance analysis started', icon: ShieldAlert, agent: 'Compliance Agent' },
  { id: 'Case Creation', title: 'Case Creation', desc: 'Case creation started', icon: Folder, agent: 'Correlator Agent' },
  { id: 'Neo4j Network Build', title: 'Neo4j Network Build', desc: 'Neo4j network build started', icon: LineChart, agent: 'Graph Builder Agent' },
  { id: 'Email Notification', title: 'Email Notification', desc: 'Email alert sent to compliance officer', icon: Mail, agent: 'Orchestrator Agent' },
];

export function InvestigationModal({ transaction, onClose }: { transaction: any, onClose: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [stepTimes, setStepTimes] = useState<Record<string, string>>({});
  const [stepDetails, setStepDetails] = useState<Record<string, any>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalCaseId, setFinalCaseId] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string>("00:00:00");
  const [startTime] = useState(Date.now());

  const navigate = useNavigate();

  useEffect(() => {
    let source: EventSource | null = null;
    let timer: NodeJS.Timeout | null = null;

    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      setTotalTime(`00:${mins}:${secs}`);
    }, 1000);

    const startPipeline = async () => {
      try {
        const res = await api.post('/investigate_async', {
          transaction: transaction
        });
        const invId = res.data.investigation_id;

        source = new EventSource(`http://localhost:8000/api/investigation/${invId}/stream`);
        
        source.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.status === 'completed' && data.case_file) {
            setIsCompleted(true);
            setFinalCaseId(data.case_file.case_id);
            setTotalTime(String(data.time_taken) + "s");
            if (timer) clearInterval(timer);
            if (source) source.close();
          } else if (data.name) {
            setCompletedSteps((prev) => [...prev, data.name]);
            setStepTimes((prev) => ({
              ...prev,
              [data.name]: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute:'2-digit', second:'2-digit' })
            }));
            if (data.details) {
              setStepDetails((prev) => ({
                ...prev,
                [data.name]: data.details
              }));
            }
          }
        };

      } catch (err) {
        console.error("Failed to start investigation", err);
      }
    };

    startPipeline();

    return () => {
      if (source) source.close();
      if (timer) clearInterval(timer);
    };
  }, [transaction]);

  const toggleExpand = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto scrollbar-hide">
      <div className="bg-[#0b111a] border border-[#1e293b] rounded-xl shadow-2xl w-full max-w-3xl my-8 relative max-h-[90vh] overflow-y-auto scrollbar-hide overflow-x-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#64748b] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded bg-[rgba(0,255,170,0.1)] text-[#00ffaa] flex items-center justify-center border border-[rgba(0,255,170,0.2)]">
              <ClipboardCheck size={16} />
            </div>
            <h2 className="text-lg font-bold text-[#00ffaa]">Step-by-Step Investigation</h2>
          </div>

          <div className="relative border border-[#1e293b] rounded-xl bg-[#0f1520] p-6 pb-2">
            <div className="absolute left-[38px] top-[40px] bottom-[40px] w-px bg-[#1e293b] z-0"></div>

            <div className="flex flex-col gap-0 z-10 relative">
              {ALL_STEPS.map((step, index) => {
                const isDone = completedSteps.includes(step.id);
                const isCurrent = completedSteps.length === index;
                const Icon = step.icon;
                const details = stepDetails[step.id];
                const isExpanded = expandedStep === step.id;

                return (
                  <div key={step.id} className="mb-6">
                    <div 
                      className={`flex items-center gap-6 cursor-pointer hover:bg-[#1e293b]/50 p-2 -ml-2 rounded-lg transition-colors ${isDone || isCurrent ? '' : 'opacity-50 pointer-events-none'}`}
                      onClick={() => isDone && toggleExpand(step.id)}
                    >
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 shrink-0 border 
                          ${isDone 
                            ? 'bg-[#0f2e22] text-[#00ffaa] border-[#00ffaa]' 
                            : isCurrent
                              ? 'bg-[#1e293b] text-white border-white'
                              : 'bg-[#0b111a] text-[#475569] border-[#1e293b]'
                          }`}
                      >
                        {index + 1}
                      </div>

                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border
                          ${isDone || isCurrent
                            ? 'bg-[#151e2b] text-[#94a3b8] border-[#334155]'
                            : 'bg-[#0b111a] text-[#475569] border-[#1e293b]'
                          }`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-[15px] font-semibold ${isDone || isCurrent ? 'text-white' : 'text-[#475569]'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs ${isDone || isCurrent ? 'text-[#94a3b8]' : 'text-[#334155]'}`}>
                          {step.desc}
                        </p>
                        {step.agent && (
                          <div className={`text-[10px] uppercase font-bold mt-1 inline-flex items-center gap-1 ${isDone || isCurrent ? 'text-[#00ffaa]' : 'text-[#334155]'}`}>
                            <User size={10} /> {step.agent}
                          </div>
                        )}
                      </div>

                      <div className="text-[#64748b] text-xs w-24 text-right">
                        {stepTimes[step.id] || ''}
                      </div>

                      <div className="w-24 flex justify-end items-center gap-2">
                        {isDone ? (
                          <>
                            <div className="px-2 py-1 rounded border border-[#00ffaa]/30 text-[#00ffaa] bg-[#00ffaa]/10 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                              DONE <Check size={12} />
                            </div>
                            {isExpanded ? <ChevronUp size={16} className="text-[#94a3b8]" /> : <ChevronDown size={16} className="text-[#94a3b8]" />}
                          </>
                        ) : isCurrent ? (
                          <div className="px-2 py-1 rounded border border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/10 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            <RefreshCw size={12} className="animate-spin" />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {isExpanded && details && (
                      <div className="ml-[68px] mt-2 mb-4 bg-[#0a0f18] border border-[#1e293b] rounded-lg p-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                        <pre className="text-xs text-[#00e5ff] font-mono whitespace-pre-wrap break-all">
                          {JSON.stringify(details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isCompleted && (
            <div className="mt-6 bg-[#0f2e22] border border-[#00ffaa]/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-transparent border-2 border-[#00ffaa] text-[#00ffaa] flex items-center justify-center shrink-0">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-[#00ffaa] font-semibold">Investigation Completed Successfully</h3>
                  <p className="text-[#94a3b8] text-sm mt-0.5">All analysis stages completed. Case is ready for review.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="bg-[#0b111a] border border-[#1e293b] rounded-lg px-4 py-2 text-right">
                  <div className="text-[#64748b] text-xs">Total Time</div>
                  <div className="text-white font-mono">{totalTime}</div>
                </div>
                
                <button 
                  onClick={() => {
                    onClose();
                    navigate(`/case/${finalCaseId}`);
                  }}
                  className="bg-[#00ffaa]/10 hover:bg-[#00ffaa]/20 text-[#00ffaa] border border-[#00ffaa]/30 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  View Case Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
