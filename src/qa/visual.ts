import sharp from "sharp";
import { rgb } from "@/core/color";
import type { Scene } from "@/core/types";
import { type Finding, f } from "./types";

interface Raw {
  data: Buffer;
  w: number;
  h: number;
}
async function raw(path: string): Promise<Raw> {
  const { data, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** fraction of pixels in a rect differing from `bg` by more than tol */
function inkRatio(r: Raw, x0: number, y0: number, x1: number, y1: number, bg: [number, number, number], tol = 40): number {
  let ink = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * r.w + x) * 3;
      const d = Math.abs((r.data[i] ?? 0) - bg[0]) + Math.abs((r.data[i + 1] ?? 0) - bg[1]) + Math.abs((r.data[i + 2] ?? 0) - bg[2]);
      if (d > tol) ink++;
      n++;
    }
  }
  return n ? ink / n : 0;
}

/** checks on the rendered pixels: blank slides, ink bleeding into the margins */
export async function visualChecks(scene: Scene, pngs: string[]): Promise<Finding[]> {
  const out: Finding[] = [];
  if (pngs.length !== scene.slides.length) out.push(f("error", "render-count", 0, `rendered ${pngs.length} slides, scene has ${scene.slides.length}`));
  for (const s of scene.slides) {
    const png = pngs[s.index - 1];
    if (!png) continue;
    const r = await raw(png);
    const bg = rgb(s.background);
    const whole = inkRatio(r, 0, 0, r.w, r.h, bg);
    if (whole < 0.004) out.push(f("error", "blank", s.index, "slide renders (almost) blank"));
    if (s.elements.some((e) => e.bleed)) continue;
    // skip the outer 3px: PDF rasterization anti-aliases the page border
    const m = Math.round(r.w * 0.012);
    const e = 3;
    const edges = [
      inkRatio(r, e, e, r.w - e, m, bg),
      inkRatio(r, e, r.h - m, r.w - e, r.h - e, bg),
      inkRatio(r, e, e, m, r.h - e, bg),
      inkRatio(r, r.w - m, e, r.w - e, r.h - e, bg),
    ];
    if (Math.max(...edges) > 0.002)
      out.push(
        f("warn", "edge-ink", s.index, "rendered content touches the slide edge", { fix: "something overflows or is positioned off-grid — look at the PNG" }),
      );
  }
  return out;
}
