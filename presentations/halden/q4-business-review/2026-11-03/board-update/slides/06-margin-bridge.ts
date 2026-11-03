import { slide } from "@/slide";

export default slide({
  layout: "waterfall",
  eyebrow: "Results",
  title: "Pricing and routes added $14M of operating profit; wages and energy took back $4M",
  steps: [
    { label: "Q4 2025", value: 44, total: true },
    { label: "Volume", value: 3 },
    { label: "Pricing", value: 8 },
    { label: "Route consolidation", value: 6 },
    { label: "Labour planning", value: 2 },
    { label: "Wage inflation", value: -3 },
    { label: "Energy", value: -1 },
    { label: "Q4 2026", value: 59, total: true },
  ],
  prefix: "$",
  suffix: "M",
  source: "Halden finance; operating profit, $M, Q4 2025 vs Q4 2026",
  notes: "Read left to right: $44M (11.6% margin) to $59M (14.2%). The three operational levers are $16M; cost inflation took back $4M.",
});
