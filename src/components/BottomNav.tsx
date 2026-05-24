"use client";

import { C } from "@/lib/colors";
import type { TabId } from "@/types";

const ITEMS: { id: TabId; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "pacts", icon: "💬", label: "Pacts" },
  { id: "circle", icon: "👥", label: "Circle" },
  { id: "profile", icon: "👤", label: "Profile" },
];

interface Props {
  active: TabId;
  onChange: (t: TabId) => void;
  onCreate: () => void;
}

export default function BottomNav({ active, onChange, onCreate }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white pb-safe"
      style={{
        borderTop: `1px solid ${C.faint}`,
        boxShadow: "0 -4px 20px rgba(45,45,45,0.04)",
      }}
    >
      <div className="relative flex items-stretch h-[64px] max-w-[640px] mx-auto">
        {ITEMS.slice(0, 2).map((it) => (
          <TabBtn key={it.id} item={it} active={active === it.id} onClick={() => onChange(it.id)} />
        ))}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={onCreate}
            aria-label="Create goal"
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-light -mt-6"
            style={{
              background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})`,
              boxShadow: "0 8px 20px rgba(74, 107, 78, 0.35)",
            }}
          >+</button>
        </div>
        {ITEMS.slice(2).map((it) => (
          <TabBtn key={it.id} item={it} active={active === it.id} onClick={() => onChange(it.id)} />
        ))}
      </div>
    </nav>
  );
}

function TabBtn({ item, active, onClick }: { item: typeof ITEMS[number]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-0.5"
      style={{ color: active ? C.sageDark : C.muted }}
    >
      <span className="text-[20px]" style={{ opacity: active ? 1 : 0.55 }}>{item.icon}</span>
      <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
    </button>
  );
}
