import type { Scene } from "@/core/types";
import { plain } from "@/text/inline";
import { type Finding, f } from "../types";

/** "(slide 17)", "slides 6–7", "see slide 12" in copy or notes must point inside the deck */
export function references(scene: Scene): Finding[] {
  const out: Finding[] = [];
  const total = scene.slides.length;
  const RE = /\bslides?\s+(\d+)(?:\s*[–-]\s*(\d+))?/gi;
  for (const s of scene.slides) {
    const texts = [...s.elements.flatMap((e) => (e.kind === "text" ? [plain(e.paragraphs)] : [])), s.notes ?? ""];
    for (const t of texts) {
      for (const m of t.matchAll(RE)) {
        const nums = [Number(m[1]), ...(m[2] ? [Number(m[2])] : [])];
        const bad = nums.find((n) => n < 1 || n > total);
        if (bad !== undefined)
          out.push(
            f("error", "slide-ref", s.index, `"${m[0]}" points past the deck (${total} slides)`, {
              fix: "slide numbers shift when files are added/removed — update the reference",
            }),
          );
        else if (nums.includes(s.index)) out.push(f("warn", "slide-ref", s.index, `"${m[0]}" refers to itself`, { fix: "check the number after reordering" }));
      }
    }
  }
  return out;
}
