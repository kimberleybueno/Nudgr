"use client";

import { useState } from "react";
import { C } from "@/lib/colors";

interface Person {
  id: string;
  name: string;
  initial: string;
  color: string;
  status: string;
  online: boolean;
  streak: number;
  goals: { title: string; pct: number }[];
  sharedGoals: string[];
}

interface Props {
  person: Person;
  onBack: () => void;
  onNudge: () => void;
  onMessage: () => void;
  /** When true, render as a panel inside a desktop layout instead of a full-screen takeover. */
  embedded?: boolean;
}

export default function PartnerDetail({ person, onBack, onNudge, onMessage, embedded = false }: Props) {
  const [nudged, setNudged] = useState(false);

  const handleNudge = () => {
    onNudge();
    setNudged(true);
    setTimeout(() => setNudged(false), 5000);
  };

  return (
    <div
      className={embedded ? "anim-up rounded-3xl overflow-hidden" : "anim-up min-h-screen"}
      style={{
        background: C.bg,
        border: embedded ? `1px solid ${C.faint}` : "none",
      }}
    >
      {/* Header */}
      <div
        className="px-5 pb-5"
        style={{ background: "#fff", paddingTop: embedded ? 20 : 48 }}
      >
        {!embedded && (
          <button onClick={onBack} className="text-[18px] mb-4 w-7 h-7 flex items-center justify-center"
                  style={{ color: C.sage }} aria-label="Back">‹</button>
        )}
        <div className="text-center">
          <div className="relative inline-block">
            <div
              className="rounded-full flex items-center justify-center text-white text-[28px] font-bold"
              style={{ width: 72, height: 72, background: person.color }}
            >{person.initial}</div>
            {person.online && (
              <div
                className="absolute rounded-full"
                style={{ bottom: 2, right: 2, width: 14, height: 14, background: "#4CAF50", border: "3px solid #fff" }}
              />
            )}
          </div>
          <div className="text-[20px] font-bold mt-2.5" style={{ color: C.charcoal }}>{person.name}</div>
          <div className="text-[12px]" style={{ color: C.muted }}>{person.status}</div>

          <div className="flex gap-4 justify-center mt-4">
            <Stat value={`🔥 ${person.streak}`} label="Streak" color={C.gold} />
            <Stat value="78%" label="This week" color={C.sage} />
            <Stat value={`${person.sharedGoals.length || 0}`} label="Shared goals" color={C.charcoal} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {person.goals.length > 0 ? (
          <>
            <div className="text-[11px] font-bold tracking-wide mb-2" style={{ color: C.muted }}>
              THEIR GOALS
            </div>
            {person.goals.map((g, i) => (
              <div key={i} className="rounded-2xl p-3.5 mb-2" style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
                <div className="text-[14px] font-bold mb-2" style={{ color: C.charcoal }}>{g.title}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: C.faint }}>
                    <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: C.sage }} />
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: C.sage }}>{g.pct}%</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-4 text-[12px]" style={{ color: C.muted }}>
            {person.name}&apos;s personal goals aren&apos;t shared with you yet
          </div>
        )}

        {person.sharedGoals.length > 0 && (
          <>
            <div className="text-[11px] font-bold tracking-wide mt-4 mb-2" style={{ color: C.muted }}>
              HOLDING YOU ACCOUNTABLE ON
            </div>
            {person.sharedGoals.map((g, i) => (
              <div
                key={i}
                className="rounded-xl px-3.5 py-2.5 mb-1.5 text-[13px] font-semibold"
                style={{ background: C.sage + "10", border: `1px solid ${C.sage}25`, color: C.sage }}
              >🎯 {g}</div>
            ))}
          </>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleNudge}
            disabled={nudged}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-bold text-white"
            style={{ background: nudged ? C.muted : C.sage, opacity: nudged ? 0.6 : 1 }}
          >{nudged ? "Sent ✓" : "👋 Send Nudge"}</button>
          <button
            onClick={onMessage}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-bold"
            style={{ background: C.bg, color: C.charcoal, border: `1px solid ${C.faint}` }}
          >💬 Message</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[18px] font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}
