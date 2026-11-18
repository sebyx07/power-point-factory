# Reviewer instructions — sebyx07/power-point-factory

> Read by the developerz.ai reviewer at EVERY review of this repository, at the reviewed
> commit, as this repo's own layer of the reviewer's prompt. It refines the platform rules
> (a finding is cited or withheld; the bot always discloses) and never overrides them.
> `CLAUDE.md` (`AGENTS.md` is a symlink to it) is the source of truth; this file is its
> review-time distillation. Keep it under 12,000 characters — past that it is cut.

## Stack

Bun + TypeScript recipes rendered to native, editable `.pptx` through pptxgenjs, with motion
OOXML injected (`src/render/`), then QA'd from LibreOffice-rendered screenshots (`src/qa/`).
Biome 2, `tsc --noEmit`, `bun test`. Kubeez (`src/assets/kubeez/`) is a paid media API.
A clone-and-use template: `main` is the product, nothing is published. The committed showcase
is the Halden deck under `presentations/halden/` with its outputs under `out/halden/`.

## What to reject

**Recipes are data**
- Coordinates, sizes or hex colors in a slide file under `presentations/**/slides/`. A new
  slide shape is a layout (company `layouts/` or `src/layouts/`); a one-off is
  `layout: "custom"` with `el.*` primitives.
- A layout that is not a pure `(props, ctx) => El[]`: I/O, hidden state, or unstable or
  duplicate element ids.
- A new layout missing any of: its file in `src/layouts/`, its line in `src/layouts/index.ts`,
  its fixture in `test/layouts.fixtures.ts`, its row in `docs/layouts.md`.

**Theme and text**
- A hex color in a layout outside `t.colors.*` / `mix()`; a new color that is not a theme or
  brand token; a theme change that does not keep `test/themes.test.ts` (WCAG AA) green.
- A font that is not Office-safe (`src/text/fonts.ts`: Calibri, Arial, Georgia, Cambria,
  Times New Roman, Courier New), text measured without its metric twin, or a fit check disabled.
- A change under `src/text/**` without `test/text.test.ts` updates.

**QA is never loosened**
- A QA check disabled, skipped, thresholded down or special-cased to make a deck pass. The fix
  is the layout or the copy.
- A new QA rule that is not a pure check in `src/qa/checks/` with a test that flags the bad case
  and passes the good one, and a row in `docs/qa.md`.

**Motion OOXML (`src/render/motion*.ts`)**
- PresentationML child order broken (cSld, clrMapOvr, transition, timing, extLst), `cTn` ids
  not unique or out of document order, `bldP` on anything but a `p:sp` shape, or p14/p159
  content without an `mc:AlternateContent` fallback. New structure needs
  `test/motion.test.ts` coverage.
- A default that auto-plays entrance builds; builds stay opt-in (`build`, `keynote`).

**Kubeez (paid)**
- HTTP to Kubeez outside `src/assets/kubeez/client.ts`.
- A change that lets a cache hit construct the client or need a key, re-generates media that
  is already committed under a deck's `assets/generated/`, retries a POST on 5xx, polls before
  the job id is recorded in `pending.json`, or changes cache keys of existing committed files.
  Each can bill credits twice.

**Code shape**
- A file over 300 lines (guard `max-file-loc`); `any` or a non-null `!` assertion.
- A bare `Error`: throw a `DeckError` subclass with a `hint` (guard `no-bare-error`).
- An env var read outside `src/env.ts` or missing from `.env.example` (guard `env-in-example`).
- Shared logic copied a second time instead of lifted to `src/core` or `src/layouts/parts.ts`.
- Backwards-compatibility shims, dead options or speculative abstractions.

**Showcase and facts**
- A layout or render change that does not rebuild the committed `out/halden/**` outputs in the
  same PR. Builds are byte-reproducible, so a stale showcase is a real defect, not noise.
- In the Halden deck, numbers that do not reconcile across slides (bridge, margins, table
  totals, dates, "slide N" references).
- An invented number, customer, quote or a real company's logo in a sample; `TBD` on a slide
  (it belongs in notes); slide copy past the rules (action titles of 15 words or fewer, 6
  bullets, 70 words a slide, units on numbers, a source on data slides, no slop words, no emoji,
  no "Thank you" closer).

**Changelog and docs**
- A user-visible change with no line under `## [Unreleased]` in `CHANGELOG.md`, or a command
  or DSL change that leaves `CLAUDE.md`, `llms.txt` or `docs/**` stale.
- A breaking DSL change (renamed prop, removed layout) merging without the owner: it escalates.

## Gates that matter

- The one required check is `CI OK` (`.github/workflows/ci.yml`), which runs `bin/check`:
  `biome check .`, `tsc --noEmit`, the guards (`bun scripts/lint/run.ts`: max-file-loc,
  env-in-example, no-bare-error, doc-links), `bun test`, and every deck through full QA
  (`bun scripts/deck/qa.ts all`). A change that does not pass it is not proven, whatever its
  description says.
- Visual changes are proven by before/after contact sheets (`out/**/<deck>-contact-sheet.png`,
  also uploaded by CI as the `decks` artifact); ask for them when a layout, theme or text
  change has none.

## Never flag

- Formatting Biome owns (2-space, 160 columns, import order); `**/*.md` is excluded from Biome.
- The committed `out/halden/**` binaries and PNGs, and committed `assets/generated/` media:
  both are intended, the first as the showcase, the second as the Kubeez cache.
- Labeled placeholder media and warnings when `KUBEEZ_API_KEY` is unset: builds pass on purpose.
- Morph and animations not visible in LibreOffice screenshots: the motion XML is validated
  instead.
- `bin/stop` being a placeholder today.
