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

test("cached generated media never needs a Kubeez key (fresh clones build offline)", async () => {
  const { generateImage, generatedPath } = await import("@/assets/kubeez/generate");
  const { mkdir, rm } = await import("node:fs/promises");
  const dir = `${import.meta.dir}/../tmp/cache-test`;
  const spec = { prompt: "cached photo", aspect: "16:9" as const };
  const path = generatedPath(dir, spec);
  await mkdir(`${dir}/assets/generated`, { recursive: true });
  await Bun.write(path, "x");
  const boom = () => {
    throw new Error("client must not be constructed on a cache hit");
  };
  expect(await generateImage(dir, spec, boom)).toBe(path);
  await rm(dir, { recursive: true, force: true });
});

test("normalizePdf is length-preserving and erases run-specific stamps", async () => {
  const { normalizePdf } = await import("@/qa/pdf-normalize");
  const mk = (t: string, id: string) =>
    new TextEncoder().encode(
      `<xmp:CreateDate>2026-11-03T${t}-05:00</xmp:CreateDate>/CreationDate(D:20261103${t.replace(/:/g, "")}-05'00')/ID [ <${id}>\n<${id}> ]\n/DocChecksum /${id}\n`,
    );
  const at = new Date("2026-11-03T00:00:00Z");
  const a = normalizePdf(mk("08:28:22", "A".repeat(32)), at);
  const b = normalizePdf(mk("09:41:07", "B".repeat(32)), at);
  expect(a.length).toBe(mk("08:28:22", "A".repeat(32)).length);
  expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
});

test("table overflow: a wrapping cell that pushes the table into the footer is an error", async () => {
  const { tables } = await import("@/qa/checks/tables");
  const { table } = await import("@/core/el");
  await preloadFonts(["Arial"]);
  const long = "A very long description that will certainly wrap across several lines in a narrow column";
  const el = table(themes.cobalt, "t", { x: 0.7, y: 2.2, w: 6, h: 0 }, { header: ["Item", "Note"], rows: Array.from({ length: 8 }, () => ["Row", long]) });
  const scene: Scene = {
    title: "x",
    size: { w: 13.333, h: 7.5 },
    slides: [{ index: 1, layout: "table", background: "#FFFFFF", transition: { type: "none" }, build: null, morph: false, elements: [el] }],
  };
  expect(tables(scene).map((f) => f.rule)).toContain("table-overflow");
});
