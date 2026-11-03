# Motion — transitions and animations

pptxgenjs writes neither; `src/render/motion*.ts` injects OOXML (`<p:transition>`, `<p:timing>`) after rendering. QA validates the XML; screenshots can't show motion.

## Profiles (`defineDeck({ motion })`, per slide `motion`)

| Profile            | Transition                      | Builds                                                         | Use                             |
| ------------------ | ------------------------------- | -------------------------------------------------------------- | ------------------------------- |
| `none`             | cut                             | none                                                           | read-ahead, emailed, printed    |
| `subtle` (default) | theme (fade ~0.5 s)             | **none** — content arrives with the slide, no flicker on enter | board, QBR, most corporate      |
| `build`            | fade 0.35 s                     | step 1 with the slide, then **one click per step**             | presenter argues point by point |
| `keynote`          | **Morph** 0.8 s (fade fallback) | auto rise (fade + 4% drift), 0.52 s, 0.17 s stagger            | launches, all-hands, pitches    |

- Morph pairs objects named `!!title`, `!!eyebrow`, `!!title-mark`… across consecutive slides, so titles glide instead of cutting. PowerPoint 2019+/365; older versions fall back to fade (`mc:AlternateContent`).
- Effects are chosen by layouts per element role: text `fade`/`rise`, charts and Gantt bars `wipe`, dots `zoom`. Order = reading order; equal order = together.
- Video/audio with `autoplay` gets a media `playFrom(0)` call when the slide starts.
- `animate: false` on a slide or deck removes builds but keeps transitions.

## Rules

- **Why the default has no builds:** a transition followed by automatic entrance fades shows the text, hides it, then fades it back — it reads as flicker/"loading" on enter. Need reveal control? `build` (presenter clicks).

- One transition type per deck (QA warns at > 2). ≤ 8 build steps per slide.
- Never bounce, spin, fly-in, typewriter, or > 1 s effects. None of those exist here on purpose.
