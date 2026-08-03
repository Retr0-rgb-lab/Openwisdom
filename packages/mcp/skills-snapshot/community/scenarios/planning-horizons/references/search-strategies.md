# Search strategies, and their planning equivalents

## Contents

- Why the mapping is useful
- Forward search
- Branch and bound
- Sparse sampling
- Rollout with lookahead
- Monte Carlo tree search
- Hybrid: offline value, online search
- Which to use

---

## Why the mapping is useful

Each of these is a way of exploring "what happens if we do X, then Y, then Z" under a
compute budget. Every one of them has a direct counterpart in how teams actually plan,
and naming the counterpart tells you what its failure mode is.

## Forward search

Expand every action and every possible consequence to depth `d`.

**Planning equivalent:** the exhaustive scenario matrix. Every option crossed with every
market condition, to several steps.

**Cost:** `(states x actions)^d`. It explodes immediately. A three-option decision with
three outcomes each, to depth four, is over 6,000 branches, which is why the exhaustive
matrix is always abandoned halfway.

**Use when:** depth 2, few options, and you want completeness on a decision that
warrants it.

## Branch and bound

Forward search plus pruning: hold an optimistic upper bound per option and a realized
lower bound for the incumbent. When an option's upper bound falls below the incumbent's
lower bound, drop it unexamined.

**Planning equivalent:** the backlog triage in the main workflow. "Even if this went
perfectly it would contribute less than what we already have running."

**Why it works commercially:** optimistic ceilings are usually easy to estimate and
usually crude, and crude is enough - a ceiling only has to be an upper bound to be valid.
Tighter bounds prune more, so honest ceilings pay for themselves twice.

**The one rule:** the ceiling must genuinely be an upper bound. An expected value in the
ceiling column will prune options that would have won.

## Sparse sampling

Instead of branching on every possible consequence, sample a fixed number `m` of them
per action.

**Planning equivalent:** "let's consider three representative scenarios rather than
enumerating everything." Complexity stops depending on how many futures exist and starts
depending on how many you chose to consider.

**Use when:** the space of outcomes is large or continuous - which is most commercial
planning. It is the pragmatic default for scenario work.

**The failure mode:** three scenarios that are all mild. Sampling only from the middle of
the distribution produces a plan that is robust to nothing. Deliberately include a tail
scenario; the **stress-testing-plans** skill exists for that.

## Rollout with lookahead

For each first action, simulate forward using a simple default policy and average the
result. Pick the action with the best average.

**Planning equivalent:** "if we did X and then just carried on as we normally do, where
would we be in six months?"

**Why it is underrated:** the default policy does not have to be good. Acting greedily
with respect to rollout values reliably beats the rollout policy itself, so a crude
"business as usual" simulation is enough to improve on business as usual. It is the
cheapest planning method with a real guarantee behind it, and no team does it.

## Monte Carlo tree search

Run many simulations from the current state, keeping a value estimate and a visit count
per action, and select using an exploration bonus - the same UCB1 formula the
**allocating-effort** skill uses. Effort concentrates on the promising branches without
ever fully abandoning the others.

**Planning equivalent:** iterative planning where you deepen the analysis of the options
that keep looking good, while occasionally revisiting a discarded one. It is what good
strategy work looks like when done well and what it never looks like when done as a
one-pass document.

**Use when:** the decision is important, the horizon is long, and you have several
planning sessions rather than one.

## Hybrid: offline value, online search

Search shallowly online, and use a value estimate learned offline for whatever lies past
the search depth.

**Planning equivalent:** short-horizon planning against durable heuristics - "we do not
model past six months, and past six months we assume a customer is worth roughly this."
The heuristic came from history and does the work the search cannot afford.

This is what most competent operators do implicitly. Making it explicit lets you argue
about the terminal value separately from the plan, which is usually where the
disagreement actually lives.

## Which to use

| Situation | Strategy |
|---|---|
| Long backlog, most items obviously weak | branch and bound |
| Handful of options, two steps deep, high stakes | forward search |
| Large or continuous outcome space | sparse sampling, with a tail scenario |
| Need a fast answer, have a default policy | rollout with lookahead |
| Important, long horizon, multiple sessions available | tree search |
| Short horizon plus a durable long-run estimate | hybrid |
