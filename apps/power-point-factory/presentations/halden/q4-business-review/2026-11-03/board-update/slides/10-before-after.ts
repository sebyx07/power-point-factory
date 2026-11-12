import { slide } from "@/slide";

export default slide({
  layout: "twoColumn",
  eyebrow: "Operations",
  title: "Route consolidation cut empty kilometres by a quarter",
  left: {
    icon: "route",
    heading: "Before — Q4 2025",
    body: ["212 scheduled routes", "31% empty running", "Planning by depot, weekly", "4.1 stops per route"],
  },
  right: {
    icon: "git-merge",
    heading: "After — Q4 2026",
    body: ["171 routes (**−41**)", "23% empty running", "Network-wide planning, daily", "5.6 stops per route"],
  },
  notes: "Same customers, same service level, 41 fewer routes. Fuel saving alone was $6.2M annualised.",
});
