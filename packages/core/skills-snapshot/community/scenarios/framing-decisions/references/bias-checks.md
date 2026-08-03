# Bias checks

Five checks to run after the calculator and before committing. Each one is a known,
reproducible violation of the rational-preference axioms, not a general warning to
be careful. Sources are noted so you can push back on someone who disputes the check.

## Contents

- 1. Framing
- 2. Certainty
- 3. Sunk cost
- 4. Reference class
- 5. Anchoring on the first number

---

## 1. Framing

**The check:** restate the leading option as a loss instead of a gain, using the same
numbers, and re-read the table. If your preference flips, the preference was about
wording.

**Why it is a real violation:** Tversky and Kahneman presented an epidemic scenario
two ways. "200 of 600 people will be saved" was preferred over a one-third chance of
saving all 600. But "400 will die" was rejected in favour of a one-third chance that
nobody dies. The two framings are arithmetically identical. Most respondents chose
inconsistently. (*Science* 211, 1981; reproduced in Algorithms for Decision Making,
example 6.7.)

**Where it shows up in operating decisions:** churn framed as "we keep 94%" versus
"we lose 6%". Price rises framed as revenue gained versus customers lost. Both
framings should be written into the decision record.

## 2. Certainty

**The check:** if you are choosing a smaller guaranteed outcome over a larger probable
one, multiply both branches of the comparison by the same factor (say 0.1) and ask
again. If your preference reverses, you were paying for certainty, not for value.

**Why it is a real violation:** students preferred an 80% chance of losing 100 lives
over a certain loss of 75. The same students preferred a 10% chance of losing 75 over
an 8% chance of losing 100 - the identical comparison scaled by 0.1. Those two
preferences contradict each other under any utility function whatsoever, including
one where losing 100 is better than losing 75. (Algorithms for Decision Making,
example 6.6.)

**Where it shows up:** "let's take the guaranteed consulting contract instead of the
product bet" is sometimes right and sometimes the certainty effect. Scale the
comparison and see which.

**The useful inverse:** your customers have this bias too. A money-back guarantee buys
disproportionate willingness to pay because it converts a probable outcome into a
certain one. It is cheap utility to sell.

## 3. Sunk cost

**The check:** rewrite the decision as if you were arriving today with the current
state and no history. Does the same action win?

**Why it belongs here:** expected utility is defined over *resulting states*. Money
and time already spent do not appear in any resulting state, so they cannot legally
enter the calculation. If they changed your answer, your table was wrong.

**The legitimate exception:** past spend is evidence about the future - it tells you
what the work costs and what you have learned. Use it as evidence in the prior, never
as a term in the utility.

## 4. Reference class

**The check:** name the reference class your prior came from and count how many
members it has. If the answer is "our situation is unique", the prior is a feeling.

**Why:** a Bayesian score prefers simpler structures when data is thin and only
supports elaborate ones as data accumulates (Algorithms for Decision Making, sec. 5.1).
An elaborate causal story fitted to three observations is overfitting, and it will
generalize worse than "things in this class usually take twice as long".

## 5. Anchoring on the first number

**The check:** have the utilities scored by someone who has not seen the proposed
action, or score the worst outcome first and work up.

**Why:** the first number written on a whiteboard sets the scale for every subsequent
number, and utility elicitation is exactly the procedure that number corrupts. The
book's elicitation method fixes the best outcome at 1 and the worst at 0 first, then
locates everything else between them, precisely to avoid an arbitrary anchor
(Algorithms for Decision Making, sec. 6.3).

---

## When these do not apply

These checks are about *your* decision quality. Deliberately exploiting framing and
certainty effects in pricing and copy is a different question with a different
answer - customers really do value certainty, and presenting a true fact in its more
persuasive framing is normal commercial practice. Manufacturing a false frame is not.
