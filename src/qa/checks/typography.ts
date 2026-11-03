import type { Scene } from "@/core/types";
import { SAFE_FONTS } from "@/text/fonts";
import { plain } from "@/text/inline";
import { measure } from "@/text/measure";
import { type Finding, f } from "../types";

const MIN: Record<string, number> = { title: 20, subtitle: 13, body: 12, label: 11, eyebrow: 10, metric: 24, quote: 18, caption: 9, chrome: 9, data: 10 };

/** text fits its box (re-measured), sizes stay readable, fonts are Office-safe */
export function typography(scene: Scene): Finding[] {
  const out: Finding[] = [];
  for (const s of scene.slides) {
    for (const el of s.elements) {
      if (el.kind === "table" && el.size < (MIN.data ?? 10))
        out.push(f("warn", "min-size", s.index, `table text ${el.size}pt`, { el: el.id, fix: "fewer rows/columns" }));
      if (el.kind !== "text") continue;
      if (!SAFE_FONTS[el.font])
        out.push(f("error", "font", s.index, `"${el.font}" is not Office-safe`, { el: el.id, fix: `use ${Object.keys(SAFE_FONTS).join("/")}` }));
      const m = measure(el);
      const txt = plain(el.paragraphs).slice(0, 50);
      if (el.overflow || m.heightPt > el.box.h * 72 + 0.5) {
        out.push(
          f(
            "error",
            "text-overflow",
            s.index,
            `"${el.id}" overflows its box even at ${el.size}pt (needs ${(m.heightPt / 72).toFixed(2)}in of ${el.box.h.toFixed(2)}in): "${txt}…"`,
            { el: el.id, fix: "cut words — target the copy limits in docs/deck-craft.md" },
          ),
        );
      } else if (m.widestWordRatio > 1) {
        out.push(f("error", "text-overflow", s.index, `a word in "${el.id}" is wider than its box`, { el: el.id, fix: "shorten the word or widen the box" }));
      }
      const floor = MIN[el.role] ?? 14;
      if (el.size < floor && el.size < el.minSize + 4)
        out.push(
          f("warn", "min-size", s.index, `"${el.id}" auto-shrank to ${el.size}pt (< ${floor}pt for ${el.role})`, {
            el: el.id,
            fix: "too much text — cut it rather than shrink",
          }),
        );
      if (el.role === "title" && m.lines > 2)
        out.push(f("warn", "title-lines", s.index, `title wraps to ${m.lines} lines`, { el: el.id, fix: "≤ 2 lines: a sharp assertion, not a paragraph" }));
    }
  }
  return out;
}
