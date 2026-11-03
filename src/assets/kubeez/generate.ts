import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { GenerateSpec } from "@/core/types";
import { env } from "@/env";
import { appendManifest, bestUrl, cacheKey, generatedDir, once } from "./cache";
import { KubeezClient } from "./client";
import { runJob } from "./job";
import { optimize } from "./optimize";

export { generatedDir } from "./cache";

/**
 * Key = the spec as written. An unpinned model keys as "default" so changing KUBEEZ_IMAGE_MODEL
 * never orphans committed images (pin `model` in the recipe when the model matters).
 */
export function generationKey(g: GenerateSpec): string {
  return cacheKey([
    g.prompt.trim(),
    g.model ?? "default",
    g.aspect ?? "16:9",
    g.seed ?? 0,
    g.removeBackground ?? false,
    ...(g.resolution ? [g.resolution] : []),
  ]);
}

/** photos → JPEG (≈1 MB, commit-friendly); transparent cut-outs → PNG */
export const generatedPath = (deckDir: string, g: GenerateSpec) => join(generatedDir(deckDir), `${generationKey(g)}.${g.removeBackground ? "png" : "jpg"}`);

/** Generate (or reuse) a slide image. The client — and the API key — is only needed on a cache miss. */
export async function generateImage(deckDir: string, g: GenerateSpec, lazyClient: () => KubeezClient = () => new KubeezClient()): Promise<string> {
  const out = generatedPath(deckDir, g);
  if (await Bun.file(out).exists()) return out;
  const key = generationKey(g);
  return once(`${deckDir}:${key}`, async () => {
    const client = lazyClient();
    const model = g.model ?? env.kubeezImageModel;
    const aspect = g.aspect ?? "16:9";
    await runJob(
      deckDir,
      key,
      () =>
        client.generateMedia({
          prompt: g.prompt,
          model,
          generation_type: "text-to-image",
          aspect_ratio: aspect,
          ...(g.seed ? { seed: g.seed } : {}),
          ...(g.resolution ? { resolution: g.resolution } : {}),
        }),
      async (id) => {
        let url = bestUrl((await client.wait(id)).outputs);
        if (g.removeBackground) url = bestUrl((await client.wait((await client.removeBackground(url)).generation_id)).outputs) || url;
        return url;
      },
      async (url, id, credits) => {
        await mkdir(dirname(out), { recursive: true });
        await Bun.write(out, await optimize(await client.download(url), !!g.removeBackground));
        await appendManifest(deckDir, {
          file: out.split("/").pop() ?? out,
          kind: "image",
          prompt: g.prompt,
          model,
          params: { aspect, seed: g.seed ?? 0, removeBackground: g.removeBackground ?? false, ...(g.resolution ? { resolution: g.resolution } : {}) },
          generationId: id,
          credits,
          createdAt: new Date().toISOString(),
        });
      },
    );
    return out;
  });
}
