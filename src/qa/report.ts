import { relative } from "node:path";
import type { DeckPaths } from "@/pipeline/paths";
import { ROOT } from "@/pipeline/paths";
import type { Finding, Severity } from "./types";

export interface QaReport {
  deck: string;
  ok: boolean;
  counts: Record<Severity, number>;
  findings: Finding[];
  artifacts: { pptx: string; pdf?: string; contact?: string; slides: string[]; outline: string; scene: string };
  ms: number;
}

const ORDER: Record<Severity, number> = { error: 0, warn: 1, info: 2 };
const ICON: Record<Severity, string> = { error: "✖", warn: "▲", info: "·" };

export function makeReport(p: DeckPaths, findings: Finding[], artifacts: QaReport["artifacts"], ms: number): QaReport {
  const sorted = [...findings].sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.slide - b.slide);
  const counts = { error: 0, warn: 0, info: 0 };
  for (const x of sorted) counts[x.severity]++;
  return { deck: p.rel, ok: counts.error === 0, counts, findings: sorted, artifacts, ms };
}

const rel = (s: string) => relative(ROOT, s);

export function reportMarkdown(r: QaReport): string {
  const lines = [
    `# QA · ${r.deck}`,
    "",
    `**${r.ok ? "PASS" : "FAIL"}** — ${r.counts.error} errors · ${r.counts.warn} warnings · ${r.counts.info} info · ${(r.ms / 1000).toFixed(1)}s`,
    "",
    "## Look at",
    `- contact sheet: \`${r.artifacts.contact ? rel(r.artifacts.contact) : "(not rendered)"}\``,
    `- slides: \`${r.artifacts.slides[0] ? rel(r.artifacts.slides[0]).replace(/slide-\d+/, "slide-NN") : "(not rendered)"}\``,
    `- outline (all copy): \`${rel(r.artifacts.outline)}\``,
    `- pptx: \`${rel(r.artifacts.pptx)}\``,
    "",
    "## Findings",
  ];
  if (r.findings.length === 0) lines.push("None.");
  for (const x of r.findings) {
    const where = x.slide ? `s${String(x.slide).padStart(2, "0")}` : "deck";
    lines.push(`- ${ICON[x.severity]} **${x.rule}** ${where}${x.el ? ` \`${x.el}\`` : ""} — ${x.message}${x.fix ? `\n  → ${x.fix}` : ""}`);
  }
  return `${lines.join("\n")}\n`;
}

export function reportConsole(r: QaReport, verbose = false): string {
  const shown = verbose ? r.findings : r.findings.filter((x) => x.severity !== "info");
  const body = shown.map(
    (x) =>
      `  ${ICON[x.severity]} ${x.rule.padEnd(18)} ${x.slide ? `s${String(x.slide).padStart(2, "0")}` : "deck"}  ${x.message}${x.fix ? `\n${" ".repeat(27)}→ ${x.fix}` : ""}`,
  );
  const head = `${r.ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"} ${r.deck}  ${r.counts.error}✖ ${r.counts.warn}▲ ${r.counts.info}·  (${(r.ms / 1000).toFixed(1)}s)`;
  return [head, ...body].join("\n");
}
