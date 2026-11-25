# Interpretability — ICLR 2027 domain brief

## Snapshot

1,067 papers; mean rating 2.181; 266 papers (mean ≥ 2.67). Standard deviations below use the population formula.

| Fine category | Count | Mean rating |
|---|---:|---:|
| interpretability.mech-interp | 483 | 2.165 |
| interpretability.probing | 216 | 2.151 |
| interpretability.steering | 176 | 2.138 |
| interpretability.sae | 164 | 2.184 |
| interpretability.xai | 163 | 2.272 |
| interpretability.other | 139 | 2.134 |
| causal.causal-inference | 19 | 2.232 |
| multimodal.vlm | 12 | 2.056 |
| graphs.gnn | 7 | 2.238 |
| alignment.sycophancy | 6 | 2.236 |
| safety.jailbreak | 6 | 2.486 |
| representation.ssl | 5 | 2.333 |
| llm-core.architecture | 5 | 2.200 |
| llm-reasoning.cot | 5 | 2.250 |
| evaluation.eval-methods | 5 | 1.733 |
| science.health | 5 | 1.867 |
| diffusion.architecture | 4 | 2.250 |
| llm-efficiency.pruning | 4 | 1.917 |
| llm-agents.agents | 4 | 1.583 |
| probabilistic.bayesian | 3 | 2.667 |
| time-series.forecasting | 3 | 2.556 |
| graphs.topology | 3 | 2.306 |
| probabilistic.uq | 3 | 2.289 |
| llm-core.finetune | 3 | 2.222 |
| embodied.manipulation | 3 | 1.667 |
| llm-core.moe | 3 | 1.778 |
| safety.adversarial | 2 | 2.500 |
| applications.tabular | 2 | 2.833 |
| llm-reasoning.rl-reasoning | 2 | 2.375 |
| llm-efficiency.distillation | 2 | 2.167 |
| science.pde | 2 | 2.167 |
| rl.model-based | 2 | 2.000 |
| applications.nlp | 2 | 2.000 |
| representation.domain | 2 | 2.042 |
| safety.agent-safety | 2 | 2.167 |
| graphs.graph-llm | 2 | 2.000 |
| embodied.vla | 2 | 1.958 |
| llm-core.scaling | 2 | 1.833 |
| optimization.optimizers | 2 | 1.500 |
| llm-agents.deep-research | 2 | 1.833 |
| graphs.equivariance | 2 | 1.500 |
| llm-agents.memory | 1 | 4.000 |
| representation.continual | 1 | 3.000 |
| evaluation.llm-bench | 1 | 3.000 |
| vision.vision-backbones | 1 | 3.000 |
| safety.fairness | 1 | 2.667 |
| causal.formal | 1 | 2.667 |
| rl.deep-rl | 1 | 2.667 |
| gen-vision.ar-visual | 1 | 2.667 |
| probabilistic.sampling | 1 | 2.667 |
| theory.generalization | 1 | 2.667 |
| science.scientific-discovery | 1 | 2.333 |
| llm-efficiency.quantization | 1 | 2.333 |
| science.genomics | 1 | 2.333 |
| llm-agents.multi-agent | 1 | 2.333 |
| multimodal.audio-speech | 1 | 2.250 |
| alignment.llm-judge | 1 | 2.000 |
| time-series.ts-other | 1 | 2.000 |
| vision.detection-seg | 1 | 2.000 |
| embodied.navigation | 1 | 2.000 |
| diffusion.flow-matching | 1 | 2.000 |
| llm-reasoning.math | 1 | 2.000 |
| optimization.federated | 1 | 2.000 |
| applications.recsys | 1 | 2.000 |
| llm-agents.code | 1 | 2.000 |
| optimization.bo-hpo | 1 | 2.000 |
| theory.transformer-theory | 1 | 2.000 |
| llm-reasoning.self-improve | 1 | 1.667 |
| llm-reasoning.verifiers | 1 | 1.667 |
| alignment.preference | 1 | 1.667 |
| llm-agents.tool-use | 1 | 1.333 |
| science.molecules | 1 | 1.333 |
| gen-vision.t2i | 1 | 1.333 |

## Top 15 papers

