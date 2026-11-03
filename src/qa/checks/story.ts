import type { Scene } from "@/core/types";
import { plain } from "@/text/inline";
import { type Finding, f } from "../types";

const GENERIC =
  /^(overview|introduction|agenda|summary|key (insights|takeaways|findings)|background|results|next steps|conclusion|q&a|questions\??|thank you!?|the power of .+)$/i;
const DATA = new Set(["chart", "table", "stats", "waterfall"]);

/** deck-level storytelling discipline (research: consulting practice, Duarte, SWD) */
export function story(scene: Scene): Finding[] {
  const out: Finding[] = [];
  const content = scene.slides.filter((s) => !["cover", "section", "closing", "agenda", "references", "imageFull", "quote", "bigNumber"].includes(s.layout));
  const counts = new Map<string, number>();
  for (const s of content) counts.set(s.layout, (counts.get(s.layout) ?? 0) + 1);
  for (const [layout, n] of counts) {
    if (content.length >= 6 && n / content.length > 0.4)
      out.push(
        f("warn", "layout-variety", 0, `${layout} is ${n}/${content.length} content slides`, { fix: "vary the exhibit: chart, table, matrix, process…" }),
      );
  }
  scene.slides.forEach((s, i) => {
    const prev = scene.slides[i - 1];
    if (prev && s.layout === "cards" && prev.layout === "cards")
      out.push(f("warn", "layout-variety", s.index, "two card grids in a row — the classic AI-deck tell"));
    const title = s.elements.find((e) => e.kind === "text" && e.id === "title");
    if (title?.kind === "text" && !["cover", "section", "closing", "agenda", "references"].includes(s.layout)) {
      const txt = plain(title.paragraphs).trim();
      const words = txt.split(/\s+/).length;
      if (GENERIC.test(txt))
        out.push(
          f("warn", "action-title", s.index, `"${txt}" is a topic label`, {
            el: "title",
            fix: "write the takeaway as a sentence: “Revenue grew 9%, led by contract logistics”",
          }),
        );
      else if (words > 16) out.push(f("warn", "action-title", s.index, `title is ${words} words`, { el: "title", fix: "≤ 15 words" }));
    }
    if (DATA.has(s.layout) && !s.elements.some((e) => e.id === "source"))
      out.push(f("info", "source-line", s.index, "data slide without a source line", { fix: 'add source: "…"' }));
    for (const el of s.elements) {
      if (el.kind !== "chart") continue;
      const c = el.chart;
      if ((c.type === "pie" || c.type === "doughnut") && c.labels.length > 5)
        out.push(f("warn", "pie-slices", s.index, `${c.labels.length} slices`, { el: el.id, fix: "≤ 5 slices, or a sorted bar chart" }));
      if ((c.type === "pie" || c.type === "doughnut") && c.series.some((x) => x.values.some((v) => v < 0)))
        out.push(f("error", "pie-negative", s.index, "negative value in a pie", { el: el.id }));
      if (c.type === "line" && c.series.length > 5)
        out.push(f("warn", "series-count", s.index, `${c.series.length} lines`, { el: el.id, fix: "≤ 5; highlight one, grey the rest" }));
      if ((c.type === "column" || c.type === "bar") && c.series.length > 3)
        out.push(f("warn", "series-count", s.index, `${c.series.length} clustered series`, { el: el.id, fix: "≤ 3 or use small multiples" }));
      if ((c.type === "column" || c.type === "bar") && c.min !== undefined && c.min > 0)
        out.push(f("error", "axis-zero", s.index, "bar/column value axis must start at 0", { el: el.id }));
    }
    const steps = new Set(s.elements.filter((e) => e.anim).map((e) => e.anim?.order)).size;
    if (steps > 8) out.push(f("warn", "build-steps", s.index, `${steps} animation steps`, { fix: "≤ 8; group items with the same order" }));
  });
  const transitions = new Set(scene.slides.slice(1).map((s) => s.transition.type));
  if (transitions.size > 2)
    out.push(
      f("warn", "transitions", 0, `${transitions.size} transition types in one deck (${[...transitions].join(", ")})`, {
        fix: "one transition type for the whole deck",
      }),
    );
  const last = scene.slides.at(-1);
  if (last && last.layout === "closing" && !scene.slides.some((s) => s.layout === "nextSteps"))
    out.push(f("info", "closing", 0, "no nextSteps slide", { fix: "end on decisions/actions with owners and dates, not 'Thank you'" }));
  return out;
}
