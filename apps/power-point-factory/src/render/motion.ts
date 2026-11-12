import JSZip from "jszip";
import { RenderError } from "@/core/errors";
import type { Scene, SceneSlide } from "@/core/types";
import { ROOT_NS, type Step, timingXml, transitionXml } from "./motion-xml";
import { markTitle } from "./titles";

/** objectName → cNvPr id, read back from the slide XML pptxgenjs wrote */
export function shapeIds(xml: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const m of xml.matchAll(/<p:cNvPr id="(\d+)" name="([^"]+)"/g)) out.set(m[2] ?? "", Number(m[1]));
  return out;
}

export function stepsFor(slide: SceneSlide, ids: Map<string, number>): Step[] {
  const byOrder = new Map<number, Step>();
  for (const el of slide.elements) {
    if (!el.anim) continue;
    const spid = ids.get(el.id);
    if (spid === undefined) throw new RenderError(`slide ${slide.index}: animated "${el.id}" not found in XML`);
    const isSp = el.kind === "text" || el.kind === "shape";
    const step = byOrder.get(el.anim.order);
    if (step) {
      step.spids.push(spid);
      if (isSp) step.bld.push(spid);
    } else byOrder.set(el.anim.order, { spids: [spid], effect: el.anim.effect, bld: isSp ? [spid] : [] });
  }
  return [...byOrder.entries()].sort(([a], [b]) => a - b).map(([, s]) => s);
}

export function injectSlide(xml: string, slide: SceneSlide): string {
  const tx = transitionXml(slide.transition);
  const ids = shapeIds(xml);
  const plays = slide.elements
    .flatMap((e) => (e.kind === "media" && e.autoplay && !e.resolved?.placeholder ? [{ spid: ids.get(e.id) ?? -1, kind: e.media }] : []))
    .filter((p) => p.spid > 0);
  const tm = slide.build || plays.length ? timingXml(slide.build ? stepsFor(slide, ids) : [], slide.build ?? undefined, plays) : "";
  if (!tx && !tm) return xml;
  let out = xml.replace(/<p:sld\b([^>]*)>/, (m, attrs: string) => (attrs.includes("xmlns:mc") ? m : `<p:sld${attrs} ${ROOT_NS}>`));
  // schema order inside p:sld: cSld, clrMapOvr, transition, timing, extLst
  const anchor = out.includes("</p:clrMapOvr>") ? "</p:clrMapOvr>" : "</p:cSld>";
  out = out.replace(anchor, `${anchor}${tx}${tm}`);
  return out;
}

/** per-slide XML post-processing: real title placeholder, then transition + timing */
export async function applyMotion(buf: Uint8Array, scene: Scene): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(buf);
  for (const s of scene.slides) {
    const path = `ppt/slides/slide${s.index}.xml`;
    const f = zip.file(path);
    if (!f) throw new RenderError(`missing ${path} in generated pptx`);
    zip.file(path, injectSlide(markTitle(await f.async("string")), s));
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
