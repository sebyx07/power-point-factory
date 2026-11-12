// bin/deck list — every presentation under presentations/<company>/<project>/<date>/<deck>, newest first, with last QA state.
import { relative } from "node:path";
import { main } from "@/cli/main";
import { deckPaths, listDecks, ROOT } from "@/pipeline/paths";

await main(async () => {
  const decks = listDecks();
  if (decks.length === 0) console.log("no decks yet — bin/deck new <company> <project> <deck>");
  for (const d of decks) {
    const qa = Bun.file(deckPaths(d).qaJson);
    const state = (await qa.exists()) ? (((await qa.json()) as { ok: boolean }).ok ? "pass" : "FAIL") : "—";
    console.log(`${state.padEnd(5)} ${relative(ROOT, d)}`);
  }
  return 0;
});
