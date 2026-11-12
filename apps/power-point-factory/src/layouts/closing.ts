import { defineLayout } from "@/core/deck";
import { rect, text } from "@/core/el";
import { SLIDE } from "@/core/geometry";
import type { El } from "@/core/types";
import { enter, logo } from "./parts";

export interface ClosingProps {
  title?: string;
  /** the ask / next step */
  message?: string;
  /** contact lines: name, email, url */
  contact?: string[];
}

export const closing = defineLayout<ClosingProps>({
  name: "closing",
  background: (ctx) => ctx.theme.colors.dark,
  render: (p, ctx) => {
    const t = ctx.theme;
    const mx = t.space.marginX;
    const els: El[] = [
      ...logo(ctx, { x: mx, y: 0.6, w: 2.2, h: 0.5 }, true),
      rect("mark", { x: mx, y: 2.25, w: 0.6, h: 0.07 }, t.colors.accent),
      enter(
        t,
        text(t, "title", { x: mx, y: 2.55, w: 10, h: 1.4 }, p.title ?? "Questions and discussion", { role: "title", size: t.type.hero, onDark: true }),
        1,
      ),
    ];
    if (p.message)
      els.push(enter(t, text(t, "message", { x: mx, y: 4.05, w: 9, h: 1.0 }, p.message, { role: "subtitle", onDark: true, size: t.type.subtitle + 2 }), 2));
    if (p.contact?.length) {
      els.push(enter(t, text(t, "contact", { x: mx, y: SLIDE.h - 1.55, w: 8, h: 1.0 }, p.contact, { role: "caption", onDark: true, size: t.type.small }), 3));
    }
    return els;
  },
});
