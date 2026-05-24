"use client";

import { useState } from "react";
import { C, TYPE_STYLE } from "@/lib/colors";
import type { Goal } from "@/types";

const PARTNERS = [
  { name: "Maya", ini: "M", col: "#C4A98A" },
  { name: "Jordan", ini: "J", col: "#7A9E7E" },
  { name: "Sara", ini: "S", col: "#97B099" },
  { name: "Tom", ini: "T", col: "#D4845A" },
];

interface Props {
  goal: Goal;
  allGoals: Goal[];
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
}

export default function GoalDetail({ goal, allGoals, onUpdate, onDelete }: Props) {
  const [assigning, setAssigning] = useState(false);
  const [requested, setRequested] = useState<typeof PARTNERS[number] | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [newTask, setNewTask] = useState("");

  const style = TYPE_STYLE[goal.type];
  const total = goal.allTasks.length || 1;
  const done = goal.allTasks.filter((t) => t.done).length;
  const pct = Math.round((done / total) * 100);
  const linked = allGoals.find((g) => g.id === goal.linkedTo);

  const toggleTask = (i: number) => {
    onUpdate({
      ...goal,
      allTasks: goal.allTasks.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)),
    });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    onUpdate({ ...goal, allTasks: [...goal.allTasks, { t: newTask.trim(), done: false }] });
    setNewTask("");
  };

  const assignPartner = (p: typeof PARTNERS[number]) => {
    setRequested(p);
    setAssigning(false);
  };

  const confirmPartner = () => {
    if (requested) {
      onUpdate({ ...goal, partner: requested });
      setAccepted(true);
      setTimeout(() => { setAccepted(false); setRequested(null); }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <div className="rounded-3xl p-4 text-white relative overflow-hidden"
           style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>
        <div className="flex items-start gap-3">
          <span className="text-4xl">{goal.emoji}</span>
          <div className="flex-1">
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                  style={{ background: "rgba(255,255,255,0.22)" }}>{style.label.toUpperCase()}</span>
            <div className="text-[13px] mt-2 opacity-70">Due {new Date(goal.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
          </div>
          {goal.streak > 0 && (
            <div className="text-right">
              <div className="text-[10px] opacity-65 font-bold">STREAK</div>
              <div className="text-[18px] font-bold" style={{ color: "#F4DC8A" }}>🔥 {goal.streak}</div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="opacity-70 font-bold">Progress</span>
            <span className="font-bold">{pct}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="text-[11px] font-bold mb-2 tracking-wide" style={{ color: C.muted }}>TASKS</div>
        <div className="flex flex-col gap-1.5">
          {goal.allTasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                 style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
              <button onClick={() => toggleTask(i)} aria-label="Toggle"
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                      style={{ border: `2px solid ${t.done ? C.sage : C.muted}`, background: t.done ? C.sage : "transparent" }}>
                {t.done && <span className="text-white text-[10px] leading-none">✓</span>}
              </button>
              <span className="text-[13px] flex-1" style={{
                color: t.done ? C.muted : C.charcoal,
                textDecoration: t.done ? "line-through" : "none",
              }}>{t.t}</span>
              {t.due && <span className="text-[10px]" style={{ color: C.muted }}>{new Date(t.due).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
                 onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                 placeholder="+ Add a task"
                 className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
                 style={{ background: C.bg, border: `1px solid ${C.faint}` }} />
          <button onClick={addTask} className="w-10 h-10 rounded-xl text-white text-lg"
                  style={{ background: C.sage }}>+</button>
        </div>
      </div>

      {/* Partner */}
      <div>
        <div className="text-[11px] font-bold mb-2 tracking-wide" style={{ color: C.muted }}>ACCOUNTABILITY PARTNER</div>
        {goal.partner ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
            <span className="w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center text-white"
                  style={{ background: goal.partner.col }}>{goal.partner.ini}</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold" style={{ color: C.charcoal }}>{goal.partner.name}</div>
              <div className="text-[10px]" style={{ color: C.muted }}>Active partner</div>
            </div>
            <button onClick={() => onUpdate({ ...goal, partner: null })}
                    className="text-[11px] font-bold" style={{ color: C.muted }}>Remove</button>
          </div>
        ) : (
          <button onClick={() => setAssigning(true)}
                  className="w-full rounded-2xl py-3 text-[13px] font-bold"
                  style={{ background: C.light, color: C.sageDark, border: `1.5px dashed ${C.sage}` }}>
            + Assign a partner
          </button>
        )}
      </div>

      {/* Linked to */}
      {linked && (
        <div>
          <div className="text-[11px] font-bold mb-2 tracking-wide" style={{ color: C.muted }}>LINKED TO</div>
          <div className="rounded-2xl p-3 text-white"
               style={{ background: "linear-gradient(165deg, #6B4A8A, #9B7AC4)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{linked.emoji}</span>
              <span className="text-[13px] font-bold">{linked.title}</span>
            </div>
          </div>
        </div>
      )}

      {/* Danger */}
      <button onClick={() => onDelete(goal.id)} className="text-[11px] font-bold py-2"
              style={{ color: C.urgent }}>Delete goal</button>

      {/* Assigning overlay (inline) */}
      {assigning && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center anim-fade"
             onClick={() => setAssigning(false)}>
          <div onClick={(e) => e.stopPropagation()}
               className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 anim-slide-up">
            <div className="text-[15px] font-bold mb-3" style={{ color: C.sageDark }}>Pick a partner</div>
            <div className="flex flex-col gap-2">
              {PARTNERS.map((p) => (
                <button key={p.name} onClick={() => assignPartner(p)}
                        className="flex items-center gap-3 p-3 rounded-2xl text-left"
                        style={{ background: C.bg, border: `1px solid ${C.faint}` }}>
                  <span className="w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center text-white"
                        style={{ background: p.col }}>{p.ini}</span>
                  <span className="text-[13px] font-bold" style={{ color: C.charcoal }}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partner request confirmation */}
      {requested && !goal.partner && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center anim-fade"
             onClick={() => setRequested(null)}>
          <div onClick={(e) => e.stopPropagation()}
               className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 anim-slide-up text-center">
            {!accepted ? (
              <>
                <div className="text-5xl mb-3">💌</div>
                <div className="text-[17px] font-bold mb-2" style={{ color: C.sageDark }}>Request sent!</div>
                <div className="text-[13px] mb-4" style={{ color: C.muted }}>
                  {requested.name} will see your goal &quot;{goal.title}&quot; and can accept or decline.
                </div>
                <div className="rounded-2xl p-3 mb-4" style={{ background: C.bg, border: `1px dashed ${C.faint}` }}>
                  <div className="text-[10px] font-bold tracking-wide mb-1" style={{ color: C.muted }}>PENDING</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                          style={{ background: requested.col }}>{requested.ini}</span>
                    <span className="text-[12px]" style={{ color: C.charcoal }}>{requested.name}</span>
                    <span className="anim-pulse w-2 h-2 rounded-full" style={{ background: C.gold }} />
                  </div>
                </div>
                <button onClick={confirmPartner}
                        className="w-full h-11 rounded-2xl text-[13px] font-bold text-white"
                        style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>
                  Simulate accept (demo)
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">🎉</div>
                <div className="text-[17px] font-bold" style={{ color: C.sageDark }}>{requested.name} is in!</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
