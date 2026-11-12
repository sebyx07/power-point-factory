import { beforeAll, expect, test } from "bun:test";
import { text } from "@/core/el";
import { preloadFonts } from "@/text/fonts";
import { parseInline } from "@/text/inline";
import { measure, textWidthPt } from "@/text/measure";
import type { Theme } from "@/theme";
import { themes } from "@/theme";

const t: Theme = themes.cobalt;
beforeAll(() => preloadFonts(["Arial", "Calibri", "Georgia", "Cambria"]));

test("Calibri is narrower than Arial (metric twins loaded)", () => {
  expect(textWidthPt("Quarterly revenue", "Calibri", false, 18)).toBeLessThan(textWidthPt("Quarterly revenue", "Arial", false, 18));
});
test("Georgia twin measures without GSUB crashes", () => {
  expect(textWidthPt("ffi office — “quotes”", "Georgia", false, 20)).toBeGreaterThan(50);
});
test("wrap: long text in a narrow box takes more lines", () => {
  const wide = text(t, "a", { x: 0, y: 0, w: 10, h: 5 }, "one two three four five six seven eight nine ten");
  const narrow = text(t, "b", { x: 0, y: 0, w: 2, h: 5 }, "one two three four five six seven eight nine ten");
  expect(measure(narrow).lines).toBeGreaterThan(measure(wide).lines);
});
test("auto-fit shrinks, then flags overflow at minSize", () => {
  const fits = text(t, "a", { x: 0, y: 0, w: 4, h: 0.6 }, "A title that is a little long for its box", { role: "title" });
  expect(fits.size).toBeLessThan(t.type.title);
  const over = text(t, "b", { x: 0, y: 0, w: 1, h: 0.2 }, "Far too much text for a tiny box ".repeat(5));
  expect(over.overflow).toBe(true);
});
test("inline markup: bold, accent, italic, links", () => {
  const runs = parseInline("Revenue **$412M**, ==+9%==, _est._ see [appendix](#slide:12)", "#0A6E66");
  expect(runs.find((r) => r.text === "$412M")?.bold).toBe(true);
  expect(runs.find((r) => r.text === "+9%")?.color).toBe("#0A6E66");
  expect(runs.find((r) => r.text === "est.")?.italic).toBe(true);
  expect(runs.find((r) => r.text === "appendix")?.link).toBe("#slide:12");
});
test("snake_case words are not italicized", () => {
  expect(parseInline("use model_id here").some((r) => r.italic)).toBe(false);
});
