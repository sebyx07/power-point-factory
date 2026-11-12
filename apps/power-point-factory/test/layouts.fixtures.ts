/** Realistic props per layout — the layout contract tests. Keep copy at real-world length. */
export const FIXTURES: Record<string, unknown> = {
  cover: { title: "Q4 2026 Business Review", subtitle: "Margin recovered ahead of plan; one decision for the board." },
  agenda: { items: ["Results — revenue, margin", "Operations — network", "Plan — 2027", "Decision — hub"] },
  section: { number: "02", title: "Operations", lede: "Capacity, not demand, is the constraint." },
  summary: {
    eyebrow: "Summary",
    title: "Margin is back to 14.2% and cash covers the hub",
    rows: [
      { lead: "Revenue $412M, +9%", support: "Contract logistics now 53%" },
      { lead: "Margin 14.2%", support: "Three levers" },
      { lead: "Approve $74M", support: "19% IRR" },
    ],
  },
  nextSteps: {
    title: "One decision, three actions",
    ask: "Approve the hub.",
    actions: [
      { action: "Approve capex", owner: "Board", due: "Today", decision: true },
      { action: "Sign lease", owner: "CFO", due: "Dec 15", status: "green" },
    ],
  },
  references: { refs: [{ label: "Eurostat freight statistics", url: "https://ec.europa.eu/eurostat" }, { label: "Internal accounts" }] },
  closing: { title: "Questions and discussion", message: "Decision requested: approve the hub.", contact: ["CFO", "cfo@example.com"] },
  bullets: {
    eyebrow: "Results",
    title: "Three levers recovered the margin",
    bullets: ["Pricing reset, **+0.8 pts**", "Routes merged, **+1.3 pts**", "Shift planning, **+0.5 pts**"],
    takeaway: "Margin is structural, not seasonal.",
  },
  twoColumn: {
    title: "Consolidation cut empty kilometres by a quarter",
    left: { heading: "Before", body: ["212 routes", "31% empty"] },
    right: { heading: "After", body: ["171 routes", "23% empty"] },
  },
  cards: {
    title: "Three initiatives carry the plan",
    cards: [
      { icon: "warehouse", title: "Nordic hub", body: "120k pallet positions." },
      { icon: "heart-pulse", title: "Cold chain", body: "Three certified hubs." },
      { icon: "calendar-clock", title: "Labour planning", body: "38 sites." },
    ],
  },
  quote: { quote: "They held 97% on-time through peak, and we want more volume with them.", name: "Head of Supply Chain", role: "Retail customer" },
  bigNumber: { eyebrow: "The ask", value: "$74M", statement: "Funded from cash, leverage stays below 1.5×.", source: "Business case v3" },
  stats: {
    title: "All four metrics beat plan",
    stats: [
      { value: "$412M", label: "Revenue", delta: "+9%" },
      { value: "14.2%", label: "Margin", delta: "+2.6 pts" },
      { value: "−3%", label: "Churn", delta: "−0.4 pts" },
    ],
    source: "Finance",
  },
  chart: {
    title: "Revenue grew every quarter",
    chart: { type: "column", labels: ["Q1", "Q2", "Q3", "Q4"], series: [{ name: "Revenue", values: [380, 391, 400, 412] }], highlight: 3, format: "$#,##0" },
    insights: ["Q4 best quarter"],
    source: "Finance",
  },
  waterfall: {
    title: "Pricing added $9M; wages took $6M",
    steps: [
      { label: "2025", value: 46, total: true },
      { label: "Pricing", value: 9 },
      { label: "Wages", value: -6 },
      { label: "2026", value: 49, total: true },
    ],
    prefix: "$",
    suffix: "M",
    source: "Finance",
  },
  table: {
    title: "Nordics lead on margin",
    table: {
      header: ["Region", "Revenue", "Status", "Fit"],
      rows: [
        ["Nordics", 96, { rag: "green" }, { harvey: 4 }],
        ["DACH", 118, { rag: "amber" }, { harvey: 2 }],
        ["Total", 214, "—", { harvey: 3 }],
      ],
      total: true,
      highlight: 0,
    },
    source: "Ops",
  },
  matrix: {
    title: "Only the hub needs the board",
    x: { label: "Effort" },
    y: { label: "Value" },
    quadrants: ["Quick wins", "Big bets", "Fill-ins", "Avoid"],
    target: "tr",
    items: [
      { label: "Hub", x: 0.85, y: 0.8, highlight: true },
      { label: "Planning", x: 0.2, y: 0.75 },
      { label: "Cold chain", x: 0.25, y: 0.7 },
      { label: "Portal", x: 0.3, y: 0.3 },
    ],
  },
  process: {
    title: "Four steps from lease to live",
    steps: [
      { title: "Sign lease", body: "Dec" },
      { title: "Fit out", body: "Q2–Q3" },
      { title: "Pilot", body: "Q4" },
      { title: "Go live", body: "Q1" },
    ],
    current: 0,
  },
  timeline: {
    title: "The hub opens in Q1 2028",
    milestones: [
      { when: "Nov 2026", title: "Approval", done: true },
      { when: "Q2 2027", title: "Fit-out", done: false },
      { when: "Q1 2028", title: "Live", done: false },
    ],
  },
  roadmap: {
    title: "Three workstreams in parallel",
    periods: ["Q1", "Q2", "Q3", "Q4"],
    today: 1.2,
    rows: [
      { label: "Hub", bars: [{ start: 0, end: 2, label: "Fit-out", status: "active" }] },
      { label: "Cold chain", bars: [{ start: 1, end: 4, label: "Certify", status: "planned" }] },
      { label: "Pilot", bars: [{ start: 0, end: 1, label: "Done", status: "done" }] },
    ],
  },
  imageFull: { image: { generate: { prompt: "warehouse aisle" } }, title: "Gothenburg: 40 minutes from the port", caption: "Proposed site" },
  video: { title: "The site today", video: { generateVideo: { prompt: "slow aerial pan over a logistics site" } } },
};
