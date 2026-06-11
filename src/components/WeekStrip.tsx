"use client";

import { useMemo, useState } from "react";
import { N } from "@/lib/colors";

interface Props {
  /** Day of month (1-31) of the currently selected date in the displayed week. */
  selectedDay: number;
  onSelect: (day: number) => void;
  /** Days (1-31) that have at least one task, used for the dot indicator. */
  daysWithTasks?: Set<number>;
}

/**
 * Week date strip per design_handoff_nudgr_app/README.md sec 4.
 *
 *   Horizontal scrolling row of 7 day pills (46x62, 16px radius).
 *   Weekday letter (11px 600) over date number (Fraunces 600, 18px).
 *   Selected = sage-deep fill, cream text. Others = cream-card + line.
 *   Tap selects. Left/right chevrons step through weeks.
 */
export default function WeekStrip({ selectedDay, onSelect, daysWithTasks }: Props) {
  // Anchor: a Date inside the displayed week. Starts at today, can shift +/- 7 days.
  const [anchor, setAnchor] = useState(() => new Date());

  const days = useMemo(() => buildWeek(anchor), [anchor]);
  const today = new Date();
  const todayKey = ymd(today);
  const isThisMonth = (d: Date) =>
    d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();

  return (
    <section className="px-5 pt-1 pb-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAnchor(addDays(anchor, -7))}
          aria-label="Previous week"
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: "transparent",
            color: N.inkSoft,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          role="tablist"
          aria-label="Days of this week"
          className="flex-1 flex justify-between overflow-x-auto no-scrollbar"
          style={{ gap: 6 }}
        >
          {days.map((d) => {
            const selected =
              isThisMonth(d) && d.getDate() === selectedDay && sameMonthAsSelected(d, selectedDay);
            const isToday = ymd(d) === todayKey;
            const hasTask = isThisMonth(d) && (daysWithTasks?.has(d.getDate()) ?? false);
            const letter = d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
            return (
              <button
                key={ymd(d)}
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  // Selected uses day-of-month; jump the anchor's month if you tap
                  // a day that's actually in a neighboring month.
                  setAnchor(d);
                  onSelect(d.getDate());
                }}
                className="shrink-0 flex flex-col items-center justify-center"
                style={{
                  width: 46,
                  height: 62,
                  borderRadius: 16,
                  background: selected ? N.sageDeep : N.creamCard,
                  color: selected ? N.cream : isToday ? N.sageDeep : N.ink,
                  border: `1px solid ${selected ? "transparent" : isToday ? N.sageDeep : N.line}`,
                  transition: "background 0.18s ease, color 0.18s ease",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    opacity: selected ? 0.75 : 0.65,
                    letterSpacing: "0.04em",
                  }}
                >
                  {letter}
                </span>
                <span
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: 1.1,
                    marginTop: 4,
                  }}
                >
                  {d.getDate()}
                </span>
                {hasTask && !selected && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: 6,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      background: N.sage,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setAnchor(addDays(anchor, 7))}
          aria-label="Next week"
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: "transparent",
            color: N.inkSoft,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* -------- helpers -------- */

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}

function buildWeek(anchor: Date): Date[] {
  // Monday-first week. JS getDay() returns 0=Sun..6=Sat.
  const day = anchor.getDay(); // 0..6
  const mondayOffset = (day + 6) % 7;
  const monday = addDays(anchor, -mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

function sameMonthAsSelected(d: Date, selectedDay: number) {
  // We treat selectedDay as day-of-month in the current month. If the displayed
  // pill belongs to a different month, it should not appear selected unless that
  // month happens to share the same numeric day. Good-enough for the home view.
  const today = new Date();
  if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
    return d.getDate() === selectedDay;
  }
  return false;
}
