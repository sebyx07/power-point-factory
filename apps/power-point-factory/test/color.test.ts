import { expect, test } from "bun:test";
import { contrast, mix, rgb, toHex } from "@/core/color";
import { DeckSpecError } from "@/core/errors";

test("contrast: black on white is 21:1, same color is 1:1", () => {
  expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  expect(contrast("#1F4FD8", "#1F4FD8")).toBeCloseTo(1, 5);
});
test("mix blends linearly", () => {
  expect(mix("#FFFFFF", "#000000", 0.5)).toBe("#808080");
  expect(toHex(rgb("#0a6e66"))).toBe("#0A6E66");
});
test("bad hex throws a domain error with a hint", () => {
  expect(() => rgb("#fff" as `#${string}`)).toThrow(DeckSpecError);
});
