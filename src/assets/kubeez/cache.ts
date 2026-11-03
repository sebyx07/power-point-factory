import { join } from "node:path";

/** Generated media is cached in the deck's source assets/generated/ and committed: same spec → same file, never re-billed. */
export interface ManifestEntry {
  file: string;
  kind: "image" | "video" | "music";
  prompt: string;
  model: string;
  params: Record<string, unknown>;
  generationId: string;
  credits?: number | null;
  createdAt: string;
}

export const generatedDir = (deckDir: string) => join(deckDir, "assets", "generated");

export function cacheKey(parts: unknown[]): string {
  return new Bun.CryptoHasher("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 16);
}

export async function appendManifest(deckDir: string, e: ManifestEntry): Promise<void> {
  const path = join(generatedDir(deckDir), "manifest.json");
  const f = Bun.file(path);
  const list: ManifestEntry[] = (await f.exists()) ? await f.json() : [];
  await Bun.write(path, `${JSON.stringify([...list.filter((x) => x.file !== e.file), e], null, 2)}\n`);
}

/** prefer Kubeez's CDN-optimized rendition when it is ready */
export function bestUrl(outputs: { url?: string | null; optimized_url?: string | null; optimization_status?: string | null }[] | undefined): string {
  const o = outputs?.find((x) => x.url || x.optimized_url);
  return (o?.optimization_status !== "failed" && o?.optimized_url) || o?.url || "";
}
