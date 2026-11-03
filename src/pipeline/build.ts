import { mkdir, rm } from "node:fs/promises";
import { resolveImages } from "@/assets/resolve";
import type { Scene } from "@/core/types";
import { type DeckSpec, resolveTheme } from "@/deck";
import { renderPptx } from "@/render/pptx";
import type { Theme } from "@/theme/types";
import { layoutDeck } from "./layout";
import { loadDeck } from "./load";
import { outline } from "./outline";
import type { DeckPaths } from "./paths";

export interface BuildResult {
  scene: Scene;
  spec: DeckSpec;
  theme: Theme;
  ms: number;
}

/** recipe → scene → assets → <deck>.pptx (+ <deck>-scene.json, <deck>-outline.md for agents) */
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
    at: p.date,
    ...(spec.author ? { author: spec.author } : {}),
    ...(spec.company ? { company: spec.company } : {}),
  });
  await Bun.write(p.pptx, bytes);
  await Bun.write(p.scene, JSON.stringify(scene, null, 2));
  await Bun.write(p.outline, outline(scene));
  return { scene, spec, theme, ms: performance.now() - t0 };
}
