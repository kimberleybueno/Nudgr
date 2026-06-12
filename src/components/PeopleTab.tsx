"use client";

import { useMemo, useState } from "react";
import { C } from "@/lib/colors";
import type { Pact, Message, Goal, Partner, UserData } from "@/types";
import PactChat from "./PactChat";
import PartnerDetail from "./PartnerDetail";
import AddToCircleModal from "./AddToCircleModal";
import CreatePactModal from "./CreatePactModal";
import InviteFallback, { sendInvite } from "./InviteFlow";

interface Props {
  pacts: Pact[];
  setPacts: React.Dispatch<React.SetStateAction<Pact[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  goals: Goal[];
  goalPartners: Partner[];
  userName: string;
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  isDesktop?: boolean;
  /**
   * When set, render only that section's header and list. Used by the
   * new sec 16 chrome where Pacts and Crew are separate tabs. Omit to
   * render both stacked (legacy merged People view).
   */
  section?: "pacts" | "crew";
}

interface CirclePerson {
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

const NUDGE_VARIANTS = [
  "Hey, just checking in.",
  "How's it going?",
  "Don't forget your goal today.",
  "Cheering you on.",
  "Got you on my mind.",
];

const NUDGE_WINDOW_MS = 60 * 60 * 1000; // 60 minutes

export default function PeopleTab({
  pacts, setPacts, messages, setMessages, goals, goalPartners, userName,
  user, setUser, isDesktop = false, section,
}: Props) {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // section is consumed inline below in the listColumn block.
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<string | null>(null);
  const [showAddCircle, setShowAddCircle] = useState(false);
  const [showCreatePact, setShowCreatePact] = useState(false);
  const [inviteFallback, setInviteFallback] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2000);
  };

  const sortedPacts = useMemo(
    () => [...pacts].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [pacts]
  );

  // Circle is now user.partners directly (added via AddToCircleModal),
  // plus anyone surfaced from goal-partner attribution that isn't already in user.partners.
  const circle = useMemo<CirclePerson[]>(() => {
    const out: CirclePerson[] = user.partners.map((p, i) => {
      const sharedGoals = goals.filter((g) => g.tasks.some((t) => t.partnerId === p.id)).map((g) => g.name);
      return {
        id: p.id,
        name: p.name,
        initial: p.initial,
        color: p.color,
        status: ["Active now", "2h ago", "Yesterday"][i % 3],
        online: i % 3 === 0,
        streak: Math.max(0, 9 - i * 2),
        goals: [],
        sharedGoals,
      };
    });
    // Also surface goal-partners not yet in user.partners
    goalPartners.forEach((p) => {
      if (out.some((x) => x.id === p.id)) return;
      const sharedGoals = goals.filter((g) => g.tasks.some((t) => t.partnerId === p.id)).map((g) => g.name);
      out.push({
        id: p.id, name: p.name, initial: p.initial, color: p.color,
        status: "Active now", online: true, streak: 5, goals: [], sharedGoals,
      });
    });
    return out;
  }, [user.partners, goalPartners, goals]);

  /* ---------- Pact actions ---------- */

  const togglePin = (pactId: string) =>
    setPacts((cur) => cur.map((p) => (p.id === pactId ? { ...p, pinned: !p.pinned } : p)));

  const markRead = (pactId: string) =>
    setPacts((cur) => cur.map((p) => (p.id === pactId ? { ...p, unread: 0 } : p)));

  const sendMessage = (pactId: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((cur) => [...cur, {
      id: Date.now(), pactId, user: "me", text, time, type: "msg", read: false,
    }]);
    setPacts((cur) => cur.map((p) => (p.id === pactId ? { ...p, last: `You: ${text}`, time } : p)));
  };

  const postSystem = (pactId: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((cur) => [...cur, {
      id: Date.now(), pactId, user: "system", text, time, type: "system",
    }]);
  };

  const dismissCheckinBanner = (pactId: string) => {
    setPacts((cur) => cur.map((p) => (p.id === pactId ? { ...p, checkInBannerDismissed: true } : p)));
  };

  /* ---------- Nudge with rate limit ---------- */

  const canNudge = (personId: string) => {
    const lastIso = user.lastNudgedAt?.[personId];
    if (!lastIso) return true;
    return Date.now() - new Date(lastIso).getTime() > NUDGE_WINDOW_MS;
  };

