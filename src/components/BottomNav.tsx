"use client";

import { N } from "@/lib/colors";
import type { TabId } from "@/types";

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
} as const;

/* Inline line icons, 24px grid, ~1.7 stroke, rounded caps */
const ICON = {
  goals: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  pacts: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.4 7.2L4 21l1.7-4.7A8 8 0 1 1 21 12z" />
    </svg>
  ),
  crew: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="17" cy="10" r="2.6" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M14.5 14.8c2 0 6.5 1.5 6.5 4.2" />
    </svg>
  ),
  you: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-3.7 3.3-6.4 7.5-6.4s7.5 2.7 7.5 6.4" />
    </svg>
  ),
  mic: (
    <svg width="26" height="26" viewBox="0 0 24 24" {...stroke} stroke="#fff" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
    </svg>
  ),
};

const ITEMS: NavItem[] = [
  { id: "goals", label: "Goals", icon: ICON.goals },
  { id: "pacts", label: "Pacts", icon: ICON.pacts },
  { id: "crew",  label: "Crew",  icon: ICON.crew  },
  { id: "you",   label: "You",   icon: ICON.you   },
];

interface Props {
  active: TabId;
  onChange: (t: TabId) => void;
  /** Tap the center elevated mic. */
  onSpeak: () => void;
}

/**
 * Mobile tab bar per handoff sec 16.
 *
 *   Cream-card surface, top hairline.
 *   5 visual items: Goals, Pacts, center elevated Speak mic, Crew, You.
 *   Active --sage-deep, inactive --ink-faint.
 *
 * Tap targets are at least 44px tall per the kit.
 */
export default function BottomNav({ active, onChange, onSpeak }: Props) {
  const [left, right] = [ITEMS.slice(0, 2), ITEMS.slice(2)];

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-30 pb-safe"
      style={{
        background: N.creamCard,
        borderTop: `1px solid ${N.line}`,
      }}
    >
      <div
        className="relative max-w-[440px] mx-auto flex items-end"
        style={{ paddingTop: 8, paddingBottom: 12, minHeight: 56 }}
      >
        {left.map((it) => (
          <TabBtn key={it.id} item={it} active={active === it.id} onClick={() => onChange(it.id)} />
        ))}

        {/* Center elevated mic */}
        <div className="flex-1 flex items-end justify-center" style={{ position: "relative" }}>
          <button
            type="button"
            onClick={onSpeak}
            aria-label="Speak a to-do"
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: N.sageDeep,
              color: "#fff",
              border: "none",
              boxShadow: "0 8px 20px -8px rgba(47, 74, 53, 0.55), 0 2px 6px -2px rgba(47, 74, 53, 0.4)",
              transform: "translateY(-16px)",
            }}
          >
            {ICON.mic}
          </button>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: -2,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: N.sageDeep,
            }}
          >
            Speak
          </span>
        </div>

        {right.map((it) => (
          <TabBtn key={it.id} item={it} active={active === it.id} onClick={() => onChange(it.id)} />
        ))}
      </div>
    </nav>
  );
}

function TabBtn({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className="flex-1 flex flex-col items-center gap-1"
      style={{
        color: active ? N.sageDeep : N.inkFaint,
        minHeight: 44,
        padding: "4px 0",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {item.icon}
      </span>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        {item.label}
      </span>
    </button>
  );
}
