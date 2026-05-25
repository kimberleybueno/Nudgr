"use client";

import { C } from "@/lib/colors";

interface Props {
  emoji: string;
  title: string;
  blurb: string;
}

export default function PlaceholderTab({ emoji, title, blurb }: Props) {
  return (
    <div className="anim-up px-5 pt-16 pb-24 text-center">
      <div className="text-6xl mb-4">{emoji}</div>
      <h1 className="text-[22px] font-bold mb-2" style={{ color: C.sageDark }}>{title}</h1>
      <p className="text-[13px] max-w-[280px] mx-auto leading-relaxed" style={{ color: C.muted }}>{blurb}</p>
      <div
        className="inline-block mt-6 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide"
        style={{ background: C.light, color: C.sageDark, border: `1px solid ${C.faint}` }}
      >COMING SOON</div>
    </div>
  );
}
