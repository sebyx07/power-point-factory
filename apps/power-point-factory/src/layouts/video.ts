import { defineLayout } from "@/core/deck";
import { text } from "@/core/el";
import { SLIDE } from "@/core/geometry";
import type { El, MediaEl, MediaSource } from "@/core/types";
import { contentBox, footer, type Heading, titleBlock } from "./parts";

export interface VideoProps extends Partial<Heading> {
  video: MediaSource;
  alt?: string;
  /** full-bleed (keynote) or framed under a title (corporate) */
  full?: boolean;
  /** default true — starts when the slide appears */
  autoplay?: boolean;
  caption?: string;
}

/** Embedded video (file or Kubeez text-to-video). Poster frame renders in PDF/screenshots. */
export const video = defineLayout<VideoProps>({
  name: "video",
  background: (ctx, p) => (p.full ? ctx.theme.colors.dark : ctx.theme.colors.bg),
  render: (p, ctx) => {
    const t = ctx.theme;
    const media = (box: MediaEl["box"]): MediaEl => ({
      kind: "media",
      id: "video",
      box,
      role: "media",
      media: "video",
      src: p.video,
      autoplay: p.autoplay ?? true,
      alt: p.alt ?? p.title ?? "Video",
      ...(p.full ? { bleed: true } : {}),
    });
    if (p.full) return [media({ x: 0, y: 0, w: SLIDE.w, h: SLIDE.h })];
    const head = p.title
      ? titleBlock(ctx, { title: p.title, ...(p.eyebrow ? { eyebrow: p.eyebrow } : {}), ...(p.subtitle ? { subtitle: p.subtitle } : {}) })
      : { els: [], contentTop: t.space.marginY };
    const area = contentBox(ctx, head.contentTop);
    const h = Math.min(area.h - (p.caption ? 0.4 : 0), (area.w * 9) / 16);
    const w = (h * 16) / 9;
    const els: El[] = [...head.els, media({ x: area.x + (area.w - w) / 2, y: area.y, w, h })];
    if (p.caption) els.push(text(t, "caption", { x: area.x, y: area.y + h + 0.1, w: area.w, h: 0.3 }, p.caption, { role: "caption", align: "center" }));
    return [...els, ...footer(ctx)];
  },
});
