"use client";

interface Props {
  pct: number;            // 0-100
  size?: number;          // diameter in px
  stroke?: number;        // ring thickness
  color?: string;         // fill color (defaults to white for dark bgs)
  trackColor?: string;    // background ring color
  textColor?: string;
  fontSize?: number;
}

export default function ProgressRing({
  pct,
  size = 40,
  stroke = 3,
  color = "#ffffff",
  trackColor = "rgba(255,255,255,0.22)",
  textColor = "#ffffff",
  fontSize,
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, pct)) / 100) * circ;
  const fs = fontSize ?? Math.round(size * 0.28);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${pct}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease", transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={textColor} fontSize={fs} fontWeight={700}
        fontFamily="-apple-system, 'SF Pro Display', system-ui, sans-serif"
      >{Math.round(pct)}%</text>
    </svg>
  );
}
