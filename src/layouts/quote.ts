import { defineLayout } from "@/core/deck";
import { image, text } from "@/core/el";
import type { El, ImageSource } from "@/core/types";
import { enter, footer } from "./parts";

export interface QuoteProps {
  quote: string;
  name: string;
  role?: string;
  portrait?: ImageSource;
}

export const quote = defineLayout<QuoteProps>({
  name: "quote",
  render: (p, ctx) => {
    const t = ctx.theme;
    const mx = t.space.marginX + 0.6;
    const w = p.portrait ? 7.6 : 10.2;
    const els: El[] = [
      text(t, "mark", { x: mx - 0.1, y: 0.4, w: 1.5, h: 1.65 }, "“", { role: "metric", size: 96, minSize: 96 }),
      enter(t, text(t, "quote", { x: mx, y: 2.1, w, h: 3.15 }, p.quote, { role: "quote", size: t.type.title, minSize: 20 }), 1),
      enter(t, text(t, "name", { x: mx, y: 5.45, w, h: 0.36 }, p.name, { role: "label", size: t.type.body }), 2),
    ];
    if (p.role) els.push(enter(t, text(t, "role", { x: mx, y: 5.83, w, h: 0.32 }, p.role, { role: "caption", size: t.type.small }), 2));
    if (p.portrait) els.push(enter(t, image("portrait", { x: 9.55, y: 1.6, w: 3.0, h: 3.9 }, p.portrait, p.name), 1, "fade"));
    return [...els, ...footer(ctx)];
  },
});
