"use client";

import { useEffect, useRef, useState } from "react";
import { C } from "@/lib/colors";
import type { Task, Goal, Partner } from "@/types";
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
  /** Vertical offset applied while reordering (parent-controlled) */
  liftedDy?: number;
  /** True while this row is the one being dragged */
  isLifted?: boolean;
}

export default function TaskRow({
  task, goals, partners,
  onToggle, onUpdate, onDelete, onCreateGoalAndLink,
  onHoldStart, onHoldMove, onHoldEnd,
  liftedDy = 0, isLifted = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const [expanded, setExpanded] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [deleteArmed, setDeleteArmed] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);
  const holding = useRef(false);

  // Sync draft when task text changes externally
  useEffect(() => { setDraft(task.text); }, [task.text]);

  // Auto-focus input when entering edit mode
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const goal = task.goalId ? goals.find((g) => g.id === task.goalId) ?? null : null;
  const partner = task.partnerId ? partners.find((p) => p.id === task.partnerId) ?? null : null;

  const commitEdit = () => {
    setEditing(false);
    const v = draft.trim();
    if (v && v !== task.text) onUpdate({ ...task, text: v });
    else setDraft(task.text);
  };

  // ----- Pointer handlers (covers touch + mouse for hold + swipe) -----
  const onPointerDown = (e: React.PointerEvent) => {
    if (editing) return;
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

    // Detect swipe direction once: horizontal beats vertical
    if (!swiping.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      swiping.current = true;
      if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    }

    if (swiping.current) {
      const next = Math.max(-90, Math.min(0, dx));
      setSwipeX(next);
    }
  };

  const onPointerUp = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }

    if (holding.current) {
      holding.current = false;
      onHoldEnd?.(task.id);
    } else if (swiping.current) {
      // Snap to either revealed (-75) or closed (0)
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

  const overdue = task.overdue && !task.done;

  return (
    <div
      className="relative"
      style={{
        zIndex: isLifted ? 20 : "auto",
      }}
    >
      {/* Delete reveal zone behind the row */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-2"
        style={{ width: 90, background: C.urgent, borderRadius: 10, overflow: "hidden" }}
      >
        <button
          onClick={handleDeleteTap}
          className="h-9 px-3 rounded-md text-[11px] font-bold text-white"
          style={{ background: deleteArmed ? "rgba(0,0,0,0.25)" : "transparent" }}
        >{deleteArmed ? "Tap to confirm" : "Delete"}</button>
      </div>

      <div
        ref={rowRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex items-center gap-2.5 px-3.5 py-2.5 select-none touch-pan-y"
        style={{
          background: "#fff",
          borderRadius: 10,
          borderLeft: overdue ? `3px solid ${C.urgent}` : `3px solid transparent`,
          border: overdue ? `1px solid ${C.urgent}33` : `1px solid ${C.faint}`,
          borderLeftWidth: 3,
          borderLeftColor: overdue ? C.urgent : "transparent",
          transform: `translate(${swipeX}px, ${isLifted ? liftedDy : 0}px) scale(${isLifted ? 1.02 : 1})`,
          boxShadow: isLifted ? "0 6px 18px rgba(0,0,0,0.12)" : "none",
          transition: isLifted || swipeStart.current ? "none" : "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Drag handle */}
        <div className="flex flex-col gap-0.5 shrink-0" style={{ opacity: isLifted ? 0.5 : 0.1 }}>
          <div style={{ width: 8, height: 1.5, background: C.muted, borderRadius: 1 }} />
          <div style={{ width: 8, height: 1.5, background: C.muted, borderRadius: 1 }} />
        </div>

        {/* Checkbox */}
        <button
          data-no-drag
          onClick={() => onToggle(task.id)}
          aria-label={task.done ? "Mark incomplete" : "Mark complete"}
          className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center"
          style={{
            border: `1.5px solid ${overdue ? C.urgent : task.done ? C.sage : C.faint}`,
            background: task.done ? C.sage : "transparent",
          }}
        >
          {task.done && <span className="text-white text-[10px] leading-none">✓</span>}
        </button>

        {/* Text + inline edit + goal emoji + warning */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {editing ? (
            <input
              ref={inputRef}
              data-no-drag
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") { setDraft(task.text); setEditing(false); }
              }}
              className="text-[13px] font-medium bg-transparent outline-none w-full"
              style={{ borderBottom: `1px solid ${C.sage}`, color: C.charcoal }}
            />
          ) : (
            <span
              data-no-drag
              onClick={() => !task.done && setEditing(true)}
              className="text-[13px] font-medium truncate cursor-text"
              style={{
                color: task.done ? C.muted : C.charcoal,
                textDecoration: task.done ? "line-through" : "none",
                opacity: task.done ? 0.4 : 1,
              }}
            >{task.text}</span>
          )}
          {goal && !editing && (
            <span className="text-[9px] shrink-0" style={{ opacity: 0.5 }}>{goal.emoji}</span>
          )}
          {partner && !editing && (
            <span
              className="text-[9px] font-bold flex items-center justify-center text-white shrink-0"
              style={{ background: partner.color, width: 14, height: 14, borderRadius: "50%", fontSize: 8 }}
            >{partner.initial}</span>
          )}
          {overdue && !editing && <span className="text-[10px] shrink-0">⚠️</span>}
        </div>

        {/* Star */}
        <button
          data-no-drag
          onClick={() => onUpdate({ ...task, star: !task.star })}
          aria-label={task.star ? "Unstar" : "Star"}
          className="text-[12px] shrink-0"
          style={{ opacity: task.star ? 1 : 0.12, color: C.gold }}
        >★</button>

        {/* Chevron */}
        <button
          data-no-drag
          onClick={() => setExpanded((v) => !v)}
          aria-label="More options"
          className="text-[10px] shrink-0"
          style={{
            color: C.muted,
            opacity: 0.45,
            transform: `rotate(${expanded ? 180 : 0}deg)`,
            transition: "transform 0.2s",
          }}
        >▾</button>
      </div>

      {/* Expanded options */}
      {expanded && (
        <div
          className="mt-1 ml-7 mr-2 rounded-xl p-1.5 anim-up"
          style={{ background: "#fff", border: `1px solid ${C.faint}` }}
        >
          <DropdownGoal task={task} goals={goals} onUpdate={onUpdate}
                        onCreateGoalAndLink={(g) => onCreateGoalAndLink?.(g, task.id)} />
          <DropdownPartner task={task} partners={partners} onUpdate={onUpdate} />
          <DropdownDue task={task} onUpdate={onUpdate} />
          <DropdownRecurring task={task} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

/* ---------- Dropdown options ---------- */

function DropdownGoal({
  task, goals, onUpdate, onCreateGoalAndLink,
}: {
  task: Task; goals: Goal[];
  onUpdate: (t: Task) => void;
  onCreateGoalAndLink?: (g: Goal) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showInline, setShowInline] = useState(false);
  const cur = task.goalId ? goals.find((g) => g.id === task.goalId) ?? null : null;
  return (
    <div className="px-1">
      <button onClick={() => setOpen((v) => !v)}
              className="w-full flex items-center justify-between py-2 text-[11px] font-semibold"
              style={{ color: C.charcoal }}>
        <span>🎯 {cur ? `Move from ${cur.name}` : "Add to a goal"}</span>
        <span style={{ color: C.muted }}>{open ? "−" : "+"}</span>
      </button>
      {open && !showInline && (
        <div className="flex flex-wrap gap-1.5 pb-1.5">
          <Chip selected={!task.goalId} onClick={() => { onUpdate({ ...task, goalId: null }); setOpen(false); }}>None</Chip>
          {goals.map((g) => (
            <Chip key={g.id} selected={task.goalId === g.id}
                  onClick={() => { onUpdate({ ...task, goalId: g.id }); setOpen(false); }}>
              {g.emoji} {g.name}
            </Chip>
          ))}
          {/* Inline 'New goal' chip — Screen 9 entry point 2 */}
          {onCreateGoalAndLink && (
            <button onClick={() => setShowInline(true)}
                    className="px-2.5 h-7 rounded-md text-[11px] font-bold"
                    style={{
                      background: "transparent", color: C.warm,
                      border: `1px dashed ${C.warm}`,
                    }}>+ New goal</button>
          )}
        </div>
      )}
      {open && showInline && onCreateGoalAndLink && (
        <InlineGoalForm
          onCancel={() => setShowInline(false)}
          onCreate={(g) => {
            onCreateGoalAndLink(g);
            setShowInline(false);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function DropdownPartner({ task, partners, onUpdate }: { task: Task; partners: Partner[]; onUpdate: (t: Task) => void }) {
  const [open, setOpen] = useState(false);
  const cur = task.partnerId ? partners.find((p) => p.id === task.partnerId) ?? null : null;
  return (
    <div className="px-1">
      <button onClick={() => setOpen((v) => !v)}
              className="w-full flex items-center justify-between py-2 text-[11px] font-semibold"
              style={{ color: C.charcoal }}>
        <span>🤝 {cur ? `Partner: ${cur.name}` : "Assign partner"}</span>
        <span style={{ color: C.muted }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="flex flex-wrap gap-1.5 pb-1.5">
          <Chip selected={!task.partnerId} onClick={() => { onUpdate({ ...task, partnerId: null }); setOpen(false); }}>None</Chip>
          {partners.map((p) => (
            <Chip key={p.id} selected={task.partnerId === p.id}
                  onClick={() => { onUpdate({ ...task, partnerId: p.id }); setOpen(false); }}>
              <span style={{ background: p.color, color: "#fff", width: 14, height: 14, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, marginRight: 4 }}>{p.initial}</span>
              {p.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownDue({ task, onUpdate }: { task: Task; onUpdate: (t: Task) => void }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const cur = task.due ?? "—";
  return (
    <div className="px-1">
      <button onClick={() => setOpen((v) => !v)}
              className="w-full flex items-center justify-between py-2 text-[11px] font-semibold"
              style={{ color: C.charcoal }}>
        <span>📅 Due day: <span style={{ color: C.muted }}>{cur}</span></span>
        <span style={{ color: C.muted }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="flex flex-wrap gap-1.5 pb-1.5">
          <Chip selected={task.due == null} onClick={() => { onUpdate({ ...task, due: null }); setOpen(false); }}>No date</Chip>
          <Chip selected={task.due === today.getDate()} onClick={() => { onUpdate({ ...task, due: today.getDate() }); setOpen(false); }}>Today ({today.getDate()})</Chip>
          {[1, 3, 7, 14].map((delta) => {
            const d = new Date(today); d.setDate(d.getDate() + delta);
            return (
              <Chip key={delta} selected={task.due === d.getDate()}
                    onClick={() => { onUpdate({ ...task, due: d.getDate() }); setOpen(false); }}>
                +{delta}d ({d.getDate()})
              </Chip>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DropdownRecurring({ task, onUpdate }: { task: Task; onUpdate: (t: Task) => void }) {
  return (
    <div className="px-1 pb-1">
      <div className="flex items-center justify-between py-2 text-[11px] font-semibold" style={{ color: C.charcoal }}>
        <span>🔄 Recurring</span>
        <div className="flex gap-1.5">
          <Chip selected={task.recurring == null} onClick={() => onUpdate({ ...task, recurring: null })}>Off</Chip>
          <Chip selected={task.recurring === "daily"} onClick={() => onUpdate({ ...task, recurring: "daily" })}>Daily</Chip>
          <Chip selected={task.recurring === "weekly"} onClick={() => onUpdate({ ...task, recurring: "weekly" })}>Weekly</Chip>
        </div>
      </div>
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-2.5 h-7 rounded-md text-[11px] font-semibold flex items-center"
            style={{
              background: selected ? C.sage : C.bg,
              color: selected ? "#fff" : C.charcoal,
              border: `1px solid ${selected ? C.sage : C.faint}`,
            }}>{children}</button>
  );
}
