"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { C } from "@/lib/colors";
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
}

export default function TaskList({
  tasks, goals, partners, selectedDay, isToday, dayLabel,
  onAddStandalone, onUpdateTask, onDeleteTask, onToggleTask, onReorder,
}: Props) {
  const [input, setInput] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragDy, setDragDy] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const rowHeight = 46; // approx px per row including gap

  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const active = sorted.filter((t) => !t.done);
  const done = sorted.filter((t) => t.done);

  const handleAdd = () => {
    const v = input.trim();
    if (!v) return;
    onAddStandalone(v, selectedDay);
    setInput("");
  };

  const handleHoldStart = (id: string) => {
    setDraggedId(id);
    setDragDy(0);
  };
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

  // Clear drag if scroll happens
  useEffect(() => {
    const onScroll = () => { if (draggedId) { setDraggedId(null); setDragDy(0); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [draggedId]);

  return (
    <section className="px-4 pt-5">
      <div className="flex items-baseline justify-between mb-2.5">
        <h2 className="text-[15px] font-bold" style={{ color: C.sageDark }}>
          {isToday ? "Today's To-Dos" : `To-Dos for ${dayLabel}`}
        </h2>
        <span className="text-[11px] font-semibold" style={{ color: C.muted }}>
          {active.length} remaining
        </span>
      </div>

      {/* Quick-add */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 mb-2"
        style={{
          background: "#fff",
          borderRadius: 10,
          border: `1px solid ${input.trim() ? C.sage : C.faint}`,
          transition: "border-color 0.2s",
        }}
      >
        <div className="w-[18px] h-[18px] rounded-full shrink-0" style={{ border: `1.5px solid ${C.faint}` }} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder="Add a task..."
          className="flex-1 text-[13px] outline-none bg-transparent"
          style={{ color: C.charcoal }}
        />
        {input.trim() && (
          <button onClick={handleAdd}
                  className="px-3 h-7 rounded-md text-[11px] font-bold text-white"
                  style={{ background: C.sage }}>Add</button>
        )}
      </div>

      {/* Active tasks */}
      <div ref={listRef} className="flex flex-col gap-1">
        {active.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            goals={goals}
            partners={partners}
            onToggle={onToggleTask}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onHoldStart={handleHoldStart}
            onHoldMove={handleHoldMove}
            onHoldEnd={handleHoldEnd}
            liftedDy={draggedId === t.id ? dragDy : 0}
            isLifted={draggedId === t.id}
          />
        ))}
        {active.length === 0 && (
          <div className="text-center py-8" style={{ color: C.muted }}>
            <div className="text-3xl mb-2">📅</div>
            <div className="text-[13px] font-semibold">No tasks for {dayLabel}</div>
            <div className="text-[11px] mt-1">Add one or tap today to go back</div>
          </div>
        )}
      </div>

      {/* Completed divider */}
      {done.length > 0 && (
        <>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="w-full mt-3 mb-1 flex items-center gap-2 text-[10px] font-semibold tracking-wide"
            style={{ color: C.muted }}
          >
            <div className="flex-1 h-px" style={{ background: C.faint }} />
            <span>{done.length} COMPLETED {showCompleted ? "▴" : "▾"}</span>
            <div className="flex-1 h-px" style={{ background: C.faint }} />
          </button>
          {showCompleted && (
            <div className="flex flex-col gap-1 anim-up">
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
