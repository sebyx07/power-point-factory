---
name: onboard-company
description: Use when a presentation is for a company that has no presentations/<company>/ folder yet (or an empty BRAND.md). Researches the brand from public sources, downloads logos, writes BRAND.md + brand.ts so every later deck is on-brand.
---

# Onboard a company

1. **Scaffold:** `bin/deck new <company> <project> <deck>` creates `presentations/<company>/{BRAND.md,brand.ts,brand/,layouts/}`.
2. **Research (public sources only):** website, press/media kit, annual report, LinkedIn. Note URL + date for every fact.
3. **Logos → `brand/`:** prefer the official press kit SVG. Save `logo.svg` (light canvas) and `logo-white.svg` (dark). No SVG? Highest-res PNG; transparent background via `bin/kubeez remove-bg <file> --out presentations/<company>/brand/logo.png`. Never redraw or "approximate" a real company's logo.
4. **Colors:** sample the primary + accent from the logo/site (exact hex). Map to roles in `BRAND.md` (accent, ink, muted, surface). Check AA: add the brand to `test/themes.test.ts` if it becomes a shared theme; otherwise `bin/deck qa` contrast checks cover it.
5. **Fonts:** record the brand font, then map to the nearest Office-safe face (geometric sans → Arial; humanist sans → Calibri; serif → Georgia/Cambria). Write the mapping in `BRAND.md` § Type.
6. **Voice + facts:** 3 voice adjectives, words they use/avoid, approved facts with sources. Unknown → write "undecided", never invent.
7. **Imagery:** describe their photo style in one paragraph (this becomes the base of every Kubeez prompt).
8. **`brand.ts`:** `extendTheme(<closest base theme>, { colors, fonts, logo: { onLight, onDark } })`.
9. **Reusable assets:** anything downloaded/generated for reuse goes in `brand/` with a row in `brand/assets.md` (file, what, source, license).
10. **Verify:** `bin/deck loop` on the first deck; check logo on cover + closing in the contact sheet.

Licensing: logos are used only in decks for/with that company. Note the license in `assets.md`.
