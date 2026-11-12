// bin/kubeez upload <file> — upload a local image → public URL (for image-to-image / remove-bg).
import { KubeezClient } from "@/assets/kubeez/client";
import { parseArgs } from "@/cli/args";
import { main } from "@/cli/main";
import { userPath } from "@/cli/paths";
import { DeckSpecError } from "@/core/errors";

await main(async () => {
  const file = parseArgs()._[0];
  if (!file) throw new DeckSpecError("usage: bin/kubeez upload <file>");
  console.log(await new KubeezClient().upload(userPath(file)));
  return 0;
});
