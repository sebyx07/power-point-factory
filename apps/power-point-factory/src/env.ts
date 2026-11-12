import { EnvError } from "@/core/errors";

/**
 * Every env var the repo reads, in one place. Bun auto-loads .env.
 * Guard: scripts/lint/env-in-example.ts fails if a name here is missing from .env.example.
 */
const read = (k: string): string | undefined => {
  const v = Bun.env[k]?.trim();
  return v ? v : undefined;
};
const num = (k: string, d: number) => {
  const v = read(k);
  if (v === undefined) return d;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new EnvError(`${k}="${v}" is not a number`, `fix it in .env (see .env.example)`);
  return n;
};

export const env = {
  get kubeezApiKey() {
    return read("KUBEEZ_API_KEY");
  },
  get kubeezApiUrl() {
    return read("KUBEEZ_API_URL") ?? "https://api.kubeez.com";
  },
  get kubeezImageModel() {
    return read("KUBEEZ_IMAGE_MODEL") ?? "nano-banana-2";
  },
  get kubeezVideoModel() {
    return read("KUBEEZ_VIDEO_MODEL") ?? "seedance-2-fast";
  },
  get kubeezMusicModel() {
    return read("KUBEEZ_MUSIC_MODEL") ?? "V6";
  },
  get kubeezPollMs() {
    return num("KUBEEZ_POLL_INTERVAL_MS", 4000);
  },
  get kubeezTimeoutMs() {
    return num("KUBEEZ_TIMEOUT_MS", 240_000);
  },
  /** "placeholder" (default) | "error" — what to do when an image needs generating but no key is set */
  get missingImage() {
    return read("DECK_MISSING_IMAGE") === "error" ? "error" : "placeholder";
  },
  get renderDpi() {
    return num("QA_RENDER_DPI", 110);
  },
  get soffice() {
    return read("SOFFICE_BIN") ?? "soffice";
  },
};

export function requireKubeezKey(): string {
  const k = env.kubeezApiKey;
  if (!k) throw new EnvError("KUBEEZ_API_KEY is not set", "cp .env.example .env and paste a key from https://kubeez.com/settings/api-keys");
  return k;
}
