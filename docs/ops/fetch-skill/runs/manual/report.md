# fetch-skill run report

- **run_label:** manual
- **root:** E:/学习软件/Openwisdom
- **since:** 2026-01-01
- **generated:** fetch-skill Report agent (manual run; no wall clock from host)

## Counts

| metric | n |
|--------|---|
| discovered | 17 |
| shortlisted | 9 |
| ready_for_review | 7 |
| filtered_out | 7 |
| deferred | 2 |

Notes: Normalize collapsed 18 raw scoop items → 17 unique (`github` + `x` Auto-Empirical merged). DeepDive covered 8 of 9 shortlisted; `llm-council` remains shortlisted (not scored this run). Deferred = HyperResearch (DeepDive) + Book Intelligence (no repo).

## Ready for review

Threshold used: fit ≥ 3 AND quality ≥ 3 AND license_clear ≥ 3. All rows: `proposed_scope=community`. **Do not** auto-write `skills/official`; catalog truth only via `skills/` + `catalog:build`.

| id | title | url | fit | quality | license_clear | maint | license | layer | notes |
|----|-------|-----|-----|---------|---------------|-------|---------|-------|-------|
| github.com/safety-quotient-lab/psychology-agent | Psychology Agent — psychology analysis skills + cognitive architecture | https://github.com/safety-quotient-lab/psychology-agent | 3 | 4 | 5 | 2 | Apache-2.0 | scenario | Extract only: **knock** (10-order knock-on decision analysis) + partial **retrospect**. Do not ingest whole monorepo (~55MB cogarch/ops). |
| github.com/GarethManning/education-agent-skills | Education Agent Skills — metacognition, historical thinking, critical thinking | https://github.com/GarethManning/education-agent-skills | 5 | 5 | 3 | 5 | CC-BY-SA-4.0 | scenario | Selective import: historical-thinking/*, remaining self-regulated-learning/*; **skip** study-strategy-selector (already curated). License claimed in README/footer; no root LICENSE (hygiene incomplete). Share-alike + attribution. |
| github.com/cookiy-ai/user-research-skill | User Research Skill — qualitative & quantitative research workflows | https://github.com/cookiy-ai/user-research-skill | 4 | 4 | 5 | 3 | MIT | scenario | Keep offline planner/synthesis refs; demote/strip Route C + Cookiy commercial API funnel. |
| github.com/romainsimon/skills-for-decision-making | skills-for-decision-making — MIT Algorithms for Decision Making as 8 agent skills | https://github.com/romainsimon/skills-for-decision-making | 5 | 5 | 5 | 4 | MIT | scenario | Eight skills + calculators/evals. Strong decision/critical-thinking complement. Symlink caveat for Node calculators on single-skill copy. |
| github.com/D4ilyHub/objective-analysis | Objective Analysis — evidence, cognitive bias & logical fallacies skill | https://github.com/D4ilyHub/objective-analysis | 3 | 4 | 5 | 4 | MIT | scenario | Excellent method workflow; Objectivist lens well-gated. Label ideology in adaptation; optional split catalogs → reference + opt-in scenario. Small/new (0 stars). |
| github.com/DishantPal/deep-research-skill | Deep Research Skill — 5-layer research + red-team (MIT) | https://github.com/DishantPal/deep-research-skill | 4 | 5 | 5 | 4 | MIT | scenario | Distinct from catalog daymade-deep-research. PESTEL/Porter/JTBD lean business/policy; good general research scenario. |
| github.com/altmbr/claude-research-skill | Multi-agent research skill for Claude Code (/research) | https://github.com/altmbr/claude-research-skill | 3 | 3 | 5 | 2 | MIT | scenario | Multi-workstream orchestration pattern. Missing YAML frontmatter (easy fix). Claude Code Task-specific; less portable. Overlaps DishantPal/daymade. |

### Human next actions per ready row

1. **psychology-agent** — Approve extract of `knock` (+ optional `retrospect`) only into `skills/community/scenarios/…` with Apache-2.0 provenance; decline whole-repo import; add monorepo remainder to blocklist or note “product harness, extract-only”.
2. **education-agent-skills** — Approve selective CC-BY-SA paths (historical-thinking, remaining SRL/metacognition); confirm share-alike obligation; add root LICENSE hygiene note; do not re-import study-strategy-selector.
3. **user-research-skill** — Approve offline qualitative planner + synthesize-report; strip or quarantine commercial Cookiy API routes before community tree.
4. **skills-for-decision-making** — Approve all eight MIT skills; document calculator install/symlink for consumers; high priority.
5. **objective-analysis** — Approve with ideology gate labeled in SKILL frontmatter/notes; consider reference layer for fallacy/bias catalogs.
6. **deep-research-skill (DishantPal)** — Approve as community scenario; provenance distinct from daymade-deep-research.
7. **claude-research-skill (altmbr)** — Optional approve as multi-agent orchestration pattern; fix frontmatter on import; lower priority vs DishantPal if capacity limited.

