import { slide } from "@/slide";

export default slide({
  layout: "summary",
  eyebrow: "Executive summary",
  title: "Margin is back to 14.2% and cash covers the Nordic hub without new debt",
  rows: [
    { lead: "Revenue $412M, up 9% and 2% ahead of plan", support: "Contract logistics now 53% of revenue (slide 5)" },
    { lead: "Operating margin recovered to 14.2%", support: "Pricing, route consolidation, labour planning (slides 6–7)" },
    { lead: "The Nordic network is at 94% utilization", support: "Best margin and service, but turning work away above 90% (slide 9)" },
    { lead: "Approve $74M for the Nordic hub this quarter", support: "19% IRR, funded from cash; site option expires Dec 15 (slide 18)" },
  ],
  notes: "Lead with the decision. Each row maps to a section. If time is short, go straight to slide 18.",
});
