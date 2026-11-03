import type { LayoutCtx } from "@/core/deck";
import { image, rect, text } from "@/core/el";
import { SLIDE } from "@/core/geometry";
import type { Box, El, EntranceEffect } from "@/core/types";
import type { Theme } from "@/theme/types";

export interface Heading {
  /** small caps line above the title (section / context) */
  eyebrow?: string;
  /** action title: the slide's one takeaway, as a sentence */
  title: string;
  subtitle?: string;
}

/** Give an element an entrance step. Theme "none" → static. */
export function enter<E extends El>(t: Theme, el: E, order: number, effect?: EntranceEffect): E {
  if (t.motion.entrance === "none") return el;
  return { ...el, anim: { effect: effect ?? t.motion.entrance, order } };
}

export const TITLE_Y_OFFSET = 0.34;
export const TITLE_H = 1.05;

/** Fixed-position title block so titles never jump between slides. */
export function titleBlock(ctx: LayoutCtx, h: Heading): { els: El[]; contentTop: number } {
  const t = ctx.theme;
  const { marginX: mx, marginY: my } = t.space;
  const w = SLIDE.w - 2 * mx;
  const els: El[] = [rect("title-mark", { x: mx, y: my, w: 0.42, h: 0.055 }, t.colors.accent)];
  if (h.eyebrow) els.push(text(t, "eyebrow", { x: mx + 0.55, y: my - 0.07, w: w - 0.55, h: 0.24 }, h.eyebrow, { role: "eyebrow" }));
  els.push(text(t, "title", { x: mx, y: my + TITLE_Y_OFFSET, w, h: TITLE_H }, h.title, { role: "title", valign: "top" }));
  let contentTop = my + TITLE_Y_OFFSET + TITLE_H + 0.35;
  if (h.subtitle) {
    els.push(text(t, "subtitle", { x: mx, y: contentTop - 0.22, w, h: 0.42 }, h.subtitle, { role: "subtitle", minSize: 14 }));
    contentTop += 0.42;
  }
  return { els, contentTop };
}

/** The usable content box below the title, above the footer. */
export function contentBox(ctx: LayoutCtx, top: number): Box {
  const { marginX: mx } = ctx.theme.space;
  return { x: mx, y: top, w: SLIDE.w - 2 * mx, h: SLIDE.h - 0.8 - top };
}

/** brand logo, height-bound; picks the dark-canvas variant when there is one */
export function logo(ctx: LayoutCtx, b: Box, onDark: boolean): El[] {
  const l = ctx.theme.logo;
  if (!l) return [];
  const file = onDark ? (l.onDark ?? l.onLight) : l.onLight;
  return [image("logo", b, { file }, `${ctx.deck.company ?? "Company"} logo`, "contain")];
}

export function footer(ctx: LayoutCtx, onDark = false): El[] {
  const t = ctx.theme;
  const { marginX: mx } = t.space;
  const y = SLIDE.h - 0.48;
  const left = [ctx.deck.company, ctx.deck.footer ?? ctx.deck.title, ctx.deck.classification].filter(Boolean).join("  ·  ");
  const brand = t.footerLogo ? logo(ctx, { x: SLIDE.w - mx - 2.1, y: y - 0.02, w: 0.9, h: 0.26 }, onDark) : [];
  return [
    ...brand,
    text(t, "footer", { x: mx, y, w: 8, h: 0.22 }, left, { role: "chrome", onDark, minSize: 9 }),
    text(t, "page", { x: SLIDE.w - mx - 1, y, w: 1, h: 0.22 }, String(ctx.n).padStart(2, "0"), {
      role: "chrome",
      onDark,
      align: "right",
      bold: true,
    }),
  ];
}

/** Source line for data slides — credibility lives here. */
export function source(ctx: LayoutCtx, s: string | undefined, y: number): El[] {
  if (!s) return [];
  const { marginX: mx } = ctx.theme.space;
  return [text(ctx.theme, "source", { x: mx, y, w: SLIDE.w - 2 * mx, h: 0.22 }, `Source: ${s}`, { role: "caption", minSize: 9 })];
}
