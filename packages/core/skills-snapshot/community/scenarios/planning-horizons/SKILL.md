---
name: planning-horizons
description: "Decides how far ahead to plan, what to discount future payoffs by, and which backlog items can be dropped without analysis - using receding-horizon planning, an explicit discount factor, and branch-and-bound pruning against the incumbent. Use when building a roadmap, prioritising a backlog, arguing about short-term versus long-term, setting quarterly or annual plans, or when planning has become an end in itself."
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
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/planning-horizons"
---


# Planning horizons

Two chronic errors in roadmapping, and both are cheap to fix:

1. **Planning deeper than the decision requires.** Past a certain depth, extra planning
   changes nothing about what you do on Monday. That work is spend, not rigour.
2. **Leaving the discount rate implicit.** Every argument about short-term versus
   long-term is an argument about a discount factor that nobody has written down. Write
   it down and the argument usually resolves in a minute.

The organising principle is receding horizon planning: **plan to depth d, execute the
first step, then replan.** You are not committing to the plan. You are using the plan to
choose the next action.

## Workflow

```
- [ ] 1. Set the discount factor from a half-life you can defend
- [ ] 2. Find the depth where extra planning stops changing the first move
- [ ] 3. Prune the backlog against the incumbent
- [ ] 4. Evaluate the current plan before replacing it
- [ ] 5. Plan to that depth, commit only the first step, set a replan trigger
```

### 1. Set the discount factor

Do not argue about gamma. Argue about the half-life: **how many periods until a payoff
is worth half as much to us?** Then convert.

```bash
node scripts/calc.js discount --half-life 6
```

That reports the effective horizon (`1/(1-gamma)`) - the point past which contributions
are noise - and the weight on payoffs at 1, 3, 6, 12 and 24 periods.

Defensible half-lives depend on your position, not your temperament:

| Position | Monthly half-life | Effective horizon |
|---|---|---|
| Under 6 months of runway | 3 | ~4 months |
| Profitable, stable | 12 | ~17 months |
| Funded with a clear multi-year thesis | 24 | ~35 months |

Runway is the honest driver. A short runway *should* produce a high discount rate,
because a payoff after you run out of money has a utility of zero. That is not
short-termism, it is arithmetic. Say it that way and the strategic argument becomes a
financing argument, which is the one actually worth having.

### 2. Find the depth that matters

Estimate the value of the best plan you can find at several depths and look for where
the curve flattens.

```bash
node scripts/calc.js horizon depths.json
```

Input shape: `examples/horizon.json`. The answer is the depth beyond which extra
planning buys under a couple of percent. Planning deeper than that is not more rigorous;
it produces the same first move at higher cost, plus a document that will be wrong.

The check that makes this concrete: **would a longer horizon change what we do this
week?** If no, the horizon is long enough. In the book's collision-avoidance example
there is no benefit to planning past 40 seconds, because no action taken earlier than
that differs.

### 3. Prune the backlog

For each candidate, an **optimistic ceiling**: the contribution if everything goes right.
For candidates already tried, a **realized floor**: what it actually delivered.

Anything whose optimistic ceiling sits below the best realized floor can be dropped
without further analysis, because even its best case loses to something you already have.

```bash
node scripts/calc.js prune backlog.json
```

Input shape: `examples/prune.json`. This is branch and bound, and it is the cheapest
triage available: it removes items from the backlog by arithmetic rather than by debate.
Tighter ceilings prune more, so it pays to make the optimistic estimates honest rather
than generous.

The surviving list is ordered by ceiling: evaluate in that order, and each evaluation
raises the floor and prunes more.

### 4. Evaluate before replacing

Before adopting a new plan, evaluate the current one properly - what it is actually
worth if continued, not what it felt like last week. Most "pivots" skip this step and
compare an optimistic new plan against a demoralised memory of the old one.

Policy iteration alternates evaluation and improvement, and the evaluation half is not
optional. If the current plan has never been scored, you do not know what the new one
has to beat.

### 5. Commit the first step only

Publish the depth-d plan as context. Commit only to the first step, and state the
condition that triggers a replan. That is receding horizon planning, and it is what
makes deep planning safe: you are not betting on the tail of the plan being right.

A replan trigger is an observation, not a date: "replan when weekly signups fall below
40 for two consecutive weeks" fires when the world changes. "Replan in Q3" fires when
the calendar does.

## Output template

```markdown
## Discount factor
Half-life: <n> periods, because <runway / position>.
Gamma: <value>. Effective horizon: <n> periods.
A payoff at <n> periods is worth <pct> of the same payoff today.

## Planning depth
<paste calc horizon, or state the depth and why deeper changes nothing this week>

## Backlog after pruning
<paste calc prune: incumbent, keep list ordered by ceiling, prune list with reasons>

## Current plan, evaluated
<what the existing plan is worth if continued - the number the new plan must beat>

## Commitment
First step: <the only thing being committed to, with owner and date>
Context: <the rest of the depth-d plan, labelled as context not commitment>
Replan trigger: <an observation with a threshold and a duration, not a date>
```

## Gotchas

- **Deeper is not better.** Past the flat point, extra depth adds cost and a false sense
  of control. The book's example shows a planner gaining nothing past a specific horizon,
  and the same is true of roadmaps.
- **A shallow plan plus frequent replanning often beats a deep plan.** Replanning
  compensates for a short horizon. If you can replan weekly, you need less depth than if
  you can only replan quarterly.
- **Open-loop plans assume no new information.** A Gantt chart committing twelve months
  is an open-loop plan. It is efficient to compute and wrong the moment anything is
  learned. Reserve it for genuinely uninterruptible sequences.
- **Discounting is not impatience.** It reflects genuine uncertainty about whether you
  will be there to collect. Making it explicit converts a values argument into an
  arithmetic one.
- **Do not discount twice.** If your outcome estimates are already probability-weighted
  for "we might not get there", applying a survival-based discount on top double-counts.
- **Ceilings must be optimistic, not expected.** Branch and bound is only valid if the
  ceiling really is an upper bound. Putting an expected value in the ceiling column
  prunes things that would have won.

## Reference

- `references/receding-horizon.md` - the loop, replan triggers, and open-loop versus closed-loop
- `references/search-strategies.md` - forward search, branch and bound, sparse sampling, tree search, and which maps to which planning practice

## Related skills

- **framing-decisions** for the individual choice at each step
- **allocating-effort** when the options are parallel bets rather than a sequence
- **stress-testing-plans** to check the plan against assumptions you are unsure of
- **valuing-information** when the plan depends on something you could go and measure

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/planning-horizons

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
