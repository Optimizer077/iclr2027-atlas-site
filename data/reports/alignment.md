# Alignment, Preference Learning & RLHF — ICLR 2027 domain brief

## Snapshot

816 papers; mean rating **2.255** on the 1–4 scale. Venue-wide mean of paper means: **2.31**.

Source: [supplied alignment pack](../inputs/alignment.json). Snapshot statistics cover the full major; paper-level discussion uses its top 60. Fine tags overlap, including tags from other majors, so counts must not be summed. All fine categories in the pack appear below, sorted by descending count. Aggregate review counts and standard deviations are not supplied.

| Fine category | Count | Mean rating | Versus venue mean (2.31) |
| --- | ---: | ---: | --- |
| `alignment.sycophancy` | 254 | 2.252 | Below |
| `alignment.other` | 213 | 2.253 | Below |
| `alignment.preference` | 190 | 2.269 | Below |
| `alignment.reward-modeling` | 105 | 2.322 | Above |
| `alignment.llm-judge` | 102 | 2.145 | Below |
| `alignment.pluralistic` | 26 | 2.208 | Below |
| `multimodal.vlm` | 20 | 2.204 | Below |
| `probabilistic.uq` | 15 | 2.311 | Above |
| `interpretability.steering` | 6 | 2.253 | Below |
| `llm-agents.agents` | 6 | 2.486 | Above |
| `multimodal.vlm-hallucination` | 5 | 2.333 | Above |
| `interpretability.sae` | 4 | 2.500 | Above |
| `llm-reasoning.cot` | 4 | 2.146 | Below |
| `llm-reasoning.rl-reasoning` | 4 | 2.583 | Above |
| `representation.ssl` | 4 | 1.917 | Below |
| `rl.deep-rl` | 4 | 1.950 | Below |
| `causal.causal-inference` | 3 | 1.889 | Below |
| `evaluation.llm-bench` | 3 | 1.861 | Below |
| `gen-vision.t2i` | 3 | 3.111 | Above |
| `interpretability.probing` | 3 | 2.389 | Above |
| `llm-core.finetune` | 3 | 2.861 | Above |
| `llm-reasoning.verifiers` | 3 | 2.222 | Below |
| `multimodal.video-understanding` | 3 | 2.111 | Below |
| `optimization.optimizers` | 3 | 2.444 | Above |
| `rl.exploration` | 3 | 2.333 | Above |
| `applications.finance-edu` | 2 | 2.167 | Below |
| `diffusion.discrete` | 2 | 2.167 | Below |
| `embodied.manipulation` | 2 | 2.167 | Below |
| `graphs.graph-llm` | 2 | 2.417 | Above |
| `llm-agents.deep-research` | 2 | 2.000 | Below |
| `llm-agents.multi-agent` | 2 | 2.333 | Above |
| `llm-core.long-context` | 2 | 2.833 | Above |
| `representation.domain` | 2 | 2.667 | Above |
| `rl.model-based` | 2 | 1.667 | Below |
| `science.health` | 2 | 2.000 | Below |
| `time-series.forecasting` | 2 | 2.333 | Above |
| `vision.low-level` | 2 | 2.625 | Above |
| `applications.nlp` | 1 | 2.000 | Below |
| `causal.formal` | 1 | 2.000 | Below |
| `diffusion.alignment` | 1 | 2.000 | Below |
| `diffusion.architecture` | 1 | 2.333 | Above |
| `diffusion.sampling` | 1 | 2.000 | Below |
| `embodied.world-models` | 1 | 3.000 | Above |
| `gen-vision.video` | 1 | 3.000 | Above |
| `interpretability.mech-interp` | 1 | 2.667 | Above |
| `llm-agents.code` | 1 | 2.333 | Above |
| `llm-agents.memory` | 1 | 2.000 | Below |
| `llm-core.architecture` | 1 | 2.250 | Below |
| `llm-core.moe` | 1 | 2.333 | Above |
| `llm-efficiency.kv-cache` | 1 | 2.000 | Below |
| `llm-reasoning.self-improve` | 1 | 2.000 | Below |
| `llm-reasoning.test-time` | 1 | 1.667 | Below |
| `neuro-cog.brain` | 1 | 2.667 | Above |
| `neuro-cog.cognition` | 1 | 2.000 | Below |
| `optimization.bo-hpo` | 1 | 2.333 | Above |
| `optimization.convex` | 1 | 2.667 | Above |
| `representation.meta` | 1 | 1.000 | Below |
| `rl.rl-theory` | 1 | 1.667 | Below |
| `safety.jailbreak` | 1 | 1.667 | Below |
| `safety.unlearning` | 1 | 2.000 | Below |
| `science.molecules` | 1 | 3.000 | Above |
| `theory.generalization` | 1 | 2.333 | Above |
| `vision.detection-seg` | 1 | 2.333 | Above |
| `vision.medical-imaging` | 1 | 3.000 | Above |

