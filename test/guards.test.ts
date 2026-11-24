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

test("dependency audit checks transitive and nested image-size resolutions and malformed locks", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = await mkdtemp(join(tmpdir(), "dependency-audit-"));
  const lockPath = join(dir, "bun.lock");
  const run = async (lock: unknown) => {
    await Bun.write(lockPath, typeof lock === "string" ? lock : JSON.stringify(lock));
    const proc = Bun.spawn([process.execPath, "scripts/lint/dependency-check.ts", lockPath], {
      stdout: "pipe",
      stderr: "pipe",
      timeout: 2000,
    });
    return { code: await proc.exited, output: `${await new Response(proc.stdout).text()}${await new Response(proc.stderr).text()}` };
  };
  const fixture = (version: string) => ({
    lockfileVersion: 2,
    workspaces: { "": { name: "fixture", dependencies: { pptxgenjs: "^4.0.1" } } },
    packages: {
      pptxgenjs: ["pptxgenjs@4.0.1", "", { dependencies: { "image-size": "*" } }, ""],
      "image-size": [`image-size@${version}`, "", {}, ""],
    },
  });
  try {
    const vulnerable = await run(fixture("1.2.1"));
    expect(vulnerable.code).not.toBe(0);
    expect(vulnerable.output).toContain("pptxgenjs@4.0.1 -> image-size@1.2.1");
    expect(vulnerable.output).toContain("GHSA-w3rx-r6r6-pgpr");
    expect(vulnerable.output).toContain("GHSA-5p2g-fcmc-qvqq");
    expect((await run(fixture("2.0.3"))).code).toBe(0);
    for (const registry of [null, 42, {}, []]) {
      const malformed = fixture("2.0.3");
      Object.assign(malformed.packages, { "image-size": ["image-size@2.0.3", registry, {}, ""] });
      expect((await run(malformed)).code).not.toBe(0);
    }
    for (const tuple of [
      [42, "", {}, ""],
      ["image-size@2.0.3", "", null, ""],
      ["image-size@2.0.3", "", {}, 42],
      ["image-size@2.0.3", "", {}],
    ]) {
      const malformed = fixture("2.0.3");
      Object.assign(malformed.packages, { "image-size": tuple });
      expect((await run(malformed)).code).not.toBe(0);
    }
    for (const key of [
      "broken/",
      "/broken",
      "broken//child",
      "@scope/",
      "broken/@scope/",
      "bad key",
      "@bad scope/parent",
      "parent/@scope/bad key",
      "@scope/.",
      "@scope/..",
      "@./child",
      "@../child",
      "parent/@scope/.",
      "parent/@scope/..",
      "parent/@./child",
      "parent/@../child",
    ]) {
      const malformed = fixture("2.0.3");
      Object.assign(malformed.packages, { [key]: ["broken@1.0.0", "", {}, ""] });
      const result = await run(malformed);
      expect(result.code).not.toBe(0);
      expect(result.output).toContain(`Invalid package key ${key}`);
    }
    const nested = fixture("2.0.3");
    Object.assign(nested.packages, { "pptxgenjs/image-size": ["image-size@1.2.1", "", {}, ""] });
    expect((await run(nested)).output).toContain("pptxgenjs@4.0.1 -> image-size@1.2.1");
    const scoped = fixture("2.0.3");
    Object.assign(scoped.packages, {
      "@scope/parent/@other/child": ["@other/child@1.0.0", "", { dependencies: { "image-size": "*" } }, ""],
      "@scope/parent/image-size": ["image-size@1.2.1", "", {}, ""],
    });
    const scopedResult = await run(scoped);
    expect(scopedResult.code).not.toBe(0);
    expect(scopedResult.output).toContain("locked @scope/parent/@other/child -> @other/child@1.0.0 -> image-size@1.2.1");
    const hoisted = {
      lockfileVersion: 2,
      workspaces: { "": { dependencies: { "@scope/parent": "*" } } },
      packages: {
        "@scope/parent": ["@scope/parent@1.0.0", "", { dependencies: { "@other/child": "*" } }, ""],
        "image-size": ["image-size@1.2.1", "", {}, ""],
      },
    };
    Object.assign(hoisted.packages, {
      "@scope/parent/@other/child": ["@other/child@1.0.0", "", { dependencies: { "image-size": "*" } }, ""],
    });
    const hoistedResult = await run(hoisted);
    expect(hoistedResult.code).not.toBe(0);
    expect(hoistedResult.output).toContain("root -> @scope/parent@1.0.0 -> @other/child@1.0.0 -> image-size@1.2.1");
    for (const name of ["@scope/_helper", "@_scope/helper", "@scope/.helper", "@scope/helper~extra", "@scope!/'helper(*)"]) {
      const valid = fixture("2.0.3");
      Object.assign(valid.packages, { [name]: [`${name}@1.0.0`, "", {}, ""] });
      const result = await run(valid);
      expect(result.output).toContain("No affected image-size resolutions");
      expect(result.code).toBe(0);
    }
    expect((await run("{ broken")).code).not.toBe(0);
    expect((await run({ lockfileVersion: 2, workspaces: { "": {} }, packages: { "image-size": ["image-size@garbage"] } })).code).not.toBe(0);
    expect((await run({ lockfileVersion: 2, workspaces: { "": { dependencies: { missing: "*" } } }, packages: {} })).code).not.toBe(0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
