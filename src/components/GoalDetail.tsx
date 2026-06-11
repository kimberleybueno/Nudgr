"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { N } from "@/lib/colors";
import type { Goal, Partner, Task } from "@/types";
import TaskRow from "./TaskRow";

interface Props {
  goal: Goal;
  partners: Partner[];
  onBack: () => void;
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (t: Task) => void;
  onDeleteTask: (id: string) => void;
  onEdit: () => void;
  isDesktop?: boolean;
}

/**
 * Goal detail per design_handoff_nudgr_app/README.md sec 7.
 *
 *   Back + "Just you" chip.
 *   H1 goal title.
 *   Optional WHY card (tan-tint background, Fraunces italic).
 *   Big percent + 8px progress bar + "{done} of {total} done".
 *   TASKS eyebrow + "{n} left".
 *   Empty state (dashed box on faint sage) when there are no tasks.
 *   Expandable TaskRows with hideGoalRow (you're already in a goal).
 *   Typed-add bar at the bottom ("Add a task, press enter").
 *
 *   Desktop: same composition centered, max-width 680px, with a "Goals"
 *   pill back button in place of the chevron.
 *
 * House rules: no emoji, no em dashes.
 */
export default function GoalDetail({
  goal, partners,
  onBack, onAddTask, onToggleTask, onUpdateTask, onDeleteTask, onEdit,
  isDesktop = false,
}: Props) {
  const [input, setInput] = useState("");
  const addRef = useRef<HTMLInputElement>(null);

  const total = goal.tasks.length;
  const done = goal.tasks.filter((t) => t.done).length;
  const left = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // Sort: undone first (most-recently-created), then done (most-recently-completed)
  const sorted = useMemo(() => {
    const undone = goal.tasks
      .filter((t) => !t.done)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const completed = goal.tasks
      .filter((t) => t.done)
      .sort(
        (a, b) =>
          +new Date(b.completedAt ?? b.createdAt) - +new Date(a.completedAt ?? a.createdAt),
      );
    return { undone, completed };
  }, [goal.tasks]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    onAddTask(v);
    setInput("");
    addRef.current?.focus();
  };

  /* Esc closes the detail on desktop (mobile uses the back chevron) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onBack(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <div className="anim-up" style={{ minHeight: "100vh", background: N.cream }}>
      {/* Centered column on desktop, full-width on mobile */}
      <div
        className="mx-auto"
        style={{
          maxWidth: isDesktop ? 680 : "100%",
          padding: isDesktop ? "32px 24px 80px" : "16px 20px 96px",
        }}
      >
        {/* Top row: back + Just you chip + edit */}
        <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
          {isDesktop ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full"
              style={{
                background: N.creamCard,
                color: N.ink,
                border: `1px solid ${N.line}`,
                padding: "6px 14px 6px 10px",
                fontSize: 12.5,
                fontWeight: 500,
                boxShadow: N.shadowSoft,
              }}
              aria-label="Back to Goals"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Goals
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: N.creamCard,
                border: `1px solid ${N.line}`,
                color: N.ink,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: N.sageDeep,
                background: N.sageTint14,
                padding: "5px 10px",
                borderRadius: 999,
              }}
            >
              Just you
            </span>
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit goal"
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: N.creamCard,
                border: `1px solid ${N.line}`,
                color: N.sageDeep,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 20l4.5-1 11-11-3.5-3.5-11 11L4 20zM14 6.5L17.5 10"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-display"
          style={{
            fontSize: isDesktop ? 31 : 27,
            fontWeight: 500,
            color: N.ink,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: goal.why ? 16 : 22,
          }}
        >
          {goal.name}
        </h1>

        {/* Optional WHY card */}
        {goal.why && (
          <div
            style={{
              background: N.tanTint14,
              border: `1px solid ${N.tanTint22}`,
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 22,
            }}
          >
            <span
              className="font-display"
              style={{
                fontSize: 16,
                fontStyle: "italic",
                fontWeight: 500,
                color: N.ink,
                lineHeight: 1.45,
              }}
            >
              {goal.why}
            </span>
          </div>
        )}

        {/* Big percent + progress bar + done count */}
        <div style={{ marginBottom: 28 }}>
          <div className="flex items-baseline gap-3" style={{ marginBottom: 10 }}>
            <span
              className="font-display"
              style={{
                fontSize: isDesktop ? 52 : 44,
                fontWeight: 600,
                color: N.sageDeep,
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              {pct}%
            </span>
            <span style={{ fontSize: 13.5, color: N.inkSoft }}>
              {done} of {total} done
            </span>
          </div>
          <div
            aria-hidden="true"
            style={{
              height: 8,
              width: "100%",
              borderRadius: 999,
              background: "rgba(47, 74, 53, 0.10)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: N.sage,
                borderRadius: 999,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* TASKS eyebrow + count */}
        <div className="flex items-baseline justify-between" style={{ marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: N.sageDeep,
            }}
          >
            Tasks
          </span>
          {total > 0 && (
            <span style={{ fontSize: 12.5, fontWeight: 500, color: N.inkSoft }}>
              {left} left
            </span>
          )}
        </div>

        {/* Empty state OR list */}
        {total === 0 ? (
          <div
            className="text-center"
            style={{
              background: N.sageTint08,
              border: `1px dashed ${N.line}`,
              borderRadius: 14,
              padding: "28px 20px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: N.sageDarkest,
                marginBottom: 4,
              }}
            >
              No tasks yet.
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: N.inkSoft,
                maxWidth: 280,
                margin: "0 auto",
              }}
            >
              Add your first step below, or say it out loud.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2" style={{ marginBottom: 12 }}>
            {sorted.undone.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                goals={[]} /* hideGoalRow drops the goal row; no need to pass options */
                partners={partners}
                onToggle={onToggleTask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                hideGoalRow
                isDesktop={isDesktop}
              />
            ))}
            {sorted.completed.length > 0 && (
              <>
                <div
                  className="flex items-center gap-2"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.09em",
                    color: N.inkSoft,
                    marginTop: 12,
                    marginBottom: 4,
                  }}
                >
                  <div className="flex-1 h-px" style={{ background: N.line }} />
                  <span>{sorted.completed.length} COMPLETED</span>
                  <div className="flex-1 h-px" style={{ background: N.line }} />
                </div>
                {sorted.completed.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    goals={[]}
                    partners={partners}
                    onToggle={onToggleTask}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    hideGoalRow
                    isDesktop={isDesktop}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Bottom typed-add bar */}
        <form
          onSubmit={submit}
          className="flex items-center gap-2"
          style={{
            background: N.creamCard,
            borderRadius: 14,
            border: `1px solid ${input.trim() ? N.lineStrong : N.line}`,
            padding: "8px 8px 8px 12px",
            transition: "border-color 0.18s ease",
            boxShadow: N.shadowSoft,
            marginTop: 6,
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
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            ref={addRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task, press enter"
            aria-label={`Add a task to ${goal.name}`}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14.5, color: N.ink, minWidth: 0 }}
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
      </div>
    </div>
  );
}
