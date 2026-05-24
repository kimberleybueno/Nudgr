"use client";

import { useMemo, useState } from "react";
import { C, TYPE_STYLE } from "@/lib/colors";
import type { Goal, Todo, Pact, Message } from "@/types";
import Overlay from "./Overlay";
import GoalDetail from "./GoalDetail";
import Celebration from "./Celebration";
import WeeklySummary from "./WeeklySummary";
import InviteFriends from "./InviteFriends";

interface Props {
  todos: Todo[]; setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  goals: Goal[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  pacts: Pact[]; setPacts: React.Dispatch<React.SetStateAction<Pact[]>>;
  messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userName: string;
  onCreate: () => void;
  onOpenPacts: () => void;
}

export default function HomeTab({ todos, setTodos, goals, setGoals, pacts, setMessages, userName, onCreate }: Props) {
  const [todoInput, setTodoInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [openWeek, setOpenWeek] = useState(true);
  const [openMonth, setOpenMonth] = useState(true);
  const [openLong, setOpenLong] = useState(true);
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [summary, setSummary] = useState(false);
  const [invite, setInvite] = useState(false);

  const now = new Date();
  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, [now]);

  const todaysGoalTasks = goals.flatMap((g) => g.today.map((t, i) => ({ goalId: g.id, idx: i, t })));
  const doneTodayCount = todaysGoalTasks.filter((x) => x.t.done).length;
  const totalTodayCount = todaysGoalTasks.length;
  const overallPct = totalTodayCount === 0 ? 0 : Math.round((doneTodayCount / totalTodayCount) * 100);
  const totalStreak = goals.reduce((a, g) => Math.max(a, g.streak), 0);

  const pendingTodos = todos.filter((t) => !t.done).slice(0, 4);

  const addTodo = () => {
    const txt = todoInput.trim();
    if (!txt) return;
    setTodos((cur) => [
      { id: `t${Date.now()}`, text: txt, done: false, added: new Date().toISOString().slice(0, 10), priority: false, overdue: false },
      ...cur,
    ]);
    setTodoInput("");
  };

  const toggleTodo = (id: string) => setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const toggleGoalTask = (goalId: string, idx: number) => {
    setGoals((cur) => cur.map((g) => {
      if (g.id !== goalId) return g;
      const today = g.today.map((t, i) => (i === idx ? { ...t, done: !t.done } : t));
      return { ...g, today };
    }));
    // check celebration after state settles
    setTimeout(() => {
      const newGoals = goals.map((g) => g.id === goalId
        ? { ...g, today: g.today.map((t, i) => (i === idx ? { ...t, done: !t.done } : t)) }
        : g);
      const all = newGoals.flatMap((g) => g.today);
      if (all.length > 0 && all.every((t) => t.done)) setCelebrating(true);
    }, 0);
  };

  const weekGoals    = goals.filter((g) => g.type === "weekly"   && !g.muted);
  const monthGoals   = goals.filter((g) => g.type === "monthly"  && !g.muted);
  const longGoals    = goals.filter((g) => g.type === "longterm" && !g.muted);

  const shareToPact = (pactId: string, text: string) => {
    setMessages((cur) => [
      ...cur,
      { id: Date.now(), pactId, user: "system", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "system" },
    ]);
  };

  return (
    <div className="px-4 sm:px-5 pt-4 lg:pt-6 pb-6 flex flex-col gap-5">
      {/* Hero */}
      <section
        className="rounded-[28px] p-5 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(165deg, ${C.sageDark} 0%, ${C.sage} 60%, ${C.muted} 100%)`,
          boxShadow: "0 10px 30px rgba(74, 107, 78, 0.25)",
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] opacity-50">
                {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <h1 className="text-[24px] font-bold mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                {greeting}, <span className="font-light italic">{userName}</span>
              </h1>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setSummary(true)} aria-label="Weekly summary"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[15px]"
                      style={{ background: "rgba(255,255,255,0.18)" }}>📊</button>
              <button onClick={() => setInvite(true)} aria-label="Invite friends"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[15px]"
                      style={{ background: "rgba(255,255,255,0.18)" }}>💌</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <StatPill label="Today" value={`${overallPct}%`} />
            <StatPill label="Streak" value={`${totalStreak}d`} accent />
            <StatPill label="Tasks" value={`${doneTodayCount}/${totalTodayCount}`} />
          </div>
        </div>
      </section>

      {/* Quick todos */}
      <section>
        <div className="flex gap-2 mb-2">
          <input
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTodo(); }}
            placeholder="+ Add a quick todo..."
            className="flex-1 h-11 px-4 rounded-2xl text-sm outline-none"
            style={{ background: "#fff", border: `1px solid ${C.faint}`, color: C.charcoal }}
          />
          <button onClick={addTodo}
                  className="w-11 h-11 rounded-2xl text-white text-xl"
                  style={{
                    background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})`,
                    boxShadow: "0 4px 12px rgba(74, 107, 78, 0.25)",
                  }}>+</button>
        </div>
        <div className="flex flex-col gap-1.5">
          {pendingTodos.length === 0 && (
            <div className="text-center py-3 text-xs" style={{ color: C.muted }}>No quick todos. Nice.</div>
          )}
          {pendingTodos.map((t, i) => (
            <div key={t.id} className="anim-up flex items-center gap-3 px-3 py-2 rounded-xl"
                 style={{
                   background: "#fff",
                   border: `1px solid ${t.overdue ? C.urgent + "55" : C.faint}`,
                   animationDelay: `${i * 0.05}s`,
                 }}>
              <button onClick={() => toggleTodo(t.id)} aria-label="Toggle"
                      className="w-5 h-5 rounded-full shrink-0"
                      style={{ border: `2px solid ${C.muted}`, background: t.done ? C.sage : "transparent" }} />
              <span className="text-[13px] flex-1 truncate" style={{ color: C.charcoal }}>{t.text}</span>
              {t.overdue && <span className="text-xs">⚠️</span>}
              {t.priority && <span className="text-xs">⭐</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Calendar */}
      <CalendarStrip selected={selectedDate} onSelect={setSelectedDate} />

      {/* Today's tasks (from goals) */}
      {totalTodayCount > 0 && (
        <section>
          <SectionHeader title="Today's tasks" count={`${doneTodayCount}/${totalTodayCount}`} />
          <div className="flex flex-col gap-2 mt-2">
            {goals.filter((g) => g.today.length > 0).map((g) => (
              <div key={g.id} className="rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
                <button onClick={() => setOpenGoal(g)} className="flex items-center gap-2 w-full text-left">
                  <span className="text-lg">{g.emoji}</span>
                  <span className="text-[13px] font-semibold flex-1 truncate" style={{ color: C.charcoal }}>{g.title}</span>
                  {g.streak > 0 && <span className="text-[10px] font-bold" style={{ color: C.gold }}>🔥 {g.streak}</span>}
                </button>
                <div className="mt-2 flex flex-col gap-1">
                  {g.today.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 px-1 py-1">
                      <button onClick={() => toggleGoalTask(g.id, idx)} aria-label="Toggle task"
                              className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                              style={{ border: `2px solid ${task.done ? C.sage : C.muted}`, background: task.done ? C.sage : "transparent" }}>
                        {task.done && <span className="text-white text-[10px] leading-none">✓</span>}
                      </button>
                      <span className="text-[13px] flex-1" style={{
                        color: task.done ? C.muted : C.charcoal,
                        textDecoration: task.done ? "line-through" : "none",
                      }}>{task.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* This Week */}
      <CollapsibleSection title="This Week" open={openWeek} onToggle={() => setOpenWeek(!openWeek)}>
        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          {weekGoals.map((g) => {
            const total = g.allTasks.length || g.today.length || 1;
            const done = g.allTasks.filter((t) => t.done).length || g.today.filter((t) => t.done).length;
            const pct = Math.round((done / total) * 100);
            return (
              <button key={g.id} onClick={() => setOpenGoal(g)}
                      className="text-left rounded-2xl p-3"
                      style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-[13px] font-semibold flex-1 truncate" style={{ color: C.charcoal }}>{g.title}</span>
                </div>
                <ProgressBar pct={pct} />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-bold" style={{ color: pct >= 75 ? C.sage : C.muted }}>{pct}%</span>
                  {g.partner && <Avatar p={g.partner} />}
                </div>
              </button>
            );
          })}
          {weekGoals.length === 0 && <EmptyHint text="No weekly goals yet" onCreate={onCreate} />}
        </div>
      </CollapsibleSection>

      {/* This Month */}
      <CollapsibleSection title="This Month" open={openMonth} onToggle={() => setOpenMonth(!openMonth)}>
        <div className="flex flex-col gap-2 mt-2">
          {monthGoals.map((g) => {
            const total = g.allTasks.length || 1;
            const done = g.allTasks.filter((t) => t.done).length;
            const pct = Math.round((done / total) * 100);
            return (
              <button key={g.id} onClick={() => setOpenGoal(g)}
                      className="text-left rounded-2xl p-3.5"
                      style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-[13px] font-semibold flex-1 truncate" style={{ color: C.charcoal }}>{g.title}</span>
                  <span className="text-[10px] font-bold" style={{ color: C.muted }}>
                    {daysUntil(g.deadline)}d
                  </span>
                </div>
                <ProgressBar pct={pct} />
                <div className="text-[10px] mt-1.5" style={{ color: C.muted }}>{done}/{total} tasks · {pct}%</div>
              </button>
            );
          })}
          {monthGoals.length === 0 && <EmptyHint text="No monthly goals yet" onCreate={onCreate} />}
        </div>
      </CollapsibleSection>

      {/* Long term */}
      <CollapsibleSection title="Long Term" open={openLong} onToggle={() => setOpenLong(!openLong)}>
        <div className="flex flex-col gap-2 mt-2">
          {longGoals.map((g) => {
            const total = g.allTasks.length || 1;
            const done = g.allTasks.filter((t) => t.done).length;
            const pct = Math.round((done / total) * 100);
            const linkedCount = goals.filter((x) => x.linkedTo === g.id).length;
            return (
              <button key={g.id} onClick={() => setOpenGoal(g)}
                      className="text-left rounded-3xl p-4 text-white relative overflow-hidden"
                      style={{ background: "linear-gradient(165deg, #6B4A8A 0%, #9B7AC4 100%)" }}>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="relative flex items-start gap-3">
                  <span className="text-3xl">{g.emoji}</span>
                  <div className="flex-1">
                    <div className="text-[14px] font-bold">{g.title}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">By {fmtDeadline(g.deadline)} · {linkedCount} linked goal{linkedCount === 1 ? "" : "s"}</div>
                    <div className="mt-3 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
                      <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] font-bold mt-1">{pct}% complete</div>
                  </div>
                </div>
              </button>
            );
          })}
          {longGoals.length === 0 && <EmptyHint text="No long-term goals yet" onCreate={onCreate} dark />}
        </div>
      </CollapsibleSection>

      {/* Overlays */}
      <Overlay open={!!openGoal} onClose={() => setOpenGoal(null)} title={openGoal?.title} side>
        {openGoal && (
          <GoalDetail
            goal={openGoal}
            allGoals={goals}
            onUpdate={(updated) => {
              setGoals((cur) => cur.map((g) => g.id === updated.id ? updated : g));
              setOpenGoal(updated);
            }}
            onDelete={(id) => { setGoals((cur) => cur.filter((g) => g.id !== id)); setOpenGoal(null); }}
          />
        )}
      </Overlay>

      <Overlay open={celebrating} onClose={() => setCelebrating(false)}>
        <Celebration
          streak={totalStreak + 1}
          pct={overallPct}
          pacts={pacts}
          onShare={(pactId) => {
            shareToPact(pactId, `Crushed all today's tasks · ${totalStreak + 1} day streak 🔥`);
            setCelebrating(false);
          }}
          onClose={() => setCelebrating(false)}
        />
      </Overlay>

      <Overlay open={summary} onClose={() => setSummary(false)} title="This week" side>
        <WeeklySummary goals={goals} pct={overallPct} streak={totalStreak} userName={userName} />
      </Overlay>

      <Overlay open={invite} onClose={() => setInvite(false)} title="Invite friends">
        <InviteFriends userName={userName} />
      </Overlay>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl px-3 py-2" style={{ background: "rgba(255,255,255,0.16)" }}>
      <div className="text-[9px] font-bold tracking-wide opacity-65">{label.toUpperCase()}</div>
      <div className="text-[18px] font-bold" style={{ color: accent ? "#F4DC8A" : "#fff" }}>{value}</div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-[15px] font-bold" style={{ color: C.sageDark }}>{title}</h2>
      {count && <span className="text-[11px] font-bold" style={{ color: C.muted }}>{count}</span>}
    </div>
  );
}

