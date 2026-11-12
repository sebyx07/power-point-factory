# Halden Logistics — brand brief

> Fictional sample company shipped with the repo. Copy this file's shape for real clients (`bin/deck new` scaffolds it).
> Agents: read this before writing any Halden slide. Tokens in code: [`brand.ts`](brand.ts).

## Who they are

- Nordic-headquartered contract logistics + freight forwarding. 38 sites, 5 regions, ~$1.6B revenue (FY2026).
- Audience for decks: board, lenders, enterprise retail and health-care customers. Conservative, numerate readers.

## Voice

- Plain, numerate, understated. Swedish-engineering calm: state the number, then the reason.
- Use: "on-time delivery", "pallet positions", "contract logistics", "network".
- Never: "solutions", "best-in-class", "seamless", "end-to-end", exclamation marks, emoji.
- Numbers: `$412M`, `14.2%`, `+2.6 pts`, `1.1×`. US-English spelling except proper nouns.

## Logo

| File                   | Use                                                   |
| ---------------------- | ----------------------------------------------------- |
| `brand/logo.svg`       | light canvases (default)                              |
| `brand/logo-white.svg` | dark canvases (cover without image, section, closing) |
- Placed automatically on cover + closing (`theme.logo`). Min height 0.35 in. Clear space = height of the mark.
- Never recolor, stretch, put on photos without a scrim, or place in the content-slide footer (`footerLogo` stays off).

## Colors

| Role                 | Hex                  | Use                                                |
| -------------------- | -------------------- | -------------------------------------------------- |
| Accent — Halden teal | `#0A6E66`            | eyebrows, the one highlighted number/series, links |
| Ink                  | `#0E1A2B`            | text, dark canvases                                |
| Muted                | `#55617A`            | secondary text, captions                           |
| Surface              | `#F2F5FA`            | tiles, cards, callouts                             |
| Chart greys          | `#A9C2BF`, `#D3DCE6` | non-hero series                                    |
| Amber (warn)         | `#C77D1A`            | at-risk only                                       |

## Type

- Arial throughout (Office-safe; Liberation Sans on Linux for measurement). Bold for titles and figures only.

## Imagery

- Real operations: warehouses, docks, trucks, people at work, Scandinavian light. Documentary, muted, cool.
- No: glowing networks, globes with arcs, robots, handshake stock, drone-swarm futurism.
- Reusable assets: [`brand/assets.md`](brand/assets.md).

## Approved facts (use verbatim; anything else needs a source)

- Founded 1987, Gothenburg. 38 sites, 5 regions. ~6,900 employees.
- GDP-certified cold chain in 3 hubs (2026).

## Decks

- `q4-business-review/2026-11-03/board-update` — Q4 board review, Nordic hub decision.
