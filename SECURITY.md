# Security Policy

## Supported versions

Only `main` is supported. Fixes land on `main`; there are no release branches.

## Reporting a vulnerability

**Report privately by email to gore.sebyx@yahoo.com. Do not open a public issue or pull request:** both are public, and an AI agent triages them in the open.

Include what is affected (commit, OS, Bun version), steps to reproduce (a minimal deck recipe is ideal) and the impact as you understand it. There is no fixed response time; you are credited in the changelog unless you ask not to be.

## In scope

- A deck recipe, brand file or asset that makes the build run code or touch files outside the repo, beyond what TypeScript recipes inherently can (recipes are code — see below)
- Leaking `KUBEEZ_API_KEY` or other `.env` values into outputs, logs, `scene.json`, manifests or commits
- Malicious content in generated `.pptx`/`.pdf` (XML injection through slide text, links, alt text or names)
- Shell/argument injection in `scripts/`, `bin/` or the QA renderer (LibreOffice, pdftoppm)

## Out of scope

- Recipes are TypeScript and run with your permissions: only build decks you trust, like any code
- Vulnerabilities in LibreOffice, poppler, Bun or npm dependencies themselves (report upstream; we bump)
- Content you choose to put on your own slides
