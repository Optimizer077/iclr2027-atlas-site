# Reinforcement Learning — ICLR 2027 domain brief

## Snapshot

1,669 papers; mean rating 2.316; 542 papers (mean ≥ 2.67). Standard deviations below use the population formula.

| Fine category | Count | Mean rating |
|---|---:|---:|
| rl.deep-rl | 425 | 2.265 |
| rl.model-based | 325 | 2.320 |
| rl.other | 269 | 2.341 |
| rl.exploration | 251 | 2.358 |
| embodied.world-models | 247 | 2.360 |
| rl.rl-theory | 223 | 2.359 |
| rl.offline | 196 | 2.321 |
| rl.marl | 196 | 2.316 |
| theory.online | 26 | 2.423 |
| llm-reasoning.rl-reasoning | 25 | 2.317 |
| llm-agents.agents | 13 | 2.288 |
| llm-agents.memory | 10 | 2.700 |
| embodied.manipulation | 9 | 2.315 |
| probabilistic.bayesian | 8 | 2.333 |
| probabilistic.uq | 8 | 1.958 |
| optimization.convex | 7 | 2.667 |
| embodied.vla | 7 | 2.619 |
| theory.dynamics | 7 | 2.476 |
| diffusion.flow-matching | 7 | 2.048 |
| applications.recsys | 7 | 2.333 |
| representation.ssl | 6 | 2.444 |
| llm-reasoning.self-improve | 6 | 2.500 |
| causal.causal-inference | 6 | 2.028 |
| theory.generalization | 5 | 2.333 |
| alignment.preference | 4 | 2.500 |
| representation.domain | 4 | 1.833 |
| optimization.federated | 4 | 2.188 |
| evaluation.llm-bench | 4 | 2.250 |
| llm-agents.deep-research | 4 | 2.312 |
| vision.detection-seg | 3 | 2.222 |
| graphs.topology | 3 | 1.944 |
| safety.privacy | 2 | 3.167 |
| embodied.driving | 2 | 2.667 |
| neuro-cog.brain | 2 | 2.500 |
| vision.remote-sensing | 2 | 2.500 |
| llm-core.finetune | 2 | 3.000 |
| interpretability.mech-interp | 2 | 2.500 |
| llm-reasoning.test-time | 2 | 2.500 |
| llm-reasoning.verifiers | 2 | 2.500 |
| applications.tabular | 2 | 2.500 |
| optimization.optimizers | 2 | 2.333 |
| applications.nlp | 2 | 2.167 |
| graphs.equivariance | 2 | 1.875 |
| applications.finance-edu | 2 | 1.667 |
| neuro-cog.cognition | 2 | 1.833 |
| graphs.graph-llm | 1 | 3.333 |
| evaluation.datasets | 1 | 3.000 |
| vision.vision-backbones | 1 | 3.000 |
| representation.semi-weak | 1 | 3.000 |
| time-series.dynamics | 1 | 2.750 |
| alignment.reward-modeling | 1 | 2.667 |
| safety.fairness | 1 | 2.667 |
| causal.formal | 1 | 2.667 |
| science.protein | 1 | 2.667 |
| llm-agents.code | 1 | 2.500 |
| alignment.llm-judge | 1 | 2.333 |
| llm-core.data | 1 | 2.333 |
| gen-vision.video | 1 | 2.333 |
| llm-agents.computer-use | 1 | 2.333 |
| diffusion.discrete | 1 | 2.000 |
| diffusion.sampling | 1 | 2.000 |
| alignment.pluralistic | 1 | 1.667 |
| safety.adversarial | 1 | 1.667 |
| interpretability.xai | 1 | 1.667 |
| embodied.navigation | 1 | 1.667 |
| vision.medical-imaging | 1 | 1.667 |

## Top 15 papers

