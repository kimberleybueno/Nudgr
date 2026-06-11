"use client";

import { N } from "@/lib/colors";
import type { Goal } from "@/types";
import Sheet from "./Sheet";

interface Props {
  open: boolean;
  onClose: () => void;
  goals: Goal[];
  value: string | null;
  onPick: (goalId: string | null) => void;
  onCreateGoal: () => void;
  isDesktop?: boolean;
}

/**
 * Goal selector. Single-select rows + a "New goal" affordance at the
 * bottom that defers to the parent's create flow (existing inline goal
 * mini-form or the full CreateGoalModal).
 */
export default function GoalSelectorSheet({
  open, onClose, goals, value, onPick, onCreateGoal, isDesktop,
}: Props) {
  const pick = (id: string | null) => {
    onPick(id);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      isDesktop={isDesktop}
      title="Add to a goal"
      subtitle="Link this task so it shows up on a goal."
    >
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <li>
          <Row
            selected={value == null}
            onClick={() => pick(null)}
            title="None"
            accentColor={N.inkFaint}
            subtitle="Keep this as a standalone task"
          />
        </li>
        {goals.map((g) => {
          const total = g.tasks.length;
          const done = g.tasks.filter((t) => t.done).length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          return (
            <li key={g.id}>
              <Row
                selected={value === g.id}
                onClick={() => pick(g.id)}
                title={g.name}
                accentColor={g.color || N.sageDeep}
                subtitle={`${done} of ${total} done${pct === 0 ? "" : ` (${pct}%)`}`}
              />
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => {
          onClose();
          onCreateGoal();
        }}
        className="w-full mt-3 flex items-center justify-center"
        style={{
          background: "transparent",
          color: N.sageDeep,
          border: `1px dashed ${N.sageDeep}`,
          borderRadius: 14,
          padding: "12px 14px",
          fontSize: 13.5,
          fontWeight: 600,
          gap: 8,
        }}
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            background: N.sageTint14,
            color: N.sageDeep,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          +
        </span>
        New goal
      </button>
    </Sheet>
  );
}

function Row({
  selected,
  onClick,
  title,
  subtitle,
  accentColor,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  accentColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center"
      style={{
        background: selected ? N.sageTint22 : N.creamCard,
        border: `1px solid ${selected ? N.sage : N.line}`,
        borderRadius: 14,
        padding: "11px 14px",
        gap: 12,
      }}
    >
      <span
        aria-hidden="true"
        className="shrink-0 rounded-full"
        style={{ width: 10, height: 10, background: accentColor }}
      />
      <span className="flex-1 min-w-0">
        <span
          className="block truncate"
          style={{ fontSize: 14, fontWeight: 600, color: N.ink }}
        >
          {title}
        </span>
        {subtitle && (
          <span className="block truncate" style={{ fontSize: 12, color: N.inkSoft, marginTop: 1 }}>
            {subtitle}
          </span>
        )}
      </span>
      {selected && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
  );
}