## Top 15 papers

Rank is within this major, preserving the input order, including ties. The pack omits reviewer confidence, so confidence-weighted tie-breaks cannot be independently checked. n counts the listed ratings; std is their population standard deviation, calculated from those ratings.

| Rank | #number | Title | Mean (individual ratings); n; std | One-line idea |
| ---: | --- | --- | --- | --- |
| 1 | #10345 | [OSReward: Instituting Standardized Evaluation for Cross-Platform Computer-Use Reward Models](https://openreview.net/forum?id=eQAELNKt4a) | 4.000 (4, 4, 4); n=3; std=0.000 | Benchmark trajectory judges against human verdicts and train open reward models on reasoning-annotated computer-use judgments. |
| 2 | #26575 | [Mass Producing Training Data with Surprising Side Effects](https://openreview.net/forum?id=2tazO2bYY3) | 4.000 (4, 4, 4); n=3; std=0.000 | Search for ordinary-looking training datasets that induce unexpected behaviors, then filter them using held-out side-effect metrics. |
| 3 | #51312 | [Training Honesty Adapters To Detect Deception In LLMs](https://openreview.net/forum?id=gpt1K3Ia4D) | 3.667 (4, 3, 4); n=3; std=0.471 | Train LoRA honesty adapters on on-policy transcripts and score forced admissions against denials to detect hidden behavior. |
| 4 | #60414 | [Toward a Science of Model Organisms](https://openreview.net/forum?id=LcWx5qZ1Rj) | 3.667 (4, 4, 3); n=3; std=0.471 | Compare deliberately constructed model organisms across behavioral properties using a shared evaluation suite. |
| 5 | #55736 | [From Task-Oriented Agents to Personalized Teammates: Understanding Continual Adaptation in Cooperative Games](https://openreview.net/forum?id=yFpANKjW9f) | 3.333 (4, 4, 2); n=3; std=0.943 | Initialize teammate preferences from endorsements, learn player proxies from gameplay, and continue task-reward learning with those proxies. |
| 6 | #2720 | [EviScene: Beyond “Is It AI?” for Agentic Image Factuality Assessment](https://openreview.net/forum?id=nJsLCIVXUQ) | 3.333 (4, 4, 2); n=3; std=0.943 | Interleave visual inspection and external retrieval, refining factual questions as an agent gathers evidence about depicted situations. |
| 7 | #47386 | [Better Reviews, Busier Area Chairs: Why a Little Human Judgment Matters in AI-Assisted Review](https://openreview.net/forum?id=a7LlI2n7OB) | 3.333 (4, 3, 3); n=3; std=0.471 | Model area-chair assessment cost through Bayesian decision-making and study how independent reviewer judgment changes downstream workload. |
| 8 | #877 | [Seeing Before Believing:  Mitigating Hallucinations in Multimodal Reasoning via Visually-Anchored Latent Rectification](https://openreview.net/forum?id=bkgtGTOmAI) | 3.333 (3, 3, 4); n=3; std=0.471 | Retrieve and fuse visual evidence into candidate latent states, selecting refinements by visually induced confidence gains. |
| 9 | #14498 | [JudgeProfile: Understanding and Steering Subjectivity in LLM Judges](https://openreview.net/forum?id=AeTWiBS8XU) | 3.333 (3, 3, 4); n=3; std=0.471 | Separate judges' attribute perceptions from prioritization weights and reweight attributes toward reference evaluation standards. |
| 10 | #45416 | [AltRA-Test: An Alternative Annotator Test for LLM Judges Without Shared Annotators](https://openreview.net/forum?id=RUeuVDvSod) | 3.333 (3, 4, 3); n=3; std=0.471 | Bootstrap item-specific human panels and test whether replacing one annotation with an LLM preserves agreement. |
| 11 | #12790 | [PanoReward: Adaptive Multi-Criteria Reward Modeling for Panoramic Image Generation](https://openreview.net/forum?id=8INk8tEqYf) | 3.333 (3, 3, 4); n=3; std=0.471 | Predict panoramic-image rewards across geometric, polar-quality, and text-consistency criteria with preference-conditioned weights. |
| 12 | #42810 | [What you ask is what you get: Evaluating Robustness of Eliciting LLM Moral Profiles](https://openreview.net/forum?id=qTcPvZGxrl) | 3.333 (3, 3, 4); n=3; std=0.471 | Compare questionnaire and interview moral profiles, then test profile-conditioned behavior on a downstream classification task. |
| 13 | #44806 | [Unlicensed Repair: When Large Language Models Turn Impossible Quantities into Plausible Answers](https://openreview.net/forum?id=Uad5ZyZbzM) | 3.333 (4, 3, 3); n=3; std=0.471 | Use matched word-problem controls to test whether models alter premises after recognizing impossible quantities. |
| 14 | #48705 | [Hallucinated Heterogeneity: LLM Social Simulations Exaggerate Who Responds to Interventions](https://openreview.net/forum?id=i3NrXiOwo7) | 3.333 (4, 3, 3); n=3; std=0.471 | Compare simulated subgroup treatment effects and targeting decisions against randomized human experiments. |
| 15 | #49022 | [Precision-Aware Learning Rate Transfer Across Block Count in LLM Post-Training](https://openreview.net/forum?id=kCChCaXb7h) | 3.333 (4, 3, 3); n=3; std=0.471 | Tune learning rates on a few trainable blocks and transfer them using precision-dependent scaling rules. |

