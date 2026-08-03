# When one hidden variable is not enough

## Contents

- The three node types
- Reading the diagram
- Pruning before you compute
- When to stop drawing and start measuring

---

A decision network (also called an influence diagram) extends a probabilistic model
with two extra node types, so the whole decision fits in one picture:

- **Chance node** (circle): a random variable. Its distribution is conditioned on its
  parents.
- **Decision node** (square): something you choose. An edge into it means the choice is
  made *knowing* the parent's value.
- **Utility node** (diamond): determined by its parents. Never has children. Total
  utility is the sum over all utility nodes.

No cycles, in either the probabilistic or the decision part.

## Reading the diagram

Three edge types, and the distinction matters:

| Edge | Ends at | Means |
|---|---|---|
| conditional | chance node | this variable's distribution depends on the parent |
| informational | decision node | the choice is made knowing the parent |
| functional | utility node | utility is computed from the parent |

The informational edges are the ones people forget to draw, and they are the ones that
carry the actual constraint. "We will decide the price after the survey comes back" is
an informational edge from survey to price. "We must commit to the price before the
survey" is the same diagram with that edge deleted, and it is a completely different
problem with a different answer.

## Draw one when

- Two or more hidden variables interact and you cannot cross them into a flat table
  without producing something nobody can read.
- The sequencing is contested: who knows what, when.
- Several observations are on the table and you need to reason about their combined
  value rather than each in isolation.

## Draw one when it is a normal choice under a single unknown

Do not. A flat table beats a diagram for a two-action, three-state problem, and it can
be pasted into a decision record where a diagram cannot.

## Pruning before you compute

Solving a decision network exactly means iterating over every assignment of the
decision variables and running inference for each, which is NP-hard in general. Two
cheap reductions usually make it tractable:

**Drop barren nodes.** Any chance or decision node with no children - no conditional,
informational, or functional edge leaving it - cannot affect utility. Delete it. In
practice this removes most of the diagnostic signals people put on the diagram out of
completeness, because they connect to nothing.

**Watch what "observed" does.** A node you have decided to observe gains an
informational edge into the decision, which means it is no longer barren. Observing
something is a structural change to the problem, not just an input. This is the same
fact that the **valuing-information** skill prices.

## When to stop drawing and start measuring

If the diagram has more nodes than you have data points, the structure is doing the
work rather than the evidence, and the answer will follow whoever drew it. Simplify
to the two or three variables you can actually put a sourced number on. A Bayesian
score prefers simpler structures precisely when data is thin, and that preference is
correct rather than merely convenient.
