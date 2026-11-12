import { join } from "node:path";
import { extendTheme } from "@/deck";

/** Halden Logistics (fictional sample company) — tokens for every deck under presentations/halden/. Prose rules: BRAND.md */
export const brand = extendTheme("cobalt", {
  name: "halden",
  colors: {
    accent: "#0A6E66",
    chart: ["#0A6E66", "#A9C2BF", "#0E1A2B", "#D3DCE6", "#7F8C99"],
    positive: "#0A6E66",
    // BRAND.md: no red — decreases and at-risk use Halden amber (darkened to pass AA as text)
    negative: "#A35A0A",
    warning: "#A35A0A",
  },
  logo: { onLight: join(import.meta.dir, "brand/logo.svg"), onDark: join(import.meta.dir, "brand/logo-white.svg") },
});

export const company = "Halden Logistics";
