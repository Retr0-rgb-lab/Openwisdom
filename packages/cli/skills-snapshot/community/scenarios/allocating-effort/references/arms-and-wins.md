# Choosing arms and win events

## Contents

- What makes a valid arm
- What makes a valid win
- Weighting when payoffs differ in size
- Handling arms with different exposure
- When the bandit model is the wrong model

---

## What makes a valid arm

Four conditions. Break any of them and the allocation is arithmetic on incomparable
quantities.

**Mutually exclusive at the point of allocation.** Two arms that are really the same
effort counted twice will split the credit for a single underlying rate and both look
mediocre.

**Simultaneously available.** If arm C cannot start until arm A ships, this is a
sequencing problem, not an allocation problem. Use the **planning-horizons** skill.

**Stable enough to accumulate evidence.** If you rewrite the landing page every week,
the counts describe a sequence of different arms wearing the same name.

**Comparable in unit cost.** A bandit compares payoff *rates*. If one arm costs ten
times more per attempt, either normalize the win to a per-unit-cost basis or model the
cost explicitly in the win definition.

## What makes a valid win

The same event, for every arm, as close to money as you can measure quickly.

| Candidate | Verdict |
|---|---|
| paid conversion | best, if volume allows |
| trial start with a card on file | good proxy, correlates strongly |
| signup | acceptable when paid volume is too low to count |
| click | usually ranks arms differently from revenue - avoid |
| impression, view, "engagement" | not a win |

The trade-off is real: the closer to revenue, the fewer events, and therefore the
slower the posteriors separate. The resolution is not to move up the funnel; it is to
accept that a low-volume decision takes longer, and to say so rather than substituting
a fast proxy that ranks things wrong.

If you must use an upstream proxy, measure its correlation with the downstream event
once, on a single arm, and record it. An unvalidated proxy is a guess with a number
attached.

## Weighting when payoffs differ in size

The plain model assumes every win is worth the same. When they are not, convert before
counting. Two workable approaches:

**Value-scaled wins.** If arm A's average win is worth 500 and arm B's is worth 50,
express both in units of the smallest: A gets 10 win-units per conversion. The
posteriors then describe value rate rather than event rate. Note that this breaks the
binary assumption slightly - the beta posterior is now an approximation - which is
acceptable when the value spread within an arm is small compared to the spread between
arms.

**Two-stage.** Run the bandit on conversion rate, then multiply each arm's posterior
mean by its measured average value to rank by expected value per attempt. Cruder, but
transparent, and it keeps the uncertainty and the value estimate separable.

Whichever you pick, write down which one you used. Silently mixing them across
quarters makes the history uninterpretable.

## Handling arms with different exposure

Different exposure is fine - that is what the posteriors are for. An arm with 20
observations simply has a wider distribution than one with 2,000, and Thompson sampling
gives it exploration share proportional to how plausibly it is the best.

What is not fine is different *definitions* of exposure. "Losses" must mean the same
thing everywhere: attempts that did not convert. If one arm counts unique visitors and
another counts sessions, the rates are on different denominators and the comparison is
void. Check the denominators before the numerators.

## When the bandit model is the wrong model

Use something else when:

- **Arms interact.** Cannibalisation between two products, or a channel that only works
  because another one built awareness. The independence assumption fails and the
  allocation will be confidently wrong.
- **The payoff is one-shot.** A hiring decision or an acquisition is not an arm you
  pull repeatedly. Use **framing-decisions**.
- **The rate is drifting rather than fixed.** Seasonality, a platform algorithm change,
  a competitor's launch. Beta posteriors assume a stationary rate and will average the
  old world with the new. Use **tracking-beliefs**.
- **The real question is sequencing under a deadline.** Use **planning-horizons**.
