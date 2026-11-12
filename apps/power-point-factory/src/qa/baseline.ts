import { mkdir, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import { type Finding, f } from "./types";

async function rgba(path: string, w?: number, h?: number) {
  const img = sharp(path).ensureAlpha();
  const { data, info } = await (w && h ? img.resize(w, h, { fit: "fill" }) : img).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** Pixel diff against approved snapshots (bin/deck approve). Catches layout regressions. */
export async function baselineDiff(pngs: string[], baselineDir: string, diffDir: string, threshold = 0.01): Promise<Finding[]> {
  let names: string[];
  try {
    names = await readdir(baselineDir);
  } catch {
    return [];
  }
  const out: Finding[] = [];
  await mkdir(diffDir, { recursive: true });
  for (const [i, p] of pngs.entries()) {
    const name = basename(p);
    if (!names.includes(name)) {
      out.push(f("info", "baseline", i + 1, "no baseline for this slide"));
      continue;
    }
    const cur = await rgba(p);
    const base = await rgba(join(baselineDir, name), cur.w, cur.h);
    const diff = Buffer.alloc(cur.w * cur.h * 4);
    const n = pixelmatch(cur.data, base.data, diff, cur.w, cur.h, { threshold: 0.15 });
    const ratio = n / (cur.w * cur.h);
    if (ratio > threshold) {
      const dp = join(diffDir, name);
      await sharp(diff, { raw: { width: cur.w, height: cur.h, channels: 4 } })
        .png()
        .toFile(dp);
      out.push(
        f("warn", "baseline", i + 1, `${(ratio * 100).toFixed(1)}% of pixels changed vs baseline — see ${dp}`, { fix: "intended? bin/deck approve <deck>" }),
      );
    }
  }
  return out;
}
