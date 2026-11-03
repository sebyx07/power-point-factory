# Contributing

Bug reports and pull requests are welcome at https://github.com/sebyx07/power-point-factory. AI-assisted contributions are welcome too; the same checks apply. This repo is AI-maintained by [developerz.ai](https://developerz.ai) (`.dz/`): an agent triages issues, reviews PRs and merges on a green `CI OK`.

## Setup

Requirements: [Bun](https://bun.sh) ≥ 1.4.4, LibreOffice (headless render), poppler (`pdftoppm`), fontconfig and the metric-compatible fonts Carlito, Caladea, Liberation, Gelasio. `bin/doctor` prints every missing piece with its install command.

```bash
bin/setup        # install, .env, system check
bin/check        # the gate == CI: biome, tsc, guards, bun test, every deck through full QA
bun test         # unit + layout contract tests only (fast)
bin/deck loop    # build + QA + screenshots of the newest deck
```

No `KUBEEZ_API_KEY` needed: committed generated media is reused from cache, so the sample builds offline.

## Where things are

- Engine: `src/` (layouts, render, text measurement, QA, Kubeez). Public DSL surface: `src/deck.ts`, `src/slide.ts`.
- CLI verbs: `scripts/<area>/<verb>.ts`, shims in `bin/`.
- Decks: `presentations/<company>/<project>/<date>/<deck>/`; outputs in `out/` (gitignored except the Halden showcase).
- Rules, commands and the deck loop: [CLAUDE.md](CLAUDE.md). Craft + reference: [docs/](docs/README.md).

## Pull requests

1. Branch from `main`; one concern per PR.
2. `bin/check` passes locally. It is the same gate CI runs.
3. Layout changes: look at the contact sheets (`out/**/<deck>-contact-sheet.png`) before and after; update the showcase outputs in the same PR (builds are byte-reproducible, so an unchanged deck leaves no diff).
4. New layout → file in `src/layouts/`, line in `src/layouts/index.ts`, fixture in `test/layouts.fixtures.ts`, row in `docs/layouts.md`.
5. New QA rule → pure check in `src/qa/checks/` with a test that flags bad and passes good; row in `docs/qa.md`.
6. User-visible change → a line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md); update `llms.txt`/`CLAUDE.md` if commands or the DSL changed.

## Style

Biome (`biome.json`): 2-space indent, 160 columns, no `any`, no non-null assertions. Files ≤ 300 lines (guard). Throw `DeckError` subclasses with a `hint`, never bare `Error` (guard). Every env var declared in `.env.example` (guard).
