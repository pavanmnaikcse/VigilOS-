import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  right,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "glass flex h-full min-h-0 flex-col overflow-hidden rounded-lg",
        className,
      )}
    >
      {title ? (
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-cyan/10 px-3 py-[7px]">
          <h2 className="panel-title truncate">{title}</h2>
          {right}
        </header>
      ) : null}
      <div className={cn("min-h-0 flex-1 overflow-hidden", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export function StatusDot({
  color = "var(--neon-teal)",
  size = 7,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full animate-breathe"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
    </span>
  );
}

export function RiskBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const map = {
    High: ["var(--neon-danger)", "rgba(255,59,48,0.12)"],
    Medium: ["var(--neon-warning)", "rgba(255,176,32,0.12)"],
    Low: ["var(--neon-teal)", "rgba(0,229,176,0.12)"],
  } as const;
  const [color, bg] = map[level];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-[2px] text-[10px] font-semibold"
      style={{ color, background: bg, border: `1px solid ${color}`, boxShadow: `0 0 10px -2px ${color}` }}
    >
      <span className="h-[6px] w-[6px] rounded-full" style={{ background: color }} />
      {level}
    </span>
  );
}