  const sendNudge = (personId: string, personName: string) => {
    if (!canNudge(personId)) {
      showToast("Nudged recently");
      return;
    }
    const variant = NUDGE_VARIANTS[Math.floor(Math.random() * NUDGE_VARIANTS.length)];
    // Look for a shared Pact to post the nudge into; otherwise it's a no-op visually
    const pact = pacts.find((p) => p.members.some((m) => m.name === personName));
    if (pact) {
      postSystem(pact.id, `You nudged ${personName} — "${variant}"`);
    }
    setUser((u) => ({ ...u, lastNudgedAt: { ...u.lastNudgedAt, [personId]: new Date().toISOString() } }));
    showToast("Nudge sent");
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(10);
  };

  /* ---------- Add to Circle ---------- */

  const addToCircle = (partner: Partner) => {
    setUser((u) => ({ ...u, partners: [...u.partners, partner] }));
    setShowAddCircle(false);
    showToast("Added to Circle");
  };

  /* ---------- Create Pact ---------- */

  const createPact = (pact: Pact) => {
    setPacts((cur) => [pact, ...cur]);
    setMessages((cur) => [...cur, {
      id: Date.now(),
      pactId: pact.id,
      user: "system",
      text: `${user.name || "You"} created this Pact`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "system",
    }]);
    setShowCreatePact(false);
    setActiveChat(pact.id);
  };

  /* ---------- Invite ---------- */

  const triggerInvite = async () => {
    const res = await sendInvite(user.name || "friend");
    if (!res.shared && res.reason === "not-supported") {
      setInviteFallback(true);
    }
  };

  /* ---------- Mobile: full-screen takeover ---------- */
  if (!isDesktop) {
    if (activeChat) {
      const pact = pacts.find((p) => p.id === activeChat);
      if (!pact) { setActiveChat(null); return null; }
      return (
        <PactChat
          pact={pact}
          messages={messages.filter((m) => m.pactId === activeChat)}
          userName={userName}
          onBack={() => { markRead(activeChat); setActiveChat(null); }}
          onSend={(text) => sendMessage(activeChat, text)}
          onPostSystem={(text) => postSystem(activeChat, text)}
          onDismissBanner={() => dismissCheckinBanner(activeChat)}
        />
      );
    }
    if (activePartner) {
      const person = circle.find((c) => c.id === activePartner);
      if (!person) { setActivePartner(null); return null; }
      return (
        <PartnerDetail
          person={person}
          onBack={() => setActivePartner(null)}
          onNudge={() => sendNudge(person.id, person.name)}
          canNudge={canNudge(person.id)}
          onMessage={() => {
            const pact = pacts.find((p) => p.members.some((m) => m.name === person.name));
            if (pact) { setActivePartner(null); setActiveChat(pact.id); }
          }}
        />
      );
    }
  }

  /* ---------- Shared list column (Pacts + Circle) ---------- */
  const sectionTitle =
    section === "pacts" ? "Pacts" :
    section === "crew"  ? "Crew"  :
    "People";

