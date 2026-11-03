import { contrast, mix } from "@/core/color";
import { area, intersect } from "@/core/geometry";
import type { Hex, Scene, SceneSlide, TextEl } from "@/core/types";
import { type Finding, f } from "../types";

/** what is painted under a text box: walk lower z-order, blend translucent fills */
export function backdrop(s: SceneSlide, el: TextEl): { colors: Hex[]; overImage: boolean } {
  const idx = s.elements.indexOf(el);
  let colors: Hex[] = [s.background];
  let overImage = false;
  for (const under of s.elements.slice(0, idx)) {
    const hit = intersect(under.box, el.box);
    if (!hit || area(hit) < area(el.box) * 0.5) continue;
    if (under.kind === "image" && under.role === "media" && under.fit === "cover") {
      // unknown pixels: assume worst case of black and white
      colors = ["#000000", "#FFFFFF"];
      overImage = true;
    }
    if (under.kind === "shape" && under.fill && under.shape !== "line") {
      const o = under.opacity ?? 1;
      colors = colors.map((c) => mix(under.fill as Hex, c, o));
      if (o >= 1) overImage = false;
    }
  }
  return { colors, overImage };
}

/** WCAG AA: 4.5:1 body, 3:1 large (≥ 18pt or ≥ 14pt bold) */
export function contrastCheck(scene: Scene): Finding[] {
  const out: Finding[] = [];
  for (const s of scene.slides) {
    for (const el of s.elements) {
      if (el.kind !== "text") continue;
      const large = el.size >= 18 || (el.bold && el.size >= 14);
      const need = large ? 3 : 4.5;
      const { colors, overImage } = backdrop(s, el);
      const colorsInText = [el.color, ...el.paragraphs.flatMap((p) => p.runs.map((r) => r.color).filter((c): c is Hex => !!c))];
      const worst = Math.min(...colorsInText.flatMap((fg) => colors.map((bg) => contrast(fg, bg))));
      if (worst < need) {
        out.push(
          f(
            overImage ? "warn" : "error",
            "contrast",
            s.index,
            `"${el.id}" contrast ${worst.toFixed(2)}:1 < ${need}:1${overImage ? " (over an image without a solid scrim)" : ""}`,
            {
              el: el.id,
              fix: overImage ? "add a scrim (rect, opacity ≥ 0.75) under the text" : "use theme text/onDark colors on their own canvases",
            },
          ),
        );
      }
    }
  }
  return out;
}
