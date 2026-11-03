import type { TextEl } from "@/core/types";
import { fits, lineHeightPt, measure } from "./measure";

/** Shrink to the largest size in [minSize, size] that fits; flag overflow if none does. */
export function fitText(el: TextEl): TextEl {
  for (let s = el.size; s >= el.minSize; s -= 0.5) {
    if (fits(el, s)) return { ...el, size: s, overflow: false };
  }
  return { ...el, size: el.minSize, overflow: true };
}

/** Height (in) the text needs at its current size — for stacking blocks top-down. */
export function neededHeight(el: TextEl): number {
  return measure(el).heightPt / 72;
}

/** Height (in) of n lines at a size — reserve space before content exists. */
export function linesHeight(face: string, size: number, lines: number, spacing: number): number {
  return (lineHeightPt(face, size, spacing) * lines) / 72;
}
