---
name: stress-testing-plans
description: "Validates a plan before committing to it - checks whether the ranking survives the assumptions, finds the most likely way it fails, and makes the trade-offs explicit via a Pareto frontier instead of an invented single score. Use before a launch, price change, migration, infrastructure change or major commitment, when running a premortem, when two objectives conflict, or when a decision depends on an assumption nobody has tested."
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
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/stress-testing-plans"
---


# Stress testing plans

A plan is optimized against a model of the world. The model is wrong. Validation asks
three questions, in this order:

1. Does the ranking survive plausible errors in the model?
2. What is the most likely way this fails, and does that trajectory worry us?
3. What are we actually trading, and have we said so?

The governing principle: **plan with a simple model, evaluate with a rich one.** A
simple planning model resists overfitting to assumptions you cannot verify. The
evaluation model can be as elaborate as you can justify, because nothing is being fitted
to it.

## Workflow

```
- [ ] 1. List the assumptions the plan depends on
- [ ] 2. Score each option under each plausible variant
- [ ] 3. Check whether the ranking survives
- [ ] 4. Find the most likely failure and read it back
- [ ] 5. Make the trade-off explicit
- [ ] 6. Pick a response from the fixed menu
```

### 1. List the assumptions

Not risks. **Assumptions**: quantities the plan's ranking depends on and which you have
not measured. Churn stays flat. The infra bill scales linearly. Conversion holds at the
new price. No rival ships a free tier.

Keep the ones where a plausible alternative value is materially different. Three to five
is the working range; more and the matrix becomes unreadable.

### 2-3. Does the ranking survive?

Build a matrix of option by scenario and run:

```bash
node scripts/calc.js robust plan.json
```

Input shape: `examples/robust.json`. It reports three winners:

- **best expected** - highest weighted average across scenarios
- **best worst case** (maximin) - best outcome under its own worst scenario
- **least regret** (minimax regret) - smallest gap to whatever turns out to be best

**If all three agree, the decision is robust. Ship it and stop analysing.** That is the
common outcome and it is worth reaching quickly.

If they disagree, the disagreement is the decision, and it is a question about appetite
rather than about arithmetic. Say out loud how much downside you are buying insurance
against, decide, and record the reason. Do not let the disagreement stay hidden behind
whichever number someone quoted.

Minimax regret is usually the most useful of the three in a commercial setting: maximin
optimises against a scenario that may be very unlikely, which produces excessively timid
plans.

### 4. Find the most likely failure

Not the worst imaginable failure - the most *probable* one. An adversary that minimises
your return while maximising the likelihood of the trajectory it takes to get there.

In practice, run a premortem with that constraint:

> It is six months from now and this failed. Describe how, using only steps that were
> each individually likely at the time.

The constraint is what makes it useful. It rules out "an asteroid hit the datacentre"
and surfaces the chain of individually-reasonable steps that ends badly, which is how
things actually fail. Score each step's plausibility and multiply; a trajectory whose
steps were each 70% likely is a 17% failure path over five steps, not a tail risk.

Then read it back and ask whether it merits concern. If the trajectory is genuinely
implausible, you have gained confidence. If it is not, go to step 6.

### 5. Make the trade-off explicit

When two objectives conflict - revenue against organic reach, safety against conversion,
margin against growth - do not invent an exchange rate under time pressure. Enumerate the
configurations, drop the dominated ones, and argue only about the survivors.

```bash
node scripts/calc.js pareto options.json
```

Input shape: `examples/pareto.json`. Everything on the frontier is best at something,
and no analysis can pick between them; that choice is a values judgement and belongs to
whoever owns the values. Everything dominated is strictly worse than an available
alternative and can be dropped without argument.

This is the correct answer to "the paywall cost us free traffic". It did. That is a
point on the frontier, not a bug, and the question is whether it is the right point.

### 6. Pick a response from the menu

When a failure trajectory does merit concern, there are exactly five responses. Naming
them prevents the meeting from inventing a sixth that is really "hope":

1. **Change the action space.** Add an option that was not available - a smaller first
   tranche, a kill switch, a staged rollout.
2. **Change the objective.** If the plan trades away too much safety, the weights were
   wrong. Re-score and re-run.
3. **Change the dynamics.** Fix the mechanism that makes the failure possible - add the
   rate limit, the quota, the circuit breaker.
4. **Improve the analysis.** The model may be too coarse to see the real optimum. Refine
   it, at a cost in time.
5. **Do not deploy.** Always on the menu. A plan that is unsafe under a plausible
   trajectory should not ship because the quarter is ending.

## Output template

```markdown
## Assumptions the ranking depends on
<3-5 quantities we have not measured, each with a plausible alternative value>

## Scenario matrix
Unit: <the single quantity every cell is measured in>

| Option | base (w=) | adverse (w=) | favourable (w=) |
|---|---|---|---|

## Does the ranking survive
<paste calc robust>
best expected / best worst case / least regret: <do they agree?>
<if they disagree, state how much downside is being insured against, and decide>

## Most likely failure
<numbered chain, each step with its plausibility, joint probability at the end>
Cheapest link to break: <step, and the fix>

## Trade-off
<paste calc pareto: frontier and dominated options>
The choice among the frontier is a values judgement owned by <who>.

## Response
<one of: change the action space / change the objective / change the dynamics /
improve the analysis / do not deploy - with the concrete change>
```

## Gotchas

- **Robustness is about the ranking, not the numbers.** All options getting worse under a
  scenario is fine. The ranking flipping is the finding.
- **Scenarios must be plausible, not merely bad.** A scenario nobody believes drags
  maximin toward paralysis. Weight them and use the weights.
- **Do not optimize against the evaluation model.** Once you tune the plan to score well
  on your stress tests, they stop being tests. Keep the planning model simple and
  separate.
- **Pareto does not choose.** It removes the options nobody should defend. If someone
  asks the frontier to pick, they are asking to be relieved of a values decision.
- **Weight the frontier axes before enumerating,** not after seeing the results.
- **A premortem without a plausibility constraint produces theatre.** Unconstrained,
  people list asteroid strikes. Constrained to likely steps, they list the thing that
  actually happens.
- **The rare failure needs disproportionate evidence.** If the failure mode is rare, a
  clean test run is weak evidence that it is fixed. See the **valuing-information**
  skill's sizing reference for how many observations that actually takes.

## Reference

- `references/premortem.md` - running the most-likely-failure analysis, with the scoring rubric
- `references/robustness.md` - building the scenario matrix, choosing weights, reading disagreement between criteria

## Related skills

- **framing-decisions** produces the options this skill stresses
- **planning-horizons** for the plan itself
- **valuing-information** when the right response is to go and measure the assumption
- **learning-from-outcomes** when the failure has already happened

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/stress-testing-plans

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
