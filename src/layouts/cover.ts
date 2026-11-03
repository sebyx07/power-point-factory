import { defineLayout } from "@/core/deck";
import { accentFor, image, rect, text } from "@/core/el";
import { SLIDE } from "@/core/geometry";
import type { El, ImageSource } from "@/core/types";
import { enter, logo } from "./parts";

export interface CoverProps {
  title: string;
  subtitle?: string;
  /** e.g. "Board meeting · Q4 2026" — defaults to company · date */
  eyebrow?: string;
  /** right-half full-bleed visual */
  image?: ImageSource;
  imageAlt?: string;
  /** presenter line, bottom-left */
  presenter?: string;
}

export const cover = defineLayout<CoverProps>({
  name: "cover",
  chrome: false,
  background: (ctx, p) => (p.image ? ctx.theme.colors.bg : ctx.theme.colors.dark),
  render: (p, ctx) => {
    const t = ctx.theme;
    const dark = !p.image;
    const mx = t.space.marginX;
    const textW = p.image ? 6.1 : 10.5;
    const eyebrow = p.eyebrow ?? [ctx.deck.company, ctx.deck.date].filter(Boolean).join("  ·  ");
    const els: El[] = [];
    if (p.image) {
      els.push(enter(t, image("cover-image", { x: 7.25, y: 0, w: SLIDE.w - 7.25, h: SLIDE.h }, p.image, p.imageAlt ?? p.title), 1, "fade"));
      els[0] = { ...els[0], bleed: true } as El;
    }
    els.push(...logo(ctx, { x: mx, y: 0.6, w: 2.2, h: 0.5 }, dark));
    els.push(rect("cover-mark", { x: mx, y: 2.05, w: 0.6, h: 0.07 }, accentFor(t, dark)));
    if (eyebrow) els.push(text(t, "eyebrow", { x: mx, y: 1.55, w: textW, h: 0.3 }, eyebrow, { role: "eyebrow", onDark: dark }));
    els.push(enter(t, text(t, "title", { x: mx, y: 2.4, w: textW, h: 2.3 }, p.title, { role: "title", size: t.type.hero, onDark: dark }), 1));
    if (p.subtitle) {
      els.push(
        enter(
          t,
          text(t, "subtitle", { x: mx, y: 4.85, w: textW - 0.4, h: 0.95 }, p.subtitle, { role: "subtitle", size: t.type.subtitle + 2, onDark: dark }),
          2,
        ),
      );
    }
    const meta = [p.presenter ?? ctx.deck.author, ctx.deck.classification].filter(Boolean).join("  ·  ");
    if (meta) els.push(text(t, "presenter", { x: mx, y: SLIDE.h - 0.9, w: textW, h: 0.3 }, meta, { role: "caption", onDark: dark }));
    return els;
  },
});
