# Building and reading a robustness matrix

## Contents

- Picking scenarios
- Weighting them
- The three criteria
- Reading disagreement
- Keeping the planning model simple
- Common construction errors

---

## Picking scenarios

A scenario is a **coherent set of assumption values**, not a single dial moved. "Churn
doubles" is a dial. "A well-funded rival launches a free tier, so churn doubles and paid
conversion drops a third" is a scenario, and it is more useful because the assumptions
that move together in reality should move together in the matrix.

Three to five scenarios. Always include:

- **base** - what you actually expect
- **one adverse** - the coherent bad case, drawn from the premortem
- **one favourable** - the coherent good case

The favourable scenario is the one people skip, and skipping it biases every plan toward
timidity. A plan chosen to survive only the bad case will systematically under-invest in
whatever is working.

## Weighting them

Weights turn the matrix from a thought experiment into a calculation. Without them, the
tool falls back to an unweighted mean, which implicitly asserts that the disaster is as
likely as the base case.

Source the weights the same way as any other prior: from a reference class, from history,
or as a stated pseudocount. If you cannot defend a weight, say so and check whether the
ranking is sensitive to it - often it is not, and then the argument is moot.

A workable default when you have nothing better:

```json
"scenarioWeights": { "base": 0.55, "adverse": 0.25, "favourable": 0.2 }
```

## The three criteria

**Best expected** maximises the weighted average. It is the right criterion when the
decision repeats often enough to average out, and when no single bad outcome is fatal.

**Maximin** maximises the worst case. It is correct when the worst case is genuinely
unrecoverable - insolvency, licence loss, a data breach. It is wrong the rest of the
time, because it optimises against a scenario that may carry 5% weight and it produces
plans that cannot win.

**Minimax regret** minimises the largest gap between what you got and what the best
option would have got in that same scenario. It is usually the most useful of the three
commercially, because it penalises being badly wrong without demanding immunity to
everything.

## Reading disagreement

**All three agree.** Robust. Stop analysing and ship. This is the common case and
reaching it quickly is the point.

**Expected and regret agree, maximin differs.** The maximin choice is buying insurance
against one specific scenario. Ask what the premium is - the tool gives you both
expected values, so the premium is the difference - and whether that scenario is
survivable without insurance. Usually it is, and you take the expected-value choice.

**Expected differs from regret.** One option has a large upside in a low-weight
scenario and does badly elsewhere. Check the weights first; this pattern is often an
artefact of a weight nobody sourced.

**All three differ.** The scenarios are doing more work than the options. Either your
assumptions genuinely dominate the decision - in which case go and measure one, using
the **valuing-information** skill - or the matrix is badly built.

## Keeping the planning model simple

The plan should be optimized against a deliberately simple model and evaluated against a
rich one. Two reasons, and the second is the one people miss:

**Overfitting.** A plan tuned to a detailed model is tuned to the parts of that model
that are guessed, and it will be brittle in exactly the way that is hardest to see.

**Test independence.** Once you tune the plan to score well on your stress scenarios,
the scenarios stop being tests. Keeping the models separate is what preserves their
diagnostic value.

The practical form: plan on three or four variables you can state and defend. Evaluate
against everything you know, including the messy details, the past incidents, and the
scenarios nobody would design for.

## Common construction errors

**Incomparable cells.** Every cell must be the same quantity on the same scale - if one
row is quarterly profit and another is annual revenue, the matrix is meaningless. State
the unit at the top of the file.

**Scenarios that are really options.** "We ship a cheaper tier" is something you choose;
it belongs in the rows, not the columns. Columns are things that happen to you.

**A missing do-nothing row.** Without the status quo in the matrix, you cannot tell
whether the best option beats not acting.

**Point estimates dressed as scenarios.** Three scenarios all within 10% of each other
are one scenario with rounding. Spread them until they are genuinely different worlds,
or drop to two.
