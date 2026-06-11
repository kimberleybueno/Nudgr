"use client";

import { useEffect, useRef, useState } from "react";
import { N } from "@/lib/colors";
import type { Task, Goal, Partner, Recurring } from "@/types";
import InlineGoalForm from "./InlineGoalForm";

interface Props {
  task: Task;
  goals: Goal[];
  partners: Partner[];
  onToggle: (id: string) => void;
  onUpdate: (t: Task) => void;
  onDelete: (id: string) => void;
  /** Create a new goal AND link this task to it (inline mini-form path). */
  onCreateGoalAndLink?: (g: Goal, taskId: string) => void;
  onHoldStart?: (id: string, startY: number) => void;
  onHoldMove?: (id: string, dy: number) => void;
  onHoldEnd?: (id: string) => void;
  liftedDy?: number;
  isLifted?: boolean;
}

/**
 * Expandable task row, per design_handoff_nudgr_app/README.md sec 6.
 *
 * Collapsed: 24px rounded checkbox tile, ink text, tan star, chevron.
 * Tap text or chevron to expand to the options panel (hairline + four
 * icon-tile rows: Add to a goal, Assign partner, Due day, Recurring).
 *
 * House rules from the kit (enforced here):
 *   - No em dashes in code or copy.
 *   - No emoji on the row.
 */
