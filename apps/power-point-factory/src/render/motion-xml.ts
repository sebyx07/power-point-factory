import type { EntranceEffect, Transition } from "@/core/types";

/** Pure OOXML builders for transitions + entrance animations (pptxgenjs has neither). */

const NS = {
  mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
  p14: "http://schemas.microsoft.com/office/powerpoint/2010/main",
  p159: "http://schemas.microsoft.com/office/powerpoint/2015/09/main",
};
export const ROOT_NS = `xmlns:mc="${NS.mc}" xmlns:p14="${NS.p14}" mc:Ignorable="p14"`;

const speed = (ms: number) => (ms < 450 ? "fast" : ms < 800 ? "med" : "slow");

export function transitionXml(t: Transition): string {
  if (t.type === "none") return "";
  const ms = t.duration ?? 500;
  const body = { fade: "<p:fade/>", push: '<p:push dir="u"/>', wipe: '<p:wipe dir="r"/>', morph: "<p:fade/>" }[t.type];
  const plain = `<p:transition spd="${speed(ms)}">${body}</p:transition>`;
  const fancy =
    t.type === "morph"
      ? `<p:transition spd="${speed(ms)}" p14:dur="${ms}"><p159:morph xmlns:p159="${NS.p159}" option="byObject"/></p:transition>`
      : `<p:transition spd="${speed(ms)}" p14:dur="${ms}">${body}</p:transition>`;
  const requires = t.type === "morph" ? "p159" : "p14";
  const decl = t.type === "morph" ? ` xmlns:p159="${NS.p159}"` : "";
  return `<mc:AlternateContent><mc:Choice Requires="${requires}"${decl}>${fancy}</mc:Choice><mc:Fallback>${plain}</mc:Fallback></mc:AlternateContent>`;
}

export interface Step {
  /** shape ids (cNvPr id) that enter together */
  spids: number[];
  effect: EntranceEffect;
  /** subset of spids that are p:sp (text/shapes) — only those get a bldP entry */
  bld: number[];
}

/** preset ids PowerPoint shows in the Animation Pane */
const PRESET: Record<EntranceEffect, { id: number; sub: number }> = {
  fade: { id: 10, sub: 0 },
  rise: { id: 42, sub: 0 },
  wipe: { id: 22, sub: 8 },
  zoom: { id: 53, sub: 16 },
};

class Ids {
  n = 2;
  next() {
    return ++this.n;
  }
}

const visible = (ids: Ids, spid: number) =>
  `<p:set><p:cBhvr><p:cTn id="${ids.next()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;

const filter = (ids: Ids, spid: number, f: string, dur: number) =>
  `<p:animEffect transition="in" filter="${f}"><p:cBhvr><p:cTn id="${ids.next()}" dur="${dur}"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:animEffect>`;

const tween = (ids: Ids, spid: number, attr: string, from: string, to: string, dur: number) =>
  `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${ids.next()}" dur="${dur}" fill="hold"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>${attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:strVal val="${from}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="${to}"/></p:val></p:tav></p:tavLst></p:anim>`;

function behaviours(ids: Ids, spid: number, effect: EntranceEffect, dur: number): string {
  switch (effect) {
    case "fade":
      return visible(ids, spid) + filter(ids, spid, "fade", dur);
    case "rise":
      return visible(ids, spid) + filter(ids, spid, "fade", dur) + tween(ids, spid, "ppt_y", "#ppt_y+.04", "#ppt_y", dur);
    case "wipe":
      return visible(ids, spid) + filter(ids, spid, "wipe(left)", dur + 150);
    case "zoom":
      return (
        visible(ids, spid) +
        filter(ids, spid, "fade", dur) +
        tween(ids, spid, "ppt_w", "#ppt_w*.6", "#ppt_w", dur) +
        tween(ids, spid, "ppt_h", "#ppt_h*.6", "#ppt_h", dur)
      );
  }
}

const effectPar = (ids: Ids, spid: number, s: Step, dur: number, node: string) => {
  const preset = PRESET[s.effect];
  const id = ids.next();
  return `<p:par><p:cTn id="${id}" presetID="${preset.id}" presetClass="entr" presetSubtype="${preset.sub}" fill="hold" grpId="0" nodeType="${node}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${behaviours(ids, spid, s.effect, dur)}</p:childTnLst></p:cTn></p:par>`;
};

