"use client";

import { HERO_GRADIENT } from "@/lib/colors";

interface Props {
  name: string;
  todayPct: number;
  doneToday: number;
  totalToday: number;
  streak: number;
  /** When the calendar is on a date other than today, label changes from "TODAY" to "MAY 26" etc. */
  selectedDayLabel?: string;
}

export default function Hero({ name, todayPct, doneToday, totalToday, streak, selectedDayLabel }: Props) {
  const now = new Date();
  const dateLine = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const todayLabel = (selectedDayLabel ?? "TODAY").toUpperCase();

  return (
    <section
      className="relative overflow-hidden text-white px-5 pt-7 pb-6"
      style={{
        background: HERO_GRADIENT,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        boxShadow: "0 10px 28px rgba(74, 107, 78, 0.22)",
      }}
    >
      <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="relative">
        <div className="text-[10px] font-bold tracking-[0.22em] opacity-55">{dateLine}</div>
        <h1 className="text-[22px] font-bold mt-1">
          {greet}, <span className="font-light italic">{name}</span>
        </h1>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Pill label={todayLabel} value={`${todayPct}%`} />
          <Pill label="STREAK"    value={`${streak}d`} accent />
          <Pill label="TASKS"     value={`${doneToday}/${totalToday}`} />
        </div>
      </div>
    </section>
  );
}

function Pill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-2.5 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.10)", borderRadius: 14 }}>
      <div className="text-[10px] font-semibold tracking-[0.06em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </div>
      <div className="text-[22px] font-bold mt-0.5" style={{ color: accent ? "#F4DC8A" : "#fff" }}>
        {value}
      </div>
    </div>
  );
}
