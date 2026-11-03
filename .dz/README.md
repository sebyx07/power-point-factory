# `.dz/`

Repo-scoped configuration for the [developerz.ai](https://developerz.ai) maintainer agent, which runs this repository as an AI-managed project.

| Path | What |
|---|---|
| `maintainer/maintainer.yml` | the policy: triage, PRs, review, releases, schedules. [Reference](https://developerz.ai/docs/maintainer-yml) |
| `pipeline/agent-pipeline.json` | the agent pipeline definition |
| `briefs/` | what each `schedules:` checkup works from, read at `main`'s HEAD: `health.md` (daily), `improve.md` (monthly) |

Template repo: nothing is published, so there is no `release-due` brief. Agent instructions for working on the code: [`CLAUDE.md`](../CLAUDE.md) (`AGENTS.md` is a symlink to it).
