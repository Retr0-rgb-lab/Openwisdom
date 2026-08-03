---
name: learning-from-outcomes
description: "Turns past decisions into calibrated judgment - scoring old predictions against what happened, assigning credit for delayed results, and separating a bad decision from a good decision that lost. Use during a retrospective, postmortem, quarterly or monthly review, when reviewing decisions taken 30+ days ago, when attributing a result to a cause, or when someone claims to have called something."
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
  upstream: "https://github.com/romainsimon/skills-for-decision-making/tree/main/learning-from-outcomes"
---


# Learning from outcomes

Experience does not automatically produce judgment. Without a written prediction and a
scoring step, a review produces a story in which the good outcomes were foreseen and the
bad ones were unforeseeable. That story feels like learning and teaches nothing.

Three things make a review compound:

1. **Score the predictions**, not the outcomes.
2. **Assign credit across time**, because results arrive long after the decisions that
   caused them.
3. **Replay old decisions deliberately**, because recent experience otherwise
   overwrites older lessons entirely.

## Workflow

```
- [ ] 1. Collect the predictions that came due
- [ ] 2. Score them
- [ ] 3. Separate decision quality from outcome quality
- [ ] 4. Assign credit for delayed results
- [ ] 5. Replay two old decisions that are not due
- [ ] 6. Update the priors that were wrong
```

### 1. Collect what came due

Pull every prediction from the decision log whose date has passed. Record the outcome as
a plain binary before discussing anything, and before anyone explains why it happened.

If there is nothing to collect, the problem is upstream: decisions are being recorded
without falsifiable predictions. Fix that in **framing-decisions** first; nothing here
works without it.

### 2. Score them

**Run the calculator. Do not compute these by hand.**

```bash
node scripts/calc.js calibrate predictions.json
```

Brier decomposition, bin assignment and the base-rate benchmark are exactly the kind of
arithmetic that comes out subtly wrong when done in prose, and a miscalibration verdict
derived from a wrong number is worse than no verdict. Paste the real output into the
review.

Input shape: `examples/calibrate.json`. Four numbers matter:

- **Brier score** - mean squared error of your probabilities. Lower is better.
- **Always-base-rate** - what you would have scored by ignoring specifics and always
  quoting the base rate. **If your Brier score is not beating this, your judgment is
  adding nothing** and the honest response is to quote base rates until it does.
- **Verdict** - overconfident, underconfident, or well calibrated.
- **The bin table** - of the things you called 80%, how many happened? Overconfidence
  concentrates in the high bins, which is where it does the most damage.

Twelve predictions is enough to see a pattern; five is not. Score quarterly at minimum,
and keep the whole history rather than the current window.

### 3. Decision quality is not outcome quality

For each item, place it in the grid before discussing what to change:

| | Good outcome | Bad outcome |
|---|---|---|
| **Good process** | earned it | bad luck - change nothing |
| **Bad process** | got away with it - fix anyway | the only cell that deserves blame |

The two diagonal cells are where reviews go wrong. Punishing bad luck teaches people to
avoid variance rather than to decide well. Rewarding a lucky call teaches the room to
copy a bad process.

The decision record makes this decidable rather than rhetorical: if the record shows the
advantage of second place was under a percent, the decision was a coin flip and the
outcome carries almost no information about the process.

### 4. Assign credit for delayed results

Results arrive months after the decisions that caused them, and the discussion
systematically credits whatever shipped most recently.

```bash
node scripts/calc.js credit result.json --lambda 0.7
```

Input shape: `examples/credit.json`. It decays credit by `lambda` per period back through
the decisions that preceded the result. `lambda = 0.7` is a reasonable default; use
higher when effects are slow (SEO, brand, hiring) and lower when they are fast (a pricing
change, an ad creative).

The output is a prompt for a better argument, not an answer. Its job is to put the
six-month-old decision back on the table so someone has to argue about it explicitly
rather than forget it.

