import type { Paragraph, TextEl } from "@/core/types";
import { font } from "./fonts";

const PT_PER_IN = 72;
/** indent given to bulleted paragraphs (pt) — the renderer uses the same value */
export const BULLET_INDENT_PT = 18;

interface Token {
  text: string;
  bold: boolean;
}

/**
 * Raw glyph advances + pair kerning. Skips GSUB shaping on purpose: ligatures don't change
 * Latin advance widths meaningfully, and opentype.js throws on some GSUB tables (Gelasio).
 */
export function textWidthPt(text: string, face: string, bold: boolean, sizePt: number, trackingPt = 0): number {
  const f = font(face, bold);
  const scale = sizePt / f.unitsPerEm;
  let units = 0;
  let prev: ReturnType<typeof f.charToGlyph> | undefined;
  for (const ch of text) {
    const g = f.charToGlyph(ch);
    units += g.advanceWidth ?? f.unitsPerEm * 0.5;
    if (prev) units += f.getKerningValue(prev, g);
    prev = g;
  }
  return units * scale + trackingPt * [...text].length;
}

/** line box height in pt for single spacing × multiple — matches PowerPoint's "Multiple" mode */
export function lineHeightPt(face: string, sizePt: number, multiple: number): number {
  const f = font(face, false);
  const hhea = f.tables.hhea as unknown as { ascender: number; descender: number; lineGap: number };
  const em = (hhea.ascender - hhea.descender + hhea.lineGap) / f.unitsPerEm;
  return sizePt * em * multiple;
}

function tokens(p: Paragraph, elBold: boolean, upper: boolean): Token[] {
  const out: Token[] = [];
  for (const r of p.runs) {
    const t = upper ? r.text.toUpperCase() : r.text;
    for (const piece of t.split(/(\s+)/)) if (piece) out.push({ text: piece, bold: r.bold ?? elBold });
  }
  return out;
}

export interface Measured {
  lines: number;
  heightPt: number;
  /** widest single word vs available width — >1 means a word can't fit at all */
  widestWordRatio: number;
  /** words on the final line (1 = a widow) */
  lastLineWords: number;
}

export function measure(el: TextEl, size = el.size): Measured {
  const widthPt = el.box.w * PT_PER_IN;
  const track = el.letterSpacing ?? 0;
  const lh = lineHeightPt(el.font, size, el.lineSpacing);
  let lines = 0;
  let heightPt = 0;
  let widest = 0;
  let lastWords = 0;
  el.paragraphs.forEach((p, i) => {
    const avail = widthPt - (p.bullet ? BULLET_INDENT_PT : 0);
    let n = 1;
    lastWords = 0;
    let x = 0;
    for (const t of tokens(p, el.bold ?? false, el.upper ?? false)) {
      const w = textWidthPt(t.text, el.font, t.bold, size, track);
      if (/^\s+$/.test(t.text)) {
        x += w;
        continue;
      }
      widest = Math.max(widest, w / avail);
      if (x > 0 && x + w > avail) {
        n++;
        x = w;
        lastWords = 1;
      } else {
        x += w;
        lastWords++;
      }
    }
    lines += n;
    heightPt += n * lh + (i < el.paragraphs.length - 1 ? (p.spaceAfter ?? 0) : 0);
  });
  return { lines, heightPt, widestWordRatio: widest, lastLineWords: lastWords };
}

export function fits(el: TextEl, size = el.size): boolean {
  const m = measure(el, size);
  return m.widestWordRatio <= 1 && m.heightPt <= el.box.h * PT_PER_IN + 0.5;
}
