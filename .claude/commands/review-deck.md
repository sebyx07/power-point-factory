---

description: Fresh-eyes review of a deck — render, look, verdict. Read-only unless asked to fix.
argument-hint: [deck path] [--fix]
---

# /review-deck

Target: $ARGUMENTS (omit → newest deck)

1. `bin/deck qa <deck>` to refresh screenshots and `qa.md`.
2. Dispatch `deck-reviewer` with: deck path, `out/…/contact-sheet.png`, `out/…/outline.md`, `out/…/qa.md`, the company `BRAND.md`.
3. Relay its verdict and top findings. With `--fix`: apply all findings in one batch, re-run `bin/deck loop`, report the delta.
