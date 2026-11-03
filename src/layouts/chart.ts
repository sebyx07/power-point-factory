import { defineLayout } from "@/core/deck";
import { chart as chartEl, rounded, text } from "@/core/el";
import { columns } from "@/core/geometry";
import type { ChartSpec, El } from "@/core/types";
import { contentBox, enter, footer, type Heading, source, titleBlock } from "./parts";

export interface ChartProps extends Heading {
  chart: ChartSpec;
  /** right-hand panel: what the chart means. 1–3 short points. */
  insights?: string[];
  insightsTitle?: string;
  source?: string;
}

/** Native, editable PowerPoint chart (not an image) + an insight panel. */
export const chart = defineLayout<ChartProps>({
  name: "chart",
  chrome: true,
  render: (p, ctx) => {
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const h = area.h - (p.source ? 0.35 : 0);
    const [left, right] = p.insights?.length ? columns({ ...area, h }, 2, t.space.gutter + 0.2, [2.1, 1]) : [{ ...area, h }];
    const out: El[] = [...els];
    if (left) out.push(enter(t, chartEl("chart", left, p.chart), 1, "wipe"));
    if (right && p.insights) {
      const pad = 0.32;
      out.push(enter(t, rounded("insight-bg", right, t.colors.surface, t.radius), 2, "fade"));
      out.push(
        enter(
          t,
          text(t, "insight-title", { x: right.x + pad, y: right.y + pad, w: right.w - 2 * pad, h: 0.32 }, p.insightsTitle ?? "What it means", {
            role: "eyebrow",
          }),
          2,
          "fade",
        ),
      );
      out.push(
        enter(
          t,
          text(t, "insights", { x: right.x + pad, y: right.y + pad + 0.5, w: right.w - 2 * pad, h: right.h - 2 * pad - 0.5 }, p.insights, {
            bullet: true,
            size: t.type.small + 1,
            minSize: 12,
          }),
          3,
        ),
      );
    }
    return [...out, ...source(ctx, p.source, area.y + h + 0.1), ...footer(ctx)];
  },
});
