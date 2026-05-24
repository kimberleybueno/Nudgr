export const C = {
  sage: "#7A9E7E",
  sageDark: "#4A6B4E",
  light: "#E8F0E9",
  faint: "#D4E2D5",
  muted: "#97B099",
  bg: "#F4F8F4",
  white: "#FFFFFF",
  charcoal: "#2D2D2D",
  warm: "#C4A98A",
  gold: "#C5A33E",
  urgent: "#D4845A",
} as const;

export const TYPE_STYLE = {
  daily:    { bg: "#E8F0E9", color: "#4A6B4E", label: "Daily" },
  weekly:   { bg: "#F4ECE0", color: "#8A6F4A", label: "Weekly" },
  monthly:  { bg: "#FBF0D8", color: "#8A6E1F", label: "Monthly" },
  longterm: { bg: "#EDE3F4", color: "#6B4A8A", label: "Long term" },
} as const;
