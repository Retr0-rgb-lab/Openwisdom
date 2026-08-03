# How discriminating is this observation, really

## Contents

- The two numbers you need
- Typical discriminating power, by method
- The three ways this estimate goes wrong
- Sanity checks before you trust a likelihood table

---

## The two numbers you need

For a binary observation and a binary hidden state, you need:

- **sensitivity**: `P(positive | state is true)`
- **specificity**: `P(negative | state is false)`

Everything else follows. The calculator wants them written as a full table:

```json
"outcomes": [
  { "name": "positive", "likelihood": { "true": 0.7, "false": 0.3 } },
  { "name": "negative", "likelihood": { "true": 0.3, "false": 0.7 } }
]
```

Each **state's** column must sum to 1 across outcomes. Note the direction: it is not
`P(state | outcome)`, which is what you get out, not what you put in. Confusing the two
is the most common error here and it produces confidently wrong answers.

The number to internalize: a 0.7 / 0.3 test carries roughly one bit less evidence than
a 0.9 / 0.1 test, and in a decision with a close call that is usually the difference
between a study that changes your mind and one that does not.

## Typical discriminating power, by method

These are working defaults for commercial questions, to be replaced by your own
measured values as soon as you have any. They are deliberately pessimistic, because
almost everyone's first guess is too optimistic.

| Method | Realistic sensitivity/specificity | Why |
|---|---|---|
| Asking people if they would pay | 0.6 / 0.4 | Stated preference barely predicts revealed preference. Nearly worthless on its own. |
| Asking people what they paid for a comparable thing last month | 0.75 / 0.25 | Revealed, recalled, and specific. Much better. |
| Landing page with a real checkout that fails at the last step | 0.85 / 0.15 | Behavioural, but intent is not payment. |
| Charging real money at small scale | 0.95 / 0.05 | The only near-decisive commercial test. |
| Five user interviews | 0.65 / 0.35 | Excellent for finding *problems*, weak for estimating *rates*. |
| Competitor did X, therefore X works | 0.55 / 0.45 | Barely above a coin flip. They may be wrong, and their situation differs. |
| An A/B test that reached significance | 0.9 / 0.1 | High, *if* powered and not peeked at. See sizing-studies.md. |
| An A/B test stopped when it looked good | 0.6 / 0.4 | Optional stopping destroys most of the evidence. |

A row near 0.5 / 0.5 is an observation with no discriminating power. Its VOI is zero by
construction, whatever it costs. Recognizing those rows before building the table saves
the whole exercise.

## The three ways this estimate goes wrong

**Confusing accuracy with discriminating power.** A test that is right 90% of the time
on a question where one state has a 95% prior is right mostly by agreeing with the
prior. What matters is how differently it behaves across states, not how often it is
correct.

**Ignoring the correlated failure.** Two studies that would both be fooled by the same
confound are not two observations. Running "survey" and "interviews" against the same
biased user list gives you one observation counted twice, and the calculator has no way
to know that. Model them as a single combined observation with slightly better
likelihoods than either alone.

**Assuming the measurement is clean.** Analytics has bot traffic, ad blockers, and
attribution gaps. Payment data has settlement lag, refunds and disputes. Every one of
those degrades sensitivity, and none of them appear in the study design document.

## Sanity checks before you trust a likelihood table

1. **Do the columns sum to 1 per state?** The calculator enforces this. If you had to
   fudge a number to make it sum, the fudged number is the one driving your answer.

2. **Would a competent skeptic accept these numbers?** Write the sentence: "when the
   market really does tolerate a 40% rise, this survey comes back enthusiastic 70% of
   the time." If that sentence sounds too strong to say out loud, lower it.

3. **Run the extremes.** Compute VOI with a perfect oracle (`1 / 0`) and with a useless
   observation (`0.5 / 0.5`). Your real study must land between them. If your estimate
   is close to the oracle's value, your likelihoods are too confident.

4. **Check the switch list.** If the study can only ever confirm your existing plan,
   the likelihoods are probably fine and the *decision* is the problem: you have
   already decided.
