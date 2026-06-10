"use client";

import { useState } from "react";
import { C } from "@/lib/colors";
import type { Partner } from "@/types";

interface Props {
  onCancel: () => void;
  onCreate: (p: Partner & { relationship?: string }) => void;
}

/** Deterministic warm-palette color from a name hash. */
const WARM_PALETTE = ["#C4A98A", "#7A9E7E", "#C5A33E", "#D4845A", "#7D6B8A", "#97B099", "#8a9178"];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return WARM_PALETTE[h % WARM_PALETTE.length];
}

export default function AddToCircleModal({ onCancel, onCreate }: Props) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");

  const nameValid = name.trim().length > 0;
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  const color = colorFor(name.trim() || "?");

  const submit = () => {
    if (!nameValid) return;
    onCreate({
      id: `c_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      initial,
      color,
      relationship: relationship.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center anim-fade"
         style={{ background: "rgba(45,45,45,0.45)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 anim-slide-up">

        <div className="flex items-center justify-between mb-1">
          <button onClick={onCancel} className="text-[12px] font-bold" style={{ color: C.muted }}>Cancel</button>
          <button onClick={submit} disabled={!nameValid}
                  className="text-[12px] font-bold disabled:opacity-40"
                  style={{ color: C.sageDark }}>Add</button>
        </div>

        <h2 className="text-[18px] font-bold mb-4" style={{ color: C.sageDark }}>Add to Circle</h2>

        {/* Live avatar preview */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[24px] font-bold"
               style={{ background: color }}>{initial}</div>
        </div>

        <label className="block mb-4">
          <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: C.muted }}>NAME</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
                 onKeyDown={(e) => { if (e.key === "Enter" && nameValid) submit(); }}
                 maxLength={40} placeholder="Sara"
                 className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
                 style={{ background: C.bg, border: `1.5px solid ${name ? C.warm : C.faint}`, color: C.charcoal }} />
        </label>

        <label className="block">
          <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: C.muted }}>
            RELATIONSHIP <span className="font-normal" style={{ textTransform: "lowercase" }}>· optional</span>
          </span>
          <input value={relationship} onChange={(e) => setRelationship(e.target.value)}
                 maxLength={40} placeholder="Best friend, coach, accountability partner"
                 className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
                 style={{ background: C.bg, border: `1.5px solid ${C.faint}`, color: C.charcoal }} />
        </label>
      </div>
    </div>
  );
}
