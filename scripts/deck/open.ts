// bin/deck open [deck] [--pdf] — open the built .pptx (or PDF) with the desktop default app.
import { parseArgs } from "@/cli/args";
import { main } from "@/cli/main";
import { targets } from "@/cli/targets";

const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";

await main(async () => {
  const a = parseArgs();
  for (const p of targets(a._)) Bun.spawn([opener, a.flags.pdf ? p.pdf : p.pptx], { stdout: "ignore", stderr: "ignore" }).unref();
  return 0;
});
