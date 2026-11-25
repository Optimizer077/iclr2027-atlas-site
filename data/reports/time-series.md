# Time Series — ICLR 2027 domain brief

## Snapshot

987 papers; mean rating 2.241; 265 papers (mean ≥ 2.67). Standard deviations below use the population formula.

| Fine category | Count | Mean rating |
|---|---:|---:|
| time-series.forecasting | 616 | 2.239 |
| time-series.ts-other | 200 | 2.246 |
| time-series.ts-foundation | 131 | 2.297 |
| time-series.dynamics | 126 | 2.230 |
| time-series.other | 86 | 2.210 |
| diffusion.flow-matching | 14 | 2.345 |
| llm-agents.memory | 13 | 2.038 |
| applications.finance-edu | 10 | 2.208 |
| science.weather-climate | 10 | 2.300 |
| probabilistic.uq | 9 | 2.389 |
| evaluation.llm-bench | 8 | 2.042 |
| representation.ssl | 8 | 2.250 |
| representation.domain | 8 | 2.260 |
| rl.model-based | 6 | 2.222 |
| llm-core.data | 6 | 2.278 |
| probabilistic.bayesian | 6 | 2.389 |
| causal.causal-inference | 6 | 2.042 |
| science.pde | 6 | 2.000 |
| multimodal.vlm | 5 | 2.350 |
| llm-agents.deep-research | 5 | 2.600 |
| llm-core.icl | 5 | 2.067 |
| llm-core.ssm | 5 | 2.133 |
| llm-core.finetune | 5 | 2.067 |
| graphs.gnn | 5 | 2.133 |
| graphs.topology | 5 | 1.800 |
| applications.tabular | 4 | 2.333 |
| llm-reasoning.test-time | 4 | 2.333 |
| interpretability.xai | 4 | 2.383 |
| llm-core.moe | 4 | 1.917 |
| diffusion.architecture | 3 | 2.444 |
| llm-agents.agents | 3 | 1.972 |
| interpretability.sae | 2 | 2.500 |
| diffusion.discrete | 2 | 3.167 |
| llm-efficiency.pruning | 2 | 2.500 |
| llm-efficiency.quantization | 2 | 2.500 |
| neuro-cog.brain | 2 | 2.667 |
| diffusion.inverse | 2 | 2.500 |
| llm-reasoning.self-improve | 2 | 2.333 |
| optimization.federated | 2 | 2.167 |
| graphs.graph-llm | 2 | 1.792 |
| llm-core.long-context | 2 | 1.833 |
| safety.adversarial | 2 | 2.000 |
| gen-vision.gan-vae | 2 | 1.500 |
| science.scientific-discovery | 1 | 3.333 |
| evaluation.eval-methods | 1 | 3.333 |
| embodied.world-models | 1 | 3.000 |
| evaluation.datasets | 1 | 2.667 |
| vision.vision-backbones | 1 | 2.667 |
| llm-reasoning.verifiers | 1 | 2.667 |
| diffusion.sampling | 1 | 2.667 |
| theory.transformer-theory | 1 | 2.667 |
| representation.continual | 1 | 2.667 |
| llm-agents.multi-agent | 1 | 2.667 |
| theory.online | 1 | 2.333 |
| interpretability.probing | 1 | 2.333 |
| optimization.optimizers | 1 | 2.333 |
| vision.remote-sensing | 1 | 2.250 |
| graphs.equivariance | 1 | 2.000 |
| diffusion.distillation | 1 | 2.000 |
| llm-core.scaling | 1 | 2.000 |
| interpretability.mech-interp | 1 | 2.000 |
| diffusion.guidance | 1 | 2.000 |
| llm-reasoning.cot | 1 | 2.000 |
| applications.nlp | 1 | 1.667 |
| rl.exploration | 1 | 1.667 |
| llm-efficiency.distillation | 1 | 1.667 |
| interpretability.steering | 1 | 1.333 |
| optimization.bo-hpo | 1 | 1.000 |

