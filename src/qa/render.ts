import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { RenderError } from "@/core/errors";
import { env } from "@/env";
import type { DeckPaths } from "@/pipeline/paths";
import { ROOT } from "@/pipeline/paths";
import { run } from "./cmd";

/**
 * .pptx → PDF (LibreOffice, isolated profile so it never clashes with a running office)
 * → one PNG per slide (poppler). This is the "screenshot" the agent looks at.
 */
export async function renderSlides(p: DeckPaths): Promise<string[]> {
  const profile = join(ROOT, "tmp", "lo-profile", p.slug);
  await mkdir(profile, { recursive: true });
  await run([env.soffice, `-env:UserInstallation=file://${profile}`, "--headless", "--norestore", "--convert-to", "pdf", "--outdir", p.build, p.pptx], {
    timeoutMs: 180_000,
  });
  if (!(await Bun.file(p.pdf).exists())) throw new RenderError(`LibreOffice produced no PDF for ${p.pptx}`);
  await rm(p.slidesPng, { recursive: true, force: true });
  await mkdir(p.slidesPng, { recursive: true });
  await run(["pdftoppm", "-png", "-r", String(env.renderDpi), p.pdf, join(p.slidesPng, "slide")]);
  const files = (await readdir(p.slidesPng)).filter((f) => f.endsWith(".png")).sort();
  // pdftoppm pads by page count (slide-1 / slide-01); normalize to slide-01.png
  const out: string[] = [];
  for (const [i, f] of files.entries()) {
    const name = `slide-${String(i + 1).padStart(2, "0")}.png`;
    if (f !== name) await Bun.write(join(p.slidesPng, name), Bun.file(join(p.slidesPng, f)));
    if (f !== name) await rm(join(p.slidesPng, f));
    out.push(join(p.slidesPng, name));
  }
  return out;
}
