import type { Theme } from "../types";

/** Corporate clean: white canvas, ink navy, one cobalt accent. Arial everywhere. */
export const cobalt: Theme = {
  name: "cobalt",
  colors: {
    bg: "#FFFFFF",
    surface: "#F2F5FA",
    text: "#0E1A2B",
    muted: "#55617A",
    accent: "#1F4FD8",
    onAccent: "#FFFFFF",
    rule: "#D5DCE8",
    positive: "#127A4B",
    negative: "#B42318",
    dark: "#0E1A2B",
    onDark: "#FFFFFF",
    mutedOnDark: "#A9B4C8",
    chart: ["#1F4FD8", "#8FA8EE", "#0E1A2B", "#C9D3E6", "#E08A1E"],
  },
  fonts: { display: "Arial", body: "Arial" },
  type: { hero: 46, title: 30, subtitle: 18, body: 18, small: 14, caption: 11, metric: 54, eyebrow: 12 },
  displayBold: true,
  space: { marginX: 0.7, marginY: 0.55, gutter: 0.35 },
  radius: 0.08,
  motion: { transition: { type: "fade", duration: 500 }, entrance: "rise" },
};
