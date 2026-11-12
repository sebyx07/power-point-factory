import { cobalt } from "./themes/cobalt";
import { graphite } from "./themes/graphite";
import { ledger } from "./themes/ledger";
import { terracotta } from "./themes/terracotta";
import type { Theme, ThemeOverrides } from "./types";

export const themes = { cobalt, graphite, ledger, terracotta } as const;
export type ThemeName = keyof typeof themes;
export type { Theme, ThemeOverrides } from "./types";

/** Company brands extend a base theme: `extendTheme("cobalt", { colors: { accent: "#0B7A75" } })` */
export function extendTheme(base: ThemeName | Theme, o: ThemeOverrides): Theme {
  const b = typeof base === "string" ? themes[base] : base;
  return {
    ...b,
    ...o,
    name: o.name ?? `${b.name}+brand`,
    colors: { ...b.colors, ...o.colors },
    fonts: { ...b.fonts, ...o.fonts },
    type: { ...b.type, ...o.type },
    space: { ...b.space, ...o.space },
    motion: { ...b.motion, ...o.motion } as Theme["motion"],
  };
}
