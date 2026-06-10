"use client";

import { useState } from "react";
import { C, GOAL_COLORS } from "@/lib/colors";
import type { Goal } from "@/types";

interface Props {
  /** When set, modal opens in edit mode for this goal. */
  goal?: Goal;
  onCancel: () => void;
  onSave: (g: Goal) => void;
  /** Edit mode only — called on confirm delete. Returns the goal id. */
  onDelete?: (id: string) => void;
}

const EMOJI_OPTS = ["🎯", "🏃‍♀️", "📖", "💪", "🌱", "🚀", "💡", "🎨", "✍️", "💧", "🥗", "🌙", "📚", "🎵", "💼", "📈"];

export default function CreateGoalModal({ goal, onCancel, onSave, onDelete }: Props) {
  const editing = !!goal;

  const [name, setName] = useState(goal?.name ?? "");
  const [emoji, setEmoji] = useState(goal?.emoji ?? "🎯");
  const [type, setType] = useState<"short" | "long">(() => {
    if (!goal?.deadlineDate) return "short";
    const ms = new Date(goal.deadlineDate).getTime() - Date.now();
    return ms <= 90 * 86400000 ? "short" : "long";
  });
  const [targetDate, setTargetDate] = useState<string>(goal?.deadlineDate ?? "");
  const [progress, setProgress] = useState<number>(() => {
    if (!goal) return 0;
    const total = goal.tasks.length || 1;
    const done = goal.tasks.filter((t) => t.done).length;
    return Math.round((done / total) * 100);
  });
  const [color, setColor] = useState(goal?.color ?? GOAL_COLORS[0]);
  const [confirming, setConfirming] = useState(false);

  const nameValid = name.trim().length > 0;

  const save = () => {
    if (!nameValid) return;
    const id = goal?.id ?? `g_${Math.random().toString(36).slice(2, 8)}`;
    const deadline = targetDate
      ? new Date(targetDate).toLocaleString(undefined, { month: "short", year: "numeric" })
      : "";

    const updated: Goal = {
      id,
      emoji,
      name: name.trim(),
      color,
      deadline,
      deadlineDate: targetDate,
      tasks: goal?.tasks ?? [],
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center anim-fade"
         style={{ background: "rgba(45,45,45,0.45)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto anim-slide-up">

        <div className="flex items-center justify-between mb-1">
          <button onClick={onCancel} className="text-[12px] font-bold" style={{ color: C.muted }}>Cancel</button>
          <button onClick={save} disabled={!nameValid}
                  className="text-[12px] font-bold disabled:opacity-40"
                  style={{ color: C.sageDark }}>{editing ? "Save" : "Create"}</button>
        </div>

        <h2 className="text-[18px] font-bold mb-4" style={{ color: C.sageDark }}>
          {editing ? "Edit goal" : "New goal"}
        </h2>

        {/* Emoji + title row */}
        <div className="flex gap-3 mb-4">
          <details className="relative">
            <summary className="list-none cursor-pointer w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                     style={{ background: C.bg, border: `1.5px solid ${C.faint}` }}>{emoji}</summary>
            <div className="absolute z-20 mt-2 grid grid-cols-8 gap-1 p-2 rounded-2xl bg-white shadow-xl"
                 style={{ border: `1px solid ${C.faint}`, width: 280 }}>
              {EMOJI_OPTS.map((e) => (
                <button key={e} type="button"
                        onClick={() => { setEmoji(e); (document.activeElement as HTMLElement)?.blur(); }}
                        className="w-8 h-8 rounded-lg text-xl"
                        style={{ background: emoji === e ? C.light : "transparent" }}>{e}</button>
              ))}
            </div>
          </details>
          <input autoFocus={!editing} value={name} onChange={(e) => setName(e.target.value)}
                 maxLength={60} placeholder="Marathon Training"
                 className="flex-1 h-14 px-4 rounded-2xl text-[15px] font-semibold outline-none"
                 style={{ background: C.bg, border: `1.5px solid ${name ? C.warm : C.faint}`, color: C.charcoal }} />
        </div>

        {/* Type */}
        <div className="mb-3.5">
          <div className="text-[11px] font-bold tracking-wide mb-1.5" style={{ color: C.muted }}>TYPE</div>
          <div className="flex gap-1.5">
            {(["short", "long"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                      className="flex-1 h-10 rounded-xl text-[12px] font-bold capitalize"
                      style={{
                        background: type === t ? C.sage : C.bg,
                        color: type === t ? "#fff" : C.muted,
                        border: `1px solid ${type === t ? C.sage : C.faint}`,
                      }}>{t === "short" ? "Short-term" : "Long-term"}</button>
            ))}
          </div>
        </div>

        {/* Target date */}
        <label className="block mb-3.5">
          <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: C.muted }}>
            TARGET DATE <span className="font-normal" style={{ textTransform: "lowercase" }}>· optional</span>
          </span>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                 style={{ background: C.bg, border: `1.5px solid ${C.faint}`, color: C.charcoal }} />
        </label>

        {/* Color */}
        <div className="mb-3.5">
          <div className="text-[11px] font-bold tracking-wide mb-1.5" style={{ color: C.muted }}>COLOR</div>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                      aria-label={`Color ${c}`}
                      className="w-10 h-10 rounded-full"
                      style={{
                        background: c,
                        border: `3px solid ${color === c ? "#fff" : "transparent"}`,
                        boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                      }} />
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[11px] font-bold tracking-wide" style={{ color: C.muted }}>PROGRESS</div>
            <div className="text-[12px] font-bold" style={{ color: C.sage }}>{progress}%</div>
          </div>
          <input type="range" min={0} max={100} value={progress}
                 onChange={(e) => setProgress(parseInt(e.target.value, 10))}
                 className="w-full" />
        </div>

        {/* Delete (edit only) */}
        {editing && onDelete && goal && (
          <>
            {confirming ? (
              <div className="rounded-xl p-3 mt-4"
                   style={{ background: C.urgent + "0d", border: `1px solid ${C.urgent}55` }}>
                <div className="text-[12px] font-semibold mb-2" style={{ color: C.charcoal }}>
                  Delete &ldquo;{goal.name}&rdquo;? Its tasks will stay but become unlinked.
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setConfirming(false)}
                          className="flex-1 h-9 rounded-lg text-[12px] font-bold"
                          style={{ background: C.bg, color: C.charcoal, border: `1px solid ${C.faint}` }}>Cancel</button>
                  <button onClick={() => onDelete(goal.id)}
                          className="flex-1 h-9 rounded-lg text-[12px] font-bold text-white"
                          style={{ background: C.urgent }}>Delete</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)}
                      className="w-full h-11 rounded-xl text-[13px] font-bold mt-3"
                      style={{ color: C.urgent, background: C.urgent + "0d", border: `1px solid ${C.urgent}33` }}>
                Delete goal
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
