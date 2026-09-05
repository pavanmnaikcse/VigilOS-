import { useCallback, useEffect, useRef, useState } from "react";
import { clamp, lerp } from "@/lib/hud";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

export type VoiceEngine = {
  /** smoothed 0..1 microphone level, read inside rAF loops (no re-render) */
  levelRef: React.RefObject<number>;
  /** 64-bin smoothed spectrum, read inside rAF loops */
  spectrumRef: React.RefObject<Float32Array>;
  listening: boolean;
  speaking: boolean;
  transcript: string;
  micAvailable: boolean;
  speechAvailable: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;
};

const BINS = 64;

export function useVoiceEngine(onFinal?: (text: string) => void): VoiceEngine {
  const levelRef = useRef(0);
  const spectrumRef = useRef<Float32Array>(new Float32Array(BINS));
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micAvailable, setMicAvailable] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const wantRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMicAvailable(!!navigator.mediaDevices?.getUserMedia);
    setSpeechAvailable(
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    );
  }, []);

  // idle simulation + live analysis loop
  useEffect(() => {
    let t = 0;
    const buf = new Uint8Array(1024);
    const loop = () => {
      t += 0.016;
      const analyser = analyserRef.current;
      if (analyser) {
        analyser.getByteFrequencyData(buf as any);
        const n = analyser.frequencyBinCount;
        let sum = 0;
        for (let i = 0; i < BINS; i++) {
          const from = Math.floor((i / BINS) ** 1.4 * n);
          const to = Math.max(from + 1, Math.floor(((i + 1) / BINS) ** 1.4 * n));
          let s = 0;
          for (let j = from; j < to && j < n; j++) s += buf[j];
          const v = clamp(s / (to - from) / 190);
          spectrumRef.current[i] = lerp(spectrumRef.current[i], v, 0.28);
          sum += v;
        }
        const target = clamp((sum / BINS) * 2.1);
        levelRef.current = lerp(levelRef.current, target, target > levelRef.current ? 0.35 : 0.08);
      } else {
        // graceful idle waveform when no microphone
        for (let i = 0; i < BINS; i++) {
          const v =
            0.05 +
            0.045 * Math.sin(t * 1.6 + i * 0.35) * Math.sin(t * 0.31 + i * 0.11) +
            0.02 * Math.sin(t * 3.7 + i);
          spectrumRef.current[i] = lerp(spectrumRef.current[i], Math.abs(v), 0.1);
        }
        levelRef.current = lerp(levelRef.current, 0.06 + 0.03 * Math.sin(t * 0.9), 0.05);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // derive a low-frequency "speaking" boolean for React-side reactions
  useEffect(() => {
    const id = setInterval(() => {
      setSpeaking((s) => {
        const lv = levelRef.current;
        if (!s && lv > 0.16) return true;
        if (s && lv < 0.08) return false;
        return s;
      });
    }, 90);
    return () => clearInterval(id);
  }, []);

  const teardownAudio = useCallback(() => {
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, []);

  const start = useCallback(async () => {
    wantRef.current = true;
    setError(null);
    setListening(true);
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.72;
        src.connect(analyser);
        analyserRef.current = analyser;
      }
    } catch {
      setError("MIC UNAVAILABLE — SIMULATED FEED");
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      try {
        const rec: SpeechRecognitionLike = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onresult = (e: any) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            const text = res[0].transcript as string;
            if (res.isFinal) {
              setTranscript(text.trim());
              onFinalRef.current?.(text.trim());
            } else {
              interim += text;
            }
          }
          if (interim) setTranscript(interim.trim());
        };
        rec.onerror = (e: any) => {
          if (e?.error === "not-allowed") setError("SPEECH ACCESS DENIED");
        };
        rec.onend = () => {
          if (wantRef.current) {
            try {
              rec.start();
            } catch {
              /* already started */
            }
          }
        };
        recRef.current = rec;
        rec.start();
      } catch {
        setError("SPEECH ENGINE UNAVAILABLE");
      }
    } else {
      setError((p) => p ?? "SPEECH ENGINE UNAVAILABLE");
    }
  }, []);

  const stop = useCallback(() => {
    wantRef.current = false;
    setListening(false);
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    recRef.current = null;
    teardownAudio();
  }, [teardownAudio]);

  const toggle = useCallback(() => {
    if (wantRef.current) stop();
    else void start();
  }, [start, stop]);

  useEffect(() => () => stop(), [stop]);

  return {
    levelRef,
    spectrumRef,
    listening,
    speaking,
    transcript,
    micAvailable,
    speechAvailable,
    error,
    start,
    stop,
    toggle,
  };
}