  const listColumn = (
    <>
      <div className="px-6 pt-12 lg:pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em]" style={{ color: C.muted }}>ACCOUNTABILITY</p>
            <h1 className="text-[24px] font-light mt-1" style={{ color: C.charcoal }}>{sectionTitle}</h1>
          </div>
          <button onClick={triggerInvite}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold text-white"
                  style={{ background: C.sage }}>+ Invite</button>
        </div>
      </div>

      {/* Pacts */}
      {(!section || section === "pacts") && (
      <section className="px-5 pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[12px] font-bold tracking-wide" style={{ color: C.sage }}>Pacts</div>
          {sortedPacts.length > 0 && (
            <button onClick={() => setShowCreatePact(true)}
                    className="px-2.5 h-7 rounded-md text-[10px] font-bold"
                    style={{ background: C.sage + "1a", color: C.sage, border: `1px solid ${C.sage}40` }}>
              + New Pact
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {sortedPacts.map((pact) => (
            <PactRow key={pact.id} pact={pact}
                     active={isDesktop && activeChat === pact.id}
                     onTap={() => { setActivePartner(null); setActiveChat(pact.id); markRead(pact.id); }}
                     onLongPress={() => togglePin(pact.id)} />
          ))}
          {sortedPacts.length === 0 && (
            <EmptyState
              heading="No Pacts yet"
              body="Pacts are group goals. Create one and invite your accountability crew."
              cta="+ Create a Pact"
              onCta={() => setShowCreatePact(true)}
            />
          )}
        </div>
      </section>
      )}

      {!section && (
        <div className="px-5 my-3">
          <div className="h-px" style={{ background: C.faint }} />
        </div>
      )}

      {/* Circle */}
      {(!section || section === "crew") && (
      <section className="px-5 pb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[12px] font-bold tracking-wide" style={{ color: C.warm }}>Circle</div>
          {circle.length > 0 && (
            <button onClick={() => setShowAddCircle(true)}
                    className="px-2.5 h-7 rounded-md text-[10px] font-bold"
                    style={{ background: C.warm + "1a", color: C.warm, border: `1px solid ${C.warm}40` }}>
              + Add
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {circle.map((p) => (
            <CircleRow key={p.id} person={p}
                       active={isDesktop && activePartner === p.id}
                       onTap={() => { setActiveChat(null); setActivePartner(p.id); }}
                       onNudge={() => sendNudge(p.id, p.name)}
                       canNudge={canNudge(p.id)} />
          ))}
          {circle.length === 0 && (
            <>
              <EmptyState
                heading="Your Circle is empty"
                body="Add people you trust to keep you accountable."
                cta="+ Add to Circle"
                onCta={() => setShowAddCircle(true)}
              />
              <button onClick={triggerInvite}
                      className="text-[11px] font-bold mt-2 mx-auto block"
                      style={{ color: C.muted }}>
                Or invite a friend to Nudgr
              </button>
            </>
          )}
        </div>
      </section>
      )}
    </>
  );

  /* ---------- Desktop master-detail ---------- */
  const detailColumn = (() => {
    const activePact = activeChat ? pacts.find((p) => p.id === activeChat) ?? null : null;
    const activePerson = activePartner ? circle.find((c) => c.id === activePartner) ?? null : null;
    if (activePact) return (
      <PactChat
        embedded
        pact={activePact}
        messages={messages.filter((m) => m.pactId === activePact.id)}
        userName={userName}
        onBack={() => setActiveChat(null)}
        onSend={(text) => sendMessage(activePact.id, text)}
        onPostSystem={(text) => postSystem(activePact.id, text)}
        onDismissBanner={() => dismissCheckinBanner(activePact.id)}
      />
    );
    if (activePerson) return (
      <PartnerDetail
        embedded
        person={activePerson}
        onBack={() => setActivePartner(null)}
        onNudge={() => sendNudge(activePerson.id, activePerson.name)}
        canNudge={canNudge(activePerson.id)}
        onMessage={() => {
          const pact = pacts.find((p) => p.members.some((m) => m.name === activePerson.name));
          if (pact) { setActivePartner(null); setActiveChat(pact.id); }
        }}
      />
    );
    return <EmptyDetail />;
  })();

  return (
    <>
      {isDesktop ? (
        <div className="anim-up flex gap-6 items-start px-4 py-4">
          <div className="shrink-0 rounded-3xl overflow-hidden"
               style={{ width: 380, background: "#fff", border: `1px solid ${C.faint}` }}>
            {listColumn}
          </div>
          <div className="flex-1 min-w-0 sticky top-4">{detailColumn}</div>
        </div>
      ) : (
        <div className="anim-up pb-2">{listColumn}</div>
      )}

      {showAddCircle && (
        <AddToCircleModal onCancel={() => setShowAddCircle(false)} onCreate={addToCircle} />
      )}
      {showCreatePact && (
        <CreatePactModal
          circle={user.partners}
          onCancel={() => setShowCreatePact(false)}
          onCreate={createPact}
          onInviteSomeoneNew={() => { setShowCreatePact(false); triggerInvite(); }}
        />
      )}
      <InviteFallback userName={user.name || "friend"}
                      fallbackOpen={inviteFallback}
                      onCloseFallback={() => setInviteFallback(false)} />
      {toast && (
        <div className="fixed left-1/2 bottom-24 z-[110] px-4 py-2 rounded-full text-[12px] font-bold text-white anim-fade"
             style={{ background: C.sageDark, transform: "translateX(-50%)" }}>{toast}</div>
      )}
    </>
  );
}

/* ---------- Empty state ---------- */

function EmptyState({ heading, body, cta, onCta }: {
  heading: string; body: string; cta: string; onCta: () => void;
}) {
  return (
    <div className="rounded-2xl px-5 py-7 text-center"
         style={{ background: C.bg, border: `1px dashed ${C.faint}` }}>
      <div className="text-[13px] font-bold mb-1.5" style={{ color: C.sageDark }}>{heading}</div>
      <div className="text-[11px] mb-3 max-w-[260px] mx-auto leading-relaxed" style={{ color: C.muted }}>{body}</div>
      <button onClick={onCta}
              className="px-4 h-9 rounded-xl text-[12px] font-bold text-white"
              style={{ background: C.sage }}>{cta}</button>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="rounded-3xl flex flex-col items-center justify-center text-center py-24 px-6"
         style={{ background: "#fff", border: `1px dashed ${C.faint}`, minHeight: 500 }}>
      <div className="text-5xl mb-3 opacity-50">👈</div>
      <div className="text-[15px] font-bold mb-2" style={{ color: C.sageDark }}>Pick a Pact or partner</div>
      <div className="text-[12px] max-w-[260px]" style={{ color: C.muted }}>
        Open a Pact to chat, or open a partner to nudge them and see your shared goals.
      </div>
    </div>
  );
}

/* ---------- Row components (unchanged from previous version) ---------- */

function PactRow({ pact, active, onTap, onLongPress }: { pact: Pact; active?: boolean; onTap: () => void; onLongPress: () => void }) {
  const timer = useTimedHold(onLongPress);
  return (
    <button onClick={onTap} onPointerDown={timer.start} onPointerUp={timer.end} onPointerLeave={timer.end}
            className="relative text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl"
            style={{
              background: active
                ? `linear-gradient(135deg, ${C.sage}1a, ${C.light})`
                : pact.pinned ? `linear-gradient(135deg, ${C.light}, #f0f6f0)` : "#fff",
              border: `1px solid ${active ? C.sage : pact.unread > 0 ? C.sage + "55" : C.faint}`,
            }}>
      {pact.pinned && <span className="absolute top-2 right-2.5 text-[10px]">📌</span>}
      <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[20px] shrink-0"
           style={{ background: `linear-gradient(135deg, ${C.sage}33, ${C.light})` }}>{pact.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-bold truncate" style={{ color: C.charcoal }}>{pact.name}</span>
          {pact.unread > 0 && (
            <span className="text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded-md"
                  style={{ background: C.sage }}>{pact.unread}</span>
          )}
        </div>
        <div className="text-[11px] truncate mt-0.5" style={{ color: C.muted }}>{pact.last}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px]" style={{ color: C.muted }}>{pact.time}</div>
        <div className="flex mt-1">
          {pact.members.slice(0, 3).map((m, i) => (
            <span key={i} className="rounded-full text-[7px] font-extrabold flex items-center justify-center text-white"
                  style={{
                    width: 18, height: 18, background: m.col,
                    border: `1.5px solid ${pact.pinned ? "#f0f6f0" : "#fff"}`,
                    marginLeft: i ? -5 : 0,
                  }}>{m.ini}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function CircleRow({ person, active, onTap, onNudge, canNudge }: {
  person: CirclePerson; active?: boolean; onTap: () => void; onNudge: () => void; canNudge: boolean;
}) {
  return (
    <button onClick={onTap}
            className="text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl"
            style={{
              background: active ? `linear-gradient(135deg, ${C.warm}15, ${C.light})` : "#fff",
              border: `1px solid ${active ? C.warm : C.faint}`,
            }}>
      <div className="relative shrink-0">
        <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white text-[16px] font-bold"
             style={{ background: person.color }}>{person.initial}</div>
        {person.online && (
          <div className="absolute bottom-0 right-0 rounded-full"
               style={{ width: 10, height: 10, background: "#4CAF50", border: "2px solid #fff" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold" style={{ color: C.charcoal }}>{person.name}</div>
        <div className="text-[11px] mt-0.5" style={{ color: C.muted }}>{person.status}</div>
        {person.sharedGoals.length > 0 && (
          <div className="text-[10px] mt-0.5 truncate" style={{ color: C.sage }}>
            Holding you accountable on: {person.sharedGoals.join(", ")}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-[13px] font-extrabold" style={{ color: C.gold }}>🔥 {person.streak}</div>
        <span onClick={(e) => { e.stopPropagation(); onNudge(); }}
              className="inline-block mt-1 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
              style={{
                background: canNudge ? C.sage + "1f" : C.bg,
                color: canNudge ? C.sage : C.muted,
              }}>
          {canNudge ? "👋 Nudge" : "Nudged recently"}
        </span>
      </div>
    </button>
  );
}

function useTimedHold(onLongPress: () => void, ms = 500) {
  const start = (_e: React.PointerEvent) => {
    const t = setTimeout(() => {
      onLongPress();
      if (navigator.vibrate) navigator.vibrate(20);
    }, ms);
    (start as unknown as { _t?: ReturnType<typeof setTimeout> })._t = t;
  };
  const end = () => {
    const t = (start as unknown as { _t?: ReturnType<typeof setTimeout> })._t;
    if (t) clearTimeout(t);
  };
  return { start, end };
}
