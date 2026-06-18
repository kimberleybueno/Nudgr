"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { N } from "@/lib/colors";

interface Props {
  onClose: () => void;
  /** Add a single to-do to Today. Called once per captured item. */
  onAddTypedTodo: (text: string) => void;
  isDesktop?: boolean;
}

/* =========================================================================
   Web Speech API typing (it's not in the standard DOM lib).
   ========================================================================= */
interface SR_Result { 0: { transcript: string }; isFinal: boolean }
interface SR_ResultList { length: number; [i: number]: SR_Result }
interface SR_Event { resultIndex: number; results: SR_ResultList }
interface SR_ErrorEvent { error: string }
interface SR_Instance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((e: Event) => void) | null;
  onend: ((e: Event) => void) | null;
  onresult: ((e: SR_Event) => void) | null;
  onerror: ((e: SR_ErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
interface SR_Ctor { new(): SR_Instance }
type State = "idle" | "listening" | "denied" | "unsupported";

/* =========================================================================
   Capture helpers
   ========================================================================= */

/**
 * Split a transcript into discrete to-dos. Demo rules per spec sec 8:
 *   - hard split on newlines
 *   - soft split on ". ", "; ", " then "
 *   - drop empties, trim
 *   - cap each item to ~120 chars so a runaway capture doesn't dump
 *     a paragraph in as one to-do
 */
function splitTranscript(raw: string): string[] {
  if (!raw) return [];
  const normalized = raw
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/\.\s+|;\s+|\bthen\b\s+|\bnext\b\s+|\band then\b\s+/i)
    .flatMap((s) => s.split("\n"))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.length > 120 ? s.slice(0, 120).trim() : s));
  return parts;
}

/* =========================================================================
   VoiceScreen (handoff sec 8 — real)
   ========================================================================= */
