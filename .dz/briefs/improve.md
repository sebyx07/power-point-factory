# Brief: monthly improvement

Fired every Monday by `schedules: improve` in `.dz/maintainer/maintainer.yml`. **Act only on the first Monday of the month (UTC day 1-7); on any other Monday stop here and do nothing.**

PowerPoint Factory is maintained by agents only. Once a month, leave it measurably better for the people who clone it to build corporate presentations. Read `CLAUDE.md` first: its rules (recipes are data, tokens only, Office-safe fonts, never billed twice, QA is never loosened) bind every change.

## 1. Review the showcase with fresh eyes

Run `bin/deck qa all`, then dispatch the `deck-reviewer` agent (`.claude/agents/deck-reviewer.md`) on the Halden deck. Engine/layout findings (spacing, typography, label placement, chart readability) are this month's best candidates: they improve every user's deck.

## 2. Pick at most three improvements, in this order

1. A red or flaky `main`, or a health-brief signal nobody fixed.
2. Engine findings from step 1 that affect every deck.
3. PowerPoint fidelity: anything LibreOffice renders differently from PowerPoint that QA could catch (new check in `src/qa/checks/` with a test).
4. A missing high-value layout from `docs/deck-craft.md` § archetypes (funnel, risk heat map, pricing tiers, org chart): `add-layout` skill.
5. Dependency majors Dependabot can't do (pptxgenjs, sharp, biome, typescript).
6. Docs drift: every command, prop and path in `README.md`, `CLAUDE.md`, `llms.txt`, `docs/**` still matches the code.

## 3. Ship

One pull request per improvement, small and reviewable, titled with what it changes. Visual changes carry before/after slide PNGs and the rebuilt showcase in the same PR. User-visible changes get a CHANGELOG `## [Unreleased]` entry. A breaking change to the DSL (renamed prop, removed layout) escalates to the owner instead of merging.

If nothing is worth changing this month, do nothing: no empty PRs, no churn.
