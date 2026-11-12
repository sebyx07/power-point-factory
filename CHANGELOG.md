# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning: [SemVer](https://semver.org/spec/v2.0.0.html). This is a template repo: there are no published packages, `main` is the product.

## [Unreleased]

### Added

- PowerPoint Factory: typed Bun/TypeScript slide recipes → native, editable `.pptx` (shapes, charts, tables, notes, real slide titles) → LibreOffice/poppler render → automatic QA with screenshots.
- 23 layouts including executive summary, waterfall, 2×2 matrix, process chevrons, Gantt roadmap, RAG/harvey-ball tables, next steps, references, video.
- Motion profiles `none` · `subtle` · `build` · `keynote` (OOXML transition/timing injection, Morph pairing).
- QA: measured text fit with metric-twin fonts, WCAG contrast against real backdrops, overlap/bounds, slop phrases, chart and story rules, slide-reference ranges, table-cell overflow, rendered-pixel checks, baseline diffs.
- Kubeez images, cut-outs, video and music with a commit-friendly cache: deduped, resumable after crashes, never billed twice.
- Byte-reproducible `.pptx` and `.pdf` builds.
- Company brand folders (`BRAND.md`, `brand.ts`, `brand/`, `layouts/`), the Halden Logistics showcase, Claude Code setup (`/deck`, `/review-deck`, reviewer agents, skills), developerz.ai maintainer config.
- `package.json` dev/stop scripts (`bun run dev` → `bin/dev`, `bun run stop` → `bin/stop`).

### Fixed

- `bin/setup` no longer aborts when fontconfig is missing: it warns, skips the Gelasio (Georgia twin) install and proceeds to `bun install`; a failed Gelasio download removes the partial file before warning, so a rerun retries instead of keeping a corrupt font registered by fc-cache.
