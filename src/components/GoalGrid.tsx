"use client";

import { useMemo, useState } from "react";
import { N } from "@/lib/colors";
import type { Goal, GoalFilter } from "@/types";
import GoalTile from "./GoalTile";

interface Props {
  goals: Goal[];
  onAddTaskToGoal: (goalId: string, text: string) => void;
  onToggleTaskInGoal: (goalId: string, taskId: string) => void;
  onCreateGoal: () => void;
  /** Tap a card body opens the Goal detail screen. */
  onOpenGoal: (goal: Goal) => void;
  /** Edit comes from inside Goal detail; still wired here for the modal. */
  onEditGoal: (goal: Goal) => void;
}

const FILTERS: { id: GoalFilter; label: string }[] = [
  { id: "all",   label: "All" },
  { id: "short", label: "Short-term" },
  { id: "long",  label: "Long-term" },
];

export default function GoalGrid({
  goals, onAddTaskToGoal, onToggleTaskInGoal, onCreateGoal, onOpenGoal,
}: Props) {
  const [filter, setFilter] = useState<GoalFilter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return goals;
    const threeMonths = 90 * 86400000;
    const now = Date.now();
    return goals.filter((g) => {
      if (!g.deadlineDate) return filter === "long";
      const dt = new Date(g.deadlineDate).getTime() - now;
      return filter === "short" ? dt <= threeMonths : dt > threeMonths;
    });
  }, [goals, filter]);

  return (
    <section className="px-4 pt-6 pb-2">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-baseline gap-3">
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: N.sageDeep,
            }}
          >
            Your goals
          </span>
          <span style={{ fontSize: 12.5, color: N.inkSoft }}>{goals.length}</span>
        </div>
        <div className="flex gap-1.5 items-center">
          {FILTERS.map((f) => {
            const selected = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: selected ? N.sage : N.creamCard,
                  color: selected ? "#fff" : N.inkSoft,
                  border: `1px solid ${selected ? N.sage : N.line}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
          <button
            onClick={onCreateGoal}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 11px",
              borderRadius: 999,
              background: N.creamCard,
              color: N.sageDeep,
              border: `1px solid ${N.sageDeep}`,
            }}
          >
            + New goal
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <EmptyGoals onCta={onCreateGoal} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visible.map((g) => (
            <GoalTile
              key={g.id}
              goal={g}
              onAddTask={(text) => onAddTaskToGoal(g.id, text)}
              onToggleTask={(taskId) => onToggleTaskInGoal(g.id, taskId)}
              onOpen={() => onOpenGoal(g)}
            />
          ))}
          {visible.length === 0 && (
            <div
              className="col-span-full text-center py-8"
              style={{ fontSize: 12.5, color: N.inkSoft }}
            >
              No goals in this view
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function EmptyGoals({ onCta }: { onCta: () => void }) {
  return (
    <div
      className="text-center"
      style={{
        background: N.sageTint08,
        border: `1px dashed ${N.line}`,
        borderRadius: 16,
        padding: "32px 20px",
      }}
    >
      <div
        className="font-display"
        style={{ fontSize: 16, fontWeight: 600, color: N.sageDarkest, marginBottom: 4 }}
      >
        No goals yet
      </div>
      <div
        style={{ fontSize: 12.5, color: N.inkSoft, maxWidth: 280, margin: "0 auto 14px" }}
      >
        Set a goal so your to-dos have something to ladder up to.
      </div>
      <button
        onClick={onCta}
        className="rounded-full text-white"
        style={{
          background: N.sageDeep,
          fontSize: 13,
          fontWeight: 600,
          padding: "8px 18px",
        }}
      >
        + Add a goal
      </button>
    </div>
  );
}
