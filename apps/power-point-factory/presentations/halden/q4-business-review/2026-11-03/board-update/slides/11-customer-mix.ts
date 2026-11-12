import { slide } from "@/slide";

export default slide({
  layout: "chart",
  eyebrow: "Customers",
  title: "Retail and health care are 58% of revenue; net retention is 108%",
  chart: {
    type: "doughnut",
    labels: ["Retail", "Health care", "Industrial", "Automotive", "Other"],
    series: [{ name: "Revenue share", values: [34, 24, 19, 13, 10] }],
  },
  insights: [
    "Largest customer **9%** of revenue",
    "Health care grew fastest, **+22%**",
    "Gross retention **97%**, net **108%**",
    "Two top-ten renewals due **Jun 30, 2027**",
  ],
  source: "Halden CRM, trailing twelve months",
  notes: "Concentration is healthy. The two Q2 renewals are both in talks; we expect multi-year terms.",
});
