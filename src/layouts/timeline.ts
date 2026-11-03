import { defineLayout } from "@/core/deck";
import { hline, rect, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import { columns } from "@/core/geometry";
import type { El } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface Milestone {
  /** "Q1 2027", "Mar 12" */
  when: string;
  title: string;
  body?: string;
  /** done milestones are drawn solid; future ones hollow */
  done?: boolean;
}
export interface TimelineProps extends Heading {
  milestones: Milestone[];
}

export const timeline = defineLayout<TimelineProps>({
  name: "timeline",
  render: (p, ctx) => {
    const n = p.milestones.length;
    if (n < 2 || n > 6) throw new DeckSpecError(`timeline: ${n} milestones`, "use 2–6 milestones");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop + 0.2);
    const lineY = area.y + 0.75;
    const cols = columns(area, n, t.space.gutter);
    const out: El[] = [...els, hline("axis", area.x, lineY, area.w, t.colors.rule, 1.5)];
    p.milestones.forEach((m, i) => {
      const c = cols[i];
      if (!c) return;
      const d = 0.24;
      const o = i + 1;
      out.push(enter(t, text(t, `when-${i}`, { x: c.x, y: area.y, w: c.w, h: 0.4 }, m.when, { role: "eyebrow" }), o));
      out.push(
        enter(
          t,
          {
            ...rect(`dot-${i}`, { x: c.x, y: lineY - d / 2, w: d, h: d }, m.done ? t.colors.accent : t.colors.bg),
            shape: "ellipse",
            line: { color: t.colors.accent, width: 2 },
          },
          o,
          "zoom",
        ),
      );
      out.push(enter(t, text(t, `title-${i}`, { x: c.x, y: lineY + 0.4, w: c.w, h: 0.75 }, m.title, { role: "label", size: t.type.body - 1, minSize: 12 }), o));
      if (m.body)
        out.push(
          enter(
            t,
            text(t, `body-${i}`, { x: c.x, y: lineY + 1.2, w: c.w, h: area.y + area.h - lineY - 1.2 }, m.body, {
              size: t.type.small,
              minSize: 11,
              color: t.colors.muted,
            }),
            o,
          ),
        );
    });
    return [...out, ...footer(ctx)];
  },
});
