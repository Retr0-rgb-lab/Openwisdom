# Sizing a study

## Contents

- Standard error and what it buys
- Rare events: use the relative error
- Oversampling a rare segment (importance sampling)
- Stopping rules, and why peeking ruins the evidence
- Zero successes is not a rate of zero

---

## Standard error and what it buys

For a rate measured as `k` successes out of `n`:

```
SE = sqrt(p (1-p) / n)
```

and a 95% interval is roughly the estimate plus or minus `1.96 * SE`.

```bash
node scripts/calc.js precision --successes 47 --trials 900
```

The reported interval is a beta posterior interval rather than a normal approximation.
That matters at the edges: with 0 successes out of 500 the normal approximation gives a
zero-width interval at zero, which is nonsense, and the beta interval gives something
usable.

Because SE shrinks with the square root of `n`, **halving the error costs four times
the sample**. That is the single most useful fact for arguing about study size, and it
is why "let's run it a bit longer" is rarely the fix.

## Rare events: use the relative error

For small rates - churn on a good product, refund rate, dispute rate, incident rate,
conversion on cold traffic - the absolute standard error is misleading. What matters is

```
relative SE = SE / p
```

An absolute error of 0.0002 sounds tight. On an estimate of 0.0003 it means the true
value could be anywhere from roughly zero to double, which supports no decision at all.

```bash
# how many trials to measure a 0.2% rate to within 20% of itself
node scripts/calc.js samplesize --p 0.002 --rse 0.2
```

That returns about 12,500. Rare things need enormous samples, and quoting a rare rate
from a few thousand observations is a category error rather than a rounding issue.

## Oversampling a rare segment

When the event is rare but you can deliberately over-recruit the cases that produce it,
sample from a biased distribution and reweight. Each observation drawn under the biased
scheme carries weight `P(true)/P(proposal)`, and the estimate stays unbiased.

```bash
node scripts/calc.js importance --true-rate 0.002 --proposal-rate 0.1 --n 10000
```

Commercially this is: to learn about churners, recruit churners rather than a random
sample of users, then weight their answers down by how over-represented they are. Same
for refunds, disputes, and support escalations. The gain is often one to two orders of
magnitude in effective sample size.

Two conditions, both mandatory:

- The proposal distribution must assign non-zero probability to everything the true
  distribution can produce. If you only interview churners, you cannot say anything
  about retained users, at any weight.
- You must actually apply the weights. Reweighting is the step that gets skipped, and
  skipping it converts a clever design into a badly biased sample.

## Stopping rules, and why peeking ruins the evidence

Decide `n` before starting and stop there. Checking a running test and stopping when it
looks good is optional stopping: it manufactures apparent effects out of noise, because
a random walk crosses any fixed threshold eventually if you keep watching.

If you must be able to stop early, use the posterior directly rather than a p-value:

```bash
node scripts/calc.js compare arms.json
```

That reports `P(A beats B)` from the beta posteriors. A decision rule of "stop when
`P(A > B)` exceeds 0.95" is defensible under continuous monitoring in a way that a
repeatedly-checked significance test is not, because the posterior is a statement about
current belief rather than a long-run error rate.

The honest framing: a lead of 70% probability is a lead, not a winner. The tool prints a
warning for leads between 50% and 90% for exactly this reason.

## Zero successes is not a rate of zero

Zero conversions in 40 visits does not mean the conversion rate is zero. With a uniform
prior the posterior is Beta(1, 41), with a mean near 2.4% and an upper bound around 7%.

This matters because killing a product, channel or feature after a handful of
observations is the most common expensive mistake in a portfolio, and it is always
justified by a point estimate that the data does not support. The **allocating-effort**
skill flags arms with too few observations to judge, for the same reason.

Rule of thumb: below about 30 observations you have not measured anything, you have
merely started.
