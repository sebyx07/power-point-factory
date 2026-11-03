# .claude/

What Claude Code loads when it works here. The gate is `bin/check`, not hooks.

| Path                | Standing cost | Loaded when                                                                             |
| ------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `../.mcp.json`      | none          | `kubeez` MCP (OAuth) for interactive media browsing; scripts use the REST key in `.env` |
| `rules/<area>.md`   | none          | a file matching its `paths:` is touched                                                 |
| `agents/*.md`       | one line each | dispatched                                                                              |
| `commands/*.md`     | none          | `/<name>` typed                                                                         |
| `skills/*/SKILL.md` | one line each | trigger matches                                                                         |

## Roster

| Name              | Kind    | Job                                               |
| ----------------- | ------- | ------------------------------------------------- |
| `/deck`           | command | brief → shipped deck, end to end                  |
| `/review-deck`    | command | fresh-eyes review of an existing deck             |
| `deck-reviewer`   | agent   | read-only design + story verdict from screenshots |
| `brand-reviewer`  | agent   | read-only check against the company's `BRAND.md`  |
| `onboard-company` | skill   | new client → `BRAND.md`, logos, `brand.ts`        |
| `add-layout`      | skill   | new reusable layout, with fixture + docs          |
| `kubeez-media`    | skill   | images / video / music that don't look AI-made    |

## Where a rule goes

| Kind                    | Home                                  |
| ----------------------- | ------------------------------------- |
| Repo-wide rule, command | `CLAUDE.md`                           |
| Rule for one area       | `rules/<area>.md` with `paths:`       |
| How-to with steps       | `skills/<name>/SKILL.md` (< 80 lines) |
| A role                  | `agents/<name>.md` (< 60 lines)       |
| Long-form craft         | `docs/**`, linked                     |
