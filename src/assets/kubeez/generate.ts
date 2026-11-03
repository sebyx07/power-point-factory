import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { GenerateSpec } from "@/core/types";
import { env } from "@/env";
import { appendManifest, bestUrl, cacheKey, generatedDir } from "./cache";
import { KubeezClient } from "./client";
import { optimize } from "./optimize";

export { generatedDir } from "./cache";

export function generationKey(g: GenerateSpec): string {
  return cacheKey([g.prompt.trim(), g.model ?? env.kubeezImageModel, g.aspect ?? "16:9", g.seed ?? 0, g.removeBackground ?? false]);
}
/** photos → JPEG (≈1 MB, commit-friendly); transparent cut-outs → PNG */
export const generatedPath = (deckDir: string, g: GenerateSpec) => join(generatedDir(deckDir), `${generationKey(g)}.${g.removeBackground ? "png" : "jpg"}`);

/** Generate (or reuse) a slide image. Lands in <deck>/assets/generated — commit it. */
export async function generateImage(deckDir: string, g: GenerateSpec, client = new KubeezClient()): Promise<string> {
  const out = generatedPath(deckDir, g);
  if (await Bun.file(out).exists()) return out;
  const model = g.model ?? env.kubeezImageModel;
  const aspect = g.aspect ?? "16:9";
  const job = await client.generateMedia({
    prompt: g.prompt,
    model,
    generation_type: "text-to-image",
    aspect_ratio: aspect,
    ...(g.seed ? { seed: g.seed } : {}),
  });
  let done = await client.wait(job.generation_id);
  let url = bestUrl(done.outputs);
  if (g.removeBackground) {
    const cut = await client.removeBackground(url);
    done = await client.wait(cut.generation_id);
    url = bestUrl(done.outputs) || url;
  }
  await mkdir(dirname(out), { recursive: true });
  await Bun.write(out, await optimize(await client.download(url), !!g.removeBackground));
  await appendManifest(deckDir, {
    file: out.split("/").pop() ?? out,
    kind: "image",
    prompt: g.prompt,
    model,
    params: { aspect, seed: g.seed ?? 0, removeBackground: g.removeBackground ?? false },
    generationId: job.generation_id,
    credits: job.estimated_cost_credits ?? null,
    createdAt: new Date().toISOString(),
  });
  return out;
}
