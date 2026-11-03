import type { Scene } from "@/core/types";
import { plain } from "@/text/inline";
import { type Finding, f } from "../types";

const PLACEHOLDER = /\b(lorem|ipsum|TODO|TBD|FIXME|XXX|undefined|NaN|null)\b|\[object Object\]|\{\{.*?\}\}/i;

/** Phrases that mark copy as machine-written. Extend freely; keep each a real tell. */
export const SLOP = [
  "unlock",
  "unleash",
  "seamless",
  "seamlessly",
  "leverage our",
  "leveraging",
  "synergy",
  "synergies",
  "game-changer",
  "game changer",
  "revolutionize",
  "revolutionary",
  "cutting-edge",
  "next-level",
  "supercharge",
  "empower",
  "elevate",
  "delve",
  "robust solution",
  "in today's fast-paced",
  "ever-evolving",
  "harness the power",
  "unlock the power",
  "the power of",
  "best-in-class",
  "world-class",
  "paradigm shift",
  "holistic",
  "journey",
  "tapestry",
  "embark",
  "at the end of the day",
  "it's not just",
  "a testament to",
];
const SLOP_RE = new RegExp(`\\b(${SLOP.map((s) => s.replace(/[-']/g, "[-' ]?")).join("|")})\\b`, "i");
const EMOJI = /\p{Extended_Pictographic}/u;

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** copy discipline: no placeholders, no slop, short bullets, notes present */
export function content(scene: Scene): Finding[] {
  const out: Finding[] = [];
  for (const s of scene.slides) {
    const bulletEls = s.elements.filter((e) => e.kind === "text" && e.paragraphs.some((p) => p.bullet));
    const solo = bulletEls.filter((e) => e.id.startsWith("bullet-")).length;
    const worst = Math.max(solo, ...bulletEls.map((e) => (e.kind === "text" ? e.paragraphs.length : 0)));
    if (worst > 6) out.push(f("warn", "bullet-count", s.index, `${worst} bullets in one list`, { fix: "≤ 6 per list; split or cut" }));
    let wordCount = 0;
    for (const el of s.elements) {
      if (el.kind !== "text") continue;
      const txt = plain(el.paragraphs);
      if (el.role !== "chrome") wordCount += words(txt);
      const ph = PLACEHOLDER.exec(txt);
      if (ph) out.push(f("error", "placeholder-text", s.index, `"${el.id}" contains "${ph[0]}"`, { el: el.id, fix: "write the real copy" }));
      const slop = SLOP_RE.exec(txt);
      if (slop)
        out.push(
          f("warn", "slop", s.index, `"${el.id}" uses "${slop[0]}" — reads as AI filler`, {
            el: el.id,
            fix: "say the concrete thing: a number, a name, a verb",
          }),
        );
      if (EMOJI.test(txt)) out.push(f("warn", "emoji", s.index, `"${el.id}" contains emoji`, { el: el.id, fix: "use a lucide icon instead" }));
      if (/[!]{1}\s*$/.test(txt) && el.role === "title") out.push(f("info", "exclamation", s.index, "title ends with '!'", { el: el.id }));
      for (const p of el.paragraphs.filter((p) => p.bullet)) {
        const n = words(p.runs.map((r) => r.text).join(""));
        if (n > 22)
          out.push(f("warn", "bullet-length", s.index, `bullet in "${el.id}" has ${n} words`, { el: el.id, fix: "≤ 18 words; move detail to speaker notes" }));
      }
    }
    if (wordCount > 90)
      out.push(f("warn", "word-count", s.index, `${wordCount} words on one slide`, { fix: "≤ 70 — the slide supports the talk, notes carry the rest" }));
    if (!s.notes && s.layout !== "cover" && s.layout !== "closing")
      out.push(f("info", "notes", s.index, "no speaker notes", { fix: "add notes: what you say while this is up" }));
  }
  return out;
}
