---
name: tracking-beliefs
description: "Separates signal from noise in metrics you cannot observe directly, updating a belief from evidence instead of reacting to the latest reading - Bayesian updates over competing explanations, and a filter that says whether this week's move is real. Use when a metric moves and someone wants to act, when diagnosing why traffic or revenue changed, when a dashboard number contradicts intuition, or when deciding whether a trend is real yet."
layer: scenario
scope: community
disciplines: ["psychology", "economics"]
language: "en"
tags: ["decision-making", "expected-utility", "critical-thinking", "algorithms-for-decision-making", "curated-external", "openwisdom"]
version: "0.1.0"
license: "MIT"
metadata:
  openwisdom: true
  provenance: curated-external
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/tracking-beliefs"
---


# Tracking beliefs

You never observe the state of the business. You observe noisy readings of it. Revenue
lags settlement, refunds and disputes arrive late, annual plans lump, analytics drops
traffic to blockers and bots, and attribution is approximate everywhere.

Two operations, and almost every metric argument needs one of them:

- **Filtering** - given a series of noisy readings, what is the underlying level, and is
  the latest move larger than noise explains?
- **Updating** - given evidence, how should belief shift across competing explanations?

## Workflow

```
- [ ] 1. Say what you are actually measuring, and what the reading is a proxy for
- [ ] 2. Decide whether the latest move is real
- [ ] 3. If it is real, list the explanations before looking for evidence
- [ ] 4. Update on the evidence
- [ ] 5. Act only when the belief is concentrated enough to matter
```

### 1. Reading versus state

Write both lines:

- **State** (unobserved): "how much recurring revenue we are actually earning."
- **Reading** (observed): "what Stripe reported as settled this week."

The gap between them is the noise model, and naming it usually resolves the argument
before any maths. A weekly revenue reading with settlement lag and refunds has several
percent of noise on it before anything real has happened.

### 2. Is the move real?

```bash
node scripts/calc.js track metric.json
```

Input shape: `examples/track.json`. The filter separates drift in the true level from
measurement noise and reports, per reading, whether it fell outside what drift alone
explains.

Read two things: the current **level** with its interval, and whether the latest reading
is **surprising**. A reading inside the band is not evidence of anything and should not
start a project. That single check kills most metric panic.

Supply `processVar` and `observationVar` when you know them. Without them the tool
guesses from the series itself and says so; the guess is a starting point, not a
measurement.

The intuition for the two numbers: `observationVar` is how much the reading bounces
when nothing changed - measurable by reading the same period twice, days apart, and
seeing how much it moves. `processVar` is how much the true level genuinely drifts per
period.

### 3. List explanations before hunting evidence

Enumerate the competing explanations **first**, with priors, before going to look at
anything. Two to four, mutually exclusive.

Doing this in the other order is how confirmation bias operates: you form a hypothesis,
find evidence consistent with it, and never ask whether that evidence was also
consistent with the alternatives. The likelihood table forces that question.

Priors come from history. If the last five unexplained traffic drops were three tracking
bugs and two algorithm updates, that is your prior, and it is a better one than the
current mood.

### 4. Update on the evidence

```bash
node scripts/calc.js belief drop.json
```

Input shape: `examples/belief.json`. Give it the prior, the transition model (how the
world drifts on its own between observations), and the likelihood of the evidence you
saw under each explanation.

The likelihood is the honest bit: **how probable is this specific evidence if that
explanation is true?** Evidence that is equally likely under every explanation carries no
information, however striking it looks.

The output reports how many bits of uncertainty you removed. Near zero means you learned
nothing, and you should go and find a more discriminating observation - which is the
**valuing-information** skill.

### 5. Act when the belief concentrates

Diffuse belief plus an expensive irreversible action is the bad combination. Options
while you are still uncertain:

- take the action that is best across the surviving explanations (**stress-testing-plans**)
- take a reversible version now, the irreversible one later
- buy a discriminating observation (**valuing-information**)

## Output template

```markdown
## Reading versus state
State (unobserved): <what we actually care about>
Reading (observed): <what the number literally measures>
Known noise sources: <lag, refunds, bots, attribution, lumpiness>

## Is the move real
<paste calc track>
Level now: <value> +/- <interval>. Latest reading: <inside the band | surprising>

## Competing explanations
<listed before investigating, each with a prior and its source>

| Explanation | prior | source | the observation that would discriminate |
|---|---|---|---|

## Update
<paste calc belief: prior vs posterior, and bits of uncertainty removed>

## What to do
<act | buy a discriminating observation | take the reversible version now>
If the belief is still diffuse, say so and name the next cheapest observation.
```

## Gotchas

- **Start diffuse.** A confident wrong prior takes many observations to recover from. When
  in doubt, spread the prior; over-narrow beliefs are brittle in a way that is hard to see
  from the inside.
- **Never assign a prior of 0.** Zero prior means no evidence can ever revive that
  explanation. If "our tracking broke" has probability zero, you will never diagnose a
  tracking break.
- **If every explanation has zero likelihood, your model is wrong, not the world.** The
  tool raises an error rather than silently renormalising. The right response is to widen
  the observation model or add an explanation you had not considered.
- **Week-over-week deltas conflate drift and noise.** That is precisely what the filter
  separates. A dashboard showing raw WoW percentages is an anxiety generator.
- **The prior is not the current mood.** Source it from the last several times this
  happened.
- **Small samples justify simple explanations.** With a handful of data points, prefer
  the simpler story: elaborate causal chains fitted to three observations generalise
  worse than "this class of thing usually does that."
- **Do not re-read the same evidence twice.** A number quoted in three meetings is one
  observation. Updating on it three times manufactures false confidence.
- **The filter assumes the noise is roughly stable.** After a tracking change or a
  pipeline migration, the old variance no longer applies. Reset.

## Reference

- `references/noise-models.md` - typical noise sources by metric, and how to measure your own
- `references/diagnosis.md` - the standard explanation sets for revenue, traffic and conversion drops, with likelihood tables

## Related skills

- **valuing-information** when the belief will not concentrate on its own
- **framing-decisions** once the belief is good enough to act on
- **allocating-effort** when the rate is stable and you are comparing options rather than diagnosing
- **learning-from-outcomes** to check whether past diagnoses were right

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/tracking-beliefs

This skill was curated into Openwisdom for discovery and local install.
Prefer the upstream repository for the latest author intent and license terms.

## Provenance

- Author: Romain Simon
- Attribution: romainsimon/skills-for-decision-making
- License: MIT
- Openwisdom provenance: curated-external (installable community pack)
- Source book: Kochenderfer, Wheeler & Wray, Algorithms for Decision Making (MIT Press, 2022)

## Agent instructions

You are applying this Openwisdom skill in the current coding-agent session.
Follow the workflow in this skill. Do not invent hosted Openwisdom chat.
Analysis runs here in this agent, not on openwisdom.vercel.app.
