# Kubeez API — how this repo uses it

> As of 2026-11. Source of truth: `https://api.kubeez.com/openapi.json`. Client: `src/assets/kubeez/client.ts` (the only place that talks HTTP).

## Auth

- Key `sk_live_…` from https://kubeez.com/settings/api-keys → `.env` `KUBEEZ_API_KEY`.
- Header `X-API-Key: sk_live_…` (or `Authorization: Bearer sk_live_…`). Scopes: `generate:media`, `generate:music`, `read:generations`, `read:balance`.
- Interactive alternative for Claude Code: the `kubeez` MCP in `.mcp.json` (`https://mcp.kubeez.com/mcp`, OAuth). Builds always use the REST key.

## Everything is async

```
POST /v1/generate/media   {prompt, model, generation_type, aspect_ratio, …}  → {generation_id, estimated_cost_credits}
GET  /v1/generate/media/{generation_id}  → poll until status=completed AND outputs[].url non-null (or status=failed)
```

- Poll every ~4–5 s after a first wait (image ~10 s, video ~30 s+). `KUBEEZ_POLL_INTERVAL_MS`, `KUBEEZ_TIMEOUT_MS`.
- `outputs[]`: `url`, `optimized_url` (CDN-optimized, preferred when `optimization_status` ≠ failed), `thumbnail_url` (video poster), `width`, `height`.
- While CDN upload runs, `status` may stay `processing` with null URLs — keep polling.

## Endpoints we wrap

| Endpoint                                                  | Client method                     | CLI                                              |
| --------------------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| `GET /v1/models?model_type=image\|video\|music\|speech`   | `models()`                        | `bin/kubeez models image`                        |
| `GET /v1/balance`                                         | `balance()`                       | `bin/kubeez balance`                             |
| `POST /v1/generate/media`                                 | `generateMedia()`                 | `bin/kubeez generate "…" --model --aspect --out` |
| `GET /v1/generate/media/{id}`                             | `status()` / `wait()`             | `bin/kubeez status <id>`                         |
| `POST /v1/generate/remove-background` `{image_url}`       | `removeBackground()`              | `bin/kubeez remove-bg <url\|file>`               |
| `POST /v1/upload/media` (multipart `file`)                | `upload()`                        | `bin/kubeez upload <file>`                       |
| `POST /v1/generate/music` · `GET /v1/generate/music/{id}` | `generateMusic()` / `waitMusic()` | (via `soundtrack()`)                             |

Also available, not wrapped yet: `/v1/generate/dialogue` (speech), `/v1/generate/captions`, `/v1/generate/dubbing`, `/v1/generate/separation`, `/v1/story/generate`, `/v1/assets`, `/v1/generations`.

## Request fields that matter for slides

| Field             | Values                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `generation_type` | `text-to-image` · `image-to-image` (needs `source_media_urls`) · `text-to-video` · `image-to-video` |
| `aspect_ratio`    | `16:9` full-bleed · `3:4` cover half · `1:1` icons/objects · `4:5` portraits · `21:9` banners       |
| `resolution`      | `1K`/`2K`/`4K` on models that expose it (`nano-banana-pro`)                                         |
| `duration`        | video seconds as a string (`"5"`); valid values per model in `/v1/models`                           |
| `sound`           | video audio on toggle models (default false here — slides are presented over)                       |
| `seed`            | deterministic re-runs where supported                                                               |

## Models (pick by job — always confirm with `bin/kubeez models`)

| Job                                               | Model                                               |
| ------------------------------------------------- | --------------------------------------------------- |
| Default slide photo                               | `nano-banana-2`                                     |
| Hero / typography-heavy / print quality           | `nano-banana-pro` (`resolution: "4K"`)              |
| Fast drafts, bulk                                 | `z-image` (`z-image-hd`)                            |
| Multi-reference edit                              | `flux-3-klein`                                      |
| Vector logo concept (never a real company's logo) | `logo-maker`                                        |
| Video, value                                      | `seedance-2-fast` · best: `kling-3-0-pro`, `veo3-1` |
| Music bed                                         | `V6` (`instrumental: true`)                         |

## Errors

`401` bad key · `403` missing scope · `400` bad params / insufficient credits / disabled model · `429` rate limit (`reset_after` s). The client maps each to a `KubeezError` with a hint.

## Caching (never pay twice)

`src/assets/kubeez/cache.ts`: key = sha256(prompt, model, aspect, seed, …). Files land in `presentations/…/<deck>/assets/generated/<key>.{png,mp4,jpg,mp3}` with `manifest.json` (prompt, model, generation id, credits, date). Commit them. Edit a prompt → new key → new file; delete the stale one.
