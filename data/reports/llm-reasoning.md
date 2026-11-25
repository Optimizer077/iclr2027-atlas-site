# LLM Reasoning & Test-Time Compute — ICLR 2027 domain brief

## Snapshot

2,042 papers; mean rating **2.266** on the 1–4 scale. Venue-wide mean of paper means: **2.31**.

Source: [supplied llm-reasoning pack](../inputs/llm-reasoning.json). Snapshot statistics cover the full major; paper-level discussion uses its top 60. Fine tags overlap, including tags from other majors, so counts must not be summed. All fine categories in the pack appear below, sorted by descending count. Aggregate review counts and standard deviations are not supplied.

| Fine category | Count | Mean rating | Versus venue mean (2.31) |
| --- | ---: | ---: | --- |
| `llm-reasoning.other` | 459 | 2.276 | Below |
| `llm-reasoning.self-improve` | 449 | 2.260 | Below |
| `llm-reasoning.rl-reasoning` | 415 | 2.282 | Below |
| `llm-reasoning.cot` | 379 | 2.260 | Below |
| `llm-reasoning.test-time` | 292 | 2.298 | Below |
| `llm-reasoning.verifiers` | 233 | 2.209 | Below |
| `llm-reasoning.math` | 129 | 2.219 | Below |
| `llm-agents.agents` | 32 | 2.290 | Below |
| `rl.deep-rl` | 27 | 2.318 | Above |
| `alignment.reward-modeling` | 22 | 2.348 | Above |
| `rl.exploration` | 22 | 2.472 | Above |
| `probabilistic.uq` | 12 | 2.361 | Above |
| `representation.ssl` | 10 | 2.150 | Below |
| `llm-agents.code` | 9 | 2.222 | Below |
| `multimodal.vlm` | 9 | 2.352 | Above |
| `llm-agents.memory` | 8 | 2.375 | Above |
| `multimodal.vlm-reasoning` | 7 | 2.429 | Above |
| `neuro-cog.cognition` | 7 | 1.905 | Below |
| `llm-core.architecture` | 6 | 2.292 | Below |
| `optimization.optimizers` | 6 | 2.417 | Above |
| `vision.detection-seg` | 6 | 2.292 | Below |
| `llm-core.long-context` | 5 | 2.400 | Above |
| `llm-efficiency.speculative` | 5 | 2.383 | Above |
| `causal.causal-inference` | 4 | 2.417 | Above |
| `causal.formal` | 4 | 2.167 | Below |
| `diffusion.discrete` | 4 | 2.000 | Below |
| `graphs.topology` | 4 | 2.000 | Below |
| `llm-agents.multi-agent` | 4 | 2.125 | Below |
| `llm-core.finetune` | 4 | 1.750 | Below |
| `time-series.forecasting` | 4 | 2.333 | Above |
| `alignment.sycophancy` | 3 | 2.083 | Below |
| `applications.nlp` | 3 | 2.556 | Above |
| `gen-vision.ar-visual` | 3 | 2.667 | Above |
| `interpretability.sae` | 3 | 2.333 | Above |
| `llm-agents.deep-research` | 3 | 2.333 | Above |
| `llm-core.data` | 3 | 2.167 | Below |
| `optimization.federated` | 3 | 2.222 | Below |
| `probabilistic.bayesian` | 3 | 2.333 | Above |
| `science.health` | 3 | 2.222 | Below |
| `theory.transformer-theory` | 3 | 2.778 | Above |
| `applications.recsys` | 2 | 2.000 | Below |
| `applications.tabular` | 2 | 2.750 | Above |
| `diffusion.alignment` | 2 | 2.667 | Above |
| `evaluation.datasets` | 2 | 2.500 | Above |
| `evaluation.llm-bench` | 2 | 1.833 | Below |
| `graphs.graph-llm` | 2 | 2.417 | Above |
| `interpretability.mech-interp` | 2 | 2.250 | Below |
| `interpretability.probing` | 2 | 2.000 | Below |
| `llm-agents.tool-use` | 2 | 1.833 | Below |
| `llm-efficiency.kv-cache` | 2 | 2.500 | Above |
| `llm-efficiency.pruning` | 2 | 2.167 | Below |
| `rl.model-based` | 2 | 2.167 | Below |
| `safety.agent-safety` | 2 | 2.100 | Below |
| `safety.jailbreak` | 2 | 2.083 | Below |
| `science.scientific-discovery` | 2 | 2.458 | Above |
| `theory.generalization` | 2 | 2.167 | Below |
| `alignment.llm-judge` | 1 | 1.667 | Below |
| `diffusion.architecture` | 1 | 3.667 | Above |
| `diffusion.guidance` | 1 | 2.333 | Above |
| `embodied.driving` | 1 | 2.667 | Above |
| `embodied.navigation` | 1 | 2.333 | Above |
| `evaluation.eval-methods` | 1 | 2.333 | Above |
| `gen-vision.three-d` | 1 | 2.000 | Below |
| `graphs.gnn` | 1 | 2.667 | Above |
| `interpretability.steering` | 1 | 2.667 | Above |
| `interpretability.xai` | 1 | 2.333 | Above |
| `llm-core.scaling` | 1 | 3.333 | Above |
| `multimodal.audio-speech` | 1 | 2.000 | Below |
| `multimodal.efficient-vlm` | 1 | 2.333 | Above |
| `multimodal.video-understanding` | 1 | 3.000 | Above |
| `neuro-cog.brain` | 1 | 2.000 | Below |
| `optimization.convex` | 1 | 1.667 | Below |
| `probabilistic.sampling` | 1 | 2.667 | Above |
| `representation.continual` | 1 | 2.333 | Above |
| `representation.domain` | 1 | 1.333 | Below |
| `representation.semi-weak` | 1 | 1.667 | Below |
| `rl.marl` | 1 | 1.667 | Below |
| `safety.fairness` | 1 | 2.667 | Above |
| `safety.watermark` | 1 | 2.750 | Above |
| `science.molecules` | 1 | 1.667 | Below |
| `science.protein` | 1 | 1.667 | Below |
| `vision.medical-imaging` | 1 | 2.000 | Below |
| `vision.three-d-vision` | 1 | 1.667 | Below |

