import { join } from "node:path";
import { extendTheme } from "@/deck";

/** Halden Logistics (fictional sample company) — tokens for every deck under presentations/halden/. Prose rules: BRAND.md */
export const brand = extendTheme("cobalt", {
  name: "halden",
  colors: {
    accent: "#0A6E66",
    chart: ["#0A6E66", "#A9C2BF", "#0E1A2B", "#D3DCE6", "#C77D1A"],
    positive: "#0A6E66",
  },
  logo: { onLight: join(import.meta.dir, "brand/logo.svg"), onDark: join(import.meta.dir, "brand/logo-white.svg") },
});

export const company = "Halden Logistics";
