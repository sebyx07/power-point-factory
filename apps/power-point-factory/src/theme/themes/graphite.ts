import type { Theme } from "../types";

/** Dark cockpit: graphite canvas, signal-green accent. Calibri. For product/tech reviews. */
export const graphite: Theme = {
  name: "graphite",
  colors: {
    bg: "#121417",
    surface: "#1C2025",
    text: "#ECEEF0",
    muted: "#9AA3AD",
    accent: "#3FB68B",
    onAccent: "#0B0D0F",
    rule: "#2C3238",
    positive: "#3FB68B",
    negative: "#F06A5F",
    dark: "#0B0D0F",
    onDark: "#ECEEF0",
    mutedOnDark: "#9AA3AD",
    chart: ["#3FB68B", "#5B6773", "#A6E3CB", "#ECEEF0", "#F2B84B"],
  },
  fonts: { display: "Calibri", body: "Calibri" },
  type: { hero: 48, title: 30, subtitle: 18, body: 18, small: 14, caption: 11, metric: 56, eyebrow: 12 },
  displayBold: true,
  space: { marginX: 0.7, marginY: 0.55, gutter: 0.35 },
  radius: 0.1,
  motion: { transition: { type: "fade", duration: 450 }, entrance: "rise" },
};
