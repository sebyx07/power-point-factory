import { defineLayout } from "@/core/deck";
import { hline, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import { SLIDE } from "@/core/geometry";
import type { El } from "@/core/types";
import { enter, footer } from "./parts";

export interface AgendaProps {
  title?: string;
  /** 3–7 items; `"Title — detail"` splits into a bold title + muted detail */
  items: string[];
  /** 0-based index to highlight (use when revisiting the agenda between sections) */
  current?: number;
}

export const agenda = defineLayout<AgendaProps>({
  name: "agenda",
  render: (p, ctx) => {
    if (p.items.length < 2 || p.items.length > 7) throw new DeckSpecError(`agenda: ${p.items.length} items`, "use 2–7 items");
    const t = ctx.theme;
    const { marginX: mx, marginY: my } = t.space;
    const els: El[] = [text(t, "title", { x: mx, y: my + 0.3, w: 3.8, h: 2 }, p.title ?? "Agenda", { role: "title", size: t.type.title + 6 })];
    const x = 5.0;
    const w = SLIDE.w - mx - x;
    const top = my + 0.3;
    const rowH = Math.min(0.95, (SLIDE.h - 1.1 - top) / p.items.length);
    p.items.forEach((item, i) => {
      const y = top + i * rowH;
      const [head, detail] = item.split(/\s+—\s+/);
      const dim = p.current !== undefined && p.current !== i;
      const color = dim ? t.colors.muted : t.colors.text;
      els.push(hline(`rule-${i}`, x, y, w, t.colors.rule));
      els.push(
        text(t, `num-${i}`, { x, y: y + 0.16, w: 0.7, h: 0.4 }, String(i + 1).padStart(2, "0"), {
          role: "label",
          color: dim ? t.colors.muted : t.colors.accent,
          size: t.type.body,
        }),
      );
      const body = detail ? [`**${head}**`, detail] : [`**${head}**`];
      els.push(enter(t, text(t, `item-${i}`, { x: x + 0.85, y: y + 0.14, w: w - 0.85, h: rowH - 0.2 }, body.join("  ·  "), { color, minSize: 13 }), i + 1));
    });
    return [...els, ...footer(ctx)];
  },
});
