# project-graph

Download counts for my projects in one static site. A GitHub Actions workflow fetches the numbers every 3 hours, appends them to `data/history/`, and deploys the SvelteKit site to GitHub Pages.

## Sources

| Source | Value | History |
| --- | --- | --- |
| GitHub Releases | sum of `download_count` over all assets | recorded from the first run |
| Modrinth | project `downloads` | recorded from the first run |
| CurseForge | mod `downloadCount` | recorded from the first run |

None of these APIs returns past values, so history starts on the day the first snapshot is taken.

## Adding a project

Add an entry to `projects.yml` (`github` is `owner/repo`; `modrinth` is a slug, `curseforge` is the numeric project ID).

## Development

```bash
bun install
bun run fetch    # appends a snapshot to data/history/*.json (needs CURSEFORGE_API_KEY in .env if a project uses CurseForge; the key contains `$`, which Bun expands unless each one is written as `\$`)
bun run dev
```

`GITHUB_TOKEN` is optional locally; without it the GitHub API allows 60 requests per hour.

## Deployment

- Repository secret `CURSEFORGE_API_KEY` is required.
- Pages source must be set to "GitHub Actions".
- The workflow stops without committing or deploying if any source fails to fetch, so a partial snapshot is never recorded.
