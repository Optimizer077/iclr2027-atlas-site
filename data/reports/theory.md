# Learning Theory — ICLR 2027 domain brief

Source: `reports/inputs/theory.json` only. Ratings are on the 1–4 scale; the venue-wide mean of means is 2.31.

## Snapshot

- **Papers:** 817
- **Mean rating:** 2.346 (venue mean 2.31, so +0.036)
- **Top 60 in the pack:** means run from 4.00 down to 3.25.

Fine categories sorted by count. Papers can carry up to 3 fine tags, so counts sum to more than 817. `theory.other` means no fine pattern matched.

| Fine category | Count | Mean rating |
|---|---:|---:|
| `theory.online` | 239 | 2.399 |
| `theory.other` | 211 | 2.297 |
| `theory.generalization` | 187 | 2.344 |
| `theory.dynamics` | 178 | 2.338 |
| `theory.transformer-theory` | 63 | 2.406 |
| `rl.rl-theory` | 32 | 2.620 |
| `optimization.optimizers` | 10 | 2.675 |
| `optimization.convex` | 8 | 2.573 |
| `causal.causal-inference` | 7 | 2.286 |
| `representation.ssl` | 5 | 2.400 |
| `rl.marl` | 5 | 2.683 |
| `probabilistic.uq` | 4 | 1.833 |
| `representation.domain` | 4 | 2.000 |
| `graphs.equivariance` | 3 | 2.444 |
| `llm-core.architecture` | 3 | 2.639 |
| `neuro-cog.brain` | 3 | 1.889 |
| `probabilistic.sampling` | 3 | 3.111 |

38 further fine tags have count < 3 (51 tag assignments in total) and are omitted here; they are listed in the input pack.

## Top 15 papers

Rank is the position within this domain. The number in parentheses is the pack's `rank` field, which appears to be a venue-wide ordering.

| Rank | # | Title | Mean (ratings) | One-line idea |
|---:|---:|---|---|---|
| 1 (8) | #12810 | [A Finite-Sample Analysis of Quantile Temporal-Difference Learning](https://openreview.net/forum?id=jHeJyv15lH) | 4.00 (4, 4, 4) | Two-stage global-to-local proof (Bellman contraction, then variance–drift matching) gives last-iterate rates for tabular quantile TD. |
| 2 (22) | #31029 | [Proper Learning of Signed Narrow ReLU Networks](https://openreview.net/forum?id=LLqzdeta7Y) | 4.00 (4, 4, 4) | Moment statistics plus a norm-preserving rotation properly learn bias-free signed ReLU nets under Gaussian inputs, near-linear samples in dimension. |
| 3 (27) | #39437 | [Constant Regret in Finite Games via Higher-Order Optimism](https://openreview.net/forum?id=3LkAAAp6uA) | 4.00 (4, 4, 4) | HOOD: optimistic FTRL with a discounted (N+1)-th order predictor on a lifted strategy space damps oscillations for constant regret. |
| 4 (59) | #57277 | [Optimal Regret Bounds for Linear Bandits with Heavy-Tailed Rewards](https://openreview.net/forum?id=nluFMnpsV7) | 3.67 (4, 4, 3) | New lower bound separating shared versus optimal-action-only evidence; Hybrid FTRL picks direct or linear loss estimates by moment bound. |
| 5 (69) | #22982 | [Consistent Learning-to-Defer with Expert-Conditional Advice](https://openreview.net/forum?id=4URcCTVNZQ) | 3.67 (4, 4, 3) | Jointly selects expert and advice source; reference-conditional classification estimates action errors conditional on a fixed reference expert's correctness. |
| 6 (74) | #27211 | [Classification with Abstention under Class-Conditional Error Constraints: Minimax Rate and Algorithm](https://openreview.net/forum?id=sRFfu07zKr) | 3.67 (4, 3, 4) | Characterizes distribution-free minimax excess-abstention rate under per-class error caps; surrogate losses make it a trainable constrained problem. |
| 7 (81) | #47467 | [Failure Modes in AI Retraining Dynamics](https://openreview.net/forum?id=7xKDZJKich) | 3.67 (4, 4, 3) | Stylized model of greedy retraining with strategic users and hidden intents shows convergence to suboptimal outcomes and model deterioration. |
| 8 (93) | #4821 | [Parameter-Free Last-Iterate Convergence of Optimistic and Discounted Counterfactual Regret Minimization](https://openreview.net/forum?id=2u0MFYC5BB) | 3.67 (3, 4, 4) | Step-size/initialization ratio invariance proves last-iterate convergence of predictive discounted RM+ in perturbed regularized extensive-form games. |
| 9 (97) | #9616 | [Mapping the Solution-Set Structure of Grokking on Latin Squares](https://openreview.net/forum?id=UqYarTBVar) | 3.67 (4, 4, 3) | Models tasks as Latin edge colourings; proves abelian-group tasks have all-generalizing minimum-norm endpoints, random Latin squares rarely do. |
| 10 (111) | #49793 | [Defensive Boosting for Online Probabilistic Forecasting](https://openreview.net/forum?id=vBwRAh5nc2) | 3.67 (4, 3, 4) | Defensive forecasting algorithm obtains both online gradient-boosting Brier guarantees and weak-to-strong boosting guarantees on adaptive sequences. |
| 11 (144) | #16952 | [From Switching to Dynamic Regret: A Simple Reduction via Unbiased Random Sequences](https://openreview.net/forum?id=WDdONsxZOk) | 3.67 (4, 3, 4) | Unbiased low-switch random comparator sequences reduce dynamic regret to switching regret, so any switching-regret algorithm plugs in. |
| 12 (176) | #47304 | [Tight Mistake–Abstention Tradeoffs for Sequential Prediction under Adversarial Injections](https://openreview.net/forum?id=UhhpilrXLJ) | 3.67 (4, 4, 3) | Weighted shattering potential yields algorithms closing mistake versus false-abstention gaps when adversaries inject corrupted instances into i.i.d. streams. |
| 13 (177) | #49618 | [Universal interpolation for deep residual self-attention networks](https://openreview.net/forum?id=u02SERBXpM) | 3.67 (4, 3, 4) | Two frozen Gaussian-initialized single-head attention blocks, composed with task-specific order, signs and durations, interpolate any sequence collection. |
| 14 (220) | #52803 | [On Gradient Descent with Stochastic Rounding on Fixed-Point Grids for Quadratic Objectives](https://openreview.net/forum?id=G7oo8Xl4y4) | 3.67 (4, 4, 3) | Hitting time to grid minimizer depends on Hessian eigenbasis: exponential in dimension for random bases, logarithmic for diagonal Hessians. |
| 15 (232) | #53632 | [A Statistical Theory of Frequency Recovery in Overparameterized Diffusion Models](https://openreview.net/forum?id=lR8Dsgwyf3) | 3.67 (3, 4, 4) | DFT-based analysis bounds score estimation for low-frequency data components, with rates set by an effective dimension of retained frequencies. |

