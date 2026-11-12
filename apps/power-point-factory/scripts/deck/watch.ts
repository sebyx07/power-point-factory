// bin/deck watch [deck] [--render] — rebuild + QA on every save of the deck, its brand, or src/.
// Each rebuild runs in a fresh subprocess: Bun caches imported modules, so in-process reloads go stale.
import { watch } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "@/cli/args";
import { log, main } from "@/cli/main";
import { targets } from "@/cli/targets";
import { PRESENTATIONS, ROOT } from "@/pipeline/paths";

await main(async () => {
  const a = parseArgs();
  const [p] = targets(a._);
  if (!p) return 1;
  let timer: Timer | undefined;
  let running: ReturnType<typeof Bun.spawn> | undefined;
  const once = () => {
    running?.kill();
    console.log(`\n${new Date().toLocaleTimeString()}`);
    running = Bun.spawn(["bun", join(ROOT, "scripts/deck/qa.ts"), p.dir, ...(a.flags.render === true ? [] : ["--fast"])], {
      cwd: ROOT,
      stdout: "inherit",
      stderr: "inherit",
    });
  };
  once();
  const onChange = (_: string, file: string | null) => {
    if (file && /(^|\/)(out|node_modules|\.git)\//.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(once, 250);
  };
  const company = join(PRESENTATIONS, p.rel.split("/")[0] ?? "");
  for (const dir of [company, join(ROOT, "src")]) watch(dir, { recursive: true }, onChange);
  log(`watching ${p.rel}, its company brand/layouts, and src/ — ctrl-c to stop`);
  await new Promise(() => {});
  return 0;
});
