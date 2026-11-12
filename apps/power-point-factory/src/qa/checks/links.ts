import type { Scene } from "@/core/types";
import { type Finding, f } from "../types";

/** every link is https or an in-range #slide:N */
export function links(scene: Scene): Finding[] {
  const out: Finding[] = [];
  const total = scene.slides.length;
  for (const s of scene.slides) {
    for (const el of s.elements) {
      if (el.kind !== "text") continue;
      for (const r of el.paragraphs.flatMap((p) => p.runs)) {
        if (!r.link) continue;
        const m = /^#slide:(\d+)$/.exec(r.link);
        if (m) {
          const n = Number(m[1]);
          if (n < 1 || n > total)
            out.push(
              f("error", "link", s.index, `"${r.text}" points to slide ${n}; deck has ${total}`, {
                el: el.id,
                fix: "fix the #slide:N target (slide numbers shift when you add files)",
              }),
            );
        } else if (!/^https:\/\/[^\s]+\.[^\s]+/.test(r.link) && !/^mailto:/.test(r.link)) {
          out.push(f("warn", "link", s.index, `"${r.text}" → ${r.link} is not https`, { el: el.id }));
        }
      }
    }
  }
  return out;
}
