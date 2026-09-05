import { memo } from "react";
import { arcPath, polar, ticks } from "@/lib/hud";

const C = "var(--hud-cyan)";
const CD = "var(--hud-cyan-deep)";
const S = "var(--hud-steel)";
const SD = "var(--hud-steel-dim)";

function seg(count: number, gap: number, r: number, offset = 0) {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const a = offset + i * step;
    return arcPath(r, a, a + step - gap);
  });
}

/** All rotating / static SVG ring layers of the HUD. */
export const Rings = memo(function Rings({ scanKey }: { scanKey: number }) {
  return (
    <svg
      viewBox="0 0 800 800"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--hud-cyan-core)" stopOpacity="0.30" />
          <stop offset="55%" stopColor="var(--hud-cyan-deep)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--hud-cyan-deep)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="travelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--hud-cyan-core)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--hud-cyan-core)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--hud-cyan)" stopOpacity="0" />
        </linearGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hardGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ambient core glow */}
      <circle
        cx="400"
        cy="400"
        r="300"
        fill="url(#coreGlow)"
        style={{ opacity: `calc(0.45 + var(--hud-energy) * 0.55)`, transition: "opacity .8s ease" }}
      />

      {/* L1 — outermost broken frame arcs */}
      <g className="hud-rot hud-anim hud-cw" style={{ "--dur": "260s" } as React.CSSProperties}>
        {[0, 90, 180, 270].map((a) => (
          <path
            key={a}
            d={arcPath(392, a + 6, a + 78)}
            fill="none"
            stroke={S}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}
        {[38, 128, 218, 308].map((a) => (
          <path
            key={`t${a}`}
            d={arcPath(392, a, a + 3)}
            fill="none"
            stroke={C}
            strokeWidth="2.5"
            opacity="0.7"
          />
        ))}
      </g>

      {/* L2 — fine tick ring, counter-rotating */}
      <g className="hud-rot hud-anim hud-ccw" style={{ "--dur": "190s" } as React.CSSProperties}>
        {ticks(120, 372, 382).map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.i % 10 === 0 ? C : SD}
            strokeWidth={t.i % 10 === 0 ? 1.6 : 1}
            opacity={t.i % 10 === 0 ? 0.55 : 0.35}
          />
        ))}
      </g>

      {/* L3 — heavy segmented armour ring */}
      <g className="hud-rot hud-anim hud-cw" style={{ "--dur": "340s" } as React.CSSProperties}>
        {seg(24, 3.6, 352).map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i % 4 === 0 ? "var(--hud-steel)" : "var(--hud-steel-dim)"}
            strokeWidth="17"
            opacity={i % 4 === 0 ? 0.5 : 0.32}
          />
        ))}
        {seg(24, 3.6, 352).map((d, i) =>
          i % 6 === 1 ? (
            <path key={`h${i}`} d={d} fill="none" stroke={CD} strokeWidth="2" opacity="0.5" />
          ) : null,
        )}
      </g>

      {/* L4 — travelling dash ring */}
      <circle
        cx="400"
        cy="400"
        r="332"
        fill="none"
        stroke={CD}
        strokeWidth="1"
        strokeDasharray="2 10"
        opacity="0.45"
        className="hud-rot hud-anim hud-ccw"
        style={{ "--dur": "120s" } as React.CSSProperties}
      />

      {/* L5 — static instrument frame */}
      <circle cx="400" cy="400" r="318" fill="none" stroke={SD} strokeWidth="1" opacity="0.7" />
      <circle cx="400" cy="400" r="266" fill="none" stroke={SD} strokeWidth="1" opacity="0.55" />
      {[
        [-58, 58],
        [122, 238],
      ].map(([a, b], i) => (
        <path
          key={i}
          d={arcPath(300, a, b)}
          fill="none"
          stroke={S}
          strokeWidth="1.4"
          opacity="0.65"
        />
      ))}

      {/* L6 — radial minor ticks between frame and core */}
      <g className="hud-rot hud-anim hud-ccw" style={{ "--dur": "150s" } as React.CSSProperties}>
        {ticks(72, 248, 262).map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.i % 6 === 0 ? C : SD}
            strokeWidth="1"
            opacity={t.i % 6 === 0 ? 0.6 : 0.3}
          />
        ))}
      </g>

      {/* ---- CYAN ENERGY RING ---- */}
      <g style={{ animation: "hud-breathe calc(6s / var(--hud-speed)) ease-in-out infinite" }}>
        {/* halo */}
        <circle
          cx="400"
          cy="400"
          r="228"
          fill="none"
          stroke={CD}
          strokeWidth="26"
          opacity={`calc(0.10 + var(--hud-energy) * 0.30)`}
          filter="url(#hardGlow)"
          style={{ transition: "opacity .6s ease" }}
        />
        {/* body */}
        <circle
          cx="400"
          cy="400"
          r="228"
          fill="none"
          stroke={C}
          strokeWidth="9"
          opacity={`calc(0.45 + var(--hud-energy) * 0.5)`}
          filter="url(#softGlow)"
          style={{ transition: "opacity .5s ease" }}
        />
        {/* bright inner core line */}
        <circle
          cx="400"
          cy="400"
          r="228"
          fill="none"
          stroke="var(--hud-cyan-core)"
          strokeWidth="2"
          opacity={`calc(0.35 + var(--hud-energy) * 0.65)`}
        />
      </g>

      {/* energy ring — diagonal hatch pattern rotating */}
      <circle
        cx="400"
        cy="400"
        r="228"
        fill="none"
        stroke="var(--hud-void-deep)"
        strokeWidth="9"
        strokeDasharray="4 13"
        opacity="0.75"
        className="hud-rot hud-anim hud-cw"
        style={{ "--dur": "26s" } as React.CSSProperties}
      />

      {/* energy ring — travelling light head */}
      <g className="hud-rot hud-anim hud-cw" style={{ "--dur": "7s" } as React.CSSProperties}>
        <path
          d={arcPath(228, 0, 62)}
          fill="none"
          stroke="url(#travelGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          filter="url(#softGlow)"
          opacity="0.9"
        />
        <circle
          {...polarProps(228, 62)}
          r="4"
          fill="var(--hud-cyan-core)"
          filter="url(#hardGlow)"
        />
      </g>
      <g className="hud-rot hud-anim hud-ccw" style={{ "--dur": "11s" } as React.CSSProperties}>
        <path
          d={arcPath(228, 180, 214)}
          fill="none"
          stroke="url(#travelGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>

      {/* inner amplitude comb ring (reference's spiky inner edge) */}
      <g className="hud-rot hud-anim hud-ccw" style={{ "--dur": "70s" } as React.CSSProperties}>
        {ticks(160, 200, 216).map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={C}
            strokeWidth="1.4"
            opacity={0.18 + 0.5 * Math.abs(Math.sin(i * 0.7))}
          />
        ))}
      </g>

      {/* inner data circles */}
      <circle cx="400" cy="400" r="192" fill="none" stroke={SD} strokeWidth="1" opacity="0.55" />
      <circle
        cx="400"
        cy="400"
        r="176"
        fill="none"
        stroke={CD}
        strokeWidth="1"
        strokeDasharray="1 7"
        opacity="0.5"
        className="hud-rot hud-anim hud-cw"
        style={{ "--dur": "60s" } as React.CSSProperties}
      />

      {/* scanning sweep line */}
      <g
        key={scanKey}
        className="hud-rot"
        style={{ animation: "hud-spin calc(3.6s / var(--hud-speed)) cubic-bezier(.4,0,.2,1) 1" }}
      >
        <path
          d={arcPath(228, -34, 0)}
          fill="none"
          stroke="var(--hud-cyan-core)"
          strokeWidth="14"
          opacity="0.28"
          filter="url(#softGlow)"
        />
        <line
          x1="400"
          y1="400"
          x2={polar(392, 0).x}
          y2={polar(392, 0).y}
          stroke="var(--hud-cyan-core)"
          strokeWidth="1.4"
          opacity="0.5"
        />
      </g>

      {/* core rings */}
      <g style={{ opacity: 0.9 }}>
        <circle cx="400" cy="400" r="120" fill="none" stroke={SD} strokeWidth="1" opacity="0.5" />
        <g className="hud-rot hud-anim hud-cw" style={{ "--dur": "24s" } as React.CSSProperties}>
          {ticks(40, 112, 120, 1).map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={i % 5 === 0 ? C : SD}
              strokeWidth="1"
              opacity="0.45"
            />
          ))}
        </g>
      </g>
    </svg>
  );
});

function polarProps(r: number, deg: number) {
  const p = polar(r, deg);
  return { cx: p.x, cy: p.y };
}
