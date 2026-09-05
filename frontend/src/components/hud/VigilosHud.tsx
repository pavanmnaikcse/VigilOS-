import "./hud.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Rings } from "./Rings";
import { Waveform, DotLine } from "./Waveform";
import { Particles } from "./Particles";
import { LiveValue, StatLabel, WordList } from "./Readouts";
import { useVoiceEngine } from "@/hooks/use-voice-engine";
import {
  STATE_ENERGY,
  STATE_SPEED,
  clamp,
  lerp,
  matchCommand,
  polar,
  type SystemState,
} from "@/lib/hud";

type Ctrl = { id: string; label: string; deg: number; r: number; wide?: boolean; status: string };

const CONTROLS: Ctrl[] = [
  { id: "anoff", label: "AN OFF", deg: 336, r: 0.375, status: "ANIM OFFLINE" },
  { id: "game-mode", label: "GAME\nMODE", deg: 350, r: 0.383, wide: true, status: "GAME MODE" },
  { id: "desk-mode", label: "DESK\nMODE", deg: 10, r: 0.383, wide: true, status: "DESK MODE" },
  { id: "anion", label: "ANI ON", deg: 24, r: 0.375, status: "ANIM ONLINE" },
  { id: "comp", label: "COMP", deg: 291, r: 0.372, status: "COMPUTE" },
  { id: "docs", label: "DOCS", deg: 270, r: 0.372, status: "DOCUMENTS" },
  { id: "ctrl", label: "CTRL", deg: 249, r: 0.372, status: "CONTROL" },
  { id: "desk", label: "DESK", deg: 228, r: 0.372, status: "DESKTOP" },
  { id: "xplr", label: "XPLR", deg: 69, r: 0.372, status: "EXPLORER" },
  { id: "chrm", label: "CHRM", deg: 90, r: 0.372, status: "CHROME LINK" },
  { id: "game", label: "GAME", deg: 111, r: 0.372, status: "GAME CORE" },
  { id: "cfg", label: "CFG", deg: 132, r: 0.372, status: "CONFIG" },
];

const MICRO = [
  { label: "UP", deg: 303, r: 0.4 },
  { label: "ON", deg: 217, r: 0.4 },
  { label: "FREE", deg: 57, r: 0.4 },
  { label: "USED", deg: 143, r: 0.4 },
];

const DISCS = [
  { label: "D", deg: 318, r: 0.432, value: "29.0 G" },
  { label: "D", deg: 42, r: 0.432, value: "29.0 G" },
  { label: "D", deg: 222, r: 0.432, value: "29.0 G" },
  { label: "C", deg: 138, r: 0.432, value: "558.2 G" },
];

const LEFT_WORDS = [
  "UNLIMITED",
  "FILELIST",
  "LASTTORRENTS",
  "MININOVA",
  "RAINMETER",
  "DEVIANT",
  "LINKS",
  "YOUTUBE",
  "GOOGLE",
  "CUSTOMIZE",
  "SCEENFEZ",
  "TORRENTZ",
  "GAMETRAILERS",
];

