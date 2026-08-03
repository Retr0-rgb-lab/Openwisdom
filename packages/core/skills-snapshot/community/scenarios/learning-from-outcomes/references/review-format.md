# Review formats

## Contents

- Monthly review (30 minutes)
- Quarterly review (90 minutes)
- Postmortem addendum
- What to write down
- Failure modes of reviews

---

## Monthly review (30 minutes)

**1. Collect (5 min).** Every prediction whose date has passed. Record each outcome as a
binary before any discussion. Nobody explains anything yet - explanation before scoring
contaminates the score.

**2. Score (5 min).** Run the calibration tool over the accumulated history, not just
this month's. Read the verdict and the bin table.

**3. Grid (10 min).** Place each decision in the process-versus-outcome grid. Spend the
time on the two diagonal cells - bad luck and got-away-with-it - because the other two
generate no actions.

**4. Update (10 min).** Change the numbers. Which prior was wrong, and what is it now?
Which reference-class estimate was optimistic, and by how much? Write the new values
into the documents that hold them, in the meeting, not afterwards.

No agenda item for "lessons learned". A lesson that does not change a number is a
sentence that will be forgotten.

## Quarterly review (90 minutes)

Everything in the monthly, plus:

**5. Credit assignment (20 min).** For the quarter's two or three biggest movements, run
the credit tool over the decisions that preceded them. Argue about the resulting split.
The output is a prompt for the argument, not a verdict, and the argument is the point:
it forces the six-month-old decision back onto the table.

**6. Replay (20 min).** Two decisions from six or more months ago that are not due.
Re-read the reasoning. Does it still look right? This is the step that stops old lessons
being overwritten by recent experience, and it is the first one dropped when the meeting
runs long. Protect it.

**7. Proxy audit (10 min).** For every metric currently used as a target, check whether
the downstream outcome moved with it. A proxy that rose while the outcome it stood for
did not has stopped being a proxy and has become the goal.

## Postmortem addendum

After any incident or clear failure, add two steps to the normal postmortem:

**Extract the trajectory.** Write the failure as a numbered chain of steps, each with the
plausibility it had *before* it happened. It happened, so the joint plausibility was not
zero, and the chain is now a validated scenario.

**Add it to the robustness matrix.** File it as a scenario for future plans of the same
shape. A future plan that would fail the same way should score visibly worse,
automatically, without anyone remembering to raise it.

That is what turns an incident log from a record into a filter. See the
**stress-testing-plans** skill's premortem reference.

## What to write down

The review's output is a diff, not minutes. Three lists:

```markdown
## Numbers changed
- prior on "tracking break" for traffic drops: 0.2 -> 0.3 (two of the last four were tracking)
- reference estimate for a landing page rebuild: 2 weeks -> 4 weeks (three consecutive overruns)
- likelihood assigned to a five-interview study: 0.75 -> 0.65 (missed the pricing objection twice)

## Scenarios added
- "renderer leaks browser processes over a weekend" -> robustness matrix for any batch job

## Decisions replayed
- 2026-01-14 pricing change: reasoning still holds
- 2025-11-02 channel cut: wrong, we cut on 14 observations. Rule added: no cut under 30.
```

Anything that does not fit one of those three lists did not need a meeting.

## Failure modes of reviews

**Reviewing outcomes instead of predictions.** Produces a narrative in which the good
results were foreseen and the bad ones were unforeseeable. Feels like learning. Is not.

**Only reviewing failures.** Success with a bad process is the most dangerous cell in the
grid, and it is the one nobody volunteers to examine.

**Editing the record.** Once predictions are revised after the fact, the log is a record
of hindsight and the calibration numbers are meaningless.

**Blaming variance.** Punishing a good decision that lost teaches people to minimise
variance rather than maximise expected value, and the effect is permanent and invisible.

**Lessons without numbers.** "We should be more careful about X" survives one quarter.
"The prior on X is now 0.3" survives indefinitely because it lives in a file that gets
read.

**No replay.** Everything is learned from the last four weeks, so the same mistake
returns on a two-year cycle, and each time it feels new.
