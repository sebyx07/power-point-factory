import { defineLayout } from "@/core/deck";
import { text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import { columns } from "@/core/geometry";
import type { El, ShapeEl } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface ProcessStep {
  /** verb-led, ≤ 3 words: "Map demand" */
  title: string;
  body?: string;
}
export interface ProcessProps extends Heading {
  steps: ProcessStep[];
  /** 0-based step to emphasize ("we are here") */
  current?: number;
}

/** Chevron process: 3–6 sequential steps, optional current step in accent. */
export const process = defineLayout<ProcessProps>({
  name: "process",
  render: (p, ctx) => {
    const n = p.steps.length;
    if (n < 3 || n > 6) throw new DeckSpecError(`process: ${n} steps`, "use 3–6 steps");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop + 0.2);
    const cols = columns(area, n, 0.06);
    const out: El[] = [...els];
    const h = 0.95;
    cols.forEach((c, i) => {
      const s = p.steps[i];
      if (!s) return;
      const on = p.current === undefined ? i === n - 1 : p.current === i;
      const fill = on ? t.colors.accent : t.colors.surface;
      const fg = on ? t.colors.onAccent : t.colors.text;
      const shape: ShapeEl = {
        kind: "shape",
        id: `chev-${i}`,
        box: { x: c.x, y: area.y, w: c.w + 0.25, h },
        role: "decor",
        shape: i === 0 ? "homePlate" : "chevron",
        fill,
      };
      const o = i + 1;
      out.push(enter(t, shape, o, "wipe"));
      out.push(
        enter(
          t,
          text(t, `step-${i}`, { x: c.x + (i === 0 ? 0.2 : 0.45), y: area.y + 0.1, w: c.w - 0.55, h: h - 0.2 }, s.title, {
            role: "label",
            color: fg,
            valign: "middle",
            size: t.type.small + 1,
            minSize: 11,
          }),
          o,
          "fade",
        ),
      );
      if (s.body)
        out.push(
          enter(
            t,
            text(t, `body-${i}`, { x: c.x + 0.1, y: area.y + h + 0.3, w: c.w - 0.15, h: area.h - h - 0.4 }, s.body, {
              size: t.type.small,
              minSize: 11,
              color: t.colors.muted,
            }),
            o,
            "fade",
          ),
        );
    });
    return [...out, ...footer(ctx)];
  },
});
