import { KubeezError } from "@/core/errors";
import { env, requireKubeezKey } from "@/env";
import type {
  BalanceResponse,
  GenerationAccepted,
  GenerationStatus,
  MediaGenerateRequest,
  ModelsListResponse,
  MusicGenerateRequest,
  MusicGenerationStatus,
  UploadResponse,
} from "./types";

/** ALL Kubeez HTTP goes through here. Auth: X-API-Key (sk_live_…). */
export class KubeezClient {
  constructor(
    private readonly apiKey = requireKubeezKey(),
    private readonly baseUrl = env.kubeezApiUrl,
  ) {}

  private async request<T>(method: string, path: string, body?: unknown | FormData): Promise<T> {
    const isForm = body instanceof FormData;
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { "X-API-Key": this.apiKey, Accept: "application/json", ...(body && !isForm ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: isForm ? body : JSON.stringify(body) } : {}),
    });
    const text = await res.text();
    const json = text ? (JSON.parse(text) as unknown) : {};
    if (!res.ok) {
      const e = json as { error?: string; message?: string; hint?: string; detail?: unknown };
      const msg = e.message ?? e.error ?? (e.detail ? JSON.stringify(e.detail) : text.slice(0, 300));
      const hint =
        res.status === 401
          ? "check KUBEEZ_API_KEY in .env"
          : res.status === 429
            ? "rate limited — wait and retry"
            : res.status === 400 && /credit/i.test(msg)
              ? "top up credits at https://kubeez.com"
              : (e.hint ?? undefined);
      throw new KubeezError(`Kubeez ${method} ${path} → ${res.status}: ${msg}`, res.status, hint);
    }
    return json as T;
  }

  models(type?: "image" | "video" | "music" | "speech") {
    return this.request<ModelsListResponse>("GET", `/v1/models${type ? `?model_type=${type}` : ""}`);
  }
  balance() {
    return this.request<BalanceResponse>("GET", "/v1/balance");
  }
  generateMedia(req: MediaGenerateRequest) {
    return this.request<GenerationAccepted>("POST", "/v1/generate/media", req);
  }
  status(id: string) {
    return this.request<GenerationStatus>("GET", `/v1/generate/media/${encodeURIComponent(id)}`);
  }
  generateMusic(req: MusicGenerateRequest) {
    return this.request<GenerationAccepted>("POST", "/v1/generate/music", req);
  }
  musicStatus(id: string) {
    return this.request<MusicGenerationStatus>("GET", `/v1/generate/music/${encodeURIComponent(id)}`);
  }
  /** poll a music job until a song has an audio_url */
  async waitMusic(id: string, opts = { intervalMs: env.kubeezPollMs, timeoutMs: env.kubeezTimeoutMs * 2 }): Promise<MusicGenerationStatus> {
    const start = Date.now();
    await Bun.sleep(Math.min(opts.intervalMs * 4, 20_000));
    for (;;) {
      const s = await this.musicStatus(id);
      if (s.status === "failed") throw new KubeezError(`music ${id} failed: ${s.error_message ?? "unknown"}`);
      if (s.songs?.some((x) => x.audio_url)) return s;
      if (Date.now() - start > opts.timeoutMs) throw new KubeezError(`music ${id} timed out (last status ${s.status})`, undefined, "raise KUBEEZ_TIMEOUT_MS");
      await Bun.sleep(opts.intervalMs);
    }
  }
  removeBackground(imageUrl: string) {
    return this.request<GenerationAccepted>("POST", "/v1/generate/remove-background", { image_url: imageUrl });
  }
  async upload(path: string): Promise<string> {
    const form = new FormData();
    form.append("file", Bun.file(path));
    const r = await this.request<UploadResponse>("POST", "/v1/upload/media", form);
    const url = r.urls?.[0];
    if (!url) throw new KubeezError(`upload of ${path} returned no url: ${r.message ?? ""}`);
    return url;
  }

  /** Poll until completed with a CDN url, or throw on failed/timeout. */
  async wait(id: string, opts = { intervalMs: env.kubeezPollMs, timeoutMs: env.kubeezTimeoutMs }): Promise<GenerationStatus> {
    const start = Date.now();
    await Bun.sleep(Math.min(opts.intervalMs * 2, 8000));
    for (;;) {
      const s = await this.status(id);
      const url = s.outputs?.find((o) => o.url)?.url;
      if (s.status === "failed") throw new KubeezError(`generation ${id} failed: ${s.error_message ?? "unknown"}`);
      if (s.status === "completed" && url) return s;
      if (Date.now() - start > opts.timeoutMs)
        throw new KubeezError(`generation ${id} timed out (last status ${s.status})`, undefined, "raise KUBEEZ_TIMEOUT_MS");
      await Bun.sleep(opts.intervalMs);
    }
  }

  async download(url: string): Promise<Uint8Array> {
    const res = await fetch(url);
    if (!res.ok) throw new KubeezError(`download ${url} → ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
}
