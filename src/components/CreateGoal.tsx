"use client";

import { useState } from "react";
import { C, TYPE_STYLE } from "@/lib/colors";
import type { Goal, GoalType } from "@/types";

const EMOJI_PICK = ["🎯", "🏃‍♀️", "📖", "🧘", "💪", "🌱", "🚀", "💡", "🎨", "✍️", "💧", "🥗", "🌙", "📚", "🎵", "💼"];
const COMMON_PARTNERS = [
  { name: "Maya", ini: "M", col: "#C4A98A" },
  { name: "Jordan", ini: "J", col: "#7A9E7E" },
  { name: "Sara", ini: "S", col: "#97B099" },
  { name: "Tom", ini: "T", col: "#D4845A" },
];

interface Props {
  goals: Goal[];
  onCreate: (g: Goal) => void;
  onCancel: () => void;
}

export default function CreateGoal({ goals, onCreate, onCancel }: Props) {
  const [emoji, setEmoji] = useState("🎯");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<GoalType>("daily");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [partner, setPartner] = useState<Goal["partner"]>(null);
  const [linkedTo, setLinkedTo] = useState<string | null>(null);

  const longterms = goals.filter((g) => g.type === "longterm");

  const submit = () => {
    if (!title.trim()) return;
    const g: Goal = {
      id: `g${Date.now()}`,
      title: title.trim(),
      emoji,
      type,
      deadline,
      streak: 0,
      muted: false,
      linkedTo,
      partner,
      today: type === "daily" ? [{ t: title.trim(), done: false }] : [],
      allTasks: [],
    };
    onCreate(g);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Emoji + title */}
      <div className="flex gap-3 items-start">
        <details className="relative">
          <summary className="list-none cursor-pointer w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                   style={{ background: C.bg, border: `1px solid ${C.faint}` }}>
            {emoji}
          </summary>
          <div className="absolute z-20 mt-2 grid grid-cols-8 gap-1 p-2 rounded-2xl bg-white shadow-xl"
               style={{ border: `1px solid ${C.faint}`, width: 280 }}>
            {EMOJI_PICK.map((e) => (
              <button key={e} type="button" onClick={() => { setEmoji(e); (document.activeElement as HTMLElement)?.blur(); }}
                      className="w-8 h-8 rounded-lg text-xl hover:bg-[var(--color-bg)]"
                      style={{ background: emoji === e ? C.light : "transparent" }}>
                {e}
              </button>
            ))}
          </div>
        </details>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's the goal?"
          className="flex-1 h-14 px-4 rounded-2xl text-[15px] font-semibold outline-none focus:ring-2"
          style={{ background: C.bg, border: `1px solid ${C.faint}`, color: C.charcoal }}
        />
      </div>

      {/* Type */}
      <div>
        <Label>Type</Label>
        <div className="flex gap-2 flex-wrap">
          {(["daily", "weekly", "monthly", "longterm"] as GoalType[]).map((t) => {
            const s = TYPE_STYLE[t];
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="px-4 h-9 rounded-full text-xs font-bold"
                style={{
                  background: active ? s.color : s.bg,
                  color: active ? "#fff" : s.color,
                  border: `1px solid ${active ? s.color : "transparent"}`,
                }}
              >{s.label}</button>
            );
          })}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <Label>Deadline</Label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
               className="w-full h-11 px-4 rounded-xl text-sm outline-none"
               style={{ background: C.bg, border: `1px solid ${C.faint}`, color: C.charcoal }} />
      </div>

      {/* Partner */}
      <div>
        <Label>Accountability partner <span className="font-normal" style={{ color: C.muted }}>· optional</span></Label>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => setPartner(null)}
                  className="px-3 h-9 rounded-full text-xs font-bold"
                  style={{
                    background: !partner ? C.sageDark : C.bg, color: !partner ? "#fff" : C.muted,
                    border: `1px solid ${!partner ? C.sageDark : C.faint}`,
                  }}>No one</button>
          {COMMON_PARTNERS.map((p) => {
            const active = partner?.name === p.name;
            return (
              <button key={p.name} type="button" onClick={() => setPartner(p)}
                      className="px-3 h-9 rounded-full text-xs font-bold flex items-center gap-2"
                      style={{
                        background: active ? p.col : C.bg, color: active ? "#fff" : C.charcoal,
                        border: `1px solid ${active ? p.col : C.faint}`,
                      }}>
                <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white"
                      style={{ background: p.col, border: active ? "1.5px solid #fff" : "none" }}>{p.ini}</span>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Link to long-term */}
      {type !== "longterm" && longterms.length > 0 && (
        <div>
          <Label>Link to long-term goal <span className="font-normal" style={{ color: C.muted }}>· optional</span></Label>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => setLinkedTo(null)}
                    className="px-3 h-9 rounded-full text-xs font-bold"
                    style={{
                      background: !linkedTo ? C.sageDark : C.bg, color: !linkedTo ? "#fff" : C.muted,
                      border: `1px solid ${!linkedTo ? C.sageDark : C.faint}`,
                    }}>None</button>
            {longterms.map((g) => (
              <button key={g.id} type="button" onClick={() => setLinkedTo(g.id)}
                      className="px-3 h-9 rounded-full text-xs font-bold flex items-center gap-1.5"
                      style={{
                        background: linkedTo === g.id ? "#6B4A8A" : "#EDE3F4",
                        color: linkedTo === g.id ? "#fff" : "#6B4A8A",
                        border: `1px solid ${linkedTo === g.id ? "#6B4A8A" : "transparent"}`,
                      }}>
                <span>{g.emoji}</span>
                <span className="max-w-[120px] truncate">{g.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
                className="flex-1 h-12 rounded-2xl text-sm font-bold"
                style={{ background: C.bg, color: C.muted, border: `1px solid ${C.faint}` }}>Cancel</button>
        <button type="button" onClick={submit} disabled={!title.trim()}
                className="flex-1 h-12 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                style={{
                  background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})`,
                  boxShadow: "0 6px 14px rgba(74, 107, 78, 0.3)",
                }}>Create goal</button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold mb-2" style={{ color: C.muted, letterSpacing: "0.05em" }}>{children}</div>;
}
