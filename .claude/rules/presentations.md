---

## paths: ["presentations/**"]

# Writing presentations

- Read the company `BRAND.md` before the first slide; use its voice, colors and approved facts only.
- Slide files contain props, never coordinates. `export default slide({ layout: "…", … })` or `use(myLayout, {…})`.
- One message per slide; the title states it as a sentence with a number where possible.
- `notes` on every content slide: what the presenter says, plus any `TBD` facts.
- Images: describe them like a photographer (`docs/image-prompts.md`). Commit `assets/generated/*` after generation.
- Reordering slides? Re-check `#slide:N` links and summary references ("slide 18").
