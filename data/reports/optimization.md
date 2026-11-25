# Optimization & Training Methods — ICLR 2027 domain brief

Source: `reports/inputs/optimization.json` only. Ratings are on the 1–4 scale; the venue-wide mean of means is 2.31.

## Snapshot

- **Papers:** 1268
- **Mean rating:** 2.303 (venue mean 2.31, so −0.007)
- **Top 60 in the pack:** means run from 3.75 down to 3.33.

Fine categories sorted by count. Papers can carry up to 3 fine tags. `optimization.other` means no fine pattern matched.

| Fine category | Count | Mean rating |
|---|---:|---:|
| `optimization.optimizers` | 404 | 2.291 |
| `optimization.convex` | 373 | 2.352 |
| `optimization.other` | 275 | 2.296 |
| `optimization.federated` | 264 | 2.277 |
| `optimization.bo-hpo` | 113 | 2.283 |
| `probabilistic.bayesian` | 23 | 2.250 |
| `llm-core.finetune` | 19 | 2.273 |
| `graphs.equivariance` | 14 | 2.488 |
| `theory.generalization` | 13 | 2.333 |
| `theory.dynamics` | 12 | 2.229 |
| `theory.online` | 10 | 2.125 |
| `vision.detection-seg` | 10 | 2.567 |
| `llm-efficiency.quantization` | 8 | 2.083 |
| `llm-agents.agents` | 6 | 2.306 |
| `llm-efficiency.pruning` | 6 | 2.389 |
| `llm-reasoning.rl-reasoning` | 6 | 2.556 |
| `llm-core.scaling` | 5 | 2.667 |
| `graphs.topology` | 4 | 2.000 |
| `representation.domain` | 4 | 2.250 |
| `representation.ssl` | 4 | 2.563 |
| `alignment.preference` | 3 | 2.667 |
| `evaluation.llm-bench` | 3 | 2.556 |
| `multimodal.vlm` | 3 | 1.889 |
| `representation.continual` | 3 | 1.639 |

42 further fine tags have count < 3 (54 tag assignments in total) and are omitted here; they are listed in the input pack.

## Top 15 papers

Rank is the position within this domain. The number in parentheses is the pack's `rank` field, which appears to be a venue-wide ordering. Titles are reproduced as they appear in the pack, so the truncated "Descen" in #59714 is the pack's.

