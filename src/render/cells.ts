import type PptxGenJS from "pptxgenjs";
import { bare } from "@/core/color";
import type { Cell, Hex, Rag } from "@/core/types";
import type { Theme } from "@/theme/types";

export const HARVEY = ["○", "◔", "◑", "◕", "●"] as const;
const RAG_LABEL: Record<Rag, string> = { green: "On track", amber: "At risk", red: "Off track" };

export const ragColor = (t: Theme, r: Rag): Hex => ({ green: t.colors.positive, amber: "#C98A00" as Hex, red: t.colors.negative })[r];

export function cellText(c: Cell): string {
  if (typeof c === "number") return c.toLocaleString("en-US");
  if (typeof c === "string") return c;
  if ("rag" in c) return `● ${c.label ?? RAG_LABEL[c.rag]}`;
  return HARVEY[c.harvey];
}

/** Cell → runs: RAG gets a colored dot + text label (never color alone, WCAG 1.4.1). */
export function cellRuns(c: Cell, t: Theme): string | PptxGenJS.TextProps[] {
  if (typeof c === "object" && "rag" in c) {
    return [
      { text: "● ", options: { color: bare(ragColor(t, c.rag)) } },
      { text: c.label ?? RAG_LABEL[c.rag], options: {} },
    ];
  }
  if (typeof c === "object" && "harvey" in c) return [{ text: HARVEY[c.harvey], options: { color: bare(t.colors.accent), fontSize: 16 } }];
  return cellText(c);
}
