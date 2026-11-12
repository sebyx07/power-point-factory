// bin/kubeez remove-bg <url|file> [--out tmp/cut.png] — transparent-background PNG (logos, product shots, people).
import { existsSync } from "node:fs";
import { bestUrl } from "@/assets/kubeez/cache";
import { KubeezClient } from "@/assets/kubeez/client";
import { optimize } from "@/assets/kubeez/optimize";
import { parseArgs, str } from "@/cli/args";
import { log, main } from "@/cli/main";
import { userPath } from "@/cli/paths";
import { DeckSpecError } from "@/core/errors";

const OUT_ALPHA = true;

await main(async () => {
  const a = parseArgs();
  const src = a._[0];
  if (!src) throw new DeckSpecError("usage: bin/kubeez remove-bg <url|file>");
  const c = new KubeezClient();
  const url = existsSync(userPath(src)) ? await c.upload(userPath(src)) : src;
  const job = await c.removeBackground(url);
  log(`job ${job.generation_id} — polling…`);
  const done = await c.wait(job.generation_id);
  const out = userPath(str(a, "out") ?? `tmp/cutout-${job.generation_id.slice(0, 8)}.png`);
  await Bun.write(out, await optimize(await c.download(bestUrl(done.outputs)), OUT_ALPHA));
  console.log(out);
  return 0;
});