## Top 15 papers

Rank is within this major, preserving the input order, including ties. The pack omits reviewer confidence, so confidence-weighted tie-breaks cannot be independently checked. n counts the listed ratings; std is their population standard deviation, calculated from those ratings.

| Rank | #number | Title | Mean (individual ratings); n; std | One-line idea |
| ---: | --- | --- | --- | --- |
| 1 | #24179 | [Compare to Correct: Pairwise-Guided Logit Adjustment for LLM Test-Time Scaling](https://openreview.net/forum?id=3jRtNUf9T6) | 3.667 (3, 4, 4); n=3; std=0.471 | Adjust answer-voting logits using pairwise confidence comparisons within a KL-regularized objective. |
| 2 | #44713 | [Efficient Best-of-N Policy Evaluation for Inference-Time Alignment](https://openreview.net/forum?id=S2wu8zXYWH) | 3.667 (4, 3, 4); n=3; std=0.471 | Estimate best-of-N policy values from score-rank probabilities and reuse auxiliary samples to select sampling budgets. |
| 3 | #44765 | [Circular Predictive Coding Models Unlock Test-Time Computation](https://openreview.net/forum?id=l8cRwOCaUt) | 3.667 (4, 4, 3); n=3; std=0.471 | Close predictive-coding networks into recurrent loops and train implicit computation through equilibrium propagation. |
| 4 | #14921 | [SpinningRL: Boosting RLVR Efficiency with Theoretical Reward Gain Modeling and Adaptive UCB Sampling](https://openreview.net/forum?id=3bWLsX86q3) | 3.667 (3, 4, 4); n=3; std=0.471 | Estimate potential reward gains from rollouts and prioritize training prompts through adaptive upper-confidence-bound sampling. |
| 5 | #22329 | [You Don't Need to Run Every Eval](https://openreview.net/forum?id=TO4Jk7wG05) | 3.667 (4, 3, 4); n=3; std=0.471 | Complete benchmark score matrices with two latent factors and select small benchmark subsets for predicting remaining scores. |
| 6 | #16882 | [LaDi-RL: Latent Diffusion Reasoning Prevents Diversity Collapse in Reinforcement Learning](https://openreview.net/forum?id=8QDrmv2Qn9) | 3.667 (3, 4, 4); n=3; std=0.471 | Generate latent reasoning trajectories with diffusion and average rewards across multiple textual decodings for latent credit assignment. |
| 7 | #25246 | [Self-correction Optimization for Interleaved Multimodal Generation](https://openreview.net/forum?id=MiA5ItRJ3E) | 3.667 (3, 4, 4); n=3; std=0.471 | Minimally adjust classifier-free guidance under new-event and state-preserving constraints for consistent interleaved image-text generation. |
| 8 | #34148 | [Measuring Combinatorial Creativity in LLMs](https://openreview.net/forum?id=pO7UlTVbOI) | 3.667 (4, 3, 4); n=3; std=0.471 | Evaluate associations, analogies, and conceptual blends between unrelated entities to measure combinatorial creativity. |
| 9 | #52073 | [Provable Compositional Reasoning via Curriculum Learning](https://openreview.net/forum?id=bm3NOmiwlx) | 3.667 (3, 4, 4); n=3; std=0.471 | Recursively learn shorter semiautomaton computations and compose them to reduce supervision and reference-policy coverage requirements. |
| 10 | #55926 | [Diversifying RLVR Rollouts via First-Token Exploration](https://openreview.net/forum?id=4H7FrE66De) | 3.667 (4, 4, 3); n=3; std=0.471 | Sample initial response tokens uniformly from top candidates and balance rollouts across them. |
| 11 | #30218 | [Chain-of-Thought Controllability Can Reduce Chain-of-Thought Monitorability](https://openreview.net/forum?id=FrpBCtqRnK) | 3.667 (4, 4, 3); n=3; std=0.471 | Fine-tune on persona-rewritten reasoning traces to test how chain-of-thought controllability affects hidden-task monitoring. |
| 12 | #25833 | [Tree Search With Distributional Predictions](https://openreview.net/forum?id=zzqLU5eSbj) | 3.500 (4, 4, 3, 3); n=4; std=0.500 | Search trees using predicted target distributions while bounding query complexity by entropy, pathwidth, and prediction error. |
| 13 | #23503 | [CoCA: Criterion-Aware Credit Assignment for Rubric-Based Reinforcement Learning](https://openreview.net/forum?id=BzSjz4MgZ3) | 3.500 (3, 4); n=2; std=0.500 | Allocate criterion-level outcome credits across tokens using rubric-induced distribution shifts. |
| 14 | #45401 | [Judging RLVR Boundary Comparisons Against Their Own Measured Noise](https://openreview.net/forum?id=fnMHUImLl3) | 3.333 (4, 2, 4); n=3; std=0.943 | Compare RLVR sampling outcomes against measured noise floors and null-calibrated gates across evaluation protocols. |
| 15 | #25650 | [MetaExp: Learning to Self-Improve through Experience via Verifiable Cross-Task Environment Scaling](https://openreview.net/forum?id=ZJIqqHVTnE) | 3.333 (3, 4, 3); n=3; std=0.471 | Train on task families sharing tools or workflows so interaction feedback becomes reusable cross-task experience. |

