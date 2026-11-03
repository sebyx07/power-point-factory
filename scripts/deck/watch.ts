// bin/deck watch [deck] [--render] — rebuild + static QA on every save (add --render for screenshots).
import { watch } from "node:fs";
import { parseArgs } from "@/cli/args";
import { log, main } from "@/cli/main";
import { targets } from "@/cli/targets";
import { DeckError } from "@/core/errors";
import { ROOT } from "@/pipeline/paths";
import { qaDeck } from "@/pipeline/qa";
import { reportConsole } from "@/qa/report";

await main(async () => {
  const a = parseArgs();
  const [p] = targets(a._);
  if (!p) return 1;
  let timer: Timer | undefined;
  const once = async () => {
    try {
      const r = await qaDeck(p, { fresh: true, noRender: a.flags.render !== true, log });
      console.log(`\n${new Date().toLocaleTimeString()}  ${reportConsole(r)}`);
    } catch (e) {
      console.error(e instanceof DeckError ? `✖ ${e.message}` : e);
    }
  };
  await once();
  const onChange = (_: string, file: string | null) => {
    if (file?.includes("build")) return;
    clearTimeout(timer);
    timer = setTimeout(once, 250);
  };
  watch(p.dir, { recursive: true }, onChange);
  watch(`${ROOT}/src`, { recursive: true }, onChange);
  log(`watching ${p.rel} and src/ — ctrl-c to stop`);
  await new Promise(() => {});
  return 0;
});
