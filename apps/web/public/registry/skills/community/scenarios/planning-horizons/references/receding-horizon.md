# Receding horizon planning

## Contents

- The loop
- Choosing the replan interval
- Writing a replan trigger
- Open loop versus closed loop
- Why a plan you will not follow is still worth making

---

## The loop

```
1. From where you are now, plan to depth d.
2. Execute the first step only.
3. Observe what happened.
4. Go to 1.
```

The plan is a device for choosing the next action, not a commitment to the tail. This
resolves the usual objection to planning ("plans are always wrong") without abandoning
planning: the tail is expected to be wrong, and it is never executed.

The depth `d` matters because it determines whether the first step is chosen with
awareness of what comes later. Too shallow and you take locally attractive steps that
lead somewhere bad. Too deep and you spend effort on a tail that gets discarded.

## Choosing the replan interval

The interval interacts with the depth: **frequent replanning substitutes for depth.**

| Replan cadence | Typical depth needed |
|---|---|
| Weekly | 4-8 weeks |
| Monthly | 2-3 quarters |
| Quarterly | 4-6 quarters |

If you can only replan quarterly, you must plan deeper, because you will be committed
for longer whether or not you meant to be. The cheapest improvement available to most
teams is not better planning; it is replanning more often, which makes shallower plans
sufficient.

## Writing a replan trigger

A trigger is an observation with a threshold and a duration. All three parts matter.

**Bad:** "revisit in Q3."
Fires when the calendar moves, which is uncorrelated with anything.

**Bad:** "revisit if signups drop."
Fires on noise. Every metric drops constantly.

**Good:** "replan if weekly signups are below 40 for two consecutive weeks, or if a
competitor ships a free tier."

The threshold should sit outside the normal noise band. Use the **tracking-beliefs**
skill to find where that band actually is; a threshold set inside it produces a replan
every few weeks and destroys the plan's value.

Include at least one trigger that fires on *good* news. A plan that only gets revisited
when things go badly will systematically under-invest in what is working.

## Open loop versus closed loop

**Open loop** picks the whole sequence of actions in advance and executes it regardless
of what is observed. A twelve-month Gantt chart is open loop. It is cheap to compute
and it throws away every piece of information that arrives after it is written.

**Closed loop** chooses each action based on what has been observed. It is what receding
horizon planning produces.

Open loop is the right choice only when the sequence is genuinely uninterruptible - a
regulatory filing sequence, a physical build with long lead times, a migration where
stopping halfway is worse than either end. Everywhere else it is a false economy: the
apparent efficiency comes entirely from discarding information.

The tell that a plan is accidentally open loop: nowhere in it does anyone say what would
cause it to change.

## Why a plan you will not follow is still worth making

Three reasons the depth-d tail earns its cost even though it is discarded:

**It changes the first step.** A plan that looks two quarters ahead may pick a different
first move than one that looks two weeks ahead, because it can see a wall coming. That
is the whole return on planning depth.

**It surfaces the dependencies.** The tail is where you discover that step four needs a
hire made in step one. That discovery is durable even when the tail is not.

**It makes the discount rate visible.** Laying out payoffs over time forces someone to
say how much a payoff two years out is worth today, which is the argument everyone was
having implicitly.

What the tail is *not* for: publishing as a commitment. Communicate the first step as a
commitment and the tail as context, and label them differently.
