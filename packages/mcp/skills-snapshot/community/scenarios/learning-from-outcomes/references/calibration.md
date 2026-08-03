# Reading the calibration output

## Contents

- The four numbers
- Reading the bin table
- Fixing overconfidence
- How many predictions you need
- Writing predictions that can be scored
- What good looks like

---

## The four numbers

**Brier score.** Mean squared error between your stated probability and what happened.
0 is perfect, 0.25 is what you get by always saying 50%, 1 is perfectly wrong. Lower is
better.

**Uncertainty (always-base-rate).** `p(1-p)` at the base rate: what you would have scored
by ignoring the specifics of each case and quoting the base rate every time.

**Skill versus base rate.** Uncertainty minus your Brier score. **If this is negative,
your case-by-case judgment is worse than the base rate**, and the correct response is to
quote base rates on this class of question until it turns positive. This is
uncomfortable and it is the most valuable single number in the output.

**Reliability.** How far your stated probabilities sit from observed frequencies,
weighted by how often you use each. Above about 0.02 means a systematic bias rather than
noise, and the verdict line tells you which direction.

## Reading the bin table

```
stated range  n   you said  actually happened  gap
0.8-1         5   0.89      0.6                0.29
0.6-0.8       4   0.68      0.5                0.18
0.4-0.6       2   0.5       0.5                0
0.2-0.4       1   0.3       0                  0.3
```

Read the **gap** column. Positive means you said it was more likely than it turned out to
be.

The pattern above is textbook overconfidence, concentrated in the high bins. It is the
common finding, and the high bins are where it costs the most: an 89% claim that comes
true 60% of the time is the one people commit budget against.

The opposite pattern - consistently negative gaps - is underconfidence. It is rarer and
it has its own cost: hedging on things you actually know delays decisions and invites
others to overrule you.

A bin with one or two entries tells you nothing. Ignore it until it fills.

## Fixing overconfidence

**Shade your numbers.** If your 90% claims come true 70% of the time, say 70%. Crude,
immediate, and it works from the next prediction onward.

**Widen the top and bottom.** Reserve 95% and above for things you would bet heavily on,
and notice how rarely that is true of a business forecast.

**Name the reference class out loud.** "This is the fourth time we have rebuilt a landing
page. The first three took twice the estimate." Overconfidence usually comes from
reasoning about the specific case in isolation, and the reference class is the correction.

**Predict the failure first.** Before stating a probability, describe the most likely way
the thing does not happen. If you cannot describe one, your probability is too high, and
you have just discovered that you were not modelling failure at all.

## How many predictions you need

| Count | What you can say |
|---|---|
| under 10 | nothing; the numbers are noise |
| 10-25 | a direction, if the bias is large |
| 25-50 | a reliable verdict on over- or underconfidence |
| 50+ | per-bin calibration you can actually correct against |

At roughly three to five predictions per decision record and one or two records a week,
a quarter gets you into the useful range. That is the practical argument for putting
probabilities on everything: not because each one matters, but because the count is what
makes the correction possible.

## Writing predictions that can be scored

**Binary and dated.** "Weekly signups exceed 60 by 2026-09-30." Not "signups improve."

**Resolvable without judgment.** If two reasonable people could disagree about whether it
happened, it was not a prediction. Name the source: which dashboard, which query.

**Genuinely uncertain.** Predictions at 99% and 1% do not train calibration. The
informative range is 20% to 80%, and a log full of near-certainties is a log that will
score well and teach nothing.

**About the world, not about effort.** "We ship X" is partly under your control and
partly a promise. "Shipping X raises activation above 40%" is a claim about the world.
Both are worth recording; only the second trains judgment.

## What good looks like

A well-calibrated forecaster on business questions:

- Brier score meaningfully below the always-base-rate number
- Gaps under 0.1 in every bin with enough entries to count
- Uses the full range, including the 30-40% band, rather than clustering at 70-90%
- Occasionally states a low probability for something that then happens, and does not
  treat that as a failure

That last point matters. Being wrong at 20% is not a miss; it is what 20% means. A log
in which every low-probability prediction failed to happen is a log of predictions that
were never really uncertain.