export default function VoiceScreen({ onClose, onAddTypedTodo, isDesktop = false }: Props) {
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [levels, setLevels] = useState<number[]>([0.15, 0.2, 0.25, 0.2, 0.18, 0.22, 0.15]);

  const recognitionRef = useRef<SR_Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Feature detect SpeechRecognition once on mount. */
  const SR = useMemo<SR_Ctor | null>(() => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as { SpeechRecognition?: SR_Ctor; webkitSpeechRecognition?: SR_Ctor };
    return (w.SpeechRecognition ?? w.webkitSpeechRecognition) ?? null;
  }, []);

  useEffect(() => {
    if (!SR) setState("unsupported");
  }, [SR]);

  /* ------- Stop / clean up everything ------- */
  const stopAll = useCallback(() => {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch { /* ignore */ }
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  /* Esc closes (and finalizes whatever is captured). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finishCapture(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText, interim]);

  /* Cleanup on unmount no matter what. */
  useEffect(() => {
    inputRef.current?.focus();
    return () => stopAll();
  }, [stopAll]);

  /* ------- Start listening ------- */
  const startListening = async () => {
    if (state === "listening") return;
    if (!SR) { setState("unsupported"); return; }

    // Reset transcript buffers
    setInterim("");
    setFinalText("");

    // Permission + raw stream for the analyser (the SR API doesn't hand back a stream).
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("denied");
      return;
    }
    streamRef.current = stream;

    // Wire up AnalyserNode for the waveform.
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      src.connect(analyser);
      analyserRef.current = analyser;
    } catch {
      // Waveform is decorative; recognition still works without it.
      analyserRef.current = null;
    }

    // Drive the bars from time-domain RMS.
    const tick = () => {
      const a = analyserRef.current;
      if (a) {
        const buf = new Uint8Array(a.frequencyBinCount);
        a.getByteTimeDomainData(buf);
        // Compute RMS energy (0..1)
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        // 7 bars: distribute with a soft envelope so middle bars peak higher
        const envelope = [0.55, 0.78, 0.95, 1.0, 0.95, 0.78, 0.55];
        const next = envelope.map((e, i) => {
          const jitter = 0.85 + ((i * 13) % 30) / 200; // tiny variation per bar
          return Math.min(1, Math.max(0.08, rms * 2.4 * e * jitter));
        });
        setLevels(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Start recognition.
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
    rec.onresult = (e: SR_Event) => {
      let interimChunk = "";
      let finalChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interimChunk += r[0].transcript;
      }
      setInterim(interimChunk);
      if (finalChunk) {
        setFinalText((prev) => (prev ? prev + " " : "") + finalChunk.trim());
      }
    };
    rec.onerror = (e: SR_ErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setState("denied");
        stopAll();
      }
    };
    rec.onend = () => {
      // The browser may end recognition spontaneously (silence, idle). If we
      // are still in "listening", keep the screen in idle so the user can
      // re-tap or finalize. Don't auto-capture on spontaneous end.
    };
    recognitionRef.current = rec;
    try {
      rec.start();
      setState("listening");
    } catch {
      // Some browsers throw if start() is called twice; reset.
      setState("idle");
      stopAll();
    }
  };

  /* ------- Stop + finalize → push items + close ------- */
  function finishCapture() {
    // Collect whatever we have BEFORE tearing down (avoids stale closure).
    const captured = (finalText + (interim ? " " + interim : "")).trim();
    stopAll();
    const items = splitTranscript(captured);
    if (items.length > 0) {
      for (const it of items) onAddTypedTodo(it);
    }
    setState("idle");
    setInterim("");
    setFinalText("");
    onClose();
  }

  /* ------- Mic tap dispatch ------- */
  const onMicTap = () => {
    if (state === "listening") { finishCapture(); return; }
    if (state === "denied" || state === "unsupported") return;
    startListening();
  };

  /* ------- Typed fallback submit (unchanged) ------- */
  const onTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    onAddTypedTodo(v);
    setText("");
    onClose();
  };

  const listening = state === "listening";
  const displayed = (finalText + (interim ? (finalText ? " " : "") + interim : "")).trim();

  return (
    <div className="fixed inset-0 z-[120] anim-fade" style={{ background: N.cream }}>
      <div
        className="mx-auto flex flex-col"
        style={{
          maxWidth: isDesktop ? 520 : "100%",
          padding: isDesktop ? "32px 24px" : "16px 20px",
          minHeight: "100vh",
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <button
            type="button"
            onClick={finishCapture}
            aria-label={listening ? "Stop and use what was captured" : "Close"}
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 36, height: 36, borderRadius: 999,
              background: N.creamCard, border: `1px solid ${N.line}`, color: N.ink,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>

          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: listening ? N.sage : N.sageDeep,
              background: listening ? N.sageTint22 : N.sageTint14,
              padding: "5px 10px",
              borderRadius: 999,
            }}
          >
            {listening ? "Listening" : "Speak"}
          </span>
        </div>

        {/* Live transcript */}
        <div
          className="text-center"
          style={{
            minHeight: 80,
            padding: "0 4px 16px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {displayed ? (
            <p
              className="font-display"
              style={{
                fontSize: 19,
                lineHeight: 1.35,
                fontWeight: 500,
                color: N.ink,
                letterSpacing: "-0.01em",
                maxWidth: 460,
              }}
            >
              {finalText}
              {finalText && interim ? " " : ""}
              {interim && (
                <span style={{ color: N.inkSoft, fontStyle: "italic" }}>{interim}</span>
              )}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: N.inkSoft }}>
              {listening
                ? "Talking… speak normally."
                : state === "denied"
                  ? "Mic access is off. Type instead below."
                  : state === "unsupported"
                    ? "This browser doesn't do voice yet. Type below."
                    : "Tap the mic and say what you want to get done."}
            </p>
          )}
        </div>

        {/* Mic + rings + waveform */}
        <div className="flex flex-col items-center text-center" style={{ marginTop: 8, marginBottom: 32 }}>
          <div className="relative" style={{ width: 160, height: 160 }}>
            {/* Pulse rings while listening */}
            {listening && (
              <>
                <span
                  aria-hidden="true"
                  className="anim-voice-ring absolute"
                  style={{
                    inset: 21,
                    borderRadius: 999,
                    border: `2px solid ${N.sage}`,
                  }}
                />
                <span
                  aria-hidden="true"
                  className="anim-voice-ring absolute"
                  style={{
                    inset: 21,
                    borderRadius: 999,
                    border: `2px solid ${N.sage}`,
                    animationDelay: "0.55s",
                  }}
                />
                <span
                  aria-hidden="true"
                  className="anim-voice-ring absolute"
                  style={{
                    inset: 21,
                    borderRadius: 999,
                    border: `2px solid ${N.sage}`,
                    animationDelay: "1.1s",
                  }}
                />
              </>
            )}

            <button
              type="button"
              onClick={onMicTap}
              disabled={state === "denied" || state === "unsupported"}
              aria-label={listening ? "Stop and capture" : "Tap to speak"}
              aria-pressed={listening}
              className="absolute flex items-center justify-center"
              style={{
                inset: 21,
                borderRadius: 999,
                background: listening ? N.sageDarkest : N.sageDeep,
                color: "#fff",
                border: "none",
                boxShadow: listening ? N.shadow : N.shadowSoft,
                cursor: state === "denied" || state === "unsupported" ? "not-allowed" : "pointer",
                opacity: state === "denied" || state === "unsupported" ? 0.55 : 1,
                transition: "background 0.18s ease, box-shadow 0.2s ease",
              }}
            >
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                <path
                  d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Waveform bars */}
          <div
            aria-hidden="true"
            className="flex items-end justify-center"
            style={{
              marginTop: 18,
              gap: 6,
              height: 36,
              opacity: listening ? 1 : 0.35,
              transition: "opacity 0.2s ease",
            }}
          >
            {levels.map((level, i) => (
              <span
                key={i}
                className="block rounded-full"
                style={{
                  width: 4,
                  height: `${Math.round(level * 36)}px`,
                  minHeight: 4,
                  background: listening ? N.sageDeep : N.line,
                  transition: "height 80ms linear, background 0.2s ease",
                }}
              />
            ))}
          </div>

          {/* Hint */}
          <p
            style={{
              marginTop: 14,
              fontSize: 12.5,
              color: N.inkSoft,
              letterSpacing: "0.02em",
            }}
          >
            {listening
              ? "Tap the mic when you're done."
              : state === "denied"
                ? "Allow mic access in your browser to enable voice."
                : state === "unsupported"
                  ? "Voice runs in Chrome and Safari."
                  : "Tap to speak"}
          </p>
        </div>

        {/* Typed fallback (always present) */}
        <form
          onSubmit={onTypedSubmit}
          className="flex items-center gap-2"
          style={{
            background: N.creamCard,
            borderRadius: 14,
            border: `1px solid ${text.trim() ? N.lineStrong : N.line}`,
            padding: "8px 8px 8px 12px",
            transition: "border-color 0.18s ease",
            boxShadow: N.shadowSoft,
            marginTop: "auto",
            marginBottom: isDesktop ? 16 : 24,
          }}
        >
          <span
            aria-hidden="true"
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              background: N.sageTint14,
              color: N.sageDeep,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Or type a to-do"
            aria-label="Type a to-do"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14.5, color: N.ink, minWidth: 0 }}
          />
          {text.trim() && (
            <button
              type="submit"
              className="rounded-full text-white"
              style={{
                background: N.sageDeep,
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 14px",
              }}
            >
              Add
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
