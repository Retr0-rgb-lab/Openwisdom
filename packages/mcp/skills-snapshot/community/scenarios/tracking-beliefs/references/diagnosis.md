# Standard explanation sets

## Contents

- How to use these
- Organic traffic drop
- Revenue drop
- Conversion rate drop
- Signup drop with flat traffic
- Building your own set

---

## How to use these

Each set is a starting prior plus the evidence that discriminates between the
explanations. Adjust the priors to your own history - the numbers here are for a small
software business with an organic acquisition channel, and yours will differ.

Two rules that make these worth having:

1. **Enumerate before investigating.** Pick the set, adjust priors, and only then go and
   look. Investigating first and building the set afterwards is confirmation bias with
   extra steps.
2. **Never zero out an explanation.** "Our tracking broke" at probability zero means you
   will never diagnose a tracking break, and tracking breaks are common.

## Organic traffic drop

| Explanation | Prior | The evidence that discriminates |
|---|---|---|
| Measurement change | 0.30 | other channels moved too; the drop is a clean step, not a slope; a config change is in the changelog |
| Search algorithm update | 0.25 | ranking positions moved for tracked terms; competitors moved too; industry chatter dated to the same day |
| Seasonality | 0.20 | same shape at the same point last year |
| Ranking loss on specific pages | 0.15 | concentrated in a handful of URLs rather than sitewide |
| Technical regression | 0.10 | crawl errors, a robots change, a slow response time regression, a deploy on the same date |

**The single most discriminating observation:** is the drop concentrated in a few URLs
or spread across the site? Concentrated points hard at ranking loss; sitewide points at
measurement or algorithm. Get that split before anything else - it is cheap and it
roughly halves the hypothesis space.

**The trap:** a sitewide drop that is really a measurement change looks exactly like an
algorithm update for the first week. Check the changelog before writing the strategy
memo.

## Revenue drop

| Explanation | Prior | The evidence that discriminates |
|---|---|---|
| Timing and settlement lag | 0.30 | the gap closes when you re-read the same period a week later |
| Churn increase | 0.20 | cancellation count is up; cohort retention curves bent |
| New sales fell | 0.20 | signup and trial counts fell first, with the right lag |
| Plan mix shifted | 0.15 | count of customers flat, average revenue per customer down |
| Payment failures | 0.10 | involuntary churn up; card decline rate up; a processor incident |
| Refunds or disputes | 0.05 | gross flat, net down |

**The single most discriminating observation:** did the customer *count* move, or the
revenue *per customer*? They point at completely different causes and the split is free
to compute.

**The trap:** annual plans make monthly revenue lumpy in a way that looks like churn.
Check the renewal calendar before diagnosing anything.

## Conversion rate drop

| Explanation | Prior | The evidence that discriminates |
|---|---|---|
| Traffic mix changed | 0.35 | volume moved at the same time; the shift is concentrated in one source |
| Small denominator, no real change | 0.25 | run the filter; the move is inside the band |
| Funnel regression | 0.20 | a step-level drop-off moved; a deploy on the same date |
| Price or packaging change | 0.10 | timing lines up with a pricing release |
| Competitive pressure | 0.10 | shows up gradually, not as a step |

**The single most discriminating observation:** segment by traffic source. A conversion
rate is a weighted average, and it moves whenever the weights move even if every segment
is unchanged. This is the most common false alarm in the whole list.

## Signup drop with flat traffic

| Explanation | Prior | The evidence that discriminates |
|---|---|---|
| Signup flow regression | 0.35 | error rates; a deploy date; browser or device concentration |
| Traffic quality shifted | 0.25 | landing page mix changed; bounce rate moved |
| Tracking on the signup event broke | 0.20 | database count and analytics count disagree |
| Messaging or page change | 0.15 | a content release on the same date |
| Seasonality | 0.05 | same shape last year |

**The single most discriminating observation:** compare the count in your own database
against the count in analytics. If they disagree, it is tracking, and you can stop.

## Building your own set

Four steps, once per recurring metric:

1. **Mine your own history.** Go through the last ten times this metric moved and record
   what it actually turned out to be. That distribution is your prior, and it will
   surprise you.
2. **Make the explanations exclusive and exhaustive.** Add a catch-all "something else"
   with a real, non-zero prior. It will fire eventually and you want it in the table.
3. **For each explanation, write the one observation that would most change your mind.**
   That is the diagnostic step, and it is what turns a list into a procedure.
4. **Order the observations by cost.** Check the free ones first. A database count and a
   deploy log cost nothing; a customer survey costs a week.

Keep the set in version control next to the metric, and update the priors after each
diagnosis. Over a year this becomes the most valuable operational document you own,
because it encodes what actually goes wrong in your system rather than what goes wrong
in general.
