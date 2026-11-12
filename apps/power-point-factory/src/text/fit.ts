import type { TextEl } from "@/core/types";
import { fits, measure } from "./measure";

const BALANCED = new Set(["title", "subtitle", "quote", "statement"]);

/** Shrink to the largest size in [minSize, size] that fits; flag overflow if none does. */
export function fitText(el: TextEl): TextEl {
  for (let s = el.size; s >= el.minSize; s -= 0.5) {
    if (fits(el, s)) return balance({ ...el, size: s, overflow: false });
  }
  return { ...el, size: el.minSize, overflow: true };
}

/**
 * No widows on display text: if the last line holds one word, narrow the box (≤ 25%) until
 * the break moves a second word down without adding a line. Left-aligned boxes keep their x.
 */
export function balance(el: TextEl): TextEl {
  if (!BALANCED.has(el.role) || el.align !== "left") return el;
  const m = measure(el);
  if (m.lines < 2 || m.lastLineWords > 1) return el;
  for (let f = 0.97; f >= 0.75; f -= 0.03) {
    const trial = { ...el, box: { ...el.box, w: el.box.w * f } };
    const t = measure(trial);
    if (t.lines === m.lines && t.lastLineWords > 1 && fits(trial)) return trial;
  }
  return el;
}

/** Height (in) the text needs at its current size — for stacking blocks top-down. */
export function neededHeight(el: TextEl): number {
  return measure(el).heightPt / 72;
}
