import { slide } from "@/slide";

export default slide({
  layout: "chart",
  eyebrow: "Results",
  title: "Revenue rose 9% year on year as contract logistics outpaced freight",
  chart: {
    type: "stackedColumn",
    labels: ["Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26", "Q2 26", "Q3 26", "Q4 26"],
    series: [
      { name: "Contract logistics", values: [168, 172, 179, 186, 191, 199, 207, 218] },
      { name: "Freight forwarding", values: [174, 170, 176, 192, 178, 181, 186, 194] },
    ],
    format: "$#,##0",
    showValues: false,
  },
  insights: [
    "Contract logistics **+17%** YoY, now 53% of revenue",
    "Freight flat in volume; price carried the gain",
    "Q4 seasonality in line with the last three years",
  ],
  source: "Halden finance, revenue in $M",
  notes: "The mix shift matters more than the total: contract revenue is multi-year and carries a margin about 4 points higher.",
});
