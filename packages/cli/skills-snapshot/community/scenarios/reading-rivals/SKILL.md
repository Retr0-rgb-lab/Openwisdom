---
name: reading-rivals
description: "Models what a competitor will do next and what happens if you respond - best response, equilibrium, and the difference between a rival who optimises perfectly and one who does not. Use before a price change or price war, when a competitor launches something, when deciding whether to match a rival's move, when analysing a market with few players, or when someone asks \"what will they do if we do this\"."
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
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/reading-rivals"
---


# Reading rivals

The mistake is treating a competitor's behaviour as weather. It is not: they respond to
you. A move evaluated against their *current* behaviour is evaluated against a world
that will not exist once you make the move.

Three questions, in this order:

1. What are they actually optimising? (usually not what you assume)
2. What is their best response to our move?
3. Where does the exchange of responses end up, and is that end state acceptable?

Question 3 is the one people skip, and it is where price wars come from.

## Workflow

```
- [ ] 1. Infer what they optimise, from what they have done
- [ ] 2. Build the payoff table for the moves in play
- [ ] 3. Check for a dominant strategy and an equilibrium
- [ ] 4. Check whether responses cycle
- [ ] 5. Adjust for the fact that they are not perfectly rational
- [ ] 6. Decide whether to play the game or change it
```

### 1. Infer what they optimise

Do not assume they maximise profit. Observed behaviour reveals the objective, and a
rival funded for growth, optimising for logo count, or run by someone who wants to sell
in eighteen months will make moves that look irrational against a profit objective and
are perfectly rational against theirs.

Method: list their last five or six visible moves and ask which objective makes all of
them sensible at once. See `references/inferring-objectives.md`. Getting this wrong makes
every subsequent step wrong, because you will be computing best responses to the wrong
payoff.

### 2. Build the payoff table

Two players, two to three moves each. Larger tables are not more accurate, only harder
to fill in, and every cell you cannot source is a number you invented.

```json
{
  "players": ["us", "rival"],
  "actions": { "us": ["hold", "cut"], "rival": ["hold", "cut"] },
  "payoffs": {
    "hold|hold": [100, 100], "hold|cut": [55, 130],
    "cut|hold":  [130, 55],  "cut|cut":  [70, 70]
  }
}
```

Payoffs are annual profit contribution, same unit for both players. Estimate theirs from
their pricing, their headcount, and public signals; it will be rough, and rough is enough
because the structure usually determines the answer rather than the exact numbers.

Sanity check: perturb every payoff by 20% and re-run. If the conclusion changes, your
answer is coming from your guesses about their business rather than from the strategic
structure, and you should say so.

### 3. Dominant strategy and equilibrium

```bash
node scripts/calc.js game market.json
```

Input shape: `examples/game.json`. Read in this order:

- **Dominant strategy** - a move that is best whatever they do. Rare, and decisive when
  present. If you have one, play it and stop analysing.
- **Pure Nash equilibrium** - a pair where neither side gains by moving alone. This is
  where the exchange settles. The prisoner's dilemma structure, in which both sides cut
  and both end up worse than if both had held, is extremely common in pricing and it is
  worth recognising by name.
- **No pure equilibrium** - the interaction is inherently unstable and the sensible play
  is mixed, meaning unpredictable. Do not be reliably matchable.

### 4. Do responses cycle?

The tool runs iterated best response and reports whether it settles or cycles.

A cycle is a real finding, not a failure of the method. **In pricing, a cycle is a price
war**: each side responds to the last move, nobody reaches a stable position, and the
joint payoff falls with every round. If the tool reports a cycle, the answer is almost
never to play the first move faster.

### 5. They are not perfectly rational

Nash equilibrium assumes every player computes the equilibrium and believes the others
will too. Real competitors do not, for good reasons: which equilibrium is unclear when
there are several, the computation is hard, and even a rival who could do it may doubt
that you can.

The level-k model captures this. Level 0 acts arbitrarily; level 1 responds to level 0;
level 2 responds to level 1. Most commercial actors operate at level 1 or 2.

```bash
node scripts/calc.js game market.json --level 1 --lambda 2
```

If you have observed history, `observedCounts` in the input file computes the best
response to their empirical action frequencies. That is usually a better forecast than
the equilibrium: a rival who has held price nine times out of eleven will probably hold
again, whatever the equilibrium says.

### 6. Play the game, or change it

If the equilibrium is bad for both of you, the winning move is usually not a better move
inside the game. It is a different game. Options, roughly in order of how often they
work:

- **Change the axis.** Compete on something where your payoffs differ - segment,
  distribution, integration depth, speed. A prisoner's dilemma on price is not a
  prisoner's dilemma on positioning.
- **Change the payoffs.** Long contracts, switching costs and bundles alter the cells,
  and altering the cells is worth more than playing the existing ones well.
- **Change the information.** Being visibly committed to a position - published pricing,
  a public guarantee - removes your own option to cut and can make holding credible for
  both sides.
- **Accept the equilibrium and be efficient.** If cutting is dominant for both, the
  market is heading to a lower price and the winner is whoever gets there with the lower
  cost base. Plan for that rather than pretending otherwise.

## Output template

```markdown
## What they optimise
<the objective that makes ALL their recent moves sensible at once>
Evidence, heaviest first: <price changes, deprecations, hiring, shipping order>
Falsifiable prediction: <their next move, with a date and a probability>

## Payoff table
Unit: <annual profit contribution, same for both players>

|  | rival A | rival B |
|---|---|---|
| **us A** | x, y | x, y |
| **us B** | x, y | x, y |

Sensitivity: perturbing every cell by 20% <does | does not> change the conclusion.

## Structure
<paste calc game>
Dominant strategy: <...>  Pure Nash: <...>  Iterated best response: <settles | cycles>
Shape: <prisoner's dilemma | feature race | coordination | land grab | asymmetric>

## Near-term forecast
<from observed frequencies, not from the equilibrium, with a probability>

## Recommendation
<play the game, or change it: which axis, which payoffs, which information>
```

## Gotchas

- **Zero-sum framing is usually wrong.** Most software markets are growing, so both
  players can gain. Assuming zero-sum manufactures aggression that the payoffs do not
  support. Check whether your table actually sums to a constant before reasoning as if it
  does.
- **Do not assume they optimise profit.** See step 1. Getting the objective wrong makes
  every best response wrong.
- **Equilibrium is a prediction of the destination, not the route.** It says where an
  exchange of responses ends, not what they do next quarter. For "next quarter", use
  observed frequencies.
- **Iterated best response can cycle, and the cycle is the finding.**
- **A visible payoff table changes the game.** If your analysis leaks, you have handed
  them your reasoning. Treat it as confidential in the ordinary way.
- **Two players is a modelling choice.** If the market has five real players, a two-player
  table can still be useful with "everyone else" as the second player, but say that is
  what you did.
- **Small players are not always playing.** A rival with 2% share may not be modelling you
  at all. Modelling them as a strategic actor overstates the threat and can trigger
  responses that create a competitor where there was none.

## Reference

- `references/inferring-objectives.md` - reading an objective from observed behaviour
- `references/market-structures.md` - the recurring game shapes in software markets, and what each implies

## Related skills

- **framing-decisions** for the move itself, once you know how they will respond
- **stress-testing-plans** to check the plan against their most damaging plausible response
- **tracking-beliefs** for updating your model of them as they act

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/reading-rivals

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
