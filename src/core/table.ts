import type { TableEl } from "./types";

/** cell padding (in) — renderer and QA share it so measured wrap == rendered wrap */
export const CELL_MARGIN: [number, number, number, number] = [0.04, 0.12, 0.04, 0.12];

/** column widths (in): `widths` weights, else first column 1.6× the rest */
export function columnWidths(el: TableEl): number[] {
  const n = el.table.header.length;
  const weights = el.table.widths ?? Array.from({ length: n }, (_, i) => (i === 0 ? 1.6 : 1));
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (el.box.w * w) / sum);
}
