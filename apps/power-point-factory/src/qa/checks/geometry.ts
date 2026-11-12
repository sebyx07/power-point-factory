import { area, contains, intersect } from "@/core/geometry";
import type { Scene } from "@/core/types";
import type { Theme } from "@/theme/types";
import { type Finding, f } from "../types";

/** inside the slide; text inside the safe margin; no colliding text/data */
export function geometry(scene: Scene, t: Theme): Finding[] {
  const out: Finding[] = [];
  const slide = { x: 0, y: 0, w: scene.size.w, h: scene.size.h };
  const safe = { x: t.space.marginX - 0.15, y: 0.25, w: scene.size.w - 2 * (t.space.marginX - 0.15), h: scene.size.h - 0.35 };
  for (const s of scene.slides) {
    for (const el of s.elements) {
      if (!el.bleed && !contains(slide, el.box))
        out.push(f("error", "bounds", s.index, `"${el.id}" extends past the slide edge`, { el: el.id, fix: "shrink/move the box or mark it bleed" }));
      if (el.kind === "text" && !contains(safe, el.box))
        out.push(f("warn", "safe-margin", s.index, `text "${el.id}" sits outside the safe margin`, { el: el.id, fix: "keep text ≥ marginX from the edges" }));
    }
    const solid = s.elements.filter((e) => e.kind === "text" || e.kind === "chart" || e.kind === "table");
    for (let i = 0; i < solid.length; i++) {
      for (let j = i + 1; j < solid.length; j++) {
        const a = solid[i];
        const b = solid[j];
        if (!a || !b) continue;
        const hit = intersect(a.box, b.box);
        if (hit && area(hit) > 0.02)
          out.push(
            f("error", "overlap", s.index, `"${a.id}" overlaps "${b.id}" (${area(hit).toFixed(2)} in²)`, {
              el: b.id,
              fix: "content too long for the layout — cut copy or split the slide",
            }),
          );
      }
    }
  }
  return out;
}
