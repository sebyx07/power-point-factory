// bin/kubeez generate "prompt" [--model nano-banana-2] [--aspect 16:9] [--out tmp/x.jpg] — one-off image, prints path.
import { bestUrl } from "@/assets/kubeez/cache";
import { KubeezClient } from "@/assets/kubeez/client";
import { optimize } from "@/assets/kubeez/optimize";
import { parseArgs, str } from "@/cli/args";
import { log, main } from "@/cli/main";
import { userPath } from "@/cli/paths";
import { DeckSpecError } from "@/core/errors";
import { env } from "@/env";

const OUT_ALPHA = false;

await main(async () => {
  const a = parseArgs();
  const prompt = a._.join(" ");
  if (!prompt) throw new DeckSpecError('usage: bin/kubeez generate "prompt"', "see docs/image-prompts.md for prompts that don't look AI-made");
  const c = new KubeezClient();
  const job = await c.generateMedia({
    prompt,
    model: str(a, "model") ?? env.kubeezImageModel,
    generation_type: "text-to-image",
    aspect_ratio: str(a, "aspect") ?? "16:9",
  });
  log(`job ${job.generation_id} (~${job.estimated_cost_credits ?? "?"} credits) — polling…`);
  const done = await c.wait(job.generation_id);
  const url = bestUrl(done.outputs);
  const out = userPath(str(a, "out") ?? `tmp/kubeez-${job.generation_id.slice(0, 8)}.jpg`);
  await Bun.write(out, await optimize(await c.download(url), OUT_ALPHA));
  console.log(out);
  return 0;
});
