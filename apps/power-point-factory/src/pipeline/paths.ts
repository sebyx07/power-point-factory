import { existsSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { userPath } from "@/cli/paths";
import { DeckSpecError } from "@/core/errors";

export const ROOT = resolve(import.meta.dir, "../..");
/** sources: recipes, assets, brand — committed */
export const PRESENTATIONS = join(ROOT, "presentations");
/** generated: pptx, pdf, screenshots, QA — gitignored, reproducible */
export const OUT = join(ROOT, "out");

/** presentations/<company>/<project>/<YYYY-MM-DD>/<deck>/  →  out/<same path>/ */
export interface DeckPaths {
  dir: string;
  entry: string;
  slidesDir: string;
  /** visual baseline lives with the source so it is committed */
  baseline: string;
  build: string;
  media: string;
  slidesPng: string;
  exportDir: string;
  pptx: string;
  pdf: string;
  contact: string;
  qaMd: string;
  qaJson: string;
  outline: string;
  scene: string;
  /** slides/<deck>-NN.png */
  slidePng: (n: number) => string;
  /** company/project/date/deck */
  rel: string;
  /** the YYYY-MM-DD folder as a Date (UTC midnight) — pins timestamps */
  date: Date;
  slug: string;
}

export function deckPaths(input: string): DeckPaths {
  let dir = userPath(input);
  if (dir.startsWith(`${OUT}/`)) dir = join(PRESENTATIONS, relative(OUT, dir).split("/").slice(0, 4).join("/"));
  if (existsSync(dir) && statSync(dir).isFile()) dir = dirname(dir);
  if (basename(dir) === "slides") dir = dirname(dir);
  const entry = join(dir, "deck.ts");
  if (!existsSync(entry) || !dir.startsWith(`${PRESENTATIONS}/`)) {
    throw new DeckSpecError(`no presentation at ${dir}`, "pass presentations/<company>/<project>/<YYYY-MM-DD>/<deck> (bin/deck list)");
  }
  const rel = relative(PRESENTATIONS, dir);
  const slug = basename(dir);
  const build = join(OUT, rel);
  return {
    dir,
    entry,
    slidesDir: join(dir, "slides"),
    baseline: join(dir, ".baseline"),
    build,
    media: join(build, "media"),
    slidesPng: join(build, "slides"),
    exportDir: join(build, "export"),
    pptx: join(build, `${slug}.pptx`),
    pdf: join(build, `${slug}.pdf`),
    contact: join(build, `${slug}-contact-sheet.png`),
    qaMd: join(build, `${slug}-qa.md`),
    qaJson: join(build, `${slug}-qa.json`),
    outline: join(build, `${slug}-outline.md`),
    scene: join(build, `${slug}-scene.json`),
    slidePng: (n: number) => join(build, "slides", `${slug}-${String(n).padStart(2, "0")}.png`),
    rel,
    slug,
    date: deckDate(rel),
  };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function deckDate(rel: string): Date {
  const d = rel.split("/")[2] ?? "";
  return DATE.test(d) ? new Date(`${d}T00:00:00Z`) : new Date("2000-01-01T00:00:00Z");
}

/** every presentation under presentations/, newest date first */
export function listDecks(): string[] {
  if (!existsSync(PRESENTATIONS)) return [];
  const glob = new Bun.Glob("*/*/*/*/deck.ts");
  return [...glob.scanSync({ cwd: PRESENTATIONS })]
    .filter((p) => DATE.test(p.split("/")[2] ?? ""))
    .map((p) => join(PRESENTATIONS, dirname(p)))
    .sort((a, b) => (b.split("/").at(-2) ?? "").localeCompare(a.split("/").at(-2) ?? "") || a.localeCompare(b));
}
