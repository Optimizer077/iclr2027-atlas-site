# Diffusion & Flow Models — ICLR 2027 domain brief

## Snapshot

1,324 papers; mean rating **2.441** on the 1–4 scale. Venue-wide mean of paper means: **2.31**.

Source: [supplied diffusion pack](../inputs/diffusion.json). Snapshot statistics cover the full major; paper-level discussion uses its top 60. Fine tags overlap, including tags from other majors, so counts must not be summed. All fine categories in the pack appear below, sorted by descending count. Aggregate review counts and standard deviations are not supplied.

| Fine category | Count | Mean rating | Versus venue mean (2.31) |
| --- | ---: | ---: | --- |
| `diffusion.flow-matching` | 377 | 2.443 | Above |
| `diffusion.discrete` | 331 | 2.422 | Above |
| `diffusion.sampling` | 235 | 2.539 | Above |
| `diffusion.other` | 197 | 2.359 | Above |
| `diffusion.architecture` | 177 | 2.458 | Above |
| `diffusion.guidance` | 102 | 2.394 | Above |
| `diffusion.inverse` | 68 | 2.461 | Above |
| `diffusion.distillation` | 48 | 2.542 | Above |
| `diffusion.theory` | 42 | 2.494 | Above |
| `diffusion.alignment` | 24 | 2.597 | Above |
| `probabilistic.bayesian` | 16 | 2.661 | Above |
| `gen-vision.t2i` | 12 | 2.444 | Above |
| `llm-efficiency.speculative` | 11 | 2.364 | Above |
| `gen-vision.video` | 10 | 2.800 | Above |
| `llm-efficiency.quantization` | 9 | 2.556 | Above |
| `graphs.equivariance` | 8 | 2.375 | Above |
| `llm-reasoning.test-time` | 8 | 2.167 | Below |
| `representation.ssl` | 7 | 2.952 | Above |
| `llm-efficiency.pruning` | 6 | 2.278 | Below |
| `probabilistic.uq` | 6 | 2.056 | Below |
| `causal.causal-inference` | 5 | 2.350 | Above |
| `gen-vision.editing` | 5 | 2.400 | Above |
| `graphs.topology` | 5 | 2.533 | Above |
| `rl.deep-rl` | 5 | 2.133 | Below |
| `time-series.forecasting` | 5 | 2.267 | Below |
| `evaluation.datasets` | 4 | 2.250 | Below |
| `llm-core.architecture` | 4 | 2.167 | Below |
| `llm-core.finetune` | 4 | 2.521 | Above |
| `llm-efficiency.kv-cache` | 4 | 3.000 | Above |
| `probabilistic.sampling` | 4 | 2.167 | Below |
| `rl.exploration` | 4 | 2.500 | Above |
| `safety.watermark` | 4 | 2.583 | Above |
| `science.genomics` | 4 | 2.250 | Below |
| `applications.tabular` | 3 | 2.556 | Above |
| `interpretability.steering` | 3 | 2.444 | Above |
| `llm-core.moe` | 3 | 2.444 | Above |
| `llm-reasoning.rl-reasoning` | 3 | 2.444 | Above |
| `llm-reasoning.verifiers` | 3 | 1.889 | Below |
| `multimodal.audio-speech` | 3 | 1.917 | Below |
| `neuro-cog.brain` | 3 | 2.333 | Above |
| `optimization.optimizers` | 3 | 2.444 | Above |
| `science.pde` | 3 | 2.222 | Below |
| `theory.generalization` | 3 | 2.444 | Above |
| `vision.low-level` | 3 | 2.667 | Above |
| `graphs.graph-llm` | 2 | 3.000 | Above |
| `llm-core.data` | 2 | 2.833 | Above |
| `llm-core.scaling` | 2 | 3.167 | Above |
| `science.molecules` | 2 | 3.000 | Above |
| `science.protein` | 2 | 2.167 | Below |
| `time-series.dynamics` | 2 | 2.500 | Above |
| `time-series.ts-other` | 2 | 2.500 | Above |
| `alignment.preference` | 1 | 2.333 | Above |
| `alignment.sycophancy` | 1 | 1.667 | Below |
| `applications.recsys` | 1 | 2.000 | Below |
| `evaluation.llm-bench` | 1 | 2.000 | Below |
| `gen-vision.ar-visual` | 1 | 2.667 | Above |
| `gen-vision.gan-vae` | 1 | 2.000 | Below |
| `gen-vision.three-d` | 1 | 3.000 | Above |
| `interpretability.probing` | 1 | 1.750 | Below |
| `llm-agents.agents` | 1 | 2.333 | Above |
| `llm-agents.deep-research` | 1 | 3.333 | Above |
| `llm-agents.memory` | 1 | 2.333 | Above |
| `llm-core.icl` | 1 | 2.667 | Above |
| `llm-core.multilingual` | 1 | 1.667 | Below |
| `llm-reasoning.cot` | 1 | 2.667 | Above |
| `llm-reasoning.self-improve` | 1 | 2.750 | Above |
| `multimodal.vlm` | 1 | 2.500 | Above |
| `multimodal.vlm-reasoning` | 1 | 2.333 | Above |
| `optimization.convex` | 1 | 2.667 | Above |
| `representation.domain` | 1 | 2.667 | Above |
| `representation.semi-weak` | 1 | 2.333 | Above |
| `rl.model-based` | 1 | 2.667 | Above |
| `safety.adversarial` | 1 | 2.333 | Above |
| `safety.unlearning` | 1 | 3.000 | Above |
| `science.materials` | 1 | 2.333 | Above |
| `theory.dynamics` | 1 | 2.333 | Above |
| `theory.transformer-theory` | 1 | 3.000 | Above |
| `vision.remote-sensing` | 1 | 2.000 | Below |
| `vision.three-d-vision` | 1 | 2.333 | Above |

