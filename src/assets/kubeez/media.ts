import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { MusicGenerateSpec, VideoGenerateSpec } from "@/core/types";
import { env } from "@/env";
import { appendManifest, bestUrl, cacheKey, generatedDir } from "./cache";
import { KubeezClient } from "./client";

export const videoKey = (v: VideoGenerateSpec) =>
  cacheKey(["video", v.prompt.trim(), v.model ?? env.kubeezVideoModel, v.duration ?? 5, v.aspect ?? "16:9", v.sound ?? false]);
export const musicKey = (m: MusicGenerateSpec) => cacheKey(["music", m.prompt.trim(), m.model ?? env.kubeezMusicModel, m.instrumental ?? true]);

/** already generated? (no key needed) */
export async function isCached(deckDir: string, src: { generateVideo: VideoGenerateSpec } | { generateMusic: MusicGenerateSpec }): Promise<boolean> {
  const dir = generatedDir(deckDir);
  const file = "generateVideo" in src ? `${videoKey(src.generateVideo)}.mp4` : `${musicKey(src.generateMusic)}.mp3`;
  return Bun.file(join(dir, file)).exists();
}

/** text-to-video → <deck>/assets/generated/<key>.mp4 + <key>.jpg poster (Kubeez thumbnail) */
export async function generateVideo(
  deckDir: string,
  v: VideoGenerateSpec,
  lazyClient: () => KubeezClient = () => new KubeezClient(),
): Promise<{ path: string; poster: string }> {
  const dir = generatedDir(deckDir);
  const key = videoKey(v);
  const path = join(dir, `${key}.mp4`);
  const poster = join(dir, `${key}.jpg`);
  if ((await Bun.file(path).exists()) && (await Bun.file(poster).exists())) return { path, poster };
  const client = lazyClient(); // cache miss: only now is a key required
  const model = v.model ?? env.kubeezVideoModel;
  const job = await client.generateMedia({
    prompt: v.prompt,
    model,
    generation_type: "text-to-video",
    aspect_ratio: v.aspect ?? "16:9",
    duration: String(v.duration ?? 5),
    sound: v.sound ?? false,
  });
  const done = await client.wait(job.generation_id, { intervalMs: env.kubeezPollMs * 2, timeoutMs: env.kubeezTimeoutMs * 4 });
  await mkdir(dir, { recursive: true });
  await Bun.write(path, await client.download(bestUrl(done.outputs)));
  const thumb = done.outputs?.find((o) => o.thumbnail_url)?.thumbnail_url;
  if (thumb) await Bun.write(poster, await client.download(thumb));
  await appendManifest(deckDir, {
    file: `${key}.mp4`,
    kind: "video",
    prompt: v.prompt,
    model,
    params: { duration: v.duration ?? 5, aspect: v.aspect ?? "16:9", sound: v.sound ?? false },
    generationId: job.generation_id,
    credits: job.estimated_cost_credits ?? null,
    createdAt: new Date().toISOString(),
  });
  return { path, poster: thumb ? poster : "" };
}

/** text-to-music → <deck>/assets/generated/<key>.mp3 */
export async function generateMusic(deckDir: string, m: MusicGenerateSpec, lazyClient: () => KubeezClient = () => new KubeezClient()): Promise<string> {
  const dir = generatedDir(deckDir);
  const path = join(dir, `${musicKey(m)}.mp3`);
  if (await Bun.file(path).exists()) return path;
  const client = lazyClient(); // cache miss: only now is a key required
  const model = m.model ?? env.kubeezMusicModel;
  const job = await client.generateMusic({ prompt: m.prompt, instrumental: m.instrumental ?? true, model });
  const done = await client.waitMusic(job.generation_id);
  const url = done.songs?.find((s) => s.audio_url)?.audio_url ?? "";
  await mkdir(dir, { recursive: true });
  await Bun.write(path, await client.download(url));
  await appendManifest(deckDir, {
    file: path.split("/").pop() ?? path,
    kind: "music",
    prompt: m.prompt,
    model,
    params: { instrumental: m.instrumental ?? true },
    generationId: job.generation_id,
    createdAt: new Date().toISOString(),
  });
  return path;
}
