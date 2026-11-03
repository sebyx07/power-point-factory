# Image, video & music prompts that don't look AI-made

Rule: **write like a photographer, not a prompt engineer.** The tell of AI imagery is genericness — glowing, symmetric, golden, perfect.

## Formula

`medium` → `subject + action` → `setting` → `light` → `lens/camera` → `palette (from BRAND.md)` → `composition` → `exclusions`

> Editorial photograph, two planners reviewing a printed route map on a cluttered depot desk, overcast window light from the left, 35mm lens, f/2.8, shallow depth of field, slight grain, muted teal and grey palette, negative space on the right for text, candid, no text, no logos

## Use

- Medium: _editorial photograph, documentary photo, aerial drone photograph, product still life on seamless paper, architectural photograph_.
- Light: _overcast, window light, fluorescent office light, blue hour, low winter sun_ (not "golden hour" by default — it's now an AI tell).
- Lens: _35mm, 50mm, 85mm, f/2.8, shallow depth of field, slight grain, Kodak Portra 400_.
- Imperfection: _candid, slightly cluttered, natural skin texture, worn surfaces_.
- Composition: _negative space left/right for text_, _subject in the lower third_, _eye level_.
- Prefer hands, materials, places, objects over faces. People: never presented as real customers or staff.

## Never

`futuristic` `glowing` `holographic` `neon` `8k` `masterpiece` `hyper-realistic` `stunning` `cinematic` (alone) · globes with arcs, circuit brains, robot hands, handshakes, posed smiling groups, screens with readable text (models garble it), purple-blue gradients.

## By slot

| Slot                       | Aspect                           | Notes                                     |
| -------------------------- | -------------------------------- | ----------------------------------------- |
| `cover.image` (right half) | `3:4`                            | vertical subject, calm top area           |
| `imageFull`                | `16:9`                           | busy bottom is fine — the scrim covers it |
| `bullets.image`            | `3:4` or `4:5`                   | single clear subject                      |
| `quote.portrait`           | `3:4`                            | environment portrait, not a headshot      |
| object / product cut-out   | `1:1` + `removeBackground: true` | seamless background in the prompt         |

## Video (Kubeez text-to-video)

Describe one shot, one camera move, 5 s: _"Slow dolly forward along a warehouse aisle at dawn, pallet racks on both sides, cool window light, handheld feel, no people, no text."_ Keep `sound: false` for presented decks. Full-bleed only on keynote/opening slides.

## Music (keynote openers only — never board decks)

_"Calm minimal piano with soft pads, 70 bpm, understated corporate keynote underscore, no drums, no vocals."_ Use `instrumental: true`. Place with `extra: [soundtrack({ prompt })]` on the opening slide only.
