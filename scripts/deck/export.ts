// bin/deck export [deck…] — QA must pass; then out/<path>/export/<Company> - <Title> - <date>.{pptx,pdf}
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "@/cli/args";
import { log, main } from "@/cli/main";
import { targets } from "@/cli/targets";
import { DeckSpecError } from "@/core/errors";
import { loadDeck } from "@/pipeline/load";
import { qaDeck } from "@/pipeline/qa";
import { reportConsole } from "@/qa/report";

const safe = (s: string) =>
  s
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();

await main(async () => {
  const a = parseArgs();
  for (const p of targets(a._)) {
    const r = await qaDeck(p, { log });
    console.log(reportConsole(r));
    if (!r.ok && a.flags.force !== true) throw new DeckSpecError(`${p.rel}: QA failed — not exporting`, "fix the errors (out/…/<deck>-qa.md) or pass --force");
    const spec = await loadDeck(p);
    const date = p.date.toISOString().slice(0, 10);
    const name = safe([spec.company, spec.title, date].filter(Boolean).join(" - "));
    const dir = p.exportDir;
    await mkdir(dir, { recursive: true });
    await Bun.write(join(dir, `${name}.pptx`), Bun.file(p.pptx));
    await Bun.write(join(dir, `${name}.pdf`), Bun.file(p.pdf));
    console.log(`✔ exported:\n  ${join(dir, `${name}.pptx`)}\n  ${join(dir, `${name}.pdf`)}`);
  }
  return 0;
});
