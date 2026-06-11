"use client";

import { useMemo, useState } from "react";
import { N } from "@/lib/colors";
import { ymd, todayIso, addDays } from "@/lib/dates";

interface Props {
  /** ISO date string of the currently selected day. */
  selected: string;
  onSelect: (iso: string) => void;
  /** Set of ISO date strings that have at least one task (dot indicator). */
  datesWithTasks?: Set<string>;
}

/**
 * Week date strip per design_handoff_nudgr_app/README.md sec 4.
 *
 *   Horizontal scrolling row of 7 day pills (46x62, 16px radius).
 *   Weekday letter (11px 600) over date number (Fraunces 600, 18px).
 *   Selected = sage-deep fill, cream text. Others = cream-card + line.
 *   Tap selects. Left/right chevrons step through weeks.
 */
export default function WeekStrip({ selected, onSelect, datesWithTasks }: Props) {
  const [anchor, setAnchor] = useState(() => new Date(selected || todayIso()));
  const days = useMemo(() => buildWeek(anchor), [anchor]);
  const today = todayIso();

  return (
    <section className="px-5 pt-1 pb-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAnchor(addDays(anchor, -7))}
          aria-label="Previous week"
          className="shrink-0 flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: 999, color: N.inkSoft }}
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
            const iso = ymd(d);
            const isSelected = iso === selected;
            const isToday = iso === today;
            const hasTask = datesWithTasks?.has(iso) ?? false;
            const letter = d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
            return (
              <button
                key={iso}
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setAnchor(d);
                  onSelect(iso);
                }}
                className="shrink-0 flex flex-col items-center justify-center"
                style={{
                  width: 46,
                  height: 62,
                  borderRadius: 16,
                  background: isSelected ? N.sageDeep : N.creamCard,
                  color: isSelected ? N.cream : isToday ? N.sageDeep : N.ink,
                  border: `1px solid ${isSelected ? "transparent" : isToday ? N.sageDeep : N.line}`,
                  transition: "background 0.18s ease, color 0.18s ease",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    opacity: isSelected ? 0.75 : 0.65,
                    letterSpacing: "0.04em",
                  }}
                >
                  {letter}
                </span>
                <span
                  className="font-display"
                  style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.1, marginTop: 4 }}
                >
                  {d.getDate()}
                </span>
                {hasTask && !isSelected && (
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
          style={{ width: 32, height: 32, borderRadius: 999, color: N.inkSoft }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/** Monday-first 7-day window around the anchor date. */
function buildWeek(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0=Sun..6=Sat
  const mondayOffset = (day + 6) % 7;
  const monday = addDays(anchor, -mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
