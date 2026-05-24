"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { C } from "@/lib/colors";
import type { Pact, Message } from "@/types";

interface Props {
  pacts: Pact[]; setPacts: React.Dispatch<React.SetStateAction<Pact[]>>;
  messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function PactsTab({ pacts, setPacts, messages, setMessages }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const sorted = useMemo(() => [...pacts].sort((a, b) => Number(b.pinned) - Number(a.pinned)), [pacts]);
  const openPact = openId ? pacts.find((p) => p.id === openId) : null;

  const togglePin = (id: string) =>
    setPacts((cur) => cur.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));

  const markRead = (id: string) =>
    setPacts((cur) => cur.map((p) => (p.id === id ? { ...p, unread: 0 } : p)));

  if (openPact) {
    return (
      <PactChat
        pact={openPact}
        messages={messages.filter((m) => m.pactId === openPact.id)}
        onBack={() => { markRead(openPact.id); setOpenId(null); }}
        onSend={(text) =>
          setMessages((cur) => [
            ...cur,
            {
              id: Date.now(),
              pactId: openPact.id,
              user: "me",
              text,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              type: "msg",
              read: false,
            },
          ])
        }
        onSystem={(text, type) =>
          setMessages((cur) => [
            ...cur,
            {
              id: Date.now(),
              pactId: openPact.id,
              user: "system",
              text,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              type,
            },
          ])
        }
      />
    );
  }

  return (
    <div className="px-4 sm:px-5 pt-4 lg:pt-6 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-[24px] font-bold" style={{ color: C.sageDark }}>Pacts</h1>
        <button className="w-9 h-9 rounded-full text-base text-white"
                style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>+</button>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map((p) => (
          <PactCard key={p.id} pact={p} onOpen={() => setOpenId(p.id)} onPin={() => togglePin(p.id)} />
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: C.muted }}>
            No pacts yet. Tap + to create one.
          </div>
        )}
      </div>
    </div>
  );
}