## Themes & trends

Recurring mechanisms in this selected top-60 set; the pack does not establish change over time or domain-wide prevalence.

- Judgment decomposes into inspectable criteria: #14498 separates attribute perception from weighting; #12790 conditions panoramic reward weights on task preferences.
- Judge validation uses external reference judgments: #10345 labels computer-use outcomes through human annotation; #45416 tests replacement through paired human and mixed panels.
- Model organisms support controlled behavior audits: #60414 compares construction methods across property profiles, while #51312 trains deception monitors on organism-generated transcripts.
- Visual factuality requires evidence, not confidence alone: #2720 alternates inspection and retrieval; #877 incorporates image evidence into latent-state refinement.
- Controlled comparisons expose misleading aggregate answers: #44806 changes quantities or their meanings in paired controls, while #48705 checks subgroup effects against randomized human outcomes.

## Score signals

Reward modeling is the only `alignment.*` group above 2.31, at 2.322 across 105 papers, a gap of just 0.012. Preference learning (190; 2.269), `other` (213; 2.253), honesty/sycophancy/calibration (254; 2.252), pluralistic alignment (26; 2.208), and LLM judging (102; 2.145) fall below it. The major mean is 2.255. Strong individual judge papers in the top table coexist with a below-baseline judge-category mean; the selected papers should not be treated as a representative sample.

The snapshot table marks every supplied fine category above, below, or equal to 2.31, including cross-major tags. These are descriptive comparisons within this major, not venue-wide estimates for each tag; overlapping groups and small counts do not establish statistically reliable differences.

## Taxonomy notes

Suggested corrections from the abstracts, not applied changes. Each entry gives a proposed major and fine tags; secondary tags can preserve the method when the research object suggests a different major.

- #49022 → major `optimization`, fine `optimization.optimizers` plus `llm-core.finetune`: the mechanism transfers learning rates across trainable block counts and numerical precisions.
- #877 → major `multimodal`, fine `multimodal.vlm-hallucination` and `multimodal.vlm-reasoning`: the failure and correction both concern visual grounding during multimodal reasoning.
- #2720 → major `llm-agents`, fine `llm-agents.deep-research` and `llm-agents.agents`: a retrieval-enabled agent investigates external factual support for images rather than the honesty of an LLM's own answer.
- #49973 → major `llm-efficiency`, fine `llm-efficiency.kv-cache` plus `llm-core.long-context`: preferences rank attention keys to train compressed query/key projections, not human response choices.
- #1864 → major `safety`, fine `safety.adversarial` plus `gen-vision.editing`: image immunization protects against unauthorized manipulation through encoder perturbations.
- #33218 → major `evaluation`, fine `evaluation.eval-methods` plus `gen-vision.t2i`: the paper analyzes semantic failures of image-generation metrics, not LLM sycophancy.
- #55736 → retain major `alignment`, add `alignment.pluralistic` and `rl.marl` alongside `alignment.preference`: personalized cooperation depends on player preferences and the training-partner distribution.

No new fine category proposed. The pack does not establish the required ≥25-paper support for a distinct new category (rule T3); the corrections above can use existing tags.

