// bin/kubeez balance — remaining credits.
import { KubeezClient } from "@/assets/kubeez/client";
import { main } from "@/cli/main";

await main(async () => {
  console.log(JSON.stringify(await new KubeezClient().balance(), null, 2));
  return 0;
});
