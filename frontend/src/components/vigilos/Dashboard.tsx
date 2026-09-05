import { useEffect, useState } from "react";
import { Briefcase, Gauge, Search, ShieldAlert } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { CommandCenter } from "./CommandCenter";
import { SystemHealth } from "./SystemHealth";
import { ModelPerformance } from "./ModelPerformance";
import { RiskDistribution } from "./RiskDistribution";
import { DecisionDistribution } from "./DecisionDistribution";
import { RiskTrend } from "./RiskTrend";
import { RecentActivity } from "./RecentActivity";
import { ThreatMap } from "./ThreatMap";

const defaultKpis = [
  {
    label: "Total Cases",
    value: "247",
    delta: "8%",
    deltaDirection: "up" as const,
    icon: Briefcase,
    accent: "cyan" as const,
    spark: [12, 18, 14, 22, 17, 26, 21, 30, 25, 34],
  },
  {
    label: "Avg Risk Score",
    value: "26.8%",
    delta: "4.2%",
    deltaDirection: "up" as const,
    icon: Gauge,
    accent: "violet" as const,
    spark: [20, 16, 24, 19, 28, 22, 31, 26, 33, 29],
  },
  {
    label: "Open Investigations",
    value: "42",
    delta: "12%",
    deltaDirection: "up" as const,
    icon: Search,
    accent: "blue" as const,
    spark: [8, 14, 11, 19, 15, 23, 18, 27, 22, 31],
  },
  {
    label: "Escalated Cases",
    value: "6",
    delta: "1",
    deltaDirection: "down" as const,
    icon: ShieldAlert,
    accent: "warning" as const,
    spark: [18, 22, 17, 25, 20, 28, 23, 19, 26, 21],
  },
];

import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const kpis = [...defaultKpis];
  if (stats && stats.kpi_trends) {
    const calcDelta = (arr: number[], isPercentage: boolean = false) => {
      if (!arr || arr.length < 2) return { value: "0", direction: "up" };
      const current = arr[arr.length - 1];
      const prev = arr[arr.length - 2];
      
      const diff = current - prev;
      const direction = diff >= 0 ? "up" : "down";
      
      if (prev === 0) return { value: isPercentage ? "0%" : "0%", direction };

      if (isPercentage) {
        return { value: `${Math.abs(diff * 100).toFixed(1)}%`, direction };
      } else {
        const pct = Math.abs((diff / prev) * 100);
        return { value: `${pct.toFixed(0)}%`, direction };
      }
    };

    // Total Cases
    kpis[0].value = String(stats.total_cases);
    kpis[0].spark = stats.kpi_trends.total_cases;
    const tDelta = calcDelta(stats.kpi_trends.total_cases);
    kpis[0].delta = tDelta.value;
    kpis[0].deltaDirection = tDelta.direction as any;

    // Avg Risk Score
    kpis[1].value = `${(stats.avg_risk_score * 100).toFixed(1)}%`;
    kpis[1].spark = stats.kpi_trends.avg_risk.map((v: number) => v * 100);
    const rDelta = calcDelta(stats.kpi_trends.avg_risk, true);
    kpis[1].delta = rDelta.value;
    kpis[1].deltaDirection = rDelta.direction as any;

    // Open Investigations
    kpis[2].value = String(stats.decision_distribution?.Pending || 42);
    kpis[2].spark = stats.kpi_trends.pending;
    const pDelta = calcDelta(stats.kpi_trends.pending);
    kpis[2].delta = pDelta.value;
    kpis[2].deltaDirection = pDelta.direction as any;

    // Escalated Cases
    kpis[3].value = String(stats.decision_distribution?.ESCALATE || 6);
    kpis[3].spark = stats.kpi_trends.escalated;
    const eDelta = calcDelta(stats.kpi_trends.escalated);
    kpis[3].delta = eDelta.value;
    kpis[3].deltaDirection = eDelta.direction as any;
  }

  return (
    <div className="flex flex-col gap-2 px-3 pt-2 pb-3 sm:px-4 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <h1 className="shrink-0 text-[13px] font-semibold tracking-[0.14em] text-foreground/90 uppercase">
        Command Overview
      </h1>

      <div className="grid auto-rows-min grid-cols-1 gap-2.5 lg:min-h-0 lg:flex-1 lg:auto-rows-auto lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,98fr)_minmax(0,118fr)_minmax(0,104fr)_minmax(0,130fr)_minmax(0,172fr)]">
        <div className="grid auto-rows-min grid-cols-2 gap-2.5 lg:col-span-2 lg:min-h-0 lg:auto-rows-auto lg:grid-cols-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              onClick={() => {
                if (k.label === "Total Cases") {
                  navigate("/queue");
                }
              }}
              className={k.label === "Total Cases" ? "cursor-pointer" : ""}
            >
              <KpiCard {...k} />
            </div>
          ))}
        </div>

        <div className="h-[430px] sm:h-[300px] lg:row-span-2 lg:h-auto lg:min-h-0">
          <CommandCenter data={stats} />
        </div>
        <div className="h-[170px] lg:h-auto lg:min-h-0">
          <SystemHealth />
        </div>
        <div className="h-[170px] lg:h-auto lg:min-h-0">
          <ModelPerformance />
        </div>

        <div className="grid auto-rows-min grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-2 lg:min-h-0 lg:auto-rows-auto lg:grid-cols-3">
          <div className="h-[190px] lg:h-auto lg:min-h-0">
            <RiskDistribution data={stats?.risk_distribution} />
          </div>
          <div className="h-[190px] lg:h-auto lg:min-h-0">
            <DecisionDistribution data={stats?.decision_distribution} />
          </div>
          <div className="h-[190px] sm:col-span-2 lg:col-span-1 lg:h-auto lg:min-h-0">
            <RiskTrend data={stats?.risk_trend} />
          </div>
        </div>

        <div className="grid auto-rows-min grid-cols-1 gap-2.5 lg:col-span-2 lg:min-h-0 lg:auto-rows-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="h-[260px] lg:h-auto lg:min-h-0">
            <RecentActivity data={stats?.recent_activity} />
          </div>
          <div className="h-[260px] lg:h-auto lg:min-h-0">
            <ThreatMap />
          </div>
        </div>
      </div>
    </div>
  );
}
