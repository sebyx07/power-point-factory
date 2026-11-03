import { defineLayout } from "@/core/deck";
import { image, rect, text } from "@/core/el";
import { SLIDE } from "@/core/geometry";
import type { El, ImageSource } from "@/core/types";
import { enter } from "./parts";

export interface ImageFullProps {
  image: ImageSource;
  imageAlt?: string;
  title: string;
  caption?: string;
  /** where the text band sits */
  band?: "bottom" | "left";
}

/** Full-bleed photo with a dark scrim band so text keeps contrast on any image. */
export const imageFull = defineLayout<ImageFullProps>({
  name: "imageFull",
  chrome: false,
  background: (ctx) => ctx.theme.colors.dark,
  render: (p, ctx) => {
    const t = ctx.theme;
    const mx = t.space.marginX;
    const els: El[] = [{ ...image("image", { x: 0, y: 0, w: SLIDE.w, h: SLIDE.h }, p.image, p.imageAlt ?? p.title), bleed: true }];
    if (p.band === "left") {
      els.push(rect("scrim", { x: 0, y: 0, w: 5.6, h: SLIDE.h }, t.colors.dark, { opacity: 0.82, bleed: true }));
      els.push(enter(t, text(t, "title", { x: mx, y: 2.2, w: 4.4, h: 2.2 }, p.title, { role: "title", onDark: true, size: t.type.title + 4 }), 1));
      if (p.caption) els.push(enter(t, text(t, "caption", { x: mx, y: 4.55, w: 4.4, h: 1.4 }, p.caption, { role: "subtitle", onDark: true }), 2));
    } else {
      els.push(rect("scrim", { x: 0, y: SLIDE.h - 2.3, w: SLIDE.w, h: 2.3 }, t.colors.dark, { opacity: 0.8, bleed: true }));
      els.push(enter(t, text(t, "title", { x: mx, y: SLIDE.h - 2.0, w: 11.5, h: 1.0 }, p.title, { role: "title", onDark: true }), 1));
      if (p.caption) els.push(enter(t, text(t, "caption", { x: mx, y: SLIDE.h - 0.95, w: 11.5, h: 0.5 }, p.caption, { role: "subtitle", onDark: true }), 2));
    }
    return els;
  },
});
