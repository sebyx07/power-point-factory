/**
 * Public DSL. Deck files, slide files and custom layouts import ONLY from here and "@/slide".
 *   defineDeck · extendTheme · themes        — deck + brand
 *   defineLayout + el.* + parts.* + geometry — build your own layouts
 */
import type { DeckMeta, SlideCommon } from "@/core/deck";
import type { MotionProfile } from "@/core/motion";
import type { Transition } from "@/core/types";
import type { SlideSpec } from "@/layouts";
import { extendTheme, type Theme, type ThemeName, themes } from "@/theme";

export interface DeckSpec extends DeckMeta {
  theme: ThemeName | Theme;
  /** default transition for every slide (theme default otherwise) */
  transition?: Transition;
  /** none · subtle (default) · build (click reveals) · keynote (Morph + rise) — see src/core/motion.ts */
  motion?: MotionProfile;
  /** false = no entrance animations anywhere (same as motion: "none" minus transitions) */
  animate?: boolean;
  /** inline slides; usually empty — slides/NN-name.ts files are appended in filename order */
  slides: SlideSpec[];
}

export function defineDeck(spec: DeckSpec): DeckSpec {
  return spec;
}

export function resolveTheme(t: DeckSpec["theme"]): Theme {
  return typeof t === "string" ? themes[t] : t;
}

export { contrast, mix } from "@/core/color";
export { defineLayout, type Layout, type LayoutCtx } from "@/core/deck";
export * as el from "@/core/el";
export { box, columns, inset, rows, SLIDE } from "@/core/geometry";
export type { MotionProfile } from "@/core/motion";
export type * from "@/core/types";
export { layouts } from "@/layouts";
export * as parts from "@/layouts/parts";
export { soundtrack } from "@/layouts/soundtrack";
export type { SlideCommon, SlideSpec, Theme };
export { extendTheme, themes };
