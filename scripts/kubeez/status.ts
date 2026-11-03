// bin/kubeez status <generation_id> — raw job status JSON.
import { KubeezClient } from "@/assets/kubeez/client";
import { parseArgs } from "@/cli/args";
import { main } from "@/cli/main";
import { DeckSpecError } from "@/core/errors";

await main(async () => {
  const id = parseArgs()._[0];
  if (!id) throw new DeckSpecError("usage: bin/kubeez status <generation_id>");
  console.log(JSON.stringify(await new KubeezClient().status(id), null, 2));
  return 0;
});
