import { defineLayout } from "@/core/deck";
import { table as tableEl, text } from "@/core/el";
import { DeckSpecError } from "@/core/errors";
import type { Cell, El, Rag } from "@/core/types";
import { contentBox, enter, footer, type Heading, titleBlock } from "./parts";

export interface Action {
  action: string;
  owner: string;
  due: string;
  status?: Rag;
  /** true = needs a decision from this room */
  decision?: boolean;
}
export interface NextStepsProps extends Heading {
  actions: Action[];
  /** the single ask, above the table */
  ask?: string;
}

/** The real closing slide: action · owner · date · status. Replaces "Thank you! Questions?". */
export const nextSteps = defineLayout<NextStepsProps>({
  name: "nextSteps",
  render: (p, ctx) => {
    if (p.actions.length < 1 || p.actions.length > 8) throw new DeckSpecError(`nextSteps: ${p.actions.length} actions`, "1–8 actions");
    const missing = p.actions.find((a) => !a.owner.trim() || !a.due.trim());
    if (missing) throw new DeckSpecError(`nextSteps: "${missing.action}" has no owner or date`, "every action needs an owner and a date");
    const t = ctx.theme;
    const { els, contentTop } = titleBlock(ctx, p);
    const area = contentBox(ctx, contentTop);
    const out: El[] = [...els];
    let y = area.y;
    if (p.ask) {
      out.push(enter(t, text(t, "ask", { x: area.x, y, w: area.w, h: 0.5 }, p.ask, { bold: true, color: t.colors.accent, size: t.type.subtitle + 1 }), 1));
      y += 0.75;
    }
    const withStatus = p.actions.some((a) => a.status);
    const header = ["Action", "Owner", "Due", ...(withStatus ? ["Status"] : [])];
    const rows: Cell[][] = p.actions.map((a) => [
      a.decision ? `Decision: ${a.action}` : a.action,
      a.owner,
      a.due,
      ...(withStatus ? [a.status ? { rag: a.status } : "—"] : []),
    ]);
    const el = tableEl(
      t,
      "actions",
      { x: area.x, y, w: area.w, h: 0 },
      { header, rows, widths: withStatus ? [3.2, 1.3, 0.9, 1.1] : [3.4, 1.4, 1], align: ["left", "left", "left", "left"] },
      t.type.small,
    );
    out.push(enter(t, { ...el, box: { ...el.box, h: (rows.length + 1) * el.rowH } }, 2, "fade"));
    return [...out, ...footer(ctx)];
  },
});
