"use client";

import { useEffect, useRef, useState } from "react";
import { N } from "@/lib/colors";

interface Props {
  onClose: () => void;
  /** Adds a typed to-do to the user's Today list (no real STT here yet). */
  onAddTypedTodo: (text: string) => void;
  isDesktop?: boolean;
}

/**
 * Voice screen placeholder for the sec 16 Speak action.
 *
 * Real STT + the listening-rings-and-waveform interaction lands in sec 8.
 * For now this is a full-screen takeover that shows the mic affordance,
 * an honest "Voice capture is coming" hint, and a typed fallback so the
 * Speak action does something useful end-to-end.
 *
 * House rules: no emoji, no em dashes.
 */
export default function VoiceScreen({ onClose, onAddTypedTodo, isDesktop = false }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    onAddTypedTodo(v);
    setText("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] anim-fade"
      style={{ background: N.cream }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{
          maxWidth: isDesktop ? 520 : "100%",
          padding: isDesktop ? "32px 24px" : "16px 20px",
          minHeight: "100vh",
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: N.creamCard,
              border: `1px solid ${N.line}`,
              color: N.ink,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: N.sageDeep,
              background: N.sageTint14,
              padding: "5px 10px",
              borderRadius: 999,
            }}
          >
            Speak
          </span>
        </div>

        {/* Mic affordance */}
        <div
          className="flex flex-col items-center text-center"
          style={{ marginTop: isDesktop ? 56 : 32, marginBottom: 32 }}
        >
          <button
            type="button"
            aria-label="Voice capture coming soon"
            className="flex items-center justify-center"
            style={{
              width: 118,
              height: 118,
              borderRadius: 999,
              background: N.sageDeep,
              color: "#fff",
              border: "none",
              boxShadow: N.shadowSoft,
              opacity: 0.85,
              cursor: "default",
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
          <p
            className="font-display"
            style={{
              marginTop: 22,
              fontSize: 24,
              fontWeight: 500,
              color: N.ink,
              letterSpacing: "-0.01em",
            }}
          >
            Voice capture, coming soon.
          </p>
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: N.inkSoft,
              maxWidth: 320,
            }}
          >
            We&apos;re finishing the listening interaction. In the meantime, type your to-do below and it lands in Today.
          </p>
        </div>

        {/* Typed fallback */}
        <form
          onSubmit={submit}
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
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
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
