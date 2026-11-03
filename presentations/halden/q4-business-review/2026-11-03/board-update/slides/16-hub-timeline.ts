import { slide } from "@/slide";

export default slide({
  layout: "timeline",
  eyebrow: "2027 plan",
  title: "The hub opens in Q1 2028 if we sign the lease this quarter",
  milestones: [
    { when: "Nov 2026", title: "Board approval", body: "$74M capex, phased over 18 months", done: true },
    { when: "Dec 2026", title: "Lease signed", body: "Site under exclusive option until Dec 15", done: false },
    { when: "Q2 2027", title: "Fit-out starts", body: "Racking, automation tender awarded", done: false },
    { when: "Q4 2027", title: "Pilot customers", body: "Two retail accounts migrate first", done: false },
    { when: "Q1 2028", title: "Full operation", body: "120k positions, 180 roles", done: false },
  ],
  notes: "The December 15 option deadline is the reason we're asking today rather than in February.",
});