function CollapsibleSection({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <section>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-1.5">
        <h2 className="text-[15px] font-bold" style={{ color: C.sageDark }}>{title}</h2>
        <span className="text-base" style={{ color: C.muted, transform: `rotate(${open ? 90 : 0}deg)`, transition: "transform 0.2s" }}>›</span>
      </button>
      {open && <div className="anim-up">{children}</div>}
    </section>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="mt-2 h-1.5 rounded-full" style={{ background: C.faint }}>
      <div className="h-full rounded-full" style={{
        width: `${pct}%`,
        background: pct >= 75 ? `linear-gradient(90deg, ${C.sage}, ${C.gold})` : C.sage,
        transition: "width 0.3s",
      }} />
    </div>
  );
}

function Avatar({ p }: { p: NonNullable<Goal["partner"]> }) {
  return (
    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
          style={{ background: p.col }}>{p.ini}</span>
  );
}

function EmptyHint({ text, onCreate, dark }: { text: string; onCreate: () => void; dark?: boolean }) {
  return (
    <button onClick={onCreate} className="w-full rounded-2xl py-6 text-center text-xs"
            style={{
              border: `1.5px dashed ${dark ? "#9B7AC4" : C.faint}`,
              color: dark ? "#6B4A8A" : C.muted,
              background: dark ? "#F5EEFB" : "transparent",
            }}>
      {text} · tap + to create
    </button>
  );
}

