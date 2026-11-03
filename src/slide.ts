/** Public API for slide files: `export default slide({ layout: "stats", ... })` — typed per layout. */
import type { Layout, SlideCommon } from "@/core/deck";
import type { SlideSpec } from "@/layouts";

export function slide<S extends SlideSpec>(s: S): S {
  return s;
}

/** several slides from one file (e.g. an appendix) */
export function slides<S extends SlideSpec[]>(...s: S): S {
  return s;
}

/**
 * A slide on YOUR layout (presentations/<company>/layouts/*.ts, or anywhere):
 *   export default use(pricingTiers, { title: "…", tiers: [...] })
 * Fully typed by the layout's props; QA'd like every built-in.
 */
export function use<P>(layout: Layout<P>, props: P & SlideCommon): SlideSpec {
  return { ...props, layout } as unknown as SlideSpec;
}

export type { SlideSpec };
