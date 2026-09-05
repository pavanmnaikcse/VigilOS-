import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Panel } from "./primitives";

const defaultData = [
  { name: "Pending", value: 234, pct: "94.7%", color: "#00E5B0" },
  { name: "Escalate", value: 9, pct: "3.6%", color: "#8B5CF6" },
  { name: "Block", value: 4, pct: "1.7%", color: "#FFB020" },
];

export function DecisionDistribution({ data }: { data?: Record<string, number> }) {
  let displayData = defaultData;
  let total = 247;
  let pendingPct = "94.7%";

  if (data) {
    const pending = data["Pending"] || 0;
    const escalate = data["ESCALATE"] || 0;
    const block = data["BLOCK"] || 0;
    total = pending + escalate + block;

    if (total > 0) {
      pendingPct = `${((pending / total) * 100).toFixed(1)}%`;
      displayData = [
        { name: "Pending", value: pending, pct: pendingPct, color: "#00E5B0" },
        { name: "Escalate", value: escalate, pct: `${((escalate / total) * 100).toFixed(1)}%`, color: "#8B5CF6" },
        { name: "Block", value: block, pct: `${((block / total) * 100).toFixed(1)}%`, color: "#FFB020" },
      ];
    }
  }

  return (
    <Panel title="Decision Distribution">
      <div className="grid h-full grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] items-center gap-2 px-2 py-1">
        <div className="relative mx-auto aspect-square w-full max-h-full max-w-[120px] min-h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  background: "rgba(3,17,29,0.92)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Pie
                data={displayData}
                dataKey="value"
                innerRadius="64%"
                outerRadius="88%"
                paddingAngle={1}
                stroke="none"
              >
                {displayData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="max-w-[62%] text-center">
              <div className="text-[clamp(12px,2.1cqw,18px)] leading-tight font-bold text-white">
                {pendingPct}
              </div>
              <div className="text-[9px] leading-tight text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>
        <ul className="space-y-1.5 pr-1">
          {displayData.map((d) => (
            <li key={d.name}>
              <div className="flex items-center justify-between text-[11px] leading-tight">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-muted-foreground/90">{d.name}</span>
                </div>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
              <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-cyan/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: d.pct, backgroundColor: d.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
