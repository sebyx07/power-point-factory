import opentype from "opentype.js";
import { FontError } from "@/core/errors";

/**
 * Decks use Office-safe faces so they look identical on the presenter's laptop.
 * Text is measured (and LibreOffice renders) with the metric-compatible Linux twin:
 * same advance widths → our wrap/fit math matches PowerPoint.
 */
export const SAFE_FONTS: Record<string, { twin: string; pkg: string }> = {
  Calibri: { twin: "Carlito", pkg: "fonts-crosextra-carlito" },
  Cambria: { twin: "Caladea", pkg: "fonts-crosextra-caladea" },
  Georgia: { twin: "Gelasio", pkg: "fonts-gelasio (or google fonts)" },
  Arial: { twin: "Liberation Sans", pkg: "fonts-liberation" },
  "Times New Roman": { twin: "Liberation Serif", pkg: "fonts-liberation" },
  "Courier New": { twin: "Liberation Mono", pkg: "fonts-liberation" },
};

const cache = new Map<string, opentype.Font>();
const key = (face: string, bold: boolean) => `${face}|${bold ? "b" : "r"}`;

function locate(twin: string, bold: boolean): string {
  if (!Bun.which("fc-match")) throw new FontError("fontconfig (fc-match) not installed", "apt install fontconfig · brew install fontconfig — then bin/doctor");
  const r = Bun.spawnSync(["fc-match", "-f", "%{family}\n%{file}", `${twin}:${bold ? "bold" : "regular"}`]);
  const [family = "", file = ""] = r.stdout.toString().split("\n");
  if (r.exitCode !== 0 || !family.split(",").includes(twin)) {
    throw new FontError(`Font twin "${twin}" not installed (fc-match gave "${family}")`, "run bin/setup");
  }
  return file;
}

export function assertSafeFont(face: string): void {
  if (!SAFE_FONTS[face]) {
    throw new FontError(
      `Font "${face}" is not Office-safe`,
      `use one of: ${Object.keys(SAFE_FONTS).join(", ")} — custom fonts render differently on the presenter's machine`,
    );
  }
}

export async function loadFont(face: string, bold: boolean): Promise<opentype.Font> {
  const k = key(face, bold);
  const hit = cache.get(k);
  if (hit) return hit;
  assertSafeFont(face);
  const twin = SAFE_FONTS[face]?.twin ?? face;
  const buf = await Bun.file(locate(twin, bold)).arrayBuffer();
  const font = opentype.parse(buf);
  cache.set(k, font);
  return font;
}

export async function preloadFonts(faces: string[]): Promise<void> {
  await Promise.all([...new Set(faces)].flatMap((f) => [loadFont(f, false), loadFont(f, true)]));
}

export function font(face: string, bold: boolean): opentype.Font {
  const f = cache.get(key(face, bold));
  if (!f) throw new FontError(`Font ${face} not preloaded`, "call preloadFonts() before layout");
  return f;
}
