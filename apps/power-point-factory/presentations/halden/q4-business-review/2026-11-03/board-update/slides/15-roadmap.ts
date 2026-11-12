import { slide } from "@/slide";

export default slide({
  layout: "roadmap",
  eyebrow: "2027 plan",
  title: "Four workstreams run in parallel; the hub is on the critical path",
  periods: ["Q4 26", "Q1 27", "Q2 27", "Q3 27", "Q4 27", "Q1 28"],
  today: 0.4,
  rows: [
    {
      label: "Nordic hub",
      bars: [
        { start: 0, end: 1.4, label: "Lease + tender", status: "active" },
        { start: 2, end: 4, label: "Fit-out", status: "planned" },
        { start: 4, end: 5, label: "Ramp-up", status: "planned" },
      ],
      milestones: [{ at: 5, label: "Live" }],
    },
    {
      label: "Cold chain",
      bars: [
        { start: 0, end: 2, label: "Certification", status: "active" },
        { start: 2, end: 4, label: "3 hubs live", status: "planned" },
      ],
    },
    {
      label: "Labour planning",
      bars: [
        { start: 0, end: 0.6, label: "Pilot", status: "done" },
        { start: 0.6, end: 3, label: "Roll-out 38 sites", status: "active" },
      ],
    },
    { label: "Customer renewals", bars: [{ start: 2, end: 3, label: "Two top-ten renewals", status: "at-risk" }] },
  ],
  notes:
    "Amber bar: the two renewals due Jun 30. Both in talks; flagged so the board sees the dependency. Lease Dec 15, tender Jan 31, fit-out Q2–Q3, ramp-up Q4, live Q1 2028.",
});
