# Deck craft — how professional corporate presentations are built (2024–2026)

Sources: Minto pyramid / consulting practice, Duarte (Glance Test), Storytelling with Data, Datawrapper, WCAG 2.2, government design systems. Thresholds marked _(conv.)_ are practitioner convention. QA enforces what it can (`docs/qa.md`).

## Story

- **Answer first.** Slide 2 (or 3 after the agenda) is the executive summary: the conclusion plus 3–5 supporting claims → `summary` layout.
- **SCR opening:** Situation → Complication → Resolution. Then the pyramid: each section proves one summary row.
- **Action titles:** a full sentence with the takeaway, ≤ 15 words, ≤ 2 lines. **Titles test:** read only the titles (`out/…/outline.md`) — they must tell the whole argument.
- **Ghost deck first:** write all titles + exhibit type before any slide.
- **One message per slide**, clear in 3 seconds (Glance Test).
- **Main body ≤ 15 slides** _(conv.)_; detail goes to an appendix after a `section` divider; cite as "see slide 18".
- **End on decisions:** `nextSteps` (action · owner · date · status), not "Thank you! Questions?".

| Title   | Bad (topic)       | Good (action)                                                       |
| ------- | ----------------- | ------------------------------------------------------------------- |
| Revenue | "Q3 Revenue"      | "Q3 revenue grew 12%, driven by enterprise upsell in EMEA"          |
| Churn   | "Churn Analysis"  | "Churn is concentrated in SMB accounts in their first 90 days"      |
| Market  | "Market Overview" | "Mid-market is $4.2B, growing 18%/yr, and no competitor holds >10%" |

## Deck archetypes → layout sequence

| Deck              | Sequence                                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Board update      | cover → summary → stats (KPIs vs plan) → waterfall (P&L bridge) → table (RAG priorities) → chart → matrix/risks → nextSteps → references                                          |
| QBR               | cover → summary → table (last-quarter commitments, RAG) → stats → chart (pipeline) → twoColumn (wins/lessons) → roadmap (next quarter) → nextSteps                                |
| Investor pitch    | cover → bullets (problem) → bigNumber (why now) → cards (solution) → stats (traction) → chart → matrix (competition) → roadmap → twoColumn (team) → bigNumber (the ask)           |
| Strategy proposal | cover → summary (SCR) → chart (situation) → waterfall (complication sized) → table (options, harvey balls) → matrix (evaluation) → bullets (recommendation) → roadmap → nextSteps |
| Project status    | cover → summary (overall RAG) → timeline/roadmap → table (workstream RAG) → chart (budget burn vs plan) → table (risks) → nextSteps                                               |
| Keynote / launch  | cover (image) → bigNumber → imageFull → video → quote → cards → closing — `motion: "keynote"`                                                                                     |

## Pick the exhibit from the message

| Message               | Use                                                               | Avoid                                |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| Ranking               | `bar` sorted desc, `highlight` the one that matters               | 3D, radar                            |
| Few periods           | `column` (≤ 3 series)                                             | > 3 clustered series                 |
| Trend                 | `line` (≥ 5 points, `min/max` to show the move)                   | overlapping areas                    |
| Composition           | `stackedColumn`; `doughnut` only ≤ 5 parts summing to 100%        | pies over time, pies with negatives  |
| Change decomposition  | `waterfall`                                                       | stacked bars                         |
| Options / vendors     | `table` with `{ harvey: 0–4 }` cells                              | prose                                |
| Status                | `table` with `{ rag }` cells (dot + label, never color alone)     | color-only cells                     |
| Prioritize / position | `matrix` (2×2, name the target quadrant)                          | four bullet lists                    |
| Sequence              | `process` (3–6 verb-led steps)                                    | numbered bullets                     |
| Plan over time        | `roadmap` (Gantt, ≤ 8 rows, today line) · `timeline` (milestones) | tables of dates                      |
| One striking figure   | `bigNumber` (≤ 2 per deck)                                        | four-tile stats with one real number |

## Chart rules

- Grey everything, accent the series/bar that carries the message (`highlight`, theme `chart[0]`).
- Direct labels over legends; legend only for ≥ 2 series. Light gridlines or none. No borders, shadows, 3D.
- Bar/column axes start at 0 (QA ✖). Line charts may zoom — say so in the title or notes.
- Units once (subtitle / header / `format`), consistent decimals, signed deltas (`+3.1 pts`, `−8%`).
- Every data slide: `source:` line, 9–10 pt.

## Table rules

- Text left, numbers right (auto), glyphs centered (auto). Units in the header: `Revenue ($M)`.
- Rules, not zebra: heavy rule under the header, hairlines between rows, rule above totals (`total: true`).
- Highlight ≤ 1 row (`highlight`). ≤ 8 rows × 6 columns on a main slide; more → appendix.

## Type, layout, color (built into the themes)

- 16:9, 13.333 × 7.5 in, 0.7 in side margins, fixed title position on every slide (`titleBlock`).
- Title 30–32 pt · body 18–19 · small 14–15 · caption/source 11 · KPI 54–58 · hero 46–50.
- One accent, used with intent. Semantic green/amber/red only for status and deltas. WCAG AA everywhere (tested).
- ≤ 6 bullets, ≤ 70 words per slide _(conv.)_. Detail lives in speaker notes.
- Office-safe fonts only — decks are opened on other people's laptops.

## Motion

- Corporate default `subtle`: fade transitions ≤ 0.5 s, quiet auto fades ≤ 0.4 s, 0.1 s stagger.
- `build` when the presenter argues step by step (click reveals). `keynote` for launches (Morph). `none` for read-ahead/emailed decks.
- Never: bounce, spin, fly-in, letter-by-letter, > 1 s effects, a different transition per slide.

## Anti-AI-slop

| Tell                                                                                                  | Do instead                                      |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Topic titles ("Overview", "Key Insights", "The Power of X")                                           | action titles with a number                     |
| "unlock / seamless / leverage our / game-changer / in today's fast-paced / elevate / delve / journey" | plain verbs, named things, numbers              |
| Three equal icon cards on every slide                                                                 | vary the exhibit; `cards` at most once or twice |
| Same bullet rhythm everywhere ("**Label:** eight words")                                              | uneven, content-driven bullets                  |
| Glowing brains, holograms, robot hands, purple gradients                                              | real-looking editorial photos, or nothing       |
| Emoji, icon soup                                                                                      | one meaningful icon or none                     |
| Unsourced round numbers, rainbow charts                                                               | sources, grey + one accent                      |
| "Thank you! Questions?"                                                                               | `nextSteps` with owners and dates               |
