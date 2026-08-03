# Inferring what a competitor optimises

## Contents

- Why this comes first
- The method
- Candidate objectives and their signatures
- Evidence sources, ranked by weight
- Common misreadings
- Cloning what works

---

## Why this comes first

A best response is a response to a *payoff*. Compute it against the wrong payoff and
every downstream conclusion is wrong, confidently.

The general form of the problem is inverse reinforcement learning: given observed
behaviour, recover the reward function that makes it optimal. You do not need the
algorithm, only its premise - **behaviour reveals the objective more reliably than
statements do.** A company's blog says what it wants you to believe; its pricing page,
hiring and shipping order say what it is optimising.

## The method

1. **List their last five to eight visible moves,** with dates. Launches, price changes,
   hires, deprecations, partnerships, marketing shifts.
2. **For each candidate objective, ask whether all of those moves are sensible at once.**
   Not most. All. An objective that explains four of six is probably not the objective.
3. **Prefer the simplest objective that fits.** With a handful of observations, an
   elaborate multi-objective story is overfitting and will predict badly.
4. **Predict their next move from the surviving objective, and write it down.** Check in a
   quarter. This is the only way to find out whether your read is any good.

Step 4 is what separates this from speculation, and it is what the
**learning-from-outcomes** skill grades.

## Candidate objectives and their signatures

| Objective | Signature in observed behaviour |
|---|---|
| Profit | prices rise over time; unprofitable segments dropped; hiring tracks revenue |
| Growth at any cost | free tiers; heavy paid acquisition; headcount ahead of revenue; land-grab pricing |
| Logo count | tiny entry price; case studies over margin; enterprise pilots given away |
| Acquisition in 12-24 months | integrations with likely acquirers; conference presence over product; metrics theatre |
| Category definition | analyst relations; heavy content and standards work; naming the category in every release |
| Defending an adjacent business | the product is free or near-free; it exists to protect something else |
| Founder preference | moves that make sense only aesthetically; a rewrite with no commercial trigger |

The last row is real and underrated in small markets. A competitor run by one person may
be optimising for what is interesting to build, which makes them unpredictable on price
and predictable on technology.

## Evidence sources, ranked by weight

Heavier evidence first. The ranking matters because weak evidence, repeated, feels like
strong evidence.

1. **Price changes.** The single strongest signal. Nobody changes price casually.
2. **What they deprecated.** Killing a feature reveals what they decided was not worth
   maintaining, which is a sharper statement than anything they launched.
3. **Hiring.** Job posts are a public, dated, costly commitment to a direction. Enterprise
   sales hires and self-serve growth hires imply different games.
4. **Shipping order.** What they built first, when everything is a priority in the
   roadmap, is what they actually prioritise.
5. **Where they spend on acquisition.** Paid channels are metered and therefore honest.
6. **Public statements.** Weakest. Directionally useful, routinely aspirational.

A note on funding: a raise is evidence about constraints rather than objectives. It
raises the plausibility of growth-at-any-cost by relaxing the budget, but it does not
establish it. Look at what they did with the money.

## Common misreadings

**Assuming they are rational and informed.** They may not have noticed you. They may be
working from bad data. A small competitor often has no model of you at all.

**Assuming their costs match yours.** A rival with a lower cost base can price where you
cannot, and it is not aggression, it is arithmetic. Estimate their cost structure before
concluding that a price is predatory.

**Reading a one-off as a strategy.** A single discount may be one deal, one salesperson,
one quarter-end. Wait for the second instance before modelling it as policy.

**Projecting your own objective onto them.** The most common error, and the hardest to
see from the inside. If your analysis concludes they are optimising exactly what you
optimise, treat that as a warning rather than a finding.

**Treating silence as weakness.** A competitor who has shipped nothing visible for six
months may be rebuilding, may be dying, or may be selling. Those imply opposite
responses, and the distinction is worth an observation.

## Cloning what works

The flip side of inferring an objective is copying a *policy*. When a competitor
demonstrably does something well - an onboarding flow, a pricing structure, a content
engine - cloning the observed behaviour is a legitimate and fast starting point.

Two cautions, both from how imitation learning actually behaves:

**A cloned policy fails off the demonstrated path.** You observe what they do in the
situations they end up in, which are not the situations you end up in. The clone will be
weakest exactly where your circumstances differ from theirs, and those differences are
invisible in the observed behaviour.

**Get feedback on your own path, not theirs.** The fix is to seek advice about the
situations you are actually in rather than generic best practice. Concretely: ask an
advisor about your specific funnel and your specific numbers, not about how onboarding
should work in general. Advice sampled from your own trajectory is worth far more than
advice sampled from theirs.
