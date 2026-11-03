import type { Theme } from "../types";

/** Warm consultancy: bone canvas, slate text, terracotta accent. Cambria display + Calibri body. */
export const terracotta: Theme = {
  name: "terracotta",
  colors: {
    bg: "#F2EDE6",
    surface: "#E6DED3",
    text: "#26323A",
    muted: "#4B5860",
    accent: "#9A3F24",
    onAccent: "#FFFFFF",
    rule: "#D3C8BA",
    positive: "#3D6B4F",
    negative: "#9A3F24",
    dark: "#26323A",
    onDark: "#F2EDE6",
    mutedOnDark: "#B4BDC2",
    chart: ["#9A3F24", "#26323A", "#D9A08C", "#8A9AA3", "#D8B45A"],
  },
  fonts: { display: "Cambria", body: "Calibri" },
  type: { hero: 48, title: 32, subtitle: 19, body: 19, small: 15, caption: 11, metric: 56, eyebrow: 12 },
  displayBold: true,
  space: { marginX: 0.75, marginY: 0.6, gutter: 0.4 },
  radius: 0.06,
  motion: { transition: { type: "push", duration: 500 }, entrance: "fade" },
};
