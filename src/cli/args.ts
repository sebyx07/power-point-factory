/** tiny flag parser: positionals + --flag / --key=value / --key value */
export interface Args {
  _: string[];
  flags: Record<string, string | true>;
}
export function parseArgs(argv = Bun.argv.slice(2)): Args {
  const out: Args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? "";
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const [k, v] = a.slice(2).split("=", 2) as [string, string | undefined];
    const next = argv[i + 1];
    if (v !== undefined) out.flags[k] = v;
    else if (next && !next.startsWith("--") && ["theme", "date", "title", "model", "aspect", "out", "type"].includes(k)) {
      out.flags[k] = next;
      i++;
    } else out.flags[k] = true;
  }
  return out;
}
export const str = (a: Args, k: string): string | undefined => (typeof a.flags[k] === "string" ? (a.flags[k] as string) : undefined);
