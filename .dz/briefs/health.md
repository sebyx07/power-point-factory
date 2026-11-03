# Brief: is the project healthy?

Daily checkup, fired by `schedules: health` in `.dz/maintainer/maintainer.yml`. PowerPoint Factory is maintained so that nobody has to watch it. This covers the failures no issue or PR announces.

| Signal | Command | Healthy |
|---|---|---|
| `main` is green | `gh run list --workflow ci.yml --branch main --event push --limit 1 --json conclusion,headSha` | `success` |
| the showcase is current | on a fresh checkout: `bin/check && git status --porcelain out/` | empty — builds are byte-reproducible, so any diff means the committed showcase is stale |
| the showcase still opens | `pdfinfo out/halden/q4-business-review/2026-11-03/board-update/board-update.pdf` | `Pages: 20` (or the deck's current slide count) |
| Dependabot is not stuck | `gh pr list --app dependabot --json number,createdAt` | none older than 7 days |
| Kubeez API still matches the client | `curl -s https://api.kubeez.com/openapi.json \| jq '.paths \| keys'` | contains `/v1/generate/media`, `/v1/generate/media/{id}`, `/v1/generate/music`, `/v1/generate/remove-background`, `/v1/upload/media`, `/v1/models`, `/v1/balance` |
| docs links resolve | every relative `](…)` link in `README.md`, `CLAUDE.md`, `llms.txt`, `docs/**`, `.claude/**` points to a file that exists | no dead links |

For each unhealthy signal, file one issue unless an open issue already names it. The title names the signal (`main is red at <sha>`, `showcase out of date`, `Kubeez dropped /v1/…`), and the body carries the command, its output and the run URL. A red `main` comes first. Never regenerate Kubeez media or spend credits from here.
