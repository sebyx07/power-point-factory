// bin/doctor — environment check. Every miss prints its fix. Exit 1 if a hard requirement is missing.
import { env } from "@/env";
import { SAFE_FONTS } from "@/text/fonts";

let hard = 0;
const ok = (m: string) => console.log(`\x1b[32m✔\x1b[0m ${m}`);
const miss = (m: string, fix: string, required = true) => {
  if (required) hard++;
  console.log(`${required ? "\x1b[31m✖" : "\x1b[33m▲"}\x1b[0m ${m}\n    → ${fix}`);
};
const has = (b: string) => Bun.which(b) !== null;

ok(`bun ${Bun.version}`);
has(env.soffice) ? ok("LibreOffice (QA renderer)") : miss("LibreOffice not found", "sudo apt install libreoffice-impress  ·  brew install --cask libreoffice");
has("pdftoppm") ? ok("poppler pdftoppm (screenshots)") : miss("pdftoppm not found", "sudo apt install poppler-utils  ·  brew install poppler");
const fc = has("fc-match");
if (!fc) miss("fontconfig (fc-match) not found — cannot locate metric-twin fonts", "sudo apt install fontconfig · brew install fontconfig");
for (const [face, { twin, pkg }] of fc ? Object.entries(SAFE_FONTS) : []) {
  const fam = Bun.spawnSync(["fc-match", "-f", "%{family}", twin]).stdout.toString();
  fam.split(",").includes(twin)
    ? ok(`${face} ↔ ${twin}`)
    : miss(
        `${twin} (metric twin of ${face}) missing`,
        `install ${pkg}; text fit measurement for ${face} decks needs it`,
        face === "Calibri" || face === "Arial",
      );
}
env.kubeezApiKey
  ? ok("KUBEEZ_API_KEY set")
  : miss("KUBEEZ_API_KEY not set — generated images become placeholders", "add it to .env (https://kubeez.com/settings/api-keys)", false);
process.exit(hard ? 1 : 0);