## Top 15 papers

Rank is within this major, preserving the input order, including ties. The pack omits reviewer confidence, so confidence-weighted tie-breaks cannot be independently checked. n counts the listed ratings; std is their population standard deviation, calculated from those ratings.

| Rank | #number | Title | Mean (individual ratings); n; std | One-line idea |
| ---: | --- | --- | --- | --- |
| 1 | #14440 | [Trajectory Matching: Discrete Flow Matching with Structured Actions](https://openreview.net/forum?id=SXTGDKLDdB) | 4.000 (4, 4, 4); n=3; std=0.000 | Condition discrete flows on complete action trajectories to train coupled, variable-size edits without simulation. |
| 2 | #23543 | [Minimal Travel Sampling for Metric Path Discrete Flow Models](https://openreview.net/forum?id=fY0in3HE1E) | 4.000 (4, 4, 4); n=3; std=0.000 | Choose minimal-travel probability flux through optimal transport, then integrate temporally to reduce discrete sampling error. |
| 3 | #29197 | [Learning Clean Generative Processes from Noisy Measurements](https://openreview.net/forum?id=9N6imeDiHG) | 4.000 (4, 4, 4); n=3; std=0.000 | Combine noisy-view regression with sampling self-consistency to recover clean generative predictions below observed noise levels. |
| 4 | #9839 | [Orthogonality of Generalization and Memorization Trajectories in Diffusion Models](https://openreview.net/forum?id=PGFldvKUqS) | 3.667 (3, 4, 4); n=3; std=0.471 | Decompose denoiser training directions and penalize motion toward the empirical distribution to limit memorization. |
| 5 | #51236 | [Contrastive Beckmann Maps Improve One-step Generation](https://openreview.net/forum?id=KgTCtyntyy) | 3.667 (4, 4, 3); n=3; std=0.471 | Subtract probability currents toward mismatched image-label pairs when training one-step Beckmann maps. |
| 6 | #5927 | [Ermine: Neural Differential Scaling Laws for Diffusion Language Models](https://openreview.net/forum?id=xowZZM2XqB) | 3.667 (3, 4, 4); n=3; std=0.471 | Allocate capacity and data across diffusion timesteps using differential scaling laws, stratified sampling, and sparse experts. |
| 7 | #7240 | [Global Convergence of Gradient Descent for Score Matching in Gaussian Mixtures via Reverse Fisher Divergence](https://openreview.net/forum?id=WynVXMD98I) | 3.667 (3, 4, 4); n=3; std=0.471 | Minimize student-expectation reverse Fisher divergence to obtain gradient-descent convergence guarantees for Gaussian mixtures. |
| 8 | #38191 | [Semantic Self-Flow: Relation Learning in Self-Supervised Flow Matching](https://openreview.net/forum?id=qCLyaejIkB) | 3.667 (4, 3, 4); n=3; std=0.471 | Noise subjects and alternative locations together so reconstruction requires the specified spatial relation. |
| 9 | #44940 | [Clock Diffusion: Efficient Semi-Autoregressive Continuous Diffusion Language Models](https://openreview.net/forum?id=6mobCb4hQ7) | 3.667 (3, 4, 4); n=3; std=0.471 | Use position-dependent noise schedules for semi-autoregressive continuous diffusion with variable lengths and KV caching. |
| 10 | #33190 | [Schedule-Free Denoising Diffusion Sampling using Time Scores](https://openreview.net/forum?id=EP5JIjBLZo) | 3.667 (4, 4, 3); n=3; std=0.471 | Treat diffusion time as a stochastic variable and jointly evolve samples and noise levels. |
| 11 | #35601 | [LyapuFlow: Controlling Generative Flows with Lyapunov Feedback for Inverse Problems](https://openreview.net/forum?id=og3q6q0PxP) | 3.667 (4, 4, 3); n=3; std=0.471 | Apply minimum-norm Lyapunov feedback when predicted terminal samples violate the prescribed constraint-decrease rate. |
| 12 | #41101 | [On the Stability and Convergence of Flow Map Training](https://openreview.net/forum?id=YDa8hCw653) | 3.667 (4, 4, 3); n=3; std=0.471 | Analyze flow-map gradient dynamics and normalize weighted updates to control instability and establish convergence conditions. |
| 13 | #52971 | [From Modes to Memories: Characterizing the Scale-Space Dynamics of Diffusion Models](https://openreview.net/forum?id=w54AHTqSLe) | 3.667 (3, 4, 4); n=3; std=0.471 | Measure memorization through the largest noise scale preserving examples under fixed-scale denoiser dynamics. |
| 14 | #716 | [Diagnosing Pixel-Space Diffusion Transformers: From Depth-Wise Connectivity to Layer-Wise Attention Patterns](https://openreview.net/forum?id=StuW6HvvPT) | 3.667 (3, 4, 4); n=3; std=0.471 | Modify depth-wise connectivity and layer-wise attention in pixel-space diffusion Transformers. |
| 15 | #46072 | [COAL: Jacobian-Free Likelihood Evaluation for Rectified Flows](https://openreview.net/forum?id=haxFnk2HFV) | 3.667 (4, 3, 4); n=3; std=0.471 | Train a per-coordinate variance head to estimate rectified-flow divergence without input-space backpropagation. |

