import { useEffect, useRef } from "react";
import { clamp, lerp } from "@/lib/hud";

type Props = {
  spectrumRef: React.RefObject<Float32Array>;
  levelRef: React.RefObject<number>;
  /** 0..1 energy from system state */
  energyRef: React.RefObject<number>;
  className?: string;
};

/** Centre voice visualisation — mirrored bar spectrum with glow + trail. */
export function Waveform({ spectrumRef, levelRef, energyRef, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360;
    const H = 110;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const N = 56;
    const smooth = new Float32Array(N);
    let raf = 0;
    let t = 0;

    const render = () => {
      t += 0.016;
      const spec = spectrumRef.current;
      const level = levelRef.current ?? 0;
      const energy = energyRef.current ?? 0.2;
      ctx.clearRect(0, 0, W, H);

      const mid = H / 2;
      const bw = W / N;

      for (let i = 0; i < N; i++) {
        // mirror the spectrum outward from the centre of the strip
        const d = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2);
        const si = Math.floor(d * (spec.length - 1) * 0.85);
        const env = Math.cos((d * Math.PI) / 2) ** 1.15;
        const raw =
          (spec[si] ?? 0) * env * (0.55 + level * 1.9) +
          (0.05 + energy * 0.05) * env * (0.6 + 0.4 * Math.sin(t * 2.3 + i * 0.6));
        smooth[i] = lerp(smooth[i], clamp(raw, 0, 1.4), raw > smooth[i] ? 0.4 : 0.12);

        const h = Math.max(1.5, smooth[i] * (mid - 4) * 1.6);
        const x = i * bw + bw / 2;
        const alpha = 0.45 + clamp(smooth[i] * 1.6) * 0.55;

        ctx.strokeStyle = `rgba(120, 224, 255, ${alpha})`;
        ctx.lineWidth = Math.max(1.4, bw * 0.42);
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(90, 200, 255, 0.9)";
        ctx.shadowBlur = 8 + level * 18;
        ctx.beginPath();
        ctx.moveTo(x, mid - h);
        ctx.lineTo(x, mid + h);
        ctx.stroke();
      }

      // soft baseline
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(120, 224, 255, ${0.12 + energy * 0.18})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(W, mid);
      ctx.stroke();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [spectrumRef, levelRef, energyRef]);

  return <canvas ref={ref} className={className} style={{ width: 360, height: 110 }} />;
}

/** Bottom command-bar dot line. */
export function DotLine({ levelRef, energyRef }: Omit<Props, "spectrumRef" | "className">) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 620;
    const H = 20;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const N = 96;
    const vals = new Float32Array(N);
    let raf = 0;
    let t = 0;
    const render = () => {
      t += 0.016;
      const level = levelRef.current ?? 0;
      const energy = energyRef.current ?? 0.2;
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      for (let i = 0; i < N; i++) {
        const wave = Math.sin(t * 2.4 - i * 0.28) * 0.5 + 0.5;
        const pulse = Math.exp(-(((i / N - ((t * 0.22) % 1.2)) * 6) ** 2));
        const target = 0.12 + energy * 0.15 + level * 1.5 * wave + pulse * (0.25 + level);
        vals[i] = lerp(vals[i], clamp(target, 0, 1), 0.18);
        const h = 1.2 + vals[i] * (mid - 2);
        const x = (i + 0.5) * (W / N);
        ctx.strokeStyle = `rgba(120, 224, 255, ${0.3 + vals[i] * 0.7})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(90,200,255,.8)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(x, mid - h);
        ctx.lineTo(x, mid + h);
        ctx.stroke();
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [levelRef, energyRef]);
  return <canvas ref={ref} style={{ width: 620, height: 20 }} />;
}
