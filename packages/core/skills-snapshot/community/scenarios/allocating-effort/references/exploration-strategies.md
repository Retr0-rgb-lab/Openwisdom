# Exploration strategies

## Contents

- The default and why
- Thompson sampling
- UCB1
- Quantile
- Greedy
- Epsilon-greedy, and why the floor replaces it
- Optimism for the untried (R-MAX)
- Choosing the observation threshold m

---

## The default and why

Thompson sampling, unless you have a specific reason otherwise. It has no free
parameters to tune, its allocation has a direct interpretation, and it performs at or
near the best of the alternatives across a wide range of problems. Strategies with a
tuning constant require you to pick that constant, and the choice is rarely defensible.

## Thompson sampling

Also called posterior sampling or randomized probability matching.

Draw one sample from each arm's posterior, pull the arm with the largest draw. Repeat.
Over many draws, an arm's share converges to the probability that it is the best arm.

That property is what makes it easy to explain to someone who does not want to hear
about bandits: *"product C gets 53% of the hours because there is a 53% chance it is
our best product."*

Trade-off: it is stochastic, so two runs give slightly different numbers. Pass `--seed`
when you need a stable figure to put in a document.

## UCB1

Score each arm by its posterior mean plus an exploration bonus:

```
mean + c * sqrt(log N / N_a)
```

where `N_a` is that arm's observation count and `N` the total. The bonus is large for
under-tried arms and shrinks as evidence accumulates. It is deterministic, which makes
it the right choice when you need a ranking that reproduces exactly and can be
recomputed by hand in a review.

`c` controls how much exploration you buy. `c = 1` is a reasonable start when the win
rate lives in [0,1]. Larger `c` explores more. There is no principled way to pick it
without simulating your own problem, which is the main argument against UCB1 here.

The same formula appears inside Monte Carlo tree search as the node selection rule -
it is the same exploration problem in a different wrapper.

## Quantile

Rank by the alpha-quantile of each posterior rather than the mean: with `--alpha 0.9`,
each arm is scored by the value it would beat 90% of the time.

This is optimism under uncertainty made explicit, and it is the easiest strategy to
defend in a meeting because the number means something concrete: "the plausible best
case for this arm". Values of alpha above 0.5 explore; higher explores more.

## Greedy

Always the highest posterior mean. Pure exploitation, no exploration.

Correct only when you have genuinely stopped learning - the arms are well separated,
the observation counts are large, and the period is short enough that the world will
not change. In practice that is the end of a campaign, not the start of a quarter.

Using greedy early is the classic expensive mistake: it locks onto whichever arm got
lucky first and never gathers the evidence that would overturn it.

## Epsilon-greedy, and why the floor replaces it

Epsilon-greedy takes a random arm with probability epsilon and the best arm otherwise.
It is simple and it is undirected: it explores a hopeless arm exactly as often as a
promising under-tried one, because it ignores what previous outcomes said.

For budget allocation the same protection is better expressed as `--floor`: a minimum
share of the budget reserved for every arm. It is a line in the plan rather than a coin
flip, which makes it reviewable, and it composes with a directed strategy so the rest
of the budget still goes where the evidence points. Default 5%.

## Optimism for the untried (R-MAX)

Any arm with fewer than `m` observations is treated as maximally promising until it has
had its `m` attempts. The output lists these separately under "too little evidence to
judge".

The purpose is narrow and important: **it stops you cutting things you have not tested.**
Killing a channel after 14 attempts, on the evidence of zero conversions, is a decision
made on noise, and it is the single most common expensive error in a multi-product
portfolio. The optimism buys a bounded amount of exploration in exchange for not making
that error.

## Choosing the observation threshold m

`--m` sets how many observations an arm needs before its estimate is treated as
meaningful. Default 30.

| Situation | m |
|---|---|
| win rate expected around 10% or higher | 30 |
| win rate expected around 1-5% | 200 |
| rare event, under 1% | use the **valuing-information** skill's sizing calculator |

The rule behind the table: you need enough expected *wins*, not enough attempts. Roughly
5 to 10 expected wins before an estimate is worth arguing about. At a 1% rate that is
500 to 1,000 attempts, and pretending otherwise does not make it fewer.
