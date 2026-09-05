import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export type KpiAccent = "cyan" | "violet" | "blue" | "warning";

const accents: Record<KpiAccent, string> = {
  cyan: "0,229,255",
  violet: "139,92,246",
  blue: "0,140,255",
  warning: "255,176,32",
};

export function KpiCard({
  label,
  value,
  delta,
  deltaDirection,
  icon: Icon,
  accent,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  deltaDirection: "up" | "down";
  icon: LucideIcon;
  accent: KpiAccent;
  spark: number[];
}) {
  const rgb = accents[accent];
  const data = spark.map((v, i) => ({ i, v }));
  const up = deltaDirection === "up";

  return (
    <article
      className="glass group flex h-[100px] flex-col justify-between rounded-lg px-3 py-2 transition-all hover:-translate-y-[2px] lg:h-auto lg:min-h-0"
      style={{
        border: `1px solid rgba(${rgb},0.32)`,
        background: `linear-gradient(160deg, rgba(${rgb},0.10), rgba(3,17,29,0.78) 62%)`,
        boxShadow: `0 0 26px -18px rgba(${rgb},1)`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="panel-title truncate">{label}</span>
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
          style={{
            border: `1px solid rgba(${rgb},0.4)`,
            background: `rgba(${rgb},0.12)`,
            color: `rgb(${rgb})`,
          }}
        >
          <Icon size={15} />
        </span>
      </div>

      <div className="mt-1 text-[27px] leading-none font-bold tracking-tight text-white">
        {value}
      </div>

      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className="flex items-center gap-1 text-[10.5px] whitespace-nowrap">
          <span
            className="flex items-center gap-0.5 font-semibold"
            style={{ color: up ? "var(--neon-teal)" : "var(--neon-danger)" }}
          >
            {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {delta}
          </span>
          <span className="text-muted-foreground">vs yesterday</span>
        </div>
        <div className="hidden h-[26px] w-[92px] shrink-0 sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={`spark-${accent}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`rgb(${rgb})`} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={`rgb(${rgb})`} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={`rgb(${rgb})`}
                strokeWidth={1.6}
                fill={`url(#spark-${accent})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  );
}
