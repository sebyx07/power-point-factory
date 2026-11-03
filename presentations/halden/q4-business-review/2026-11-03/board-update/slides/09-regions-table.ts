import { slide } from "@/slide";

export default slide({
  layout: "table",
  eyebrow: "Operations",
  title: "The Nordic region is the most profitable and the most capacity-constrained",
  table: {
    header: ["Region", "Revenue ($M)", "YoY", "Margin", "On-time", "Utilization"],
    rows: [
      ["Nordics", 96, "+14%", "17.8%", "97.1%", "94%"],
      ["DACH", 118, "+8%", "14.4%", "96.8%", "81%"],
      ["Benelux", 84, "+6%", "12.9%", "95.9%", "78%"],
      ["UK & Ireland", 71, "+7%", "11.8%", "95.2%", "74%"],
      ["Iberia", 43, "+11%", "12.1%", "96.0%", "69%"],
      ["Total", 412, "+9%", "14.2%", "96.4%", "81%"],
    ],
    highlight: 0,
    total: true,
  },
  source: "Halden operations dashboard, Q4 2026; utilization = pallet positions used / available",
  notes: "Read across the Nordic row: best margin, best service, and 94% utilization. Above 90% we start turning work away.",
});
