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
    const body = a.slice(2);
    const eq = body.indexOf("=");
    const k = eq < 0 ? body : body.slice(0, eq);
    const v = eq < 0 ? undefined : body.slice(eq + 1);
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
