// bin/deck new <company> <project> <deck> [--date YYYY-MM-DD] [--theme cobalt|ledger|graphite|terracotta] [--title "…"]
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs, str } from "@/cli/args";
import { main } from "@/cli/main";
import { DeckSpecError } from "@/core/errors";
import { PRESENTATIONS, ROOT } from "@/pipeline/paths";
import { assetsMd, brandFile, brandMd, deckFile, slideFiles } from "@/scaffold/templates";
import { themes } from "@/theme";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

await main(async () => {
  const a = parseArgs();
  const [company, project, deck] = a._;
  if (!company || !project || !deck)
    throw new DeckSpecError("usage: bin/deck new <company> <project> <deck>", "slugs: lowercase-kebab, e.g. acme q4-review board-update");
  for (const s of [company, project, deck]) if (!SLUG.test(s)) throw new DeckSpecError(`"${s}" is not a kebab-case slug`);
  const date = str(a, "date") ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
    throw new DeckSpecError(`--date "${date}" is not YYYY-MM-DD`, "e.g. --date 2026-11-03 (zero-padded)");
  const theme = str(a, "theme") ?? "cobalt";
  if (!(theme in themes)) throw new DeckSpecError(`unknown theme "${theme}"`, `one of: ${Object.keys(themes).join(", ")}`);
  const title = str(a, "title") ?? deck.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const companyDir = join(PRESENTATIONS, company);
  const dir = join(companyDir, project, date, deck);
  if (existsSync(dir)) throw new DeckSpecError(`${dir} already exists`);
  await mkdir(join(dir, "slides"), { recursive: true });
  await mkdir(join(dir, "assets"), { recursive: true });
  const brandExists = existsSync(join(companyDir, "brand.ts"));
  if (brandExists && str(a, "theme")) console.warn(`▲ --theme ignored: ${company} already has brand.ts (edit its base theme there)`);
  if (!brandExists) {
    await Bun.write(join(companyDir, "brand.ts"), brandFile(company, theme));
    await Bun.write(join(companyDir, "BRAND.md"), brandMd(company));
    await Bun.write(join(companyDir, "brand", "assets.md"), assetsMd(company));
    await Bun.write(join(companyDir, "layouts", ".keep"), "");
    console.log(`+ ${companyDir}/{brand.ts,BRAND.md,brand/,layouts/} — new company: run the onboard-company skill to fill the brand`);
  }
  await Bun.write(join(dir, "deck.ts"), deckFile(title, date));
  for (const [name, body] of slideFiles(title)) await Bun.write(join(dir, "slides", name), body);
  await Bun.write(join(dir, "assets", ".gitkeep"), "");
  console.log(`✔ ${dir}\n  next: edit slides/*.ts, then bin/deck loop ${dir.replace(`${ROOT}/`, "")}`);
  return 0;
});
