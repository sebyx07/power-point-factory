import type PptxGenJS from "pptxgenjs";
import { bare, mix } from "@/core/color";
import type { Align, Cell, TableEl } from "@/core/types";
import type { Theme } from "@/theme/types";
import { cellRuns } from "./cells";

const isNumeric = (v: Cell) => typeof v === "number" || (typeof v === "string" && /^[\s$€£+\-−(]*[\d.,]+\)?\s*[%kKMBx×]?$/.test(v));
const isGlyph = (v: Cell) => typeof v === "object" && "harvey" in v;

/** Header in bold on a hairline, zebra-free body, right-aligned numbers, optional highlight/total row. */
export function addTable(slide: PptxGenJS.Slide, el: TableEl, t: Theme): void {
  const s = el.table;
  const n = s.header.length;
  const align: Align[] =
    s.align ?? s.header.map((_, ci) => (s.rows.every((r) => isNumeric(r[ci] ?? "")) ? "right" : s.rows.every((r) => isGlyph(r[ci] ?? "")) ? "center" : "left"));
  const rule = bare(t.colors.rule);
  const none = { type: "none" as const };
  type Borders = [PptxGenJS.BorderProps, PptxGenJS.BorderProps, PptxGenJS.BorderProps, PptxGenJS.BorderProps];
  const border = (bottom: string, pt = 0.75): Borders => [none, none, { type: "solid", color: bottom, pt }, none];
  const margin: [number, number, number, number] = [0.04, 0.12, 0.04, 0.12];
  const header: PptxGenJS.TableCell[] = s.header.map((h, ci) => ({
    text: h.toUpperCase(),
    options: {
      bold: true,
      color: bare(t.colors.muted),
      align: align[ci] ?? "left",
      valign: "bottom",
      border: border(bare(t.colors.text), 1.5),
      margin,
      fontSize: Math.max(el.size - 4, 10),
    },
  }));
  const body: PptxGenJS.TableCell[][] = s.rows.map((r, ri) => {
    const hi = ri === s.highlight;
    const total = s.total && ri === s.rows.length - 1;
    return r.map((v, ci) => ({
      text: cellRuns(v, t),
      options: {
        bold: hi || total || ci === 0,
        color: bare(hi ? t.colors.accent : t.colors.text),
        align: align[ci] ?? "left",
        border: total
          ? ([{ type: "solid", color: bare(t.colors.text), pt: 1.25 }, none, none, none] as Borders)
          : ri === s.rows.length - 2 && s.total
            ? ([none, none, none, none] as Borders)
            : border(rule, 0.5),
        margin,
        ...(hi ? { fill: { color: bare(mix(t.colors.accent, t.colors.bg, 0.07)) } } : {}),
        ...(total ? { fill: { color: bare(t.colors.surface) } } : {}),
      },
    }));
  });
  const weights = s.widths ?? Array.from({ length: n }, (_, i) => (i === 0 ? 1.6 : 1));
  const sum = weights.reduce((a, b) => a + b, 0);
  slide.addTable([header, ...body], {
    x: el.box.x,
    y: el.box.y,
    w: el.box.w,
    colW: weights.map((w) => (el.box.w * w) / sum),
    rowH: [Math.max(el.rowH * 0.8, 0.36), ...body.map(() => el.rowH)],
    fontFace: el.font,
    fontSize: el.size,
    color: bare(t.colors.text),
    valign: "middle",
    autoPage: false,
    objectName: el.id,
  });
}
