import { SLIDE } from "@/core/geometry";
import { CELL_MARGIN, columnWidths } from "@/core/table";
import type { Scene } from "@/core/types";
import { cellText } from "@/render/cells";
import { lineHeightPt, textWidthPt } from "@/text/measure";
import { type Finding, f } from "../types";

/**
 * PowerPoint grows a row to fit wrapped cell text, so a long cell silently pushes the table
 * past the footer. Measure every cell against its column and re-total the height.
 */
export function tables(scene: Scene): Finding[] {
  const out: Finding[] = [];
  for (const s of scene.slides) {
    for (const el of s.elements) {
      if (el.kind !== "table") continue;
      const cols = columnWidths(el);
      const lh = lineHeightPt(el.font, el.size, 1) / 72;
      const pad = CELL_MARGIN[0] + CELL_MARGIN[2];
      const rows = [el.table.header, ...el.table.rows];
      let height = 0;
      let wrapped = 0;
      rows.forEach((r, ri) => {
        const lines = Math.max(
          ...r.map((c, ci) => {
            const avail = ((cols[ci] ?? 1) - CELL_MARGIN[1] - CELL_MARGIN[3]) * 72;
            const size = ri === 0 ? Math.max(el.size - 4, 10) : el.size;
            const w = textWidthPt(ri === 0 ? cellText(c).toUpperCase() : cellText(c), el.font, ri === 0 || ci === 0, size);
            return Math.max(1, Math.ceil(w / avail));
          }),
        );
        if (lines > 1) wrapped++;
        height += Math.max(ri === 0 ? Math.max(el.rowH * 0.8, 0.36) : el.rowH, lines * lh + pad);
      });
      const bottom = el.box.y + height;
      if (bottom > SLIDE.h - 0.6)
        out.push(
          f("error", "table-overflow", s.index, `table "${el.id}" grows to ${height.toFixed(2)}in with wrapped cells and runs into the footer`, {
            el: el.id,
            fix: "shorten cell text, widen that column (widths), or split the table",
          }),
        );
      else if (wrapped) out.push(f("info", "table-wrap", s.index, `${wrapped} table row(s) wrap`, { el: el.id, fix: "shorter labels keep rows even" }));
    }
  }
  return out;
}
