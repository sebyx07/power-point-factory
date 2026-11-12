import type { Theme } from "@/theme/types";
import type { MotionProfile } from "./motion";
import type { El, Transition } from "./types";

export interface LayoutCtx {
  theme: Theme;
  deck: DeckMeta;
  /** 1-based slide number */
  n: number;
  total: number;
  /** absolute deck directory — resolve local assets against it */
  dir: string;
}

export interface DeckMeta {
  title: string;
  /** short label in the footer; defaults to title */
  footer?: string;
  company?: string;
  author?: string;
  /** shown on the cover; ISO or free text */
  date?: string;
  /** "Confidential", "Draft — not for distribution" … */
  classification?: string;
}

export interface Layout<P> {
  name: string;
  /** background override (e.g. dark sections) */
  background?: (ctx: LayoutCtx, props: P) => `#${string}`;
  render: (props: P, ctx: LayoutCtx) => El[];
}

export function defineLayout<P>(l: Layout<P>): Layout<P> {
  return l;
}

/** Fields every slide accepts, whatever its layout. */
export interface SlideCommon {
  /** speaker notes — write them; QA warns when missing */
  notes?: string;
  transition?: Transition;
  /** override the deck motion profile for this slide */
  motion?: MotionProfile;
  /** false = no entrance animations on this slide */
  animate?: boolean;
  /** skip from the build without deleting it */
  hidden?: boolean;
  /** extra primitives layered on top (logos, stickers, soundtrack(), callouts) — still QA'd */
  extra?: El[];
}
