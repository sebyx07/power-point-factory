import { defineLayout } from "@/core/deck";
import { hline, rect, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import type { El } from "@/core/types";
import { contentBox, enter, footer, type Heading, source, titleBlock } from "./parts";

export interface WaterfallStep {
  label: string;
  /** start/end: absolute value · steps: signed delta */
  value: number;
  /** "total" draws an absolute bar (start, subtotal, end) */
  total?: boolean;
}
export interface WaterfallProps extends Heading {
  steps: WaterfallStep[];
  /** "$", "M", 1 → $4.2M */
  prefix?: string;
  suffix?: string;
  decimals?: number;
  source?: string;
}

/** Bridge chart drawn as native shapes: exact geometry, labels on every bar, editable in PowerPoint. */
export const waterfall = defineLayout<WaterfallProps>({
  name: "waterfall",
  render: (p, ctx) => {
    if (p.steps.length < 3 || p.steps.length > 12) throw new DeckSpecError(`waterfall: ${p.steps.length} steps`, "use 3–12 steps (start, deltas…, end)");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop + 0.1);
    const plot = { x: area.x, y: area.y + 0.4, w: area.w, h: area.h - 0.4 - 0.55 - (p.source ? 0.3 : 0) };
    const fmt = (v: number, signed: boolean) =>
      `${signed && v > 0 ? "+" : v < 0 ? "−" : ""}${p.prefix ?? ""}${Math.abs(v).toFixed(p.decimals ?? 0)}${p.suffix ?? ""}`;

    let run = 0;
    const bars = p.steps.map((s) => {
      if (s.total) {
        run = s.value;
        return { ...s, lo: Math.min(0, s.value), hi: Math.max(0, s.value), end: s.value };
      }
      const from = run;
      run += s.value;
      return { ...s, lo: Math.min(from, run), hi: Math.max(from, run), end: run };
    });
    const min = Math.min(0, ...bars.map((b) => b.lo));
    const max = Math.max(...bars.map((b) => b.hi));
    const yOf = (v: number) => plot.y + plot.h - ((v - min) / (max - min || 1)) * plot.h;
    const colW = plot.w / bars.length;
    const barW = colW * 0.58;
    const out: El[] = [...els, hline("axis", plot.x, yOf(0), plot.w, t.colors.rule, 1)];

    bars.forEach((b, i) => {
      const x = plot.x + i * colW + (colW - barW) / 2;
      const top = yOf(b.hi);
      const h = Math.max(yOf(b.lo) - top, 0.02);
      const color = b.total ? t.colors.text : b.value >= 0 ? t.colors.positive : t.colors.negative;
      const o = i + 1;
      out.push(enter(t, rect(`bar-${i}`, { x, y: top, w: barW, h }, color), o, "fade"));
      out.push(
        enter(
          t,
          text(t, `val-${i}`, { x: x - 0.2, y: top - 0.34, w: barW + 0.4, h: 0.3 }, fmt(b.value, !b.total), {
            role: "label",
            align: "center",
            size: t.type.small,
            minSize: 10,
          }),
          o,
          "fade",
        ),
      );
      out.push(
        text(t, `cat-${i}`, { x: plot.x + i * colW, y: plot.y + plot.h + 0.1, w: colW, h: 0.45 }, b.label, {
          role: "caption",
          align: "center",
          size: t.type.caption + 1,
          minSize: 9,
        }),
      );
      const next = bars[i + 1];
      if (next && !next.total) out.push(hline(`conn-${i}`, x + barW, yOf(b.end), colW - barW, t.colors.muted, 0.5));
    });
    return [...out, ...source(ctx, p.source, area.y + area.h - 0.25), ...footer(ctx)];
  },
});
