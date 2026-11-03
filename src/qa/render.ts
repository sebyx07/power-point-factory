import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { RenderError } from "@/core/errors";
import { env } from "@/env";
import type { DeckPaths } from "@/pipeline/paths";
import { ROOT } from "@/pipeline/paths";
import { run } from "./cmd";
import { normalizePdf } from "./pdf-normalize";

/**
 * .pptx → PDF (LibreOffice, isolated profile so it never clashes with a running office)
 * → one PNG per slide (poppler). This is the "screenshot" the agent looks at.
 */
export async function renderSlides(p: DeckPaths): Promise<string[]> {
  const profile = join(ROOT, "tmp", "lo-profile", p.slug);
  await mkdir(profile, { recursive: true });
  await run(
    [env.soffice, `-env:UserInstallation=${pathToFileURL(profile).href}`, "--headless", "--norestore", "--convert-to", "pdf", "--outdir", p.build, p.pptx],
    {
      timeoutMs: 180_000,
    },
  );
  if (!(await Bun.file(p.pdf).exists())) throw new RenderError(`LibreOffice produced no PDF for ${p.pptx}`);
  await Bun.write(p.pdf, normalizePdf(new Uint8Array(await Bun.file(p.pdf).arrayBuffer()), p.date));
  await rm(p.slidesPng, { recursive: true, force: true });
  await mkdir(p.slidesPng, { recursive: true });
  await run(["pdftoppm", "-png", "-r", String(env.renderDpi), p.pdf, join(p.slidesPng, "raw")]);
  const files = (await readdir(p.slidesPng)).filter((f) => f.endsWith(".png")).sort();
  // pdftoppm pads by page count (raw-1 / raw-01); rename to <deck>-01.png
  const out: string[] = [];
  for (const [i, f] of files.entries()) {
    const dest = p.slidePng(i + 1);
    await Bun.write(dest, Bun.file(join(p.slidesPng, f)));
    await rm(join(p.slidesPng, f));
    out.push(dest);
  }
  return out;
}
