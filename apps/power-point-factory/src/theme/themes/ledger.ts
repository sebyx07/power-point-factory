import type { Theme } from "../types";

/** Editorial: warm paper, ink, oxblood accent. Georgia display + Calibri body. */
export const ledger: Theme = {
  name: "ledger",
  colors: {
    bg: "#F7F4EE",
    surface: "#EDE7DC",
    text: "#1F1D1A",
    muted: "#5E584F",
    accent: "#8A2F2A",
    onAccent: "#FFFFFF",
    rule: "#D8D0C2",
    positive: "#2F6B3A",
    negative: "#8A2F2A",
    dark: "#1F1D1A",
    onDark: "#F7F4EE",
    mutedOnDark: "#B8AFA1",
    chart: ["#8A2F2A", "#C9A79A", "#1F1D1A", "#9C9488", "#D8B45A"],
  },
  fonts: { display: "Georgia", body: "Calibri" },
  type: { hero: 50, title: 32, subtitle: 19, body: 19, small: 15, caption: 11, metric: 58, eyebrow: 12 },
  displayBold: false,
  space: { marginX: 0.75, marginY: 0.6, gutter: 0.4 },
  radius: 0.02,
  motion: { transition: { type: "fade", duration: 600 }, entrance: "fade" },
};
