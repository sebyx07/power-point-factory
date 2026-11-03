import { expect, test } from "bun:test";
import { contrast } from "@/core/color";
import { accentFor } from "@/core/el";
import { SAFE_FONTS } from "@/text/fonts";
import { themes } from "@/theme";

/** Token-level WCAG AA: every theme (and every brand you add here) must pass before any layout can. */
for (const [name, t] of Object.entries(themes)) {
  test(`theme ${name}: text roles pass AA on their canvases`, () => {
    const c = t.colors;
    const pairs: [string, string, string][] = [
      ["text/bg", c.text, c.bg],
      ["text/surface", c.text, c.surface],
      ["muted/bg", c.muted, c.bg],
      ["muted/surface", c.muted, c.surface],
      ["accent/bg", c.accent, c.bg],
      ["accent/surface", c.accent, c.surface],
      ["onDark/dark", c.onDark, c.dark],
      ["mutedOnDark/dark", c.mutedOnDark, c.dark],
      ["accentOnDark/dark", accentFor(t, true), c.dark],
      ["onAccent/accent", c.onAccent, c.accent],
    ];
    const fails = pairs
      .filter(([, a, b]) => contrast(a as `#${string}`, b as `#${string}`) < 4.5)
      .map(([k, a, b]) => `${k} ${contrast(a as `#${string}`, b as `#${string}`).toFixed(2)}`);
    expect(fails).toEqual([]);
  });
  test(`theme ${name}: Office-safe fonts`, () => {
    expect(SAFE_FONTS[t.fonts.display]).toBeDefined();
    expect(SAFE_FONTS[t.fonts.body]).toBeDefined();
  });
}
