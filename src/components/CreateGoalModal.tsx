"use client";

import { useState } from "react";
import { N, GOAL_COLORS } from "@/lib/colors";
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
  /**
   * Optional "why" statement that powers the WHY card on Goal detail.
   * Empty string saves as undefined so the card stays hidden.
   */
  const [why, setWhy] = useState(goal?.why ?? "");
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

    const trimmedWhy = why.trim();
    const updated: Goal = {
      id,
      emoji,
      name: name.trim(),
      color,
      deadline,
      deadlineDate: targetDate,
      tasks: goal?.tasks ?? [],
      ...(trimmedWhy ? { why: trimmedWhy } : {}),
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center anim-fade"
         style={{ background: "rgba(45,45,45,0.45)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto anim-slide-up">

        <div className="flex items-center justify-between mb-1">
          <button onClick={onCancel} className="text-[12px] font-bold" style={{ color: N.inkSoft }}>Cancel</button>
          <button onClick={save} disabled={!nameValid}
                  className="text-[12px] font-bold disabled:opacity-40"
                  style={{ color: N.sageDeep }}>{editing ? "Save" : "Create"}</button>
        </div>

        <h2 className="text-[18px] font-bold mb-4" style={{ color: N.sageDeep }}>
          {editing ? "Edit goal" : "New goal"}
        </h2>

        {/* Emoji + title row */}
        <div className="flex gap-3 mb-4">
          <details className="relative">
            <summary className="list-none cursor-pointer w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                     style={{ background: N.cream, border: `1.5px solid ${N.line}` }}>{emoji}</summary>
            <div className="absolute z-20 mt-2 grid grid-cols-8 gap-1 p-2 rounded-2xl bg-white shadow-xl"
                 style={{ border: `1px solid ${N.line}`, width: 280 }}>
              {EMOJI_OPTS.map((e) => (
                <button key={e} type="button"
                        onClick={() => { setEmoji(e); (document.activeElement as HTMLElement)?.blur(); }}
                        className="w-8 h-8 rounded-lg text-xl"
                        style={{ background: emoji === e ? N.sageTint14 : "transparent" }}>{e}</button>
              ))}
            </div>
          </details>
          <input autoFocus={!editing} value={name} onChange={(e) => setName(e.target.value)}
                 maxLength={60} placeholder="Marathon Training"
                 className="flex-1 h-14 px-4 rounded-2xl text-[15px] font-semibold outline-none"
                 style={{ background: N.cream, border: `1.5px solid ${name ? N.tan : N.line}`, color: N.ink }} />
        </div>

        {/* Your why (optional) — feeds the WHY card on Goal detail */}
        <label className="block mb-3.5">
          <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>
            YOUR WHY <span className="font-normal" style={{ textTransform: "lowercase" }}>· optional</span>
          </span>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="The reason it matters. One short sentence."
            className="font-display w-full px-4 py-3 rounded-xl outline-none"
            style={{
              background: "rgba(196, 169, 138, 0.14)",
              border: "1px solid rgba(196, 169, 138, 0.22)",
              color: "#36352F",
              fontSize: 14.5,
              fontStyle: "italic",
              lineHeight: 1.45,
              resize: "vertical",
              minHeight: 64,
            }}
          />
        </label>

        {/* Type */}
        <div className="mb-3.5">
          <div className="text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>TYPE</div>
          <div className="flex gap-1.5">
            {(["short", "long"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                      className="flex-1 h-10 rounded-xl text-[12px] font-bold capitalize"
                      style={{
                        background: type === t ? N.sage : N.cream,
                        color: type === t ? "#fff" : N.inkSoft,
                        border: `1px solid ${type === t ? N.sage : N.line}`,
                      }}>{t === "short" ? "Short-term" : "Long-term"}</button>
            ))}
          </div>
        </div>

        {/* Target date */}
        <label className="block mb-3.5">
          <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>
            TARGET DATE <span className="font-normal" style={{ textTransform: "lowercase" }}>· optional</span>
          </span>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                 style={{ background: N.cream, border: `1.5px solid ${N.line}`, color: N.ink }} />
        </label>

        {/* Color */}
        <div className="mb-3.5">
          <div className="text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>COLOR</div>
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
            <div className="text-[11px] font-bold tracking-wide" style={{ color: N.inkSoft }}>PROGRESS</div>
            <div className="text-[12px] font-bold" style={{ color: N.sage }}>{progress}%</div>
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
                   style={{ background: "#A8483A" + "0d", border: `1px solid ${"#A8483A"}55` }}>
                <div className="text-[12px] font-semibold mb-2" style={{ color: N.ink }}>
                  Delete &ldquo;{goal.name}&rdquo;? Its tasks will stay but become unlinked.
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setConfirming(false)}
                          className="flex-1 h-9 rounded-lg text-[12px] font-bold"
                          style={{ background: N.cream, color: N.ink, border: `1px solid ${N.line}` }}>Cancel</button>
                  <button onClick={() => onDelete(goal.id)}
                          className="flex-1 h-9 rounded-lg text-[12px] font-bold text-white"
                          style={{ background: "#A8483A" }}>Delete</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)}
                      className="w-full h-11 rounded-xl text-[13px] font-bold mt-3"
                      style={{ color: "#A8483A", background: "#A8483A" + "0d", border: `1px solid ${"#A8483A"}33` }}>
                Delete goal
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
