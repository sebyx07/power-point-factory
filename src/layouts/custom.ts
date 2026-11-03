import { defineLayout, type LayoutCtx } from "@/core/deck";
import type { El } from "@/core/types";
import { footer, type Heading, titleBlock } from "./parts";

export interface CustomProps extends Partial<Heading> {
  /** escape hatch: place primitives from `@/core/el` yourself. Still fully QA'd. */
  render: (ctx: LayoutCtx, contentTop: number) => El[];
  chrome?: boolean;
}

export const custom = defineLayout<CustomProps>({
  name: "custom",
  chrome: true,
  render: (p, ctx) => {
    const head = p.title
      ? titleBlock(ctx, { title: p.title, ...(p.eyebrow ? { eyebrow: p.eyebrow } : {}), ...(p.subtitle ? { subtitle: p.subtitle } : {}) })
      : { els: [], contentTop: ctx.theme.space.marginY };
    return [...head.els, ...p.render(ctx, head.contentTop), ...(p.chrome === false ? [] : footer(ctx))];
  },
});