### 5. Replay two old decisions

Pick two decisions from six or more months ago that are **not** due for review, and
re-read them. Ask: does the reasoning still look right, knowing what you know now?

This is deliberate replay of old experience, and it exists to counter a specific failure:
learning purely from recent events overwrites older lessons, so a system that only
reviews what is current will confidently repeat a mistake it already learned about.
Almost every long-running organisation has a lesson it has learned three times.

Keep a short list of replayed decisions so you rotate through the log rather than
re-reading the same memorable ones.

### 6. Update the priors that were wrong

**A lesson that does not change a number will not change a decision.** State that, then
act on it: the output of a review is not a list of lessons, it is a set of **changed
numbers**, each written into a named file that will actually be read next time. "We should
be more careful about X" survives one quarter. "The prior on X is 0.3, in
`runbooks/traffic-drops.md`" survives indefinitely.

Name the destination for every number. A revised estimate with no home is a lesson
wearing a number's clothes.

Numbers worth changing:

- The prior in a diagnosis set (**tracking-beliefs**)
- The reference-class estimate for how long something takes
- The likelihood assigned to a study method (**valuing-information**)
- Your calibration adjustment: if you are systematically overconfident at 80%, shade
  future 80% claims to 70% until the bin table says otherwise

A lesson that does not change a number will not change a decision. Write the number.

## Output template

The review's output is a diff, not minutes. If something does not fit one of these
sections, it did not need a meeting.

```markdown
## Predictions that came due
| Prediction | stated P | outcome |
|---|---|---|

## Calibration
<paste calc calibrate: Brier, always-base-rate benchmark, verdict, bin table>
Skill versus base rate: <positive means judgment is adding value; negative means
quote base rates until it is not>

## Process versus outcome
| Decision | process | outcome | cell | action |
|---|---|---|---|---|
<spend the time on bad-luck and got-away-with-it; the other two need no action>

## Credit for delayed results
<paste calc credit, with the lambda used and why>

## Decisions replayed
<two records from 6+ months ago, and whether the reasoning still holds>

## Numbers changed
<every row needs a destination file, or it is a lesson not a number>
| number | was | now | lives in | evidence |
|---|---|---|---|---|

## Scenarios added
- <failure trajectory> -> robustness matrix for <class of plan>
```

## Gotchas

- **Score predictions, not outcomes.** A review of outcomes is a review of luck.
- **Never rewrite a prediction after the fact.** Append the outcome. The value of the log
  is that it preserves what you actually believed, including the embarrassing parts.
- **Overconfidence is the normal finding.** If your 90% claims come true 70% of the time,
  that is typical, correctable, and worth more than any single lesson in the review.
- **Watch the proxy metric.** Any metric used as a target stops measuring what it
  measured. If activation rate became a goal and then rose without revenue following,
  the metric was optimised rather than the outcome. Check the downstream number.
- **A result with one obvious cause is suspicious.** Real results have several
  contributing decisions. If the room agrees instantly on a single cause, run the credit
  assignment and see who else is on the list.
- **Do not review only failures.** Successes with bad process are the most dangerous
  cell in the grid, because nobody wants to examine them and the process survives.
- **Small samples justify simple explanations.** Three data points do not support an
  elaborate causal story, however satisfying it is.
- **Attribution windows lie.** A 30-day attribution window credits whatever the customer
  touched last. The credit tool exists precisely because that is not causation.

## Reference

- `references/review-format.md` - the monthly and quarterly review agendas, with time boxes
- `references/calibration.md` - reading the bin table, fixing overconfidence, how many predictions you need

## Related skills

- **framing-decisions** writes the records this skill grades
- **tracking-beliefs** receives the corrected priors
- **stress-testing-plans** converts a past failure into a reusable scenario
- **valuing-information** receives the corrected likelihoods for study methods

## Upstream

https://github.com/romainsimon/skills-for-decision-making/tree/main/learning-from-outcomes

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
