import type { Layout, LayoutCtx } from "@/core/deck";
import { DeckSpecError } from "@/core/errors";
import { SLIDE } from "@/core/geometry";
import { motionSpec } from "@/core/motion";
import type { Scene, SceneSlide } from "@/core/types";
import { type DeckSpec, resolveTheme } from "@/deck";
import { type LayoutName, layouts, type SlideSpec } from "@/layouts";
import { preloadFonts } from "@/text/fonts";

/** DeckSpec → Scene. Pure apart from font loading; QA and render both consume the result. */
export async function layoutDeck(spec: DeckSpec, dir: string): Promise<Scene> {
  const theme = resolveTheme(spec.theme);
  await preloadFonts([theme.fonts.display, theme.fonts.body]);
  const total = spec.slides.length;
  const slides: SceneSlide[] = spec.slides.map((s: SlideSpec, i) => {
    const ref = s.layout as unknown;
    const layout = (typeof ref === "string" ? layouts[ref as LayoutName] : ref) as Layout<SlideSpec> | undefined;
    if (!layout?.render)
      throw new DeckSpecError(`slide ${i + 1}: unknown layout "${String(ref)}"`, `use one of: ${Object.keys(layouts).join(", ")} — or use(myLayout, props)`);
    const ctx: LayoutCtx = { theme, deck: spec, n: i + 1, total, dir };
    const motion = motionSpec(s.motion ?? spec.motion ?? "subtle", theme.motion.transition);
    const animate = (s.animate ?? spec.animate ?? true) && motion.build !== null;
    const elements = layout
      .render(s, ctx)
      .concat(s.extra ?? [])
      .map((e) =>
        !e.anim ? e : animate ? { ...e, anim: { ...e.anim, effect: motion.effect(e.anim.effect) } } : (({ anim: _a, ...rest }) => rest as typeof e)(e),
      );
    const seen = new Set<string>();
    for (const e of elements) {
      if (seen.has(e.id)) throw new DeckSpecError(`slide ${i + 1} (${s.layout}): duplicate element id "${e.id}"`);
      seen.add(e.id);
    }
    return {
      index: i + 1,
      layout: layout.name,
      background: layout.background?.(ctx, s) ?? theme.colors.bg,
      elements,
      ...(s.notes ? { notes: s.notes } : {}),
      transition: i === 0 ? { type: "none" } : (s.transition ?? spec.transition ?? motion.transition),
      build: animate ? motion.build : null,
      morph: motion.morph,
    };
  });
  return { title: spec.title, size: { w: SLIDE.w, h: SLIDE.h }, slides };
}
