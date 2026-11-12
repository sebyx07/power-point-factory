import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "bun:test";
import { DeckSpecError } from "@/core/errors";
import { PRESENTATIONS, ROOT, deckPaths } from "@/pipeline/paths";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const HALDEN = "presentations/halden/q4-business-review/2026-11-03/board-update";

/** run fn with DECK_CWD set to cwd, the way bin/* shims export it before cd'ing into the app dir */
const withUserCwd = (cwd: string, fn: () => void) => {
  const prev = process.env.DECK_CWD;
  process.env.DECK_CWD = cwd;
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env.DECK_CWD;
    else process.env.DECK_CWD = prev;
  }
};

test("deck arg relative to the repo root resolves via the app-root fallback", () => {
  // bin/deck exports DECK_CWD=$PWD then cds into apps/power-point-factory; the documented deck form
  // (presentations/...) is app-root-relative, so a root-level invocation must still resolve.
  withUserCwd(REPO_ROOT, () => {
    const p = deckPaths(HALDEN);
    expect(p.dir.startsWith(`${PRESENTATIONS}/`)).toBe(true);
    expect(existsSync(p.entry)).toBe(true);
    expect(p.rel).toBe("halden/q4-business-review/2026-11-03/board-update");
  });
});

test("absolute deck path under PRESENTATIONS still resolves", () => {
  withUserCwd(REPO_ROOT, () => {
    const p = deckPaths(resolve(ROOT, HALDEN));
    expect(p.dir).toBe(resolve(ROOT, HALDEN));
    expect(existsSync(p.entry)).toBe(true);
  });
});

test("deck that exists nowhere still throws DeckSpecError", () => {
  withUserCwd(REPO_ROOT, () => {
    expect(() => deckPaths("presentations/nope/1/2/3")).toThrow(DeckSpecError);
  });
});
