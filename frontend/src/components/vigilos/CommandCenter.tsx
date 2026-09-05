import { ArrowUp, Briefcase, Gauge, Search, ShieldAlert } from "lucide-react";
import { Panel } from "./primitives";

const defaultStats = [
  { icon: Briefcase, value: "247", label: "Total Cases", delta: "8%" },
  { icon: Gauge, value: "26.8%", label: "Avg Risk Score", delta: "4.2%" },
  { icon: Search, value: "42", label: "Open Investigations", delta: "12%" },
  { icon: ShieldAlert, value: "6", label: "Escalated Cases", delta: "1" },
];

export function CommandCenter({ data }: { data?: any }) {
  const stats = [...defaultStats];
  if (data) {
    stats[0].value = String(data.total_cases || 247);
    stats[1].value = data.avg_risk_score !== undefined ? `${(data.avg_risk_score * 100).toFixed(1)}%` : "26.8%";
    stats[2].value = String(data.decision_distribution?.Pending || 42);
    stats[3].value = String(data.decision_distribution?.ESCALATE || 6);
  }

  return (
    <Panel title="Command Center" bodyClassName="relative">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 22% 50%, rgba(0,140,255,0.16), transparent 70%)",
        }}
      />
      <style>
        {`
          @keyframes slow-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="relative grid h-full grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="relative flex h-[140px] min-h-0 place-items-center justify-center overflow-hidden sm:h-full">
          <img 
            src="/custom_globe.jpg" 
            alt="Globe" 
            className="h-[120%] w-[120%] max-w-none object-contain mix-blend-screen opacity-90"
            style={{ animation: 'slow-spin 40s linear infinite' }} 
          />
        </div>

        <div className="flex min-h-0 flex-col justify-center gap-3">
          <div>
            <h3 className="text-[20px] leading-tight sm:text-[26px] font-bold tracking-tight text-white">
              VigilOS Command Center
            </h3>
            <p className="mt-1 text-[13px] text-foreground/70">
              Intelligence. Investigation. Impact.
            </p>
            <div
              className="mt-3 h-[2px] w-28 rounded-full"
              style={{
                background: "linear-gradient(90deg, rgba(0,229,255,0.9), transparent)",
                boxShadow: "0 0 12px rgba(0,229,255,0.7)",
              }}
            />
          </div>

          <div
            className="grid grid-cols-2 gap-2 rounded-lg sm:grid-cols-4 border border-cyan/15 px-3 py-2.5"
            style={{
              background: "rgba(6,24,40,0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-cyan/25 bg-cyan/10 text-cyan">
                      <Icon size={13} />
                    </span>
                    <span className="text-[17px] leading-none font-bold text-white">
                      {s.value}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-[9.5px] text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="mt-0.5 flex items-center gap-0.5 text-[9.5px] font-semibold text-teal">
                    <ArrowUp size={10} />
                    {s.delta}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
