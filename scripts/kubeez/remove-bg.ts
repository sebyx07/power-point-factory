// bin/kubeez remove-bg <url|file> [--out tmp/cut.png] — transparent-background PNG (logos, product shots, people).
import { existsSync } from "node:fs";
import { KubeezClient } from "@/assets/kubeez/client";
import { parseArgs, str } from "@/cli/args";
import { log, main } from "@/cli/main";
import { DeckSpecError } from "@/core/errors";

await main(async () => {
  const a = parseArgs();
  const src = a._[0];
  if (!src) throw new DeckSpecError("usage: bin/kubeez remove-bg <url|file>");
  const c = new KubeezClient();
  const url = existsSync(src) ? await c.upload(src) : src;
  const job = await c.removeBackground(url);
  log(`job ${job.generation_id} — polling…`);
  const done = await c.wait(job.generation_id);
  const out = str(a, "out") ?? `tmp/cutout-${job.generation_id.slice(0, 8)}.png`;
  await Bun.write(out, await c.download(done.outputs?.find((o) => o.url)?.url ?? ""));
  console.log(out);
  return 0;
});
