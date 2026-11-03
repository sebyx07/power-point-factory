import { defineLayout } from "@/core/deck";
import { rect, table as tableEl } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import type { El, TableSpec } from "@/core/types";
import { contentBox, enter, footer, type Heading, source, titleBlock } from "./parts";

export interface TableProps extends Heading {
  table: TableSpec;
  source?: string;
}

/** Native PowerPoint table. ≤ 8 body rows — more belongs in an appendix. */
export const table = defineLayout<TableProps>({
  name: "table",
  chrome: true,
  render: (p, ctx) => {
    const t = ctx.theme;
    const bad = p.table.rows.find((r) => r.length !== p.table.header.length);
    if (bad) throw new DeckSpecError(`table: row has ${bad.length} cells, header has ${p.table.header.length}`, "every row needs one cell per header column");
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const rows = p.table.rows.length;
    const size = rows > 7 ? t.type.small - 1 : rows > 5 ? t.type.small : t.type.small + 1;
    const base = tableEl(t, "table", { ...area, h: 0 }, p.table, size);
    const headH = Math.max(base.rowH * 0.8, 0.36);
    const avail = area.h - (p.source ? 0.45 : 0) - headH;
    const rowH = Math.min(0.62, Math.max(base.rowH, (avail * 0.85) / rows));
    const el = { ...base, rowH };
    const tableH = headH + rows * rowH;
    const out: El[] = [...els, enter(t, { ...el, box: { ...area, h: tableH } }, 1, "fade")];
    if (p.table.highlight !== undefined) {
      const y = area.y + headH + p.table.highlight * rowH;
      out.push(enter(t, rect("highlight-bar", { x: area.x - 0.14, y: y + 0.06, w: 0.06, h: rowH - 0.12 }, t.colors.accent), 1, "fade"));
    }
    return [...out, ...source(ctx, p.source, area.y + tableH + 0.15), ...footer(ctx)];
  },
});
