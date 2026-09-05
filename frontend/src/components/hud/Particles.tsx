import { useEffect, useRef } from "react";

type Props = {
  levelRef: React.RefObject<number>;
  energyRef: React.RefObject<number>;
  /** normalised cursor position within the HUD square (-1..1) */
  pointerRef: React.RefObject<{ x: number; y: number }>;
  size: number;
};

type P = { a: number; r: number; sp: number; s: number; life: number; drift: number };

/** Sparse orbital particle field constrained to the HUD's circular geometry. */
export function Particles({ levelRef, energyRef, pointerRef, size }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const c = size / 2;
    const K = size / 800;

    const rings = [228, 228, 250, 300, 352, 392, 176];
    const parts: P[] = Array.from({ length: 46 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: rings[Math.floor(Math.random() * rings.length)] * K,
      sp: (Math.random() > 0.5 ? 1 : -1) * (0.06 + Math.random() * 0.16),
      s: 0.7 + Math.random() * 1.4,
      life: Math.random(),
      drift: 0,
    }));

    let raf = 0;
    let last = performance.now();
    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const level = levelRef.current ?? 0;
      const energy = energyRef.current ?? 0.2;
      const ptr = pointerRef.current ?? { x: 0, y: 0 };
      ctx.clearRect(0, 0, size, size);

      const speedMul = 1 + energy * 1.6 + level * 3;
      for (const p of parts) {
        p.a += p.sp * dt * speedMul;
        p.life += dt * (0.25 + level);
        const px = c + Math.cos(p.a) * p.r + ptr.x * 5;
        const py = c + Math.sin(p.a) * p.r + ptr.y * 5;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.life * 3));
        const alpha = tw * (0.25 + energy * 0.5 + level * 0.5);
        ctx.beginPath();
        ctx.fillStyle = `rgba(150, 232, 255, ${alpha})`;
        ctx.shadowColor = "rgba(90,200,255,.9)";
        ctx.shadowBlur = 8;
        ctx.arc(px, py, p.s * (1 + level * 0.6), 0, Math.PI * 2);
        ctx.fill();

        // short energy trail on loud passages
        if (level > 0.2) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(150, 232, 255, ${alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.arc(c, c, p.r, p.a - 0.12 * Math.sign(p.sp), p.a, p.sp < 0);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [levelRef, energyRef, pointerRef, size]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
