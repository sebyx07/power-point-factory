import { slide } from "@/slide";

export default slide({
  layout: "roadmap",
  eyebrow: "2027 plan",
  title: "Three workstreams run in parallel; the hub is on the critical path",
  periods: ["Q4 26", "Q1 27", "Q2 27", "Q3 27", "Q4 27", "Q1 28"],
  today: 0.4,
  rows: [
    {
      label: "Nordic hub",
      bars: [
        { start: 0, end: 1, label: "Lease + permits", status: "active" },
        { start: 1, end: 4, label: "Fit-out", status: "planned" },
        { start: 4, end: 6, label: "Ramp-up", status: "planned" },
      ],
      milestones: [{ at: 6, label: "Live" }],
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
    { label: "Customer renewals", bars: [{ start: 1, end: 3, label: "Two top-ten renewals", status: "at-risk" }] },
  ],
  notes: "Red bar: the two Q2 renewals. Both in talks; flagged so the board sees the dependency.",
});
