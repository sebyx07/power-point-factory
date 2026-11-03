// guard: every relative markdown link in the docs resolves to a file in the repo.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export function deadLinks(files: string[]): string[] {
  const out: string[] = [];
  for (const f of files) {
    const text = readFileSync(f, "utf8").replace(/```[\s\S]*?```/g, ""); // skip fenced examples
    for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const link = m[1] ?? "";
      if (/^(https?:|mailto:|#)/.test(link)) continue;
      const target = join(dirname(f), decodeURIComponent(link.split("#")[0] ?? ""));
      if (!existsSync(target)) out.push(`${f} → ${link}`);
    }
  }
  return out;
}
