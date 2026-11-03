import { isAbsolute, join } from "node:path";
import sharp from "sharp";
import { AssetError } from "@/core/errors";
import type { MediaEl } from "@/core/types";
import { env } from "@/env";
import { generateMusic, generateVideo, isCached } from "./kubeez/media";
import { placeholderPng } from "./placeholder";
import type { ResolveCtx } from "./resolve";

/** video/audio → file on disk + poster PNG (pptx needs a poster; QA screenshots show it) */
export async function resolveMedia(el: MediaEl, slide: number, ctx: ResolveCtx): Promise<MediaEl> {
  const s = el.src;
  const posterOut = join(ctx.mediaDir, `s${slide}-${el.id}-poster.png`);
  const wPx = Math.round(el.box.w * 150);
  const hPx = Math.round(el.box.h * 150);
  const posterFrom = async (file: string | undefined, label: string) => {
    const bytes = file
      ? Buffer.from(await Bun.file(file).arrayBuffer())
      : await placeholderPng(wPx, hPx, label, ctx.theme.colors.dark, ctx.theme.colors.accent);
    await sharp(bytes).resize(Math.max(wPx, 32), Math.max(hPx, 32), { fit: "cover" }).png().toFile(posterOut);
    return posterOut;
  };
  if ("file" in s) {
    const p = isAbsolute(s.file) ? s.file : join(ctx.deckDir, s.file);
    if (!(await Bun.file(p).exists())) throw new AssetError(`media file not found: ${p}`, "put it in the deck's assets/ folder");
    const poster = s.poster ? (isAbsolute(s.poster) ? s.poster : join(ctx.deckDir, s.poster)) : undefined;
    return { ...el, resolved: { path: p, poster: await posterFrom(poster, el.alt), placeholder: false, origin: s.file } };
  }
  if (!env.kubeezApiKey && !(await isCached(ctx.deckDir, s))) {
    if (env.missingImage === "error") throw new AssetError(`${el.media} needs generating but KUBEEZ_API_KEY is unset`);
    const label = "generateVideo" in s ? s.generateVideo.prompt : s.generateMusic.prompt;
    return {
      ...el,
      resolved: { path: "", poster: await posterFrom(undefined, `${el.media.toUpperCase()}: ${label}`), placeholder: true, origin: "placeholder" },
    };
  }
  if ("generateVideo" in s) {
    ctx.log(`kubeez: video "${s.generateVideo.prompt.slice(0, 50)}…" (minutes)`);
    const v = await generateVideo(ctx.deckDir, s.generateVideo);
    return {
      ...el,
      resolved: { path: v.path, poster: await posterFrom(v.poster || undefined, el.alt), placeholder: false, origin: `kubeez:${v.path.split("/").pop()}` },
    };
  }
  ctx.log(`kubeez: music "${s.generateMusic.prompt.slice(0, 50)}…"`);
  const a = await generateMusic(ctx.deckDir, s.generateMusic);
  return { ...el, resolved: { path: a, poster: await posterFrom(undefined, "♪"), placeholder: false, origin: `kubeez:${a.split("/").pop()}` } };
}
