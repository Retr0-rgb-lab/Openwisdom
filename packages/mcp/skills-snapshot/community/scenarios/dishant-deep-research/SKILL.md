---
name: dishant-deep-research
description: "Conduct deep, structured research on any topic — markets, products, features, competitors, problems, industries, regulations, or opportunities. Trigger whenever the user wants to research, explore, investigate, analyze, or understand something. This includes: entering new markets, evaluating products or services, exploring features, solving business problems, competitive landscapes, regulatory research, or any \"I need to understand X\" scenario. Also trigger for: \"look into,\" \"dig into,\" \"explore whether,\" \"map out the landscape,\" \"what are the options for X,\" \"how does Y work in practice.\" Trigger aggressively — if there's research intent, use this skill. Covers: market research, competitive analysis, feature exploration, regulatory deep-dives, product evaluation, problem-solving, opportunity assessment, landscape mapping."
layer: scenario
scope: community
disciplines: ["political-science", "economics", "sociology"]
language: "en"
tags: ["deep-research", "red-team", "pestel", "market-research", "curated-external", "openwisdom"]
version: "0.1.0"
license: "MIT"
metadata:
  openwisdom: true
  provenance: curated-external
  upstream: "https://github.com/DishantPal/deep-research-skill/tree/main/deep-research"
  note: "Distinct from daymade-deep-research already in catalog"
---


# Deep Research Skill

## Core Philosophy

Most research is shallow. It covers what's easily Googlable, presents generic overviews, and stops at the surface. This skill exists to go far beyond that.

**The Delivery Rule:**
- Never deliver less than 7x of what was asked
- Aim for 10-15x: thorough coverage plus adjacent territory the user didn't request
- For anything in the 25x zone (interesting but outside scope), include brief pointers so nothing important stays invisible

**The Quality Standard:**
Every section must pass the "experienced practitioner" test — would someone who's been in this space for 5 years learn something new from this output? If not, go deeper. Surface-level overviews are never acceptable as a final deliverable.

---

## Step 1: Mode Detection

Determine the research mode before doing anything else.

### Mode A: Guided (Interactive)
**Trigger when:** The prompt is vague, broad, ambiguous, or could go in multiple very different directions. Or the user explicitly says "ask me questions first."

**Process:**
1. Ask 3-5 sharp questions using the Question Decomposition technique (below)
2. Present a Research Plan and confirm
3. Execute

**Question Decomposition Technique:**
Do not ask generic questions. Decompose the research space into decision-relevant dimensions:

