import { join } from "node:path";
import sharp from "sharp";
import { AssetError } from "@/core/errors";
import type { Hex } from "@/core/types";

const ICON_DIR = join(import.meta.dir, "../../node_modules/lucide-static/icons");

/** Lucide icon → tinted transparent PNG. Names: https://lucide.dev/icons */
export async function iconPng(name: string, color: Hex, px: number, strokeWidth = 1.75): Promise<Buffer> {
  const f = Bun.file(join(ICON_DIR, `${name}.svg`));
  if (!(await f.exists())) throw new AssetError(`icon "${name}" not found`, "pick a name from https://lucide.dev/icons (kebab-case)");
  const svg = (await f.text())
    .replace(/<!--.*?-->/s, "")
    .replaceAll("currentColor", color)
    .replace(/stroke-width="[\d.]+"/, `stroke-width="${strokeWidth}"`)
    .replace(/width="24"\s+height="24"/, `width="${px}" height="${px}"`);
  return sharp(Buffer.from(svg), { density: 300 }).resize(px, px).png().toBuffer();
}
