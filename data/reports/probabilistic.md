# Probabilistic ML & Uncertainty — ICLR 2027 domain brief

Source: `reports/inputs/probabilistic.json` only. Ratings are on the 1–4 scale; the venue-wide mean of means is 2.31.

## Snapshot

- **Papers:** 911
- **Mean rating:** 2.273 (venue mean 2.31, so −0.037)
- **Top 60 in the pack:** means run from 4.00 down to 3.00.

Fine categories sorted by count. Papers can carry up to 3 fine tags. `probabilistic.other` means no fine pattern matched.

| Fine category | Count | Mean rating |
|---|---:|---:|
| `probabilistic.uq` | 518 | 2.203 |
| `probabilistic.bayesian` | 333 | 2.325 |
| `probabilistic.other` | 92 | 2.351 |
| `probabilistic.sampling` | 71 | 2.362 |
| `optimization.bo-hpo` | 37 | 2.577 |
| `diffusion.inverse` | 12 | 2.528 |
| `alignment.sycophancy` | 10 | 2.133 |
| `representation.domain` | 8 | 2.500 |
| `llm-core.finetune` | 7 | 2.095 |
| `time-series.forecasting` | 7 | 2.131 |
| `applications.tabular` | 6 | 2.264 |
| `llm-efficiency.pruning` | 5 | 2.267 |
| `representation.ssl` | 5 | 1.967 |
| `time-series.ts-other` | 5 | 1.733 |
| `causal.causal-inference` | 4 | 2.000 |
| `diffusion.flow-matching` | 4 | 2.750 |
| `graphs.equivariance` | 4 | 2.583 |
| `rl.rl-theory` | 4 | 2.250 |
| `science.health` | 4 | 1.667 |
| `diffusion.discrete` | 3 | 2.556 |
| `graphs.gnn` | 3 | 1.889 |
| `llm-agents.agents` | 3 | 2.667 |
| `llm-agents.deep-research` | 3 | 2.556 |
| `llm-agents.multi-agent` | 3 | 2.306 |
| `llm-reasoning.cot` | 3 | 2.333 |
| `rl.model-based` | 3 | 1.889 |
| `theory.online` | 3 | 2.500 |
| `vision.detection-seg` | 3 | 2.389 |

50 further fine tags have count < 3 (70 tag assignments in total) and are omitted here; they are listed in the input pack.

## Top 15 papers

Rank is the position within this domain. The number in parentheses is the pack's `rank` field, which appears to be a venue-wide ordering.

