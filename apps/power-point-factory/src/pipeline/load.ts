import { readdirSync } from "node:fs";
import { join } from "node:path";
import { DeckSpecError } from "@/core/errors";
import type { DeckSpec } from "@/deck";
import type { SlideSpec } from "@/layouts";
import type { DeckPaths } from "./paths";

const bust = () => `?v=${Date.now()}`;

/**
 * A deck is a folder: deck.ts (meta + theme) + slides/NN-name.ts (one slide or an array each).
 * Filename order is slide order. deck.ts may also list `slides` inline.
 */
export async function loadDeck(p: DeckPaths, fresh = false): Promise<DeckSpec> {
  const mod = (await import(p.entry + (fresh ? bust() : ""))) as { default?: DeckSpec };
  const spec = mod.default;
  if (!spec?.title) throw new DeckSpecError(`${p.entry}: default export must be defineDeck({...})`);
  let files: string[] = [];
  try {
    files = readdirSync(p.slidesDir)
      .filter((f) => /\.tsx?$/.test(f) && !f.startsWith("_"))
      .sort();
  } catch {
    /* no slides/ dir — inline slides only */
  }
  const fromFiles: SlideSpec[] = [];
  for (const f of files) {
    const m = (await import(join(p.slidesDir, f) + (fresh ? bust() : ""))) as { default?: SlideSpec | SlideSpec[] };
    if (!m.default) throw new DeckSpecError(`slides/${f}: missing default export`, "export default slide({ layout: ... })");
    fromFiles.push(...(Array.isArray(m.default) ? m.default : [m.default]));
  }
  const slides = [...(spec.slides ?? []), ...fromFiles].filter((s) => !s.hidden);
  if (slides.length === 0) throw new DeckSpecError(`${p.rel}: deck has no slides`, "add files under slides/ (bin/deck new scaffolds them)");
  return { ...spec, slides };
}
