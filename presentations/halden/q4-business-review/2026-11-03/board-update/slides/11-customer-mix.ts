import { slide } from "@/slide";

export default slide({
  layout: "chart",
  eyebrow: "Customers",
  title: "No customer is above 9% of revenue; retail and health care lead the mix",
  chart: {
    type: "doughnut",
    labels: ["Retail", "Health care", "Industrial", "Automotive", "Other"],
    series: [{ name: "Revenue share", values: [34, 24, 19, 13, 10] }],
  },
  insights: ["Gross retention **97%**, net **108%**", "Health care grew fastest, **+22%**", "Two top-ten renewals due Q2 2027"],
  source: "Halden CRM, trailing twelve months",
  notes: "Concentration is healthy. The two Q2 renewals are both in talks; we expect multi-year terms.",
});
