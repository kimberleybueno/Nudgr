/**
 * Original sage-on-green palette used by the rest of the app.
 * Keep this export intact while the Goals home redesign rolls out.
 */
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

/* =============================================================
   N (Nudgr Design and Brand Kit v1.0). Additive tokens used by
   the new Goals home redesign (TaskRow, TaskList Today, etc.).
   Match the handoff spec exactly.
   ============================================================= */
export const N = {
  // Surfaces
  cream:        "#F7F4EC",   // app / page background
  creamCard:    "#FCFAF4",   // card and surface background (never pure white)

  // Brand
  sage:         "#7A9E7E",
  sageDeep:     "#4A6B4E",
  sageDarkest:  "#2F4A35",
  tan:          "#C4A98A",
  tanSoft:      "#EADBC4",
  sageLight:    "#9CB89F",   // 4th crew avatar fill

  // Text
  ink:          "#36352F",
  inkSoft:      "#6E6B61",
  inkFaint:     "#A59F8F",   // placeholders, disabled, faint hints

  // Lines
  line:         "rgba(47, 74, 53, 0.12)",
  lineStrong:   "rgba(47, 74, 53, 0.22)",

  // Sage tints over cream
  sageTint08:   "rgba(122, 158, 126, 0.08)",
  sageTint14:   "rgba(122, 158, 126, 0.14)",
  sageTint22:   "rgba(122, 158, 126, 0.22)",

  // Tan tints
  tanTint14:    "rgba(196, 169, 138, 0.14)",
  tanTint22:    "rgba(196, 169, 138, 0.22)",

  // Elevation (green-tinted)
  shadow:       "0 18px 50px -22px rgba(47, 74, 53, 0.45)",
  shadowSoft:   "0 10px 30px -18px rgba(47, 74, 53, 0.40)",
  shadowRaise:  "0 6px 16px -10px rgba(47, 74, 53, 0.35)",
} as const;
