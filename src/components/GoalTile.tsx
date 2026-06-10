"use client";

import { useState } from "react";
import { C } from "@/lib/colors";
import type { Goal, Task } from "@/types";
import ProgressRing from "./ProgressRing";

interface Props {
  goal: Goal;
  expanded: boolean;
  onToggle: () => void;
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onEdit?: () => void;
}

export default function GoalTile({ goal, expanded, onToggle, onAddTask, onToggleTask, onEdit }: Props) {
  const [input, setInput] = useState("");
  const total = goal.tasks.length;
  const done = goal.tasks.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const bg = `linear-gradient(165deg, ${goal.color} 0%, ${goal.color}cc 100%)`;

  if (!expanded) {
    return (
      <button
        onClick={onToggle}
        className="text-left text-white relative overflow-hidden p-4"
        style={{ background: bg, borderRadius: 20, minHeight: 132 }}
      >
        <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="relative flex items-start justify-between">
          <span className="text-[26px]" style={{ lineHeight: 1 }}>{goal.emoji}</span>
          <ProgressRing pct={pct} size={40} stroke={3} />
        </div>
        <div className="relative mt-3">
          <div className="text-[13px] font-bold leading-tight">{goal.name}</div>
          <div className="text-[10px] mt-1" style={{ opacity: 0.7 }}>{goal.deadline}</div>
        </div>
      </button>
    );
  }

  // Expanded
  return (
    <div className="text-white relative overflow-hidden p-5" style={{ background: bg, borderRadius: 20, gridColumn: "1 / -1" }}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="relative">
        <div className="flex items-start gap-4">
          <ProgressRing pct={pct} size={52} stroke={4} fontSize={13} />
          <div className="flex-1">
            <div className="text-[15px] font-bold">{goal.emoji} {goal.name}</div>
            <div className="text-[11px] mt-0.5" style={{ opacity: 0.7 }}>
              {done}/{total} task{total === 1 ? "" : "s"} · by {goal.deadline}
            </div>
          </div>
          {onEdit && (
            <button onClick={onEdit} aria-label="Edit goal"
                    className="w-7 h-7 text-[14px] mr-1"
                    style={{ color: "#fff", opacity: 0.75 }}>✎</button>
          )}
          <button onClick={onToggle} aria-label="Collapse"
                  className="w-7 h-7 text-base"
                  style={{ color: "#fff", opacity: 0.85 }}>▴</button>
        </div>

        {/* Tasks */}
        <div className="mt-4 flex flex-col gap-1.5">
          {goal.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                 style={{ background: "rgba(255,255,255,0.12)" }}>
              <button onClick={(e) => { e.stopPropagation(); onToggleTask(t.id); }}
                      aria-label="Toggle"
                      className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center"
                      style={{ border: `1.5px solid #fff`, background: t.done ? "#fff" : "transparent" }}>
                {t.done && <span className="text-[10px] leading-none" style={{ color: goal.color }}>✓</span>}
              </button>
              <span className="text-[13px] flex-1"
                    style={{
                      color: "#fff",
                      opacity: t.done ? 0.55 : 1,
                      textDecoration: t.done ? "line-through" : "none",
                    }}>{t.text}</span>
            </div>
          ))}

          {goal.tasks.length === 0 && (
            <div className="text-[12px] text-center py-3" style={{ opacity: 0.7 }}>No tasks yet</div>
          )}
        </div>

        {/* Add a task */}
        <div className="mt-3 flex items-center gap-2 px-2.5 py-2 rounded-lg"
             style={{ background: "rgba(255,255,255,0.10)", border: "1.5px dashed rgba(255,255,255,0.35)" }}>
          <div className="w-[18px] h-[18px] rounded-full shrink-0" style={{ border: `1.5px dashed rgba(255,255,255,0.5)` }} />
          <input value={input} onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === "Enter" && input.trim()) {
                     onAddTask(input.trim());
                     setInput("");
                   }
                 }}
                 placeholder="Add a task"
                 className="flex-1 text-[13px] outline-none bg-transparent placeholder-white/55"
                 style={{ color: "#fff" }} />
          {input.trim() && (
            <button onClick={() => { onAddTask(input.trim()); setInput(""); }}
                    className="px-3 h-7 rounded-md text-[11px] font-bold"
                    style={{ background: "#fff", color: goal.color }}>Add</button>
          )}
        </div>
      </div>
    </div>
  );
}
