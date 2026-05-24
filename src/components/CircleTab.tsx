"use client";

import { useMemo, useState } from "react";
import { C } from "@/lib/colors";
import type { Goal, Pact, Message } from "@/types";

interface Props {
  goals: Goal[];
  pacts: Pact[];
  messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface CirclePerson {
  name: string;
  ini: string;
  col: string;
  sharedGoals: Goal[];
  pactIds: string[];
}

export default function CircleTab({ goals, pacts, messages, setMessages }: Props) {
  const people = useMemo<CirclePerson[]>(() => {
    const map = new Map<string, CirclePerson>();
    for (const g of goals) {
      if (!g.partner) continue;
      const key = g.partner.name;
      const existing = map.get(key);
      if (existing) {
        existing.sharedGoals.push(g);
      } else {
        map.set(key, { name: g.partner.name, ini: g.partner.ini, col: g.partner.col, sharedGoals: [g], pactIds: [] });
      }
    }
    for (const p of pacts) {
      for (const m of p.members) {
        const existing = map.get(m.name);
        if (existing) existing.pactIds.push(p.id);
        else map.set(m.name, { name: m.name, ini: m.ini, col: m.col, sharedGoals: [], pactIds: [p.id] });
      }
    }
    return Array.from(map.values());
  }, [goals, pacts]);

  const [nudged, setNudged] = useState<string[]>([]);

  const nudge = (person: CirclePerson) => {
    const pactId = person.pactIds[0];
    if (pactId) {
      setMessages((cur) => [
        ...cur,
        {
          id: Date.now(),
          pactId,
          user: "system",
          text: `You nudged ${person.name} 👋`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "system",
        },
      ]);
    }
    setNudged((cur) => [...cur, person.name]);
    setTimeout(() => setNudged((cur) => cur.filter((n) => n !== person.name)), 2000);
  };

  return (
    <div className="px-4 sm:px-5 pt-4 lg:pt-6 pb-6">
      <h1 className="text-[24px] font-bold mb-1" style={{ color: C.sageDark }}>Your Circle</h1>
      <p className="text-[12px] mb-4" style={{ color: C.muted }}>
        People you&apos;ve made pacts and goals with
      </p>

      <div className="flex flex-col gap-2.5">
        {people.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: C.muted }}>
            Assign a partner to a goal to build your circle
          </div>
        )}
        {people.map((p) => {
          const totalPct = p.sharedGoals.length === 0 ? 0
            : Math.round(p.sharedGoals.reduce((a, g) => {
                const total = g.allTasks.length || 1;
                const done = g.allTasks.filter((t) => t.done).length;
                return a + (done / total) * 100;
              }, 0) / p.sharedGoals.length);
          return (
            <div key={p.name} className="rounded-3xl p-4"
                 style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full text-sm font-bold flex items-center justify-center text-white"
                      style={{ background: p.col }}>{p.ini}</span>
                <div className="flex-1">
                  <div className="text-[14px] font-bold" style={{ color: C.charcoal }}>{p.name}</div>
                  <div className="text-[10px]" style={{ color: C.muted }}>
                    {p.sharedGoals.length} shared goal{p.sharedGoals.length === 1 ? "" : "s"} · {totalPct}% together
                  </div>
                </div>
                <button onClick={() => nudge(p)}
                        disabled={nudged.includes(p.name)}
                        className="px-3 h-9 rounded-full text-[11px] font-bold"
                        style={{
                          background: nudged.includes(p.name) ? C.light : `linear-gradient(165deg, ${C.sageDark}, ${C.sage})`,
                          color: nudged.includes(p.name) ? C.sageDark : "#fff",
                        }}>
                  {nudged.includes(p.name) ? "Nudged ✓" : "👋 Nudge"}
                </button>
              </div>

              {p.sharedGoals.length > 0 && (
                <div className="mt-3 pt-3 flex flex-col gap-1.5"
                     style={{ borderTop: `1px solid ${C.faint}` }}>
                  {p.sharedGoals.map((g) => {
                    const total = g.allTasks.length || 1;
                    const done = g.allTasks.filter((t) => t.done).length;
                    const pct = Math.round((done / total) * 100);
                    return (
                      <div key={g.id} className="flex items-center gap-2">
                        <span>{g.emoji}</span>
                        <span className="text-[11px] flex-1 truncate" style={{ color: C.charcoal }}>{g.title}</span>
                        <div className="w-14 h-1.5 rounded-full" style={{ background: C.faint }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.sage }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
