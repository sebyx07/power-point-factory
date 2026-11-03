import { slide } from "@/slide";

export default slide({
  layout: "chart",
  eyebrow: "Results",
  title: "Margin recovered in three steps: pricing, routes, then labour planning",
  chart: {
    type: "line",
    labels: ["Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26", "Q2 26", "Q3 26", "Q4 26"],
    series: [
      { name: "Operating margin", values: [0.121, 0.118, 0.112, 0.116, 0.124, 0.131, 0.137, 0.142] },
      { name: "Plan", values: [0.12, 0.12, 0.12, 0.12, 0.125, 0.127, 0.129, 0.13] },
    ],
    format: "0.0%",
    min: 0.1,
    max: 0.15,
  },
  insights: ["Q1: list-price reset, **+0.8 pts**", "Q2–Q3: 41 routes merged, **+1.3 pts**", "Q4: shift planning tool live, **+0.5 pts**"],
  insightsTitle: "What moved it",
  source: "Halden finance",
  notes: "Plan line is the February budget. We crossed it in Q2 and the gap kept widening.",
});
