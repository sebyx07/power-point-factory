import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { resolveImages } from "@/assets/resolve";
import type { Scene } from "@/core/types";
import { resolveTheme } from "@/deck";
import { renderPptx } from "@/render/pptx";
import { layoutDeck } from "./layout";
import { loadDeck } from "./load";
import { outline } from "./outline";
import type { DeckPaths } from "./paths";

export interface BuildResult {
  scene: Scene;
  ms: number;
}

/** recipe → scene → assets → .pptx (+ scene.json, outline.md for agents) */
export async function buildDeck(p: DeckPaths, opts: { fresh?: boolean; log?: (m: string) => void } = {}): Promise<BuildResult> {
  const t0 = performance.now();
  const log = opts.log ?? (() => {});
  const spec = await loadDeck(p, opts.fresh);
  const theme = resolveTheme(spec.theme);
  await rm(p.media, { recursive: true, force: true });
  await mkdir(p.build, { recursive: true });
  let scene = await layoutDeck(spec, p.dir);
  scene = await resolveImages(scene, { deckDir: p.dir, mediaDir: p.media, theme, log });
  const bytes = await renderPptx(scene, theme, {
    title: spec.title,
    ...(spec.author ? { author: spec.author } : {}),
    ...(spec.company ? { company: spec.company } : {}),
  });
  await Bun.write(p.pptx, bytes);
  await Bun.write(join(p.build, "scene.json"), JSON.stringify(scene, null, 2));
  await Bun.write(join(p.build, "outline.md"), outline(scene));
  return { scene, ms: performance.now() - t0 };
}