export function VigilosHud() {
  const [size, setSize] = useState(760);
  const [state, setState] = useState<SystemState>("IDLE");
  const [status, setStatus] = useState("STANDBY");
  const [active, setActive] = useState<Record<string, boolean>>({ "desk-mode": true });
  const [pulses, setPulses] = useState<{ id: number; deg: number }[]>([]);
  const [scanKey, setScanKey] = useState(0);
  const [clock, setClock] = useState("7:30 AM");
  const [coreNum, setCoreNum] = useState(13);

  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "set_context", path: location.pathname }));
    }
  }, [location.pathname]);

  useEffect(() => {
    let wsTimeout: any;
    const connectWebSocket = () => {
      socketRef.current = new WebSocket("ws://localhost:8000/api/commando/ws");
      socketRef.current.onopen = () => {
        socketRef.current?.send(JSON.stringify({ type: "set_context", path: location.pathname }));
      };
      
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "status") {
          runState("EXECUTING", 2000, "PROCESSING");
          setStatus(data.message.toUpperCase());
        }
        else if (data.type === "action") {
          if (data.action === "navigate") {
            navigate(data.path);
          }
          else if (data.action === "open_tab") {
            window.open(data.url, "_blank");
          }
        }
        else if (data.type === "speech_text") {
          runState("SUCCESS", 2000, "LISTENING");
          setStatus("RESPONDING");
          
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.onend = () => {
            setStatus("STANDBY");
            setState("IDLE");
          };
          window.speechSynthesis.speak(utterance);
        }
      };
      
      socketRef.current.onclose = () => {
        wsTimeout = setTimeout(connectWebSocket, 3000);
      };
    };
    
    connectWebSocket();
    
    return () => {
      clearTimeout(wsTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
      window.speechSynthesis.cancel();
    };
  }, [navigate]);

  // Initial greeting
  useEffect(() => {
    const greeting = new SpeechSynthesisUtterance("Yes sir, VigilOS reporting sir.");
    window.speechSynthesis.speak(greeting);
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef(STATE_ENERGY.IDLE);
  const gaugeRef = useRef<SVGCircleElement>(null);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runState = useCallback((next: SystemState, hold = 1400, then: SystemState = "IDLE") => {
    setState(next);
    if (stateTimer.current) clearTimeout(stateTimer.current);
    stateTimer.current = setTimeout(() => setState(then), hold);
  }, []);

  const voice = useVoiceEngine((text) => {
    if (!text.trim()) return;
    runState("COMMAND RECEIVED", 700, "PROCESSING");
    setStatus("TRANSMITTING");
    setScanKey((k) => k + 1);
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "command", text: text }));
    }
  });
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  /* ---------- responsive sizing ---------- */
  useEffect(() => {
    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setSize(Math.max(380, Math.min(vh * 0.94, vw * 0.56, 820)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  /* ---------- clock + core counter ---------- */
  useEffect(() => {
    const upd = () =>
      setClock(
        new Date()
          .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          .replace(/\u202f/, " "),
      );
    upd();
    const id = setInterval(upd, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCoreNum((n) => {
        const drift = voiceRef.current?.listening ? 1 + Math.floor(Math.random() * 3) : 1;
        return ((n + drift) % 99) + 1;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  /* ---------- periodic scan sweep ---------- */
  useEffect(() => {
    const id = setInterval(() => setScanKey((k) => k + 1), 9000);
    return () => clearInterval(id);
  }, []);

  /* ---------- state -> listening sync ---------- */
  useEffect(() => {
    if (voice.listening && state === "IDLE") setState("LISTENING");
    if (!voice.listening && state === "LISTENING") setState("IDLE");
  }, [voice.listening, state]);

  /* ---------- master rAF: energy, speed, gauge, cursor ---------- */
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const level = voice.levelRef.current ?? 0;
      const target = clamp(STATE_ENERGY[state] + level * 0.9, 0, 1);
      energyRef.current = lerp(energyRef.current, target, 0.07);
      const speed = STATE_SPEED[state] * (1 + level * 0.5);
      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--hud-energy", energyRef.current.toFixed(3));
        el.style.setProperty("--hud-speed", speed.toFixed(3));
      }
      const g = gaugeRef.current;
      if (g) {
        const circ = 2 * Math.PI * 34;
        const pct = clamp(0.12 + energyRef.current * 0.35 + level * 0.6);
        g.style.strokeDasharray = `${(circ * pct).toFixed(1)} ${circ}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, voice.levelRef]);

  /* ---------- cursor parallax + follower ---------- */
  useEffect(() => {
    let queued = false;
    const onMove = (e: PointerEvent) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const nx = (e.clientX / w) * 2 - 1;
        const ny = (e.clientY / h) * 2 - 1;
        pointerRef.current = { x: nx, y: ny };
        const st = stageRef.current;
        if (st) st.style.transform = `translate3d(${(nx * 7).toFixed(2)}px, ${(ny * 7).toFixed(2)}px, 0)`;
        const cu = cursorRef.current;
        if (cu) cu.style.transform = `translate3d(${e.clientX - 90}px, ${e.clientY - 90}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  /* ---------- control activation ---------- */
  const activate = useCallback(
    (c: Ctrl) => {
      setActive((a) => ({ ...a, [c.id]: !a[c.id] }));
      setStatus(c.status);
      setScanKey((k) => k + 1);
      const id = Date.now() + Math.random();
      setPulses((p) => [...p, { id, deg: c.deg }]);
      setTimeout(() => setPulses((p) => p.filter((x) => x.id !== id)), 900);
      runState("COMMAND RECEIVED", 650, "EXECUTING");
      setTimeout(() => runState("SUCCESS", 900, voiceRef.current?.listening ? "LISTENING" : "IDLE"), 700);
    },
    [runState],
  );

  const place = useCallback(
    (deg: number, rFrac: number) => {
      const p = polar(rFrac * 800, deg);
      return { left: (p.x / 800) * size, top: (p.y / 800) * size };
    },
    [size],
  );

  const stateLabel = useMemo(() => {
    if (state === "LISTENING") return "LISTENING";
    if (state === "IDLE") return voice.listening ? "LISTENING" : "STANDBY";
    return state;
  }, [state, voice.listening]);

  return (
    <div
      ref={rootRef}
      className="hud-noise relative min-h-screen w-full overflow-hidden bg-hud-void-deep select-none"
      style={{ "--hud-energy": 0.2, "--hud-speed": 1 } as React.CSSProperties}
    >
      {/* cursor light */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-40 h-[180px] w-[180px] rounded-full opacity-60 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--hud-cyan) 16%, transparent) 0%, transparent 68%)",
        }}
      />

      {/* ---------- LEFT WORD LIST ---------- */}
      <div className="absolute top-1/2 left-[3vw] z-20 -translate-y-1/2">
        <WordList
          items={LEFT_WORDS}
          highlight="LINKS"
          onSelect={(w) => {
            setStatus(w);
            setScanKey((k) => k + 1);
            runState("EXECUTING", 900, voice.listening ? "LISTENING" : "IDLE");
          }}
        />
      </div>

      {/* ---------- STAGE ---------- */}
      <div className="flex min-h-screen items-center justify-center">
        <div
          ref={stageRef}
          className="relative"
          style={{ width: size, height: size, transition: "transform .35s cubic-bezier(.2,.8,.2,1)" }}
        >
          <Rings scanKey={scanKey} />
          <Particles
            levelRef={voice.levelRef}
            energyRef={energyRef}
            pointerRef={pointerRef}
            size={size}
          />

          {/* command pulses travelling to the core */}
          {pulses.map((p) => {
            const pos = place(p.deg, 0.372);
            return (
              <span
                key={p.id}
                className="pointer-events-none absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: pos.left,
                  top: pos.top,
                  background: "var(--hud-cyan-core)",
                  boxShadow: "0 0 14px var(--hud-cyan)",
                  animation: "hud-pulse-out .9s ease-out forwards",
                }}
              />
            );
          })}

          {/* ---------- CLOCK CHIP ---------- */}
          <Chip style={place(343.5, 0.315)} label={clock} />

          {/* ---------- MICRO LABELS ---------- */}
          {MICRO.map((m) => {
            const pos = place(m.deg, m.r);
            return (
              <span
                key={m.label}
                className="hud-label absolute z-20 -translate-x-1/2 -translate-y-1/2 text-[9px]"
                style={{ ...pos, color: "var(--hud-text-dim)" }}
              >
                {m.label}
              </span>
            );
          })}

          {/* ---------- DISC INDICATORS ---------- */}
          {DISCS.map((d, i) => {
            const pos = place(d.deg, d.r);
            return (
              <div
                key={i}
                className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={pos}
              >
                <div
                  className="hud-label flex h-9 w-9 items-center justify-center rounded-full text-[13px]"
                  style={{
                    border: "1px solid var(--hud-cyan-deep)",
                    color: "var(--hud-cyan)",
                    boxShadow: `0 0 calc(6px + var(--hud-energy) * 14px) color-mix(in oklch, var(--hud-cyan) 40%, transparent) inset`,
                    animation: "hud-breathe calc(5s / var(--hud-speed)) ease-in-out infinite",
                  }}
                >
                  {d.label}
                </div>
              </div>
            );
          })}

          {/* ---------- RADIAL CONTROLS ---------- */}
          {CONTROLS.map((c) => (
            <RadialControl
              key={c.id}
              ctrl={c}
              pos={place(c.deg, c.r)}
              active={!!active[c.id]}
              onActivate={() => activate(c)}
            />
          ))}

          {/* ---------- CORE ---------- */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <div style={{ transform: `translateY(${-size * 0.115}px)` }} className="text-center">
              <div
                className="hud-label text-[10px]"
                style={{ color: "var(--hud-text-dim)", letterSpacing: "0.32em" }}
              >
                VIGILOS COMMANDO
              </div>
              <div
                className="font-display mt-1 text-[clamp(20px,3.1vw,38px)] leading-none tracking-[0.06em] hud-glow-text"
                style={{
                  color: state === "ERROR" ? "var(--hud-warn)" : "var(--hud-cyan)",
                  transition: "color .6s ease",
                  animation: "hud-text-pulse calc(3.2s / var(--hud-speed)) ease-in-out infinite",
                }}
              >
                {stateLabel}
              </div>
              <div
                className="hud-label mt-2 text-[10px] transition-opacity duration-500"
                style={{ color: "var(--hud-text-dim)" }}
              >
                {status}
              </div>
            </div>

            {/* gauge */}
            <button
              type="button"
              onClick={voice.toggle}
              aria-label={voice.listening ? "Stop listening" : "Start listening"}
              className="group relative -mt-2 cursor-pointer"
              style={{ transform: `translateY(${-size * 0.055}px)` }}
            >
              <svg width="92" height="92" viewBox="0 0 92 92">
                <circle
                  cx="46"
                  cy="46"
                  r="34"
                  fill="none"
                  stroke="var(--hud-steel-dim)"
                  strokeWidth="1.5"
                />
                <circle
                  ref={gaugeRef}
                  cx="46"
                  cy="46"
                  r="34"
                  fill="none"
                  stroke="var(--hud-cyan)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform="rotate(-90 46 46)"
                  style={{ filter: "drop-shadow(0 0 6px var(--hud-cyan))" }}
                />
                <circle
                  cx="46"
                  cy="46"
                  r="40"
                  fill="none"
                  stroke="var(--hud-cyan-deep)"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  opacity="0.6"
                  className="hud-anim hud-cw"
                  style={
                    {
                      "--dur": "18s",
                      transformOrigin: "46px 46px",
                      transformBox: "view-box",
                    } as React.CSSProperties
                  }
                />
              </svg>
              <span
                className="font-display absolute inset-0 flex items-center justify-center text-[20px] tabular-nums transition-colors"
                style={{ color: "var(--hud-cyan)" }}
              >
                {coreNum}
              </span>
            </button>

            {/* waveform */}
            <div style={{ transform: `translateY(${-size * 0.03}px)`, width: 360 }}>
              <Waveform
                spectrumRef={voice.spectrumRef}
                levelRef={voice.levelRef}
                energyRef={energyRef}
              />
            </div>

            <div
              className="hud-label text-[12px]"
              style={{
                transform: `translateY(${-size * 0.03}px)`,
                color: "var(--hud-cyan)",
                animation: "hud-text-pulse calc(2.4s / var(--hud-speed)) ease-in-out infinite",
                textShadow: "0 0 10px color-mix(in oklch, var(--hud-cyan) 55%, transparent)",
              }}
            >
              {voice.listening ? "SPEAK NOW" : "TAP CORE TO SPEAK"}
            </div>

            {/* recognised speech */}
            <div
              className="hud-label absolute max-w-[52%] text-center text-[10px] leading-relaxed transition-opacity duration-500"
              style={{
                bottom: size * 0.115,
                color: "var(--hud-text)",
                opacity: voice.transcript ? 0.9 : 0,
              }}
            >
              {voice.transcript}
            </div>
          </div>

          {/* inner faint scale markers (reference's 0% / 100X ticks) */}
          {[
            { t: "0%", deg: 285, r: 0.235 },
            { t: "100X", deg: 262, r: 0.245 },
            { t: "50X", deg: 240, r: 0.245 },
            { t: "0%", deg: 218, r: 0.235 },
            { t: "0%", deg: 75, r: 0.235 },
            { t: "100X", deg: 98, r: 0.245 },
            { t: "50X", deg: 120, r: 0.245 },
            { t: "91X", deg: 142, r: 0.235 },
          ].map((m, i) => {
            const pos = place(m.deg, m.r);
            return (
              <span
                key={i}
                className="hud-label absolute z-20 -translate-x-1/2 -translate-y-1/2 text-[8px]"
                style={{ ...pos, color: "var(--hud-text-dim)", opacity: 0.65 }}
              >
                {m.t}
              </span>
            );
          })}
        </div>
      </div>

      {/* ---------- SIDE VALUE COLUMNS ---------- */}
      <div className="absolute top-1/2 left-[calc(50%-var(--half)-2.2rem)] z-20 hidden -translate-x-full -translate-y-1/2 flex-col items-end gap-[18px] text-[10px] lg:flex"
        style={{ "--half": `${size / 2}px` } as React.CSSProperties}
      >
        <StatLabel>0.0</StatLabel>
        <LiveValue base={29} unit="G" decimals={1} volatility={0.004} />
        <LiveValue base={579.2} unit="KB" volatility={0.06} />
        <LiveValue base={558.2} unit="GB" volatility={0.002} />
        <LiveValue base={82.1} unit="GB" volatility={0.004} active />
        <LiveValue base={16.4} unit="MB" volatility={0.08} />
        <StatLabel>0.0</StatLabel>
        <LiveValue base={29} unit="G" decimals={1} volatility={0.004} />
      </div>

      <div className="absolute top-1/2 left-[calc(50%+var(--half)+2.2rem)] z-20 hidden -translate-y-1/2 flex-col items-start gap-[18px] text-[10px] lg:flex"
        style={{ "--half": `${size / 2}px` } as React.CSSProperties}
      >
        <StatLabel>0.0</StatLabel>
        <LiveValue base={29} unit="G" decimals={1} volatility={0.004} />
        <LiveValue base={51.76} unit="%" decimals={2} volatility={0.03} />
        <LiveValue base={5.92} unit="G" decimals={2} volatility={0.02} />
        <LiveValue base={48.22} unit="%" decimals={2} volatility={0.05} active />
        <LiveValue base={648} unit="K" decimals={1} volatility={0.09} />
        <LiveValue base={558.2} unit="G" volatility={0.002} />
      </div>

      {/* ---------- VOICE COMMAND BAR ---------- */}
      <div className="absolute bottom-4 left-1/2 z-20 w-[min(720px,86vw)] -translate-x-1/2">
        <div
          className="relative px-10 py-4"
          style={{
            clipPath: "polygon(6% 0, 94% 0, 100% 100%, 0% 100%)",
            border: "1px solid color-mix(in oklch, var(--hud-cyan) 22%, transparent)",
            background:
              "linear-gradient(180deg, color-mix(in oklch, var(--hud-cyan) 5%, transparent), transparent)",
            boxShadow: `inset 0 0 calc(10px + var(--hud-energy) * 40px) color-mix(in oklch, var(--hud-cyan) 12%, transparent)`,
          }}
        >
          <div
            className="hud-label mb-2 text-center text-[12px]"
            style={{
              color: "var(--hud-cyan)",
              textShadow: "0 0 12px color-mix(in oklch, var(--hud-cyan) 50%, transparent)",
              opacity: voice.listening ? 1 : 0.72,
              transition: "opacity .6s ease",
            }}
          >
            VOICE COMMAND ACTIVE
          </div>
          <div className="flex justify-center">
            <DotLine levelRef={voice.levelRef} energyRef={energyRef} />
          </div>
          {(voice.error || !voice.speechAvailable) && (
            <div
              className="hud-label mt-2 text-center text-[9px]"
              style={{ color: "var(--hud-text-dim)" }}
            >
              {voice.error ?? "SPEECH ENGINE UNAVAILABLE"} — HUD RUNNING IN SIMULATED FEED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ style, label }: { style: React.CSSProperties; label: string }) {
  return (
    <div
      className="hud-label absolute z-20 -translate-x-1/2 -translate-y-1/2 px-4 py-[3px] text-[9px]"
      style={{
        ...style,
        color: "var(--hud-cyan)",
        border: "1px solid color-mix(in oklch, var(--hud-cyan) 30%, transparent)",
        clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0% 100%)",
        background: "color-mix(in oklch, var(--hud-cyan) 6%, transparent)",
      }}
    >
      {label}
    </div>
  );
}

function RadialControl({
  ctrl,
  pos,
  active,
  onActivate,
}: {
  ctrl: Ctrl;
  pos: { left: number; top: number };
  active: boolean;
  onActivate: () => void;
}) {
  const [sweep, setSweep] = useState(0);
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        setSweep((s) => s + 1);
        onActivate();
      }}
      className="hud-label absolute z-20 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center overflow-hidden text-center text-[9.5px] leading-[1.15] whitespace-pre transition-all duration-300"
      style={{
        left: pos.left,
        top: pos.top,
        width: ctrl.wide ? 58 : 54,
        height: ctrl.wide ? 40 : 32,
        color: active || hover ? "var(--hud-cyan)" : "var(--hud-text)",
        border: `1px solid ${active ? "var(--hud-cyan)" : hover ? "color-mix(in oklch, var(--hud-cyan) 60%, transparent)" : "var(--hud-steel-dim)"}`,
        background: active
          ? "color-mix(in oklch, var(--hud-cyan) 12%, transparent)"
          : "color-mix(in oklch, var(--hud-void) 85%, transparent)",
        boxShadow: active
          ? "0 0 18px color-mix(in oklch, var(--hud-cyan) 35%, transparent)"
          : hover
            ? "0 0 12px color-mix(in oklch, var(--hud-cyan) 20%, transparent)"
            : "none",
        transform: `translate(-50%, -50%) scale(${hover ? 1.06 : 1})`,
        clipPath: "polygon(0 12%, 12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%)",
      }}
    >
      {ctrl.label}
      {/* hover technical markings */}
      <span
        className="pointer-events-none absolute inset-x-1 bottom-[3px] h-[1px] transition-opacity duration-300"
        style={{
          background: "var(--hud-cyan)",
          opacity: hover || active ? 0.7 : 0,
        }}
      />
      {/* click activation sweep */}
      {sweep > 0 && (
        <span
          key={sweep}
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklch, var(--hud-cyan) 55%, transparent), transparent)",
            animation: "hud-sweep .7s ease-out forwards",
          }}
        />
      )}
    </button>
  );
}