- **Goal Question:** "What decision will this research inform?" (Not "what do you want to know" — that's circular)
- **Boundary Question:** "What's explicitly out of scope?" (Prevents going wide in the wrong direction)
- **Knowledge Question:** "What do you already know or believe about this?" (Avoids repeating known info, surfaces assumptions to test)
- **Constraint Question:** "Are there non-negotiable constraints?" (Budget, timeline, regulatory, technical)
- **Success Question:** "If this research goes perfectly, what does it let you do tomorrow?" (Reveals the real goal behind the stated goal)

Pick 3-5 of these based on what's actually ambiguous. Never ask all 5 if 3 will do.

### Mode B: Autonomous (Self-Contained)
**Trigger when:** The prompt is specific, detailed, and provides clear context. Or the user says "just go" or gives a complete brief.

**Process:**
1. Internally build the Research Plan
2. Execute immediately
3. Deliver the full output

### Ambiguous Cases
Default to 2 quick questions max. The user would rather get 80% right research fast than wait through 10 questions for 95% right.

---

## Step 2: Research Planning

### Build the Internal Research Plan

Every research execution builds this plan (shown to user in Guided mode, internal in Autonomous):

1. **Core Question** — One sentence stating exactly what we're trying to understand
2. **Research Category** — Classify the topic (see Playbooks in `references/playbooks.md`)
3. **Framework Selection** — Which analytical frameworks apply? (see `references/frameworks.md`)
4. **Layer Map** — What belongs in each of the 5 layers for this specific topic?
5. **Source Strategy** — Which sources carry the most weight? (see `references/source-selection.md`)
6. **Known Unknowns** — What do we know we don't know?
7. **Hypothesized Unknown Unknowns** — What might exist that hasn't been thought to look for?

### Framework Selection Logic

Before executing research, select 1-3 analytical frameworks from `references/frameworks.md` that fit the topic. Framework selection follows this logic:

| If the research involves... | Use these frameworks |
|---|---|
| Entering a new market or industry | PESTEL + Porter's Five Forces + Market Segmentation |
| Understanding customer needs or product-market fit | Jobs-to-be-Done + Value Proposition Canvas |
| Evaluating competitive position | Competitive Positioning Map + Porter's Five Forces |
| Assessing a business opportunity | Business Model Canvas + SWOT (done properly) |
| Regulatory or policy landscape | Regulatory Landscape Mapping + PESTEL |
| Technology or product decisions | Technology Adoption Lifecycle + Build vs Buy Matrix |
| Solving an operational problem | Root Cause Analysis + Analogous Industry Scan |

Read `references/frameworks.md` for full framework instructions before applying them. Do not use frameworks you haven't read the instructions for — a poorly applied framework is worse than no framework.

---

## Step 3: Research Execution — The 5 Layers

### Layer 1: Surface Scan
The easily accessible information. Table stakes.

**Capture:** Key players, standard definitions, basic market data, conventional wisdom, the "Wikipedia version."

**Time allocation:** ~10% of effort. Get this done fast and move on.

**Quality gate:** Can you name the top 5-10 players, define the key terms, and state the market size (if applicable) with a source? If yes, Layer 1 is done.

### Layer 2: Structure & Landscape
How the space is organized — not a list, but a map with decision logic.

**Capture:** Market segments with real differentiators, business model variations with tradeoffs, regulatory framework, the decision tree of how options branch.

**The key technique:** For every option, answer three questions:
- When does this option WIN? (What conditions make it the best choice?)
- What does this option SACRIFICE? (What do you give up?)
- Who actually CHOOSES this option and why? (Real examples, not hypotheticals)

**Quality gate:** Could someone use this section to make a preliminary decision about which segment/approach to pursue? If not, it's too shallow.

### Layer 3: Depth Dive (Where the Value Lives)

This is the most important layer. Most research stops at Layer 2. This skill keeps going.

**Capture:**
- Real-world case studies (successes AND failures, with specifics — names, numbers, timelines)
- Implementation gotchas and hidden costs nobody mentions upfront
- Regulatory edge cases and how they're actually enforced (vs. what's written)
- What experienced practitioners say privately vs. the official narrative
- Second-order effects ("if you do X, then Y also happens, which causes Z")
- Failure modes and the common mistakes that cause them
- The gap between marketing claims and operational reality

**Where to find Layer 3 information:**
- Reddit and niche forums (real practitioner experiences, search for specific terms + "reddit")
- Negative reviews on G2, Capterra, App Store (reveals real pain points)
- Government enforcement actions and audit findings
- Conference talks and podcast interviews (practitioners are more candid in conversation)
- Support forums and help documentation (reveals actual problems)
- Job postings (reveal where companies are investing and struggling)
- Regulatory comment periods (reveal industry concerns)
- Court filings and FTC actions (reveal what goes wrong)
- Academic "limitations" sections (researchers are honest about gaps)

**The Absence Test:** After gathering Layer 3 information, ask: "What am I NOT seeing? What should exist here but doesn't?" Absence of information is itself informative — if nobody is writing about failure cases, either the space is too new or failures are being hidden.

**Quality gate:** Does this section contain at least 3 specific, non-obvious insights that would surprise someone with surface-level knowledge of the topic? If not, go deeper.

### Layer 4: Adjacent Opportunities (10-15x Zone)
Things the user didn't ask about but should know exist.

**Identification techniques:**
- **Customer-outward:** "Who else serves this customer, and what else do they need?"
- **Solution-outward:** "What other problems does this solution partially address?"
- **Regulatory-outward:** "What other rules/programs share the same regulatory framework?"
- **Technology-outward:** "What other applications use the same underlying technology?"
- **Business-model-outward:** "What other businesses use a similar revenue/delivery model?"

