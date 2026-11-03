import { expect, test } from "bun:test";
import { text } from "@/core/el";
import type { Scene } from "@/core/types";
import { content } from "@/qa/checks/content";
import { preloadFonts } from "@/text/fonts";
import { themes } from "@/theme";
import { declared } from "../scripts/lint/env-in-example";

test("env guard parses commented and live declarations", () => {
  expect([...declared("KUBEEZ_API_KEY=1\n# QA_DPI=\nnot this\n")]).toEqual(["KUBEEZ_API_KEY", "QA_DPI"]);
});
test("slop + placeholder detection", async () => {
  await preloadFonts(["Arial"]);
  const t = themes.cobalt;
  const scene: Scene = {
    title: "x",
    size: { w: 13.333, h: 7.5 },
    slides: [
      {
        index: 1,
        layout: "bullets",
        background: "#FFFFFF",
        transition: { type: "none" },
        build: null,
        morph: false,
        notes: "n",
        elements: [text(t, "b", { x: 1, y: 1, w: 8, h: 2 }, "Unlock seamless synergies TODO")],
      },
    ],
  };
  const rules = content(scene).map((f) => f.rule);
  expect(rules).toContain("slop");
  expect(rules).toContain("placeholder-text");
});
test("net leverage (finance) is not slop", async () => {
  await preloadFonts(["Arial"]);
  const scene: Scene = {
    title: "x",
    size: { w: 13.333, h: 7.5 },
    slides: [
      {
        index: 1,
        layout: "bullets",
        background: "#FFFFFF",
        transition: { type: "none" },
        build: null,
        morph: false,
        notes: "n",
        elements: [text(themes.cobalt, "b", { x: 1, y: 1, w: 8, h: 2 }, "Net leverage down to 1.1×")],
      },
    ],
  };
  expect(content(scene).filter((f) => f.rule === "slop")).toEqual([]);
});
