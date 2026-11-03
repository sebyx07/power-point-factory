import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { MusicGenerateSpec, VideoGenerateSpec } from "@/core/types";
import { env } from "@/env";
import { appendManifest, bestUrl, cacheKey, generatedDir, once } from "./cache";
import { KubeezClient } from "./client";
import { runJob } from "./job";

export const videoKey = (v: VideoGenerateSpec) =>
  cacheKey(["video", v.prompt.trim(), v.model ?? "default", v.duration ?? 5, v.aspect ?? "16:9", v.sound ?? false]);
export const musicKey = (m: MusicGenerateSpec) => cacheKey(["music", m.prompt.trim(), m.model ?? "default", m.instrumental ?? true]);

const videoPaths = (deckDir: string, v: VideoGenerateSpec) => {
  const k = videoKey(v);
  return { key: k, path: join(generatedDir(deckDir), `${k}.mp4`), poster: join(generatedDir(deckDir), `${k}.jpg`) };
};
const musicPath = (deckDir: string, m: MusicGenerateSpec) => join(generatedDir(deckDir), `${musicKey(m)}.mp3`);

/** already generated? (no key needed) — the media file alone is the cache; the poster is optional */
export function isCached(deckDir: string, src: { generateVideo: VideoGenerateSpec } | { generateMusic: MusicGenerateSpec }): Promise<boolean> {
  return Bun.file("generateVideo" in src ? videoPaths(deckDir, src.generateVideo).path : musicPath(deckDir, src.generateMusic)).exists();
}

/** text-to-video → <key>.mp4 (+ <key>.jpg poster when Kubeez provides a thumbnail) */
export async function generateVideo(
  deckDir: string,
  v: VideoGenerateSpec,
  lazyClient: () => KubeezClient = () => new KubeezClient(),
): Promise<{ path: string; poster: string }> {
  const { key, path, poster } = videoPaths(deckDir, v);
  const hasPoster = async () => ((await Bun.file(poster).exists()) ? poster : "");
  if (await Bun.file(path).exists()) return { path, poster: await hasPoster() };
  return once(`${deckDir}:${key}`, async () => {
    const client = lazyClient();
    const model = v.model ?? env.kubeezVideoModel;
    const req = {
      prompt: v.prompt,
      model,
      generation_type: "text-to-video" as const,
      aspect_ratio: v.aspect ?? "16:9",
      duration: String(v.duration ?? 5),
      sound: v.sound ?? false,
    };
    await runJob(
      deckDir,
      key,
      () => client.generateMedia(req),
      (id) => client.wait(id, { intervalMs: env.kubeezPollMs * 2, timeoutMs: env.kubeezTimeoutMs * 4 }),
      async (done, id, credits) => {
        await mkdir(generatedDir(deckDir), { recursive: true });
        await Bun.write(path, await client.download(bestUrl(done.outputs)));
        const thumb = done.outputs?.find((o) => o.thumbnail_url)?.thumbnail_url;
        if (thumb) await Bun.write(poster, await client.download(thumb));
        await appendManifest(deckDir, {
          file: `${key}.mp4`,
          kind: "video",
          prompt: v.prompt,
          model,
          params: { duration: req.duration, aspect: req.aspect_ratio, sound: req.sound },
          generationId: id,
          credits,
          createdAt: new Date().toISOString(),
        });
      },
    );
    return { path, poster: await hasPoster() };
  });
}

/** text-to-music → <key>.mp3 */
export async function generateMusic(deckDir: string, m: MusicGenerateSpec, lazyClient: () => KubeezClient = () => new KubeezClient()): Promise<string> {
  const path = musicPath(deckDir, m);
  if (await Bun.file(path).exists()) return path;
  const key = musicKey(m);
  return once(`${deckDir}:${key}`, async () => {
    const client = lazyClient();
    const model = m.model ?? env.kubeezMusicModel;
    await runJob(
      deckDir,
      key,
      () => client.generateMusic({ prompt: m.prompt, instrumental: m.instrumental ?? true, model }),
      (id) => client.waitMusic(id),
      async (done, id, credits) => {
        await mkdir(generatedDir(deckDir), { recursive: true });
        await Bun.write(path, await client.download(done.songs?.find((s) => s.audio_url)?.audio_url ?? ""));
        await appendManifest(deckDir, {
          file: path.split("/").pop() ?? path,
          kind: "music",
          prompt: m.prompt,
          model,
          params: { instrumental: m.instrumental ?? true },
          generationId: id,
          credits,
          createdAt: new Date().toISOString(),
        });
      },
    );
    return path;
  });
}
