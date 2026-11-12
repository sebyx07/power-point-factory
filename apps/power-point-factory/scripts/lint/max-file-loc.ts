// guard: every source file ≤ 300 lines (SRP: split before it grows). Exit 1 with offenders.
import { readFileSync } from "node:fs";

export const MAX = 300;
export function offenders(files: string[], max = MAX): { file: string; lines: number }[] {
  return files.map((file) => ({ file, lines: readFileSync(file, "utf8").split("\n").length })).filter((x) => x.lines > max);
}
