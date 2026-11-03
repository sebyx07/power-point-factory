# Layout catalog

Every layout: `export default slide({ layout: "<name>", …props })`. Props are typed — your editor autocompletes them. All layouts accept `notes`, `transition`, `motion`, `animate`, `hidden`, `extra` (`SlideCommon`). Heading props = `eyebrow?`, `title`, `subtitle?`. Inline markup in any text: `**bold**`, `==accent==`, `_italic_`, `[link](https://…)`, `[jump](#slide:12)`.

| Layout       | Use for                                       | Key props                                                                                              | Source                                        |
| ------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `cover`      | opening                                       | `title`, `subtitle`, `eyebrow`, `image` (right-half bleed), `presenter`                                | [cover.ts](../src/layouts/cover.ts)           |
| `agenda`     | 2–7 sections, `current` highlights on revisit | `items: ["Title — detail"]`, `current`                                                                 | [agenda.ts](../src/layouts/agenda.ts)         |
| `section`    | dark divider                                  | `number`, `title`, `lede`                                                                              | [section.ts](../src/layouts/section.ts)       |
| `summary`    | executive summary, answer first               | `rows: [{ lead, support }]` (2–5)                                                                      | [summary.ts](../src/layouts/summary.ts)       |
| `bullets`    | argument in points                            | `bullets` (≤ 6), `image`, `takeaway`                                                                   | [bullets.ts](../src/layouts/bullets.ts)       |
| `twoColumn`  | before/after, compare                         | `left`/`right: { heading, body, icon }`, `mode`                                                        | [two-column.ts](../src/layouts/two-column.ts) |
| `cards`      | 2–4 parallel items with icons                 | `cards: [{ icon, title, body }]`                                                                       | [cards.ts](../src/layouts/cards.ts)           |
| `quote`      | voice of customer                             | `quote`, `name`, `role`, `portrait`                                                                    | [quote.ts](../src/layouts/quote.ts)           |
| `bigNumber`  | one striking figure                           | `value`, `statement`, `context`, `source`                                                              | [big-number.ts](../src/layouts/big-number.ts) |
| `stats`      | 1–4 KPI tiles                                 | `stats: [{ value, label, delta, detail }]`, `source`                                                   | [stats.ts](../src/layouts/stats.ts)           |
| `chart`      | native editable chart + insight panel         | `chart: { type, labels, series, format, highlight, min, max }`, `insights`, `source`                   | [chart.ts](../src/layouts/chart.ts)           |
| `waterfall`  | bridge / variance (shapes)                    | `steps: [{ label, value, total? }]`, `prefix`, `suffix`, `decimals`                                    | [waterfall.ts](../src/layouts/waterfall.ts)   |
| `table`      | native table, RAG + harvey cells              | `table: { header, rows, highlight, total, widths, align }`                                             | [table.ts](../src/layouts/table.ts)           |
| `matrix`     | 2×2 prioritization                            | `x`, `y`, `quadrants`, `target`, `items: [{ label, x, y, size, highlight }]`, `sizeLegend`, `insights` | [matrix.ts](../src/layouts/matrix.ts)         |
| `process`    | 3–6 chevron steps                             | `steps: [{ title, body }]`, `current`                                                                  | [process.ts](../src/layouts/process.ts)       |
| `timeline`   | 2–6 milestones                                | `milestones: [{ when, title, body, done }]`                                                            | [timeline.ts](../src/layouts/timeline.ts)     |
| `roadmap`    | Gantt: workstreams × periods                  | `periods`, `rows: [{ label, bars: [{ start, end, label, status }], milestones }]`, `today`             | [roadmap.ts](../src/layouts/roadmap.ts)       |
| `imageFull`  | full-bleed photo + scrim                      | `image`, `title`, `caption`, `band`                                                                    | [image-full.ts](../src/layouts/image-full.ts) |
| `video`      | embedded / generated video                    | `video: { file } \| { generateVideo }`, `full`, `autoplay`, `caption`                                  | [video.ts](../src/layouts/video.ts)           |
| `nextSteps`  | decisions + actions                           | `ask`, `actions: [{ action, owner, due, status, decision }]`                                           | [next-steps.ts](../src/layouts/next-steps.ts) |
| `references` | sources with live links                       | `refs: [{ label, url, note }]`                                                                         | [references.ts](../src/layouts/references.ts) |
| `closing`    | final dark slide                              | `title`, `message`, `contact`                                                                          | [closing.ts](../src/layouts/closing.ts)       |
| `custom`     | one-off, primitives                           | `render: (ctx, contentTop) => El[]`                                                                    | [custom.ts](../src/layouts/custom.ts)         |

**Values**
- `ImageSource`: `{ file: "assets/x.jpg" }` · `{ generate: { prompt, aspect, model, seed, removeBackground } }` · `{ icon: "rocket", color }` ([lucide names](https://lucide.dev/icons)).
- Table `Cell`: `string | number | { rag: "green"|"amber"|"red", label? } | { harvey: 0|1|2|3|4 }`.
- Chart `type`: `column | bar | stackedColumn | line | area | pie | doughnut`; `format` is an Excel format (`$#,##0`, `0.0%`).

Your own layouts: [extending.md](extending.md).
