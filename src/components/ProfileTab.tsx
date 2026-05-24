"use client";

import { useState } from "react";
import { C } from "@/lib/colors";
import Overlay from "./Overlay";
import WeeklySummary from "./WeeklySummary";
import InviteFriends from "./InviteFriends";
import type { Goal, Pact } from "@/types";

interface Props {
  goals: Goal[];
  pacts: Pact[];
  userName: string; setUserName: React.Dispatch<React.SetStateAction<string>>;
}

export default function ProfileTab({ goals, pacts, userName, setUserName }: Props) {
  const [summary, setSummary] = useState(false);
  const [invite, setInvite] = useState(false);
  const [name, setName] = useState(userName);

  const totalTasks  = goals.reduce((a, g) => a + g.allTasks.length, 0);
  const doneTasks   = goals.reduce((a, g) => a + g.allTasks.filter((t) => t.done).length, 0);
  const overallPct  = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const totalStreak = goals.reduce((a, g) => Math.max(a, g.streak), 0);

  const wipeData = () => {
    if (confirm("Reset all Nudgr data? This clears todos, goals, pacts and messages.")) {
      Object.keys(localStorage).filter((k) => k.startsWith("nudgr_")).forEach((k) => localStorage.removeItem(k));
      location.reload();
    }
  };

  return (
    <div className="px-4 sm:px-5 pt-4 lg:pt-6 pb-6">
      <h1 className="text-[24px] font-bold mb-4" style={{ color: C.sageDark }}>Profile</h1>

      <div className="rounded-3xl p-5 text-white mb-4"
           style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
               style={{ background: "rgba(255,255,255,0.22)" }}>
            {userName?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <input value={name} onChange={(e) => setName(e.target.value)}
                   onBlur={() => name.trim() && setUserName(name.trim())}
                   className="bg-transparent outline-none text-[18px] font-bold w-full"
                   style={{ color: "#fff" }} />
            <div className="text-[10px] opacity-70 mt-0.5">@mynudgr / {userName}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Mini label="Goals" value={`${goals.length}`} />
          <Mini label="Streak" value={`${totalStreak}d`} />
          <Mini label="Overall" value={`${overallPct}%`} />
        </div>
      </div>

      <Section label="Activity">
        <Row icon="📊" label="Weekly summary" onClick={() => setSummary(true)} />
        <Row icon="💌" label="Invite friends" onClick={() => setInvite(true)} />
        <Row icon="💬" label="My pacts" badge={`${pacts.length}`} />
      </Section>

      <Section label="Preferences">
        <Row icon="🔔" label="Notifications" badge="On" />
        <Row icon="🌙" label="Dark mode" badge="Soon" />
        <Row icon="🌐" label="Language" badge="English" />
      </Section>

      <Section label="Account">
        <Row icon="ℹ️" label="About Nudgr" />
        <Row icon="🛟" label="Help & feedback" />
        <Row icon="🧹" label="Reset all data" onClick={wipeData} danger />
      </Section>

      <div className="text-center text-[10px] mt-6" style={{ color: C.muted }}>
        Nudgr · mynudgr.com · v0.1
      </div>

      <Overlay open={summary} onClose={() => setSummary(false)} title="This week" side>
        <WeeklySummary goals={goals} pct={overallPct} streak={totalStreak} userName={userName} />
      </Overlay>
      <Overlay open={invite} onClose={() => setInvite(false)} title="Invite friends">
        <InviteFriends userName={userName} />
      </Overlay>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl px-3 py-2" style={{ background: "rgba(255,255,255,0.18)" }}>
      <div className="text-[9px] font-bold tracking-wide opacity-65">{label.toUpperCase()}</div>
      <div className="text-[16px] font-bold">{value}</div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold tracking-wide mb-2 px-1" style={{ color: C.muted }}>{label.toUpperCase()}</div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, badge, onClick, danger }: { icon: string; label: string; badge?: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3"
            style={{ borderTop: `1px solid ${C.faint}` }}>
      <span className="text-base">{icon}</span>
      <span className="text-[13px] font-semibold flex-1 text-left"
            style={{ color: danger ? C.urgent : C.charcoal }}>{label}</span>
      {badge && <span className="text-[10px] font-bold" style={{ color: C.muted }}>{badge}</span>}
      <span style={{ color: C.muted }}>›</span>
    </button>
  );
}
