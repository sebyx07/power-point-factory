import type { EntranceEffect, Hex, Transition } from "@/core/types";

export interface ThemeColors {
  /** slide canvas */
  bg: Hex;
  /** tiles, cards, callouts */
  surface: Hex;
  text: Hex;
  muted: Hex;
  /** one accent, used with intent: eyebrows, key numbers, highlights */
  accent: Hex;
  /** text on accent fill */
  onAccent: Hex;
  /** accent variant legible on `dark` (defaults to accent lightened toward white) */
  accentOnDark?: Hex;
  /** hairlines, table rules */
  rule: Hex;
  positive: Hex;
  negative: Hex;
  /** at-risk / amber status (defaults to a dark amber that passes AA on light canvases) */
  warning?: Hex;
  /** inverted canvas for cover/section/closing */
  dark: Hex;
  onDark: Hex;
  mutedOnDark: Hex;
  /** chart series order; first = hero series */
  chart: Hex[];
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  /** Office-safe faces with metric-compatible Linux twins (see src/text/fonts.ts) */
  fonts: { display: string; body: string };
  /** points */
  type: {
    hero: number;
    title: number;
    subtitle: number;
    body: number;
    small: number;
    caption: number;
    metric: number;
    eyebrow: number;
  };
  displayBold: boolean;
  /** inches */
  space: { marginX: number; marginY: number; gutter: number };
  /** inches */
  radius: number;
  motion: {
    transition: Transition;
    entrance: EntranceEffect | "none";
  };
  /** absolute paths (use join(import.meta.dir, "brand/…") in brand.ts). SVG or PNG. */
  logo?: { onLight: string; onDark?: string };
  /** also place the logo in every content slide's footer */
  footerLogo?: boolean;
}

export type ThemeOverrides = {
  [K in keyof Theme]?: Theme[K] extends object ? Partial<Theme[K]> : Theme[K];
};
