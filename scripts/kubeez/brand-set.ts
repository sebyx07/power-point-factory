// bin/kubeez brand-set <company> <file.json> — generate a reusable reference photo set into presentations/<company>/brand/photos/
// file.json: [{ "name": "dock-dawn", "prompt": "…", "aspect": "16:9", "model": "nano-banana-pro-2K" }]
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { bestUrl } from "@/assets/kubeez/cache";
import { KubeezClient } from "@/assets/kubeez/client";
import { optimize } from "@/assets/kubeez/optimize";
import { parseArgs } from "@/cli/args";
import { log, main } from "@/cli/main";
import { DeckSpecError } from "@/core/errors";
import { env } from "@/env";
import { PRESENTATIONS } from "@/pipeline/paths";

interface Shot {
  name: string;
  prompt: string;
  aspect?: string;
  model?: string;
}

await main(async () => {
  const [company, file] = parseArgs()._;
  if (!company || !file) throw new DeckSpecError("usage: bin/kubeez brand-set <company> <shots.json>");
  const shots = (await Bun.file(file).json()) as Shot[];
  const dir = join(PRESENTATIONS, company, "brand", "photos");
  await mkdir(dir, { recursive: true });
  const c = new KubeezClient();
  const done = await Promise.all(
    shots.map(async (s) => {
      const out = join(dir, `${s.name}.jpg`);
      if (await Bun.file(out).exists()) return `= ${out}`;
      const job = await c.generateMedia({
        prompt: s.prompt,
        model: s.model ?? env.kubeezImageModel,
        generation_type: "text-to-image",
        aspect_ratio: s.aspect ?? "16:9",
      });
      log(`${s.name}: job ${job.generation_id} (~${job.estimated_cost_credits ?? "?"} cr)`);
      const st = await c.wait(job.generation_id);
      await Bun.write(out, await optimize(await c.download(bestUrl(st.outputs)), false));
      await Bun.write(join(dir, `${s.name}.prompt.txt`), `${s.model ?? env.kubeezImageModel} · ${s.aspect ?? "16:9"}\n${s.prompt}\n`);
      return `+ ${out}`;
    }),
  );
  console.log(done.join("\n"));
  return 0;
});
