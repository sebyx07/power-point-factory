// bin/deck qa [deck…|all] [--fast] [--verbose] — build + checks + screenshots → out/<path>/<deck>-qa.md. Exit 1 on errors.
import { parseArgs } from "@/cli/args";
import { log, main } from "@/cli/main";
import { targets } from "@/cli/targets";
import { qaDeck } from "@/pipeline/qa";
import { reportConsole } from "@/qa/report";

await main(async () => {
  const a = parseArgs();
  let failed = 0;
  for (const p of targets(a._)) {
    const r = await qaDeck(p, { noRender: a.flags.fast === true, log });
    console.log(reportConsole(r, a.flags.verbose === true));
    console.log(`  report: ${p.qaMd}${r.artifacts.contact ? `\n  look:   ${r.artifacts.contact}` : ""}`);
    if (!r.ok || (a.flags.strict === true && r.counts.warn > 0)) failed++;
  }
  return failed ? 1 : 0;
});