/** one click-group: steps chained after each other, `stagger` ms apart */
function group(ids: Ids, steps: Step[], first: "auto" | "click", dur: number, stagger: number): string {
  const groupId = ids.next();
  let inner = "";
  steps.forEach((s, i) => {
    const node = i === 0 ? (first === "click" ? "clickEffect" : "afterEffect") : "withEffect";
    const pid = ids.next();
    const effects = s.spids.map((spid, j) => effectPar(ids, spid, s, dur, j === 0 ? node : "withEffect")).join("");
    inner += `<p:par><p:cTn id="${pid}" fill="hold"><p:stCondLst><p:cond delay="${i * stagger}"/></p:stCondLst><p:childTnLst>${effects}</p:childTnLst></p:cTn></p:par>`;
  });
  const start = first === "auto" ? `<p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>` : `<p:cond delay="indefinite"/>`;
  return `<p:par><p:cTn id="${groupId}" fill="hold"><p:stCondLst>${start}</p:stCondLst><p:childTnLst>${inner}</p:childTnLst></p:cTn></p:par>`;
}

export interface BuildTiming {
  trigger: "auto" | "click";
  dur: number;
  stagger: number;
}

/**
 * auto  — everything plays after the slide appears, steps `stagger` ms apart. No clicking.
 * click — step 1 plays with the slide (context), each later step waits for a click (presenter build).
 * Never bounce/spin/fly; effects are fade, rise (fade + 4% drift), wipe (charts/bars), zoom (dots).
 */
export interface Play {
  spid: number;
  kind: "video" | "audio";
}

/** autoplay a media shape when the slide begins */
function playGroup(ids: Ids, plays: Play[]): string {
  const gid = ids.next();
  const pid = ids.next();
  const cmds = plays
    .map((p) => {
      const id = ids.next();
      return `<p:par><p:cTn id="${id}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="${ids.next()}" dur="1" fill="hold"/><p:tgtEl><p:spTgt spid="${p.spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>`;
    })
    .join("");
  return `<p:par><p:cTn id="${gid}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="${pid}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${cmds}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
}

/** media nodes PowerPoint expects alongside the main sequence */
const mediaNodes = (ids: Ids, plays: Play[]) =>
  plays
    .map(
      (p) =>
        `<p:${p.kind}><p:cMediaNode vol="80000"><p:cTn id="${ids.next()}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${p.spid}"/></p:tgtEl></p:cMediaNode></p:${p.kind}>`,
    )
    .join("");

export function timingXml(steps: Step[], b: BuildTiming = { trigger: "auto", dur: 360, stagger: 110 }, plays: Play[] = []): string {
  if (steps.length === 0 && plays.length === 0) return "";
  const ids = new Ids();
  const [first, ...rest] = steps;
  const play = plays.length ? playGroup(ids, plays) : ""; // allocate ids in document order
  const builds =
    steps.length === 0
      ? ""
      : b.trigger === "auto" || !first
        ? group(ids, steps, "auto", b.dur, b.stagger)
        : group(ids, [first], "auto", b.dur, 0) + rest.map((s) => group(ids, [s], "click", b.dur, 0)).join("");
  const groups = play + builds;
  const all = steps.flatMap((s) => s.bld);
  const bld = all.length === 0 ? "" : `<p:bldLst>${all.map((id) => `<p:bldP spid="${id}" grpId="0" animBg="1"/>`).join("")}</p:bldLst>`;
  return (
    `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
    `<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${groups}</p:childTnLst></p:cTn>` +
    `<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>` +
    `${mediaNodes(ids, plays)}</p:childTnLst></p:cTn></p:par></p:tnLst>${bld}</p:timing>`
  );
}
