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

const ICON = {
  goals: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  pacts: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.4 7.2L4 21l1.7-4.7A8 8 0 1 1 21 12z" />
    </svg>
  ),
  crew: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="17" cy="10" r="2.6" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M14.5 14.8c2 0 6.5 1.5 6.5 4.2" />
    </svg>
  ),
  you: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-3.7 3.3-6.4 7.5-6.4s7.5 2.7 7.5 6.4" />
    </svg>
  ),
  mic: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} stroke="#fff" aria-hidden="true">
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
  onSpeak: () => void;
  userName: string;
  userInitial: string;
  streak: number;
}

/**
 * Desktop sidebar per handoff sec 16.
 *
 *   258px wide, cream-card background, line border on right.
 *   Wordmark at top. Nav items as rows; active sits on a sage-tint-14
 *   pill with sage-deep icon. A sage-deep "Speak a to-do" button sits
 *   below the nav. Profile chip pinned to the bottom (avatar + name +
 *   tan streak line).
 */
export default function SideNav({ active, onChange, onSpeak, userName, userInitial, streak }: Props) {
  return (
    <aside
      aria-label="Primary"
      className="fixed left-0 top-0 bottom-0 z-30 flex flex-col"
      style={{
        width: 258,
        background: N.creamCard,
        borderRight: `1px solid ${N.line}`,
        padding: "24px 16px",
      }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 mb-8" style={{ paddingLeft: 8 }}>
        <span
          aria-hidden="true"
          className="block rounded-full"
          style={{
            width: 11,
            height: 11,
            background: N.sage,
            boxShadow: "0 0 0 4px rgba(122, 158, 126, 0.22)",
          }}
        />
        <span
          className="font-display"
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: N.sageDarkest,
            letterSpacing: "-0.02em",
          }}
        >
          Nudgr
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 mb-3">
        {ITEMS.map((it) => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center gap-3 rounded-full"
              style={{
                background: isActive ? N.sageTint14 : "transparent",
                color: isActive ? N.sageDeep : N.inkSoft,
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 500,
                textAlign: "left",
                minHeight: 44,
                transition: "background 0.12s ease, color 0.12s ease",
              }}
            >
              <span className="shrink-0 flex items-center justify-center" style={{ width: 22 }}>
                {it.icon}
              </span>
              {it.label}
            </button>
          );
        })}
      </nav>

      {/* Speak a to-do */}
      <button
        type="button"
        onClick={onSpeak}
        aria-label="Speak a to-do"
        className="flex items-center justify-center gap-2 rounded-full text-white"
        style={{
          background: N.sageDeep,
          padding: "12px 16px",
          fontSize: 14,
          fontWeight: 600,
          boxShadow: N.shadowSoft,
          minHeight: 44,
        }}
      >
        {ICON.mic}
        Speak a to-do
      </button>

      {/* Profile chip pinned to the bottom */}
      <div
        className="flex items-center gap-3 mt-auto rounded-2xl"
        style={{
          background: N.cream,
          border: `1px solid ${N.line}`,
          padding: "10px 12px",
        }}
      >
        <span
          aria-hidden="true"
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            background: N.sageDeep,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {userInitial}
        </span>
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: N.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userName}
          </div>
          <div style={{ fontSize: 11.5, color: N.tan, fontWeight: 500 }}>
            {streak > 0 ? `${streak} day streak` : "Start your streak"}
          </div>
        </div>
      </div>
    </aside>
  );
}
