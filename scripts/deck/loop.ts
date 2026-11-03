// bin/deck loop [deck] — the agent loop step: build + full QA + screenshots, then print exactly what to look at next.
import { relative } from "node:path";
import { parseArgs } from "@/cli/args";
import { log, main } from "@/cli/main";
import { targets } from "@/cli/targets";
import { ROOT } from "@/pipeline/paths";
import { qaDeck } from "@/pipeline/qa";
import { reportConsole } from "@/qa/report";

await main(async () => {
  const a = parseArgs();
  const [p] = targets(a._);
  if (!p) return 1;
  const r = await qaDeck(p, { log });
  const rel = (s: string) => relative(ROOT, s);
  console.log(reportConsole(r, true));
  console.log("\nNEXT");
  if (!r.ok) console.log("  1. fix every ✖ above (each has → fix), then re-run bin/deck loop");
  else if (r.counts.warn) console.log("  1. resolve ▲ warnings or justify them in the slide's notes");
  console.log(`  ${r.ok ? 1 : 2}. Read ${r.artifacts.contact ? rel(r.artifacts.contact) : "(no render)"} — whole deck at a glance`);
  console.log(`  ${r.ok ? 2 : 3}. Read suspicious slides at full size: ${rel(p.slidesPng)}/slide-NN.png`);
  console.log(`  ${r.ok ? 3 : 4}. Proofread copy: ${rel(r.artifacts.outline)}`);
  console.log(`  then: fresh-eyes review (.claude/agents/deck-reviewer.md) → bin/deck export ${p.rel}`);
  return r.ok ? 0 : 1;
});
