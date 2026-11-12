# PowerPoint Factory

Corporate-grade presentations as code: Bun + TypeScript recipes → native, editable `.pptx` (shapes, charts, tables, transitions, animations) → automatic QA with LibreOffice-rendered screenshots. AI writes the recipes, QA proves them, a fresh-eyes reviewer judges them. AI-maintained by developerz.ai; MIT; the sample "Halden" deck is the committed showcase.

## Non-negotiables

- **Gate:** `bin/check` == CI, always. Its 5 steps: `biome check .` · `tsc --noEmit` · guards (`bun scripts/lint/run.ts`: max-file-loc ≤ 300, env-in-example, no-bare-error, doc-links) · `bun test` · deck QA (`scripts/deck/qa.ts all`). Green locally before you stop.
- **No invented facts.** Numbers, customers, quotes, logos need a source. Missing fact → `TBD` in **notes** (never on a slide; QA fails on it), listed in your reply. Act, don't ask: clear brief → build end to end; ask only for facts you cannot source (numbers, names, decisions).
- **Done =** `bin/deck loop` PASS **and** you looked at the contact sheet **and** a fresh `deck-reviewer` returned `ship`. Say which of those you actually did.

## Stack

| Piece | Detail |
| --- | --- |
| Runtime | Bun ≥ 1.4.4 · TypeScript (`tsc --noEmit`) · Biome 2 (2-space, 160 cols, no `any`, no `!` assertions, organizeImports; `**/*.md` excluded) |
| Deps | pptxgenjs 4 · sharp · pixelmatch · opentype.js · fast-xml-parser · jszip · lucide-static |
| QA render | LibreOffice .pptx → PDF → `pdftoppm` PNG (`SOFFICE_BIN`, `QA_RENDER_DPI=110`) |
| CI system deps | libreoffice-impress · poppler-utils · fontconfig · carlito · caladea · liberation fonts · Gelasio |
| Tests | `bun test` (bun:test) — alone it runs unit + layout contract tests only: fast local iteration |
| AI media | Kubeez; no `KUBEEZ_API_KEY` → labeled placeholders + warnings, builds still pass |

## Commands

| Command | What |
| --- | --- |
| `bin/setup` | idempotent onboarding: OS deps + fonts + `bun install` + `.env` from `.env.example` + doctor |
| `bin/doctor` | what's missing + the fix |
| `bin/dev` · `bin/stop` | `dev` = `bin/deck loop`; `stop` halts dev services (placeholder today) |
| `bin/deck new <company> <project> <deck> [--theme cobalt\|ledger\|graphite\|terracotta] [--date YYYY-MM-DD]` | scaffold a deck |
| `bin/deck loop [deck]` | THE loop: build + QA + screenshots + what to look at next |
| `bin/deck qa [deck\|all] [--fast] [--strict]` | QA only |
| `bin/deck build [deck]` · `watch [deck] [--render]` | build once · rebuild on change |
| `bin/deck export [deck]` | QA-gated pptx + pdf, client-ready filename |
| `bin/deck approve [deck]` | accept screenshots as visual baseline |
| `bin/deck list` · `open` | deck inventory · open a deck |
| `bin/kubeez models\|balance\|brand-set\|generate\|status\|upload\|remove-bg` | AI media; [docs/kubeez.md](docs/kubeez.md) |
| `bin/check` | the gate (== CI): biome · tsc · guards · bun test · decks qa |

`[deck]` = `presentations/<company>/<project>/<YYYY-MM-DD>/<deck>` (omit → newest); output lands in `out/<same path>/`.

## Where things live

