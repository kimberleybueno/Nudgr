"use client";

import { useMemo, useState } from "react";
import { C } from "@/lib/colors";
import type { Goal, GoalFilter } from "@/types";
import GoalTile from "./GoalTile";

interface Props {
  goals: Goal[];
  onAddTaskToGoal: (goalId: string, text: string) => void;
  onToggleTaskInGoal: (goalId: string, taskId: string) => void;
}

const FILTERS: { id: GoalFilter; label: string }[] = [
  { id: "all",   label: "All" },
  { id: "short", label: "Short-term" },
  { id: "long",  label: "Long-term" },
];

export default function GoalGrid({ goals, onAddTaskToGoal, onToggleTaskInGoal }: Props) {
  const [filter, setFilter] = useState<GoalFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (filter === "all") return goals;
    const threeMonths = 90 * 86400000;
    const now = Date.now();
    return goals.filter((g) => {
      const dt = new Date(g.deadlineDate).getTime() - now;
      return filter === "short" ? dt <= threeMonths : dt > threeMonths;
    });
  }, [goals, filter]);

  return (
    <section className="px-4 pt-6 pb-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold" style={{ color: C.sageDark }}>Goals</h2>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
                    className="px-2.5 h-7 rounded-md text-[10px] font-bold"
                    style={{
                      background: filter === f.id ? C.sage : "#fff",
                      color: filter === f.id ? "#fff" : C.muted,
                      border: `1px solid ${filter === f.id ? C.sage : C.faint}`,
                    }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {visible.map((g) => (
          <GoalTile
            key={g.id}
            goal={g}
            expanded={expandedId === g.id}
            onToggle={() => setExpandedId(expandedId === g.id ? null : g.id)}
            onAddTask={(text) => onAddTaskToGoal(g.id, text)}
            onToggleTask={(taskId) => onToggleTaskInGoal(g.id, taskId)}
          />
        ))}
        {visible.length === 0 && (
          <div className="col-span-2 text-center py-8 text-[12px]" style={{ color: C.muted }}>
            No goals in this view
          </div>
        )}
      </div>
    </section>
  );
}