## Top 15 papers

| Rank | # | Title | Mean (individual ratings); n; std | One-line idea |
|---:|---:|---|---|---|
| 51 | 17101 | [MUSE: Dependency-Aware Adaptation of a Frozen Vision Backbone for Multivariate Time Series Forecasting](https://openreview.net/forum?id=TwkBJRhg4H) | 3.667 (3, 4, 4); n=3; std=0.471 | Refines frozen visual features for cross-variable and periodic dependencies, then gates two forecast paths. |
| 53 | 35480 | [Drift Is Not Enough: A Diffusive Floor for Gradient Propagation in Recurrent Networks](https://openreview.net/forum?id=X4lPQWX5Ds) | 3.667 (4, 4, 3); n=3; std=0.471 | Models gradient propagation as a linear cocycle and penalizes both Lyapunov drift and diffusive variance. |
| 57 | 47066 | [Generative Forecasting from Coarse Observations: Does Cascading Help?](https://openreview.net/forum?id=wqlsVnnqok) | 3.667 (4, 3, 4); n=3; std=0.471 | Builds conditional fine-scale ensembles to measure distributional error and determine when forecast cascades help. |
| 125 | 37261 | [Rethinking Autoregressive Time Series Pretraining with Next-$x$-Token Prediction](https://openreview.net/forum?id=FnLrtORsmo) | 3.667 (4, 4, 3); n=3; std=0.471 | Samples each token's prediction horizon to reduce rollouts and avoid fixed-horizon pretraining bias. |
| 157 | 32203 | [SPECTOR: Spectral Tree Operator Realization for Time-Series Priors](https://openreview.net/forum?id=0C0MWB7O7c) | 3.667 (3, 4, 4); n=3; std=0.471 | Compiles sum-product kernel programs into covariance-free realization trees with linear-time sampling. |
| 159 | 32414 | [Learning to Forecast on Convolution-Induced Geometry](https://openreview.net/forum?id=OjlyZlkFbs) | 3.667 (4, 4, 3); n=3; std=0.471 | Learns causal-convolution delay coordinates with Koopman regularization for direct multi-horizon prediction. |
| 188 | 10978 | [PopGLAD: Structural Population Scoring for Graph-Level Anomaly Detection](https://openreview.net/forum?id=JETp0kGOkq) | 3.667 (4, 3, 4); n=3; std=0.471 | Scores directional agreement with population departures across calibrated structural and graph-size views. |
| 239 | 34696 | [Language Pretraining Shapes a Generalizable Manifold: Insights into Cross-Modal Transfer to Time Series](https://openreview.net/forum?id=4C7KaZ5JSA) | 3.667 (4, 3, 4); n=3; std=0.471 | Shows frozen language states support trajectory probes and retrieval, with low-rank fine-tuning aligning existing directions. |
| 250 | 57916 | [Stability-Aware Parametric Neural ODEs for Bifurcating Dynamical Systems](https://openreview.net/forum?id=LMZAwc5IU2) | 3.667 (4, 3, 4); n=3; std=0.471 | Freezes an identified matrix-polynomial operator before amplitude-gated nonlinear residual training preserves its Jacobian. |
| 277 | 5824 | [Perceive, Route, Modulate: Dynamic Pattern Recalibration for Time Series Forecasting](https://openreview.net/forum?id=2TDpev8lZE) | 3.500 (3, 4, 4, 3); n=4; std=0.500 | Soft-routes tokens over a response basis and recalibrates hidden states through residual Hadamard products. |
| 323 | 26294 | [M$^2$TSF: LLM-empowered time series forecasting via multi-stream multi-scale modeling](https://openreview.net/forum?id=u1NpThCBEX) | 3.333 (4, 3, 3); n=3; std=0.471 | Separates temporal scales into streams with layer-constrained interaction and hyperedge-MoE fusion. |
| 385 | 25485 | [SPAR: SPARSE PHASE-AWARE ADAPTATION OF REPRESENTATIONS FOR TIME SERIES FORECASTING WITH EXOGENOUS VARIABLES](https://openreview.net/forum?id=LYU80Xj5R4) | 3.333 (3, 4, 3); n=3; std=0.471 | Learns phase-aware sparse-feature corrections that preserve useful exogenous effects and suppress harmful ones. |
| 399 | 44134 | [NEIN-TSF: Not Every Irregularity Is Noise in Time-Series Forecasting](https://openreview.net/forum?id=ZOHaSrepMQ) | 3.333 (4, 3, 3); n=3; std=0.471 | Ranks counterfactual forecast damage and applies historically supported, horizon-adaptive residual corrections. |
| 452 | 28392 | [The Readout-Gauge Conflict: Anchored Equation Discovery with Learned Koopman Closure](https://openreview.net/forum?id=psVjV601HB) | 3.333 (3, 4, 3); n=3; std=0.471 | Fixes the equation library before fitting auxiliary closure coordinates and reads coefficients from the fitted generator. |
| 473 | 47514 | [Test-Time Forecasting: Recurrent Depth Enables In-Context Dynamics Prediction](https://openreview.net/forum?id=y9TdCNCSPF) | 3.333 (4, 3, 3); n=3; std=0.471 | Links looped attention to dynamic-mode decomposition and implements recurrent depth as gradient-descent iterations. |

## Themes & trends

- Koopman representations connect prediction with analysis: #32414 learns delay coordinates, #28392 anchors equation readout while adapting closure, and #47514 relates recurrent attention to dynamic-mode decomposition.
- Pretraining changes both objectives and data generators. #37261 samples prediction horizons per token, while #32203 compiles compositional kernels into fast synthetic realizations.
- Forecasters regulate history according to its consequences. #5824 modulates token gains through routed response bases, #25485 corrects exogenous sparse features, and #44134 ranks counterfactual forecast damage.
- Cross-modal transfer depends on reusable structure rather than a generic encoder swap: #17101 preserves variable-specific visual spaces, and #34696 finds temporal directions already present in language-pretrained states.
- Stability analysis includes fluctuations and bifurcations. #35480 penalizes gradient diffusion after drift removal, while #57916 freezes the equilibrium operator before learning nonlinear trajectories.

## Score signals

All five native categories fall below the venue-wide mean of 2.31. Ts-foundation is closest at 2.297 (131), followed by ts-other at 2.246 (200), forecasting at 2.239 (616), dynamics at 2.230 (126), and other at 2.210 (86).

Above-mean cross tags with at least five papers are probabilistic.uq at 2.389 (9), probabilistic.bayesian at 2.389 (6), multimodal.vlm at 2.350 (5), diffusion.flow-matching at 2.345 (14), and llm-agents.deep-research at 2.600 (5). Science.weather-climate is just below the threshold at 2.300 (10). Larger below-mean groups include llm-agents.memory at 2.038 (13), applications.finance-edu at 2.208 (10), evaluation.llm-bench at 2.042 (8), representation.ssl at 2.250 (8), and representation.domain at 2.260 (8).

## Taxonomy notes

- #10978, #17244, #32104, #24846, #30902, #52385, and #19865 → graphs/gnn: their primary task is graph-level or generalist graph anomaly detection, not time-series analysis.
- #46396 → embodied/world-models or vision/three-d-vision: point-trajectory forecasting targets learning a 4D world.
- #19232 → vision/detection-seg: patch appearance and regional composition indicate visual structural and logical anomaly detection.
- #1061 → time-series/dynamics: differentiable Gaussian representations model collective dynamics, making time-series.other too broad.
- #531 → llm-agents/agents as secondary: reinforcement learning for LLM event-forecasting agents has an explicit agent component missing from its tags.
- No new fine category proposed; this pack cannot establish the required 25-paper support.