| Rank | # | Title | Mean (ratings) | One-line idea |
|---:|---:|---|---|---|
| 1 (39) | #6348 | [Bridging the Gap Between Homogeneous and Heterogeneous Asynchronous Optimization Is Surprisingly Difficult](https://openreview.net/forum?id=XsOXBiKamY) | 3.75 (4, 4, 4, 3) | Lower bounds show similarity or weak-interpolation assumptions cannot close the heterogeneous asynchronous gap; strong interpolation plus local PL does. |
| 2 (40) | #36265 | [HapBO: Harnessed α–π Bayesian Optimization via Expert Natural Language Priors](https://openreview.net/forum?id=45k9l8zWbL) | 3.75 (4, 3, 4, 4) | Compiles expert or LLM language priors into a belief function that boundedly rescales acquisitions; no in-loop LLM calls. |
| 3 (67) | #20939 | [Optimality in Decentralized Optimization under Bandwidth Constraints](https://openreview.net/forum?id=BiaD9zBnSY) | 3.67 (4, 4, 3) | Optimal nonconvex asynchronous time complexities expressed via min-cut/max-flow quantities; Grace SGD and Leon SGD attain them. |
| 4 (77) | #36186 | [Consistent Algorithms for Dynamic Non-Monotone Submodular Maximization with Efficient Updates](https://openreview.net/forum?id=naoqVY2VBP) | 3.67 (4, 3, 4) | ConsistentSample keeps a constant-factor approximation under cardinality constraints with O(log k/ε²) consistency for dynamic non-monotone objectives. |
| 5 (82) | #49537 | [PEACH: Personalized Negative Caching and Sampling for Unbiased Optimization of Extreme Multiclass Classification](https://openreview.net/forum?id=bY07ZAmiFk) | 3.67 (4, 4, 3) | Per-example cache of hard negatives evaluated exactly plus random sampling of remaining classes gives unbiased, lower-variance min-min gradients. |
| 6 (113) | #59714 | [Broximal Gradient Descent: A Projection-Free Sister of Projected Gradient Descen](https://openreview.net/forum?id=qcR1vctbGZ) | 3.67 (4, 4, 3) | Replaces projection with minimizing the linearized objective over the constraint set intersected with a ball around the iterate. |
| 7 (139) | #9470 | [Fast Tuning-Free Densest $k$-Subgraph Extraction](https://openreview.net/forum?id=dcRuxDiEIM) | 3.67 (4, 3, 4) | Minorization–maximization over a lightly loaded capped-simplex relaxation; weight choice selects the KKT point, needing no tuning or eigendecomposition. |
| 8 (142) | #16213 | [Beyond Gaussianity: From Source Properties to Muon for Noise Optimization](https://openreview.net/forum?id=OIB8GJ5llR) | 3.67 (4, 3, 4) | Controls how reward-guided noise updates perturb the latent's spectral structure, instead of enforcing Gaussianity, simply by using Muon. |
| 9 (147) | #20760 | [Weight Decay and Neuron Condensation:  A Three-Stage Analysis of Two-Layer ReLU Networks](https://openreview.net/forum?id=Gsk2rxmUh6) | 3.67 (3, 4, 4) | From NTK-regime initialization, weight decay drives three stages—rapid fitting, amplitude compression, angular condensation—governed by a residual correlation field. |
| 10 (175) | #47052 | [Metropolis-Hastings Dominates Importance Resampling for Policy Composition](https://openreview.net/forum?id=d7pIOjGLTu) | 3.67 (4, 3, 4) | Independence Metropolis–Hastings correction for decoding-time product-of-policies composition beats SIR under every convex f-divergence at matched budget. |
| 11 (215) | #31697 | [AltGDA Achieves Global $O(1/T)$ Ergodic Convergence in Matrix Games](https://openreview.net/forum?id=GCJ61TFZDZ) | 3.67 (4, 4, 3) | PEP-guided Lyapunov search proves O(1/T) ergodic duality gap for alternating GDA in every matrix game; Lean-verified. |
| 12 (236) | #28279 | [Moment-Accurate Gaussian Mixtures for Constant-Step Stochastic Approximation](https://openreview.net/forum?id=FYYlblOF3l) | 3.67 (4, 3, 4) | Matches stationary energy with local Ornstein–Uhlenbeck limits to get moment-accurate Gaussian mixtures near hyperbolic equilibria of constant-step SA. |
| 13 (272) | #16449 | [Dion3: Full-Stack Orthogonal Updates](https://openreview.net/forum?id=QZLw9EZ9KA) | 3.50 (3, 4, 3, 4) | Gram Newton–Schulz, symmetry-exploiting kernels, megabatching and partial-row orthogonalization cut Muon's optimizer step time up to 6x. |
| 14 (297) | #50794 | [ScaledGD for Underparameterized Matrix Factorization: Global Convergence and Stepsize Universality](https://openreview.net/forum?id=SQXGpqquC0) | 3.33 (3, 3, 4) | Linear coordinate change reveals ScaledGD as GD on a hidden objective, yielding global convergence for all step sizes in (0,1). |
| 15 (317) | #20958 | [Muon with Finite Newton–Schulz: The Smoothing Benefit in Nonsmooth Nonconvex Optimization](https://openreview.net/forum?id=afc0DiW11W) | 3.33 (3, 4, 3) | Finite Newton–Schulz smooths the polar map into a Lipschitz spectral map; online-to-nonconvex conversion then yields nonsmooth nonconvex stationarity guarantees. |

## Themes & trends

