import { slide } from "@/slide";

export default slide({
  layout: "stats",
  eyebrow: "Results",
  title: "All four headline metrics beat plan in Q4",
  stats: [
    { value: "$412M", label: "Revenue", delta: "+9% YoY", detail: "Plan $404M" },
    { value: "14.2%", label: "Operating margin", delta: "+2.6 pts YoY", detail: "Plan 13.0%" },
    { value: "$58M", label: "Free cash flow", delta: "+$21M YoY", detail: "Conversion 98%" },
    { value: "96.4%", label: "On-time delivery", delta: "+1.8 pts YoY", detail: "Target 95%" },
  ],
  source: "Halden finance, unaudited Q4 2026 management accounts",
  notes: "Each tile: actual, change versus last year, and the plan we committed to in February.",
});
