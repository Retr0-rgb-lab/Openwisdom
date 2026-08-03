---
name: session-retrospect
description: "Portable four-layer retrospect (audit, reflect, route, prescribe) adapted from psychology-agent without mesh transport dependencies."
layer: scenario
scope: community
disciplines: ["psychology"]
language: "en"
tags: ["metacognition", "retrospect", "reflection", "session-review", "curated-external", "openwisdom"]
version: "0.1.0"
license: "Apache-2.0"
metadata:
  openwisdom: true
  provenance: curated-external
  upstream: "https://github.com/safety-quotient-lab/psychology-agent/tree/main/.claude/skills/retrospect"
  note: "Method adapted for portability; mesh-specific transport/peers removed"
---
# Session Retrospect (portable)

Reflective, cross-session meaning-making adapted for a **standalone** agent session.
Upstream psychology-agent `/retrospect` is tightly coupled to a multi-agent mesh
(transport files, peer routing, state.db). This Openwisdom pack keeps the **method**
and drops harness-specific automation.

## When to use

- After a multi-step analysis or research arc
- When the user asks what was learned, what patterns recur, or what to do next
- Periodic metacognitive review of agent+user work (not a substitute for
  official `metacognition-audit`)

## Four layers

### Layer 1 — Audit (what was dropped?)

Scan the conversation / artifacts for:

| Type | Signal |
|------|--------|
| undelivered commitment | "will / next / TODO" with no follow-through |
| unanswered question | user question never addressed |
| untracked claim | strong claim without evidence pointer |
| stale thread | open issue idle across turns |

Output only items that need attention.

### Layer 2 — Reflect (what does it mean?)

Not a summary. Recombine:

1. Cross-session or cross-turn **patterns** and structural reasons they persist
2. How core constructs or framing **evolved**
3. Dyadic learning (what only emerged from human–agent collaboration)
4. Analogies that earned insight vs decoration
5. Epistemic position: more grounded or more speculative than earlier?
6. Creative vs evaluative balance

Ground each reflection in at least one theory name, one observable datum, and one
falsifiable check.

### Layer 3 — Route (who should know?)

Propose **who** benefits (user roles, teammates, future-you) and draft short outbound
notes. **Never auto-send**; surface for human approval.

### Layer 4 — Prescribe (what should we do?)

For each material finding:

1. Specific recommendation
2. Rationale + evidence
3. Impact if act / if not
4. Owner (user / agent assist)
5. Priority: immediate / next session / backlog

No auto-execution of prescriptions.

## Output template

```markdown
# Retrospect report
## Top 3 findings
1. …
## Layer 1 Audit
| item | type | action |
## Layer 2 Reflection
…
## Layer 3 Routing drafts
…
## Layer 4 Prescriptions
| # | recommendation | owner | priority |
## Epistemic flags
…
```

## What this pack does NOT do

- Auto-write TODOs, auto-send messages, or modify remote peer agents
- Replace official Openwisdom orientation / metacognition scenarios
- Claim clinical or psychometric validity

## Upstream

https://github.com/safety-quotient-lab/psychology-agent/tree/main/.claude/skills/retrospect

This skill was curated into Openwisdom for discovery and local install.
Prefer the upstream repository for the latest author intent and license terms.

## Provenance

- Author: safety-quotient-lab (method); Openwisdom adaptation
- Attribution: safety-quotient-lab/psychology-agent (retrospect method)
- License: Apache-2.0
- Openwisdom provenance: curated-external (installable community pack)
- Portable adaptation — not a 1:1 copy of mesh-bound /retrospect

## Agent instructions

You are applying this Openwisdom skill in the current coding-agent session.
Follow the workflow in this skill. Do not invent hosted Openwisdom chat.
Analysis runs here in this agent, not on openwisdom.vercel.app.
