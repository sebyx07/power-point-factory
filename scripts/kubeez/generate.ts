// bin/kubeez generate "prompt" [--model nano-banana-2] [--aspect 16:9] [--out tmp/x.png] — one-off image, prints path.
import { KubeezClient } from "@/assets/kubeez/client";
import { parseArgs, str } from "@/cli/args";
import { log, main } from "@/cli/main";
import { DeckSpecError } from "@/core/errors";
import { env } from "@/env";

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
  const url = done.outputs?.find((o) => o.url)?.url ?? "";
  const out = str(a, "out") ?? `tmp/kubeez-${job.generation_id.slice(0, 8)}.png`;
  await Bun.write(out, await c.download(url));
  console.log(out);
  return 0;
});
