import { slide } from "@/slide";

export default slide({
  layout: "matrix",
  eyebrow: "2027 plan",
  title: "The hub is the only high-value move we cannot make without the board",
  x: { label: "Effort and capital", low: "Low", high: "High" },
  y: { label: "Value", low: "Low", high: "High" },
  quadrants: ["Quick wins", "Big bets", "Fill-ins", "Avoid"],
  target: "tr",
  items: [
    { label: "Nordic hub", x: 0.84, y: 0.74, size: 1, highlight: true },
    { label: "Labour planning", x: 0.22, y: 0.72, size: 0.5 },
    { label: "Cold chain", x: 0.6, y: 0.58, size: 0.6 },
    { label: "Fleet electrification", x: 0.75, y: 0.38, size: 0.5 },
    { label: "Customer portal v2", x: 0.3, y: 0.3, size: 0.3 },
  ],
  insights: [
    "**Nordic hub**: highest value, needs capex approval",
    "Labour planning and cold chain are funded in the operating plan",
    "Electrification waits for 2028 truck pricing",
  ],
  notes: "Bubble size = three-year profit impact. Only the top-right item needs a board vote.",
});
