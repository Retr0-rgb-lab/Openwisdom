# Decision record template

One file per decision, in a `decisions/` directory, named `YYYY-MM-DD-short-slug.md`.

The point of the format is the **prediction** block. Everything else is context that a
future reader could reconstruct; the stated probabilities are the only thing that lets
`calc calibrate` tell you whether your judgment is any good.

```markdown
# <decision in one line, phrased as the action taken>

- date: YYYY-MM-DD
- owner: <who>
- reversible: yes | no | partly (<what is reversible>)
- revisit: <date or trigger condition>

## Situation

<Two or three sentences. What forced a decision now.>

## Options considered

| Action | Why it might win |
|---|---|
| <A> | |
| <B> | |
| do nothing | |

## Hidden variable

<The thing we do not know, as 2-4 exclusive states, with the prior and its source.>

| State | Prior | Source of that number |
|---|---|---|
| | | |

## Utility

- scale: <resulting cash position at <horizon> / other>
- form: linear | log | power(lambda=)
- reason: <why this form and not the other>

## Result

<Paste the `calc meu` output. Include the advantage of second place.>

## Predictions

<The falsifiable part. Two to five statements with probabilities. These get graded.>

| Prediction | By when | P |
|---|---|---|
| | | |

## What would change our mind

<Concrete observations that would trigger a revisit, and roughly when we would see them.>

## Decision

<The action, stated as a commitment. Who does what by when.>
```

## Rules that make the log worth keeping

**Write the record before acting, not after.** A record written afterwards records a
justification, not a decision, and its predictions are worthless because they were
authored knowing the outcome.

**Every prediction gets a number.** "Likely" is not gradeable. If you cannot put a
number on it, it is not a prediction, it is a hope; move it out of the table.

**Do not edit predictions later.** Append an outcome section instead. The value of the
log is that it preserves what you actually believed.

**Record the near-misses.** If the advantage of second place was under a percent, write
that down. When the decision goes badly, you want to know whether it was a bad call or
a coin flip that landed wrong, and only the record can tell you.

**Keep a revisit trigger, not just a date.** "Revisit when weekly signups fall below
40 for two consecutive weeks" beats "revisit in Q3", because it fires when the world
changes rather than when the calendar does.
