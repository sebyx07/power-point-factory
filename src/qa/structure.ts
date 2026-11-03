import { XMLValidator } from "fast-xml-parser";
import JSZip from "jszip";
import type { Scene } from "@/core/types";
import { type Finding, f } from "./types";

/** the .pptx itself: slide count, every XML part well-formed, motion parts present */
export async function structureChecks(pptx: Uint8Array, scene: Scene): Promise<Finding[]> {
  const out: Finding[] = [];
  const zip = await JSZip.loadAsync(pptx);
  const slides = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  if (slides.length !== scene.slides.length) out.push(f("error", "pptx-slides", 0, `pptx has ${slides.length} slides, scene ${scene.slides.length}`));
  for (const name of Object.keys(zip.files).filter((n) => n.endsWith(".xml") || n.endsWith(".rels"))) {
    const xml = await zip.file(name)?.async("string");
    if (!xml) continue;
    const v = XMLValidator.validate(xml);
    if (v !== true)
      out.push(f("error", "pptx-xml", 0, `${name} is malformed: ${v.err.msg} (line ${v.err.line})`, { fix: "a renderer emitted bad XML — see src/render/" }));
  }
  for (const s of scene.slides) {
    const xml = (await zip.file(`ppt/slides/slide${s.index}.xml`)?.async("string")) ?? "";
    const animated = s.elements.some((e) => e.anim);
    if (animated && !xml.includes("<p:timing>")) out.push(f("error", "motion", s.index, "animations declared but no <p:timing> in slide XML"));
    if (s.transition.type !== "none" && !xml.includes("<p:transition")) out.push(f("error", "motion", s.index, "transition declared but missing in slide XML"));
    const titled = s.elements.some((e) => e.id === "title");
    if (titled && !xml.includes('<p:ph type="title"/>'))
      out.push(
        f("error", "slide-title", s.index, "title not marked as a title placeholder", { fix: "src/render/titles.ts regex no longer matches pptxgenjs output" }),
      );
    if (!titled && !["imageFull", "video", "quote"].includes(s.layout))
      out.push(f("info", "slide-title", s.index, "no slide title — PowerPoint outline and screen readers show 'Slide N'"));
  }
  return out;
}
