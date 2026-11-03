import { mkdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Generated media is source: cached in <deck>/assets/generated/, committed, never billed twice.
 *  - same spec → same key → same file
 *  - identical specs in one build share one in-flight job (dedupe)
 *  - a job id is recorded in pending.json BEFORE polling, so a crash/timeout resumes instead of re-paying
 *  - manifest/pending writes are serialized (no lost entries under Promise.all)
 */
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

let chain: Promise<unknown> = Promise.resolve();
/** run fs read-modify-write jobs one at a time */
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn);
  chain = next.catch(() => {});
  return next;
}

async function readJson<T>(path: string, empty: T): Promise<T> {
  const f = Bun.file(path);
  return (await f.exists()) ? ((await f.json()) as T) : empty;
}

export function appendManifest(deckDir: string, e: ManifestEntry): Promise<void> {
  return serial(async () => {
    const path = join(generatedDir(deckDir), "manifest.json");
    const list = await readJson<ManifestEntry[]>(path, []);
    await Bun.write(path, `${JSON.stringify([...list.filter((x) => x.file !== e.file), e], null, 2)}\n`);
  });
}

const pendingPath = (deckDir: string) => join(generatedDir(deckDir), "pending.json");

export function pendingJob(deckDir: string, key: string): Promise<string | undefined> {
  return serial(async () => (await readJson<Record<string, string>>(pendingPath(deckDir), {}))[key]);
}

export function setPending(deckDir: string, key: string, generationId: string | null): Promise<void> {
  return serial(async () => {
    await mkdir(generatedDir(deckDir), { recursive: true });
    const all = await readJson<Record<string, string>>(pendingPath(deckDir), {});
    if (generationId) all[key] = generationId;
    else delete all[key];
    if (Object.keys(all).length) await Bun.write(pendingPath(deckDir), `${JSON.stringify(all, null, 2)}\n`);
    else if (await Bun.file(pendingPath(deckDir)).exists()) await Bun.file(pendingPath(deckDir)).delete();
  });
}

const inflight = new Map<string, Promise<unknown>>();
/** identical work started twice in one process runs once */
export function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = inflight.get(key);
  if (hit) return hit as Promise<T>;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/** prefer Kubeez's CDN-optimized rendition when it is ready */
export function bestUrl(outputs: { url?: string | null; optimized_url?: string | null; optimization_status?: string | null }[] | undefined): string {
  const o = outputs?.find((x) => x.url || x.optimized_url);
  return (o?.optimization_status !== "failed" && o?.optimized_url) || o?.url || "";
}
