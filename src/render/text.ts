import type PptxGenJS from "pptxgenjs";
import { bare } from "@/core/color";
import type { TextEl } from "@/core/types";
import { BULLET_INDENT_PT } from "@/text/measure";

function hyperlink(link: string): PptxGenJS.HyperlinkProps {
  const m = /^#slide:(\d+)$/.exec(link);
  return m ? { slide: Number(m[1]), tooltip: `Go to slide ${m[1]}` } : { url: link, tooltip: link };
}

/** Scene TextEl → pptxgenjs runs + options. margin 0: our boxes ARE the text area. */
export function addText(slide: PptxGenJS.Slide, el: TextEl): void {
  const runs: PptxGenJS.TextProps[] = [];
  el.paragraphs.forEach((p, pi) => {
    const last = pi === el.paragraphs.length - 1;
    p.runs.forEach((r, ri) => {
      const endOfPara = ri === p.runs.length - 1;
      runs.push({
        text: el.upper ? r.text.toUpperCase() : r.text,
        options: {
          bold: r.bold ?? el.bold ?? false,
          italic: r.italic ?? el.italic ?? false,
          color: bare(r.color ?? el.color),
          ...(r.link ? { hyperlink: hyperlink(r.link), underline: { style: "sng" as const } } : {}),
          bullet: p.bullet ? { indent: BULLET_INDENT_PT } : false,
          ...(p.spaceAfter && !last ? { paraSpaceAfter: p.spaceAfter } : {}),
          ...(endOfPara && !last ? { breakLine: true } : {}),
        },
      });
    });
  });
  slide.addText(runs, {
    x: el.box.x,
    y: el.box.y,
    w: el.box.w,
    h: el.box.h,
    fontFace: el.font,
    fontSize: el.size,
    color: bare(el.color),
    align: el.align,
    valign: el.valign,
    margin: 0,
    lineSpacingMultiple: el.lineSpacing,
    fit: "none",
    objectName: el.id,
    ...(el.letterSpacing ? { charSpacing: el.letterSpacing } : {}),
  });
}