| Rank | # | Title | Mean (ratings) | One-line idea |
|---:|---:|---|---|---|
| 1 (10) | #15173 | [Multi-stage Bayesian Optimisation under Unknown Stopping Constraints](https://openreview.net/forum?id=Hul3VALKi0) | 4.00 (4, 4, 4) | Feasibility-indicated MDP plus optimistic lookahead value iteration with annealed feasibility margin; sublinear abort count and value regret. |
| 2 (17) | #26211 | [Interacting Particle Guidance for Sampling Reward-tilted Generative Priors](https://openreview.net/forum?id=uVnBtqEgSk) | 4.00 (4, 4, 4) | Replaces SMC reweighting with an interacting-particle drift from the Feynman–Kac PDE, closed-form in an RKHS, keeping weights near-uniform. |
| 3 (42) | #46270 | [TestBED: An Open-Source Toolkit for Bayesian Experimental Design](https://openreview.net/forum?id=dQVkeGml4z) | 3.67 (4, 3, 4) | Modular open-source toolkit decomposing Bayesian experimental design into tasks, objectives, training, policies and evaluation, with scalable EIG estimators. |
| 4 (44) | #15804 | [Moore, Escher, Penrose: A Conformal Golden Braid](https://openreview.net/forum?id=LHm0tOWX3c) | 3.67 (4, 4, 3) | Generates Escher-style conformal power-map art with pretrained diffusion, applying the map's Moore–Penrose pseudo-inverse projection inside sampling. |
| 5 (47) | #50567 | [Mixture of GFlowNets](https://openreview.net/forum?id=zHudczKPCH) | 3.67 (3, 4, 4) | Population of asynchronously trained GFlowNets partitioned by a shared soft classifier via reward shaping, mixed using learned partition functions. |
| 6 (90) | #31961 | [Prior-Amortized In-Context Bayesian Inference for Generalized Linear Mixed-Effects Models](https://openreview.net/forum?id=4pw2hIrq0U) | 3.67 (4, 4, 3) | Pretrained set-transformer plus spline-flow amortizes GLMM posteriors with the prior as context, refined by independence Metropolis–Hastings. |
| 7 (127) | #40271 | [BAM! Bayesian Anything Model: a foundation model for generative computational imaging](https://openreview.net/forum?id=yOjWFGknrm) | 3.67 (4, 3, 4) | Operator-conditioned conditional flow map gives few-step physics-aware posterior sampling across imaging tasks without likelihood approximation or guidance. |
| 8 (184) | #57498 | [RESPONSE CALIBRATION FOR NEURAL POPULATION MODELS](https://openreview.net/forum?id=D22zAVF9SH) | 3.67 (3, 4, 4) | Extra loss matching predicted stimulated-minus-blank differences to randomized-trial measurements, applied to neural population forecasters such as PC-Flow. |
| 9 (247) | #49371 | [Acceleration and its Limits in Gaussian Variational Inference](https://openreview.net/forum?id=mKsRKa8Rbj) | 3.67 (3, 4, 4) | Composite convex GVI attains √κ with exact expectations; with pointwise derivative queries a κ^{1−o(1)} lower bound holds. |
| 10 (280) | #27163 | [Dirichlet Follow-the-Leader Closes the Gap in Simultaneous Multiclass U-Calibration](https://openreview.net/forum?id=Nw2Ay81op4) | 3.50 (3, 4, 4, 3) | Sampling forecasts from Dir(past class counts), a Bayesian bootstrap, attains minimax multiclass U-calibration and logarithmic smooth-loss regret. |
| 11 (291) | #36751 | [Sequential Bayesian Quadrature with Hilbert space Gaussian processes](https://openreview.net/forum?id=7nbwrIMUtV) | 3.33 (2, 4, 4) | Represents Bayesian quadrature and integral-targeted acquisition in a finite Laplacian eigenbasis, with bounds on features needed for full-kernel rates. |
| 12 (322) | #26019 | [The RKHS Cost of Neural Activations for Sparse Variational Gaussian Processes](https://openreview.net/forum?id=lIv2VgUFzV) | 3.33 (3, 3, 4) | Neurons lie in their single-layer NNGP RKHS iff activations are polynomial (d≥2); smooth non-polynomial neurons incur superpolynomial RKHS cost. |
| 13 (326) | #28540 | [Proxy-guided Sampling for Robust Probabilistic Minimum Bayes Risk Decoding](https://openreview.net/forum?id=EPW0tQkWuv) | 3.33 (4, 3, 3) | Uses model log-probabilities as proxy scores to choose which candidate–reference pairs to evaluate before ALS completes the MBR matrix. |
| 14 (407) | #48026 | [Coherent Moment Propagation: Epistemic Uncertainty for Pre-trained Robot Policies](https://openreview.net/forum?id=pJA2beWZvY) | 3.33 (4, 3, 3) | Proves BayesDiff variance decays as O(1/T) in Euler steps; carrying state-weight cross-covariance restores epistemic uncertainty for flow policies. |
| 15 (558) | #32328 | [Great Expectations under Language Models with Potentials](https://openreview.net/forum?id=ILxH4KZsAP) | 3.33 (4, 3, 3) | Prefix potentials that additively decompose a test functional reuse next-token probabilities to build lower-variance estimators of LM expectations. |

## Themes & trends

- **Particle and SMC methods for steering and conditioning generative models.** The cluster covers:
  - interacting-particle transport instead of SMC reweighting for reward-tilted priors: #26211
  - SMC with accumulated weights to estimate rare-event probabilities under diffusion surrogates: #47995
  - a general framework for conditioning stochastic processes: #38260
  - pseudo-inverse projections inside diffusion sampling: #15804
- **Amortized and simulation-based inference built on diffusion or flow models.** The cluster covers:
  - prior-as-context GLMM posteriors refined by Metropolis–Hastings: #31961
  - exact test-time prior adaptation for diffusion-based SBI: #17926
  - compositional diffusion SBI under simulator misspecification: #10222
  - a physics-aware foundation model for imaging posteriors: #40271
- **Scaling GFlowNet exploration.** Three papers attack mode coverage:
  - partitioning the state space across many samplers: #50567, #14617
  - revisiting the training dynamics through negative-reinforce updates: #14621
- **Conformal, calibration and anytime-valid inference beyond the textbook setting.** The settings include:
  - conformal sets for network source localization: #25263
  - interval length under Huber contamination: #48233
  - coverage under performative feedback: #38214
  - partial-conjunction selection with FDR control: #1836
  - online calibration rates: #27163, #12844
  - anytime-valid sequential tests: #25097, #49424
