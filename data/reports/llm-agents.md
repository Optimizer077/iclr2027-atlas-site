# LLM Agents, Tools & Code — ICLR 2027 domain brief

## Snapshot

3,040 papers; mean rating **2.257** on the 1–4 scale. Venue-wide mean of paper means: **2.31**.

Source: [supplied llm-agents pack](../inputs/llm-agents.json). Snapshot statistics cover the full major; paper-level discussion uses its top 60. Fine tags overlap, including tags from other majors, so counts must not be summed. All fine categories in the pack appear below, sorted by descending count. Aggregate review counts and standard deviations are not supplied.

| Fine category | Count | Mean rating | Versus venue mean (2.31) |
| --- | ---: | ---: | --- |
| `llm-agents.agents` | 1736 | 2.257 | Below |
| `llm-agents.memory` | 663 | 2.286 | Below |
| `llm-agents.multi-agent` | 400 | 2.240 | Below |
| `llm-agents.deep-research` | 382 | 2.179 | Below |
| `llm-agents.code` | 353 | 2.234 | Below |
| `llm-agents.tool-use` | 217 | 2.131 | Below |
| `llm-agents.computer-use` | 195 | 2.378 | Above |
| `llm-agents.other` | 136 | 2.356 | Above |
| `llm-reasoning.self-improve` | 48 | 2.319 | Above |
| `evaluation.llm-bench` | 34 | 2.270 | Below |
| `causal.causal-inference` | 28 | 2.202 | Below |
| `graphs.graph-llm` | 20 | 2.167 | Below |
| `science.scientific-discovery` | 19 | 2.298 | Below |
| `rl.exploration` | 17 | 2.382 | Above |
| `llm-reasoning.verifiers` | 14 | 2.165 | Below |
| `rl.deep-rl` | 14 | 2.161 | Below |
| `rl.model-based` | 14 | 2.256 | Below |
| `probabilistic.uq` | 13 | 2.308 | Below |
| `llm-reasoning.rl-reasoning` | 11 | 2.282 | Below |
| `embodied.manipulation` | 9 | 2.611 | Above |
| `llm-core.finetune` | 9 | 1.963 | Below |
| `embodied.navigation` | 8 | 2.708 | Above |
| `graphs.topology` | 8 | 2.000 | Below |
| `llm-reasoning.test-time` | 8 | 2.292 | Below |
| `representation.continual` | 7 | 2.190 | Below |
| `safety.agent-safety` | 7 | 2.143 | Below |
| `evaluation.eval-methods` | 6 | 2.333 | Above |
| `llm-efficiency.kv-cache` | 6 | 2.264 | Below |
| `safety.adversarial` | 6 | 2.222 | Below |
| `vision.three-d-vision` | 6 | 2.486 | Above |
| `applications.finance-edu` | 5 | 1.817 | Below |
| `causal.formal` | 5 | 2.467 | Above |
| `evaluation.datasets` | 5 | 2.617 | Above |
| `safety.jailbreak` | 5 | 2.933 | Above |
| `time-series.forecasting` | 5 | 2.750 | Above |
| `alignment.sycophancy` | 4 | 2.333 | Above |
| `applications.nlp` | 4 | 2.417 | Above |
| `applications.recsys` | 4 | 2.250 | Below |
| `embodied.world-models` | 4 | 2.646 | Above |
| `interpretability.probing` | 4 | 2.417 | Above |
| `llm-efficiency.pruning` | 4 | 1.917 | Below |
| `multimodal.vlm` | 4 | 1.917 | Below |
| `neuro-cog.cognition` | 4 | 2.333 | Above |
| `optimization.optimizers` | 4 | 2.167 | Below |
| `probabilistic.bayesian` | 4 | 2.250 | Below |
| `representation.domain` | 4 | 2.500 | Above |
| `representation.ssl` | 4 | 2.500 | Above |
| `safety.privacy` | 4 | 2.396 | Above |
| `alignment.preference` | 3 | 2.556 | Above |
| `diffusion.discrete` | 3 | 2.444 | Above |
| `graphs.equivariance` | 3 | 2.611 | Above |
| `llm-efficiency.speculative` | 3 | 2.667 | Above |
| `llm-reasoning.cot` | 3 | 2.778 | Above |
| `optimization.bo-hpo` | 3 | 2.472 | Above |
| `rl.marl` | 3 | 2.000 | Below |
| `embodied.vla` | 2 | 2.000 | Below |
| `graphs.gnn` | 2 | 1.667 | Below |
| `interpretability.steering` | 2 | 2.500 | Above |
| `interpretability.xai` | 2 | 2.500 | Above |
| `llm-core.long-context` | 2 | 2.000 | Below |
| `llm-efficiency.systems` | 2 | 2.500 | Above |
| `neuro-cog.brain` | 2 | 1.833 | Below |
| `optimization.federated` | 2 | 2.000 | Below |
| `representation.semi-weak` | 2 | 2.000 | Below |
| `safety.watermark` | 2 | 3.000 | Above |
| `science.health` | 2 | 2.333 | Above |
| `time-series.ts-other` | 2 | 1.875 | Below |
| `vision.detection-seg` | 2 | 2.042 | Below |
| `alignment.llm-judge` | 1 | 2.000 | Below |
| `applications.tabular` | 1 | 3.000 | Above |
| `diffusion.inverse` | 1 | 2.667 | Above |
| `embodied.driving` | 1 | 2.667 | Above |
| `gen-vision.t2i` | 1 | 2.000 | Below |
| `gen-vision.video` | 1 | 3.000 | Above |
| `interpretability.mech-interp` | 1 | 3.333 | Above |
| `llm-core.architecture` | 1 | 3.000 | Above |
| `llm-core.data` | 1 | 2.667 | Above |
| `llm-core.moe` | 1 | 2.667 | Above |
| `llm-efficiency.distillation` | 1 | 2.667 | Above |
| `llm-reasoning.math` | 1 | 3.000 | Above |
| `multimodal.video-understanding` | 1 | 2.333 | Above |
| `multimodal.vlm-reasoning` | 1 | 1.667 | Below |
| `optimization.convex` | 1 | 2.333 | Above |
| `safety.unlearning` | 1 | 3.333 | Above |
| `science.genomics` | 1 | 3.000 | Above |
| `science.molecules` | 1 | 1.667 | Below |
| `science.pde` | 1 | 2.667 | Above |
| `theory.online` | 1 | 2.750 | Above |
| `time-series.dynamics` | 1 | 2.333 | Above |
| `vision.medical-imaging` | 1 | 1.667 | Below |
| `vision.remote-sensing` | 1 | 1.750 | Below |