| Rank | # | Title | Mean (individual ratings); n; std | One-line idea |
|---:|---:|---|---|---|
| 3 | 5083 | [EvoSteer: Restoring Safety in Experience-Driven Agentic Evolution via Activation Steering](https://openreview.net/forum?id=20aqR8E6En) | 4.000 (4, 4, 4); n=3; std=0.000 | Subtracts the memory-induced safety-direction shift using a memory-free forward pass as reference. |
| 26 | 38113 | [Self-Discovering Circuit Models](https://openreview.net/forum?id=4az1UIMaZI) | 4.000 (4, 4, 4); n=3; std=0.000 | Fine-tunes transformers to emit input-specific circuits alongside predictions under task-agnostic activation patching. |
| 32 | 47821 | [LLM Priors and the Direction of Ignorance](https://openreview.net/forum?id=2wtiLzDgGs) | 4.000 (4, 4, 4); n=3; std=0.000 | Identifies an unembedding direction encoding unigram priors and projects prediction states to control prior reliance. |
| 89 | 18890 | [Matryoshka attribution: Learning to attribute language model outputs to representations and weights](https://openreview.net/forum?id=qJYdZFEdWI) | 3.667 (4, 4, 3); n=3; std=0.471 | Learns nested component masks across random sparsity levels using a differentiable sigmoid top-k operator. |
| 102 | 22608 | [dattri-LLM: A Unified and Efficient Library for Training Data Attribution at LLM Scale](https://openreview.net/forum?id=ZNW5wy0IXR) | 3.667 (4, 4, 3); n=3; std=0.471 | Routes compact per-example gradient operations through a cost model without changing existing training loops. |
| 128 | 40613 | [Compact Shield Representations via Safety-Preserving Decision-Tree Approximation](https://openreview.net/forum?id=V0KHbzmDUZ) | 3.667 (4, 4, 3); n=3; std=0.471 | Approximates safety shields as compact decision trees while never relabeling unsafe actions as safe. |
| 244 | 44381 | [Towards Tractable, Provably Exact Shapley Interactions and Beyond in Neural Networks](https://openreview.net/forum?id=qLuXowoPJt) | 3.667 (3, 4, 4); n=3; std=0.471 | Verifies additive neural structure to bound exact Shapley interactions and trains models for tractability. |
| 293 | 29678 | [Concept-Conditioned Scores Can Rank Sparse Dictionaries Without Using the Concepts](https://openreview.net/forum?id=aD1zhekGUI) | 3.333 (3, 3, 4); n=3; std=0.471 | Audits concept-conditioned dictionary scores with identity randomization, occupancy controls, and probing anchors. |
| 453 | 28564 | [CANS: Capability-Preserving Neuron Steering for Large Language Models](https://openreview.net/forum?id=rWRwzoXjHw) | 3.333 (3, 4, 3); n=3; std=0.471 | Derives closed-form neuron scaling from target-token likelihood and general-output KL proxies. |
| 465 | 39447 | [Keep Features Dense and Explanations Sparse: Adaptive Interpretability at Test Time](https://openreview.net/forum?id=0uhzMXFKjp) | 3.333 (3, 3, 4); n=3; std=0.471 | Learns dense nonnegative features, then sparsifies explanations at test time under reconstruction-fidelity constraints. |
| 477 | 49946 | [Beliefs in feedback: Factored representations of interacting agents in transformers](https://openreview.net/forum?id=cm0fjA9Pwf) | 3.333 (3, 4, 3); n=3; std=0.471 | Factorizes interacting agents' Bayesian beliefs into separate residual-stream subspaces for causal patching. |
| 492 | 1385 | [Interaction-Aware Influence Functions for Group Attribution](https://openreview.net/forum?id=aZ4BU8bGIL) | 3.333 (3, 3, 4); n=3; std=0.471 | Adds pairwise interaction terms to influence functions for leave-group-out attribution and data selection. |
| 528 | 16771 | [STR: Supervised Transcoder Replacement for Reducing Steering Side Effects](https://openreview.net/forum?id=HNZY0zgzZX) | 3.333 (4, 3, 3); n=3; std=0.471 | Replaces the steering-layer MLP with a supervised transcoder protecting non-target behavior and fidelity. |
| 560 | 32962 | [Quadrature-TreeSHAP: Fast and Stable Shapley Values and Interactions](https://openreview.net/forum?id=WiR8LMoIJi) | 3.333 (3, 4, 3); n=3; std=0.471 | Recovers Shapley values through fixed-point Gauss–Legendre quadrature of weighted Banzhaf interaction polynomials. |
| 602 | 1581 | [D-Scope: Decomposing and Steering Diffusion Transformers with Sparse Autoencoders](https://openreview.net/forum?id=GXJlfZBXPl) | 3.333 (3, 3, 4); n=3; std=0.471 | Retrieves SAE features through visual centroids and tests decoder directions with spatially masked interventions. |

## Themes & trends

- Circuit extraction becomes a learned model function: #38113 trains transformers to emit circuits during prediction, while #18890 learns nested attribution masks across sparsity levels.
- Steering work now budgets collateral damage. #5083 removes only the memory-induced representation shift; #28564 and #16771 explicitly optimize non-target capability or behavior preservation.
- Attribution splits between systems engineering and guarantees: #22608 schedules compact gradient operations, #44381 certifies interaction bounds, and #32962 uses fixed quadrature for tree explanations.
- Sparse-feature evaluation is under direct scrutiny. #29678 randomizes concept identity to expose label-insensitive rankings, whereas #39447 delays sparsity until an explanation is requested and #1581 ties features to visual interventions.
- Representation geometry supports causal controls, not just descriptions: #47821 turns a unigram-prior direction into an inference-time control, and #49946 patches factorized agent beliefs.

## Score signals

Every native interpretability fine category falls below the venue-wide mean of 2.31: xai is closest at 2.272 (163 papers), followed by sae at 2.184 (164), mech-interp at 2.165 (483), probing at 2.151 (216), steering at 2.138 (176), and other at 2.134 (139).

Cross-major tags above 2.31 with at least three papers are safety.jailbreak at 2.486 (6), representation.ssl at 2.333 (5), probabilistic.bayesian at 2.667 (3), and time-series.forecasting at 2.556 (3). Several one- or two-paper tags score higher, including llm-agents.memory at 4.000 (1) and applications.tabular at 2.833 (2), but those samples are tiny. Below-mean cross tags with at least four papers include multimodal.vlm at 2.056 (12), evaluation.eval-methods at 1.733 (5), science.health at 1.867 (5), and llm-agents.agents at 1.583 (4).

## Taxonomy notes

- #40613 → rl/safe-rl: the abstract studies formal safety shields for reinforcement-learning agents; decision-tree interpretability is the representation choice.
- #50869 → multimodal/vlm or evaluation/eval-methods: the title targets a visual-evidence multimodal evaluation metric rather than model internals.
- #4557 → science.health: beat-anchored probing serves cross-site ECG diagnosis, with probing better retained as a secondary tag.
- #26401 → multimodal/vlm: the paper concerns in-context image representations, although its mechanistic-analysis tag remains useful.
- No new fine category proposed; this pack cannot establish the required support of at least 25 papers for a new tag.
