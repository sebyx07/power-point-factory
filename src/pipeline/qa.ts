import { join } from "node:path";
import { resolveTheme } from "@/deck";
import { baselineDiff } from "@/qa/baseline";
import { staticChecks } from "@/qa/checks";
import { contactSheet } from "@/qa/contact-sheet";
import { renderSlides } from "@/qa/render";
import { makeReport, type QaReport, reportMarkdown } from "@/qa/report";
import { structureChecks } from "@/qa/structure";
import type { Finding } from "@/qa/types";
import { visualChecks } from "@/qa/visual";
import { buildDeck } from "./build";
import { loadDeck } from "./load";
import type { DeckPaths } from "./paths";

export interface QaOpts {
  /** skip LibreOffice render (static checks only — ~10× faster) */
  noRender?: boolean;
  fresh?: boolean;
  log?: (m: string) => void;
}

/** build → static checks → render screenshots → pixel checks → baseline diff → qa.md/qa.json */
export async function qaDeck(p: DeckPaths, o: QaOpts = {}): Promise<QaReport> {
  const t0 = performance.now();
  const { scene } = await buildDeck(p, { ...(o.fresh ? { fresh: true } : {}), ...(o.log ? { log: o.log } : {}) });
  const theme = resolveTheme((await loadDeck(p)).theme);
  const findings: Finding[] = [...staticChecks(scene, theme)];
  findings.push(...(await structureChecks(new Uint8Array(await Bun.file(p.pptx).arrayBuffer()), scene)));
  let slides: string[] = [];
  let contact: string | undefined;
  if (!o.noRender) {
    slides = await renderSlides(p);
    contact = join(p.build, "contact-sheet.png");
    await contactSheet(slides, contact);
    findings.push(...(await visualChecks(scene, slides)));
    findings.push(...(await baselineDiff(slides, p.baseline, join(p.build, "diff"))));
  }
  const report = makeReport(
    p,
    findings,
    {
      pptx: p.pptx,
      ...(o.noRender ? {} : { pdf: p.pdf }),
      ...(contact ? { contact } : {}),
      slides,
      outline: join(p.build, "outline.md"),
      scene: join(p.build, "scene.json"),
    },
    performance.now() - t0,
  );
  await Bun.write(join(p.build, "qa.json"), JSON.stringify(report, null, 2));
  await Bun.write(join(p.build, "qa.md"), reportMarkdown(report));
  return report;
}
