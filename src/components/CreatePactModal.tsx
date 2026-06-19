"use client";

import { useState } from "react";
import { N } from "@/lib/colors";
import type { Pact, PactCadence, Partner } from "@/types";

interface Props {
  circle: Partner[];        // user's Circle, used as the member-picker source
  onCancel: () => void;
  onCreate: (p: Pact) => void;
  onInviteSomeoneNew: () => void;
}

const EMOJI_OPTS = ["🚀", "🏃‍♀️", "📖", "💪", "🌱", "🎯", "💡", "🎨", "📚", "🧘", "💼", "🥗", "🌙", "✨", "🔥", "🌅", "📈", "🎵"];

export default function CreatePactModal({ circle, onCancel, onCreate, onInviteSomeoneNew }: Props) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [emoji, setEmoji] = useState("🚀");
  const [cadence, setCadence] = useState<PactCadence>("none");
  const [members, setMembers] = useState<Partner[]>([]);
  const [memberPicker, setMemberPicker] = useState(false);

  const nameValid = name.trim().length > 0;

  const toggleMember = (p: Partner) => {
    setMembers((cur) => cur.some((m) => m.id === p.id)
      ? cur.filter((m) => m.id !== p.id)
      : [...cur, p]);
  };

  const submit = () => {
    if (!nameValid) return;
    const id = `p_${Math.random().toString(36).slice(2, 8)}`;
    const pact: Pact = {
      id,
      name: name.trim(),
      emoji,
      owner: "me",
      members: members.map((p) => ({ ini: p.initial, col: p.color, name: p.name })),
      unread: 0,
      last: "You created this Pact",
      time: "now",
      pinned: false,
      sharedGoals: [],
      goal: goal.trim() || undefined,
      cadence,
      createdAt: new Date().toISOString(),
    };
    onCreate(pact);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center anim-fade"
         style={{ background: "rgba(45,45,45,0.45)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto anim-slide-up">

        <div className="flex items-center justify-between mb-1">
          <button onClick={onCancel} className="text-[12px] font-bold" style={{ color: N.inkSoft }}>Cancel</button>
          <button onClick={submit} disabled={!nameValid}
                  className="text-[12px] font-bold disabled:opacity-40"
                  style={{ color: N.sageDeep }}>Create</button>
        </div>

        <h2 className="text-[18px] font-bold mb-4" style={{ color: N.sageDeep }}>New Pact</h2>

        {/* Emoji picker */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {EMOJI_OPTS.map((e) => (
            <button key={e} onClick={() => setEmoji(e)}
                    className="w-10 h-10 rounded-xl text-[20px] flex items-center justify-center"
                    style={{
                      background: emoji === e ? N.sageTint14 : N.cream,
                      border: `1.5px solid ${emoji === e ? N.sage : N.line}`,
                    }}>{e}</button>
          ))}
        </div>

        {/* Name */}
        <label className="block mb-3.5">
          <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>PACT NAME</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
                 placeholder="Run Club, Reading Pact, Build Crew"
                 className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
                 style={{ background: N.cream, border: `1.5px solid ${name ? N.tan : N.line}`, color: N.ink }} />
        </label>

        {/* Shared goal */}
        <label className="block mb-3.5">
          <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>
            SHARED GOAL <span className="font-normal" style={{ textTransform: "lowercase" }}>· optional</span>
          </span>
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={200} rows={2}
                    placeholder="What is this Pact working toward?"
                    className="w-full px-4 py-3 rounded-xl text-[15px] outline-none resize-none"
                    style={{ background: N.cream, border: `1.5px solid ${N.line}`, color: N.ink }} />
        </label>

        {/* Cadence */}
        <div className="mb-3.5">
          <div className="text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>CADENCE</div>
          <div className="flex gap-1.5">
            {(["daily", "weekly", "none"] as PactCadence[]).map((c) => (
              <button key={c} onClick={() => setCadence(c)}
                      className="flex-1 h-10 rounded-xl text-[12px] font-bold capitalize"
                      style={{
                        background: cadence === c ? N.sage : N.cream,
                        color: cadence === c ? "#fff" : N.inkSoft,
                        border: `1px solid ${cadence === c ? N.sage : N.line}`,
                      }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="mb-3.5">
          <div className="text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>MEMBERS</div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <div className="px-3 h-8 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                 style={{ background: N.sage, color: "#fff" }}>
              <span className="w-5 h-5 rounded-full text-[9px] flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.25)" }}>Y</span>
              You · owner
            </div>
            {members.map((m) => (
              <div key={m.id} className="px-3 h-8 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                   style={{ background: m.color + "26", color: m.color, border: `1px solid ${m.color}33` }}>
                <span className="w-5 h-5 rounded-full text-[9px] flex items-center justify-center text-white"
                      style={{ background: m.color }}>{m.initial}</span>
                {m.name}
                <button onClick={() => toggleMember(m)} className="ml-0.5">×</button>
              </div>
            ))}
            <button onClick={() => setMemberPicker(true)}
                    className="px-3 h-8 rounded-full text-[11px] font-bold"
                    style={{ background: N.cream, border: `1px dashed ${N.tan}`, color: N.tan }}>
              + Add members
            </button>
          </div>
        </div>

        {/* Member picker sheet */}
        {memberPicker && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center anim-fade"
               style={{ background: "rgba(45,45,45,0.55)" }} onClick={() => setMemberPicker(false)}>
            <div onClick={(e) => e.stopPropagation()}
                 className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] overflow-y-auto anim-slide-up">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[15px] font-bold" style={{ color: N.sageDeep }}>Add members</div>
                <button onClick={() => setMemberPicker(false)} className="text-[12px] font-bold" style={{ color: N.sageDeep }}>Done</button>
              </div>
              {circle.length === 0 ? (
                <div className="text-center py-4 text-[12px]" style={{ color: N.inkSoft }}>
                  Your Circle is empty. Invite someone to get started.
                </div>
              ) : (
                circle.map((p) => {
                  const selected = members.some((m) => m.id === p.id);
                  return (
                    <button key={p.id} onClick={() => toggleMember(p)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5"
                            style={{
                              background: selected ? N.sageTint14 : N.cream,
                              border: `1px solid ${selected ? N.sage : N.line}`,
                            }}>
                      <span className="w-9 h-9 rounded-full text-[12px] font-bold flex items-center justify-center text-white"
                            style={{ background: p.color }}>{p.initial}</span>
                      <span className="flex-1 text-left text-[13px] font-bold" style={{ color: N.ink }}>{p.name}</span>
                      <span className="text-[14px]" style={{ color: selected ? N.sage : N.inkSoft }}>
                        {selected ? "✓" : "+"}
                      </span>
                    </button>
                  );
                })
              )}
              <div className="h-px my-3" style={{ background: N.line }} />
              <button onClick={() => { setMemberPicker(false); onInviteSomeoneNew(); }}
                      className="w-full py-3 rounded-xl text-[13px] font-bold"
                      style={{ background: N.tan + "20", color: N.tan, border: `1px solid ${N.tan}40` }}>
                Invite someone new
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