## Top 15 papers

Rank is within this major, preserving the input order, including ties. The pack omits reviewer confidence, so confidence-weighted tie-breaks cannot be independently checked. n counts the listed ratings; std is their population standard deviation, calculated from those ratings.

| Rank | #number | Title | Mean (individual ratings); n; std | One-line idea |
| ---: | --- | --- | --- | --- |
| 1 | #22968 | [Context Language Models](https://openreview.net/forum?id=U1ObEVC4A7) | 4.000 (4, 4, 4); n=3; std=0.000 | Represent context as editable files and train language models to manage their own and other agents' contexts. |
| 2 | #463 | [Efficient Long-Horizon Learning for Learned Optimization](https://openreview.net/forum?id=xLkfjG1wVy) | 3.667 (3, 4, 4); n=3; std=0.471 | Reallocate learned-optimizer meta-training compute toward long failure regimes and stabilize learning with decoupled progressive expert supervision. |
| 3 | #4292 | [DivOPD: Spread Wide, Look Close for Asynchronous On-Policy Distillation of Multi-turn Agents](https://openreview.net/forum?id=UVPZsieErl) | 3.667 (3, 4, 4); n=3; std=0.471 | Spread training turns across more rollouts and prioritize turns with cumulative teacher-student disagreement. |
| 4 | #13576 | [Differentiate the Solver, Not the Equation: Reverse-Sweep Adjoints for Block Implicit Simulation](https://openreview.net/forum?id=QSQXQsIZLO) | 3.667 (4, 3, 4); n=3; std=0.471 | Differentiate executed block-implicit solvers with reverse local adjoint sweeps instead of assembling global Jacobians. |
| 5 | #22401 | [DuoDiscover: Code Optimization by Discovering What to Optimize and How to Evaluate](https://openreview.net/forum?id=8ToDSnOfqT) | 3.667 (3, 4, 4); n=3; std=0.471 | Let coding agents discover optimization targets and cheap proxy evaluators, then verify proxy fidelity against true evaluations. |
| 6 | #27010 | [CLASHarness: Benchmarking Multi-Agent Conflict in Computer Use via a Controllable and Verifiable Generation Pipeline](https://openreview.net/forum?id=zlF4nBSJba) | 3.667 (4, 3, 4); n=3; std=0.471 | Generate computer-use conflicts with precommitted visual facts and graders compiled from executed reference trajectories. |
| 7 | #29109 | [LongPuzzleBench: Evaluating GUI Agents on Long-Horizon Visual Puzzles](https://openreview.net/forum?id=V83SUr7fnZ) | 3.667 (3, 4, 4); n=3; std=0.471 | Evaluate native GUI puzzle solving on persistent boards where locally attractive moves can eliminate future solutions. |
| 8 | #40844 | [Shutdown Sabotage Propensities in Multi-Agent Systems](https://openreview.net/forum?id=iCmg9DN7pH) | 3.667 (4, 3, 4); n=3; std=0.471 | Test whether agents sabotage peers' shutdown mechanisms under varied incentives, instructions, and multi-agent configurations. |
| 9 | #3740 | [Focused Omni-Modal GUI Agents](https://openreview.net/forum?id=LaOUMzqRa7) | 3.667 (4, 4, 3); n=3; std=0.471 | Compress step-relevant multimodal evidence into a latent adapter that guides frozen decoder embeddings. |
| 10 | #62286 | [Credit Where the Cut Happens: Candidate Contraction for Repository-Level Code Localization](https://openreview.net/forum?id=dL4GcShP3x) | 3.667 (3, 4, 4); n=3; std=0.471 | Track monotonically shrinking code-location candidate sets and assign rewards or penalties to each exclusion. |
| 11 | #1762 | [The Environment Knows Why: Bidirectional Self-Distillation from Augmented Tool Feedback for Agentic RL](https://openreview.net/forum?id=2NjyZZ4VLT) | 3.667 (3, 4, 4); n=3; std=0.471 | Mine tool contracts to augment rejection feedback, then use backward and forward self-distillation for correction and recovery. |
| 12 | #11727 | [Argos: Adapt Rich Geometric Priors for Generalizable Online Scene-Change-Detection](https://openreview.net/forum?id=TOJUj2GbtX) | 3.667 (4, 4, 3); n=3; std=0.471 | Adapt geometric foundation-model features for joint scene-change detection and reconstruction within an online mapping system. |
| 13 | #30495 | [OpenMLE: Training LLMs for Evolutionary Search in Machine Learning Engineering](https://openreview.net/forum?id=nSuEq47kb9) | 3.667 (4, 4, 3); n=3; std=0.471 | Train program-revision operators with execution-verified supervision and calibrated rewards, then deploy them in evolutionary search. |
| 14 | #34065 | [nanoswe: Speedrunning SWE-bench](https://openreview.net/forum?id=lmTmF6H8Mx) | 3.667 (4, 4, 3); n=3; std=0.471 | Train coding agents from scratch on stronger models' demonstrations and compare specialization under fixed compute budgets. |
| 15 | #1348 | [Search Environment Agent for Efficient Deep Search Reinforcement Learning](https://openreview.net/forum?id=4HmKWgvoR5) | 3.667 (4, 4, 3); n=3; std=0.471 | Use real-tool experience memory to calibrate simulated search evidence and route decision-relevant discrepancies to real execution. |