## Themes & trends

- **Regret dynamics and equilibrium computation in games.** Uncoupled no-regret dynamics with constant regret in normal-form games (#39437), last-iterate convergence of predictive and discounted CFR variants (#4821), a hardness result plus a quasi-polynomial algorithm for coarse correlated equilibria in discounted Markov games (#9346), and equilibria with stochastic action sets (#17117). #47467 applies the same game-theoretic framing to AI retraining with strategic users.
- **Abstention, deferral and reliable prediction.** Three of the top 12 are about when a predictor should abstain or defer. They cover minimax rates for abstention under class-conditional error caps (#27211), Bayes-consistent learning-to-defer that also selects which advice to give the expert (#22982), and mistake–abstention tradeoffs under adversarial injections (#47304).
- **Tight bandit regret for structured settings.** Minimax-matching lower bounds and algorithms for heavy-tailed linear bandits (#57277), multiple optimal arms (#55551), linear bandits with memory (#54668), and cascade browsing (#8594). #38245 analyses ReMax, a retry-based bandit objective that the authors relate to pass@k.
- **Exact expressivity and approximation of neural architectures.** Depth-only universal interpolation with two frozen attention blocks (#49618), optimal neuron count and bit complexity (#24979), minimum width in Sobolev norms (#27380), exact two-hidden-layer ReLU representations of max (#31947), graph transformers versus monadic second-order logic (#57895), and barriers for categorical equivariant networks (#22859). Some proofs here are explicit constructions or computer-assisted (#24979, #31947).
- **Implicit bias and feature formation in solvable models.** Grokking is studied through minimum-norm solution sets (#9616) and weight-decay perturbation sweeps (#59559). Other papers cover feature formation in quadratic networks (#58842), normalization coupling Fourier sectors (#51332), multiclass implicit bias of steepest and mirror descent (#13750, #58391), symmetry-induced entropy under Langevin dynamics (#26705), and margin as the separator between SGD and random search (#17282).
- **Formal theory for generative-model and LLM-era questions.** On the diffusion side: frequency-resolved score estimation (#53632), minimax optimality of uniform discrete diffusion (#15419), and the absence of benign overfitting (#44760). On the language side: language generation in the limit with mistake bounds or noise, prompts and feedback (#46679, #10106), whether distillation can be prevented (#55158), length-generalization sample bounds (#26309), and weak-to-strong generalization through random matrix theory (#44218).

## Score signals

The domain mean is 2.346, which is +0.036 above the venue mean of 2.31.

**Fine categories inside `theory`.** All five sit within about ±0.1 of the venue mean:

- Above: `theory.transformer-theory` 2.406 (n = 63), `theory.online` 2.399 (n = 239), `theory.generalization` 2.344 (n = 187), `theory.dynamics` 2.338 (n = 178).
- Below: `theory.other` 2.297 (n = 211), the only one.

**Cross-major tags.** Theory papers that also carry RL or optimization tags score highest:

- `rl.rl-theory`: 2.620 (n = 32). This is the largest above-mean signal with a sizable count.
- `optimization.optimizers`: 2.675 (n = 10).
- `optimization.convex`: 2.573 (n = 8).
- `rl.marl`: 2.683 (n = 5).

**Below the venue mean, small n only:**

- `causal.causal-inference` 2.286 (n = 7)
- `representation.domain` 2.000 (n = 4)
- `probabilistic.uq` 1.833 (n = 4)
- `neuro-cog.brain` 1.889 (n = 3)

**Within the top 60:**

- `theory.online` is the most frequent tag (22 papers, 18 as first tag).
- Then `theory.generalization` (14) and `theory.dynamics` (12).
- `theory.transformer-theory` has the highest category mean but appears on only 7 of the top 60.

Several high means rest on very small counts, for example `probabilistic.sampling` 3.111 (n = 3) and `science.pde` 3.167 (n = 2). Read them as noise, not as signals.

## Taxonomy notes

**Likely misclassified or mis-tagged (top 60):**

- #27461 → `optimization` / `optimization.bo-hpo`. The method is LLM-generated problem formulations for expensive simulation-driven design, evaluated on antenna benchmarks. It is not online learning theory.
- #12810 → `rl` / `rl.rl-theory`. This is a finite-sample analysis of quantile TD learning, but it is tagged only `theory.generalization`.
- #6441 → add `rl.rl-theory`. It covers RL planning hardness and regret with transition lookahead and is currently tagged only `theory.online`.
- #9346 → `rl.marl`. It studies independent RL and CCE computation in Markov games and is tagged `theory.other`.
- #4821 → replace `causal.causal-inference` with `rl.marl`. "Counterfactual regret minimization" is an extensive-form game solver, not causal inference.
- #49793 → replace `time-series.forecasting` with `probabilistic.uq`. The paper is about calibrated and boosted forecasts of binary outcomes against an adversary, not time-series modelling.
- #53632, #44760, #40054 → add `diffusion.theory`. All three are diffusion-model theory but carry only `theory.*` tags.
- #27415 → drop `optimization.optimizers`. "Preconditioned Richardson iteration" is the in-context algorithm being implemented, not an optimizer contribution.
- #24979, #31947, #22859, #53422 → these are tagged `theory.transformer-theory`, but none is about transformers. They are general expressivity results. See proposal 1.
- #25784 → possibly `neuro-cog.cognition`. It is a Cognitive Gridworld POMDP study of compositional generalization. The `theory.online` tag probably comes from the word "regret". Uncertain.

**Proposed new fine categories (major `theory`).** The pack covers only the top 60, so I cannot check rule T3 (≥ 25 papers) from it. Each proposal needs a count on the full corpus.

1. **Approximation & Expressivity of Neural Networks.** Universal approximation, minimum width and depth, exact representability and logic-based expressivity for any architecture. It is split from `theory.transformer-theory`, which would keep only transformer- and ICL-specific theory. Examples: #49618, #24979, #27380, #31947, #57895, #22859.
2. **Learning in Games & Equilibrium Computation.** Regret dynamics, last-iterate convergence and the complexity of equilibria in normal-form, extensive-form and Markov games, where the object is the equilibrium, not an RL agent. It overlaps `rl.marl`, so a boundary rule is needed. Examples: #39437, #4821, #9346, #17117.
3. **Abstention, Deferral & Selective Prediction.** Theory and algorithms for predictors that may abstain, reject or defer to experts, including consistency of surrogates and abstention–error tradeoffs. Examples: #27211, #22982, #47304.

Considered and not proposed:

- Learning-augmented algorithms (#42259, #55156): only 2 examples in the top 60.
- Language generation in the limit (#46679, #10106): only 2 examples in the top 60.
