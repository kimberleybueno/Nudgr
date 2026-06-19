"use client";

import { useEffect, useMemo, useState } from "react";
import { N } from "@/lib/colors";
import type { Pact, Message } from "@/types";
import ReceivedNudgeBanner from "./ReceivedNudgeBanner";
import Sheet from "./Sheet";

interface Props {
  pact: Pact;
  messages: Message[];
  userName: string;
  /** User's overall streak (for the tan line under the ring; demo data for now). */
  userStreak: number;
  /** Combined weekly % for the crew (passed in — derived in PeopleTab or 0 for demo). */
  weeklyPct: number;
  /** True for the brief 850ms window when a "crew" wiggle is firing. */
  crewWiggling?: boolean;
  /** When set to a member id, plays the per-member wiggle on that avatar. */
  wigglingMemberId?: string | null;
  onBack: () => void;
  onOpenChat: () => void;
  onCrewNudge: () => void;
  /** Per-member nudge: receives the pact's member identifier (we use name since members are local). */
  onNudgeMember: (memberName: string) => void;
  /** Per-member rate-limit check (true = can nudge now). */
  canNudgeMember: (memberName: string) => boolean;
  embedded?: boolean;
}

/**
 * Pact detail (handoff sec 10).
 *
 * Header: back + Fraunces title + ink-soft goal subline + overflow stub.
 * Hero: ~120px sage progress ring with the crew's weekly %; tan streak
 * line beneath ("{n} day streak", no emoji).
 * Crew row: each non-you member renders with the per-member Nudge
 * button (Sec 11 wiggle + toast). "You" gets a status chip.
 * Primary: "Nudge the crew" (sage-deep). Secondary: "Open chat".
 * ReceivedNudgeBanner mounts when there is an unacknowledged incoming
 * nudge in the thread (any message with type === "nudge" and
 * user !== "me" not yet dismissed in this session).
 *
 * House rules: no emoji, no em dashes. Reduced-motion already gated
 * globally via the Sec 11 / 12 utility classes.
 */
