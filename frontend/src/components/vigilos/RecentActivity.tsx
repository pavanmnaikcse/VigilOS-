import { useNavigate } from "react-router-dom";
import { Panel, RiskBadge } from "./primitives";

const rows = [
  {
    id: "CASE-2024-0519-001",
    originalId: "CASE-2024-0519-001",
    type: "Transaction Fraud",
    score: "87.4%",
    level: "High" as const,
    analyst: "Analyst-07",
    updated: "2 min ago",
  },
  {
    id: "CASE-2024-0519-002",
    originalId: "CASE-2024-0519-002",
    type: "Account Takeover",
    score: "62.1%",
    level: "Medium" as const,
    analyst: "Analyst-12",
    updated: "8 min ago",
  },
  {
    id: "CASE-2024-0519-003",
    originalId: "CASE-2024-0519-003",
    type: "Money Mule",
    score: "34.2%",
    level: "Low" as const,
    analyst: "Analyst-03",
    updated: "15 min ago",
  },
  {
    id: "CASE-2024-0519-004",
    originalId: "CASE-2024-0519-004",
    type: "Phishing",
    score: "73.5%",
    level: "High" as const,
    analyst: "Analyst-09",
    updated: "18 min ago",
  },
];

export function RecentActivity({ data }: { data?: any[] }) {
  const navigate = useNavigate();
  const displayRows = data ? data.slice(0, 3).map(d => ({
    id: d.case_id.substring(0, 8),
    originalId: d.case_id,
    type: d.transaction?.type || "Unknown",
    score: d.fraud_score?.risk_score !== undefined ? `${(d.fraud_score.risk_score * 100).toFixed(1)}%` : "N/A",
    level: (d.fraud_score?.risk_level || "Medium").charAt(0).toUpperCase() + (d.fraud_score?.risk_level || "Medium").slice(1).toLowerCase() as any,
    analyst: "System",
    updated: new Date(d.created_at).toLocaleTimeString()
  })) : rows.slice(0, 3);

  return (
    <Panel title="Recent Activity" bodyClassName="overflow-x-auto px-3 py-1" className="min-h-0">
      <table className="w-full min-w-[560px] table-fixed border-collapse text-[11px]">
        <thead className="sticky top-0 bg-[#071322] z-10">
          <tr className="text-left text-[9.5px] tracking-[0.06em] text-muted-foreground uppercase">
            <th className="w-[26%] pb-1.5 font-medium whitespace-nowrap">Case ID</th>
            <th className="w-[18%] pb-1.5 font-medium whitespace-nowrap">Type</th>
            <th className="w-[12%] pb-1.5 font-medium whitespace-nowrap">Risk Score</th>
            <th className="w-[14%] pb-1.5 font-medium whitespace-nowrap">Status</th>
            <th className="w-[14%] pb-1.5 font-medium whitespace-nowrap">Assigned To</th>
            <th className="w-[17%] pb-1.5 font-medium whitespace-nowrap">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((r, i) => (
            <tr
              key={r.id + i}
              onClick={() => navigate(`/case/${r.originalId}`)}
              className="cursor-pointer border-t border-cyan/8 transition-colors hover:bg-cyan/[0.06]"
            >
              <td className="truncate py-[3px] text-cyan/90">{r.id}</td>
              <td className="truncate py-[3px] text-foreground/85">{r.type}</td>
              <td className="py-[3px] text-foreground/85">{r.score}</td>
              <td className="py-[3px]">
                <RiskBadge level={r.level} />
              </td>
              <td className="truncate py-[3px] text-muted-foreground">{r.analyst}</td>
              <td className="truncate py-[3px] text-muted-foreground">{r.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
