---
name: kubeez-media
description: Use when a slide needs a generated image, video or music bed (Kubeez). Covers prompts that read as real photography, model choice, cost, caching, and transparent cut-outs.
---

# Kubeez media

Needs `KUBEEZ_API_KEY` in `.env` (`bin/doctor`). API reference: `docs/kubeez.md`. Prompt craft: `docs/image-prompts.md`.

**In a slide (cached + committed automatically):**
```ts
image: { generate: { prompt: "…", aspect: "16:9" } }                 // any ImageSource prop
video: { generateVideo: { prompt: "…", duration: 5 } }                // layout: "video"
extra: [soundtrack({ prompt: "calm minimal piano, 70 bpm" })]          // keynote openers only
```

- Aspect = the box: cover image `3:4`, full-bleed `16:9`, portrait `3:4`, icon/object `1:1`.
- Cut-out (product, person, logo on transparent): `removeBackground: true`.
- Model: default `nano-banana-2`; hero shots `nano-banana-pro`; drafts `z-image`. Video default `seedance-2-fast`; hero `kling-3-0-pro`.

**Prompt formula:** medium (editorial photograph) → subject + action → setting → light → lens → palette (from BRAND.md) → composition (negative space for text) → "no text, no logos".
Ban: futuristic, glowing, holographic, neon, 8k, masterpiece, hyper-realistic, golden-hour default, posed smiling groups, screens with readable text.

**Workflow:** draft with `bin/kubeez generate "…" --model z-image --out tmp/x.png` → look → put the final prompt in the slide → `bin/deck loop` (generates once, caches in `assets/generated/` with `manifest.json`) → commit the files. Changing the prompt = new file; delete the old one.

Reusable across decks? Copy into `presentations/<company>/brand/photos/` + row in `brand/assets.md`.
