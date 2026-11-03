// bin/kubeez models [image|video|music|speech] [--json] — models your key can use, with credits per generation.
import { KubeezClient } from "@/assets/kubeez/client";
import { parseArgs } from "@/cli/args";
import { main } from "@/cli/main";

await main(async () => {
  const a = parseArgs();
  const type = (a._[0] ?? "image") as "image" | "video" | "music" | "speech";
  const r = await new KubeezClient().models(type);
  if (a.flags.json) console.log(JSON.stringify(r, null, 2));
  else
    for (const m of r.models)
      console.log(
        `${String(m.model_id).padEnd(28)} ${String(m.cost_per_generation ?? "?").padStart(5)} cr  ~${String(m.estimated_time_seconds ?? "?").padStart(3)}s  ${String(m.display_name ?? "")}`,
      );
  return 0;
});
