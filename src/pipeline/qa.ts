import { join } from "node:path";
import { baselineDiff } from "@/qa/baseline";
import { staticChecks } from "@/qa/checks";
import { contactSheet } from "@/qa/contact-sheet";
import { renderSlides } from "@/qa/render";
import { makeReport, type QaReport, reportMarkdown } from "@/qa/report";
import { structureChecks } from "@/qa/structure";
import type { Finding } from "@/qa/types";
import { visualChecks } from "@/qa/visual";
import { buildDeck } from "./build";
import type { DeckPaths } from "./paths";

export interface QaOpts {
  /** skip LibreOffice render (static checks only — ~10× faster) */
  noRender?: boolean;
  fresh?: boolean;
  log?: (m: string) => void;
}

/** build → static checks → render screenshots → pixel checks → baseline diff → <deck>-qa.md/.json */
export async function qaDeck(p: DeckPaths, o: QaOpts = {}): Promise<QaReport> {
  const t0 = performance.now();
  const { scene, theme } = await buildDeck(p, { ...(o.fresh ? { fresh: true } : {}), ...(o.log ? { log: o.log } : {}) });
  const findings: Finding[] = [...staticChecks(scene, theme)];
  findings.push(...(await structureChecks(new Uint8Array(await Bun.file(p.pptx).arrayBuffer()), scene)));
  let slides: string[] = [];
  let contact: string | undefined;
  if (!o.noRender) {
    slides = await renderSlides(p);
    contact = p.contact;
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
      outline: p.outline,
      scene: p.scene,
    },
    performance.now() - t0,
  );
  await Bun.write(p.qaJson, JSON.stringify(report, null, 2));
  await Bun.write(p.qaMd, reportMarkdown(report));
  return report;
}