## Deferred

| id | reason | url |
|----|--------|-----|
| github.com/jordan-gibbs/hyperresearch | Installer-bound product harness; SKILL units not portable standalone packages; pip install writes into `.claude/skills`. README leaderboard claims are pilot/pending third-party validation—do not treat as verified. Revisit if portable skill-only extract appears. | https://github.com/jordan-gibbs/hyperresearch |
| reddit.com/r/claudexplorers/comments/1t8xy2q | watch_only: full skill body on Reddit; no public repo/SKILL.md path. Recheck if author publishes redistributable repo. | https://www.reddit.com/r/claudexplorers/comments/1t8xy2q/made_a_claude_skill_that_breaks_down_a_book_so/ |

## Still shortlisted (not DeepDive’d this run)

| id | title | url | action |
|----|-------|-----|--------|
| github.com/tenfoldmarc/llm-council-skill | LLM Council — multi-agent peer review / critical decision skill | https://github.com/tenfoldmarc/llm-council-skill | Run DeepDive (GitHub API + raw SKILL.md); score fit/quality/license_clear/maintainability |

## Filtered out

| id | reason | url |
|----|--------|-----|
| github.com/brycewang-stanford/Auto-Empirical-Research-Skills | duplicate_upstream: catalog/skills as aers-empirical-hub | https://github.com/brycewang-stanford/Auto-Empirical-Research-Skills |
| github.com/meleantonio/awesome-econ-ai-stuff | duplicate_upstream: multiple community skills already curated from this monorepo | https://github.com/meleantonio/awesome-econ-ai-stuff |
| github.com/K-Dense-AI/scientific-agent-skills | duplicate_upstream + weak residual fit (scientific-critical-thinking curated; remainder STEM-heavy) | https://github.com/K-Dense-AI/scientific-agent-skills |
| github.com/tjboudreaux/cc-thinking-skills | duplicate_upstream: five thinking-* community references already curated | https://github.com/tjboudreaux/cc-thinking-skills |
| github.com/KyleAMathews/field-lab | duplicate_upstream: already in catalog/skills as field-lab | https://github.com/KyleAMathews/field-lab |
| github.com/Imbad0202/academic-research-skills | license_not_redistributable_for_catalog: CC-BY-NC-4.0 | https://github.com/Imbad0202/academic-research-skills |
| github.com/serenakeyitan/open-exam-skills | domain_weak: exam-prep UX primary; not core social-science research workflow | https://github.com/serenakeyitan/open-exam-skills |

## Normalize notes

- 18 raw scoop → 17 unique after collapse (github+x Auto-Empirical merged).
- blocklist/watchlist empty this run.
- Catalog/skills already cover: Auto-Empirical (aers-empirical-hub), meleantonio pack (5+ skills), field-lab, cc-thinking-skills (5 refs), scientific-critical-thinking.
- Shortlist (9) all community-scope candidates.
- proposed_scope=community for all shortlisted / ready rows.

## DeepDive notes

- 8 shortlisted candidates via GitHub API + raw SKILL.md.
- Dedup: study-strategy-selector already in catalog from education-agent-skills; daymade-deep-research already curated (DishantPal is distinct).
- HyperResearch deferred: pip-installed skills, not portable SKILL units; benchmark claims self-qualify as pilot.

## Source health

| channel | ok | notes |
|---------|----|-------|
| github | yes | Primary discovery + DeepDive (API + raw SKILL.md) |
| x | yes | Surfaced decision-making, field-lab (dup), cc-thinking (dup), ARS (NC license), objective-analysis |
| reddit | yes | deep-research, hyperresearch, claude-research, llm-council, open-exam, book-intelligence |
| xhs | no | Empty this run — platform inaccessible |

## Recommended human actions

1. Approve / decline each ready row above; update `docs/ops/fetch-skill/blocklist.json` / `watchlist.json` for rejected or watch-only items (e.g. Book Intelligence, HyperResearch, Imbad0202 NC).
2. For approved: adapt into `skills/community/{scenarios|references}/<slug>/` with provenance and license headers — **never** auto-write `skills/official/`.
3. Run `pnpm catalog:build` (or `catalog:sync-web`) before expecting Web/CLI/MCP install truth.
4. DeepDive remaining shortlist: `tenfoldmarc/llm-council-skill`.
5. Prefer high-value imports first: skills-for-decision-making, education-agent-skills (selective), DishantPal deep-research, cookiy offline methods.
6. Do **not** promote to `official/` via this workflow.

## Non-goals this run

- No hosted analysis / LLM run in Openwisdom product surfaces.
- No heat numbers written into SKILL.md.
- No auto-merge to master.
- No auto-write under `skills/official/`.
- Catalog truth only via `skills/` + `catalog:build`.