## Themes & trends

Recurring mechanisms in this selected top-60 set; the pack does not establish change over time or domain-wide prevalence.

- Internal state becomes an explicit learning target: #22968 exposes context as editable files; #62286 represents code search as a shrinking survivor set.
- Credit assignment uses local evidence: #1762 converts tool rejections into bidirectional supervision, and #62286 prices useful versus damaging candidate exclusions.
- Training spends compute selectively: #4292 balances turns across rollouts using teacher disagreement; #1348 routes only selected search-environment discrepancies to real tools.
- Executable optimization loops: #22401 validates cheap proxy evaluators against expensive objectives; #30495 trains agents as program-revision operators for evolutionary search.
- Long-horizon evaluation stresses coordination and future options: #27010 creates verifiable multi-agent conflicts; #29109 tests puzzles where locally legal actions can destroy solvability.

## Score signals

Computer use (195 papers; 2.378) and `llm-agents.other` (136; 2.356) are the only `llm-agents.*` groups above 2.31. The remaining groups are below: memory (663; 2.286), agent frameworks (1,736; 2.257), multi-agent systems (400; 2.240), code (353; 2.234), deep research/retrieval (382; 2.179), and tool use (217; 2.131). Thus the large general-agent group sits near the major's 2.257 mean, while computer use has a higher descriptive average. Apparent non-agent papers in `other` limit interpretation of that group's above-baseline score.

The snapshot table marks every supplied fine category above, below, or equal to 2.31, including cross-major tags. These are descriptive comparisons within this major, not venue-wide estimates for each tag; overlapping groups and small counts do not establish statistically reliable differences.

## Taxonomy notes

Suggested corrections from the abstracts, not applied changes. Each entry gives a proposed major and fine tags; secondary tags can preserve the method when the research object suggests a different major.

- #463 → major `optimization`, fine `optimization.optimizers` plus `representation.meta`: long-horizon meta-training concerns neural optimizers, not agent memory.
- #13576 → major `science`, fine `science.pde`: the contribution differentiates physical simulation solvers through reverse local adjoints.
- #11727 → major `vision`, fine `vision.three-d-vision` and `vision.detection-seg`: scene-change detection and reconstruction are perception tasks.
- #40844 → major `safety`, fine `safety.agent-safety` plus `llm-agents.multi-agent`: shutdown sabotage is the evaluated risk.
- #16181 → major `llm-core`, fine `llm-core.scaling`, `optimization.optimizers`, and `llm-efficiency.quantization`: numerical errors and LM-head updates explain pretraining loss spikes.
- #18066 → retain major `llm-agents`, fine `llm-agents.agents` and `science.molecules`, replacing `safety.watermark`: provenance traces assign credit in retrosynthesis, not content watermarking.
- #22968 → retain major `llm-agents`, add `llm-agents.memory` alongside `llm-agents.agents` and `llm-agents.multi-agent`: editable context management is the central mechanism.

No new fine category proposed. The pack does not establish the required ≥25-paper support for a distinct new category (rule T3); the corrections above can use existing tags.

