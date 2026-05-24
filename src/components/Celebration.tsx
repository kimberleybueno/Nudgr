"use client";

import { useEffect, useState } from "react";
import { C } from "@/lib/colors";
import type { Pact } from "@/types";

interface Props {
  streak: number;
  pct: number;
  pacts: Pact[];
  onShare: (pactId: string) => void;
  onClose: () => void;
}

export default function Celebration({ streak, pct, pacts, onShare, onClose }: Props) {
  const [bursts, setBursts] = useState<{ id: number; x: number; emoji: string }[]>([]);

  useEffect(() => {
    const emojis = ["🎉", "✨", "🌱", "🔥", "💪", "⭐"];
    const seed = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      emoji: emojis[i % emojis.length],
    }));
    setBursts(seed);
  }, []);

  return (
    <div className="text-center pt-2 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-32">
        {bursts.map((b) => (
          <span key={b.id} className="absolute text-2xl"
                style={{
                  left: `${b.x}%`, top: 30,
                  animation: `confetti 1.4s ease ${b.id * 0.06}s both`,
                }}>{b.emoji}</span>
        ))}
      </div>

      <div className="text-6xl mb-2 anim-up">🎉</div>
      <h2 className="text-[22px] font-bold mb-1" style={{ color: C.sageDark }}>You crushed today</h2>
      <p className="text-[13px] mb-5" style={{ color: C.muted }}>All today&apos;s tasks done — keep the streak alive</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl p-3" style={{ background: C.bg, border: `1px solid ${C.faint}` }}>
          <div className="text-[10px] font-bold tracking-wide" style={{ color: C.muted }}>STREAK</div>
          <div className="text-[24px] font-bold" style={{ color: C.gold }}>🔥 {streak}</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: C.bg, border: `1px solid ${C.faint}` }}>
          <div className="text-[10px] font-bold tracking-wide" style={{ color: C.muted }}>WEEK</div>
          <div className="text-[24px] font-bold" style={{ color: C.sageDark }}>{pct}%</div>
        </div>
      </div>

      <div className="text-[11px] font-bold tracking-wide mb-2 text-left" style={{ color: C.muted }}>SHARE IN A PACT</div>
      <div className="flex flex-col gap-2">
        {pacts.length === 0 && (
          <div className="text-[12px] py-3" style={{ color: C.muted }}>No pacts yet</div>
        )}
        {pacts.map((p) => (
          <button key={p.id} onClick={() => onShare(p.id)}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left"
                  style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
            <span className="text-xl">{p.emoji}</span>
            <span className="text-[13px] font-bold flex-1" style={{ color: C.charcoal }}>{p.name}</span>
            <span className="text-[11px] font-bold" style={{ color: C.sage }}>Share →</span>
          </button>
        ))}
      </div>

      <button onClick={onClose} className="mt-4 text-[12px] font-bold py-2" style={{ color: C.muted }}>
        Maybe later
      </button>
    </div>
  );
}
