# QA — what the machine checks

`bin/deck loop|qa` → `out/<deck>/qa.md` + `qa.json`. ✖ error fails the build · ▲ warn · · info. Each finding has `→ fix`.

| Stage    | Rule                                                                                                                                                         | Checks                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| static   | `bounds` · `safe-margin` · `overlap`                                                                                                                         | inside the slide; text within margins; no text/chart/table collisions                                        |
| static   | `text-overflow` · `min-size` · `title-lines` · `font`                                                                                                        | measured with metric-twin fonts after auto-fit; readable floors per role; ≤ 2-line titles; Office-safe faces |
| static   | `contrast`                                                                                                                                                   | WCAG AA against the real backdrop (blends translucent scrims; images = worst case)                           |
| static   | `placeholder-text` · `slop` · `emoji` · `bullet-count` · `bullet-length` · `word-count` · `notes`                                                            | copy discipline                                                                                              |
| static   | `action-title` · `layout-variety` · `source-line` · `pie-slices` · `pie-negative` · `series-count` · `axis-zero` · `build-steps` · `transitions` · `closing` | story + chart discipline                                                                                     |
| static   | `image-placeholder` · `media-placeholder` · `image-resolution` · `alt-text` · `link`                                                                         | assets and links                                                                                             |
| pptx     | `pptx-slides` · `pptx-xml` · `motion`                                                                                                                        | slide count, every XML part well-formed, motion parts present                                                |
| render   | `render-count` · `blank` · `edge-ink`                                                                                                                        | LibreOffice → PDF → PNG; blank slides; ink touching the edge (overflow)                                      |
| baseline | `baseline`                                                                                                                                                   | pixel diff vs `.baseline/` (`bin/deck approve`)                                                              |

**Artifacts for the reviewer:** `contact-sheet.png` (all slides), `slides/slide-NN.png`, `outline.md` (all copy, titles test), `scene.json` (positioned elements, for debugging layouts).

Adding a rule: pure function in `src/qa/checks/`, wire into `checks/index.ts`, test in `test/`.
