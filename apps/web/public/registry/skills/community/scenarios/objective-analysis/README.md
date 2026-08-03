# Objective Analysis

![A compass and crystal align a field of tangled arrows with a luminous city](assets/objective-analysis-hero.png)

[![Agent Skills open standard](https://img.shields.io/badge/Agent%20Skills-open%20standard-C9A227)](https://agentskills.io/specification)
[![License: MIT](https://img.shields.io/badge/License-MIT-222222.svg)](LICENSE)

**A reality-first Objectivist analysis skill for claims, arguments, decisions, policies, drafts, current events, and art.**

Objective Analysis applies Ayn Rand's philosophy of Objectivism as a disciplined method—not as a conclusion-matching ideology. It starts with facts, reconstructs the strongest version of an argument, tests the evidence and inference, and derives philosophical evaluation upward through the relevant branches.

The result is an agent that can take Objectivism seriously without treating Rand, the user, a favored publication, or the agent itself as infallible.

## What it does

| Layer | What the skill checks |
| --- | --- |
| Reality and evidence | Claim type, source quality, context, base rates, causal alternatives, and evidential status |
| Concepts and epistemology | Definitions, referents, hierarchy, context, package deals, floating abstractions, and arbitrary assertions |
| Logic | Deductive, inductive, abductive, causal, statistical, analogical, practical, and normative inference |
| Cognitive-bias risk | Observable cues, competing explanations, confidence level, and concrete debiasing tests—without mind reading |
| Objectivist philosophy | Metaphysics → epistemology → ethics → politics → esthetics, in that order when materially relevant |
| Action | A clear verdict, strongest objection, confidence basis, repair, rewrite, or recommended next step |

The skill supports quick audits, full analyses, deep research, self-audits and rewrites, decision and policy reviews, and esthetic analysis. Its reference library includes Objectivist foundations, concept formation, ethics, politics, esthetics, argument and evidence methods, fallacy and cognitive-bias catalogs, source guidance, and reusable output templates.

## Install

This repository follows the [Agent Skills specification](https://agentskills.io/specification). It is instruction-only: there are no executable scripts, tool dependencies, or bundled credentials.

### Codex — personal skill

Codex discovers personal skills under `~/.agents/skills`:

```bash
mkdir -p ~/.agents/skills
git clone --depth 1 https://github.com/D4ilyHub/objective-analysis.git ~/.agents/skills/objective-analysis
```

You can also ask Codex:

> Use `$skill-installer` to install the `objective-analysis` skill from `https://github.com/D4ilyHub/objective-analysis`.

Restart Codex if the new skill does not appear immediately. See OpenAI's current [Skills guidance](https://help.openai.com/en/articles/20001066-skills-in-chatgpt).

### Codex — repository skill

To make the skill available to everyone working in one repository:

```bash
mkdir -p .agents/skills
git submodule add https://github.com/D4ilyHub/objective-analysis.git .agents/skills/objective-analysis
```

Commit the submodule reference with the rest of the repository.

### ChatGPT and other compatible agents

Download the repository as a ZIP or clone it, then add the folder through your agent's Skills interface or configured skills directory. The required entry point is [`SKILL.md`](SKILL.md); product-specific clients may ignore [`agents/openai.yaml`](agents/openai.yaml).

## Use it

Invoke the skill explicitly when you want the Objectivist lens:

```text
$objective-analysis Reality-check this claim: …

$objective-analysis Audit this policy from the facts up through individual rights.

$objective-analysis Rewrite my argument. Preserve my conclusion only if the evidence supports it.

$objective-analysis Analyze this novel's theme, style, and sense of life.
```

The skill leads with the bottom line and scales its output to the request. A full audit normally includes the strongest formulation, claim map, evidence, logic, bias risks, relevant philosophical branches, strongest objection, integrated verdict, and a repaired version or action when useful.

## Design commitments

- **Reality before doctrine.** Agreement with Objectivism does not make a conclusion true.
- **Hierarchy before shortcuts.** Detailed ethical or political conclusions must be derived through the relevant prior knowledge.
- **Steelman before criticism.** Material ambiguity is surfaced rather than exploited.
- **Symmetry before partisanship.** The same tests apply to allies, opponents, sources, users, and the agent.
- **Fallacies are inference defects.** They do not automatically make a conclusion false.
- **Bias labels are hypotheses.** Text alone rarely proves a speaker's mental process.
- **Facts before live commentary.** Current law, science, statistics, history, and quotations require verification.
- **Attribution without quotation theater.** Copyrighted works are paraphrased; quotations stay brief and must be verified.

## Repository map

```text
objective-analysis/
├── README.md
├── LICENSE
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   └── objective-analysis-hero.png
└── references/
    ├── argument-and-evidence.md
    ├── cognitive-bias-catalog.md
    ├── epistemology-and-concepts.md
    ├── esthetics.md
    ├── ethics.md
    ├── fallacy-catalog.md
    ├── objectivism-foundations.md
    ├── output-templates.md
    ├── politics.md
    └── sources.md
```

## Source policy

The source map begins with Rand's published work, uses Leonard Peikoff as a systematic bridge, and integrates later Objectivist scholarship and contemporary applications on their merits. Current factual claims should be corroborated with appropriate primary records or independent field expertise. No contemporary outlet receives blanket preference, and the skill names publications in its output only when a material citation or attribution requires it.

This is an independent community project. It is not affiliated with or endorsed by the Ayn Rand Institute, the Ayn Rand Estate, or any institute, publication, author, or publisher referenced by the skill.

## Contributing

Issues and pull requests are welcome. Contributions should preserve the reality-first method, distinguish fact from evaluation, avoid invented quotations or citations, and add only material that improves repeatable analysis.

## License and artwork

Released under the [MIT License](LICENSE). The hero artwork is an original AI-generated image supplied by the repository owner and is included under the same license.
