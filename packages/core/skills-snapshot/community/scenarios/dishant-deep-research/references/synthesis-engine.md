# Synthesis Engine

This file contains the methodology for transforming raw research findings into insights, identifying patterns, calibrating confidence, and stress-testing conclusions. This is what separates a data dump from genuine research.

Read this file during Step 4 of the research process, after gathering information across all 5 layers.

---

## Table of Contents
1. [The Synthesis Process](#synthesis-process)
2. [Triangulation](#triangulation)
3. [Pattern Recognition](#pattern-recognition)
4. [Fact-to-Insight Elevation](#fact-to-insight-elevation)
5. [The "So What" Engine](#so-what-engine)
6. [Red Team Methodology](#red-team-methodology)
7. [Confidence Calibration](#confidence-calibration)
8. [Narrative Construction](#narrative-construction)
9. [Absence Analysis](#absence-analysis)

---

## The Synthesis Process {#synthesis-process}

Synthesis is NOT summarization. Summarization compresses information. Synthesis creates new understanding by connecting, contrasting, and interpreting information across sources.

**The Synthesis Sequence:**
1. Gather raw findings from all 5 layers
2. Triangulate across sources (do independent sources agree?)
3. Identify patterns (convergence, divergence, silence, trends)
4. Elevate facts to insights (add context and implication)
5. Apply the "So What" test to every major finding
6. Red team your emerging conclusions
7. Calibrate confidence on key claims
8. Construct the narrative arc
9. Check for absences (what's missing?)

Do NOT skip steps. The most common failure mode is going from "gather findings" directly to "write the output." That produces organized information, not synthesized insight.

---

## Triangulation {#triangulation}

Triangulation means verifying findings by cross-referencing independent sources. A claim supported by 3+ independent source types is high-confidence. A claim from a single source, regardless of how authoritative, gets flagged.

### How to triangulate

**Step 1: Identify key claims**
After gathering findings, list the 5-10 most important claims that will appear in the output.

**Step 2: For each claim, check source diversity**
Map which source types support the claim:
- [ ] Government/official source
- [ ] Industry/trade source
- [ ] Practitioner/community source (real user experience)
- [ ] Academic/research source
- [ ] Competitor intelligence
- [ ] News/media source
- [ ] Financial/business data

**Step 3: Score convergence**

| Sources agreeing | Confidence treatment |
|---|---|
| 3+ independent source types | High confidence — state as finding |
| 2 independent source types | Medium confidence — state with caveat |
| 1 source type only | Low confidence — flag explicitly: "Based on [source type] only; not independently verified" |
| Sources conflict | Present both sides explicitly with reasoning about which is more likely correct |

**Step 4: Handle contradictions**
When sources disagree:
1. State the disagreement explicitly (do not hide it)
2. Analyze WHY they might disagree (different time periods? different definitions? different perspectives? different incentives?)
3. If one source is more authoritative for THIS specific claim, say so and explain why
4. If the disagreement is genuine and unresolvable, present both positions and let the reader decide

### Example of good triangulation
"Market size estimates range from $2.1B (IBISWorld, 2024) to $3.8B (Grand View Research, 2023). The discrepancy likely stems from differing definitions of what's included — IBISWorld counts only direct services while Grand View includes adjacent products. The narrower definition is more relevant to this research question, but even the lower estimate suggests substantial headroom."

### Example of bad triangulation
"The market is worth $3.8B." (Single source, presented as fact, no methodology note)

---

## Pattern Recognition {#pattern-recognition}

After triangulating individual claims, zoom out to identify patterns across the entire body of findings.

### Four pattern types to look for

**1. Convergence Patterns**
Multiple unrelated findings pointing to the same conclusion. This is strong signal.

*How to spot:* After laying out all findings, ask: "Do 3+ findings from different angles all suggest the same thing?"

*Example:* Competitor job postings show they're hiring compliance staff + regulatory agencies are increasing audits + industry associations are publishing compliance guides → Convergence: the regulatory environment is tightening.

**2. Divergence Patterns**
A clear split between two camps. Both may be right in different contexts.

*How to spot:* Look for "it depends" situations where the answer changes based on one key variable.

*Example:* Some practitioners say telehealth for X works great, others say it doesn't. Digging deeper: it works for patients with condition A but not condition B. The divergence reveals a segmentation insight.

**3. Silence Patterns**
Something that SHOULD be discussed but isn't. Absence of information is itself informative.

*How to spot:* Ask "What would I expect to find that I'm NOT finding?" If a market supposedly has 50 competitors but you can only find 8 with real traction, the silence tells you most aren't surviving. If everyone discusses the benefits but nobody discusses the risks, the silence tells you risks are either unknown or being suppressed.

*Example:* Researching utility discounts for placard holders — you find extensive information about some states and complete silence about others. The silence could mean: the programs don't exist there, they exist but aren't publicized, or they exist but have extremely low uptake. Each interpretation has different implications.

**4. Trend Patterns**
Directional movement across time. Something is increasing, decreasing, accelerating, or plateauing.

*How to spot:* Compare data points across time periods. Look at regulatory trajectory (more or less restrictive?), market trajectory (growing or maturing?), competitive trajectory (concentrating or fragmenting?).

*Example:* 2020: 3 telehealth competitors. 2022: 15 competitors. 2024: 8 competitors. Pattern: rapid entry followed by consolidation. Implication: the easy-entry phase is over, remaining players are getting stronger.

---

## Fact-to-Insight Elevation {#fact-to-insight-elevation}

An insight is a fact + context + implication. Every major finding in the output must be elevated from fact to insight. Never present a fact and leave the reader to figure out why it matters.

### The Elevation Formula

**Fact:** [What is true]
**Context:** [Why this is significant / what it means relative to other things]
**Implication:** [What this means for the research question / what the reader should do with this information]

### Examples

**Bad (fact only):**
"The average processing time for disability parking placards is 4-6 weeks in most states."

**Good (elevated to insight):**
"The average processing time for disability parking placards is 4-6 weeks in most states, which creates a significant pain point because many applicants have acute conditions where mobility is deteriorating. This processing gap is exactly where telehealth certification services add value — by compressing the medical documentation step from weeks (waiting for a doctor appointment) to days. Services that can credibly promise 'certification within 48 hours' are competing against a 4-6 week baseline, making speed the dominant value proposition."

### The Three Tests for a Good Insight
1. **The "Duh" test:** Would an informed person say "I already knew that"? If yes, go deeper.
2. **The "So what" test:** Does the reader know what to DO with this information? If not, add implication.
3. **The "Specificity" test:** Could this insight apply to any industry, or is it specific to THIS topic? If it's generic, make it specific.

---

## The "So What" Engine {#so-what-engine}

Every paragraph in the output should pass the "So What" test. If a reader could reasonably ask "so what?" after reading a paragraph, that paragraph needs work.

### How to apply the "So What" test

After writing a paragraph, ask these questions:
1. Why does this matter to the person reading this research?
2. What decision does this information inform?
3. What would change if this fact were different?
4. What should the reader DO differently knowing this?

If you can't answer at least one of these, either:
- Add the "so what" to the paragraph
- Cut the paragraph (it's filler)
- Move it to a footnote or appendix

### Examples

**Fails "So What":**
"The telehealth market has grown significantly since 2020, driven by changes in consumer behavior and regulatory flexibility."

**Passes "So What":**
"Post-2020 regulatory flexibility for telehealth remains largely intact in 2025, which means the window for launching telehealth-based services is still open. However, at least 8 states are considering legislation that would re-impose in-person requirements for specific services, making market entry timing important — launching in 2025 carries less regulatory risk than waiting until 2026 when these bills may pass."

---

## Red Team Methodology {#red-team-methodology}

Red teaming means deliberately trying to disprove the conclusions forming in your research. This is mandatory, not optional. Unchallenged conclusions are unreliable conclusions.

### The Red Team Protocol

**Execute after synthesis, before writing the final output.**

**Step 1: State your emerging conclusion**
Write it as a clear, falsifiable statement.
Example: "The utility discount market for disability placard holders is an attractive expansion opportunity for ParkingMD."

**Step 2: Apply the 7 Challenges**

1. **Steel Man the Opposition:** What's the STRONGEST argument against this conclusion? Not a straw man — the version a smart, informed skeptic would make.

2. **Survivorship Bias Check:** Are we only seeing success stories? What about the failures we can't see? If 10 companies tried this and 8 failed, the 2 survivors' stories would look great — but the base rate is 80% failure.

3. **Recency Bias Check:** Are we overweighting recent events? Would this conclusion have been different 2 years ago? Will it be different 2 years from now?

4. **Source Bias Check:** Do most of our sources share the same perspective? Are we hearing from practitioners but not regulators? From enthusiasts but not critics? From winners but not losers?

5. **Incentive Analysis:** Who benefits from us believing this conclusion? Are any of our sources selling something? Is the market research firm projecting growth because their clients want to hear that?

6. **Base Rate Check:** What's the historical success rate for similar initiatives? If we're researching "should we enter market X," what percentage of similar market entries succeed? If the base rate is 20%, our conclusion needs to be VERY strong to overcome that prior.

7. **Inversion Test:** Instead of asking "why would this work?", ask "what would make this fail?" List the failure modes. Are they plausible? Are they addressable?

**Step 3: Score the resilience**

After applying all 7 challenges:
- Does the conclusion SURVIVE the challenges? → State it with confidence and note the strongest counter-argument
- Is the conclusion WEAKENED but still likely correct? → State it with caveats and present the counter-arguments
- Is the conclusion SERIOUSLY CHALLENGED? → Present both sides honestly and flag the uncertainty prominently

**Step 4: Include in output**
The "Competing Perspectives & Counterarguments" section of the output should contain the strongest challenge and the response to it. This is not boilerplate — it's the most intellectually honest section of the document.

---

## Confidence Calibration {#confidence-calibration}

Not all claims deserve equal confidence. Explicitly calibrate and communicate confidence throughout the output.

### Confidence Levels

**HIGH Confidence** — Use when:
- 3+ independent source types agree
- Data is quantitative and from reliable sources
- Claim is well-established in the field
- Red team challenges didn't undermine it
- Signal: State directly as a finding

**MEDIUM Confidence** — Use when:
- 2 independent source types agree, or 1 very authoritative source
- Data is partially quantitative but with gaps
- Claim is consistent with available evidence but not definitively proven
- Signal: "The evidence suggests..." or "Based on available data..."

**LOW Confidence** — Use when:
- Single source or anecdotal evidence only
- Significant data gaps
- Contradictory signals from different sources
- Signal: "Limited data suggests..." or "Based solely on [source], which may not be representative..."

**SPECULATIVE** — Use when:
- Inference based on patterns rather than direct evidence
- Extrapolation from analogous situations
- Expert opinion without supporting data
- Signal: "Extrapolating from [analog]..." or "If current trends continue..." (always flag the assumption)

### When to use each level

Throughout the output, tag significant claims with confidence levels. The reader shouldn't have to guess which findings are rock-solid vs. educated guesses.

---

## Narrative Construction {#narrative-construction}

The output should tell a story, not present a filing cabinet. Before writing, plan the narrative arc.

### The Narrative Arc for Research

**Opening (TL;DR + Context):** What's the question, and what's the answer? Start with the conclusion, not the methodology. The reader should know within 30 seconds what they're going to learn.

**Setup (Landscape):** What's the world this research exists in? Establish the context, players, and structure so the depth sections make sense.

**Development (Depth Dive):** The core findings. This is where the research earns its value. Organize by importance, not by the order you found things. Lead with the most significant insight.

**Complication (Counter-arguments):** The twist. What challenges the emerging narrative? What could go wrong? This is the red team output. Placing it after the depth section creates productive tension.

**Resolution (Decision Points + Opportunities):** Given everything above, what are the real choices? What adjacent opportunities exist? This resolves the tension and gives the reader actionable paths forward.

**Epilogue (Horizon):** Brief look at what's out there for further exploration. Leaves doors open without creating obligation.

### Transitions between sections

Every section should connect to the next. The reader should never wonder "why am I reading this now?" Use transitional logic:
- "This market structure creates a specific challenge for new entrants, which becomes clear when examining how existing players actually operate..."
- "These competitive dynamics suggest several opportunities, but whether they're achievable depends on the regulatory environment..."

---

## Absence Analysis {#absence-analysis}

What's NOT in the research can be as informative as what is. After completing synthesis, run an absence check.

### What to look for

**Missing data points:**
- Is there market sizing data? If not, why? (Too niche? Too new? Deliberately hidden?)
- Are there customer reviews? If not, why? (Too B2B? Too new? Suppressed?)
- Are there failure stories? If not, why? (Survivorship bias? Too risky to share? Hasn't been tried?)

**Missing voices:**
- Are we hearing from users/customers? Or only from providers/sellers?
- Are we hearing from regulators? Or only from the regulated?
- Are we hearing from critics? Or only from advocates?
- Are we hearing from unsuccessful attempts? Or only from successes?

**Missing comparisons:**
- Have we compared this to analogous situations? If not, why?
- Have we looked at what happened when others tried this? If not, why?

**Missing timelines:**
- Do we know the trajectory, or only the snapshot? A market at $5B growing 20% is very different from $5B declining 5%.

### How to report absences

Include a brief section in "Sources & Confidence" noting significant gaps:
"This research was unable to locate [specific data/perspective]. This gap means [implication]. To fill this gap, the user would need to [specific action: interview practitioners, commission a survey, request a regulatory opinion, etc.]."
