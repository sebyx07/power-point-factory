import { mix } from "@/core/color";
import { defineLayout } from "@/core/deck";
import { hline, rect, rounded, text, vline } from "@/core/el";
import { columns, contains, inset, intersect } from "@/core/geometry";
import type { Box, El } from "@/core/types";
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
}

const LABEL = { w: 2.1, h: 0.28 };

/** first label slot (preferred side, other side, then nudged up/down) that collides with nothing placed so far */
function placeLabel(cx: number, cy: number, d: number, preferRight: boolean, taken: Box[], grid: Box): { box: Box; right: boolean } {
  const sides = preferRight ? [true, false] : [false, true];
  for (const dy of [0, -0.32, 0.32, -0.62, 0.62]) {
    for (const right of sides) {
      const box = { x: right ? cx + d / 2 + 0.08 : cx - d / 2 - 0.08 - LABEL.w, y: cy - LABEL.h / 2 + dy, w: LABEL.w, h: LABEL.h };
      if (contains(grid, box) && !taken.some((b) => intersect(b, box))) return { box, right };
    }
  }
  return { box: { x: cx + d / 2 + 0.08, y: cy - LABEL.h / 2, w: LABEL.w, h: LABEL.h }, right: true };
}

/** 2×2 prioritization / positioning matrix with plotted bubbles. */
export const matrix = defineLayout<MatrixProps>({
  name: "matrix",
  chrome: true,
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
          text(t, `qname-${q}`, { x: b.x + 0.15, y: cy ? b.y + b.h - 0.38 : b.y + 0.12, w: b.w - 0.3, h: 0.26 }, name, {
            role: "eyebrow",
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
      const label = placeLabel(cx, cy, d, it.x < 0.78, taken, g);
      taken.push(label.box);
      out.push(
        enter(
          t,
          text(t, `item-${i}`, label.box, it.label, {
            role: "label",
            size: t.type.caption + 2,
            minSize: 10,
            align: label.right ? "left" : "right",
            ...(it.highlight ? { color: t.colors.accent } : {}),
          }),
          i + 1,
        ),
      );
    });
    if (right && p.insights)
      out.push(enter(t, text(t, "insights", right, p.insights, { bullet: true, size: t.type.small + 1, minSize: 12 }), p.items.length + 1));
    return [...out, ...footer(ctx)];
  },
});