**For each adjacency, provide:**
- What it is (1-2 sentences)
- Why it's relevant to the original question
- Signal strength (high / medium / low)
- The one thing to search if the user wants to explore it

**Quality gate:** At least 3 adjacent opportunities identified. At least 1 should be genuinely surprising.

### Layer 5: Horizon Pointers (25x Zone)
Brief flags for things that exist but are outside scope.

**Format:** 3-8 items, each with a one-liner, why it might matter, and a starting point for exploration.

**Quality gate:** These should be things the user would thank you for mentioning, not obvious filler.

---

## Step 4: Synthesis

After gathering information across all 5 layers, do NOT dump findings into the output template. First, synthesize.

Read the full synthesis methodology at: `references/synthesis-engine.md`

The core synthesis steps are:

### 4a. Triangulate
Cross-reference findings from different source types. Where do 3+ independent sources agree? That's high-confidence. Where do sources contradict? That needs explicit treatment.

### 4b. Identify Patterns
Look across all findings for:
- **Convergence patterns:** Multiple unrelated sources pointing to the same conclusion
- **Divergence patterns:** A clear split between two camps (both may be right in different contexts)
- **Silence patterns:** Something that should be discussed but isn't
- **Trend patterns:** Directional movement across time

### 4c. Extract Insights (Not Just Facts)
An insight is a fact + context + implication. Transform raw findings:
- **Fact:** "Company X launched feature Y in 2024"
- **Insight:** "Company X launched feature Y in 2024, which signals that the market is moving toward Z. This matters because it changes the competitive dynamics for anyone entering now — you'd need to match Y as table stakes rather than treating it as a differentiator."

Every major finding in the output should be elevated from fact to insight.

### 4d. Red Team Your Own Conclusions

Before finalizing, deliberately attempt to disprove the emerging narrative. This is mandatory, not optional.

**Red Team Checklist:**
- What's the strongest argument AGAINST the conclusion forming in this research?
- What would need to be true for the opposite conclusion to hold?
- Is there survivorship bias? (Are we only seeing the successes?)
- Is there recency bias? (Are we overweighting recent events?)
- Is there source bias? (Are most of our sources from one perspective?)
- What would a skeptic say about this research?
- What's the most likely way this research could be WRONG?

Surface the strongest counter-argument in the output. If the research conclusion still holds after red-teaming, say so and explain why. If the red team raises genuine doubts, flag them prominently.

### 4e. Build the Narrative Arc

The output should tell a story, not present a filing cabinet. Before writing, identify:
- What's the single most important thing the reader should understand?
- What's the natural order of revelation? (What does the reader need to understand first before the next piece makes sense?)
- Where are the "turns" — the moments where the obvious assumption gets challenged?

---

## Step 5: Output Construction

### Format Selection
- **Markdown (.md):** Default for most research. Quick to read, easy to reference.
- **Word document (.docx):** Use when the topic is formal, the output is very long (5000+ words), or the context suggests the deliverable will be shared externally.

### Document Structure

```
# [Research Topic]: Deep Research Brief

## TL;DR
3-5 sentences. The most important findings. A busy person who reads only this
walks away with the key insight. This is NOT a summary of what the doc covers —
it's the answer.

## Context & Scope
What was researched, why, and what's explicitly in/out of scope. State the
frameworks used and why.

## The Landscape
Layer 1 + Layer 2 combined into a coherent narrative. Use the most appropriate
structure for the topic:
- Comparison tables for evaluating alternatives
- Decision trees for branching choices
- Market maps for competitive positioning
- Segment breakdowns for market entry
Apply the selected analytical framework(s) here.

## [Custom Title for the Depth Section]
Layer 3 content. Title this section based on the actual content:
- "Implementation Reality" for product/feature research
- "What Practitioners Actually Experience" for market research
- "Regulatory Deep Cuts" for compliance research
- "How Others Solved This" for problem-solving research

Subsections follow the natural structure of findings. Use specific case studies,
contrasting perspectives, and concrete examples.

## Adjacent Opportunities
Layer 4 content. Each item structured with:
- What it is
- Why it's relevant
- Signal strength
- Next step to explore

## Competing Perspectives & Counterarguments
Red team output. The strongest case against the emerging conclusions.
Why the research might be wrong. What would need to be true for the
opposite conclusion to hold.

## Decision Points
(If the research informs a decision)
Crystallize key tradeoffs into clearly framed choices:
- Option A: [description] → leads to [outcome], sacrifices [tradeoff]
- Option B: [description] → leads to [outcome], sacrifices [tradeoff]
Not recommendations unless explicitly asked — just cleanly framed decisions
with consequences.

## Horizon: Worth Knowing About
Layer 5 content. Brief pointers to the 25x zone.

## Sources & Confidence
What sources were used, why chosen, confidence level on key claims.
Flag anything where information was thin, contradictory, or limited.
Rate overall confidence: HIGH / MEDIUM / LOW with reasoning.
```

