import { DeckError } from "@/core/errors";

/** Wrap every script: domain errors print message + hint (no stack), exit 1. */
export async function main(fn: () => Promise<number | undefined>): Promise<void> {
  try {
    process.exitCode = (await fn()) ?? 0;
  } catch (e) {
    if (e instanceof DeckError) {
      console.error(`\x1b[31m✖ ${e.name}\x1b[0m ${e.message}`);
      process.exitCode = 1;
    } else throw e;
  }
}
export const log = (m: string) => console.error(`\x1b[2m${m}\x1b[0m`);
