import { defineLayout } from "@/core/deck";
import { text } from "@/core/el";
import { SLIDE } from "@/core/geometry";
import type { El } from "@/core/types";
import { enter, footer, source } from "./parts";

export interface BigNumberProps {
  eyebrow?: string;
  /** the figure: "$74M", "3×", "18 months" */
  value: string;
  /** what it means, one sentence */
  statement: string;
  context?: string;
  source?: string;
}

/** One giant number + one line. A punctuation mark between dense slides — ≤ 2 per deck. */
export const bigNumber = defineLayout<BigNumberProps>({
  name: "bigNumber",
  render: (p, ctx) => {
    const t = ctx.theme;
    const mx = t.space.marginX;
    const w = SLIDE.w - 2 * mx;
    const els: El[] = [];
    if (p.eyebrow) els.push(text(t, "eyebrow", { x: mx, y: 1.3, w, h: 0.3 }, p.eyebrow, { role: "eyebrow" }));
    els.push(enter(t, text(t, "value", { x: mx, y: 1.7, w, h: 2.3 }, p.value, { role: "metric", size: 150, minSize: 96 }), 1));
    els.push(enter(t, text(t, "statement", { x: mx, y: 4.15, w: w * 0.8, h: 1.1 }, p.statement, { role: "title", size: t.type.title, minSize: 22 }), 2));
    if (p.context) els.push(enter(t, text(t, "context", { x: mx, y: 5.35, w: w * 0.75, h: 0.75 }, p.context, { role: "subtitle" }), 3));
    return [...els, ...source(ctx, p.source, SLIDE.h - 0.85), ...footer(ctx)];
  },
});
