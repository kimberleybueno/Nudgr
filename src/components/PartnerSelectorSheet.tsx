"use client";

import { N } from "@/lib/colors";
import type { Partner } from "@/types";
import Sheet from "./Sheet";

interface Props {
  open: boolean;
  onClose: () => void;
  partners: Partner[];
  value: string | null;
  onPick: (partnerId: string | null) => void;
  isDesktop?: boolean;
}

/**
 * Partner selector. Crew avatars in a row (initial chips), single-select.
 *   None affordance at the start.
 *   Selected = sage-deep ring around the avatar and the name shown below.
 */
export default function PartnerSelectorSheet({
  open, onClose, partners, value, onPick, isDesktop,
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
      title="Assign partner"
      subtitle="Pick a friend to keep you on it."
    >
      <div
        className="flex flex-wrap"
        style={{ gap: 16, justifyContent: "flex-start", padding: "8px 0 12px" }}
      >
        <NoneChip selected={value == null} onClick={() => pick(null)} />
        {partners.map((p) => {
          const selected = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => pick(p.id)}
              aria-label={p.name}
              className="flex flex-col items-center"
              style={{ gap: 6, width: 60 }}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: p.color,
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 600,
                  boxShadow: selected ? `0 0 0 3px ${N.cream}, 0 0 0 5px ${N.sageDeep}` : "none",
                  transition: "box-shadow 0.15s ease",
                }}
              >
                {p.initial}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: selected ? 600 : 500,
                  color: selected ? N.ink : N.inkSoft,
                  textAlign: "center",
                  maxWidth: 60,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      {partners.length === 0 && (
        <p style={{ fontSize: 12.5, color: N.inkSoft, padding: "4px 0" }}>
          Your Circle is empty. Add someone there first, then come back.
        </p>
      )}
    </Sheet>
  );
}

function NoneChip({ selected, onClick }: { selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="None"
      className="flex flex-col items-center"
      style={{ gap: 6, width: 60 }}
    >
      <span
        aria-hidden="true"
        className="flex items-center justify-center"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "transparent",
          border: `2px dashed ${selected ? N.sageDeep : N.lineStrong}`,
          color: selected ? N.sageDeep : N.inkFaint,
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        ×
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: selected ? 600 : 500,
          color: selected ? N.ink : N.inkSoft,
          textAlign: "center",
        }}
      >
        None
      </span>
    </button>
  );
}
