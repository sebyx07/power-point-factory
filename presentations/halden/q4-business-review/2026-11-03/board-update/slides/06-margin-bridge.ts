import { slide } from "@/slide";

export default slide({
  layout: "waterfall",
  eyebrow: "Results",
  title: "Pricing and routes added $19M of operating profit; wage inflation took back $6M",
  steps: [
    { label: "Q4 2025", value: 46, total: true },
    { label: "Volume", value: 4 },
    { label: "Pricing", value: 9 },
    { label: "Route consolidation", value: 6 },
    { label: "Labour planning", value: 2 },
    { label: "Wage inflation", value: -6 },
    { label: "Energy", value: -2 },
    { label: "Q4 2026", value: 59, total: true },
  ],
  prefix: "$",
  suffix: "M",
  source: "Halden finance; operating profit, $M, Q4 2025 vs Q4 2026",
  notes: "Read left to right. The three operational levers more than offset wage inflation.",
});
