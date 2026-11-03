import { fitText } from "@/text/fit";
import { paragraphs, type TextInput } from "@/text/inline";
import type { Theme } from "@/theme/types";
import { mix } from "./color";
import type { Box, ChartEl, ChartSpec, Hex, ImageEl, ImageSource, Role, ShapeEl, TableEl, TableSpec, TextEl } from "./types";

/** Text style presets per role — layouts pick a role, theme supplies the numbers. */
/** the accent that passes contrast on the current canvas */
export function accentFor(t: Theme, onDark: boolean): Hex {
  return onDark ? (t.colors.accentOnDark ?? mix("#FFFFFF", t.colors.accent, 0.45)) : t.colors.accent;
}

export function textStyle(t: Theme, role: Role, onDark = false) {
  const c = t.colors;
  const accent = accentFor(t, onDark);
  const fg = onDark ? c.onDark : c.text;
  const muted = onDark ? c.mutedOnDark : c.muted;
  switch (role) {
    case "eyebrow":
      return { font: t.fonts.body, size: t.type.eyebrow, color: accent, bold: true, upper: true, letterSpacing: 0.6, lineSpacing: 1 };
    case "title":
      return { font: t.fonts.display, size: t.type.title, color: fg, bold: t.displayBold, lineSpacing: 0.95 };
    case "subtitle":
      return { font: t.fonts.body, size: t.type.subtitle, color: muted, lineSpacing: 1.1 };
    case "quote":
      return { font: t.fonts.display, size: t.type.title, color: fg, lineSpacing: 1.05 };
    case "metric":
      return { font: t.fonts.display, size: t.type.metric, color: accent, bold: true, lineSpacing: 0.9 };
    case "label":
      return { font: t.fonts.body, size: t.type.small, color: fg, bold: true, lineSpacing: 1.05 };
    case "caption":
    case "chrome":
      return { font: t.fonts.body, size: t.type.caption, color: muted, lineSpacing: 1.1 };
    default:
      return { font: t.fonts.body, size: t.type.body, color: fg, lineSpacing: 1.12 };
  }
}

export interface TextOpts {
  role?: Role;
  onDark?: boolean;
  size?: number;
  /** auto-fit floor; default 80% of size (titles) / 75% (body) */
  minSize?: number;
  color?: Hex;
  bold?: boolean;
  italic?: boolean;
  upper?: boolean;
  align?: TextEl["align"];
  valign?: TextEl["valign"];
  bullet?: boolean;
  spaceAfter?: number;
  lineSpacing?: number;
  font?: string;
}

/** Build + auto-fit a text element. Overflow is flagged for QA, never silently clipped. */
export function text(t: Theme, id: string, b: Box, content: TextInput, o: TextOpts = {}): TextEl {
  const role = o.role ?? "body";
  const s = textStyle(t, role, o.onDark);
  const size = o.size ?? s.size;
  const el: TextEl = {
    kind: "text",
    id,
    box: b,
    role,
    paragraphs: paragraphs(content, {
      accent: accentFor(t, o.onDark ?? false),
      ...(o.bullet ? { bullet: true } : {}),
      ...(o.spaceAfter !== undefined ? { spaceAfter: o.spaceAfter } : o.bullet ? { spaceAfter: size * 0.55 } : {}),
    }),
    font: o.font ?? s.font,
    size,
    minSize: o.minSize ?? Math.round(size * (role === "title" || role === "metric" ? 0.8 : 0.75)),
    color: o.color ?? s.color,
    align: o.align ?? "left",
    valign: o.valign ?? "top",
    lineSpacing: o.lineSpacing ?? s.lineSpacing,
    ...("bold" in s || o.bold !== undefined ? { bold: o.bold ?? ("bold" in s ? s.bold : false) } : {}),
    ...(o.italic ? { italic: true } : {}),
    ...((o.upper ?? ("upper" in s && s.upper)) ? { upper: true } : {}),
    ...("letterSpacing" in s ? { letterSpacing: s.letterSpacing } : {}),
  };
  return fitText(el);
}

export function rect(id: string, b: Box, fill: Hex, o: Partial<ShapeEl> = {}): ShapeEl {
  return { kind: "shape", id, box: b, role: "decor", shape: "rect", fill, ...o };
}

export function rounded(id: string, b: Box, fill: Hex, radius: number, o: Partial<ShapeEl> = {}): ShapeEl {
  return { kind: "shape", id, box: b, role: "decor", shape: radius > 0 ? "roundRect" : "rect", fill, radius, ...o };
}

export function hline(id: string, x: number, y: number, w: number, color: Hex, width = 0.75): ShapeEl {
  return { kind: "shape", id, box: { x, y, w, h: 0 }, role: "decor", shape: "line", line: { color, width } };
}

export function vline(id: string, x: number, y: number, h: number, color: Hex, width = 0.75): ShapeEl {
  return { kind: "shape", id, box: { x, y, w: 0, h }, role: "decor", shape: "line", line: { color, width } };
}

export function image(id: string, b: Box, src: ImageSource, alt: string, fit: ImageEl["fit"] = "cover"): ImageEl {
  return { kind: "image", id, box: b, role: "media", src, fit, alt };
}

export function chart(id: string, b: Box, spec: ChartSpec): ChartEl {
  return { kind: "chart", id, box: b, role: "data", chart: spec };
}

export function table(t: Theme, id: string, b: Box, spec: TableSpec, size = t.type.small): TableEl {
  return { kind: "table", id, box: b, role: "data", table: spec, font: t.fonts.body, size, rowH: (size * 2.1) / 72 };
}
