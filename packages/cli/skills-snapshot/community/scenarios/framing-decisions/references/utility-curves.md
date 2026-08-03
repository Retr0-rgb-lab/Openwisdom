# Choosing and defending a utility form

## Contents

- Why not just use expected value
- The forms, and when each is right
- Eliciting a utility when nobody agrees
- Certainty equivalent and risk premium
- Multiple objectives

---

## Why not just use expected value

Expected monetary value is the right criterion only when the stake is small relative
to the bankroll. Someone maximizing expected monetary value would never buy insurance,
because insurance has negative expected value by construction. They buy it anyway, and
they are right to, because the utility of money is concave: the last unit of cash
before insolvency is worth far more than the marginal unit above comfort.

Bentham put it plainly in 1802: "the excess in happiness of the richer will not be so
great as the excess of his wealth." The modern statement is diminishing marginal
utility, and it is why a curved utility is not a fudge factor.

## The forms

Set with `--utility <form>` and, where relevant, `--lambda <n>`.

### linear

`U(x) = x`

Risk neutral. Correct when the worst outcome in the table is a rounding error against
the bankroll. Use it as the default for operational decisions under, say, a month of
revenue.

### log

`U(x) = log x`

Constant relative risk aversion of 1. The right default whenever the downside touches
runway. Its defining property: you care about *proportional* changes, so halving cash
hurts exactly as much as doubling it helps. That is close to how operators actually
behave, and it is famously the growth-optimal criterion for repeated bets.

Requires strictly positive values. If an outcome is a negative position, shift the
whole table by a constant rather than switching to linear.

### power

`U(x) = (x^(1-lambda) - 1) / (1 - lambda)`

CRRA with an adjustable coefficient; `lambda -> 1` recovers log, `lambda = 0` recovers
linear. Use when you want to argue explicitly about how risk averse to be. `lambda = 2`
to `3` is common in finance for individual wealth.

### exponential

`U(x) = 1 - e^(-lambda x)`

Constant *absolute* risk aversion: you would take the same absolute gamble whether you
had 10k or 10m, which is not how anyone behaves. Mathematically convenient, so it shows
up in the literature, but it is a poor model of wealth and it saturates numerically for
large values. The calculator will tell you when it has saturated rather than silently
returning infinity.

### quadratic

`U(x) = lambda*x - x^2`

Only monotone below `x = lambda/2`. Above that it says more money is worse. Included
for completeness; do not use it for money.

## Eliciting a utility when nobody agrees

The standard procedure, and the one that avoids anchoring:

1. Fix the **best** outcome in the table at utility 1 and the **worst** at 0.
2. For each remaining outcome S, find the probability `p` at which you are indifferent
   between S for certain and a lottery paying the best outcome with probability `p`
   and the worst with `1-p`.
3. That indifference probability *is* `U(S)`.

Doing this out loud with two people who disagree usually locates the disagreement
precisely, because they will name different indifference points for the same outcome.

## Certainty equivalent and risk premium

The calculator reports both, and they are the numbers to quote to a non-technical
reader:

- **Certainty equivalent** is the guaranteed amount you would swap the gamble for.
- **Risk premium** is expected value minus certainty equivalent - what your risk
  aversion is costing you, in currency.

A large risk premium on the winning action is a prompt, not a verdict: it means there
may be value in buying down the variance (a pilot, a smaller first tranche, a hedge)
rather than in changing the action.

## Multiple objectives

If you genuinely have two objectives that cannot be collapsed into one scale - revenue
and organic reach, speed and safety - do not invent exchange rates under time pressure.
Enumerate the options, drop the dominated ones, and argue only about the survivors.
That is the **stress-testing-plans** skill's Pareto workflow.
