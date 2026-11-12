import type { MediaEl, MusicGenerateSpec } from "@/core/types";

/**
 * Add a music bed to any slide (keynote openers / sizzle reels only — never in a board deck):
 *   export default slide({ layout: "cover", …, extra: [soundtrack({ prompt: "…" })] })
 * The small speaker icon sits bottom-right; playback starts with the slide.
 */
export function soundtrack(m: MusicGenerateSpec | { file: string }, autoplay = true): MediaEl {
  return {
    kind: "media",
    id: "soundtrack",
    box: { x: 12.6, y: 6.85, w: 0.35, h: 0.35 },
    role: "media",
    media: "audio",
    src: "file" in m ? { file: m.file } : { generateMusic: m },
    autoplay,
    alt: "Soundtrack",
  };
}
