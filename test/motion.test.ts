import { expect, test } from "bun:test";
import { XMLValidator } from "fast-xml-parser";
import { motionSpec } from "@/core/motion";
import type { SceneSlide } from "@/core/types";
import { injectSlide } from "@/render/motion";
import { timingXml, transitionXml } from "@/render/motion-xml";

const wrap = (x: string) => `<p:sld xmlns:p="p" xmlns:mc="mc" xmlns:p14="p14">${x}</p:sld>`;

test("transitions are well-formed for every type", () => {
  for (const type of ["fade", "push", "wipe", "morph"] as const) expect(XMLValidator.validate(wrap(transitionXml({ type, duration: 500 })))).toBe(true);
  expect(transitionXml({ type: "none" })).toBe("");
});
test("timing: auto and click builds are well-formed, ids unique and ascending", () => {
  const steps = [
    { spids: [4], effect: "fade" as const, bld: [4] },
    { spids: [5, 6], effect: "rise" as const, bld: [5] },
    { spids: [7], effect: "wipe" as const, bld: [] },
  ];
  for (const trigger of ["auto", "click"] as const) {
    const x = timingXml(steps, { trigger, dur: 300, stagger: 100 }, [{ spid: 9, kind: "video" }]);
    expect(XMLValidator.validate(wrap(x))).toBe(true);
    const ids = [...x.matchAll(/cTn id="(\d+)"/g)].map((m) => Number(m[1]));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  }
  expect(timingXml([{ spids: [4], effect: "fade", bld: [4] }], { trigger: "click", dur: 300, stagger: 0 })).not.toContain("clickEffect");
});
test("injectSlide places transition+timing after clrMapOvr and resolves object names", () => {
  const xml =
    `<p:sld xmlns:p="p"><p:cSld><p:spTree><p:sp><p:nvSpPr><p:cNvPr id="4" name="bullet-0"/></p:nvSpPr></p:sp></p:spTree></p:cSld><p:clrMapOvr/></p:sld>`.replace(
      "<p:clrMapOvr/>",
      "<p:clrMapOvr></p:clrMapOvr>",
    );
  const slide: SceneSlide = {
    index: 2,
    layout: "bullets",
    background: "#FFFFFF",
    elements: [{ kind: "shape", id: "bullet-0", box: { x: 0, y: 0, w: 1, h: 1 }, role: "decor", shape: "rect", anim: { effect: "fade", order: 1 } }],
    transition: { type: "fade" },
    build: { trigger: "auto", dur: 300, stagger: 100 },
    morph: false,
  };
  const out = injectSlide(xml, slide);
  expect(out.indexOf("</p:clrMapOvr>")).toBeLessThan(out.indexOf("<mc:AlternateContent"));
  expect(out).toContain('spid="4"');
  expect(out).toContain("xmlns:mc=");
});
test("motion profiles: none strips builds, keynote morphs", () => {
  expect(motionSpec("none", { type: "fade" }).build).toBeNull();
  // default must not auto-build: transition + cascading fades flicker on slide enter
  expect(motionSpec("subtle", { type: "fade" }).build).toBeNull();
  expect(motionSpec("keynote", { type: "fade" }).morph).toBe(true);
  expect(motionSpec("build", { type: "fade" }).build?.trigger).toBe("click");
});

import { markTitle } from "@/render/titles";

test("markTitle turns the title text box into a title placeholder", () => {
  const xml = `<p:nvSpPr><p:cNvPr id="4" name="title"></p:cNvPr><p:cNvSpPr/><p:nvPr></p:nvPr></p:nvSpPr>`;
  expect(markTitle(xml)).toContain('<p:ph type="title"/>');
  expect(markTitle(xml.replace('name="title"', 'name="!!title"'))).toContain('<p:ph type="title"/>');
  expect(markTitle(xml.replace('name="title"', 'name="subtitle"'))).not.toContain("<p:ph");
});
