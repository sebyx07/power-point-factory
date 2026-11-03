// guard: every Bun.env/process.env name read anywhere is declared in .env.example.
import { readFileSync } from "node:fs";

export function envReads(files: string[]): Set<string> {
  const names = new Set<string>();
  const re = /(?:Bun\.env|process\.env)(?:\.([A-Z][A-Z0-9_]+)|\[\s*"([A-Z][A-Z0-9_]+)"\s*\])|read\("([A-Z][A-Z0-9_]+)"\)|num\("([A-Z][A-Z0-9_]+)"/g;
  for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(re)) names.add(m[1] ?? m[2] ?? m[3] ?? m[4] ?? "");
  names.delete("");
  return names;
}
export function declared(example: string): Set<string> {
  return new Set([...example.matchAll(/^#?\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1] ?? ""));
}
