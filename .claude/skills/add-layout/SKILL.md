---

name: add-layout
description: Use when a slide needs a structure no existing layout provides (pricing tiers, org chart, funnel, risk heat map…). Builds a reusable, typed, QA-covered layout — company-scoped or built-in.
---

# Add a layout

**Scope first.** Company-specific (their pricing grid) → `presentations/<company>/layouts/<name>.ts`. Generally useful → `src/layouts/<name>.ts`.

1. Read two similar layouts (`src/layouts/stats.ts`, `src/layouts/waterfall.ts`) and `src/layouts/parts.ts`.
2. Write it:
```ts
import { defineLayout, el, parts, columns } from "@/deck";
export interface PricingProps extends parts.Heading {
  tiers: { name: string; price: string; features: string[]; recommended?: boolean }[];
}
export const pricing = defineLayout<PricingProps>({
  name: "pricing",
  chrome: true,
  render: (p, ctx) => {
    const t = ctx.theme;
    const { els, contentTop } = parts.titleBlock(ctx, p);
    const cols = columns(parts.contentBox(ctx, contentTop), p.tiers.length, t.space.gutter);
    // …el.rounded / el.text per column, parts.enter(t, element, order) for builds
    return [...els, /* … */ ...parts.footer(ctx)];
  },
});
```

3. Rules: tokens only (`t.colors.*`, `t.type.*`), stable unique `id`s, validate prop counts with `DeckSpecError` + hint, `enter()` for motion (order = reading order), no I/O.
4. **Built-in:** add to `src/layouts/index.ts`, add realistic props to `test/layouts.fixtures.ts` (the contract test renders every layout in every theme), add a row to `docs/layouts.md`.
5. **Company layout:** use it from a slide with `export default use(pricing, { … })` (`import { use } from "@/slide"`).
6. `bun test` + `bin/deck loop` on a deck using it; look at the PNG.