function PactCard({ pact, onOpen, onPin }: { pact: Pact; onOpen: () => void; onPin: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPress = () => {
    timer.current = setTimeout(() => { onPin(); navigator.vibrate?.(20); }, 550);
  };
  const endPress = () => { if (timer.current) clearTimeout(timer.current); };

  return (
    <button
      onClick={onOpen}
      onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
      onTouchStart={startPress} onTouchEnd={endPress}
      className="text-left rounded-3xl p-4 relative"
      style={
        pact.pinned
          ? { background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})`, color: "#fff" }
          : { background: "#fff", border: `1px solid ${C.faint}` }
      }
    >
      {pact.pinned && <span className="absolute top-2 right-3 text-[14px]">📌</span>}
      <div className="flex items-start gap-3">
        <span className="text-3xl">{pact.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[15px] font-bold truncate">{pact.name}</span>
            <span className="text-[10px] font-bold shrink-0" style={{ opacity: pact.pinned ? 0.7 : 1, color: pact.pinned ? "#fff" : C.muted }}>{pact.time}</span>
          </div>
          <div className="text-[12px] mt-0.5 truncate" style={{ opacity: pact.pinned ? 0.78 : 1, color: pact.pinned ? "#fff" : C.muted }}>{pact.last}</div>
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex -space-x-1.5">
              {pact.members.slice(0, 4).map((m, i) => (
                <span key={i} className="w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                      style={{ background: m.col, border: `2px solid ${pact.pinned ? C.sageDark : "#fff"}` }}>{m.ini}</span>
              ))}
            </div>
            {pact.unread > 0 && (
              <span className="px-2 h-5 min-w-[20px] rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      background: pact.pinned ? "#fff" : C.gold,
                      color: pact.pinned ? C.sageDark : "#fff",
                    }}>{pact.unread}</span>
            )}
          </div>
          {pact.sharedGoals.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${pact.pinned ? "rgba(255,255,255,0.15)" : C.faint}` }}>
              <div className="text-[9px] font-bold tracking-wide mb-2"
                   style={{ color: pact.pinned ? "#fff" : C.muted, opacity: pact.pinned ? 0.65 : 1 }}>GROUP GOALS</div>
              <div className="flex flex-col gap-1.5">
                {pact.sharedGoals.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[13px]">{g.emoji}</span>
                    <span className="text-[11px] flex-1 truncate" style={{ color: pact.pinned ? "#fff" : C.charcoal }}>{g.title}</span>
                    <div className="w-16 h-1.5 rounded-full" style={{ background: pact.pinned ? "rgba(255,255,255,0.18)" : C.faint }}>
                      <div className="h-full rounded-full" style={{ width: `${g.progress}%`, background: pact.pinned ? "#fff" : C.sage }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function PactChat({ pact, messages, onBack, onSend, onSystem }: {
  pact: Pact;
  messages: Message[];
  onBack: () => void;
  onSend: (t: string) => void;
  onSystem: (text: string, type: Message["type"]) => void;
}) {
  const [text, setText] = useState("");
  const [checkin, setCheckin] = useState(false);
  const [actions, setActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 88px)", background: C.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
           style={{ background: "#fff", borderBottom: `1px solid ${C.faint}` }}>
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ background: C.bg, color: C.sageDark }}>‹</button>
        <span className="text-2xl">{pact.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold truncate" style={{ color: C.charcoal }}>{pact.name}</div>
          <div className="text-[10px]" style={{ color: C.muted }}>{pact.members.length + 1} members</div>
        </div>
        <button onClick={() => setActions(true)} aria-label="Actions"
                className="w-9 h-9 rounded-full flex items-center justify-center text-base text-white"
                style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>⚡</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((m) => <Bubble key={m.id} m={m} />)}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 p-3 pb-safe flex gap-2"
           style={{ background: "#fff", borderTop: `1px solid ${C.faint}` }}>
        <input value={text} onChange={(e) => setText(e.target.value)}
               onKeyDown={(e) => { if (e.key === "Enter") send(); }}
               placeholder="Message..."
               className="flex-1 h-11 px-4 rounded-full text-sm outline-none"
               style={{ background: C.bg, border: `1px solid ${C.faint}` }} />
        <button onClick={send}
                className="w-11 h-11 rounded-full text-white text-base"
                style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>→</button>
      </div>

      {/* Action sheet */}
      {actions && (
        <Sheet onClose={() => setActions(false)} title="Quick actions">
          <ActionBtn icon="📅" label="Schedule meeting"
            onClick={() => { onSystem("Meeting scheduled for tomorrow 7am", "meeting"); setActions(false); }} />
          <ActionBtn icon="🎯" label="Create shared goal"
            onClick={() => { onSystem("New shared goal created", "goal_created"); setActions(false); }} />
          <ActionBtn icon="✋" label="Trigger check-in"
            onClick={() => { setActions(false); setCheckin(true); }} />
        </Sheet>
      )}

      {/* Check-in prompt */}
      {checkin && (
        <Sheet onClose={() => setCheckin(false)} title="Today's check-in">
          <div className="text-[13px] mb-3 text-center" style={{ color: C.muted }}>
            How&apos;s your goal going?
          </div>
          {[
            { t: "Doing amazing! 🔥", c: C.sage },
            { t: "On track ✅", c: C.sageDark },
            { t: "Missed today 😔", c: C.warm },
            { t: "Might miss my goal 😬", c: C.urgent },
          ].map((opt) => (
            <button key={opt.t}
                    onClick={() => { onSystem(`You: ${opt.t}`, "checkin"); setCheckin(false); }}
                    className="w-full h-12 rounded-2xl text-[13px] font-bold mb-2"
                    style={{ background: opt.c + "18", color: opt.c, border: `1px solid ${opt.c}40` }}>
              {opt.t}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  if (m.type === "date")   return <DateSep text={m.text} />;
  if (m.type === "system") return <SystemNote text={m.text} />;
  if (m.type === "checkin" || m.type === "meeting" || m.type === "goal_created") {
    return <SystemNote text={m.text} accent />;
  }
  const me = m.user === "me";
  return (
    <div className={`flex gap-2 ${me ? "justify-end" : "justify-start"}`}>
      {!me && (
        <span className="w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0 mt-auto"
              style={{ background: m.col || C.muted }}>{m.ini || m.name?.[0] || "?"}</span>
      )}
      <div className="max-w-[78%] flex flex-col gap-0.5" style={{ alignItems: me ? "flex-end" : "flex-start" }}>
        {!me && m.name && <span className="text-[10px] font-bold px-1" style={{ color: C.muted }}>{m.name}</span>}
        <div className="px-3.5 py-2 text-[13px]"
             style={{
               background: me ? `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` : "#fff",
               color: me ? "#fff" : C.charcoal,
               borderRadius: me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
               border: me ? "none" : `1px solid ${C.faint}`,
             }}>{m.text}</div>
        <div className="text-[9px] px-1" style={{ color: C.muted }}>
          {m.time}{me && <span className="ml-1" style={{ color: m.read ? C.sage : C.muted }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
}

function DateSep({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="flex-1 h-px" style={{ background: C.faint }} />
      <span className="text-[10px] font-bold" style={{ color: C.muted }}>{text}</span>
      <div className="flex-1 h-px" style={{ background: C.faint }} />
    </div>
  );
}

function SystemNote({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <div className="self-center px-3 py-2 rounded-full text-[11px] font-bold"
         style={{
           background: accent ? `linear-gradient(165deg, ${C.gold}22, ${C.warm}22)` : C.light,
           color: accent ? C.sageDark : C.sageDark,
           border: `1px solid ${accent ? C.gold + "55" : C.faint}`,
         }}>{text}</div>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center anim-fade"
         onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
           className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 anim-slide-up">
        <div className="text-[14px] font-bold mb-3" style={{ color: C.sageDark }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-2xl mb-1.5"
            style={{ background: C.bg, border: `1px solid ${C.faint}` }}>
      <span className="text-xl">{icon}</span>
      <span className="text-[13px] font-bold flex-1 text-left" style={{ color: C.charcoal }}>{label}</span>
      <span style={{ color: C.muted }}>›</span>
    </button>
  );
}
