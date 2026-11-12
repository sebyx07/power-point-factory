import type { Layout, SlideCommon } from "@/core/deck";
import { agenda } from "./agenda";
import { bigNumber } from "./big-number";
import { bullets } from "./bullets";
import { cards } from "./cards";
import { chart } from "./chart";
import { closing } from "./closing";
import { cover } from "./cover";
import { custom } from "./custom";
import { imageFull } from "./image-full";
import { matrix } from "./matrix";
import { nextSteps } from "./next-steps";
import { process } from "./process";
import { quote } from "./quote";
import { references } from "./references";
import { roadmap } from "./roadmap";
import { section } from "./section";
import { stats } from "./stats";
import { summary } from "./summary";
import { table } from "./table";
import { timeline } from "./timeline";
import { twoColumn } from "./two-column";
import { video } from "./video";
import { waterfall } from "./waterfall";

/** The layout catalog. Add a layout = add a file + one line here (docs/layouts.md lists them). */
export const layouts = {
  // structure
  cover,
  agenda,
  section,
  summary,
  nextSteps,
  references,
  closing,
  // text
  bullets,
  twoColumn,
  cards,
  quote,
  bigNumber,
  // data
  stats,
  chart,
  waterfall,
  table,
  matrix,
  // plans
  process,
  timeline,
  roadmap,
  // media
  imageFull,
  video,
  // escape hatch
  custom,
};

export type Layouts = typeof layouts;
export type LayoutName = keyof Layouts;
type PropsOf<L> = L extends Layout<infer P> ? P : never;

/** One slide in a deck: `{ layout: "stats", title, stats: [...] }` — fully typed per layout. */
export type SlideSpec = { [K in LayoutName]: { layout: K } & PropsOf<Layouts[K]> & SlideCommon }[LayoutName];
