# Extending — the DSL

Everything public comes from two imports: `@/deck` (deck, themes, primitives, layouts API) and `@/slide` (slide files).

## Levels — use the lowest that works

| Need                                                    | Do                                                         | Where                                   |
| ------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| Different content                                       | props on an existing layout                                | `slides/NN-name.ts`                     |
| A sticker, extra logo, callout, soundtrack on one slide | `extra: [el.text(…), soundtrack(…)]`                       | slide file                              |
| A one-off composition                                   | `layout: "custom", render: (ctx, top) => El[]`             | slide file                              |
| A slide shape the company reuses                        | `defineLayout` → `use(layout, props)`                      | `presentations/<company>/layouts/*.ts`  |
| A slide shape everyone needs                            | `defineLayout` + registry + fixture                        | `src/layouts/*.ts` (skill `add-layout`) |
| A brand                                                 | `extendTheme(base, overrides)` + `BRAND.md`                | `presentations/<company>/brand.ts`      |
| A new base theme                                        | `Theme` object + `themes` map + AA test runs automatically | `src/theme/themes/*.ts`                 |

## Primitives (`el.*`)

| Builder                                                                                                 | Makes                                          |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `el.text(theme, id, box, content, { role, size, bold, color, align, valign, bullet, onDark, minSize })` | auto-fitted text (overflow flagged for QA)     |
| `el.rect / el.rounded / el.hline / el.vline`                                                            | shapes, rules                                  |
| `el.image(id, box, source, alt, "cover"\|"contain")`                                                    | file, Kubeez-generated, or lucide icon         |
| `el.chart(id, box, spec)` · `el.table(theme, id, box, spec)`                                            | native chart / table                           |
| `el.accentFor(theme, onDark)`                                                                           | the accent that passes contrast on this canvas |

Helpers: `parts.titleBlock`, `parts.contentBox`, `parts.footer`, `parts.source`, `parts.logo`, `parts.enter(theme, el, order, effect)`; geometry `columns`, `rows`, `inset`, `box`, `SLIDE`; color `mix`, `contrast`.

## A company layout, end to end

```ts
// presentations/halden/layouts/kpi-strip.ts
import { columns, defineLayout, el, parts } from "@/deck";

export interface KpiStripProps extends parts.Heading {
  kpis: { value: string; label: string }[];
}

export const kpiStrip = defineLayout<KpiStripProps>({
  name: "kpiStrip",
  chrome: true,
  render: (p, ctx) => {
    const t = ctx.theme;
    const { els, contentTop } = parts.titleBlock(ctx, p);
    const cols = columns({ ...parts.contentBox(ctx, contentTop), h: 1.4 }, p.kpis.length, t.space.gutter);
    const tiles = p.kpis.flatMap((k, i) => [
      parts.enter(t, el.text(t, `v-${i}`, { ...cols[i]!, h: 0.9 }, k.value, { role: "metric" }), i + 1),
      el.text(t, `l-${i}`, { ...cols[i]!, y: cols[i]!.y + 0.95, h: 0.4 }, k.label, { role: "caption" }),
    ]);
    return [...els, ...tiles, ...parts.footer(ctx)];
  },
});

// slides/05-kpis.ts
import { use } from "@/slide";
import { kpiStrip } from "../../../../layouts/kpi-strip";
export default use(kpiStrip, { title: "Four numbers beat plan", kpis: [{ value: "$412M", label: "Revenue" }] });
```
QA treats it exactly like a built-in: overflow, contrast, overlap, bounds, slop, screenshots.

## Layout contract

- Pure: `(props, ctx) => El[]`. No I/O, no randomness, no `Date.now()`.
- Stable unique `id` per element (Morph and animations key on them).
- Validate counts with `DeckSpecError(message, hint)`.
- Reading order = `enter()` order. Titles don't animate.
- Never hard-code hex; use `t.colors.*` / `mix()` / `accentFor()`.