- **Prediction-powered inference and statistics with LLM judges.** Using model predictions or predictive distributions to tighten inference from few gold labels (#32183, #50836), contracts that pay for better automated judgments (#32656), and calibrating a panel of noisy LLM judges rather than curating it (#48367).
- **LLMs and generative latents inside Bayesian optimization.** An agentic BO loop with a Bayesian backend (#38584), LLM-guided search geometry for high-dimensional BO (#40426), and affine surrogates in generative latent spaces (#44070). Alongside these sit structured BO formulations such as multi-stage BO with unknown stopping constraints (#15173) and sequential Bayesian quadrature (#36751).

## Score signals

The domain mean is 2.273, which is −0.037 below the venue mean of 2.31.

**Fine categories inside `probabilistic`:**

- Above: `probabilistic.sampling` 2.362 (n = 71), `probabilistic.other` 2.351 (n = 92), `probabilistic.bayesian` 2.325 (n = 333).
- Below: `probabilistic.uq` 2.203 (n = 518). It is the largest category, and its mean is the only one below the venue mean, which pulls the domain mean down.

**Cross-major tags above the venue mean:**

- `optimization.bo-hpo` 2.577 (n = 37). This is the strongest signal with a non-trivial count.
- `diffusion.inverse` 2.528 (n = 12)
- `representation.domain` 2.500 (n = 8)
- `diffusion.flow-matching` 2.750 (n = 4)
- `graphs.equivariance` 2.583 (n = 4)

**Cross-major tags below the venue mean:**

- `alignment.sycophancy` 2.133 (n = 10)
- `time-series.forecasting` 2.131 (n = 7)
- `llm-core.finetune` 2.095 (n = 7)
- `representation.ssl` 1.967 (n = 5)
- `time-series.ts-other` 1.733 (n = 5)
- `causal.causal-inference` 2.000 (n = 4)
- `science.health` 1.667 (n = 4)

**Within the top 60:**

- `probabilistic.uq` 25 papers
- `probabilistic.bayesian` 23
- `probabilistic.other` 12
- `optimization.bo-hpo` 3
- `probabilistic.sampling` 3

`probabilistic.uq` therefore has the lowest mean but the most top-60 papers. Many of its top-60 papers look mis-tagged (see Taxonomy notes), so the category mixes strong UQ work with a large set of keyword matches.

Counts of 4–10 are too small to rank categories reliably.

## Taxonomy notes

**Likely misclassified or mis-tagged (top 60).**

The `probabilistic.uq` pattern list includes "calibration" and "conformal". In the top 60, those words pull in papers whose research object is something else. By my reading, 9 of the 25 top-60 papers tagged `probabilistic.uq` are such keyword matches:

- #15804 → `gen-vision` / `gen-vision.editing` or `diffusion.guidance`. "Conformal" here is a conformal map in complex analysis, applied to diffusion-generated art. It is not conformal prediction.
- #57498 → `neuro-cog` / `neuro-cog.brain`. "Response calibration" is a training loss for neural-population forecasters.
- #3479 → `neuro-cog.brain`. It covers spike-count generation for cross-day neuroprosthesis calibration.
- #17562 → `safety` / `llm-core.finetune`. It concerns safety-preserving LLM fine-tuning with "recalibration".
- #4223 → `llm-efficiency.distillation`. It is natural-gradient reweighting of multi-turn on-policy distillation.
- #13252 → `vision` or `evaluation.eval-methods`. It is open-dimension image quality scoring, and "ordinal calibration" is only a component.
- #12278 → `llm-reasoning` / `llm-reasoning.test-time`. It uses token entropy to choose the decomposition depth in adaptive reasoning.
- #46100 → `llm-core.architecture` or `llm-efficiency.kv-cache`. The object is random-feature approximation of softmax attention.
- #48072 → `safety.adversarial` with `rl`. It certifies RL policies against action attacks, and conformal calibration is only a component.

Further mis-tags outside that pattern:

- #61018 → `safety.adversarial` with `graphs.gnn`. It is tagged `probabilistic.bayesian` probably because "RGSM-GP" contains "GP", which matches the case-sensitive `\bGPs?\b` pattern. Here GP means Graph Purification, not a Gaussian process.
- #34442 → `theory.online` or `rl.rl-theory`. It is fixed-budget cluster identification, a bandit-style problem. The `diffusion.inverse` tag comes from "posterior sampling".
- #1514 → `llm-reasoning.rl-reasoning`. It identifies a failure mode of probability-based rewards in verifier-free RL for LLMs.
- #44070 → replace `rl.exploration` with `optimization.bo-hpo`. "Exploration" refers to latent-space BO, not RL.
- #34049 → replace `representation.domain` with `llm-agents.memory`. "Test-time adaptation" here means a Bayesian nonparametric memory of reasoning strategies.
- #50475 → add `evaluation.llm-bench`. It benchmarks LLM belief updating.

**Proposed new fine categories (major `probabilistic`).** The pack covers only the top 60, so I cannot check rule T3 (≥ 25 papers) from it.

1. **Simulation-Based & Amortized Inference.** Neural posterior estimation, amortized and prior-conditioned inference, and SBI under misspecification, where a trained network replaces per-dataset MCMC or VI. It is split from `probabilistic.bayesian`. Examples: #31961, #17926, #10222, #40271.
2. **Prediction-Powered & Model-Assisted Inference.** Valid statistical inference that combines a small gold-labelled sample with ML or LLM predictions or judges (PPI and variants, judge calibration). Examples: #32183, #50836, #32656, #48367.
3. **GFlowNets & Amortized Samplers for Discrete Objects.** Training and exploration for samplers proportional to an unnormalized reward over compositional spaces. All three top-60 examples currently sit in `probabilistic.other`. Examples: #50567, #14617, #14621.

Considered and not proposed: **particle/SMC steering of generative models** (#26211, #47995). It overlaps `diffusion.guidance` and `probabilistic.sampling`, so the boundary should be settled with the diffusion owner first.
