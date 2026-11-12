import { slide } from "@/slide";

export default slide({
  layout: "references",
  notes: "Everything on a slide traces to one of these. Internal documents are on the board portal.",
  refs: [
    { label: "Halden Q4 2026 management accounts (unaudited)", note: "board portal, Q4-2026/finance" },
    { label: "Nordic hub business case v3", note: "appendix A, base and downside cases" },
    { label: "Port of Gothenburg — drive-time and volumes", url: "https://www.portofgothenburg.com/", note: "slide 16" },
    { label: "Halden operations dashboard, Q4 2026", note: "slide 8" },
    { label: "Halden CRM, trailing twelve months", note: "slide 10" },
    { label: "Executive summary", url: "#slide:3", note: "back to slide 3" },
  ],
});