function CalendarStrip({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const [cursor, setCursor] = useState(() => new Date(selected));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="w-7 h-7 text-base" style={{ color: C.muted }}>‹</button>
        <h2 className="text-[14px] font-bold" style={{ color: C.sageDark }}>
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h2>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="w-7 h-7 text-base" style={{ color: C.muted }}>›</button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(year, month, i + 1);
          const iso = d.toISOString().slice(0, 10);
          const isSelected = iso === selected;
          const isToday = iso === today;
          return (
            <button key={iso} onClick={() => onSelect(iso)}
                    className="shrink-0 flex flex-col items-center justify-center w-11 h-14 rounded-2xl text-[10px] font-bold"
                    style={{
                      background: isSelected ? `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` : "#fff",
                      color: isSelected ? "#fff" : isToday ? C.sageDark : C.charcoal,
                      border: `1px solid ${isSelected ? "transparent" : isToday ? C.sage : C.faint}`,
                      boxShadow: isSelected ? "0 4px 12px rgba(74,107,78,0.25)" : "none",
                    }}>
              <span className="opacity-60 text-[9px]">{d.toLocaleString(undefined, { weekday: "short" }).slice(0, 1)}</span>
              <span className="text-[15px]">{i + 1}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function daysUntil(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 86400000;
  return Math.max(0, Math.round(diff));
}
function fmtDeadline(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Re-export for tree-shake friendliness
export { TYPE_STYLE };
