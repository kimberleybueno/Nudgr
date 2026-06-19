"use client";

import { useState } from "react";
import { N, GOAL_COLORS } from "@/lib/colors";
import type { Goal } from "@/types";

interface Props {
  onCancel: () => void;
  /** Returns the new goal; caller is responsible for linking it to the task. */
  onCreate: (g: Goal) => void;
}

const EMOJI_OPTS = ["🎯", "🏃‍♀️", "📖", "💪", "🌱", "🚀", "💡", "🎨", "📚"];

export default function InlineGoalForm({ onCancel, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  const valid = title.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    const id = `g_${Math.random().toString(36).slice(2, 8)}`;
    onCreate({
      id,
      emoji,
      name: title.trim(),
      color: GOAL_COLORS[0],
      deadline: "",
      deadlineDate: "",
      tasks: [],
    });
  };

  return (
    <div className="rounded-xl p-2.5 mt-1.5"
         style={{ background: "#fff", border: `1.5px solid ${N.tan}` }}>
      <div className="flex items-center gap-2">
        <details className="relative">
          <summary className="list-none cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                   style={{ background: N.cream, border: `1px solid ${N.line}` }}>{emoji}</summary>
          <div className="absolute z-30 mt-1 grid grid-cols-9 gap-0.5 p-1.5 rounded-xl bg-white shadow-lg"
               style={{ border: `1px solid ${N.line}` }}>
            {EMOJI_OPTS.map((e) => (
              <button key={e} type="button"
                      onClick={() => { setEmoji(e); (document.activeElement as HTMLElement)?.blur(); }}
                      className="w-7 h-7 rounded text-base"
                      style={{ background: emoji === e ? N.sageTint14 : "transparent" }}>{e}</button>
            ))}
          </div>
        </details>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
               onKeyDown={(e) => { if (e.key === "Enter" && valid) submit(); if (e.key === "Escape") onCancel(); }}
               placeholder="New goal name"
               className="flex-1 h-9 px-3 rounded-lg text-[13px] outline-none"
               style={{ background: N.cream, border: `1px solid ${N.line}`, color: N.ink }} />
      </div>
      <div className="flex gap-1.5 mt-2">
        <button onClick={onCancel}
                className="flex-1 h-8 rounded-lg text-[11px] font-bold"
                style={{ background: N.cream, color: N.inkSoft, border: `1px solid ${N.line}` }}>Cancel</button>
        <button onClick={submit} disabled={!valid}
                className="flex-1 h-8 rounded-lg text-[11px] font-bold text-white disabled:opacity-40"
                style={{ background: N.sageDeep }}>Create &amp; link</button>
      </div>
    </div>
  );
}
