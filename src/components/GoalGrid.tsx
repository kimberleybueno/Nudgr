"use client";

import { useMemo, useState } from "react";
import { C } from "@/lib/colors";
import type { Goal, GoalFilter } from "@/types";
import GoalTile from "./GoalTile";

interface Props {
  goals: Goal[];
  onAddTaskToGoal: (goalId: string, text: string) => void;
  onToggleTaskInGoal: (goalId: string, taskId: string) => void;
  onCreateGoal: () => void;
  onEditGoal: (goal: Goal) => void;
}

const FILTERS: { id: GoalFilter; label: string }[] = [
  { id: "all",   label: "All" },
  { id: "short", label: "Short-term" },
  { id: "long",  label: "Long-term" },
];

export default function GoalGrid({ goals, onAddTaskToGoal, onToggleTaskInGoal, onCreateGoal, onEditGoal }: Props) {
  const [filter, setFilter] = useState<GoalFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <h2 className="text-[15px] font-bold" style={{ color: C.sageDark }}>Goals</h2>
        <div className="flex gap-1.5 items-center">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
                    className="px-2.5 h-7 rounded-md text-[10px] font-bold"
                    style={{
                      background: filter === f.id ? C.sage : "#fff",
                      color: filter === f.id ? "#fff" : C.muted,
                      border: `1px solid ${filter === f.id ? C.sage : C.faint}`,
                    }}>{f.label}</button>
          ))}
          {/* + New goal — Screen 9 entry point 1 */}
          <button onClick={onCreateGoal}
                  className="px-2.5 h-7 rounded-md text-[10px] font-bold"
                  style={{ background: "#fff", color: C.sage, border: `1px solid ${C.sage}` }}>
            + New goal
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <EmptyGoals onCta={onCreateGoal} />
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {visible.map((g) => (
            <GoalTile
              key={g.id}
              goal={g}
              expanded={expandedId === g.id}
              onToggle={() => setExpandedId(expandedId === g.id ? null : g.id)}
              onAddTask={(text) => onAddTaskToGoal(g.id, text)}
              onToggleTask={(taskId) => onToggleTaskInGoal(g.id, taskId)}
              onEdit={() => onEditGoal(g)}
            />
          ))}
          {visible.length === 0 && (
            <div className="col-span-2 text-center py-8 text-[12px]" style={{ color: C.muted }}>
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
    <div className="rounded-2xl px-5 py-8 text-center"
         style={{ background: C.bg, border: `1px dashed ${C.faint}` }}>
      <div className="text-3xl mb-2">🎯</div>
      <div className="text-[14px] font-bold mb-1" style={{ color: C.sageDark }}>No goals yet</div>
      <div className="text-[11px] mb-3 max-w-[280px] mx-auto leading-relaxed" style={{ color: C.muted }}>
        Set a goal so your to-dos have something to ladder up to.
      </div>
      <button onClick={onCta}
              className="px-4 h-9 rounded-xl text-[12px] font-bold text-white"
              style={{ background: C.sage }}>+ Add a goal</button>
    </div>
  );
}
