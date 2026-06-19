"use client";

import { useEffect, useState } from "react";
import { N } from "@/lib/colors";

export type ConfettiTier = "task" | "goal" | "daily";

interface Props {
  tier: ConfettiTier | null;
  onDone: () => void;
}

const TIER_CFG = {
  task:  { count: 8,  travel: 60,  spread: 40,  duration: 700,  size: [8, 12] as const,  rot: 0,
           colors: [N.sage, N.tan, N.tan],
           symbols: ["✦", "•", "★"] },
  goal:  { count: 22, travel: 120, spread: 80,  duration: 900,  size: [10, 18] as const, rot: 360,
           colors: [N.sage, N.tan, N.tan, "#7D6B8A", "#D89BB4"],
           symbols: ["✦", "●", "★", "•", "🎯"] },
  daily: { count: 35, travel: 180, spread: 120, duration: 1200, size: [10, 22] as const, rot: 720,
           colors: [N.sage, N.tan, N.tan, "#7D6B8A", "#D89BB4", N.sageDeep],
           symbols: ["✦", "●", "★", "🎉", "🏆", "✨"] },
} as const;

interface Particle {
  id: number;
  x: number;
  delay: number;
  symbol: string;
  color: string;
  size: number;
  travel: number;
  tx: number;
  rot: number;
  duration: number;
}

export default function Confetti({ tier, onDone }: Props) {
  const [particles, setParticles] = useState<Particle[] | null>(null);
  const [active, setActive] = useState<ConfettiTier | null>(null);

  useEffect(() => {
    if (!tier) { setParticles(null); setActive(null); return; }
    const cfg = TIER_CFG[tier];
    const parts: Particle[] = Array.from({ length: cfg.count }, (_, i) => {
      const [sMin, sMax] = cfg.size;
      return {
        id: i,
        x: 50 + (Math.random() - 0.5) * cfg.spread,
        delay: Math.random() * 350,
        symbol: cfg.symbols[i % cfg.symbols.length],
        color: cfg.colors[i % cfg.colors.length],
        size: sMin + Math.random() * (sMax - sMin),
        travel: cfg.travel + Math.random() * 40,
        tx: (Math.random() - 0.5) * cfg.spread,
        rot: cfg.rot,
        duration: cfg.duration,
      };
    });
    setParticles(parts);
    setActive(tier);
    const longest = Math.max(...parts.map((p) => p.delay + p.duration), tier === "task" ? 800 : 1500);
    const timer = setTimeout(() => { setParticles(null); setActive(null); onDone(); }, longest + 100);
    return () => clearTimeout(timer);
  }, [tier, onDone]);

  if (!particles || !active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 999 }}>
      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: "55%",
              fontSize: p.size,
              color: p.color,
              animationName: active === "task" ? "cS" : active === "goal" ? "cM" : "cL",
              animationDuration: `${p.duration}ms`,
              animationTimingFunction: "ease-out",
              animationFillMode: "both",
              animationDelay: `${p.delay}ms`,
              ["--tx" as string]: `${p.tx}px`,
              ["--ty" as string]: `${-p.travel}px`,
              ["--rot" as string]: `${p.rot}deg`,
              textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              willChange: "transform, opacity",
            }}
          >{p.symbol}</span>
        ))}
      </div>

      {/* Badge for goal + daily tiers */}
      {(active === "goal" || active === "daily") && (
        <div
          className="relative text-center"
          style={{
            animation: `cB ${active === "daily" ? "1400ms" : "1200ms"} ease forwards`,
            background: "rgba(255,255,255,0.96)",
            borderRadius: 24,
            padding: active === "daily" ? "20px 28px" : "16px 24px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ fontSize: active === "daily" ? 56 : 44 }}>
            {active === "daily" ? "🏆" : "🎯"}
          </div>
          <div style={{ fontSize: active === "daily" ? 22 : 16, fontWeight: 700, color: N.sageDeep, marginTop: 4 }}>
            {active === "daily" ? "All Done!" : "Goal Complete!"}
          </div>
          {active === "daily" && (
            <div style={{ fontSize: 12, color: N.inkSoft, marginTop: 2 }}>Incredible work</div>
          )}
        </div>
      )}
    </div>
  );
}
