import { defineLayout } from "@/core/deck";
import { text } from "@/core/el";
import { columns } from "@/core/geometry";
import type { El } from "@/core/types";
import { contentBox, footer, type Heading, titleBlock } from "./parts";

export interface Reference {
  /** "Eurostat, Freight transport statistics (2026)" */
  label: string;
  url?: string;
  note?: string;
}
export interface ReferencesProps extends Partial<Heading> {
  refs: Reference[];
}

/** Numbered sources with live links — the credibility page at the back of the appendix. */
export const references = defineLayout<ReferencesProps>({
  name: "references",
  render: (p, ctx) => {
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, { title: p.title ?? "Sources", ...(p.eyebrow ? { eyebrow: p.eyebrow } : { eyebrow: "Appendix" }) });
    const area = contentBox(ctx, contentTop);
    const cols = p.refs.length > 7 ? columns(area, 2, t.space.gutter + 0.3) : [area];
    const per = Math.ceil(p.refs.length / cols.length);
    const out: El[] = [...els];
    cols.forEach((c, ci) => {
      const chunk = p.refs.slice(ci * per, ci * per + per);
      const lines = chunk.map((r, i) => `**${ci * per + i + 1}.** ${r.url ? `[${r.label}](${r.url})` : r.label}${r.note ? ` — _${r.note}_` : ""}`);
      out.push(text(t, `refs-${ci}`, c, lines, { size: t.type.small, minSize: 10, spaceAfter: 8 }));
    });
    return [...out, ...footer(ctx)];
  },
});
