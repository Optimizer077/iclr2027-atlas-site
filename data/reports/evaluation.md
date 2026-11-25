# Datasets, Benchmarks & Evaluation — ICLR 2027 domain brief

Source: `reports/inputs/evaluation.json` only. Ratings are on the 1–4 scale; the venue-wide mean of means is 2.31.

## Snapshot

- **Papers:** 1,532
- **Mean rating:** 2.249 (venue mean 2.31, so -0.061)
- **Top 60 in the pack:** means run from 3.67 down to 3.25.

Fine categories sorted by count. Papers carry 1–3 fine tags, so counts sum to more than 1,532. Tags from other majors are secondary tags on papers whose major is `evaluation`. `evaluation.other` appears to mean that no own-major fine pattern matched.

| Fine category | Count | Mean rating |
|---|---:|---:|
| `evaluation.llm-bench` | 1,275 | 2.254 |
| `evaluation.datasets` | 251 | 2.247 |
| `evaluation.eval-methods` | 155 | 2.006 |
| `evaluation.other` | 113 | 2.303 |
| `llm-agents.agents` | 50 | 2.405 |
| `multimodal.vlm` | 34 | 2.412 |
| `llm-agents.code` | 27 | 2.265 |
| `applications.finance-edu` | 16 | 2.261 |
| `time-series.forecasting` | 15 | 2.111 |
| `embodied.navigation` | 13 | 2.378 |
| `multimodal.audio-speech` | 12 | 2.097 |
| `llm-agents.memory` | 11 | 2.303 |
| `llm-agents.deep-research` | 10 | 2.033 |
| `gen-vision.video` | 9 | 2.500 |
| `vision.medical-imaging` | 8 | 2.833 |
| `rl.model-based` | 8 | 2.592 |
| `applications.tabular` | 8 | 2.250 |
| `science.molecules` | 8 | 2.375 |
| `graphs.graph-llm` | 8 | 2.083 |
| `llm-reasoning.self-improve` | 8 | 2.042 |
| `llm-agents.computer-use` | 8 | 2.250 |
| `llm-agents.tool-use` | 7 | 2.286 |
| `applications.nlp` | 7 | 1.952 |
| `science.health` | 7 | 1.905 |
| `science.scientific-discovery` | 6 | 2.656 |
| `science.genomics` | 6 | 2.444 |
| `llm-core.multilingual` | 6 | 2.056 |
| `alignment.sycophancy` | 6 | 2.167 |
| `causal.causal-inference` | 6 | 1.722 |
| `interpretability.mech-interp` | 5 | 2.267 |
| `embodied.driving` | 5 | 2.533 |
| `neuro-cog.cognition` | 5 | 2.133 |
| `multimodal.vlm-reasoning` | 5 | 2.267 |

57 further fine tags have count < 5 (123 tag assignments in total). They are omitted here and listed in the input pack.

## Top 15 papers

Rank is the position within this domain. The number in parentheses is the pack's venue-wide `rank` field.

