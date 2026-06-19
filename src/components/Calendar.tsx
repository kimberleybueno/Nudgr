"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { N } from "@/lib/colors";

interface Props {
  /** Currently selected day-of-month (1-31) */
  selectedDay: number;
  onSelect: (day: number) => void;
  /** Set of day-of-month values (in the displayed month) that have at least one task */
  daysWithTasks: Set<number>;
}

export default function Calendar({ selectedDay, onSelect, daysWithTasks }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const scroller = useRef<HTMLDivElement>(null);
  const todayBtn = useRef<HTMLButtonElement>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = today.getDate();

  // Center today's button on first paint and when month changes back to current
  useEffect(() => {
    if (!isThisMonth) return;
    requestAnimationFrame(() => {
      const btn = todayBtn.current;
      const wrap = scroller.current;
      if (!btn || !wrap) return;
      const target = btn.offsetLeft - wrap.clientWidth / 2 + btn.clientWidth / 2;
      wrap.scrollTo({ left: Math.max(0, target), behavior: "auto" });
    });
  }, [isThisMonth, year, month]);

  return (
    <section className="px-4 pt-4">
      <div className="flex items-center justify-between mb-2.5">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center text-lg"
          style={{ color: N.inkSoft }}
          aria-label="Previous month"
        >‹</button>
        <h2 className="text-[14px] font-bold" style={{ color: N.sageDeep }}>
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h2>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center text-lg"
          style={{ color: N.inkSoft }}
          aria-label="Next month"
        >›</button>
      </div>

      <div ref={scroller} className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const d = new Date(year, month, day);
          const isSelected = isThisMonth && day === selectedDay;
          const isToday = isThisMonth && day === todayDay;
          const hasTask = daysWithTasks.has(day);
          return (
            <button
              key={day}
              ref={isToday ? todayBtn : null}
              onClick={() => {
                // Tapping a date outside the current month switches to today view
                if (isThisMonth) {
                  // Tapping today when another date is selected returns to today
                  onSelect(day);
                } else {
                  setCursor(new Date());
                  onSelect(todayDay);
                }
              }}
              className="shrink-0 flex flex-col items-center justify-center w-10 h-12 relative"
              style={{
                background: isSelected ? N.sage : "#fff",
                color: isSelected ? "#fff" : isToday ? N.sageDeep : N.ink,
                border: `1px solid ${isSelected ? "transparent" : isToday ? N.sage : N.line}`,
                borderRadius: 14,
              }}
            >
              <span className="opacity-65 text-[9px] font-semibold">
                {d.toLocaleString(undefined, { weekday: "short" }).slice(0, 1)}
              </span>
              <span className="text-[14px] font-bold leading-none mt-0.5">{day}</span>
              {!isSelected && (isToday || hasTask) && (
                <span
                  className="absolute"
                  style={{
                    bottom: 4,
                    width: 4, height: 4, borderRadius: 2,
                    background: isToday ? N.sage : N.inkSoft,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
