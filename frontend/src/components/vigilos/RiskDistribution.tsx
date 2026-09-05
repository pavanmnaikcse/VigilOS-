import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Panel } from "./primitives";

const defaultData = [
  { name: "High Risk", value: 52, pct: "21.1%", color: "#FF3B30" },
  { name: "Medium Risk", value: 93, pct: "37.7%", color: "#FFB020" },
  { name: "Low Risk", value: 102, pct: "41.3%", color: "#00E5B0" },
];

export function RiskDistribution({ data }: { data?: Record<string, number> }) {
  let displayData = defaultData;
  let total = 247;

  if (data) {
    const high = data["HIGH"] || 0;
    const med = data["MEDIUM"] || 0;
    const low = data["LOW"] || 0;
    total = high + med + low;
    
    if (total > 0) {
      displayData = [
        { name: "High Risk", value: high, pct: `${((high / total) * 100).toFixed(1)}%`, color: "#FF3B30" },
        { name: "Medium Risk", value: med, pct: `${((med / total) * 100).toFixed(1)}%`, color: "#FFB020" },
        { name: "Low Risk", value: low, pct: `${((low / total) * 100).toFixed(1)}%`, color: "#00E5B0" },
      ];
    }
  }

  return (
    <Panel title="Risk Distribution">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-1 px-2 py-1">
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
            <div className="text-center">
              <div className="text-[22px] leading-none font-bold text-white">{total}</div>
              <div className="text-[9.5px] text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {displayData.map((d) => (
            <li key={d.name} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="ml-auto font-medium text-foreground">{d.value}</span>
              <span className="w-9 text-right text-[9.5px] text-muted-foreground/70">
                {d.pct}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
