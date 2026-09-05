export const CX = 400;
export const CY = 400;

/** Angle in degrees measured from 12 o'clock, clockwise. */
export function polar(r: number, deg: number, cx = CX, cy = CY) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcPath(r: number, startDeg: number, endDeg: number) {
  const a = polar(r, startDeg);
  const b = polar(r, endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

export function ticks(count: number, r1: number, r2: number, every = 1) {
  const out: { x1: number; y1: number; x2: number; y2: number; i: number }[] = [];
  for (let i = 0; i < count; i++) {
    if (i % every !== 0) continue;
    const deg = (360 / count) * i;
    const a = polar(r1, deg);
    const b = polar(r2, deg);
    out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, i });
  }
  return out;
}

export type SystemState =
  | "IDLE"
  | "LISTENING"
  | "PROCESSING"
  | "COMMAND RECEIVED"
  | "EXECUTING"
  | "SUCCESS"
  | "ERROR";

/** Speed multiplier applied to every rotating layer per state. */
export const STATE_SPEED: Record<SystemState, number> = {
  IDLE: 1,
  LISTENING: 1.35,
  PROCESSING: 2.4,
  "COMMAND RECEIVED": 1.8,
  EXECUTING: 2,
  SUCCESS: 1.2,
  ERROR: 0.8,
};

/** Extra cyan energy (0..1) contributed by the current state. */
export const STATE_ENERGY: Record<SystemState, number> = {
  IDLE: 0.18,
  LISTENING: 0.7,
  PROCESSING: 0.85,
  "COMMAND RECEIVED": 1,
  EXECUTING: 0.9,
  SUCCESS: 0.8,
  ERROR: 0.45,
};

export type VoiceCommand = {
  /** phrases that trigger the command */
  match: string[];
  label: string;
  /** short status shown in the core */
  status: string;
};

/** Extend by appending entries. */
export const VOICE_COMMANDS: VoiceCommand[] = [
  { match: ["open dashboard", "dashboard"], label: "DASHBOARD", status: "DASHBOARD" },
  { match: ["show cases", "cases"], label: "CASES", status: "CASE INDEX" },
  { match: ["start investigation", "investigate"], label: "INVESTIGATION", status: "INVESTIGATING" },
  { match: ["show threat map", "threat map"], label: "THREAT MAP", status: "THREAT MAP" },
  { match: ["open command center", "command center"], label: "COMMAND", status: "COMMAND CTR" },
  { match: ["start analysis", "analyse", "analyze"], label: "ANALYSIS", status: "ANALYSING" },
  { match: ["stop listening", "stand down", "stop"], label: "STANDBY", status: "STANDBY" },
  { match: ["reset system", "reset"], label: "RESET", status: "SYSTEM RESET" },
];

export function matchCommand(transcript: string): VoiceCommand | null {
  const t = transcript.toLowerCase().trim();
  let best: VoiceCommand | null = null;
  let bestLen = 0;
  for (const c of VOICE_COMMANDS) {
    for (const m of c.match) {
      if (t.includes(m) && m.length > bestLen) {
        best = c;
        bestLen = m.length;
      }
    }
  }
  return best;
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
