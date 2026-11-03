import type { LayoutCtx } from "@/core/deck";
import { preloadFonts } from "@/text/fonts";
import { themes } from "@/theme";

export async function ctx(theme: keyof typeof themes = "cobalt"): Promise<LayoutCtx> {
  const t = themes[theme];
  await preloadFonts([t.fonts.display, t.fonts.body]);
  return { theme: t, deck: { title: "Test deck", company: "Testco" }, n: 2, total: 10, dir: "/tmp" };
}
