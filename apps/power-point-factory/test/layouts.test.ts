import { expect, test } from "bun:test";
import type { Layout } from "@/core/deck";
import type { Scene } from "@/core/types";
import { layouts } from "@/layouts";
import { staticChecks } from "@/qa/checks";
import { ctx } from "./helpers";
import { FIXTURES } from "./layouts.fixtures";

/** Every built-in layout, with realistic content, renders with zero QA errors in every theme. */
for (const theme of ["cobalt", "ledger", "graphite", "terracotta"] as const) {
  test(`all layouts pass static QA — ${theme}`, async () => {
    const c = await ctx(theme);
    const slides = Object.entries(FIXTURES).map(([name, props], i) => {
      const l = layouts[name as keyof typeof layouts] as unknown as Layout<unknown>;
      return {
        index: i + 1,
        layout: name,
        background: l.background?.(c, props) ?? c.theme.colors.bg,
        elements: l.render(props, c),
        transition: { type: "none" as const },
        build: null,
        morph: false,
      };
    });
    const scene: Scene = { title: "t", size: { w: 13.333, h: 7.5 }, slides };
    const errors = staticChecks(scene, c.theme).filter((f) => f.severity === "error" && f.rule !== "image-placeholder");
    expect(errors.map((e) => `${e.slide}:${slides[e.slide - 1]?.layout} ${e.rule} ${e.message}`)).toEqual([]);
  });
}
test("every layout has a fixture", () => {
  expect(Object.keys(layouts).filter((l) => !(l in FIXTURES) && l !== "custom")).toEqual([]);
});