| Path | What |
| --- | --- |
| `presentations/<company>/BRAND.md` | brand brain: voice, logo rules, colors, approved facts — **read first** |
| `…/brand.ts` · `brand/` · `layouts/` | tokens (`extendTheme`), logos + reusable assets (`brand/assets.md`), company layouts |
| `…/<project>/<YYYY-MM-DD>/<deck>/` | `deck.ts` (meta + theme) · `slides/NN-name.ts` (one slide per file, filename order) · `assets/generated/` (Kubeez cache, committed) · `.baseline/` |
| `out/<same path>/` | gitignored **except the committed Halden showcase** (negated in `.gitignore`): `<deck>.pptx` `.pdf` `slides/<deck>-NN.png` `-contact-sheet.png` `-qa.md` `-outline.md` `-scene.json` `export/` — every file carries the deck name |
| `src/theme/` | theme types + the 4 themes (cobalt, graphite, ledger, terracotta) behind the `--theme` flag |
| `src/pipeline/` | deck pipeline stages: load, layout, build, qa, outline, paths |
| `src/cli/` | CLI plumbing: args, main, paths, targets |
| `src/scaffold/` | templates behind `deck new` |
| `src/deck.ts` · `src/slide.ts` | public DSL surface |
| `src/layouts/` | built-in layouts, one per file · registry `index.ts` · shared `parts.ts` |
| `src/core/` · `src/text/` | scene types, `el.ts` primitives, geometry, color, motion profiles, errors · Office-safe fonts ↔ metric twins, measure/wrap/auto-fit, inline markup |
| `src/render/` · `src/assets/` · `src/qa/` | scene → pptxgenjs + motion OOXML injection · image/icon/video/music resolve; `kubeez/` = the only Kubeez HTTP · checks/*, LibreOffice render, pixel checks, baseline diff, report |
| `scripts/<area>/<verb>.ts` | one verb per file; `bin/*` are thin shims; `scripts/lint/run.ts` = guards |
| `docs/` | `README` index + deck-craft · layouts · image-prompts · kubeez · motion · qa · extending · libraries |
| `.claude/` | `rules/<area>.md` · agents `deck-reviewer` + `brand-reviewer` · commands `/deck` `/review-deck` · skills `add-layout` `kubeez-media` `onboard-company` |
| `.dz/` | developerz.ai maintainer policy + scheduled briefs — this repo is AI-maintained |

## Deck loop (follow it)

1. **Brief → outline.** Read `BRAND.md`. Action titles only (ghost deck) — the titles alone must tell the story ([docs/deck-craft.md](docs/deck-craft.md)).
2. **Recipe.** One file per slide in `slides/`; pick the layout by message ([docs/layouts.md](docs/layouts.md)); speaker notes on every content slide.
3. **`bin/deck loop`.** Fix every ✖ (each has `→ fix`). Warnings: fix or justify in notes.
4. **Look.** Contact sheet first, then full-size `slides/<deck>-NN.png` for anything odd. Proofread `<deck>-outline.md`.
5. **Fresh eyes.** Dispatch `deck-reviewer` (`.claude/agents/`) with the paths — never review your own deck as final. Fix its list in one batch, re-loop.
6. **Ship.** `bin/deck export`. Report: path, slide count, QA counts, reviewer verdict, open TBDs.

## Rules

1. **Recipes are data.** Slides use layouts + props; a new shape of slide ⇒ a layout (company `layouts/` or `src/layouts/`), never coordinates in a slide file. One-offs: `layout: "custom"` with `el.*` primitives.
2. **SRP, small files.** ≤ 300 lines (guard), target < 150; one job per file; lift shared logic to `src/core` or `src/layouts/parts.ts` on second use.
3. **No `any`, no bare `Error`.** Throw `DeckError` subclasses with a `hint` (guard `no-bare-error`); named exports.
4. **Theme tokens only.** No hex in layouts except via `t.colors.*`/`mix()`; new color → theme/brand; every theme passes `test/themes.test.ts` (WCAG AA).
5. **Office-safe fonts only** (`src/text/fonts.ts`): Calibri, Arial, Georgia, Cambria, Times New Roman, Courier New; text measured with metric twins; never disable fit checks.
6. **Every env var** read in `src/env.ts` and declared in `.env.example` (guard `env-in-example`).
7. **All Kubeez HTTP** through `src/assets/kubeez/client.ts`; generated media cached by spec hash in the deck's `assets/generated/` — commit it; never regenerate what exists.
8. **New layout ⇒** file in `src/layouts/`, line in `index.ts`, fixture in `test/layouts.fixtures.ts` (test fails otherwise), row in [docs/layouts.md](docs/layouts.md).
9. **Copy:** action titles (sentence, ≤ 15 words), ≤ 6 bullets, ≤ 70 words/slide, numbers with units, a source on data slides; no slop words (`src/qa/checks/content.ts`), no emoji, no "Thank you" closer — end on `nextSteps`.
10. **Motion by intent:** `motion: "subtle"` (default: fade transition, no builds) · `"build"` (click reveals) · `"keynote"` (Morph) · `"none"` (read-ahead); never per-slide effect soup ([docs/motion.md](docs/motion.md)).

## PRs

Branch from `main`; one concern per PR; `bin/check` green locally (same gate as CI). Layout changes: inspect contact sheets before/after and update the showcase outputs in the same PR — builds are byte-reproducible, an unchanged deck leaves no diff. Parallel deck work splits by slide files (disjoint); no git worktrees.

## Subagents

- `deck-reviewer` — fresh-eyes design + story verdict from screenshots (read-only).
- `brand-reviewer` — checks copy/claims/logo use against `BRAND.md` (read-only).

## Gotchas

- Text overflow is measured, not guessed: a ✖ `text-overflow` means cut words, not shrink the box.
- `#slide:N` links break when files are added — QA checks range, not meaning; re-check after reordering.
- LibreOffice screenshots ≈ PowerPoint (metric-twin fonts); Morph/animations don't show in screenshots — the motion XML is validated instead.
- No `KUBEEZ_API_KEY` → labeled placeholders + warnings; builds still pass.
