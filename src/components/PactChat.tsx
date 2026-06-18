"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { N } from "@/lib/colors";
import type { Pact, Message } from "@/types";
import ReceivedNudgeBanner from "./ReceivedNudgeBanner";

interface Props {
  pact: Pact;
  messages: Message[];
  userName: string;
  userInitial: string;
  onBack: () => void;
  onSend: (text: string) => void;
  /** Tan nudge quick-action in the input bar (fires Sec 11 motion + adds a nudge-event row). */
  onCrewNudge: () => void;
  onDismissBanner: () => void;
  /** True for the brief window when a "crew" wiggle is firing (lets header avatars wiggle). */
  crewWiggling?: boolean;
  /** When true, render as a panel inside a desktop layout instead of a full-screen takeover. */
  embedded?: boolean;
}

/**
 * Pact chat (handoff sec 12).
 *
 * Five message types render inline in one timeline:
 *   - text bubbles (sage-deep right for "me", cream-card left for others)
 *   - check-in card (cream-card, sage-tint-14 left accent, italic note)
 *   - progress card (centered, mini sage progress ring)
 *   - nudge event (ReceivedNudgeBanner as inline row, wiggling on mount)
 *   - system/meta (centered ink-faint 12px line)
 *
 * Bubble grouping: 4px gap between same-sender bubbles, 16px between
 * speakers. Avatar gutter and "checked-in" name show on the first
 * bubble of a run; timestamp shows on the last.
 *
 * Input bar pinned bottom with tan nudge quick-action on the left,
 * Message-the-crew field, sage-deep send button (appears when non-empty).
 *
 * Motion: each new bubble fades + translates 8px on enter (anim-bubble-in).
 * prefers-reduced-motion respected via the global CSS rule.
 */
