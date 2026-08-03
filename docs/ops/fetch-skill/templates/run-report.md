# fetch-skill run report

- **run_label:** {{run_label}}
- **root:** {{root}}
- **since:** {{since}}
- **generated:** (fill by agent; no wall clock in workflow host)

## Counts

| metric | n |
|--------|---|
| discovered | |
| shortlisted | |
| ready_for_review | |
| filtered_out | |
| deferred | |

## Ready for review

| id | title | url | fit | quality | license | layer | notes |
|----|-------|-----|-----|---------|---------|-------|-------|
| | | | | | | | |

## Filtered out (sample)

| id | reason | url |
|----|--------|-----|
| | | |

## Source health

| channel | ok | notes |
|---------|----|-------|
| github | | |
| x | | |
| reddit | | |
| xhs | | |

## Recommended human actions

1. Approve / decline each ready row; update `blocklist.json` / `watchlist.json`.
2. For approved: adapt into `skills/community/{scenarios|references}/<slug>/` with provenance.
3. Run `pnpm catalog:build` (or `catalog:sync-web`) before expecting Web/CLI install truth.
4. Do **not** promote to `official/` via this workflow.

## Non-goals this run

- No hosted analysis / LLM run in Openwisdom product surfaces.
- No heat numbers written into SKILL.md.
- No auto-merge to master.
