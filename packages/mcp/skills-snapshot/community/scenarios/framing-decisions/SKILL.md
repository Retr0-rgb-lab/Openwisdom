---
name: framing-decisions
description: "Turns a vague \"what should we do about X\" into a scored decision - explicit actions, an explicit unknown, an explicit prior, and one utility scale - then picks by maximum expected utility and checks the result for framing effects. Use when facing a choice between options under uncertainty, when a decision has stalled in circular debate, when someone asks \"should we do A or B\", or before writing any decision record, strategy memo, or roadmap commitment."
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
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/framing-decisions"
---


# Framing decisions

Most stalled decisions are not hard. They are unframed: the options are fuzzy, the
disagreement is about an unnamed hidden variable, and the outcomes are being scored
on two different scales by two different people. Framing dissolves more arguments
than analysis does.

Run the whole workflow. Skip to the calculator and you will optimize a badly posed
problem, which is worse than arguing.

## Workflow

```
- [ ] 1. Name the actions (at least three, one of which is do nothing)
- [ ] 2. Name the hidden variable the disagreement is actually about
- [ ] 3. Put a number on the prior, sourced not guessed
- [ ] 4. Score every action-state pair on one scale
- [ ] 5. Run the calculator
- [ ] 6. Run the bias check before committing
- [ ] 7. Write the decision record
```

### 1. Name the actions

List them as things someone could start doing tomorrow. Three rules:

- **Always include "do nothing".** It is a real action with a real payoff, and it is
  often the incumbent that everything else must beat.
- **Look for the reversible half.** If an option can be split into a cheap reversible
  part and an expensive irreversible part, those are two different actions. The
  reversible half usually wins on expected utility and is usually not on the list.
- **Stop at five.** More options do not improve the decision; they hide it.

### 2. Name the hidden variable

Ask: *what would we need to know for this to be obvious?* That is the hidden state.
Write it as two to four mutually exclusive, collectively exhaustive states.

If two people disagree about the action but agree on the state, the disagreement is
about values, and no analysis will settle it. Say so and escalate to whoever owns
the values.

### 3. Put a number on the prior

Probabilities come from a reference class, not from a feeling. In order of preference:

1. Our own past attempts at the same thing. Count them.
2. A published base rate for this class of thing.
3. A stated pseudocount: "this is a Beta(2,3) belief, worth about five observations."

Never write a prior of 0 or 1. If you have no data at all, use a uniform prior and
say so; that is a legitimate answer, and it is what makes step 5 tell you to go and
measure something instead.

### 4. Score outcomes on one scale

Pick one currency for the whole table. Cash at the end of the horizon is the usual
choice, and it must be the **resulting position**, not the delta, so a curved utility
can be applied to it.

Then decide whether the decision is risk neutral:

| Situation | Utility form |
|---|---|
| Worst case is a rounding error against the bankroll | `linear` |
| Worst case would materially shorten runway | `log` |
| Worst case is fatal (insolvency, licence loss, reputation) | do not model it - remove that action |

Risk aversion is not pessimism. It is the statement that losing half your cash hurts
more than doubling it helps, which is true and which linear expected value cannot
express. Run both forms; if they disagree, that disagreement *is* the decision.

### 5. Run the calculator

Write the table to a JSON file shaped like `examples/meu.json`, then:

```bash
node scripts/calc.js meu decision.json --utility log
```

Read three numbers: the winner, the **advantage** of second place, and the certainty
equivalent. If the advantage is near zero the numbers are not choosing for you, and
you should say that plainly rather than manufacture a winner.

If the answer is "we do not know enough to choose", stop here and switch to the
**valuing-information** skill. Do not go and gather data first; find out whether the
data would change anything.

### 6. Bias check

Read `references/bias-checks.md` and run the five checks. They take a minute and they
catch the failure modes that survive step 5. The two that fire most often:

- **Framing.** Restate the leading option as a loss instead of a gain and re-read the
  table. If your preference flips, the preference was about the wording.
- **Certainty.** A guaranteed small gain beating a much larger probable gain is a
  known violation of rational preference, not a conservative instinct.

### 7. Write the decision record

Use the template in `references/decision-record.md`. The non-negotiable field is the
**stated probability**: a number you can be scored on later. A decision record without
a falsifiable prediction cannot teach you anything, and the
**learning-from-outcomes** skill has nothing to grade.

## Output template

Put the tables in the answer, not in scratch work. A reader who cannot see the numbers
cannot challenge them, and the numbers are the only falsifiable part.

```markdown
## The decision
<one sentence, phrased as the action being chosen>

## Actions
<at least three, including do nothing and any reversible half>

## Hidden variable
<2-4 exclusive states, with priors and where each number came from>

| State | P | source |
|---|---|---|

## Outcome table
<states x actions, scored as the resulting position on one scale>

| State | P | action A | action B | do nothing |
|---|---|---|---|---|

Utility form: <linear | log | power(lambda)> because <reason>

## Result
<paste the meu output, including the advantage of second place>

## Bias check
<the checks that fired, or "none">

## Decision and predictions
<the action, then 2-5 dated predictions with probabilities>
```

## Gotchas

- **Utility is not revenue.** A table scored in monthly revenue while one action risks
  the company is not a decision table. Score the resulting position.
- **The lottery must sum to 1.** The calculator refuses tables that do not, because a
  set of probabilities that sums to 0.8 usually means a missing outcome, not a typo.
- **Utilities are only defined up to a positive affine transform.** You can add a
  constant or scale the whole table without changing the answer. You cannot compare a
  utility number from one decision to a utility number from another.
- **"Both options are fine" is a real result.** When the advantage is under a percent,
  pick the reversible one and stop spending time.
- **An action with a catastrophic branch does not belong in the table.** Expected
  utility will happily trade a 2% chance of insolvency for enough upside. Remove the
  action or cap the downside first, then score what is left.
- **Log utility needs positive values.** If an outcome is a negative cash position,
  shift the whole table by a constant (`shift` in the utility options) rather than
  switching to linear and quietly losing the risk aversion.

## Reference

- `references/bias-checks.md` - the five checks for step 6, with the experiments they come from
- `references/decision-record.md` - the output template
- `references/utility-curves.md` - choosing and defending a utility form
- `references/decision-networks.md` - when the problem has more structure than one hidden variable

## Related skills

- **valuing-information** when the answer is "we need more data"
- **stress-testing-plans** when the answer depends on a model assumption you are unsure of
- **planning-horizons** when this is one move in a sequence rather than a single choice
- **learning-from-outcomes** to grade the prediction you just wrote down

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/framing-decisions

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