| Rank | # | Title | Mean (ratings) | One-line idea |
|---:|---:|---|---|---|
| 1 (54) | #41515 | [EurekaBench: Measuring Agentic Ability to Discover New Scientific Insights](https://openreview.net/forum?id=AwJ9Lw5Pld) | 3.67 (4, 4, 3) | 26 expert-verified long-horizon tasks across six sciences; agents scored on constraint-following, mechanism prediction accuracy, and recovery of 306 insights. |
| 2 (80) | #46669 | [ORWorkerBench: Benchmarking LLMs from Data to Decisions under Uncertainty](https://openreview.net/forum?id=tgClEkqJ0e) | 3.67 (3, 4, 4) | Pairs each OR task with given stochastic parameters vs. parameters inferred from 100 observations, isolating the observation-to-decision gap. |
| 3 (131) | #43951 | [NewtPhys: Dissecting Newtonian Understanding In Foundation Models](https://openreview.net/forum?id=RhguGj6A66) | 3.67 (3, 4, 4) | Real multiview scenes plus physics-grounded simulation yield dense 4D annotations, including 3D forces, for probing low-level Newtonian reasoning. |
| 4 (194) | #53323 | [VegBench: Quantifying the Ecological Resolution of Geospatial Models with Expert Field Surveys](https://openreview.net/forum?id=0bAraCHvRO) | 3.67 (4, 3, 4) | Standardizes 43,468 expert field surveys of 363 California vegetation alliances to test geospatial models on hierarchical ecosystem classification. |
| 5 (198) | #1991 | [Video-Index: A Curated Meta-Benchmark for Video Understanding Evaluation](https://openreview.net/forum?id=g0vDUvCHlP) | 3.67 (4, 4, 3) | Five-level shortcut-attack pyramid audits 115 video benchmarks; a deterministic selector keeps 840 items hardest under the attacks. |
| 6 (205) | #19480 | [Vertical Sliced Wasserstein Distances for Meta-Measures](https://openreview.net/forum?id=dyRAZ3n57Z) | 3.67 (4, 3, 4) | Projects each inner measure via continuous test functions and compares the 1D results with Wasserstein distance; a scalable meta-measure metric. |
| 7 (256) | #41846 | [OLMo-Detect: A Multi-Stage, Confounder-Controlled Benchmark for Membership Inference on Large Language Models](https://openreview.net/forum?id=YD3P9EI37h) | 3.67 (4, 3, 4) | Membership-inference benchmark on OLMo 2 spanning pre-, mid-, post-training, with member/non-member alignment and infini-gram filtering of non-members. |
| 8 (269) | #27516 | [4DCodeBench: Benchmarking Agents on Inverse Graphics of Dynamic Scenes](https://openreview.net/forum?id=c2068LEaJe) | 3.50 (3, 4, 4, 3) | Agents reconstruct dynamic scenes from video as executable graphics programs, e.g. physical simulations of deformation, fluid flow, fracture. |
| 9 (327) | #30246 | [MERRY: Semantic-Level Evaluation of Multimodal Emotional and Role Consistencies for Role-Playing Agents](https://openreview.net/forum?id=FtBATWQmg4) | 3.33 (3, 3, 4) | Evaluates multimodal role-playing agents at the semantic-response level for emotional and role consistency, using a bidirectional evidence-finding LLM-judge protocol. |
| 10 (365) | #9559 | [Beyond Memorization: Benchmarking Memory Utilization in Conversational LLM Agents](https://openreview.net/forum?id=MssIoMeGST) | 3.33 (4, 3, 3) | Tests memory comprehension, application and evaluation (Bloom's taxonomy) beyond recall, via 3,840 queries over 100 constructed user profiles. |
| 11 (395) | #32947 | [Deep-ARViM: A Perceptual Visibility Metric and Benchmark for Augmented Reality Displays](https://openreview.net/forum?id=6rS7W1iSeK) | 3.33 (4, 3, 3) | Learned visibility metric for optical see-through AR, trained on 67,984 2AFC and 21,027 matching judgments from 550+ observers. |
| 12 (418) | #54299 | [SarcAtlas: Fine-Grained Annotation and Efficient Modeling of Multimodal Sarcasm](https://openreview.net/forum?id=yRN9bGltlW) | 3.33 (3, 3, 4) | Adds fine-grained sarcasm annotations to four existing benchmarks; a single-tower embedding model with latent-token groups predicts them without generation. |
| 13 (423) | #1757 | [MMA-MTU: Benchmarking Multi-Task Micro-Action Understanding](https://openreview.net/forum?id=39GDtYveGE) | 3.33 (3, 3, 4) | Joint micro-action benchmark (recognition, temporal reasoning, grounding, detection, description) with 11,180 videos, 122,845 queries; 36 MLLMs evaluated. |
| 14 (432) | #10026 | [FATE: First Agent Teams Exam](https://openreview.net/forum?id=nsCC8uFBkj) | 3.33 (3, 4, 3) | 112 professional tasks where agents with role-specific resources and permissions use tools and communicate to produce deliverables. |
| 15 (441) | #18043 | [AgentCyberRange: Evaluating Frontier AI Systems in Realistic Cyber Ranges](https://openreview.net/forum?id=MbwCn5aoIR) | 3.33 (4, 3, 3) | Multi-host cyber ranges with state-coupled attack chains and effect-based oracles test sustained multi-stage intrusion by frontier agents. |

## Themes & trends