export default function PactDetail({
  pact, messages, userName, userStreak, weeklyPct,
  crewWiggling = false, wigglingMemberId = null,
  onBack, onOpenChat, onCrewNudge, onNudgeMember, canNudgeMember,
  embedded = false,
}: Props) {
  const [dismissedNudgeIds, setDismissedNudgeIds] = useState<Set<number>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Latest unacknowledged incoming nudge in this thread (sender is not "me").
  const incomingNudge = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.type !== "nudge") continue;
      if (m.user === "me") continue;
      if (dismissedNudgeIds.has(m.id)) continue;
      return m;
    }
    return null;
  }, [messages, dismissedNudgeIds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onBack(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  // Hero ring geometry. Match Goal detail's stroke discipline.
  const ringSize = 120, ringStroke = 8;
  const r = (ringSize - ringStroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, weeklyPct)) / 100) * circ;

  const sharedGoalLine = pact.sharedGoals.length === 0
    ? null
    : pact.sharedGoals.length === 1
      ? pact.sharedGoals[0].title
      : `${pact.sharedGoals[0].title} and ${pact.sharedGoals.length - 1} more`;

  return (
    <div
      className={embedded ? "anim-up rounded-3xl overflow-hidden flex flex-col" : "anim-up flex flex-col"}
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
            type="button"
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
          <div
            className="font-display truncate"
            style={{ fontSize: 16, fontWeight: 600, color: N.ink, letterSpacing: "-0.01em" }}
          >
            {pact.name}
          </div>
          {sharedGoalLine && (
            <div className="truncate" style={{ fontSize: 11.5, color: N.inkSoft, marginTop: 2 }}>
              {sharedGoalLine}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Pact settings"
          aria-haspopup="dialog"
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 32, height: 32, borderRadius: 999,
            background: N.cream, border: `1px solid ${N.line}`, color: N.inkSoft,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="6" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="18" cy="12" r="1.6" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "20px 20px 32px" }}>
        <div className="mx-auto" style={{ maxWidth: embedded ? "100%" : 460 }}>

          {/* Hero ring */}
          <div className="flex flex-col items-center text-center">
            <div className="relative" style={{ width: ringSize, height: ringSize }}>
              <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} aria-hidden="true">
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r}
                        fill="none" stroke="rgba(47,74,53,0.10)" strokeWidth={ringStroke} />
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r}
                        fill="none" stroke={N.sage} strokeWidth={ringStroke}
                        strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset 0.9s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-display"
                  style={{ fontSize: 32, fontWeight: 600, color: N.sageDarkest, lineHeight: 1, letterSpacing: "-0.01em" }}
                >
                  {weeklyPct}%
                </span>
                <span style={{ fontSize: 10.5, color: N.inkSoft, marginTop: 4, letterSpacing: "0.04em" }}>
                  this week
                </span>
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 500, color: N.tan }}>
              {userStreak > 0 ? `${userStreak} day streak` : "Just getting started"}
            </div>
          </div>

          {/* Received-nudge banner */}
          {incomingNudge && (
            <div
              onClick={() => setDismissedNudgeIds((cur) => new Set(cur).add(incomingNudge.id))}
              style={{ marginTop: 20, cursor: "pointer" }}
            >
              <ReceivedNudgeBanner
                senderName={incomingNudge.name ?? incomingNudge.user}
                senderInitial={incomingNudge.ini ?? (incomingNudge.name?.[0] ?? "?")}
                message={incomingNudge.detail}
                pulseKey={incomingNudge.id}
              />
            </div>
          )}

          {/* Crew */}
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: N.sageDeep,
                marginBottom: 10,
              }}
            >
              The crew
            </div>

            <ul className="flex flex-col gap-2" style={{ listStyle: "none", padding: 0 }}>
              {/* You */}
              <li>
                <CrewRow
                  name={userName || "You"}
                  initial={(userName?.[0] ?? "Y").toUpperCase()}
                  color={N.sageDeep}
                  status="That's you"
                  isYou
                />
              </li>
              {pact.members.map((m) => {
                const wig = crewWiggling || wigglingMemberId === m.name;
                const can = canNudgeMember(m.name);
                return (
                  <li key={m.name}>
                    <CrewRow
                      name={m.name}
                      initial={m.ini}
                      color={m.col}
                      status="On a roll this week"
                      wiggling={wig}
                      canNudge={can}
                      onNudge={() => onNudgeMember(m.name)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pact settings sheet (stub — real settings land in a later pass) */}
          <Sheet
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            title="Pact settings"
            subtitle="More options coming soon."
            isDesktop={embedded}
          >
            <ul className="flex flex-col gap-1" style={{ listStyle: "none", padding: 0 }}>
              <StubRow label="Mute notifications" />
              <StubRow label="Rename Pact" />
              <StubRow label="Invite a friend" />
              <StubRow label="Leave Pact" danger />
            </ul>
          </Sheet>

          {/* Primary + secondary actions */}
          <div className="flex flex-col gap-2" style={{ marginTop: 22 }}>
            <button
              type="button"
              onClick={onCrewNudge}
              className="rounded-full text-white"
              style={{
                background: N.sageDeep,
                padding: "13px 18px",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: N.shadowSoft,
                minHeight: 44,
              }}
            >
              Nudge the crew
            </button>
            <button
              type="button"
              onClick={onOpenChat}
              className="rounded-full"
              style={{
                background: N.creamCard,
                color: N.sageDeep,
                border: `1px solid ${N.line}`,
                padding: "12px 18px",
                fontSize: 14,
                fontWeight: 600,
                minHeight: 44,
              }}
            >
              Open chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============== Stub settings row =============== */

function StubRow({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <li>
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="w-full text-left rounded-xl"
        style={{
          background: "transparent",
          color: danger ? "#A8483A" : N.ink,
          padding: "12px 14px",
          fontSize: 14,
          fontWeight: 500,
          opacity: 0.55,
          border: `1px solid ${N.line}`,
          cursor: "not-allowed",
        }}
      >
        {label}
      </button>
    </li>
  );
}

/* =============== CrewRow (member or you) =============== */

function CrewRow({
  name, initial, color, status,
  isYou, wiggling, canNudge, onNudge,
}: {
  name: string;
  initial: string;
  color: string;
  status: string;
  isYou?: boolean;
  wiggling?: boolean;
  canNudge?: boolean;
  onNudge?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl"
      style={{
        background: N.creamCard,
        border: `1px solid ${N.line}`,
        padding: "10px 12px",
      }}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 rounded-full flex items-center justify-center text-white ${wiggling ? "anim-wiggle" : ""}`}
        style={{
          width: 44, height: 44, background: color,
          fontSize: 15, fontWeight: 600,
        }}
      >
        {initial}
      </span>

      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 14, fontWeight: 500, color: N.ink }}>{name}</div>
        <div style={{ fontSize: 11.5, color: N.inkSoft, marginTop: 1 }}>{status}</div>
      </div>

      {isYou ? (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: N.sageDeep,
            background: N.sageTint14,
            padding: "4px 9px",
            borderRadius: 999,
          }}
        >
          You
        </span>
      ) : (
        <button
          type="button"
          onClick={onNudge}
          disabled={!canNudge}
          className="rounded-full shrink-0"
          style={{
            background: canNudge ? N.sageTint14 : "transparent",
            color: canNudge ? N.sageDeep : N.inkFaint,
            border: `1px solid ${canNudge ? "transparent" : N.line}`,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            minHeight: 32,
          }}
        >
          {canNudge ? "Nudge" : "Nudged recently"}
        </button>
      )}
    </div>
  );
}
