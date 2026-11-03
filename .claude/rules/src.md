---
paths: ["src/**", "scripts/**", "test/**"]
---

# Engine code

- One job per file, ≤ 300 lines (guard). Pure functions in `src/core`, `src/text`, `src/qa/checks` — test them.
- Layouts return `El[]` from props + `LayoutCtx`; no I/O, no randomness. Assets resolve later (`src/assets/resolve.ts`).
- Throw `DeckError` subclasses with a `hint` that tells the agent the fix.
- A new QA rule = a pure check in `src/qa/checks/`, wired in `checks/index.ts`, with a test that flags bad and passes good.
- Changing a layout? Run `bin/deck qa all` and look at the contact sheets; `bin/deck approve` only for intended visual changes.
