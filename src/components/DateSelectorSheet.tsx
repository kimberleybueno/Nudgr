"use client";

import { useMemo, useState } from "react";
import { N } from "@/lib/colors";
import Sheet from "./Sheet";

interface Props {
  open: boolean;
  onClose: () => void;
  /** ISO date string YYYY-MM-DD, or null when nothing is set yet. */
  value: string | null;
  onPick: (iso: string | null) => void;
  isDesktop?: boolean;
}

/**
 * Date picker per next-pass plan.
 *   Cream-card calendar with sage-deep selected day. Quick chips above
 *   the grid (None / Today / Tomorrow / +3d / +7d) stay as shortcuts.
 *   Tap a chip or a calendar day to pick and close.
 */
export default function DateSelectorSheet({ open, onClose, value, onPick, isDesktop }: Props) {
  // Anchor month for the displayed grid. Defaults to the selected date's month,
  // or today.
  const [anchor, setAnchor] = useState(() => (value ? new Date(value) : new Date()));

  const today = new Date();
  const todayIso = ymd(today);

  const chips = useMemo(() => {
    const make = (offset: number, label: string) => {
      const d = addDays(today, offset);
      return { iso: ymd(d), label, day: d.getDate() };
    };
    return [
      make(0, "Today"),
      make(1, "Tomorrow"),
      make(3, "+3d"),
      make(7, "+7d"),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const monthLabel = anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const grid = useMemo(() => buildMonthGrid(anchor), [anchor]);

  const select = (iso: string | null) => {
    onPick(iso);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      isDesktop={isDesktop}
      title="Due day"
      subtitle="Pick a day, or use a shortcut."
    >
      {/* Quick chips row */}
      <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 14 }}>
        <Chip selected={value == null} onClick={() => select(null)} variant="ghost">
          None
        </Chip>
        {chips.map((c) => (
          <Chip key={c.iso} selected={value === c.iso} onClick={() => select(c.iso)}>
            {c.label} ({c.day})
          </Chip>
        ))}
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setAnchor(addMonths(anchor, -1))}
          aria-label="Previous month"
          className="flex items-center justify-center"
          style={{ width: 32, height: 32, color: N.inkSoft }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span
          className="font-display"
          style={{ fontSize: 15, fontWeight: 600, color: N.ink, letterSpacing: 0 }}
        >
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => setAnchor(addMonths(anchor, 1))}
          aria-label="Next month"
          className="flex items-center justify-center"
          style={{ width: 32, height: 32, color: N.inkSoft }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Weekday header (Monday first) */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 4,
        }}
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span
            key={i}
            className="text-center"
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: N.inkFaint,
              padding: "4px 0",
            }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          background: "transparent",
          border: `1px solid ${N.line}`,
          borderRadius: 14,
          padding: 6,
        }}
      >
        {grid.map((cell) => {
          const iso = cell ? ymd(cell) : "";
          const selected = !!cell && iso === value;
          const isToday = !!cell && iso === todayIso;
          const inMonth = !!cell && cell.getMonth() === anchor.getMonth();
          return (
            <button
              key={iso || `pad-${Math.random()}`}
              type="button"
              disabled={!cell}
              onClick={() => cell && select(iso)}
              className="flex items-center justify-center"
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 10,
                background: selected ? N.sageDeep : "transparent",
                color: selected
                  ? N.cream
                  : !inMonth
                  ? "transparent"
                  : isToday
                  ? N.sageDeep
                  : N.ink,
                border: `1px solid ${selected ? "transparent" : isToday ? N.sageDeep : "transparent"}`,
                fontSize: 13.5,
                fontWeight: selected || isToday ? 600 : 500,
                fontFamily: "var(--font-display), Georgia, serif",
                cursor: cell ? "pointer" : "default",
                transition: "background 0.12s ease, color 0.12s ease",
              }}
            >
              {cell ? cell.getDate() : ""}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ---------------- helpers ---------------- */

function ymd(d: Date): string {
  // Local-date YYYY-MM-DD (avoid UTC shift from toISOString().slice(0, 10))
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(d.getMonth() + n);
  return x;
}

/**
 * Build a Monday-first 6-row grid. Padding cells are null. Days outside the
 * anchor month appear faded (handled in render via inMonth).
 */
function buildMonthGrid(anchor: Date): (Date | null)[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // 0=Mon..6=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ---------------- chip primitive ---------------- */

function Chip({
  selected,
  onClick,
  children,
  variant = "filled",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "filled" | "ghost";
}) {
  const base: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 11px",
    borderRadius: 999,
    border: "1px solid transparent",
    transition: "background 0.12s ease, color 0.12s ease, border-color 0.12s ease",
  };
  if (selected) {
    return (
      <button type="button" onClick={onClick}
              style={{ ...base, background: N.sage, color: "#fff", border: `1px solid ${N.sage}` }}>
        {children}
      </button>
    );
  }
  if (variant === "ghost") {
    return (
      <button type="button" onClick={onClick}
              style={{ ...base, background: "transparent", color: N.inkSoft, border: `1px solid ${N.line}` }}>
        {children}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick}
            style={{ ...base, background: N.sageTint14, color: N.sageDeep }}>
      {children}
    </button>
  );
}
