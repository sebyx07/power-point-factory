import { defineLayout } from "@/core/deck";
import { image, rounded, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import { columns } from "@/core/geometry";
import type { El } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface Card {
  /** lucide icon name, e.g. "shield-check", "rocket", "users" (https://lucide.dev/icons) */
  icon?: string;
  title: string;
  body: string;
}
export interface CardsProps extends Heading {
  cards: Card[];
}

export const cards = defineLayout<CardsProps>({
  name: "cards",
  chrome: true,
  render: (p, ctx) => {
    const n = p.cards.length;
    if (n < 2 || n > 4) throw new DeckSpecError(`cards: ${n} cards`, "use 2–4 cards");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop + 0.1);
    const cols = columns({ ...area, h: Math.min(area.h, 3.9) }, n, t.space.gutter);
    const out: El[] = [...els];
    p.cards.forEach((c, i) => {
      const b = cols[i];
      if (!b) return;
      const pad = 0.32;
      const iw = b.w - 2 * pad;
      let y = b.y + pad;
      out.push(enter(t, rounded(`card-${i}`, b, t.colors.surface, t.radius), i + 1, "fade"));
      if (c.icon) {
        out.push(enter(t, image(`icon-${i}`, { x: b.x + pad, y, w: 0.52, h: 0.52 }, { icon: c.icon, color: t.colors.accent }, c.title, "contain"), i + 1));
        y += 0.78;
      }
      out.push(enter(t, text(t, `card-title-${i}`, { x: b.x + pad, y, w: iw, h: 0.75 }, c.title, { role: "label", size: t.type.body, minSize: 13 }), i + 1));
      y += 0.82;
      out.push(
        enter(
          t,
          text(t, `card-body-${i}`, { x: b.x + pad, y, w: iw, h: b.y + b.h - pad - y }, c.body, { size: t.type.small, minSize: 11, color: t.colors.muted }),
          i + 1,
        ),
      );
    });
    return [...out, ...footer(ctx)];
  },
});
