import { defineLayout } from "@/core/deck";
import { hline, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import type { El } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface SummaryRow {
  /** the bold lead: a full-sentence claim */
  lead: string;
  /** one or two lines of support; cite the slide that proves it */
  support?: string;
}
export interface SummaryProps extends Heading {
  /** 3–5 rows; each maps to a section later in the deck */
  rows: SummaryRow[];
}

/** Consulting executive summary: numbered claim rows, hairline separated. Slide 2 of every serious deck. */
export const summary = defineLayout<SummaryProps>({
  name: "summary",
  chrome: true,
  render: (p, ctx) => {
    const n = p.rows.length;
    if (n < 2 || n > 5) throw new DeckSpecError(`summary: ${n} rows`, "use 3–5 rows — one per section");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const rowH = area.h / n;
    const out: El[] = [...els];
    p.rows.forEach((r, i) => {
      const y = area.y + i * rowH;
      const o = i + 1;
      out.push(hline(`rule-${i}`, area.x, y, area.w, t.colors.rule));
      out.push(enter(t, text(t, `n-${i}`, { x: area.x, y: y + 0.14, w: 0.6, h: 0.4 }, String(i + 1), { role: "metric", size: 22, minSize: 18 }), o));
      out.push(
        enter(
          t,
          text(t, `lead-${i}`, { x: area.x + 0.75, y: y + 0.14, w: area.w * 0.48, h: rowH - 0.24 }, r.lead, { bold: true, size: t.type.body - 1, minSize: 13 }),
          o,
        ),
      );
      if (r.support) {
        const x = area.x + 0.75 + area.w * 0.48 + 0.4;
        out.push(
          enter(
            t,
            text(t, `support-${i}`, { x, y: y + 0.16, w: area.x + area.w - x, h: rowH - 0.26 }, r.support, {
              size: t.type.small,
              minSize: 11,
              color: t.colors.muted,
            }),
            o,
          ),
        );
      }
    });
    return [...out, ...footer(ctx)];
  },
});