| Rank | # | Title | Mean (individual ratings); n; std | One-line idea |
|---:|---:|---|---|---|
| 49 | 56951 | [Recovering and Certifying Incentives in Zero-Sum Stopping Games](https://openreview.net/forum?id=VTj3YBDwJi) | 3.667 (4, 4, 3); n=3; std=0.471 | Recovers both incentives from one continuation-value solve, then globally certifies the stopping-boundary equilibrium. |
| 50 | 14815 | [Learning While Scheduling Jobs under Context-Dependent Service Rates: An Anytime Rate-Optimal Algorithm](https://openreview.net/forum?id=ZZ2jyq4qFC) | 3.667 (3, 4, 4); n=3; std=0.471 | Eliminates narrow confidence intervals while bounding queue regret through workload-potential drift and elliptical counts. |
| 98 | 13585 | [Bellman-Convex Reinforcement Learning in Continuous Markov Decision Processes](https://openreview.net/forum?id=0xubI3fLZa) | 3.667 (4, 3, 4); n=3; std=0.471 | Regresses global convex envelopes around proximal Bellman anchors, yielding convex planning and dimension-specific sample rates. |
| 118 | 1663 | [Beyond Uniform Token-Level Trust Region in LLM Reinforcement Learning](https://openreview.net/forum?id=XPE0YgOE6H) | 3.667 (4, 4, 3); n=3; std=0.471 | Masks token updates using position-weighted divergence constrained by a cumulative prefix budget. |
| 130 | 43503 | [Jumpy Planning over Policy Occupancies Improves Online Goal-Conditioned RL](https://openreview.net/forum?id=LS5vJts4So) | 3.667 (4, 4, 3); n=3; std=0.471 | Chains learned policy-occupancy predictions over subgoals and scores plans with conditional success estimates. |
| 152 | 28305 | [Mastering Atari 2600 Games With Discovered Options](https://openreview.net/forum?id=MUlcXzyThE) | 3.667 (4, 4, 3); n=3; std=0.471 | Discovers options online from Laplacian representations learned directly from high-dimensional observations. |
| 164 | 36563 | [Capacity-Aware Policy Improvement for Model-Based Reinforcement Learning](https://openreview.net/forum?id=onXkWy1rsX) | 3.667 (3, 4, 4); n=3; std=0.471 | Entropy-regularizes actor-sample weights while capping each sample's share to limit planner-critic errors. |
| 203 | 16278 | [Asking the World: Generalist Physical Reasoning through Agentic World Modeling and Probing](https://openreview.net/forum?id=68GxE5Vrso) | 3.667 (3, 4, 4); n=3; std=0.471 | Calibrates executable multiphysics worlds from video, then runs question-directed simulations and interventions. |
| 206 | 19629 | [Rate-Optimal Algorithm for Learning Adversarial Linear CMDPs](https://openreview.net/forum?id=EBhtPdtKOL) | 3.667 (4, 3, 4); n=3; std=0.471 | Combines adaptive FTRL, contracted values, and exponential Lyapunov regularization without policy mixing. |
| 210 | 23669 | [Compute Efficient Deep Reinforcement Learning via Normalized GLU Block](https://openreview.net/forum?id=mzf9obZdEx) | 3.667 (4, 3, 4); n=3; std=0.471 | Adds pre-activation normalization to gated linear units, controlling feature norms while preserving multiplicative expressivity. |
| 242 | 41121 | [RoboBranch: Branching Exploration as a New Scaling Axis for Robot-Use Agents](https://openreview.net/forum?id=TJteJVAzk1) | 3.667 (3, 4, 4); n=3; std=0.471 | Executes candidate actions from copied simulator states and learns guidance from every branch outcome. |
| 283 | 5888 | [Graph-Discovering for Networked Restless Multi-Armed Bandits with Nonlinear Delayed Propagation](https://openreview.net/forum?id=rJ5oUy2nuv) | 3.500 (4, 3); n=2; std=0.500 | Couples derivative-weighted Fisher exploration with sparse graph estimation and optimistic stochastic rollouts. |
| 296 | 50083 | [Taylor Representations for Model-Free RL in Networked MDPs](https://openreview.net/forum?id=XZVJs2x43N) | 3.333 (4, 3, 3); n=3; std=0.471 | Truncates distance-decaying Taylor coefficients to construct scalable local critics for networked MDPs. |
| 301 | 30763 | [PACE: Discovering Options via Self-Distillation](https://openreview.net/forum?id=mbqOhJ9yHb) | 3.333 (4, 4, 2); n=3; std=0.943 | Distills PPO into multi-action options whose commitment length follows predicted replay reliability. |
| 313 | 15192 | [T-MAC: Target-Motion Actor-Critic for Generative Reinforcement Learning](https://openreview.net/forum?id=LEZCBNrgpM) | 3.333 (3, 3, 4); n=3; std=0.471 | Trains flow-policy velocity changes from successive critics' JKO responses, gated by target motion. |

## Themes & trends

- Temporal abstraction is learned online rather than supplied. #28305 discovers Laplacian options, #30763 distills adaptive-commitment options, and #43503 plans over short subgoal sequences.
- Structural assumptions produce sharper theory: #13585 exploits Bellman convexity, #19629 combines primal-dual regularization with contracted values, and #14815 analyzes queueing regret through workload drift.
- Exploration compares several futures from the same state or probes a model directly. #41121 branches copied simulator states, while #5888 chooses Fisher-informative interventions for graph discovery.
- Policy updates confront nonstationary targets explicitly. #36563 caps actor-weight concentration under planner mismatch, #15192 learns the critic target's motion, and #1663 budgets divergence along prefixes.
- Graph locality supplies scalable approximations: #50083 discards Taylor terms involving distant agents, and #5888 estimates a sparse propagation graph for restless bandits.
- World models become objects to interrogate, with #16278 calibrating and probing a multiphysics simulator and #48400 using reward-supervised models as action verifiers.

## Score signals

Six native categories sit above the venue-wide mean of 2.31: rl-theory at 2.359 (223), exploration at 2.358 (251), other at 2.341 (269), offline at 2.321 (196), model-based at 2.320 (325), and marl at 2.316 (196). Deep-rl falls below it at 2.265 (425), despite being the largest native tag.

Cross tags above 2.31 with at least six papers include llm-agents.memory at 2.700 (10), optimization.convex at 2.667 (7), embodied.vla at 2.619 (7), theory.dynamics at 2.476 (7), theory.online at 2.423 (26), representation.ssl at 2.444 (6), and llm-reasoning.self-improve at 2.500 (6). Probabilistic.uq scores 1.958 (8), diffusion.flow-matching 2.048 (7), and causal.causal-inference 2.028 (6). Llm-agents.agents itself scores 2.288 across 13 papers.

## Taxonomy notes

- #1663 → llm-reasoning/rl-reasoning: the method specifically controls token-level policy divergence during LLM reasoning training.
- #41121 → embodied/vla: robot-use agents act through navigation, perception, and manipulation tools in simulation.
- #15780 → llm-reasoning/rl-reasoning: reasoning-induced supervised RL with expert collaboration is more specific than rl.other.
- #24118 → llm-reasoning/rl-reasoning: the paper studies token credit in on-policy self-distillation rather than general RL.
- #9025 → embodied/manipulation: discovering robot demonstrations for imitation learning warrants an embodied primary tag.
- No new fine category proposed; no candidate's support of at least 25 papers can be established from this pack alone.