## Themes & trends

Recurring mechanisms in this selected top-60 set; the pack does not establish change over time or domain-wide prevalence.

- Structured discrete dynamics: #14440 conditions on action trajectories, while #23543 selects transport-efficient transition rates; both reconsider the discrete path itself.
- Few-step generation through learned maps: #51236 modifies Beckmann probability currents; #41101 studies normalization and weighting in flow-map training.
- Diffusion language-model compute allocation: #5927 varies capacity and data by timestep, and #44940 uses position-dependent schedules with cache-compatible decoding.
- Memorization as denoiser geometry: #9839 separates population and empirical training directions; #52971 measures how long examples survive noise-scale smoothing.
- Conditional generation through explicit constraints: #38191 designs noising patterns that require spatial-relation conditioning; #35601 enforces test-time constraints with Lyapunov feedback.

## Score signals

All ten `diffusion.*` categories exceed 2.31. The largest groups are flow matching (377; 2.443), discrete diffusion (331; 2.422), and sampling (235; 2.539). Distillation scores 2.542 across 48 papers; alignment reaches 2.597 but contains only 24. Even `diffusion.other` (197; 2.359) is above the baseline. Cross-major tags include below-baseline reasoning test-time work (8; 2.167) and uncertainty quantification (6; 2.056); these small intersections do not reverse the major's 2.441 mean.

The snapshot table marks every supplied fine category above, below, or equal to 2.31, including cross-major tags. These are descriptive comparisons within this major, not venue-wide estimates for each tag; overlapping groups and small counts do not establish statistically reliable differences.

## Taxonomy notes

Suggested corrections from the abstracts, not applied changes. Each entry gives a proposed major and fine tags; secondary tags can preserve the method when the research object suggests a different major.

- #29197 → major `diffusion`, fine `diffusion.theory` and `diffusion.inverse` instead of only `diffusion.other`: the abstract derives clean-distribution identifiability from noisy measurements.
- #18965 → major `diffusion`, fine `diffusion.alignment`: expected-hypervolume fine-tuning explicitly optimizes adaptive rewards under a distributional constraint.
- #34562 → major `diffusion`, fine `diffusion.architecture`: representations feed back into the denoiser, a training and architecture contribution hidden by `other`.
- #38613 → major `causal`, fine `causal.causal-inference` plus `diffusion.discrete`: DAG identification and recovery are the research object; discrete diffusion supplies score estimates.
- #5179 → major `gen-vision`, fine `gen-vision.video`: its shared video canvas supports cross-view generation and temporal completion.
- #16367 → major `gen-vision`, fine `gen-vision.editing` plus `diffusion.flow-matching`: the model targets single-image HDR relighting.
- #50721 → retain major `diffusion` and fine `diffusion.flow-matching`, but remove `llm-agents.deep-research`: retrieved geotagged images condition a location flow, with no LLM agent in the abstract.

No new fine category proposed. The pack does not establish the required ≥25-paper support for a distinct new category (rule T3); the corrections above can use existing tags.

