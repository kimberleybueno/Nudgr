"use client";

import { C } from "@/lib/colors";
import type { TabId } from "@/types";

const ITEMS: { id: TabId; icon: string; label: string }[] = [
  { id: "home",     icon: "🏠", label: "Home" },
  { id: "pacts",    icon: "💬", label: "Pacts" },
  { id: "circle",   icon: "🤝", label: "Circle" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

interface Props {
  active: TabId;
  onChange: (t: TabId) => void;
}

export default function SideNav({ active, onChange }: Props) {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-30 w-[72px] flex flex-col items-center py-6"
      style={{
        background: `linear-gradient(180deg, ${C.sageDark}, ${C.sage})`,
        boxShadow: "2px 0 16px rgba(45,45,45,0.05)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-[22px] mb-8 font-bold"
        style={{ background: "rgba(255,255,255,0.18)", fontFamily: "var(--font-sans)" }}
      >n</div>

      <div className="flex flex-col gap-2">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: active === it.id ? "rgba(255,255,255,0.22)" : "transparent",
              color: "#fff",
              opacity: active === it.id ? 1 : 0.7,
            }}
            title={it.label}
          >
            <span className="text-[18px]">{it.icon}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
