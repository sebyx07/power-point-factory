import type { Scene } from "@/core/types";
import { type Finding, f } from "../types";

/** placeholders left in, and photos too low-res for their box */
export function images(scene: Scene): Finding[] {
  const out: Finding[] = [];
  for (const s of scene.slides) {
    for (const el of s.elements) {
      if (el.kind === "media" && el.resolved?.placeholder) {
        out.push(f("warn", "media-placeholder", s.index, `${el.media} "${el.id}" is a placeholder (no KUBEEZ_API_KEY)`, { el: el.id }));
        continue;
      }
      if (el.kind !== "image" || !el.resolved) continue;
      if (el.resolved.placeholder) {
        out.push(
          f("warn", "image-placeholder", s.index, `"${el.id}" is a placeholder (no KUBEEZ_API_KEY)`, {
            el: el.id,
            fix: "set KUBEEZ_API_KEY in .env and rebuild, or use { file: 'assets/…' }",
          }),
        );
        continue;
      }
      if (el.resolved.origin.startsWith("icon:")) continue;
      const ppi = Math.min(el.resolved.srcW / el.box.w, el.resolved.srcH / el.box.h);
      if (ppi < 110)
        out.push(
          f("warn", "image-resolution", s.index, `"${el.id}" source is ${Math.round(ppi)} ppi at this size`, {
            el: el.id,
            fix: "use a larger source (≥ 150 ppi) or a smaller box",
          }),
        );
      if (!el.alt.trim()) out.push(f("warn", "alt-text", s.index, `"${el.id}" has no alt text`, { el: el.id }));
    }
  }
  return out;
}
