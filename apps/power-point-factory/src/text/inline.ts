import type { Hex, Paragraph, Run } from "@/core/types";

/** `**bold**` · `_italic_` · `==accent==` · `[text](https://…)` · `[text](#slide:12)` → runs. Not full markdown on purpose. */
export function parseInline(src: string, accent?: Hex): Run[] {
  const runs: Run[] = [];
  const re = /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|==[^=]+==|(?<![\w])_[^_]+_(?![\w]))/g;
  let last = 0;
  for (const m of src.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) runs.push({ text: src.slice(last, i) });
    const tok = m[0];
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
    if (link) runs.push({ text: link[1] ?? "", link: link[2] ?? "", ...(accent ? { color: accent } : {}) });
    else if (tok.startsWith("**")) runs.push({ text: tok.slice(2, -2), bold: true });
    else if (tok.startsWith("==")) runs.push({ text: tok.slice(2, -2), bold: true, ...(accent ? { color: accent } : {}) });
    else runs.push({ text: tok.slice(1, -1), italic: true });
    last = i + tok.length;
  }
  if (last < src.length) runs.push({ text: src.slice(last) });
  return runs.length ? runs : [{ text: "" }];
}

export type TextInput = string | string[];

/** string → one paragraph; string[] → one paragraph each. `==x==` = accent highlight. */
export function paragraphs(input: TextInput, opts: { bullet?: boolean; spaceAfter?: number; accent?: Hex } = {}): Paragraph[] {
  const list = (Array.isArray(input) ? input : [input]).flatMap((s) => s.split("\n"));
  return list.map((s) => ({
    runs: parseInline(s, opts.accent),
    ...(opts.bullet ? { bullet: true } : {}),
    ...(opts.spaceAfter !== undefined ? { spaceAfter: opts.spaceAfter } : {}),
  }));
}

export const plain = (ps: Paragraph[]) => ps.map((p) => p.runs.map((r) => r.text).join("")).join("\n");
