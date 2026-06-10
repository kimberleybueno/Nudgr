"use client";

import { useEffect, useRef, useState } from "react";
import { C } from "@/lib/colors";
import type { Pact, Message } from "@/types";

interface Props {
  pact: Pact;
  messages: Message[];
  userName: string;
  onBack: () => void;
  onSend: (text: string) => void;
  onPostSystem: (text: string) => void;
  onDismissBanner: () => void;
  /** When true, render as a panel inside a desktop layout instead of a full-screen takeover. */
  embedded?: boolean;
}

export default function PactChat({ pact, messages, userName, onBack, onSend, onPostSystem, onDismissBanner, embedded = false }: Props) {
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText("");
  };

  const sendGroupNudge = () => {
    onPostSystem(`${userName || "You"} nudged the group 👋`);
  };

  return (
    <div
      className={embedded ? "anim-up flex flex-col rounded-3xl overflow-hidden" : "anim-up flex flex-col"}
      style={{
        minHeight: embedded ? 0 : "100vh",
        height: embedded ? "calc(100vh - 32px)" : "auto",
        background: C.bg,
        border: embedded ? `1px solid ${C.faint}` : "none",
      }}
    >
      {/* Header */}
      <div
        className="px-4 flex items-center gap-3"
        style={{
          background: "#fff",
          borderBottom: `1px solid ${C.faint}`,
          paddingTop: embedded ? 16 : 48,
          paddingBottom: 14,
        }}
      >
        {!embedded && (
          <button onClick={onBack} className="text-[18px] w-7 h-7 flex items-center justify-center"
                  style={{ color: C.sage }} aria-label="Back">‹</button>
        )}
        <span className="text-[20px]">{pact.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold truncate" style={{ color: C.charcoal }}>{pact.name}</div>
          <div className="text-[10px]" style={{ color: C.muted }}>{pact.members.length + 1} members</div>
        </div>
        <div className="flex shrink-0">
          {pact.members.slice(0, 3).map((m, i) => (
            <span
              key={i}
              className="rounded-full text-[8px] font-extrabold flex items-center justify-center text-white"
              style={{
                width: 22, height: 22, background: m.col,
                border: "2px solid #fff", marginLeft: i ? -6 : 0,
              }}
            >{m.ini}</span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scroller}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ background: `linear-gradient(180deg, ${C.light}, #dce8dd)` }}
      >
        {messages.map((m) => <Bubble key={m.id} m={m} />)}
        {messages.length === 0 && (
          <div className="text-center py-10 text-[11px]" style={{ color: C.muted }}>
            No messages yet. Say hi.
          </div>
        )}

        {/* Honest 'check-ins coming soon' banner — dismissible per Pact (Screen 6) */}
        {!pact.checkInBannerDismissed && (
          <div
            className="mt-2 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: C.warm + "1a", border: `1px solid ${C.warm}33` }}
          >
            <span className="text-[15px] shrink-0" style={{ color: C.sage }}>🔔</span>
            <span className="text-[11px] leading-snug flex-1" style={{ color: C.charcoal }}>
              Daily check-ins are coming soon. For now, send a message to keep your Pact moving.
            </span>
            <button onClick={onDismissBanner} aria-label="Dismiss"
                    className="text-[14px] w-6 h-6 flex items-center justify-center shrink-0"
                    style={{ color: C.muted }}>×</button>
          </div>
        )}
      </div>

      {/* Composer */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          background: "#fff",
          borderTop: `1px solid ${C.faint}`,
          paddingBottom: embedded ? 12 : 32,
        }}
      >
        <button
          onClick={sendGroupNudge}
          title="Nudge the group"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] shrink-0"
          style={{ background: C.sage + "1f", color: C.sage }}
        >👋</button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Message..."
          className="flex-1 px-3.5 py-2.5 rounded-full text-[14px] outline-none"
          style={{ background: C.bg, border: `1px solid ${C.faint}`, color: C.charcoal }}
        />
        <button
          onClick={send}
          aria-label="Send"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[14px] shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.sageDark}, ${C.sage})` }}
        >↑</button>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  if (m.type === "date") return <DateSep text={m.text} />;
  if (m.type === "system" || m.type === "checkin" || m.type === "meeting" || m.type === "goal_created") {
    return (
      <div className="text-center my-2">
        <span className="text-[10px] font-semibold" style={{ color: C.sage }}>{m.text}</span>
      </div>
    );
  }

  const me = m.user === "me";
  return (
    <div className={`flex gap-1.5 mb-2 ${me ? "justify-end" : "justify-start"}`}>
      {!me && (
        <span
          className="rounded-full text-[10px] font-extrabold flex items-center justify-center text-white shrink-0"
          style={{ width: 28, height: 28, background: m.col || C.muted, marginTop: 14 }}
        >{m.ini || m.name?.[0] || "?"}</span>
      )}
      <div className="max-w-[75%]" style={{ alignSelf: "flex-start" }}>
        {!me && m.name && (
          <div className="text-[10px] font-semibold mb-0.5 px-1" style={{ color: C.muted }}>{m.name}</div>
        )}
        <div
          className="px-3.5 py-2.5 text-[14px] leading-snug"
          style={{
            background: me ? `linear-gradient(135deg, ${C.sageDark}, ${C.sage})` : "#fff",
            color: me ? "#fff" : C.charcoal,
            borderRadius: me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            border: me ? "none" : `1px solid ${C.faint}`,
          }}
        >{m.text}</div>
        {me && (
          <div className="text-[9px] text-right mt-0.5 px-1" style={{ color: m.read ? C.sage : C.muted }}>
            {m.time}{" "}{m.read ? "✓✓" : "✓"}
          </div>
        )}
      </div>
    </div>
  );
}

function DateSep({ text }: { text: string }) {
  return (
    <div className="text-center my-2">
      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md"
            style={{ background: "#fff", color: C.muted }}>{text}</span>
    </div>
  );
}
