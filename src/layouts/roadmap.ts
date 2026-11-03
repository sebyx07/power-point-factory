import { mix } from "@/core/color";
import { defineLayout } from "@/core/deck";
import { hline, rect, rounded, text, vline } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import type { El, Hex } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface RoadmapBar {
  /** period index, fractional allowed: 0 = start of first period, 2.5 = middle of third */
  start: number;
  end: number;
  label?: string;
  status?: "done" | "active" | "planned" | "at-risk";
}
export interface RoadmapRow {
  label: string;
  bars: RoadmapBar[];
  /** milestone diamonds at period positions */
  milestones?: { at: number; label: string }[];
}
export interface RoadmapProps extends Heading {
  /** column headers: ["Q1 27", "Q2 27", …] */
  periods: string[];
  rows: RoadmapRow[];
  /** "today" line at a fractional period position */
  today?: number;
}

/** Gantt roadmap: workstreams × periods, status-colored bars, milestones, today line. */
export const roadmap = defineLayout<RoadmapProps>({
  name: "roadmap",
  chrome: true,
  render: (p, ctx) => {
    if (p.rows.length < 1 || p.rows.length > 8) throw new DeckSpecError(`roadmap: ${p.rows.length} rows`, "≤ 8 workstreams per slide");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const labelW = 2.6;
    const grid = { x: area.x + labelW, y: area.y + 0.45, w: area.w - labelW, h: area.h - 0.45 };
    const colW = grid.w / p.periods.length;
    const rowH = Math.min(0.78, grid.h / p.rows.length);
    const xOf = (v: number) => grid.x + v * colW;
    const statusColor = (s: RoadmapBar["status"]): Hex =>
      s === "done"
        ? mix(t.colors.text, t.colors.bg, 0.72)
        : s === "at-risk"
          ? t.colors.negative
          : s === "planned"
            ? mix(t.colors.accent, t.colors.bg, 0.18)
            : t.colors.accent;
    const out: El[] = [...els];
    p.periods.forEach((name, i) => {
      out.push(text(t, `period-${i}`, { x: xOf(i), y: area.y, w: colW, h: 0.3 }, name, { role: "eyebrow", align: "center", color: t.colors.muted }));
      if (i > 0) out.push(vline(`grid-${i}`, xOf(i), grid.y, rowH * p.rows.length, t.colors.rule, 0.5));
    });
    p.rows.forEach((r, ri) => {
      const y = grid.y + ri * rowH;
      const o = ri + 1;
      out.push(hline(`row-${ri}`, area.x, y, area.w, t.colors.rule, 0.5));
      out.push(
        text(t, `row-label-${ri}`, { x: area.x, y: y + 0.06, w: labelW - 0.2, h: rowH - 0.12 }, r.label, {
          role: "label",
          valign: "middle",
          size: t.type.small,
          minSize: 11,
        }),
      );
      r.bars.forEach((b, bi) => {
        const bx = { x: xOf(b.start) + 0.04, y: y + rowH * 0.22, w: xOf(b.end) - xOf(b.start) - 0.08, h: rowH * 0.56 };
        const fill = statusColor(b.status);
        out.push(enter(t, rounded(`bar-${ri}-${bi}`, bx, fill, Math.min(0.06, bx.h / 2)), o, "wipe"));
        if (b.label) {
          const fg = b.status === "planned" ? t.colors.text : t.colors.onAccent;
          out.push(
            enter(
              t,
              text(t, `bar-label-${ri}-${bi}`, { x: bx.x + 0.1, y: bx.y, w: Math.max(bx.w - 0.2, 0.3), h: bx.h }, b.label, {
                role: "caption",
                color: fg,
                bold: true,
                valign: "middle",
                size: t.type.caption,
                minSize: 8,
              }),
              o,
              "fade",
            ),
          );
        }
      });
      (r.milestones ?? []).forEach((m, mi) => {
        const d = 0.2;
        const cx = xOf(m.at);
        out.push(enter(t, { ...rect(`ms-${ri}-${mi}`, { x: cx - d / 2, y: y + rowH / 2 - d / 2, w: d, h: d }, t.colors.text), shape: "ellipse" }, o, "zoom"));
      });
    });
    out.push(hline("row-end", area.x, grid.y + rowH * p.rows.length, area.w, t.colors.rule, 0.5));
    if (p.today !== undefined) {
      out.push(vline("today", xOf(p.today), grid.y - 0.08, rowH * p.rows.length + 0.16, t.colors.negative, 1.25));
      out.push(
        text(t, "today-label", { x: xOf(p.today) - 0.6, y: grid.y + rowH * p.rows.length + 0.1, w: 1.2, h: 0.25 }, "Today", {
          role: "caption",
          align: "center",
          color: t.colors.negative,
          bold: true,
        }),
      );
    }
    return [...out, ...footer(ctx)];
  },
});
