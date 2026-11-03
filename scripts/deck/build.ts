// bin/deck build [deck…|all] — recipe → .pptx (no QA). Prints the output path.
import { parseArgs } from "@/cli/args";
import { log, main } from "@/cli/main";
import { targets } from "@/cli/targets";
import { buildDeck } from "@/pipeline/build";

await main(async () => {
  const a = parseArgs();
  for (const p of targets(a._)) {
    const { scene, ms } = await buildDeck(p, { log });
    console.log(`✔ ${p.rel}: ${scene.slides.length} slides → ${p.pptx} (${Math.round(ms)}ms)`);
  }
  return 0;
});
