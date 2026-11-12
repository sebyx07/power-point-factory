import { slide } from "@/slide";

export default slide({
  layout: "nextSteps",
  eyebrow: "Decision",
  title: "One decision today; four follow-up actions with owners and dates",
  ask: "Vote: approve $74M capex for the Nordic hub.",
  actions: [
    { action: "Approve Nordic hub capex ($74M, phased)", owner: "Board", due: "Today", decision: true },
    { action: "Sign Gothenburg lease before option expiry", owner: "M. Lindqvist", due: "Dec 15", status: "green" },
    { action: "Award racking and automation tender", owner: "J. Berg", due: "Jan 31", status: "green" },
    { action: "Close two top-ten renewals (multi-year)", owner: "S. Haddad", due: "Jun 30", status: "amber" },
    { action: "Report hub progress at Q1 board", owner: "M. Lindqvist", due: "Feb 2027", status: "green" },
  ],
  notes: "Ask for the vote explicitly, then confirm owners.",
});
