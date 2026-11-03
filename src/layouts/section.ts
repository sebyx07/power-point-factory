import { defineLayout } from "@/core/deck";
import { rect, text } from "@/core/el";
import { SLIDE } from "@/core/geometry";
import type { El } from "@/core/types";
import { enter } from "./parts";

export interface SectionProps {
  /** "01", "02" … */
  number?: string;
  title: string;
  lede?: string;
}

export const section = defineLayout<SectionProps>({
  name: "section",
  background: (ctx) => ctx.theme.colors.dark,
  render: (p, ctx) => {
    const t = ctx.theme;
    const mx = t.space.marginX;
    const els: El[] = [rect("band", { x: 0, y: 0, w: 0.22, h: SLIDE.h }, t.colors.accent, { bleed: true })];
    if (p.number) {
      els.push(text(t, "number", { x: mx, y: 1.6, w: 4, h: 1.4 }, p.number, { role: "metric", size: 96, minSize: 72, onDark: true }));
    }
    els.push(enter(t, text(t, "title", { x: mx, y: 3.1, w: 10.5, h: 1.6 }, p.title, { role: "title", size: 44, onDark: true }), 1));
    if (p.lede) {
      els.push(enter(t, text(t, "lede", { x: mx, y: 4.85, w: 8.5, h: 1.1 }, p.lede, { role: "subtitle", onDark: true }), 2));
    }
    return els;
  },
});
