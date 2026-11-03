---
description: Fresh-eyes review of a deck — render, look, verdict. Read-only unless asked to fix.
argument-hint: [deck path] [--fix]
---

# /review-deck

Target: $ARGUMENTS (omit → newest deck)

1. `bin/deck qa <deck>` to refresh screenshots and `<deck>-qa.md`.
2. Dispatch `deck-reviewer` with: deck path, `out/…/<deck>-contact-sheet.png`, `out/…/<deck>-outline.md`, `out/…/<deck>-qa.md`, the company `BRAND.md`.
3. Relay its verdict and top findings. With `--fix`: apply all findings in one batch, re-run `bin/deck loop`, report the delta.