export default function PactChat({
  pact, messages, userName, userInitial,
  onBack, onSend, onCrewNudge, onDismissBanner,
  crewWiggling = false, embedded = false,
}: Props) {
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  /* Compute first/last-of-run flags for bubble messages. */
  type Row =
    | { kind: "msg"; m: Message; isFirstOfRun: boolean; isLastOfRun: boolean; gapTop: number }
    | { kind: "checkin"; m: Message }
    | { kind: "progress"; m: Message }
    | { kind: "nudge"; m: Message }
    | { kind: "system"; m: Message }
    | { kind: "date"; m: Message };

  const rows: Row[] = useMemo(() => {
    const isBubble = (t: Message["type"]) => t === "msg";
    const out: Row[] = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.type === "checkin") { out.push({ kind: "checkin", m }); continue; }
      if (m.type === "progress") { out.push({ kind: "progress", m }); continue; }
      if (m.type === "nudge") { out.push({ kind: "nudge", m }); continue; }
      if (m.type === "date") { out.push({ kind: "date", m }); continue; }
      if (m.type === "system" || m.type === "meeting" || m.type === "goal_created") {
        out.push({ kind: "system", m }); continue;
      }
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const prevSame = !!(prev && isBubble(prev.type) && prev.user === m.user);
      const nextSame = !!(next && isBubble(next.type) && next.user === m.user);
      out.push({
        kind: "msg",
        m,
        isFirstOfRun: !prevSame,
        isLastOfRun: !nextSame,
        gapTop: !prev ? 0 : prevSame ? 4 : 16,
      });
    }
    return out;
  }, [messages]);

  /* Scroll to bottom on new message (use container scrollTo, NOT scrollIntoView). */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText("");
  };

  const memberByName = (name: string) => pact.members.find((m) => m.name === name);

  return (
    <div
      className={embedded ? "anim-up flex flex-col rounded-3xl overflow-hidden" : "anim-up flex flex-col"}
      style={{
        minHeight: embedded ? 0 : "100vh",
        height: embedded ? "calc(100vh - 32px)" : "auto",
        background: N.cream,
        border: embedded ? `1px solid ${N.line}` : "none",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4"
        style={{
          background: N.creamCard,
          borderBottom: `1px solid ${N.line}`,
          paddingTop: embedded ? 16 : 48,
          paddingBottom: 14,
        }}
      >
        {!embedded && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: N.cream, border: `1px solid ${N.line}`, color: N.ink,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-display truncate" style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>
            {pact.name}
          </div>
          <div style={{ fontSize: 11, color: N.inkSoft }}>
            {pact.members.length + 1} members
          </div>
        </div>
        <div className="flex shrink-0">
          {pact.members.slice(0, 4).map((m, i) => (
            <span
              key={i}
              className={`rounded-full flex items-center justify-center text-white ${crewWiggling ? "anim-wiggle" : ""}`}
              style={{
                width: 22, height: 22, background: m.col,
                fontSize: 9, fontWeight: 600,
                border: `2px solid ${N.creamCard}`,
                marginLeft: i ? -6 : 0,
                animationDelay: crewWiggling ? `${i * 0.03}s` : undefined,
              }}
            >
              {m.ini}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scroller}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col"
        style={{ background: N.cream }}
      >
        {rows.length === 0 && (
          <div className="text-center py-10" style={{ fontSize: 12, color: N.inkSoft }}>
            No messages yet. Say hi.
          </div>
        )}

        {rows.map((row, i) => {
          const key = `${row.m.id}-${row.kind}-${i}`;
          if (row.kind === "date") {
            return <DateSep key={key} text={row.m.text} />;
          }
          if (row.kind === "system") {
            return <SystemMeta key={key} text={row.m.text} />;
          }
          if (row.kind === "checkin") {
            return <CheckinCard key={key} m={row.m} member={memberByName(row.m.name ?? row.m.user)} />;
          }
          if (row.kind === "progress") {
            return <ProgressCard key={key} text={row.m.text} pct={row.m.pct ?? 0} />;
          }
          if (row.kind === "nudge") {
            return (
              <NudgeRow
                key={key}
                m={row.m}
                userName={userName}
                userInitial={userInitial}
              />
            );
          }
          // bubble
          return (
            <Bubble
              key={key}
              m={row.m}
              isFirstOfRun={row.isFirstOfRun}
              isLastOfRun={row.isLastOfRun}
              gapTop={row.gapTop}
            />
          );
        })}

        {/* Honest 'check-ins coming soon' banner — dismissible per Pact (Screen 6) */}
        {!pact.checkInBannerDismissed && (
          <div
            className="mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: N.tanTint14, border: `1px solid ${N.tanTint22}` }}
          >
            <span aria-hidden="true" className="shrink-0" style={{ color: N.sageDeep }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3a6 6 0 0 1 6 6c0 4 2 5 2 5H4s2-1 2-5a6 6 0 0 1 6-6zM10 18a2 2 0 0 0 4 0"
                  stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="flex-1" style={{ fontSize: 12, lineHeight: 1.4, color: N.ink }}>
              Daily check-ins are coming soon. For now, send a message to keep your Pact moving.
            </span>
            <button onClick={onDismissBanner} aria-label="Dismiss"
                    className="shrink-0 flex items-center justify-center"
                    style={{ width: 22, height: 22, color: N.inkSoft }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Composer */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: N.creamCard,
          borderTop: `1px solid ${N.line}`,
          paddingBottom: embedded ? 12 : 28,
        }}
      >
        {/* Tan nudge quick-action */}
        <button
          type="button"
          onClick={onCrewNudge}
          aria-label="Nudge the crew"
          className="flex items-center gap-1.5 rounded-full shrink-0"
          style={{
            background: N.tanSoft,
            color: N.sageDarkest,
            padding: "8px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            minHeight: 36,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 9v6M5 12h13l-4-4M18 12l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Nudge
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Message the crew…"
          aria-label="Message the crew"
          className="flex-1 rounded-full outline-none"
          style={{
            background: N.cream,
            border: `1px solid ${text.trim() ? N.lineStrong : N.line}`,
            padding: "10px 16px",
            fontSize: 14,
            color: N.ink,
            minWidth: 0,
          }}
        />

        {text.trim() && (
          <button
            type="button"
            onClick={send}
            aria-label="Send"
            className="rounded-full shrink-0 flex items-center justify-center"
            style={{
              width: 44, height: 44,
              background: N.sageDeep, color: "#fff", border: "none",
              boxShadow: N.shadowSoft,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ============== Bubble (text) ============== */

function Bubble({ m, isFirstOfRun, isLastOfRun, gapTop }: {
  m: Message; isFirstOfRun: boolean; isLastOfRun: boolean; gapTop: number;
}) {
  const me = m.user === "me";
  const radius = me ? "16px 16px 5px 16px" : "16px 16px 16px 5px";
  const avatarBg = m.col || N.sage;
  const showAvatar = !me && isFirstOfRun;
  const showName = !me && isFirstOfRun && !!m.name;
  const showTime = isLastOfRun;

  return (
    <div
      className="anim-bubble-in flex"
      style={{
        marginTop: gapTop,
        justifyContent: me ? "flex-end" : "flex-start",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      {/* Avatar gutter — only on first of an incoming run; otherwise an empty
          spacer so subsequent bubbles align under the first. */}
      {!me && (
        <span
          aria-hidden="true"
          className="shrink-0"
          style={{
            width: 24, height: 24, borderRadius: 999,
            background: showAvatar ? avatarBg : "transparent",
            color: "#fff", fontSize: 10, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {showAvatar ? (m.ini || m.name?.[0] || "?") : ""}
        </span>
      )}

      <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", alignItems: me ? "flex-end" : "flex-start" }}>
        {showName && (
          <div className="px-1" style={{ fontSize: 11, fontWeight: 600, color: N.inkSoft, marginBottom: 2 }}>
            {m.name}
          </div>
        )}
        <div
          style={{
            background: me ? N.sageDeep : N.creamCard,
            color: me ? N.cream : N.ink,
            border: me ? "none" : `1px solid ${N.line}`,
            borderRadius: radius,
            padding: "8px 12px",
            fontSize: 15,
            lineHeight: 1.45,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {m.text}
        </div>
        {showTime && (
          <div className="px-1" style={{ fontSize: 11, color: N.inkFaint, marginTop: 4 }}>
            {m.time}
            {me && (
              <span style={{ marginLeft: 6, color: m.read ? N.sage : N.inkFaint }}>
                {m.read ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== Check-in card ============== */

function CheckinCard({ m, member }: { m: Message; member?: { ini: string; col: string; name: string } }) {
  const color = member?.col ?? m.col ?? N.sage;
  const initial = member?.ini ?? m.ini ?? m.name?.[0] ?? "?";
  const name = member?.name ?? m.name ?? m.user;

  return (
    <div
      className="anim-bubble-in mt-3 flex items-start gap-3 rounded-2xl"
      style={{
        background: N.creamCard,
        border: `1px solid ${N.line}`,
        borderLeft: `3px solid ${N.sage}`,
        padding: "10px 12px",
      }}
    >
      <span
        aria-hidden="true"
        className="shrink-0 flex items-center justify-center rounded-full text-white"
        style={{ width: 28, height: 28, background: color, fontSize: 11, fontWeight: 600 }}
      >
        {initial}
      </span>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 13, fontWeight: 600, color: N.ink }}>
          {name} checked in
        </div>
        {m.note && (
          <div
            className="font-display"
            style={{ fontSize: 13.5, fontStyle: "italic", color: N.inkSoft, lineHeight: 1.4, marginTop: 2 }}
          >
            {m.note}
          </div>
        )}
        {!m.note && m.text && (
          <div
            className="font-display"
            style={{ fontSize: 13.5, fontStyle: "italic", color: N.inkSoft, lineHeight: 1.4, marginTop: 2 }}
          >
            {m.text}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== Progress card ============== */

function ProgressCard({ text, pct }: { text: string; pct: number }) {
  const size = 38, stroke = 3.5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <div
      className="anim-bubble-in mt-3 self-center flex items-center gap-3 rounded-2xl"
      style={{
        background: N.creamCard,
        border: `1px solid ${N.line}`,
        padding: "10px 14px",
        maxWidth: "88%",
      }}
    >
      <span aria-hidden="true" style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(47,74,53,0.10)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={N.sage} strokeWidth={stroke}
                  strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
        </svg>
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: N.sageDeep, lineHeight: 1.3 }}>
        {text}
      </span>
    </div>
  );
}

/* ============== Nudge row (inline ReceivedNudgeBanner) ============== */

function NudgeRow({ m, userName, userInitial }: { m: Message; userName: string; userInitial: string }) {
  // For "you nudged the crew" events, sender = me; for incoming nudges sender comes from m.name/ini/col.
  const me = m.user === "me";
  const senderName = me ? userName || "You" : (m.name ?? m.user);
  const senderInitial = me ? userInitial : (m.ini ?? senderName[0] ?? "?");
  const text = me
    ? `You nudged the crew`
    : (m.text || `${senderName} nudged you`);

  return (
    <div className="mt-3 anim-bubble-in">
      <ReceivedNudgeBanner
        senderName={text.replace(/ nudged.*$/, "")}
        senderInitial={senderInitial}
        message={m.detail}
        pulseKey={m.id}
      />
    </div>
  );
}

/* ============== System meta + date sep ============== */

function SystemMeta({ text }: { text: string }) {
  return (
    <div
      className="text-center my-3"
      style={{ fontSize: 12, color: N.inkFaint }}
    >
      {text}
    </div>
  );
}

function DateSep({ text }: { text: string }) {
  return (
    <div className="text-center my-3">
      <span
        className="rounded-full"
        style={{
          background: N.creamCard,
          border: `1px solid ${N.line}`,
          color: N.inkSoft,
          fontSize: 11,
          fontWeight: 600,
          padding: "4px 10px",
        }}
      >
        {text}
      </span>
    </div>
  );
}
