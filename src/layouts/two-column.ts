import { defineLayout } from "@/core/deck";
import { image, text, vline } from "@/core/el";
import { columns } from "@/core/geometry";
import type { El } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface Column {
  heading: string;
  /** a paragraph (string) or bullet points (string[]) */
  body: string | string[];
  icon?: string;
}
export interface TwoColumnProps extends Heading {
  left: Column;
  right: Column;
  /** "vs" draws a divider and frames it as a comparison */
  mode?: "compare" | "plain";
}

export const twoColumn = defineLayout<TwoColumnProps>({
  name: "twoColumn",
  chrome: true,
  render: (p, ctx) => {
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const gutter = 0.9;
    const cols = columns(area, 2, gutter);
    const out: El[] = [...els];
    [p.left, p.right].forEach((c, i) => {
      const b = cols[i];
      if (!b) return;
      let y = b.y;
      if (c.icon) {
        out.push(enter(t, image(`icon-${i}`, { x: b.x, y, w: 0.5, h: 0.5 }, { icon: c.icon, color: t.colors.accent }, c.heading, "contain"), i + 1));
        y += 0.68;
      }
      out.push(enter(t, text(t, `heading-${i}`, { x: b.x, y, w: b.w, h: 0.5 }, c.heading, { role: "label", size: t.type.subtitle + 2 }), i + 1));
      y += 0.62;
      const isList = Array.isArray(c.body);
      out.push(enter(t, text(t, `body-${i}`, { x: b.x, y, w: b.w, h: b.y + b.h - y }, c.body, { bullet: isList, minSize: 13 }), i + 1));
    });
    if (p.mode !== "plain") out.push(vline("divider", area.x + area.w / 2, area.y, area.h * 0.92, t.colors.rule));
    return [...out, ...footer(ctx)];
  },
});
