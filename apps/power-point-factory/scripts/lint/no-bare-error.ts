// guard: never `throw new Error(` — use a DeckError subclass with a hint (src/core/errors.ts).
import { readFileSync } from "node:fs";

export function bareErrors(files: string[]): string[] {
  return files.flatMap((f) =>
    readFileSync(f, "utf8")
      .split("\n")
      .flatMap((l, i) => (!/^\s*(\/\/|\*)/.test(l) && /throw new (Error|TypeError)\(/.test(l) ? [`${f}:${i + 1}`] : [])),
  );
}
