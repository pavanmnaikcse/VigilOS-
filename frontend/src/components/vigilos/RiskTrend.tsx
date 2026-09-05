import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "./primitives";

const defaultData = [
  { day: "May 13", high: 62, medium: 38, low: 20 },
  { day: "May 14", high: 58, medium: 33, low: 17 },
  { day: "May 15", high: 66, medium: 41, low: 22 },
  { day: "May 16", high: 61, medium: 36, low: 19 },
  { day: "May 17", high: 71, medium: 44, low: 24 },
  { day: "May 18", high: 74, medium: 47, low: 26 },
  { day: "May 19", high: 80, medium: 52, low: 30 },
];

const series = [
  { key: "high", name: "High Risk", color: "#FF3B30" },
  { key: "medium", name: "Medium Risk", color: "#FFB020" },
  { key: "low", name: "Low Risk", color: "#00E5B0" },
];

export function RiskTrend({ data }: { data?: any[] }) {
  const displayData = data && data.length > 0 ? data : defaultData;

  return (
    <Panel title="Risk Trend (Last 7 Days)">
      <div className="flex h-full min-h-0 flex-col px-2 py-1">
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="rgba(0,229,255,0.08)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(198,226,245,0.6)", fontSize: 9 }}
                axisLine={{ stroke: "rgba(0,229,255,0.12)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(198,226,245,0.6)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(3,17,29,0.92)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={1.8}
                  dot={{ r: 2, fill: s.color, stroke: "none" }}
                  activeDot={{ r: 3.5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex shrink-0 items-center justify-center gap-3 pt-1 text-[9.5px]">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
              />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}
