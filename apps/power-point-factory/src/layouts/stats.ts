import { defineLayout } from "@/core/deck";
import { rounded, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import { columns } from "@/core/geometry";
import type { El } from "@/core/types";
import { contentBox, enter, footer, type Heading, source, titleBlock } from "./parts";

export interface Stat {
  /** the number, formatted: "$4.2M", "38%", "1,204" */
  value: string;
  label: string;
  /** "+12% YoY" — sign decides color */
  delta?: string;
  detail?: string;
}
export interface StatsProps extends Heading {
  stats: Stat[];
  source?: string;
}

export const stats = defineLayout<StatsProps>({
  name: "stats",
  render: (p, ctx) => {
    const n = p.stats.length;
    if (n < 1 || n > 4) throw new DeckSpecError(`stats: ${n} tiles`, "use 1–4 stats; split the rest onto another slide");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop + 0.15);
    // tiles sized to their content (no dead space at the bottom), capped by the area
    const need = Math.max(...p.stats.map((s) => 0.35 * 2 + 1.15 + 0.62 + (s.delta ? 0.4 : 0) + (s.detail ? 0.45 : 0)));
    const tileH = Math.min(need, area.h - (p.source ? 0.4 : 0));
    const tiles = columns({ ...area, h: tileH }, n, t.space.gutter);
    const out: El[] = [...els];
    p.stats.forEach((s, i) => {
      const b = tiles[i];
      if (!b) return;
      const pad = 0.35;
      const iw = b.w - 2 * pad;
      const o = i + 1;
      out.push(enter(t, rounded(`tile-${i}`, b, t.colors.surface, t.radius), o, "fade"));
      out.push(
        enter(
          t,
          text(t, `value-${i}`, { x: b.x + pad, y: b.y + pad, w: iw, h: 1.05 }, s.value, { role: "metric", size: n > 3 ? t.type.metric - 10 : t.type.metric }),
          o,
        ),
      );
      out.push(
        enter(
          t,
          text(t, `label-${i}`, { x: b.x + pad, y: b.y + pad + 1.15, w: iw, h: 0.62 }, s.label, { role: "label", size: t.type.body - 1, minSize: 12 }),
          o,
        ),
      );
      let y = b.y + pad + 1.85;
      if (s.delta) {
        const neg = /^[-−▼]/.test(s.delta.trim());
        out.push(
          enter(
            t,
            text(t, `delta-${i}`, { x: b.x + pad, y, w: iw, h: 0.32 }, s.delta, {
              role: "label",
              color: neg ? t.colors.negative : t.colors.positive,
              size: t.type.small,
            }),
            o,
          ),
        );
        y += 0.4;
      }
      if (s.detail)
        out.push(
          enter(
            t,
            text(t, `detail-${i}`, { x: b.x + pad, y, w: iw, h: b.y + b.h - pad - y }, s.detail, { role: "caption", size: t.type.small - 1, minSize: 10 }),
            o,
          ),
        );
    });
    return [...out, ...source(ctx, p.source, area.y + tileH + 0.2), ...footer(ctx)];
  },
});
