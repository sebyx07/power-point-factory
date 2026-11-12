import { mix } from "@/core/color";
import { defineLayout } from "@/core/deck";
import { hline, rect, rounded, text, vline } from "@/core/el";
import { columns, contains, inset, intersect } from "@/core/geometry";
import type { Box, El } from "@/core/types";
import { textWidthPt } from "@/text/measure";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface MatrixItem {
  label: string;
  /** 0..1 along each axis */
  x: number;
  y: number;
  /** 0..1 relative bubble size */
  size?: number;
  highlight?: boolean;
}
export type Quadrant = "tl" | "tr" | "bl" | "br";
export interface MatrixProps extends Heading {
  x: { label: string; low?: string; high?: string };
  y: { label: string; low?: string; high?: string };
  /** names, in order: top-left, top-right, bottom-left, bottom-right */
  quadrants?: [string, string, string, string];
  /** the quadrant that is the answer — tinted */
  target?: Quadrant;
  items: MatrixItem[];
  insights?: string[];
  /** what bubble size means, e.g. "Bubble size = 3-year profit impact" */
  sizeLegend?: string;
}

const LABEL_H = 0.28;

/** first slot hugging the bubble (preferred side, other side, above, below, small nudges) that collides with nothing */
function placeLabel(
  cx: number,
  cy: number,
  d: number,
  w: number,
  preferRight: boolean,
  taken: Box[],
  grid: Box,
): { box: Box; align: "left" | "right" | "center" } {
  const r = { x: cx + d / 2 + 0.06, y: cy - LABEL_H / 2, w, h: LABEL_H };
  const l = { x: cx - d / 2 - 0.06 - w, y: cy - LABEL_H / 2, w, h: LABEL_H };
  const up = { x: cx - w / 2, y: cy - d / 2 - LABEL_H - 0.02, w, h: LABEL_H };
  const down = { x: cx - w / 2, y: cy + d / 2 + 0.02, w, h: LABEL_H };
  const sides: [Box, "left" | "right" | "center"][] = preferRight
    ? [
        [r, "left"],
        [l, "right"],
      ]
    : [
        [l, "right"],
        [r, "left"],
      ];
  const candidates: [Box, "left" | "right" | "center"][] = [...sides, [up, "center"], [down, "center"]];
  for (const dy of [0, -0.14, 0.14]) {
    for (const [b, align] of candidates) {
      const box = { ...b, y: b.y + dy };
      if (contains(grid, box) && !taken.some((x) => intersect(x, box))) return { box, align };
    }
  }
  return { box: r, align: "left" };
}

/** 2×2 prioritization / positioning matrix with plotted bubbles. */
export const matrix = defineLayout<MatrixProps>({
  name: "matrix",
  render: (p, ctx) => {
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const [left, right] = p.insights?.length ? columns(area, 2, t.space.gutter + 0.3, [1.6, 1]) : [area];
    if (!left) return els;
    const g = { x: left.x + 0.35, y: left.y + 0.35, w: left.w - 0.35, h: left.h - 0.8 };
    const half = { w: g.w / 2, h: g.h / 2 };
    const out: El[] = [...els];
    const quads: [Quadrant, number, number][] = [
      ["tl", 0, 0],
      ["tr", 1, 0],
      ["bl", 0, 1],
      ["br", 1, 1],
    ];
    quads.forEach(([q, cx, cy], i) => {
      const b = { x: g.x + cx * half.w, y: g.y + cy * half.h, w: half.w, h: half.h };
      const tint = p.target === q ? mix(t.colors.accent, t.colors.bg, 0.1) : t.colors.surface;
      out.push(rect(`quad-${q}`, b, tint));
      const name = p.quadrants?.[i];
      // top row names sit at the top edge, bottom row at the bottom edge — away from the centre where items cluster
      if (name)
        out.push(
          // plain bold label, no tracked caps: reads calmer and copies cleanly out of the PDF
          text(t, `qname-${q}`, { x: b.x + 0.18, y: cy ? b.y + b.h - 0.42 : b.y + 0.14, w: b.w - 0.36, h: 0.28 }, name, {
            role: "label",
            size: t.type.caption + 1,
            color: p.target === q ? t.colors.accent : t.colors.muted,
            align: cx ? "right" : "left",
          }),
        );
    });
    out.push(hline("mid-x", g.x, g.y + half.h, g.w, t.colors.bg, 2), vline("mid-y", g.x + half.w, g.y, g.h, t.colors.bg, 2));
    out.push(
      text(t, "x-label", { x: g.x, y: g.y + g.h + 0.1, w: g.w, h: 0.3 }, `${p.x.low ?? "Low"}  ←  ${p.x.label}  →  ${p.x.high ?? "High"}`, {
        role: "caption",
        align: "center",
        size: t.type.small - 1,
      }),
    );
    out.push(text(t, "y-label", { x: g.x, y: left.y, w: g.w / 2, h: 0.28 }, `↑  ${p.y.label}`, { role: "caption", size: t.type.small - 1 }));
    const taken: Box[] = out.filter((e) => e.id.startsWith("qname-")).map((e) => e.box);
    p.items.forEach((it, i) => {
      const d = 0.16 + (it.size ?? 0.4) * 0.34;
      const cx = g.x + it.x * g.w;
      const cy = g.y + (1 - it.y) * g.h;
      const fill = it.highlight ? t.colors.accent : mix(t.colors.text, t.colors.bg, 0.45);
      const dot = { x: cx - d / 2, y: cy - d / 2, w: d, h: d };
      out.push(enter(t, { ...rect(`dot-${i}`, dot, fill), shape: "ellipse" }, i + 1, "zoom"));
      taken.push(dot);
      const size = t.type.caption + 1;
      const w = textWidthPt(it.label, t.fonts.body, it.highlight ?? false, size) / 72 + 0.12;
      const label = placeLabel(cx, cy, d, w, it.x < 0.78, taken, g);
      taken.push(label.box);
      out.push(
        enter(
          t,
          text(t, `item-${i}`, label.box, it.label, {
            size,
            minSize: 10,
            align: label.align,
            bold: it.highlight ?? false,
            color: it.highlight ? t.colors.accent : t.colors.text,
          }),
          i + 1,
        ),
      );
    });
    if (right && p.insights) {
      // same insight card as the chart layout → one visual language across data slides
      out.push(enter(t, rounded("insight-bg", right, t.colors.surface, t.radius), p.items.length + 1, "fade"));
      out.push(enter(t, text(t, "insights", inset(right, 0.32), p.insights, { bullet: true, size: t.type.small + 1, minSize: 12 }), p.items.length + 1));
    }
    return [...out, ...footer(ctx)];
  },
});
