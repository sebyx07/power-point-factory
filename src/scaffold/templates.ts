/** Files `bin/deck new` writes. Deliberately minimal: the agent fills them from the brief. */

const cap = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** user-typed strings go through JSON.stringify — a quote in a title can't break the generated TS */
const q = (v: string) => JSON.stringify(v);

export function brandFile(company: string, theme: string): string {
  return `import { join } from "node:path";
import { extendTheme } from "@/deck";

/** ${cap(company)} brand tokens — every presentation under presentations/${company}/ imports this. Prose rules: BRAND.md */
export const brand = extendTheme(${q(theme)}, {
  name: ${q(company)},
  // colors: { accent: "#0B7A75", warning: "#A35A0A", chart: ["#0B7A75", "#A9C2BF", "#0E1A2B", "#D3DCE6"] },
  // fonts: { display: "Georgia", body: "Calibri" },   // Office-safe faces only (src/text/fonts.ts)
  // logo: { onLight: join(import.meta.dir, "brand/logo.svg"), onDark: join(import.meta.dir, "brand/logo-white.svg") },
});
void join;

export const company = ${q(cap(company))};
`;
}

export function deckFile(title: string, date: string): string {
  const human = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  return `import { defineDeck } from "@/deck";
import { brand, company } from "../../../brand";

/** Slides live in ./slides/NN-name.ts — filename order is slide order. Motion: "subtle" (default) · "build" · "keynote" · "none". */
export default defineDeck({
  title: ${q(title)},
  company,
  author: "",
  date: ${q(human)},
  classification: "Confidential",
  theme: brand,
  slides: [],
});
`;
}

/** a minimal answer-first skeleton: cover → summary → decisions → closing */
export function slideFiles(title: string): [string, string][] {
  const head = `import { slide } from "@/slide";\n\n`;
  return [
    [
      "01-cover.ts",
      `${head}export default slide({\n  layout: "cover",\n  title: ${q(title)},\n  subtitle: "One sentence: what the audience will decide or learn.",\n});\n`,
    ],
    [
      "02-summary.ts",
      `${head}export default slide({\n  layout: "summary",\n  eyebrow: "Executive summary",\n  title: "State the single conclusion as a full sentence",\n  rows: [\n    { lead: "First claim, with a number", support: "Where it is proven (slide N)" },\n    { lead: "Second claim", support: "Evidence" },\n    { lead: "The ask", support: "What you need from the room" },\n  ],\n  notes: "What you say while this slide is up.",\n});\n`,
    ],
    [
      "90-next-steps.ts",
      `${head}export default slide({\n  layout: "nextSteps",\n  eyebrow: "Decision",\n  title: "One decision today and the actions that follow",\n  ask: "The single ask, as a sentence.",\n  actions: [{ action: "First action", owner: "Name", due: "Date" }],\n  notes: "Ask for the decision explicitly.",\n});\n`,
    ],
    [
      "99-closing.ts",
      `${head}export default slide({\n  layout: "closing",\n  title: "Questions and discussion",\n  message: "The one next step you want from the room.",\n});\n`,
    ],
  ];
}

export function brandMd(company: string): string {
  const name = cap(company);
  return `# ${name} — brand brief

> Agents read this before writing any ${name} slide. Fill every section from real sources (website, press kit, annual report) — never invent.
> Tokens in code: [\`brand.ts\`](brand.ts) · reusable files: [\`brand/assets.md\`](brand/assets.md) · onboarding steps: \`.claude/skills/onboard-company/SKILL.md\`

## Who they are
- What they do, size, markets. Source + date for each fact.

## Audience for decks
- Who reads them (board, customers, investors), what they care about.

## Voice
- 3 adjectives. Words they use. Words they never use.

## Logo
| File | Use |
|---|---|
| \`brand/logo.svg\` | light canvases |
| \`brand/logo-white.svg\` | dark canvases |
- Clear space, minimum size, never-do list.

## Colors
| Role | Hex | Use |
|---|---|---|
| Accent | | the one highlight |
| Ink | | text |
| Warning | | at-risk / decreases (theme \`colors.warning\`) |

## Type
- Office-safe faces only (Calibri, Arial, Georgia, Cambria…). Brand font → nearest safe twin, note it here.

## Imagery
- What their photos look like. What to avoid.

## Approved facts
- Numbers and claims safe to use verbatim, each with a source.

## Presentations
- (one line per deck under this folder)
`;
}

export const assetsMd = (company: string) => `# ${cap(company)} — reusable assets

Every file in this folder may be used in any ${cap(company)} presentation. One row per file: what, source, license.

| File | What | Source | License |
|---|---|---|---|
`;
