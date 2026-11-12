import { DeckSpecError } from "@/core/errors";
import { type DeckPaths, deckPaths, listDecks } from "@/pipeline/paths";

/** positional deck args → paths. "all" = every deck; none = the newest deck. */
export function targets(args: string[]): DeckPaths[] {
  if (args[0] === "all") return listDecks().map(deckPaths);
  if (args.length === 0) {
    const newest = listDecks()[0];
    if (!newest) throw new DeckSpecError("no presentations yet", "bin/deck new <company> <project> <deck>");
    return [deckPaths(newest)];
  }
  return args.map(deckPaths);
}
