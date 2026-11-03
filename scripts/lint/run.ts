// bin/check guards step: repo-specific rules Biome can't express. Each guard is a pure fn + test.
import { readFileSync } from "node:fs";
import { declared, envReads } from "./env-in-example";
import { MAX, offenders } from "./max-file-loc";
import { bareErrors } from "./no-bare-error";

const files = [...new Bun.Glob("{src,scripts}/**/*.ts").scanSync(".")].filter((f) => !f.endsWith(".test.ts"));
let bad = 0;
const fail = (rule: string, lines: string[], fix: string) => {
  if (lines.length === 0) return;
  bad++;
  console.error(`✖ ${rule}\n${lines.map((l) => `  ${l}`).join("\n")}\n  → ${fix}`);
};

fail(
  "max-file-loc",
  offenders(files).map((o) => `${o.file}: ${o.lines} lines`),
  `split the file (≤ ${MAX} lines, one job per file)`,
);
const ex = declared(readFileSync(".env.example", "utf8"));
fail(
  "env-in-example",
  [...envReads(files)].filter((n) => !ex.has(n)),
  "declare it in .env.example with a one-line comment",
);
fail("no-bare-error", bareErrors(files), "throw a DeckError subclass from src/core/errors.ts with a hint");
if (!bad) console.log("✔ guards: max-file-loc, env-in-example, no-bare-error");
process.exit(bad ? 1 : 0);
