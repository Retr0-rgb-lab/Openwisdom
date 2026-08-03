# Noise models by metric

## Contents

- Measuring your own noise floor
- Typical noise by metric
- Process variance versus observation variance
- When the noise model itself breaks
- Setting alert thresholds that do not cry wolf

---

## Measuring your own noise floor

The reliable method, and it takes ten minutes:

1. Pick a past period that is definitively closed - a month from six months ago.
2. Pull the metric for that period from your dashboard **today**.
3. Compare it to the value the dashboard reported for that same period **at the time**.

The difference is pure observation noise: nothing about that period changed, only the
data did. Repeat for six periods and take the standard deviation. That number is your
`observationVar`, measured rather than guessed, and it is almost always larger than
people expect.

If the two numbers are identical, your dashboard does not backfill, which is itself worth
knowing - it means late-arriving events are being silently dropped rather than corrected.

## Typical noise by metric

Starting points, to be replaced by the measurement above. Expressed as the coefficient
of variation on a weekly reading for a small business.

| Metric | Typical weekly noise | Dominant source |
|---|---|---|
| Settled revenue | 3-8% | settlement lag, refunds, disputes, annual plan lumpiness |
| Recognised MRR | 1-3% | mid-cycle upgrades, proration, currency |
| Signups | 5-15% | day-of-week, referral spikes, bots |
| Organic sessions | 10-20% | crawler traffic, ad blockers, search volatility |
| Paid conversion rate | 15-30% at low volume | small denominators dominate everything |
| Support tickets | 20-40% | one unhappy customer files five |
| Churn rate | 30%+ at small scale | rare event on a small base |

The pattern: the closer to money and the larger the denominator, the quieter. Conversion
rate and churn at small scale are almost pure noise week to week, and any process that
reacts to them weekly is reacting to nothing.

## Process variance versus observation variance

**Observation variance** is how much the reading moves when the world did not. Measured
by the backfill method above.

**Process variance** is how much the true level genuinely drifts per period. Harder to
measure directly; estimate it from a long stable stretch by taking the total variance of
the differenced series and subtracting the observation variance you measured.

The ratio is what determines the filter's behaviour:

| Ratio | Filter behaviour | Correct when |
|---|---|---|
| process >> observation | tracks readings closely | metric genuinely moves fast, measurement is clean |
| process ~ observation | moderate smoothing | most business metrics |
| process << observation | heavy smoothing, ignores single readings | rare events, small denominators |

If you supply neither, the tool splits the differenced variance evenly and tells you it
guessed. That is deliberately conservative and it is fine for a first pass.

## When the noise model itself breaks

Reset the filter after any of these. Continuing with old variances after a measurement
change produces a filter that is confidently wrong, which is worse than no filter.

- analytics migration, or a change in bot filtering
- a new payment provider, or a change in settlement timing
- a pricing change that alters plan mix and therefore lumpiness
- a change in what counts as a signup or an active user
- any material change in traffic mix - paid traffic and organic traffic have different
  noise characteristics

The dangerous case is the silent one: someone changes a filter in the analytics config
and the level shifts by 8%, which the filter faithfully reports as a real move. Keep a
changelog of measurement changes next to the metric, and check it before investigating
any level shift.

## Setting alert thresholds that do not cry wolf

A threshold inside the noise band fires constantly and gets muted, which is worse than
no alert.

The rule: alert on **magnitude times probability that it matters**, not on the raw level.
Concretely, alert when a reading falls outside the filter's predictive interval **and**
the implied change in the underlying level would change a decision.

A move of two standard deviations that would change nothing you do is not worth waking
anyone. A move of one standard deviation in a metric that gates a launch decision is.
This is the same prioritisation used to decide which parts of a model to recompute
first: change in value, weighted by the probability it propagates to something you care
about.

Practical form:

- **page someone** when the filter flags a surprise in a metric that gates an active
  decision
- **note it in the weekly review** when the filter flags a surprise elsewhere
- **do nothing** when the reading is inside the band, however dramatic the percentage
  looks on the dashboard
