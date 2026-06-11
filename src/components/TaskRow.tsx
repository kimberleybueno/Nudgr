"use client";

import { useEffect, useRef, useState } from "react";
import { N } from "@/lib/colors";
import type { Task, Goal, Partner, Recurring } from "@/types";
import { humanDueLabel } from "@/lib/dates";
import InlineGoalForm from "./InlineGoalForm";
import GoalSelectorSheet from "./GoalSelectorSheet";
import PartnerSelectorSheet from "./PartnerSelectorSheet";
import DateSelectorSheet from "./DateSelectorSheet";

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
  isDesktop?: boolean;
}

type PickerName = "goal" | "partner" | "date" | null;

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
  liftedDy = 0, isLifted = false, isDesktop = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pop, setPop] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [showInlineGoal, setShowInlineGoal] = useState(false);
  const [picker, setPicker] = useState<PickerName>(null);

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
  const setDueDate = (iso: string | null) => onUpdate({ ...task, dueDate: iso });
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
              padding: "4px 8px 8px",
            }}
          >
            <PickerRow
              icon={<TargetIcon />}
              label="Add to a goal"
              value={linkedGoal ? <GoalChip name={linkedGoal.name} /> : null}
              onClick={() => setPicker("goal")}
            />
            <PickerRow
              icon={<PeopleIcon />}
              label="Assign partner"
              value={partner ? <PartnerChip p={partner} /> : null}
              onClick={() => setPicker("partner")}
            />
            <PickerRow
              icon={<CalendarIcon />}
              label="Due day"
              value={task.dueDate ? <DueChip iso={task.dueDate} /> : null}
              onClick={() => setPicker("date")}
            />
            <SegmentedRow
              icon={<RefreshIcon />}
              label="Recurring"
              value={task.recurring ?? "Off"}
              onChange={(v) =>
                setRecurring(v === "Off" ? null : (v.toLowerCase() as Recurring))
              }
            />
          </div>
        )}
      </div>

      {/* Modal pickers (sec 11). One mounted at a time. */}
      <GoalSelectorSheet
        open={picker === "goal"}
        onClose={() => setPicker(null)}
        goals={goals}
        value={task.goalId}
        onPick={setGoal}
        onCreateGoal={() => { setPicker(null); setShowInlineGoal(true); }}
        isDesktop={isDesktop}
      />
      <PartnerSelectorSheet
        open={picker === "partner"}
        onClose={() => setPicker(null)}
        partners={partners}
        value={task.partnerId}
        onPick={setPartner}
        isDesktop={isDesktop}
      />
      <DateSelectorSheet
        open={picker === "date"}
        onClose={() => setPicker(null)}
        value={task.dueDate}
        onPick={setDueDate}
        isDesktop={isDesktop}
      />

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

/** Row that opens a modal picker on tap. icon-tile + label + value + chevron. */
function PickerRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center"
      style={{ padding: "10px 8px", gap: 12 }}
    >
      <span
        aria-hidden="true"
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
      </span>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: N.ink }}>{label}</span>
      {value ?? <span style={{ fontSize: 12.5, color: N.inkFaint }}>Add</span>}
      <span aria-hidden="true" style={{ color: N.inkFaint }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

/** Row whose right side is an inline segmented control (used for recurring). */
function SegmentedRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = ["Off", "Daily", "Weekly"];
  return (
    <div className="flex items-center" style={{ padding: "10px 8px", gap: 12 }}>
      <span
        aria-hidden="true"
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
      </span>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: N.ink }}>{label}</span>
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
          const selected =
            (value === "Off" && opt === "Off") || value === opt.toLowerCase() || value === opt;
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={selected}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: "4px 10px",
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
    </div>
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

function DueChip({ iso }: { iso: string }) {
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
      {humanDueLabel(iso)}
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
