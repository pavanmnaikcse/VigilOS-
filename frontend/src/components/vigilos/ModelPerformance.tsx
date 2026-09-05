import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { Panel } from "./primitives";

const data = Array.from({ length: 26 }, (_, i) => ({
  i,
  precision: 0.5 + 0.28 * Math.sin(i / 2.1) + 0.08 * Math.sin(i / 0.9),
  recall: 0.5 + 0.22 * Math.sin(i / 2.6 + 1.4) + 0.07 * Math.cos(i / 1.3),
  f1: 0.5 + 0.18 * Math.sin(i / 3.1 + 2.6) + 0.06 * Math.sin(i / 1.1),
}));

const metrics = [
  { label: "Precision", value: "0.8624", color: "var(--neon-cyan)" },
  { label: "Recall", value: "0.9957", color: "var(--neon-teal)" },
  { label: "F1 Score", value: "0.9243", color: "var(--neon-blue)" },
  { label: "AUC-ROC", value: "0.9993", color: "var(--neon-violet)" },
];

export function ModelPerformance() {
  return (
    <Panel title="Model Performance (XGBoost)">
      <div className="flex h-full min-h-0 flex-col px-3 py-1.5">
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
              <Tooltip
                formatter={(value: number) => value.toFixed(4)}
                contentStyle={{
                  background: "rgba(3,17,29,0.92)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  borderRadius: 8,
                  fontSize: 10,
                  padding: "4px 8px"
                }}
                itemStyle={{ paddingBottom: 2, paddingTop: 2 }}
                labelFormatter={() => ""}
                wrapperStyle={{ zIndex: 100 }}
                position={{ y: 0 }}
              />
              <Line type="monotone" dataKey="precision" stroke="#00E5FF" strokeWidth={1.8} dot={false} />
              <Line type="monotone" dataKey="recall" stroke="#00E5B0" strokeWidth={1.6} dot={false} />
              <Line type="monotone" dataKey="f1" stroke="#008CFF" strokeWidth={1.6} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid shrink-0 grid-cols-4 gap-1 pt-1.5">
          {metrics.map((m) => (
            <div key={m.label} className="min-w-0">
              <div className="truncate text-[9.5px] text-muted-foreground">{m.label}</div>
              <div
                className="text-[14px] font-bold"
                style={{ color: m.color, textShadow: `0 0 12px ${m.color}` }}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
