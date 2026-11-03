# CLAUDE.md

**PowerPoint Factory** — corporate-grade presentations as code. Bun + TypeScript recipes → native, editable `.pptx` (shapes, charts, tables, transitions, animations) → automatic QA with screenshots. AI writes the recipes; QA proves them; a fresh-eyes reviewer judges them.

## Response rules

- Act, don't ask: clear brief → build the deck end to end. Ask only for facts you cannot source (numbers, names, decisions).
- Never invent numbers, customers, quotes or logos. Missing fact → put `TBD` in **notes** (never on a slide; QA fails on it) and list it in your reply.
- Done = `bin/deck loop` is PASS **and** you looked at the contact sheet **and** a fresh `deck-reviewer` returned `ship`. Say which of those you actually did.

## Where things live

| Path                                                       | What                                                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `presentations/<company>/BRAND.md`                         | brand brain: voice, logo rules, colors, approved facts — **read first**                                                                                 |
| `presentations/<company>/brand.ts` · `brand/` · `layouts/` | tokens (`extendTheme`), logos + reusable assets (`brand/assets.md`), company layouts                                                                    |
| `presentations/<company>/<project>/<YYYY-MM-DD>/<deck>/`   | `deck.ts` (meta + theme) · `slides/NN-name.ts` (one slide per file, filename order) · `assets/` (`generated/` = Kubeez cache, committed) · `.baseline/` |
| `out/<same path>/`                                         | generated, gitignored: `<deck>.pptx` `.pdf` `slides/slide-NN.png` `contact-sheet.png` `qa.md` `outline.md` `scene.json` `export/`                       |
| `src/layouts/*.ts`                                         | built-in layouts (one per file) · registry `src/layouts/index.ts`                                                                                       |
| `src/core/`                                                | scene types, `el.ts` primitives, geometry, color, motion profiles, errors                                                                               |
| `src/text/`                                                | Office-safe fonts ↔ metric twins, measure/wrap/auto-fit, inline markup                                                                                  |
| `src/render/`                                              | scene → pptxgenjs; `motion*.ts` injects transition/timing OOXML                                                                                         |
| `src/assets/`                                              | image/icon/video/music resolve; `kubeez/` = the only Kubeez HTTP                                                                                        |
| `src/qa/`                                                  | static checks (`checks/*`), LibreOffice render, pixel checks, baseline diff, report                                                                     |
| `scripts/<area>/<verb>.ts`                                 | one verb per file; `bin/*` are thin shims                                                                                                               |
| `docs/`                                                    | craft rules, layout catalog, Kubeez API, motion, QA, extending                                                                                          |

## Commands

```sh
bin/setup                      # deps, .env, system check (LibreOffice, poppler, fonts)
bin/doctor                     # what's missing + the fix
bin/deck new <company> <project> <deck> [--theme cobalt|ledger|graphite|terracotta] [--date YYYY-MM-DD]
bin/deck loop [deck]           # THE loop: build + QA + screenshots + what to look at next
bin/deck qa [deck|all] [--fast] [--strict]
bin/deck watch [deck] [--render]
bin/deck export [deck]         # QA-gated pptx + pdf, client-ready filename
bin/deck approve [deck]        # accept screenshots as visual baseline
bin/kubeez models|balance|generate|status|upload|remove-bg
bin/check                      # the gate (== CI): biome, tsc, guards, bun test, all decks QA
```
`[deck]` = `presentations/<company>/<project>/<date>/<deck>` (omit → newest).

## The deck loop (follow it)

1. **Brief → outline.** Read `BRAND.md`. Write action titles only (ghost deck), check the titles alone tell the story. Structure: `docs/deck-craft.md`.
2. **Recipe.** One file per slide in `slides/`. Pick the layout by message (`docs/layouts.md`). Speaker notes on every content slide.
3. **`bin/deck loop`.** Fix every ✖ (each has `→ fix`). Warnings: fix or justify in notes.
4. **Look.** Read `out/…/contact-sheet.png`, then full-size `slides/slide-NN.png` for anything odd. Proofread `outline.md`.
5. **Fresh eyes.** Dispatch `deck-reviewer` (`.claude/agents/`) with the paths — never review your own deck as final. Fix its list in one batch, re-loop.
6. **Ship.** `bin/deck export`. Report: path, slide count, QA counts, reviewer verdict, open TBDs.

## Rules

1. **Recipes are data.** Slides use layouts + props. Need a new shape of slide → a layout (company `layouts/` or `src/layouts/`), never coordinates in a slide file. One-offs: `layout: "custom"` with `el.*` primitives.
2. **SRP, small files.** ≤ 300 lines (guard), target < 150. One job per file. Lift shared logic to `src/core` or `src/layouts/parts.ts` on second use.
3. **No `any`, no bare `Error`.** Throw `DeckError` subclasses with a `hint` (guard `no-bare-error`). Named exports.
4. **Theme tokens only.** No hex in layouts except via `t.colors.*`/`mix()`. New color → theme/brand. Every theme passes `test/themes.test.ts` (WCAG AA).
5. **Office-safe fonts only** (`src/text/fonts.ts`): Calibri, Arial, Georgia, Cambria, Times New Roman, Courier New. Text is measured with metric twins; never disable fit checks.
6. **Every env var** read in `src/env.ts` and declared in `.env.example` (guard).
7. **All Kubeez HTTP** through `src/assets/kubeez/client.ts`. Generated media cached by spec hash in the deck's `assets/generated/` — commit it; never regenerate what exists.
8. **New layout ⇒** file in `src/layouts/`, line in `index.ts`, fixture in `test/layouts.fixtures.ts` (test fails otherwise), row in `docs/layouts.md`.
9. **Copy:** action titles (sentence, ≤ 15 words), ≤ 6 bullets, ≤ 70 words/slide, numbers with units, a source on data slides. No slop words (`src/qa/checks/content.ts`), no emoji, no "Thank you" closer — end on `nextSteps`.
10. **Motion by intent:** `motion: "subtle"` (default: fade transition, no builds) · `"build"` (click reveals) · `"keynote"` (Morph) · `"none"` (read-ahead). Never per-slide effect soup.

## Subagents

- `deck-reviewer` — fresh-eyes design + story verdict from screenshots (read-only).
- `brand-reviewer` — checks copy/claims/logo use against `BRAND.md` (read-only).
- Parallel deck work: split by slide files (disjoint). No git worktrees.

## Gotchas

- Text overflow is measured, not guessed: a ✖ `text-overflow` means cut words, not shrink the box.
- `#slide:N` links break when files are added — QA checks range, not meaning; re-check after reordering.
- LibreOffice screenshots ≈ PowerPoint (metric-twin fonts). Morph/animations don't show in screenshots; XML is validated instead.
- No `KUBEEZ_API_KEY` → labeled placeholders + warnings; builds still pass.
