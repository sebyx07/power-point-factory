import { expect, test } from "bun:test";
import { resolve } from "node:path";

/** Formatters have broken this once (blank line after `---`): agents/skills/commands/rules silently stop loading. */
// .claude/ stays at the repo root; this file moved into apps/power-point-factory, so anchor the scans and reads there.
const ROOT = resolve(import.meta.dir, "../../..");
const files = [
  ...new Bun.Glob(".claude/{agents,commands,rules}/*.md").scanSync({ cwd: ROOT }),
  ...new Bun.Glob(".claude/skills/*/SKILL.md").scanSync({ cwd: ROOT }),
];

test("every .claude file has valid YAML frontmatter", async () => {
  const bad: string[] = [];
  for (const f of files) {
    const s = await Bun.file(`${ROOT}/${f}`).text();
    const m = /^---\n((?:[a-z-]+: .+\n)+)---\n/.exec(s);
    if (!m) bad.push(f);
    else if (f.includes("/rules/") && !/^paths: \[/m.test(m[1] ?? "")) bad.push(`${f} (rules need paths:)`);
    else if (/\/(agents|skills)\//.test(f) && !/^name: /m.test(m[1] ?? "")) bad.push(`${f} (needs name:)`);
    else if (!f.includes("/rules/") && !/^description: /m.test(m[1] ?? "")) bad.push(`${f} (needs description:)`);
  }
  expect(files.length).toBeGreaterThan(5);
  expect(bad).toEqual([]);
});