### Writing Standards

- Write in prose, not bullet dumps. Bullets only for genuinely list-like content
- Every substantive claim gets a source or confidence level
- Competing perspectives sit side by side, not buried
- Numbers always get context (market size needs growth rate, comparable benchmarks, or "so what")
- Tables for comparisons (2+ options, 3+ dimensions)
- Section lengths proportional to importance, not equal
- No filler phrases ("in today's rapidly evolving landscape," "it's important to note")
- No jargon without definition on first use
- Active voice, direct statements
- When uncertain, say so explicitly with reasoning

---

## Execution Checklist (Verify Before Delivering)

- [ ] TL;DR could stand alone and answers the actual question
- [ ] At least one analytical framework was applied (not just mentioned)
- [ ] Layer 3 exists and contains 3+ non-obvious insights
- [ ] At least 3 adjacent opportunities surfaced (Layer 4)
- [ ] Horizon pointers included (Layer 5)
- [ ] Red team step completed — counter-arguments are in the document
- [ ] Competing perspectives represented
- [ ] Sources and confidence levels noted throughout
- [ ] Synthesis happened — output contains insights, not just facts
- [ ] Document tells a narrative, not a data dump
- [ ] Someone with zero knowledge could follow the document
- [ ] Someone with deep knowledge would learn something new
- [ ] Output is genuinely 10x+ of a surface-level answer
- [ ] No section is generic filler
- [ ] The "so what" is clear for every major finding

---

## Reference Files

Read these BEFORE executing research. They contain detailed methodology that dramatically improves output quality.

| File | What it contains | When to read |
|---|---|---|
| `references/frameworks.md` | 12 analytical frameworks with selection logic and application instructions | Always — select frameworks during planning |
| `references/synthesis-engine.md` | Synthesis techniques, red-team methodology, pattern recognition, confidence calibration | Always — use during Step 4 |
| `references/playbooks.md` | Step-by-step research playbooks for 6 research categories | Read the relevant playbook for your topic |
| `references/source-selection.md` | Source categories, weighting by topic, red flags, conflict resolution | Always — use during source strategy |
| `references/examples.md` | Good vs bad output comparisons with commentary | Read when uncertain about quality bar |

---

## What NOT to Do

- Never deliver a generic overview and call it research
- Never present information without context or "so what"
- Never skip Layer 3 — this is where the value lives
- Never skip the red team step — unchallenged conclusions are unreliable
- Never present a single narrative without acknowledging competing views
- Never use filler phrases or hedge unnecessarily
- Never dump bullets without synthesis
- Never present data without sourcing or confidence framing
- Never stop at what was asked — always deliver the 10-15x
- Never apply a framework superficially — a checkbox PESTEL is worse than no PESTEL
- Never assume the first narrative that emerges is correct

## Upstream

https://github.com/DishantPal/deep-research-skill/tree/main/deep-research

This skill was curated into Openwisdom for discovery and local install.
Prefer the upstream repository for the latest author intent and license terms.

## Provenance

- Author: DishantPal
- Attribution: DishantPal/deep-research-skill
- License: MIT
- Openwisdom provenance: curated-external (installable community pack)

## Agent instructions

You are applying this Openwisdom skill in the current coding-agent session.
Follow the workflow in this skill. Do not invent hosted Openwisdom chat.
Analysis runs here in this agent, not on openwisdom.vercel.app.
