"use client";

import { C } from "@/lib/colors";
import type { TabId } from "@/types";

const ITEMS: { id: TabId; icon: string; label: string }[] = [
  { id: "home",     icon: "🏠", label: "Home" },
  { id: "people",   icon: "👥", label: "People" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

interface Props {
  active: TabId;
  onChange: (t: TabId) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 pb-safe"
      style={{ background: "#fff", borderTop: `1px solid ${C.faint}` }}
    >
      <div className="max-w-[440px] mx-auto flex" style={{ paddingTop: 10, paddingBottom: 14 }}>
        {ITEMS.map((it) => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className="flex-1 flex flex-col items-center gap-0.5"
              style={{ opacity: isActive ? 1 : 0.5 }}
            >
              <span className="text-[22px]">{it.icon}</span>
              <span className="text-[9px] font-semibold"
                    style={{ color: isActive ? C.sageDark : C.muted }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
