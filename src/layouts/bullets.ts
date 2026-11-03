import { defineLayout } from "@/core/deck";
import { image, rounded, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import { columns } from "@/core/geometry";
import type { El, ImageSource } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface BulletsProps extends Heading {
  /** 2–6 points. Inline `**bold**` and `==accent==` supported. */
  bullets: string[];
  /** optional visual on the right ~40% */
  image?: ImageSource;
  imageAlt?: string;
  /** one-line callout at the bottom: the "so what" */
  takeaway?: string;
}

export const bullets = defineLayout<BulletsProps>({
  name: "bullets",
  chrome: true,
  render: (p, ctx) => {
    if (p.bullets.length === 0) throw new DeckSpecError("bullets: empty list", "add 2–6 bullets or use the quote/section layout");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const takeawayH = p.takeaway ? 0.85 : 0;
    const [left, right] = p.image ? columns(area, 2, t.space.gutter + 0.2, [1.45, 1]) : [area];
    if (!left) throw new DeckSpecError("bullets: layout failed");
    const listBox = { ...left, h: left.h - takeawayH - (p.takeaway ? 0.2 : 0) };
    const out: El[] = [...els];
    p.bullets.forEach((b, i) => {
      // one element per bullet → each one builds separately, gently
      const n = p.bullets.length;
      const gap = 0.12;
      const h = (listBox.h - gap * (n - 1)) / n;
      const y = listBox.y + i * (h + gap);
      const cap = Math.min(h, 1.25);
      out.push(enter(t, text(t, `bullet-${i}`, { x: listBox.x, y, w: listBox.w, h: cap }, b, { bullet: true, minSize: 14 }), i + 1));
    });
    if (right && p.image) out.push(enter(t, image("image", right, p.image, p.imageAlt ?? p.title), 1, "fade"));
    if (p.takeaway) {
      const b = { x: left.x, y: area.y + area.h - takeawayH, w: left.w, h: takeawayH };
      out.push(enter(t, rounded("takeaway-bg", b, t.colors.surface, t.radius), p.bullets.length + 1, "fade"));
      out.push(
        enter(
          t,
          text(t, "takeaway", { x: b.x + 0.3, y: b.y + 0.12, w: b.w - 0.6, h: b.h - 0.24 }, p.takeaway, { bold: true, valign: "middle", minSize: 13 }),
          p.bullets.length + 1,
          "fade",
        ),
      );
    }
    return [...out, ...footer(ctx)];
  },
});
