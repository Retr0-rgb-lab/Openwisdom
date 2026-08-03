# Most-likely-failure analysis

## Contents

- The difference from a normal premortem
- Running it
- Scoring the trajectory
- Reading the result
- Worked shape
- Turning a past incident into a future test

---

## The difference from a normal premortem

A standard premortem asks "how could this fail?" and gets a list of disasters ranked by
how frightening they sound. Frightening and likely are different properties, and the
list conflates them.

The adversarial version constrains the adversary to **maximise the probability of the
trajectory** while minimising your outcome. Formally the adversary is rewarded for both
your loss and the log-likelihood of the path it takes, so an implausible path scores
badly no matter how bad the ending.

That constraint changes what the room produces. It rules out asteroid strikes and
surfaces the chain of individually-unremarkable steps that ends somewhere bad, which is
how systems actually fail.

## Running it

Twenty minutes, three to five people, one scribe.

**Frame it as past tense.** "It is six months from now and this failed." Past tense
produces specifics; hypothetical future tense produces hedging.

**State the constraint explicitly.** "Every step you describe has to have been more
likely than not at the time. If a step needed something surprising to happen, we score
it down."

**Collect trajectories, not causes.** A cause is "the infra bill blew up". A trajectory
is: we shipped the video feature, each render leaked a browser process, the leak was
invisible because the dashboard tracked memory and not process count, it accumulated
over a weekend, the box hit CPU starvation, and nothing alerted because the health check
only pinged the web server.

**Write each step separately.** The step-by-step structure is what makes scoring
possible, and it is where the fixable link becomes visible.

## Scoring the trajectory

Give each step a plausibility, then multiply.

| Step plausibility | Meaning |
|---|---|
| 0.9 | this is what normally happens |
| 0.7 | happens often, nobody would be surprised |
| 0.5 | coin flip |
| 0.2 | would need something to go unusually wrong |
| 0.05 | would be a surprise |

Multiply along the chain. Five steps at 0.7 is 0.17 - a one-in-six failure path, which is
not a tail risk and should not be filed as one. Two steps at 0.05 is 0.0025 and can be
noted and dropped.

Then look for the **lowest-plausibility step that is also cheap to fix**. That is where
the intervention goes: it is the link that breaks the chain for the least money. Often it
is not the dramatic step but the boring one, like the alert that watched the wrong thing.

## Reading the result

**High-probability trajectory, cheap fix.** Fix it now. This is the case the whole
exercise exists to catch.

**High-probability trajectory, expensive fix.** Take it to the response menu in the main
workflow. Usually the answer is to change the action space - stage the rollout so the
failure is caught at 5% of traffic instead of 100%.

**Low-probability trajectory.** Record it and move on. You have bought confidence, which
is a real output.

**No trajectory found.** Either the plan is genuinely safe, or the room does not
understand the system well enough. Ask who would find one, and ask them. A premortem
that produces nothing from people who built the system is meaningful; from people who
have not seen the code it is not.

## Worked shape

```
Plan: ship the automated video renderer to all users on Friday.

Trajectory:
  1. Feature ships Friday afternoon              0.9
  2. Each render leaves a browser process alive  0.5
  3. Nobody looks at the box over the weekend    0.8
  4. Process count grows past what the CPU takes 0.7
  5. Health check passes because the web server
     is still up, so nothing pages anyone        0.6

  Joint plausibility: 0.9 x 0.5 x 0.8 x 0.7 x 0.6 = 0.15

Weakest link that is cheap to fix: step 5.
An alert on process count costs an hour and breaks the chain regardless
of whether step 2 is true.

Second cheapest: step 1. Shipping Tuesday instead of Friday reduces
step 3 to about 0.2 for free.
```

Two interventions, neither of which required knowing in advance that the leak existed.
That is the value: the fix does not depend on predicting the specific bug.

## Turning a past incident into a future test

Every incident you have already survived is a validated failure trajectory. It happened,
so its plausibility is 1 by construction.

After each postmortem, extract the trajectory into a reusable scenario and add it to the
robustness matrix for future plans of the same shape. A plan that would fail the same way
again should be visibly worse in the matrix, automatically, without anyone remembering to
raise it in the meeting.

That is what turns an incident log from a record into a filter.
