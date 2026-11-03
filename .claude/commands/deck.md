---
description: Brief → shipped presentation. Outline, recipe, QA loop, screenshot review, fresh-eyes reviewer, export.
argument-hint: <company> <what the deck is for, audience, key facts or source files>
---

# /deck

Request: $ARGUMENTS

1. **Locate or create.** `bin/deck list`. New → `bin/deck new <company> <project> <deck> --theme …`. New company → run the `onboard-company` skill first.
2. **Read** `presentations/<company>/BRAND.md`, `docs/deck-craft.md` (structure + copy rules), `docs/layouts.md`.
3. **Ghost deck.** Write the action titles as a numbered list in your reply first. They alone must tell the story (SCR → answer first).
4. **Recipe.** One `slides/NN-name.ts` per slide. Pick layouts by message. Notes on every content slide. Facts you lack → `TBD` in notes.
5. **Loop.** `bin/deck loop <deck>` → fix every ✖ in one batch → repeat until PASS. Read `<deck>-contact-sheet.png` and any suspicious `slides/<deck>-NN.png`.
6. **Fresh eyes.** Dispatch the `deck-reviewer` agent with the deck path and the brief. Apply its findings in one batch, re-loop. Max 3 rounds; stop when a round resolves nothing.
7. **Ship.** `bin/deck export <deck>`. Reply: export paths, slide count, QA counts, reviewer verdict, open TBDs.
