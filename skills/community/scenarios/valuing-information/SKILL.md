---
name: valuing-information
description: "Prices research, tests, surveys, dashboards and experiments before running them, by computing how much the result would raise expected utility - which is zero whenever no outcome would change the decision. Use when someone proposes an A/B test, user survey, market study, competitor analysis, analytics build, consultant, pilot, or \"let's gather more data\", and when deciding how large a study needs to be."
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
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/valuing-information"
---


# Valuing information

The value of an observation is the increase in expected utility from making it:

```
VOI(O) = sum over outcomes P(o) * max_a EU(a | o)  -  max_a EU(a)
```

It is never negative. It is **exactly zero** whenever the best action is the same
whatever you learn. That zero is the entire point of this skill: most proposed
research is decoration, and this is the calculation that says so before the money
is spent rather than after.

## Workflow

```
- [ ] 1. Name the decision the information would serve
- [ ] 2. State the actions and what you would do today with no new data
- [ ] 3. State the hidden variable, its states, and the prior
- [ ] 4. Score every action-state pair
- [ ] 5. Compute the perfect-information ceiling before pricing any real study
- [ ] 6. State honestly how discriminating each candidate observation is
- [ ] 7. Run the calculator and read the "changes decision" column
- [ ] 8. If it is worth it, size the study
```

**Put the tables in the answer.** The decision table and the likelihood table are not
scratch work: write them out. A reader who cannot see the numbers cannot challenge them,
and the numbers are the only part of this that is falsifiable.

### 1. Name the decision

Write the sentence: *"We are trying to decide whether to ___, and we would act
differently if we learned ___."*

If you cannot complete it, there is no decision, so there is no value of information.
That does not make the research illegitimate - curiosity and background understanding
are real - but it does mean it should compete for time as a discretionary activity,
not be waved through as diligence.

### 2-4. Build the decision

Same construction as the **framing-decisions** skill: actions, states, prior, one
utility scale. If that skill has already been run, reuse its table verbatim.

Write the table out, states as rows and actions as columns:

| State | P | raise 40% | raise 15% | hold |
|---|---|---|---|---|
| tolerates +40% | 0.35 | 45000 | 20000 | 0 |
| tolerates +15% | 0.40 | 5000 | 18000 | 0 |
| tolerates nothing | 0.25 | -28000 | -6000 | 0 |

Then state, in one sentence, **what you would do today with nothing new**. That default
is the baseline the whole calculation is measured against, and writing it first is what
stops you rationalizing afterwards.

### 5. Compute the ceiling first

Before pricing any real study, price a hypothetical oracle that reveals the state
exactly. Its value is `E[max] - max[E]`, and **no real study can be worth more.**

Run the calculator with an oracle observation (likelihoods of 1 and 0). If the oracle is
worth 400, no consultancy proposal at 25,000 needs further analysis, and you have saved
the whole exercise. Say the ceiling out loud in the answer.

### 6. State how discriminating the observation is

For each candidate observation, and each possible outcome of it, give
`P(outcome | state)`. These must sum to 1 across outcomes, for each state; the
calculator rejects tables that do not, because a broken likelihood table silently
inflates VOI.

Write it out, and name the sensitivity and specificity in words as well as numbers:

| Outcome | P(outcome \| tolerates +40%) | P(outcome \| +15%) | P(outcome \| nothing) |
|---|---|---|---|
| enthusiastic | 0.70 | 0.25 | 0.05 |
| lukewarm | 0.25 | 0.55 | 0.30 |
| hostile | 0.05 | 0.20 | 0.65 |

This is where the honesty is required, and where most estimates are wrong. See
`references/likelihoods.md` for typical values by method. The short version: a survey
question about hypothetical willingness to pay is far less discriminating than people
assume, and putting `0.9 / 0.1` on it rather than `0.65 / 0.35` can turn a worthless
study into an apparently valuable one.

### 7. Run it

