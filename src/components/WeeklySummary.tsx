"use client";

import { C } from "@/lib/colors";
import type { Goal } from "@/types";

interface Props {
  goals: Goal[];
  pct: number;
  streak: number;
  userName: string;
}

export default function WeeklySummary({ goals, pct, streak, userName }: Props) {
  const partnerGoals = goals.filter((g) => g.partner);
  // synthesize "partner percentages" from streak/progress for demo
  const partnerMap = new Map<string, { name: string; ini: string; col: string; pct: number; mine: number; total: number }>();
  for (const g of partnerGoals) {
    const p = g.partner!;
    const total = g.allTasks.length || 1;
    const done = g.allTasks.filter((t) => t.done).length;
    const minePct = Math.round((done / total) * 100);
    const theirsPct = Math.min(100, Math.max(0, minePct + (g.streak % 2 ? 8 : -12)));
    const key = p.name;
    const existing = partnerMap.get(key);
    if (existing) {
      partnerMap.set(key, { ...existing, mine: existing.mine + minePct, total: existing.total + 100, pct: theirsPct });
    } else {
      partnerMap.set(key, { name: p.name, ini: p.ini, col: p.col, mine: minePct, total: 100, pct: theirsPct });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl p-5 text-white"
           style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>
        <div className="text-[10px] font-bold tracking-[0.2em] opacity-60">YOUR WEEK</div>
        <div className="text-[36px] font-bold mt-1">{pct}%</div>
        <div className="flex gap-4 mt-3">
          <Stat label="Streak" value={`${streak}d`} />
          <Stat label="Goals" value={`${goals.length}`} />
          <Stat label="Partners" value={`${partnerMap.size}`} />
        </div>
      </div>

      {partnerMap.size > 0 && (
        <div>
          <div className="text-[11px] font-bold tracking-wide mb-2" style={{ color: C.muted }}>VS YOUR PARTNERS</div>
          <div className="flex flex-col gap-2">
            {Array.from(partnerMap.values()).map((p) => {
              const youAvg = Math.round(p.mine / (p.total / 100));
              return (
                <div key={p.name} className="rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                          style={{ background: p.col }}>{p.ini}</span>
                    <span className="text-[13px] font-bold flex-1" style={{ color: C.charcoal }}>{p.name}</span>
                  </div>
                  <Row label={userName} pct={youAvg} color={C.sage} />
                  <Row label={p.name}     pct={p.pct}  color={p.col} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button className="h-11 rounded-2xl text-[13px] font-bold text-white mt-2"
              style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>
        Share weekly summary
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-bold tracking-wide opacity-60">{label.toUpperCase()}</div>
      <div className="text-[16px] font-bold">{value}</div>
    </div>
  );
}

function Row({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="font-bold" style={{ color: C.charcoal }}>{label}</span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: C.faint }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
