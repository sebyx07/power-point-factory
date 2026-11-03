import { slide } from "@/slide";

export default slide({
  layout: "stats",
  eyebrow: "Decision",
  title: "We ask the board to approve $74M for the Nordic hub",
  subtitle: "Funded from operating cash flow; leverage stays below 1.5× throughout.",
  stats: [
    { value: "$74M", label: "Capex", detail: "$52M 2027 · $22M 2028" },
    { value: "19%", label: "Project IRR", detail: "Hurdle rate 12%" },
    { value: "4.2 yrs", label: "Payback", detail: "From full operation" },
    { value: "13.5%", label: "Downside IRR", detail: "Volumes −20%" },
  ],
  source: "Business case v3, appendix A; base-case volumes",
  notes: "Even the downside case clears the 12% hurdle. Ask for a vote.",
});
