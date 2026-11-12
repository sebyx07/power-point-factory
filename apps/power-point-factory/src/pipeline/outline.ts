import type { Scene } from "@/core/types";
import { plain } from "@/text/inline";

/** Text-only dump of the deck: lets an agent proofread copy without opening images. */
export function outline(scene: Scene): string {
  const lines = [`# ${scene.title}`, ""];
  for (const s of scene.slides) {
    lines.push(`## ${String(s.index).padStart(2, "0")} · ${s.layout}`);
    for (const el of s.elements) {
      if (el.kind === "text" && el.role !== "chrome") lines.push(`- [${el.role}] ${plain(el.paragraphs).replace(/\n/g, " / ")}`);
      if (el.kind === "chart") lines.push(`- [chart:${el.chart.type}] ${el.chart.series.map((x) => x.name).join(", ")} × ${el.chart.labels.join(", ")}`);
      if (el.kind === "table") lines.push(`- [table] ${el.table.header.join(" | ")} (${el.table.rows.length} rows)`);
      if (el.kind === "image") lines.push(`- [image] ${el.alt}${el.resolved?.placeholder ? " (PLACEHOLDER)" : ""}`);
    }
    if (s.notes) lines.push(`- [notes] ${s.notes}`);
    lines.push("");
  }
  return lines.join("\n");
}