export default function TaskRow({
  task, goals, partners,
  onToggle, onUpdate, onDelete, onCreateGoalAndLink,
  onHoldStart, onHoldMove, onHoldEnd,
  liftedDy = 0, isLifted = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pop, setPop] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [showInlineGoal, setShowInlineGoal] = useState(false);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);
  const holding = useRef(false);

  // Pop animation when transitioning from undone to done.
  const prevDone = useRef(task.done);
  useEffect(() => {
    if (task.done && !prevDone.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 260);
      return () => clearTimeout(t);
    }
    prevDone.current = task.done;
  }, [task.done]);

  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) ?? null : null;
  const partner = task.partnerId ? partners.find((p) => p.id === task.partnerId) ?? null : null;

  /* -------- Pointer (hold-to-reorder, swipe-to-delete) -------- */
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
    swiping.current = false;
    holding.current = false;

    holdTimer.current = setTimeout(() => {
      if (swiping.current) return;
      holding.current = true;
      onHoldStart?.(task.id, e.clientY);
      try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch {}
      if (navigator.vibrate) navigator.vibrate(15);
    }, 500);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = swipeStart.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;

    if (holding.current) {
      onHoldMove?.(task.id, dy);
      return;
    }
    if (!swiping.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      swiping.current = true;
      if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    }
    if (swiping.current) {
      setSwipeX(Math.max(-90, Math.min(0, dx)));
    }
  };

  const onPointerUp = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (holding.current) {
      holding.current = false;
      onHoldEnd?.(task.id);
    } else if (swiping.current) {
      setSwipeX(swipeX < -40 ? -75 : 0);
      if (swipeX > -40) setDeleteArmed(false);
    }
    swipeStart.current = null;
    swiping.current = false;
  };

  const handleDeleteTap = () => {
    if (!deleteArmed) {
      setDeleteArmed(true);
      setTimeout(() => setDeleteArmed(false), 2000);
    } else {
      onDelete(task.id);
    }
  };

  const setRecurring = (r: Recurring) => onUpdate({ ...task, recurring: r });
  const setDue = (n: number | null) => onUpdate({ ...task, due: n });
  const setGoal = (id: string | null) => onUpdate({ ...task, goalId: id });
  const setPartner = (id: string | null) => onUpdate({ ...task, partnerId: id });

  return (
    <div className="relative" style={{ zIndex: isLifted ? 20 : "auto" }}>
      {/* Delete reveal behind the row */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-2"
        style={{ width: 90, background: "#A8483A", borderRadius: 14, overflow: "hidden" }}
      >
        <button
          onClick={handleDeleteTap}
          className="h-9 px-3 rounded-md text-[11px] font-bold text-white"
          style={{ background: deleteArmed ? "rgba(0, 0, 0, 0.25)" : "transparent" }}
        >
          {deleteArmed ? "Tap to confirm" : "Delete"}
        </button>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="select-none touch-pan-y relative"
        style={{
          background: N.creamCard,
          borderRadius: 14,
          border: `1px solid ${expanded ? N.lineStrong : N.line}`,
          boxShadow: isLifted ? "0 6px 18px rgba(0, 0, 0, 0.12)" : N.shadowSoft,
          transform: `translate(${swipeX}px, ${isLifted ? liftedDy : 0}px) scale(${isLifted ? 1.02 : 1})`,
          transition: isLifted || swipeStart.current ? "none" : "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.18s ease",
        }}
      >
        {/* -------- Collapsed row -------- */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Checkbox tile (24px rounded) */}
          <button
            data-no-drag
            onClick={() => onToggle(task.id)}
            aria-label={task.done ? "Mark incomplete" : "Mark complete"}
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              background: task.done ? N.sageTint22 : N.sageTint08,
              border: `1px solid ${task.done ? "transparent" : N.line}`,
              transform: pop ? "scale(1.18)" : "scale(1)",
              transition: "transform 0.18s cubic-bezier(0.3, 1.5, 0.6, 1), background 0.15s ease",
            }}
          >
            {task.done && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  stroke={N.sageDeep}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* Text: tap to expand */}
          <button
            data-no-drag
            onClick={() => setExpanded((v) => !v)}
            className="flex-1 min-w-0 text-left"
            style={{
              fontSize: 14.5,
              fontWeight: 500,
              color: task.done ? N.inkFaint : N.ink,
              textDecoration: task.done ? "line-through" : "none",
              transition: "color 0.15s ease",
            }}
          >
            <span className="block truncate">{task.text}</span>
          </button>

          {/* Star */}
          <button
            data-no-drag
            onClick={() => onUpdate({ ...task, star: !task.star })}
            aria-label={task.star ? "Unstar" : "Star"}
            className="shrink-0 flex items-center justify-center"
            style={{ width: 32, height: 32 }}
          >
            <StarIcon filled={task.star} />
          </button>

          {/* Chevron */}
          <button
            data-no-drag
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              transform: `rotate(${expanded ? 180 : 0}deg)`,
              transition: "transform 0.22s ease",
            }}
          >
            <ChevronIcon />
          </button>
        </div>

        {/* -------- Expanded options panel -------- */}
        {expanded && (
          <div
            className="anim-up"
            style={{
              borderTop: `1px solid ${N.line}`,
              padding: "8px 12px 12px",
            }}
          >
            {/* Add to a goal */}
            <OptionRow icon={<TargetIcon />} label="Add to a goal">
              <ChipStrip>
                <Chip
                  selected={!task.goalId}
                  onClick={() => setGoal(null)}
                  variant="ghost"
                >
                  None
                </Chip>
                {goals.map((g) => (
                  <Chip
                    key={g.id}
                    selected={task.goalId === g.id}
                    onClick={() => setGoal(g.id)}
                  >
                    {g.name}
                  </Chip>
                ))}
                <Chip
                  selected={false}
                  onClick={() => setShowInlineGoal(true)}
                  variant="outline"
                >
                  + New goal
                </Chip>
              </ChipStrip>
              <Trailing>
                {linkedGoal ? <GoalChip name={linkedGoal.name} /> : <PlusGlyph />}
              </Trailing>
            </OptionRow>

            {/* Assign partner */}
            <OptionRow icon={<PeopleIcon />} label="Assign partner">
              <ChipStrip>
                <Chip
                  selected={!task.partnerId}
                  onClick={() => setPartner(null)}
                  variant="ghost"
                >
                  None
                </Chip>
                {partners.map((p) => (
                  <Chip
                    key={p.id}
                    selected={task.partnerId === p.id}
                    onClick={() => setPartner(p.id)}
                  >
                    <Avatar p={p} size={16} />
                    <span style={{ marginLeft: 6 }}>{p.name}</span>
                  </Chip>
                ))}
              </ChipStrip>
              <Trailing>
                {partner ? <PartnerChip p={partner} /> : <PlusGlyph />}
              </Trailing>
            </OptionRow>

            {/* Due day */}
            <OptionRow icon={<CalendarIcon />} label="Due day">
              <ChipStrip>
                <Chip selected={task.due == null} onClick={() => setDue(null)} variant="ghost">
                  None
                </Chip>
                {dueOffsets().map((opt) => (
                  <Chip
                    key={opt.day}
                    selected={task.due === opt.day}
                    onClick={() => setDue(opt.day)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </ChipStrip>
              <Trailing>
                {task.due != null ? <DueChip day={task.due} /> : <PlusGlyph />}
              </Trailing>
            </OptionRow>

            {/* Recurring */}
            <OptionRow icon={<RefreshIcon />} label="Recurring" hideTrailing>
              <Segmented
                value={task.recurring ?? "Off"}
                onChange={(v) => setRecurring(v === "Off" ? null : (v.toLowerCase() as Recurring))}
              />
            </OptionRow>
          </div>
        )}
      </div>

      {showInlineGoal && (
        <InlineGoalForm
          onCancel={() => setShowInlineGoal(false)}
          onCreate={(g) => {
            onCreateGoalAndLink?.(g, task.id);
            setShowInlineGoal(false);
          }}
        />
      )}
    </div>
  );
}

/* ================== Sub-components ================== */

function OptionRow({
  icon,
  label,
  children,
  hideTrailing,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  hideTrailing?: boolean;
}) {
  // Split children: first OptionRow argument is the chip strip / control,
  // optional second <Trailing> child shows the current value at the right of the head row.
  const arr = Array.isArray(children) ? children : [children];
  const control = arr.find((c) => !(isElementOfType(c, Trailing)));
  const trailing = arr.find((c) => isElementOfType(c, Trailing));

  return (
    <div style={{ padding: "8px 4px" }}>
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 9,
            background: N.sageTint14,
            color: N.sageDeep,
          }}
        >
          {icon}
        </div>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: N.ink }}>{label}</span>
        {!hideTrailing && trailing}
      </div>
      <div className="mt-2" style={{ marginLeft: 40 }}>
        {control}
      </div>
    </div>
  );
}

