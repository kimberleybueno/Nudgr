export const C = {
  sage:     "#7A9E7E",
  sageDark: "#4A6B4E",
  muted:    "#97B099",
  charcoal: "#2D2D2D",
  bg:       "#F4F8F4",
  white:    "#FFFFFF",
  light:    "#E8F0E9",
  faint:    "#D4E2D5",
  warm:     "#C4A98A",
  gold:     "#C5A33E",
  urgent:   "#D4845A",
  purple:   "#7D6B8A",
} as const;

export const HERO_GRADIENT =
  "linear-gradient(165deg, #4A6B4E 0%, #7A9E7E 55%, #97B099 100%)";

/** Tints used for goal tile gradients */
export const GOAL_COLORS = [
  "#7A9E7E", // sage
  "#C4A98A", // warm
  "#7D6B8A", // purple
  "#C5A33E", // gold
  "#D4845A", // urgent (warm orange)
  "#5B9DA4", // teal
] as const;