## Themes & trends

Recurring mechanisms in this selected top-60 set; the pack does not establish change over time or domain-wide prevalence.

- Test-time selection uses comparative evidence and uncertainty: #24179 adjusts votes through pairwise path comparisons; #44713 estimates best-of-N policy value to choose budgets.
- RL exploration targets more than token temperature: #16882 samples latent reasoning trajectories, while #55926 spreads rollouts across first-token choices.
- Training feedback becomes more selective: #14921 prioritizes prompts by estimated reward gain; #23503 assigns rubric outcomes to individual tokens.
- Reusable computation through structure: #52073 composes shorter learned computations, and #25650 trains on task families with shared tools or workflows.
- Evaluation protocols determine what reasoning claims support: #45401 measures noise and protocol sensitivity in RLVR comparisons; #22329 tests low-rank prediction of missing benchmark scores.

## Score signals

Every `llm-reasoning.*` group is below 2.31. Test-time scaling is closest (292 papers; 2.298), followed by RL reasoning (415; 2.282), `other` (459; 2.276), self-improvement (449; 2.260), and chain-of-thought (379; 2.260). Verifiers (233; 2.209) and mathematical reasoning (129; 2.219) have lower means. Cross-major intersections above the baseline include exploration (22; 2.472), reward modeling (22; 2.348), and uncertainty quantification (12; 2.361). Highly rated examples in the top table therefore do not describe the major's average paper, whose mean is 2.266.

The snapshot table marks every supplied fine category above, below, or equal to 2.31, including cross-major tags. These are descriptive comparisons within this major, not venue-wide estimates for each tag; overlapping groups and small counts do not establish statistically reliable differences.

## Taxonomy notes

Suggested corrections from the abstracts, not applied changes. Each entry gives a proposed major and fine tags; secondary tags can preserve the method when the research object suggests a different major.

- #22329 → major `evaluation`, fine `evaluation.eval-methods` and `evaluation.llm-bench`: benchmark selection and prediction of missing scores are the main contribution.
- #34148 → major `evaluation`, fine `evaluation.llm-bench`: Kombine measures creativity across language models rather than introducing a reasoning method.
- #25246 → major `gen-vision`, fine `gen-vision.ar-visual` plus `diffusion.guidance`: self-correction constrains image-text synthesis, not a language reasoning verifier.
- #25833 → major `theory`, fine `theory.online`: this is learning-augmented tree-search theory with query bounds and no LLM in the abstract.
- #30218 → major `safety`, fine `safety.agent-safety` plus `llm-reasoning.cot`: the experiments stress-test detection of hidden goals through reasoning monitors.
- #47904 → major `llm-core`, fine `llm-core.architecture`: decreasing MLP width across depth changes model capacity allocation.
- #13896 → major `rl`, fine `rl.marl`: coupling-adaptive trust regions address independent learning in general-sum games and autonomous driving.
- #21194 → major `gen-vision`, fine `gen-vision.video` plus `llm-agents.code`: a coding agent supplies physical corrections, but the trained target is a video generator.
- #30288 → major `llm-efficiency`, fine `llm-efficiency.quantization` and `llm-reasoning.rl-reasoning`: floating-point precision is the mechanism for reducing training-inference mismatch.

No new fine category proposed. The pack does not establish the required ≥25-paper support for a distinct new category (rule T3); the corrections above can use existing tags.