function Trailing({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}
Trailing.displayName = "Trailing";
function isElementOfType(child: unknown, Component: { displayName?: string }): boolean {
  if (!child || typeof child !== "object") return false;
  const el = child as { type?: { displayName?: string; name?: string } };
  return el.type?.displayName === Component.displayName;
}

function ChipStrip({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  selected,
  onClick,
  children,
  variant = "filled",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "filled" | "ghost" | "outline";
}) {
  const base: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 11px",
    borderRadius: 999,
    border: "1px solid transparent",
    transition: "background 0.12s ease, color 0.12s ease, border-color 0.12s ease",
    display: "inline-flex",
    alignItems: "center",
  };
  const styled: React.CSSProperties = (() => {
    if (selected) {
      return { ...base, background: N.sage, color: "#fff", border: `1px solid ${N.sage}` };
    }
    if (variant === "ghost") {
      return { ...base, background: "transparent", color: N.inkSoft, border: `1px solid ${N.line}` };
    }
    if (variant === "outline") {
      return { ...base, background: N.creamCard, color: N.sageDeep, border: `1px solid ${N.sageDeep}` };
    }
    return { ...base, background: N.sageTint14, color: N.sageDeep };
  })();

  return (
    <button type="button" onClick={onClick} style={styled}>
      {children}
    </button>
  );
}

function GoalChip({ name }: { name: string }) {
  return (
    <span
      style={{
        background: N.sageTint22,
        color: N.sageDeep,
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      {name}
    </span>
  );
}

function DueChip({ day }: { day: number }) {
  const d = new Date();
  d.setDate(day);
  const label = d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  return (
    <span
      style={{
        background: N.sageTint22,
        color: N.sageDeep,
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  );
}

function PartnerChip({ p }: { p: Partner }) {
  return (
    <span
      style={{
        background: N.sageTint22,
        color: N.sageDeep,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px 3px 4px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Avatar p={p} size={20} />
      {p.name}
    </span>
  );
}

function Avatar({ p, size = 24 }: { p: Partner; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: p.color,
        color: "#fff",
        fontSize: Math.round(size * 0.42),
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {p.initial}
    </span>
  );
}

function PlusGlyph() {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        background: N.sageTint14,
        color: N.sageDeep,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: 16,
      }}
    >
      +
    </span>
  );
}

function Segmented({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = ["Off", "Daily", "Weekly"];
  return (
    <div
      role="radiogroup"
      className="inline-flex"
      style={{
        background: N.creamCard,
        border: `1px solid ${N.line}`,
        borderRadius: 999,
        padding: 3,
        gap: 3,
      }}
    >
      {options.map((opt) => {
        const selected = (value === "Off" && opt === "Off") || value === opt.toLowerCase() || value === opt;
        return (
          <button
            key={opt}
            role="radio"
            aria-checked={selected}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 999,
              background: selected ? N.sage : "transparent",
              color: selected ? "#fff" : N.inkSoft,
              transition: "background 0.12s ease, color 0.12s ease",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ================== Helpers ================== */

function dueOffsets(): { day: number; label: string }[] {
  const today = new Date();
  return [0, 1, 3, 7].map((d) => {
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);
    const day = dt.getDate();
    const label = d === 0 ? `Today (${day})` : d === 1 ? `Tomorrow (${day})` : `+${d}d (${day})`;
    return { day, label };
  });
}

/* ================== Inline line icons (24px grid, ~1.7 stroke) ================== */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
} as const;

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} style={{ color: N.inkSoft }} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? N.tan : "none"}
      stroke={filled ? N.tan : N.inkFaint}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l2.6 5.7 6.2.8-4.6 4.2 1.2 6.1L12 17.7 6.6 19.8l1.2-6.1L3.2 9.5l6.2-.8z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="17" cy="10" r="2.6" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M14.5 14.8c2 0 6.5 1.5 6.5 4.2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 20v-4h4" />
    </svg>
  );
}