- **Benchmarks move from static Q&A to interactive, stateful environments.** Agents work under role-specific permissions (#10026), sustain multi-stage intrusions in multi-host cyber ranges (#18043), operate full-screen terminal apps (#8406), or are scored in closed loop against simulated users (#13980, #12821, #47546). #19357 casts ultrasound scanning as a POMDP in which the agent decides what evidence to acquire and when to stop.
- **Discovery-style tasks with automatic verification.** #41515 scores agents on the mechanisms and insights they recover, #36733 pairs 128 mostly unsolved math problems with deterministic verifiers, #61661 includes open TCS conjectures, and #36807 turns Lean proof compression into a verifiable task.
- **Auditing whether a benchmark measures what it claims.** #1991 runs five levels of shortcut attacks over 115 video benchmarks; #31431 tests whether near-tied leaderboard orderings survive DIF-guided item recomposition; #25212 revisits IRT estimation for the few-models, many-items regime; #10419 controls memorized market knowledge in trading backtests; #54334 builds a contamination-free reverse-engineering setting; #32934 proposes paired-control audits of what drives a reported gain.
- **Non-stationary deployment: agents that must adapt or regulate themselves.** Learning from serving experience (#37518), an evolving harness of tools, skills and sub-agents (#24345), API schema mutation with retention of old tools (#37264), and estimating and controlling one's own runtime (#34506).
- **Code as the output format for systems and geometry.** Production GPU kernels (#36944), vLLM/SGLang serving optimizations rebuilt from merged pull requests (#33699), repository migration between PyTorch/GPU and JAX/TPU (#34782), CAD programs from images or 3D (#52275), and executable 4D graphics programs from video (#27516).
- **Expert-collected data for earth, environment and energy.** Vegetation field surveys (#53323), UAV imagery of illegal gold mining (#36417), greenhouse-gas emissions (#55219), well-log interpretation (#56777), seismic processing (#16706), and time-resolved GPU power traces (#54080).

## Score signals

All numbers come from the pack's `fine_stats`. Differences are taken against the venue mean of 2.31; n is the tag count within this domain.

- **Domain level:** mean 2.249, 0.061 below the venue mean of means (2.31).
- **Own fine tags, none above the venue mean:** `evaluation.other` 2.303 (n=113, -0.007, effectively at the mean), `evaluation.llm-bench` 2.254 (n=1,275), `evaluation.datasets` 2.247 (n=251), `evaluation.eval-methods` 2.006 (n=155, -0.304, the lowest own tag).
- **`eval-methods` is thin at the top too:** it appears on only 3 of the top 60 (#48524, #54334, #32934). Several top methodology papers (#1991, #31431, #25212) carry `llm-bench` or `other` instead, so the tag's low mean may partly reflect what its patterns capture rather than the topic itself. This is an inference.
- **Secondary tags with n >= 10 above the venue mean:** `multimodal.vlm` 2.412 (34), `llm-agents.agents` 2.405 (50), `embodied.navigation` 2.378 (13). **Below:** `llm-agents.memory` 2.303 (11, at the mean), `llm-agents.code` 2.265 (27), `applications.finance-edu` 2.261 (16), `time-series.forecasting` 2.111 (15), `multimodal.audio-speech` 2.097 (12), `llm-agents.deep-research` 2.033 (10).
- **n = 5–9:** above are `vision.medical-imaging` 2.833 (8), `science.scientific-discovery` 2.656 (6), `rl.model-based` 2.592 (8), `embodied.driving` 2.533 (5), `gen-vision.video` 2.500 (9), `science.genomics` 2.444 (6), `science.molecules` 2.375 (8). The lowest are `causal.causal-inference` 1.722 (6), `science.health` 1.905 (7), `applications.nlp` 1.952 (7), `llm-reasoning.self-improve` 2.042 (8).
- **Too small to read:** `llm-efficiency.systems` 3.139 (3) and `interpretability.steering` 3.333 (1).
- **Top 60:** 48 of 60 carry `evaluation.llm-bench`; means run 3.25–3.67, and no paper reaches 4.0.

## Taxonomy notes

**Possibly misclassified papers in the top 60**

| # | Current | Suggested | Reason |
|---:|---|---|---|
| #19480 | `evaluation.datasets` | `probabilistic` (no optimal-transport fine exists) | It proposes an optimal-transport metric on distributions of distributions; "dataset" matched only the keyword "Dataset Distances". |
| #4266 | `evaluation.datasets` | `llm-efficiency.distillation` (nearest fit, uncertain) | It is a dataset-distillation parameterization method, not a released data resource. |
| #48524 | `evaluation.eval-methods` | `probabilistic.uq` | "Contamination" is the robust-statistics strong contamination model; the paper builds confidence intervals for a mean. |
| #23220 | `evaluation.datasets` | `safety.privacy` (+ an `embodied` fine) | It measures dataset-property leakage of released robot task conditions against adaptive attackers. |
| #16706 | fine `rl.exploration` | drop it; `science.weather-climate` is the nearest earth-science fine | "Exploration" refers to exploration seismology. |
| #36417 | fine `applications.finance-edu` | `vision.remote-sensing` | UAV segmentation and classification of illegal mining sites. |
| #31332 | fine `interpretability.mech-interp` | drop it; `llm-agents.code` is the nearest fit for RTL hardware code (uncertain) | It evaluates RTL representation learning, not model internals. |
| #25212, #31431 | `evaluation.other`, `evaluation.llm-bench` | add `evaluation.eval-methods` | Both study measurement validity (IRT estimation; DIF-robust rankings). The `eval-methods` patterns contain no IRT or DIF terms. |

**Proposed new fine categories** (T3 needs >= 25 papers; the pack shows only the top 60, so counts are unverified)

1. **Interactive Agent Environments**: benchmarks where an agent acts in an executable or closed-loop environment (tools, terminals, cyber ranges, simulated users) and is scored on outcomes, as opposed to static Q&A in `llm-bench`. e.g. #10026, #18043, #8406, #13980, #12821, #47546.
2. **Discovery & Open-Problem Benchmarks**: benchmarks that score the production of new, automatically verifiable results (unsolved problems, mechanisms, compressed proofs) rather than recall of known answers. e.g. #41515, #36733, #61661, #36807, #43241.
3. **Earth, Environment & Energy Datasets**: expert- or sensor-collected datasets for ecology, geophysics, emissions and energy prediction. e.g. #53323, #36417, #55219, #56777, #16706, #54080.
