---
name: allocating-effort
description: "Splits scarce time, budget or traffic across competing products, channels, campaigns or variants by treating them as a multi-armed bandit - Thompson sampling over beta posteriors, with optimism for anything not yet tried enough to judge. Use when deciding what to work on next, how to divide a marketing budget, which product to prioritise, whether to kill something that is underperforming, or when picking a winner among test variants."
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
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/allocating-effort"
---


# Allocating effort

Deciding what to work on next is a bandit problem: several options, each with an
unknown payoff rate, and every unit of effort spent on one is a unit not spent
learning about the others. The two failure modes are symmetric and both are common -
committing everything to the current leader before you know it is the leader, and
spreading effort evenly long after you do.

Thompson sampling resolves both without tuning, and its allocation has a plain-English
meaning: **each option gets the share of effort equal to the probability it is the
best one.**

## Workflow

```
- [ ] 1. Define the arms and what counts as a win
- [ ] 2. Count wins and losses honestly, including the zeros
- [ ] 3. Set priors where you genuinely know something
- [ ] 4. Run the allocation
- [ ] 5. Read the under-explored list before cutting anything
- [ ] 6. Commit the split for a fixed period, then recount
```

### 1. Define the arms and the win

An arm is anything you allocate to: a product, a channel, an ad creative, a landing
page, a content format. The win must be:

- **the same event for every arm** - "signup" for one arm and "trial start" for another
  makes the comparison meaningless;
- **as close to revenue as you can measure quickly** - clicks are a fast proxy that
  frequently ranks arms in the opposite order to paid conversion;
- **countable per unit of exposure** - wins and losses, not a rate someone computed.

If arms have wildly different payoff sizes, this model is the wrong one: it compares
rates, not values. Weight the wins by value first, or use the **framing-decisions**
skill instead.

### 2. Count honestly, including the zeros

The arm with zero wins and fourteen tries goes in the table with `wins: 0, losses: 14`.
Leaving it out because "it obviously doesn't work" is the mistake this whole skill
exists to prevent: with a uniform prior that arm's posterior mean is 6%, not 0%, and
14 observations is nowhere near enough to distinguish 6% from 2%.

### 3. Set priors where you know something

Default is Beta(1,1), uniform, which is right when you truly have no idea. Where you do
have a view, encode it as pseudocounts:

```json
{ "name": "paid-search", "wins": 3, "losses": 40, "priorWins": 2, "priorLosses": 18 }
```

That prior says "roughly a 10% rate, believed about as strongly as 20 observations".
Say the strength out loud - it is the part people fudge. And never use a prior of 0
pseudocounts on one side; it asserts an outcome is impossible.

### 4. Run the allocation

```bash
node scripts/calc.js allocate arms.json --budget 40 --floor 0.05
```

Input shape: `examples/allocate.json`. `--budget` is whatever you are splitting (hours
per week, currency, traffic share). `--floor` reserves a minimum share for every arm so
nothing is ever fully starved of evidence.

Alternative strategies, when you need them:

| Flag | Use when |
|---|---|
| (default) `--strategy thompson` | almost always; no tuning, converges to the right split |
| `--strategy ucb1 --c 1` | you want a deterministic, explainable ranking for a document |
| `--strategy quantile --alpha 0.9` | you want to rank by an explicit optimistic bound |
| `--strategy greedy` | you have genuinely stopped learning and only want to harvest |

### 5. Read the under-explored list before cutting anything

The output flags every arm with fewer than 30 observations. **Do not kill those.**
An arm that has not been tried enough times to distinguish "bad" from "unlucky" has not
been tested, and cutting it is a decision made on noise.

This is the R-MAX idea: treat an under-explored option as maximally promising until it
has had its `m` attempts. It costs a little and it prevents the expensive error of
abandoning something that would have worked.

When you do want the confidence behind a lead:

```bash
node scripts/calc.js compare arms.json
```

A lead below 90% probability is not a winner. The tool says so.

### 6. Commit, then recount

Fix the split for a defined period - a week, a sprint, a campaign flight - and do not
re-derive it daily. Re-allocating continuously means every arm is permanently in
transition and none of them accumulate the observations that make the model work.

## Output template

```markdown
## Arms and the win event
Win = <the single event, measured the same way for every arm>
Denominator = <what counts as an attempt>

| Arm | wins | losses | prior | posterior mean |
|---|---|---|---|---|

## Allocation
<paste the allocate output>

Read as: <arm> gets <share> because there is a <share> chance it is the best arm.

## Not yet judgeable
<arms under the observation threshold, with their counts, and the explicit
instruction not to cut them>

## Confidence in the lead
<paste calc compare for the top pair; state plainly if the lead is under 90%>

## Commitment
This split holds until <date or trigger>. Recount then.
```

## Gotchas

- **A zero-win arm never has a zero estimate.** If you find yourself reasoning from a
  0% conversion rate, you have dropped the prior.
- **Thompson sampling is stochastic.** Reruns give slightly different shares. Pass
  `--seed` for a reproducible number to paste into a document.
- **Rates are not values.** An arm converting at 2% on 500-a-month contracts beats one
  converting at 20% on 5-a-month ones. This model does not know that. Weight the wins.
- **Do not mix time scales.** Six months of data on one product against two weeks on
  another is handled correctly by the posteriors, but only if the underlying rates were
  stable over those windows. If the product changed materially, discard the old counts
  rather than letting them dominate.
- **Non-stationarity is real and unmodelled here.** A channel that worked in January may
  not work in July. If you suspect drift, discard observations older than a couple of
  cycles, or track the rate with the **tracking-beliefs** skill instead.
- **The floor is not decoration.** Setting `--floor 0` recovers pure exploitation and
  reintroduces the failure mode of never revisiting an arm that had a bad start.
- **Arms must be simultaneously available.** If you can only work on one product at a
  time, the shares are a schedule over the period, not a parallel split.

## Reference

- `references/arms-and-wins.md` - choosing arms and win events that make the comparison valid
- `references/exploration-strategies.md` - what each strategy does, and when the default is wrong

## Related skills

- **valuing-information** when the question is whether to test at all, rather than how to split
- **tracking-beliefs** when the rate is drifting rather than fixed
- **planning-horizons** when the options are sequential moves rather than parallel bets
- **learning-from-outcomes** to check whether last quarter's split was right

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/allocating-effort

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
