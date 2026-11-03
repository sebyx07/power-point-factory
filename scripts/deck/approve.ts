// bin/deck approve [deck] — snapshot current slide PNGs as the visual baseline (.baseline/).
import { cp, rm } from "node:fs/promises";
import { parseArgs } from "@/cli/args";
import { main } from "@/cli/main";
import { targets } from "@/cli/targets";
import { DeckSpecError } from "@/core/errors";

await main(async () => {
  for (const p of targets(parseArgs()._)) {
    if (!(await Bun.file(p.slidePng(1)).exists())) throw new DeckSpecError(`${p.rel}: no rendered slides`, "run bin/deck qa first");
    await rm(p.baseline, { recursive: true, force: true });
    await cp(p.slidesPng, p.baseline, { recursive: true });
    console.log(`✔ baseline approved: ${p.baseline}`);
  }
  return 0;
});
