"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { N } from "@/lib/colors";
import type { Task, Goal, Partner } from "@/types";
import TaskRow from "./TaskRow";

interface Props {
  /** All tasks for the selected date (combined: standalone where due matches + goal tasks where due matches) */
  tasks: Task[];
  goals: Goal[];
  partners: Partner[];
  selectedDay: number;
  isToday: boolean;
  /** Day label for non-today header e.g. "May 26" */
  dayLabel: string;
  onAddStandalone: (text: string, due: number) => void;
  onUpdateTask: (t: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onReorder: (sourceId: string, targetIndex: number) => void;
  onCreateGoalAndLink?: (g: Goal, taskId: string) => void;
}

export default function TaskList({
  tasks, goals, partners, selectedDay, isToday, dayLabel,
  onAddStandalone, onUpdateTask, onDeleteTask, onToggleTask, onReorder,
  onCreateGoalAndLink,
}: Props) {
  const [input, setInput] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragDy, setDragDy] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const rowHeight = 56;

  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const active = sorted.filter((t) => !t.done);
  const done = sorted.filter((t) => t.done);

  const handleAdd = () => {
    const v = input.trim();
    if (!v) return;
    onAddStandalone(v, selectedDay);
    setInput("");
  };

  const handleHoldStart = (id: string) => { setDraggedId(id); setDragDy(0); };
  const handleHoldMove = (id: string, dy: number) => {
    if (draggedId !== id) return;
    setDragDy(dy);
  };
  const handleHoldEnd = (id: string) => {
    if (draggedId !== id) { setDraggedId(null); setDragDy(0); return; }
    const idx = active.findIndex((t) => t.id === id);
    const delta = Math.round(dragDy / rowHeight);
    const newIdx = Math.max(0, Math.min(active.length - 1, idx + delta));
    if (newIdx !== idx) onReorder(id, newIdx);
    setDraggedId(null);
    setDragDy(0);
  };

  useEffect(() => {
    const onScroll = () => { if (draggedId) { setDraggedId(null); setDragDy(0); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [draggedId]);

  return (
    <section className="px-4 pt-5">
      {/* Eyebrow + remaining count.
          - When viewing today, the spec calls for an uppercase TODAY eyebrow.
          - Other days keep a friendly H2 (still living inside Today list shell). */}
      <div className="flex items-baseline justify-between mb-3">
        {isToday ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: N.sageDeep,
            }}
          >
            Today
          </span>
        ) : (
          <h2 style={{ fontSize: 15, fontWeight: 700, color: N.sageDarkest }}>
            To-Dos for {dayLabel}
          </h2>
        )}
        <span style={{ fontSize: 12.5, fontWeight: 500, color: N.inkSoft }}>
          {active.length} remaining
        </span>
      </div>

      {/* Typed quick-add bar (cream-card surface + plus icon + sage-deep Add button) */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
        className="flex items-center gap-2 mb-2"
        style={{
          background: N.creamCard,
          borderRadius: 14,
          border: `1px solid ${input.trim() ? N.lineStrong : N.line}`,
          padding: "8px 8px 8px 12px",
          transition: "border-color 0.18s ease",
          boxShadow: N.shadowSoft,
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
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isToday ? "Type a task, press enter" : `Add a task for ${dayLabel}, press enter`}
          aria-label="New task"
          className="flex-1 bg-transparent outline-none"
          style={{
            fontSize: 14.5,
            color: N.ink,
            minWidth: 0,
          }}
        />
        {input.trim() && (
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

      {/* Active tasks */}
      <div ref={listRef} className="flex flex-col gap-2">
        {active.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            goals={goals}
            partners={partners}
            onToggle={onToggleTask}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onCreateGoalAndLink={onCreateGoalAndLink}
            onHoldStart={handleHoldStart}
            onHoldMove={handleHoldMove}
            onHoldEnd={handleHoldEnd}
            liftedDy={draggedId === t.id ? dragDy : 0}
            isLifted={draggedId === t.id}
          />
        ))}
        {active.length === 0 && (
          <div
            className="text-center mt-1"
            style={{
              background: N.sageTint08,
              border: `1px dashed ${N.line}`,
              borderRadius: 14,
              padding: "28px 20px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: N.sageDarkest, marginBottom: 4 }}>
              {isToday ? "No to-dos yet" : `No tasks for ${dayLabel}`}
            </div>
            <div style={{ fontSize: 12.5, color: N.inkSoft, maxWidth: 260, margin: "0 auto" }}>
              {isToday
                ? "Add your first step above, or say it out loud."
                : "Add one above, or tap today to go back."}
            </div>
          </div>
        )}
      </div>

      {/* Completed divider */}
      {done.length > 0 && (
        <>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="w-full mt-4 mb-2 flex items-center gap-2"
            style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.09em", color: N.inkSoft }}
          >
            <div className="flex-1 h-px" style={{ background: N.line }} />
            <span>{done.length} COMPLETED {showCompleted ? "▴" : "▾"}</span>
            <div className="flex-1 h-px" style={{ background: N.line }} />
          </button>
          {showCompleted && (
            <div className="flex flex-col gap-2 anim-up">
              {done.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  goals={goals}
                  partners={partners}
                  onToggle={onToggleTask}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Sort order:
 *  1. Starred (most-recently-created first)
 *  2. Overdue (most-recently-created first)
 *  3. Active (most-recently-created first)
 *  4. Completed (most-recently-completed first)
 */
function sortTasks(tasks: Task[]): Task[] {
  const star    = tasks.filter((t) => !t.done && t.star)
                       .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const over    = tasks.filter((t) => !t.done && !t.star && t.overdue)
                       .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const reg     = tasks.filter((t) => !t.done && !t.star && !t.overdue)
                       .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const done    = tasks.filter((t) => t.done)
                       .sort((a, b) => +new Date(b.completedAt ?? b.createdAt) - +new Date(a.completedAt ?? a.createdAt));
  return [...star, ...over, ...reg, ...done];
}
