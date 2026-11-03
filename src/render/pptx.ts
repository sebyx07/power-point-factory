import PptxGenJS from "pptxgenjs";
import { bare } from "@/core/color";
import { RenderError } from "@/core/errors";
import { objectName } from "@/core/motion";
import type { Scene, ShapeEl } from "@/core/types";
import type { Theme } from "@/theme/types";
import { addChart } from "./chart";
import { applyMotion } from "./motion";
import { reproducible } from "./reproducible";
import { addTable } from "./table";
import { addText } from "./text";

export interface RenderMeta {
  title: string;
  /** pinned build instant (deck folder date) → reproducible bytes */
  at: Date;
  author?: string;
  company?: string;
}

function addShape(pres: PptxGenJS, slide: PptxGenJS.Slide, el: ShapeEl): void {
  const map = {
    rect: pres.ShapeType.rect,
    roundRect: pres.ShapeType.roundRect,
    ellipse: pres.ShapeType.ellipse,
    line: pres.ShapeType.line,
    chevron: pres.ShapeType.chevron,
    homePlate: pres.ShapeType.homePlate,
  };
  slide.addShape(map[el.shape], {
    x: el.box.x,
    y: el.box.y,
    w: el.box.w,
    h: el.box.h,
    objectName: el.id,
    ...(el.fill
      ? { fill: { color: bare(el.fill), ...(el.opacity !== undefined ? { transparency: Math.round((1 - el.opacity) * 100) } : {}) } }
      : { fill: { type: "none" } }),
    line: el.line ? { color: bare(el.line.color), width: el.line.width } : { type: "none" },
    ...(el.shape === "roundRect" && el.radius ? { rectRadius: el.radius } : {}),
  });
}

/** Scene → .pptx bytes (native shapes, text, charts, tables) + transitions/animations. */
export async function renderPptx(input: Scene, theme: Theme, meta: RenderMeta): Promise<Uint8Array> {
  // Morph pairs objects by "!!name": rename once here so render + motion agree
  const scene: Scene = { ...input, slides: input.slides.map((s) => ({ ...s, elements: s.elements.map((e) => ({ ...e, id: objectName(e.id, s.morph) })) })) };
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE";
  pres.title = meta.title;
  if (meta.author) pres.author = meta.author;
  if (meta.company) pres.company = meta.company;
  pres.theme = { headFontFace: theme.fonts.display, bodyFontFace: theme.fonts.body };

  for (const s of scene.slides) {
    const slide = pres.addSlide();
    slide.background = { color: bare(s.background) };
    for (const el of s.elements) {
      switch (el.kind) {
        case "text":
          addText(slide, el);
          break;
        case "shape":
          addShape(pres, slide, el);
          break;
        case "image":
          if (!el.resolved) throw new RenderError(`slide ${s.index}: image "${el.id}" unresolved`, "run resolveImages() before render");
          slide.addImage({ path: el.resolved.path, x: el.box.x, y: el.box.y, w: el.box.w, h: el.box.h, altText: el.alt, objectName: el.id });
          break;
        case "media": {
          const r = el.resolved;
          if (!r) throw new RenderError(`slide ${s.index}: media "${el.id}" unresolved`);
          const cover = `data:image/png;base64,${Buffer.from(await Bun.file(r.poster).arrayBuffer()).toString("base64")}`;
          if (r.placeholder) slide.addImage({ path: r.poster, x: el.box.x, y: el.box.y, w: el.box.w, h: el.box.h, altText: el.alt, objectName: el.id });
          else slide.addMedia({ type: el.media, path: r.path, cover, x: el.box.x, y: el.box.y, w: el.box.w, h: el.box.h, objectName: el.id });
          break;
        }
        case "chart":
          addChart(slide, el, theme);
          break;
        case "table":
          addTable(slide, el, theme);
          break;
      }
    }
    if (s.notes) slide.addNotes(s.notes);
  }
  const buf = (await pres.write({ outputType: "uint8array" })) as Uint8Array;
  return reproducible(await applyMotion(buf, scene), meta.at);
}
