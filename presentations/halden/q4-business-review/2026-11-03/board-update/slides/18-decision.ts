import { slide } from "@/slide";

export default slide({
  layout: "stats",
  eyebrow: "Decision",
  title: "We ask the board to approve $74M for the Nordic hub",
  subtitle: "Funded from operating cash flow; leverage stays below 1.5× throughout.",
  stats: [
    { value: "$74M", label: "Capex, phased", detail: "$31M 2027 · $43M 2028" },
    { value: "19%", label: "Project IRR", detail: "Hurdle rate 12%" },
    { value: "4.2 yrs", label: "Payback", detail: "From full operation" },
  ],
  source: "Business case v3, appendix A; base-case volumes",
  notes: "Downside case (volumes −20%) still clears the hurdle at 13.5%. Ask for a vote.",
});
