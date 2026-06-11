"use client";

import { useState } from "react";
import { N } from "@/lib/colors";
import type { Goal } from "@/types";

interface Props {
  goal: Goal;
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onEdit?: () => void;
}

/**
 * Goal card per design_handoff_nudgr_app/README.md sec 5.
 *
 *   Cream-card surface, --line border, 18-20px radius, soft shadow.
 *   Header: H3 title (Fraunces 600) and "{done} of {total} done" sub on the
 *   left; large percent (Fraunces 600, 23-24px, in the goal accent color)
 *   on the right.
 *   Progress bar: 8px track rgba(47,74,53,.10), fill --sage (animate width).
 *   Below: a few task rows then a dashed "Add a task" bar.
 *   Whole card opens Goal detail (for now, the edit modal).
 *
 * House rules: no emoji, no em dashes.
 */
export default function GoalTile({ goal, onAddTask, onToggleTask, onEdit }: Props) {
  const [input, setInput] = useState("");

  const total = goal.tasks.length;
  const done = goal.tasks.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // Show up to 3 tasks (prefer undone, most recently created first).
  const preview = [...goal.tasks]
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    })
    .slice(0, 3);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    onAddTask(v);
    setInput("");
  };

  return (
    <article
      style={{
        background: N.creamCard,
        border: `1px solid ${N.line}`,
        borderRadius: 20,
        padding: 16,
        boxShadow: N.shadowSoft,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onEdit}
        className="text-left"
        aria-label={`Edit ${goal.name}`}
        style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            className="font-display"
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: N.ink,
              lineHeight: 1.2,
              letterSpacing: 0,
            }}
          >
            {goal.name}
          </h3>
          <p style={{ fontSize: 12.5, color: N.inkSoft, marginTop: 2 }}>
            {done} of {total} done
          </p>
        </div>
        <span
          className="font-display"
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: goal.color || N.sageDeep,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {pct}%
        </span>
      </button>

      {/* Progress bar */}
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

      {/* Preview tasks */}
      {preview.length > 0 && (
        <ul className="flex flex-col" style={{ gap: 6, listStyle: "none", padding: 0, margin: 0 }}>
          {preview.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleTask(t.id); }}
                className="w-full text-left flex items-center"
                style={{ gap: 10, padding: "4px 2px" }}
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: t.done ? N.sageTint22 : N.sageTint08,
                    border: `1px solid ${t.done ? "transparent" : N.line}`,
                    transition: "background 0.15s ease",
                  }}
                >
                  {t.done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke={N.sageDeep}
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    color: t.done ? N.inkFaint : N.ink,
                    textDecoration: t.done ? "line-through" : "none",
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.text}
                </span>
              </button>
            </li>
          ))}
          {total > preview.length && (
            <li
              style={{
                fontSize: 11.5,
                color: N.inkSoft,
                paddingLeft: 30,
                marginTop: 2,
              }}
            >
              {total - preview.length} more
            </li>
          )}
        </ul>
      )}

      {/* Dashed Add-a-task bar */}
      <form
        onSubmit={submit}
        className="flex items-center"
        style={{
          gap: 8,
          border: `1px dashed ${N.lineStrong}`,
          borderRadius: 12,
          padding: "8px 10px",
          background: "transparent",
        }}
      >
        <span
          aria-hidden="true"
          className="shrink-0"
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: N.sageTint14,
            color: N.sageDeep,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          +
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task"
          aria-label={`Add a task to ${goal.name}`}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: 13.5, color: N.ink, minWidth: 0 }}
        />
        {input.trim() && (
          <button
            type="submit"
            className="rounded-full text-white"
            style={{
              background: N.sageDeep,
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 12px",
            }}
          >
            Add
          </button>
        )}
      </form>
    </article>
  );
}