- **Muon and spectral (orthogonalized) optimizers dominate the optimizer work.** 9 of the top 60 name Muon or Newton–Schulz in the title or keywords. The work spans:
  - systems speedups: #16449
  - convergence theory for finite Newton–Schulz: #20958
  - convex-geometry classification of adaptive spectral normalization: #8176
  - per-expert step sizes for MoE: #28232
  - sceptical results: random or inverted spectra work as well (#15975), and simplicity bias as a downside (#34979)
- **Adam under heavy-tailed noise.** Two papers give sharp upper and lower bounds for unmodified Adam when noise has only finite p-th moments (#59091, #686). #59091 concludes that heavy-tailed noise alone cannot explain why Muon outperforms Adam. #26520 brings the same heavy-tailed concern to phase retrieval through conditional quantiles.
- **Closing complexity gaps with matching lower bounds.** The bounds cover:
  - asynchronous heterogeneous optimization: #6348
  - decentralized optimization under bandwidth limits: #20939
  - nonconvex and PL finite sums: #11158
  - almost-sure last-iterate SGD: #47218
  - step-size-schedule acceleration: #10515
  - random reshuffling: #17418
  - structured Hölder-smooth problems: #12382

  Most of these papers pair an algorithm with a lower bound. #43405 is a hardness result: recognizing signomial convexity is NP-hard.
- **Learning to accelerate classical solvers.** Learned components are inserted into exact or classical pipelines:
  - dual prediction for column generation: #46163
  - warm-starting interior-point methods: #31677
  - diffusion-based amortized solvers for nonconvex and chance-constrained programs: #47599, #14932
  - scalable optimization over embedded ReLU surrogates: #37622
- **LLMs inside black-box and algorithm-design loops.** The cluster covers language priors compiled into Bayesian optimization (#36265), a BO benchmark built from expensive LLM training runs (#26432), online LLM-driven algorithm design (#32416), and LLM-assisted repair of optimization models (#48999).
- **Submodular and combinatorial optimization.** The cluster covers consistent dynamic non-monotone submodular maximization (#36186), nearly linear oracle algorithms under matroid constraints (#48745), tuning-free densest k-subgraph (#9470), and likelihood-free BO for general subset selection (#38247).

## Score signals

The domain mean is 2.303, which is −0.007 below the venue mean of 2.31.

**Fine categories inside `optimization`:**

- Above: only `optimization.convex`, at 2.352 (n = 373).
- Below, by small margins:
  - `optimization.other` 2.296 (n = 275)
  - `optimization.optimizers` 2.291 (n = 404)
  - `optimization.bo-hpo` 2.283 (n = 113)
  - `optimization.federated` 2.277 (n = 264)

**Cross-major tags above the venue mean:**

- `graphs.equivariance` 2.488 (n = 14)
- `vision.detection-seg` 2.567 (n = 10)
- `llm-reasoning.rl-reasoning` 2.556 (n = 6)
- `llm-efficiency.pruning` 2.389 (n = 6)
- `llm-core.scaling` 2.667 (n = 5)
- `representation.ssl` 2.563 (n = 4)

**Cross-major tags below the venue mean:**

- `probabilistic.bayesian` 2.250 (n = 23)
- `llm-core.finetune` 2.273 (n = 19)
- `theory.dynamics` 2.229 (n = 12)
- `theory.online` 2.125 (n = 10)
- `llm-efficiency.quantization` 2.083 (n = 8)
- `multimodal.vlm` 1.889 (n = 3)
- `representation.continual` 1.639 (n = 3)

**Within the top 60:**

- `optimization.convex` 22 papers (18 as first tag)
- `optimization.optimizers` 19
- `optimization.other` 14
- `optimization.federated` 7
- `optimization.bo-hpo` 6

`optimization.optimizers` is the largest category (n = 404), yet its mean sits slightly below the venue mean. Its strong papers in the top 60, which are mostly Muon-related, do not lift the category average.

All cross-major signals above rest on n ≤ 23. Treat the ones with n < 10 as noise.

## Taxonomy notes

**Likely misclassified or mis-tagged (top 60):**

- #16213 → `diffusion` / `diffusion.guidance`. The object is reward-guided initial-noise optimization for pretrained image generators, and Muon is only the tool. The `optimization.optimizers` tag comes from "Muon".
- #47052 → `alignment` (multi-objective, decoding-time policy composition) with `probabilistic.sampling`. The `optimization.convex` tag comes from the phrase "convex f-divergence".
- #20760 → `theory` / `theory.dynamics`. It is a three-stage training-dynamics analysis of two-layer ReLU networks, not an optimizer.
- #10956 → `theory` / `theory.generalization`. It proves generalization of uniformly random interpolating parameters. The `optimization.optimizers` tag probably comes from "optimizer" in the title.
- #56270 → `theory.dynamics` plus `llm-core.scaling`. It is a solvable nonlinear model of scaling laws. The `optimization.bo-hpo` tag comes from "hyperparameter landscape".
- #39397 → `rl` / `rl.rl-theory`. It analyses REINFORCE-style fine-tuning dynamics on self-generated data and is tagged `optimization.convex`.
- #47315 → `llm-efficiency` / `llm-efficiency.kv-cache`. It builds attention coresets that compress the KV cache.
- #45746 → `time-series` / `time-series.ts-other`. It factorizes tensors of incomplete non-intrusive load-monitoring data and is tagged `optimization.other`.
- #1904 → `representation`. It reuses pretrained weights to initialize models of different sizes, so it is transfer, not optimizer design. The `optimization.optimizers` tag comes from "preconditioning". No existing fine category fits cleanly.
- #51862 → replace `graphs.equivariance` with `theory.online`. It is adversarial bandit convex optimization, and "Riemannian geometry" triggered the equivariance tag.
- #14189 → add `representation.domain`. It does federated generalized category discovery on unseen domains.

**Proposed new fine categories (major `optimization`).** The pack covers only the top 60, so I cannot check rule T3 (≥ 25 papers) from it.

1. **Spectral & Orthogonalized Matrix Optimizers.** Optimizers that act on the singular-value structure of matrix parameters (Muon, Newton–Schulz, Dion, LMO-based non-Euclidean steps), plus their theory and kernels. It is split from `optimization.optimizers`, which would keep elementwise and adaptive methods. Examples: #16449, #20958, #15975, #8176, #28232, #34979.
2. **Learning to Optimize & Learned Solver Acceleration.** Learned models that warm-start, guide or amortize classical solvers for LP, NLP, MIP or chance-constrained programs. The object is the solver pipeline, not a training optimizer. Examples: #46163, #31677, #47599, #14932, #37622.
3. **Submodular & Combinatorial Optimization.** Approximation and oracle algorithms for set functions, matroid constraints and graph subset problems. This would reduce the 275-paper `optimization.other` bucket. Examples: #36186, #48745, #9470, #38247.

Considered and not proposed: **LLM-guided optimization and algorithm design** (#36265, #32416, #48999). It overlaps `optimization.bo-hpo` and `llm-agents`, so a separate category needs a clearer boundary first.
