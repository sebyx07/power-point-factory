import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { resolveFrom } from "@/cli/paths";
import { AssetError } from "@/core/errors";
import type { Box, ImageEl, Scene } from "@/core/types";
import { env } from "@/env";
import type { Theme } from "@/theme/types";
import { iconPng } from "./icons";
import { generatedPath, generateImage } from "./kubeez/generate";
import { placeholderPng } from "./placeholder";
import { resolveMedia } from "./resolve-media";

/** export resolution: 200 px per inch is crisp on a 4K projector and keeps files small */
const PPI = 200;

export interface ResolveCtx {
  deckDir: string;
  mediaDir: string;
  theme: Theme;
  log: (msg: string) => void;
}

const hash = (s: string) => new Bun.CryptoHasher("sha1").update(s).digest("hex").slice(0, 10);

function contained(b: Box, srcW: number, srcH: number): Box {
  const r = srcW / srcH;
  if (r > b.w / b.h) {
    const h = b.w / r;
    return { x: b.x, y: b.y + (b.h - h) / 2, w: b.w, h };
  }
  const w = b.h * r;
  return { x: b.x + (b.w - w) / 2, y: b.y, w, h: b.h };
}

async function sourceBytes(el: ImageEl, ctx: ResolveCtx): Promise<{ bytes: Buffer; origin: string; placeholder: boolean }> {
  const s = el.src;
  const px = Math.round(Math.max(el.box.w, el.box.h) * PPI);
  if ("icon" in s) return { bytes: await iconPng(s.icon, s.color ?? ctx.theme.colors.accent, Math.min(px, 600)), origin: `icon:${s.icon}`, placeholder: false };
  if ("file" in s) {
    const p = resolveFrom(ctx.deckDir, s.file);
    const f = Bun.file(p);
    if (!(await f.exists())) throw new AssetError(`image file not found: ${p}`, "put it in the deck's assets/ folder and reference it as assets/<name>");
    return { bytes: Buffer.from(await f.arrayBuffer()), origin: s.file, placeholder: false };
  }
  const cached = generatedPath(ctx.deckDir, s.generate);
  if ((await Bun.file(cached).exists()) || env.kubeezApiKey) {
    if (!(await Bun.file(cached).exists())) ctx.log(`kubeez: generating "${s.generate.prompt.slice(0, 60)}…"`);
    const p = await generateImage(ctx.deckDir, s.generate);
    return { bytes: Buffer.from(await Bun.file(p).arrayBuffer()), origin: `kubeez:${p.split("/").pop()}`, placeholder: false };
  }
  if (env.missingImage === "error")
    throw new AssetError("image needs generating but KUBEEZ_API_KEY is unset", "set it in .env, or DECK_MISSING_IMAGE=placeholder");
  const w = Math.round(el.box.w * 100);
  const h = Math.round(el.box.h * 100);
  return { bytes: await placeholderPng(w, h, s.generate.prompt, ctx.theme.colors.dark, ctx.theme.colors.accent), origin: "placeholder", placeholder: true };
}

/** Fetch/generate/crop every image to its box so PowerPoint never stretches or upsamples. */
export async function resolveImages(scene: Scene, ctx: ResolveCtx): Promise<Scene> {
  await mkdir(ctx.mediaDir, { recursive: true });
  const slides = await Promise.all(
    scene.slides.map(async (s) => ({
      ...s,
      elements: await Promise.all(
        s.elements.map(async (el) => {
          if (el.kind === "media") return resolveMedia(el, s.index, ctx);
          if (el.kind !== "image") return el;
          const { bytes, origin, placeholder } = await sourceBytes(el, ctx);
          const meta = await sharp(bytes).metadata();
          const srcW = meta.width ?? 1;
          const srcH = meta.height ?? 1;
          const box = el.fit === "contain" ? contained(el.box, srcW, srcH) : el.box;
          const wPx = Math.round(box.w * PPI);
          const hPx = Math.round(box.h * PPI);
          const alpha = meta.hasAlpha ?? false;
          const ext = alpha ? "png" : "jpg";
          const out = join(ctx.mediaDir, `s${s.index}-${el.id}-${hash(`${origin}${wPx}x${hPx}`)}.${ext}`);
          const img = sharp(bytes).resize(wPx, hPx, { fit: el.fit === "contain" ? "inside" : "cover", position: "attention", withoutEnlargement: false });
          await (alpha ? img.png({ compressionLevel: 9 }) : img.jpeg({ quality: 86, mozjpeg: true })).toFile(out);
          return { ...el, box, resolved: { path: out, srcW, srcH, placeholder, origin } };
        }),
      ),
    })),
  );
  return { ...scene, slides };
}
