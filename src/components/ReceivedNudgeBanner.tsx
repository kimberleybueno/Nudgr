"use client";

import { useEffect, useState } from "react";
import { N } from "@/lib/colors";

interface Props {
  /** First name only; used in "{Name} nudged you" line. */
  senderName: string;
  /** First initial for the avatar. */
  senderInitial: string;
  /** Optional warm follow-on line (Fraunces italic, tan-soft). */
  message?: string;
  /**
   * Trigger the wiggle on mount and whenever the value changes. Pass a
   * fresh number (e.g. Date.now()) when a new nudge arrives so the
   * banner re-wiggles even if the sender is the same.
   */
  pulseKey?: number;
}

/**
 * Received-nudge banner (handoff sec 11 + sec 10 Pact detail).
 *
 *   Dark sage-darkest card. Sender avatar uses the light --sage-light
 *   fill with dark ink so it reads on the dark background. The avatar
 *   plays the same 0.85s nudge-wiggle when the banner mounts or
 *   pulseKey changes.
 *
 * House rules: no emoji, no em dashes. Tone is encouraging, never
 * naggy.
 */
export default function ReceivedNudgeBanner({
  senderName, senderInitial, message, pulseKey,
}: Props) {
  const [wiggle, setWiggle] = useState(true);

  useEffect(() => {
    setWiggle(false);
    const raf = requestAnimationFrame(() => setWiggle(true));
    const clear = window.setTimeout(() => setWiggle(false), 900);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
    };
  }, [pulseKey]);

  return (
    <div
      role="status"
      style={{
        background: N.sageDarkest,
        color: "#fff",
        borderRadius: 16,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: N.shadowSoft,
      }}
    >
      <span
        aria-hidden="true"
        className={wiggle ? "anim-wiggle" : ""}
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: N.sageLight,
          color: N.sageDarkest,
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {senderInitial}
      </span>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>
          {senderName} nudged you
        </div>
        {message && (
          <div
            className="font-display"
            style={{
              fontSize: 13.5,
              fontStyle: "italic",
              color: N.tanSoft,
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
