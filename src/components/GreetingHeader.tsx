"use client";

import { N } from "@/lib/colors";

interface Props {
  name: string;
  /** Round + tap (opens the New goal sheet) */
  onCreate: () => void;
}

/**
 * Greeting header per design_handoff_nudgr_app/README.md sec 4.
 *
 *   Eyebrow date (WEDNESDAY, JUNE 11), H1 greeting (Morning, name.),
 *   round + button on the right for New goal.
 *
 * House rules: no emoji, no em dashes.
 */
export default function GreetingHeader({ name, onCreate }: Props) {
  const now = new Date();
  const dateLine = now
    .toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();
  const hour = now.getHours();
  const greet = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const safeName = (name || "friend").trim();

  return (
    <header className="px-5 pt-7 pb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.09em",
            color: N.sageDeep,
          }}
        >
          {dateLine}
        </p>
        <h1
          className="font-display"
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: N.ink,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginTop: 6,
          }}
        >
          {greet}, {safeName}.
        </h1>
      </div>

      <button
        type="button"
        onClick={onCreate}
        aria-label="New goal"
        className="shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 44,
          height: 44,
          background: N.sageDeep,
          color: "#fff",
          boxShadow: N.shadowSoft,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}
