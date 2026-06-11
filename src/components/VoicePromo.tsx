"use client";

import { N } from "@/lib/colors";

interface Props {
  /** Tap behavior. Voice capture screen does not exist yet, so the parent
   *  can wire this to a placeholder toast or to a future route. */
  onTap?: () => void;
}

/**
 * Voice promo card per design_handoff_nudgr_app/README.md sec 4.
 *
 *   Dark sage-darkest rounded card, mic tile, "Add a to-do by voice".
 *   Shown on mobile only. On desktop the sidebar "Speak a to-do" button
 *   covers this affordance.
 *
 * House rules: no emoji, no em dashes.
 */
export default function VoicePromo({ onTap }: Props) {
  const handle = () => {
    if (onTap) onTap();
    else if (typeof window !== "undefined") {
      // Honest placeholder until the Voice screen ships.
      alert("Voice capture is coming soon. Type a task in the Today list to add one for now.");
    }
  };

  return (
    <section className="px-4 pt-3">
      <button
        type="button"
        onClick={handle}
        className="w-full text-left flex items-center"
        style={{
          background: N.sageDarkest,
          color: N.cream,
          borderRadius: 20,
          padding: "16px 16px",
          gap: 14,
          boxShadow: N.shadow,
        }}
      >
        <span
          aria-hidden="true"
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: "rgba(196, 169, 138, 0.22)",
            color: N.tanSoft,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <div
            className="font-display"
            style={{ fontSize: 16, fontWeight: 600, color: N.cream, lineHeight: 1.2 }}
          >
            Add a to-do by voice
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(247, 244, 236, 0.7)", marginTop: 2 }}>
            Tap the mic, say what you need to do.
          </div>
        </div>

        <span
          aria-hidden="true"
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "rgba(247, 244, 236, 0.12)",
            color: N.cream,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </section>
  );
}
