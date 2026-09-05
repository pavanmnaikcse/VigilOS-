import { useEffect, useRef, useState } from "react";

/** A technical value that occasionally drifts, with a short transition flash. */
export function LiveValue({
  base,
  unit,
  volatility = 0.02,
  period = 2600,
  decimals = 1,
  active,
}: {
  base: number;
  unit: string;
  volatility?: number;
  period?: number;
  decimals?: number;
  active?: boolean;
}) {
  const [v, setV] = useState(base);
  const [flash, setFlash] = useState(false);
  const baseRef = useRef(base);

  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const jitter = (Math.random() - 0.5) * 2 * volatility * baseRef.current;
      setV(Math.max(0, baseRef.current + jitter));
      setFlash(true);
      setTimeout(() => alive && setFlash(false), 320);
    };
    const id = setInterval(tick, period + Math.random() * period);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [period, volatility]);

  return (
    <span
      className="hud-label tabular-nums transition-colors duration-500"
      style={{
        color: flash || active ? "var(--hud-cyan)" : "var(--hud-text-dim)",
        textShadow: flash ? "0 0 8px color-mix(in oklch, var(--hud-cyan) 60%, transparent)" : "none",
      }}
    >
      {v.toFixed(decimals)}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}

/** Static/stable technical label. */
export function StatLabel({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className="hud-label transition-colors duration-500"
      style={{ color: active ? "var(--hud-cyan)" : "var(--hud-text-dim)" }}
    >
      {children}
    </span>
  );
}

/** Left-hand navigation/status word list from the reference. */
export function WordList({
  items,
  highlight,
  align = "right",
  onSelect,
}: {
  items: string[];
  highlight: string;
  align?: "right" | "left";
  onSelect?: (w: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <ul
      className="flex flex-col gap-[3px]"
      style={{ textAlign: align, alignItems: align === "right" ? "flex-end" : "flex-start" }}
    >
      {items.map((w) => {
        const on = w === highlight || w === hover;
        return (
          <li key={w}>
            <button
              type="button"
              onMouseEnter={() => setHover(w)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(w)}
              className="hud-label cursor-pointer text-[11px] leading-[1.35] transition-all duration-300"
              style={{
                color: on ? "var(--hud-cyan)" : "var(--hud-text-dim)",
                textShadow: on
                  ? "0 0 10px color-mix(in oklch, var(--hud-cyan) 55%, transparent)"
                  : "none",
                letterSpacing: on ? "0.26em" : "0.2em",
              }}
            >
              {w}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
