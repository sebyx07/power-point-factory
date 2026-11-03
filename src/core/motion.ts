import type { EntranceEffect, Transition } from "./types";

/**
 * Motion is chosen by intent, not per effect:
 *  none    — read-ahead / emailed decks: no builds, instant cuts
 *  subtle  — corporate default: fade transitions, quiet auto fades (≤ 0.4 s)
 *  build   — presenter reveals content click by click (bullets, chart, rows)
 *  keynote — Morph between slides (titles glide), rise entrances, longer timing
 */
export type MotionProfile = "none" | "subtle" | "build" | "keynote";

export interface BuildTiming {
  trigger: "auto" | "click";
  /** ms per effect */
  dur: number;
  /** ms between consecutive steps (auto mode) */
  stagger: number;
}

export interface MotionSpec {
  transition: Transition;
  build: BuildTiming | null;
  /** remap layout-chosen effects (e.g. subtle turns rise/zoom into fade) */
  effect: (e: EntranceEffect) => EntranceEffect;
  /** name stable elements "!!id" so PowerPoint Morph pairs them across slides */
  morph: boolean;
}

/** elements Morph pairs between consecutive slides */
export const MORPH_IDS = new Set(["title", "title-mark", "eyebrow", "cover-mark", "mark", "band", "page"]);

export function motionSpec(profile: MotionProfile, themeTransition: Transition): MotionSpec {
  switch (profile) {
    case "none":
      return { transition: { type: "none" }, build: null, effect: (e) => e, morph: false };
    case "build":
      return {
        transition: { type: "fade", duration: 350 },
        build: { trigger: "click", dur: 350, stagger: 0 },
        effect: (e) => (e === "zoom" ? "fade" : e),
        morph: false,
      };
    case "keynote":
      return {
        transition: { type: "morph", duration: 800 },
        build: { trigger: "auto", dur: 520, stagger: 170 },
        effect: (e) => (e === "fade" ? "rise" : e),
        morph: true,
      };
    default:
      return {
        transition: themeTransition,
        build: { trigger: "auto", dur: 360, stagger: 110 },
        effect: (e) => (e === "rise" || e === "zoom" ? "fade" : e),
        morph: false,
      };
  }
}

export const objectName = (id: string, morph: boolean) => (morph && MORPH_IDS.has(id) ? `!!${id}` : id);