```bash
node scripts/calc.js voi study.json
```

Input shape: `examples/voi.json`. Read the output in this order:

1. **changes decision** - if `NO`, stop. Nothing else matters. The observation cannot
   affect what you do.
2. **net** - VOI minus cost. Negative means the answer is worth less than finding it.
3. **the switch list** - which outcome would flip you to which action, and with what
   probability. This is the pre-registration: if the study comes back `enthusiastic`,
   you have already committed to raising the price.

When several observations are on the table, the calculator ranks them by net value.
Take the top one, run it, then recompute - the value of the second study depends on
what the first one said. Ranking all of them and running them in parallel overstates
their combined value.

### 8. Size the study

Only once VOI is positive.

```bash
# how precise is a result I already have?
node scripts/calc.js precision --successes 3 --trials 10000

# how many trials do I need for a usable answer?
node scripts/calc.js samplesize --p 0.002 --rse 0.2

# for a rare event: is oversampling the rare segment cheaper?
node scripts/calc.js importance --true-rate 0.002 --proposal-rate 0.1 --n 10000
```

Three facts to state in the answer whenever you quote a sample size:

- **For a rare outcome, use the relative standard error, not the absolute one.** An
  absolute error of 0.0002 on a 0.0003 metric measures nothing and looks precise in a
  slide.
- **Halving the error costs four times the sample**, because error falls with the square
  root of n. This is why "let's run it a bit longer" is rarely the fix.
- **When the event is rare and you can over-recruit the cases that produce it**, sample
  the rare segment deliberately and reweight by `P(true)/P(proposal)`. The gain is often
  one to two orders of magnitude in effective sample size. The weights must actually be
  applied; skipping that step turns a clever design into a biased sample.

`references/sizing-studies.md` has the stopping rules and the zero-successes case.

## Output template

```markdown
## Decision this would serve
<one sentence: we are deciding whether to ___, and would act differently if ___>
Default action today, with nothing new: <action>

## Decision table
<states x actions, with priors and their source>

## Ceiling
Perfect information would be worth <X>. No real study can beat that.

## How discriminating each option is
<likelihood table per candidate observation, with the reasoning for the numbers>

## Value
<paste the voi output>

## Verdict
<gather or skip, net of money and delay>
If <observation> comes back <outcome>, we switch to <action>. Otherwise we <default>.
```

## Gotchas

- **Cost is not only money.** Include the delay. A study that takes six weeks costs six
  weeks of acting on the current best guess, and for a fast-moving decision that
  usually dominates the invoice.
- **A test that only confirms is worth zero.** If every outcome leaves you doing the
  same thing, VOI is zero even when the test is highly accurate and cheap. Accuracy
  and value are different quantities.
- **VOI is never negative, net VOI often is.** The calculator reports both. Do not
  quote the gross number.
- **Greedy ordering is a heuristic.** Picking the highest-value observation, then
  recomputing, is not guaranteed to find the optimal sequence of observations. It is
  good enough, and it is what the book recommends for practical use, but do not claim
  optimality for it.
- **Perfect information is the ceiling.** Computed in step 5, and worth restating: it
  Compute it first with a hypothetical oracle observation: if an oracle would only be
  worth 400, no real study is worth 2,000.
- **A dashboard is an observation with a recurring cost.** Price it the same way. Most
  proposed dashboards report metrics that no one has a decision attached to.
- **Beware the study designed to justify.** If the switch list is empty in one
  direction - no outcome would stop you - you are buying permission, not information.
  That may be a legitimate political purchase, but do not book it as research.

## Reference

- `references/likelihoods.md` - estimating how discriminating a test really is, with typical values
- `references/sizing-studies.md` - sample size, rare events, importance sampling, stopping rules

## Related skills

- **framing-decisions** builds the decision table this skill prices
- **tracking-beliefs** for updating on the result once it arrives
- **allocating-effort** when the "study" is really just trying the thing at small scale

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/valuing-information

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
