# Graphs — ICLR 2027 domain brief

## Snapshot

986 papers; mean rating 2.256; 289 papers (mean ≥ 2.67). Standard deviations below use the population formula.

| Fine category | Count | Mean rating |
|---|---:|---:|
| graphs.gnn | 472 | 2.241 |
| graphs.topology | 315 | 2.278 |
| graphs.equivariance | 180 | 2.338 |
| graphs.graph-llm | 178 | 2.235 |
| graphs.other | 59 | 2.159 |
| representation.ssl | 19 | 2.502 |
| optimization.federated | 12 | 2.542 |
| theory.transformer-theory | 11 | 2.394 |
| neuro-cog.brain | 11 | 2.189 |
| llm-agents.agents | 9 | 2.296 |
| science.pde | 8 | 2.365 |
| science.molecules | 7 | 1.857 |
| representation.domain | 6 | 2.833 |
| evaluation.llm-bench | 6 | 2.183 |
| llm-agents.multi-agent | 6 | 2.444 |
| time-series.forecasting | 6 | 1.944 |
| rl.exploration | 4 | 2.417 |
| causal.causal-inference | 4 | 2.083 |
| probabilistic.uq | 4 | 2.250 |
| vision.vision-backbones | 4 | 2.167 |
| probabilistic.bayesian | 4 | 1.750 |
| theory.generalization | 3 | 2.417 |
| time-series.ts-other | 3 | 3.000 |
| vision.three-d-vision | 3 | 2.250 |
| science.health | 3 | 1.889 |
| interpretability.xai | 3 | 2.111 |
| llm-agents.deep-research | 3 | 2.111 |
| llm-efficiency.pruning | 3 | 2.222 |
| theory.dynamics | 3 | 2.306 |
| embodied.manipulation | 3 | 2.111 |
| theory.online | 2 | 2.458 |
| science.protein | 2 | 2.667 |
| safety.fairness | 2 | 2.000 |
| science.scientific-discovery | 2 | 2.083 |
| safety.watermark | 2 | 2.333 |
| applications.tabular | 2 | 2.500 |
| rl.model-based | 2 | 2.000 |
| llm-core.ssm | 2 | 2.167 |
| diffusion.flow-matching | 2 | 2.333 |
| vision.detection-seg | 2 | 2.167 |
| interpretability.probing | 2 | 1.833 |
| safety.privacy | 2 | 2.000 |
| llm-reasoning.test-time | 2 | 1.667 |
| llm-efficiency.quantization | 2 | 1.500 |
| llm-core.finetune | 2 | 1.833 |
| safety.unlearning | 2 | 1.833 |
| embodied.navigation | 2 | 1.333 |
| time-series.dynamics | 1 | 3.000 |
| science.materials | 1 | 3.000 |
| science.weather-climate | 1 | 3.000 |
| gen-vision.gan-vae | 1 | 2.667 |
| diffusion.discrete | 1 | 2.667 |
| llm-agents.code | 1 | 2.667 |
| llm-core.architecture | 1 | 2.667 |
| llm-reasoning.math | 1 | 2.667 |
| llm-efficiency.systems | 1 | 2.667 |
| gen-vision.three-d | 1 | 2.667 |
| gen-vision.t2i | 1 | 2.333 |
| diffusion.architecture | 1 | 2.333 |
| causal.formal | 1 | 2.333 |
| evaluation.datasets | 1 | 2.333 |
| rl.deep-rl | 1 | 2.000 |
| llm-reasoning.cot | 1 | 2.000 |
| multimodal.audio-speech | 1 | 2.000 |
| llm-core.icl | 1 | 2.000 |
| representation.continual | 1 | 2.000 |
| interpretability.steering | 1 | 2.000 |
| llm-core.moe | 1 | 2.000 |
| alignment.preference | 1 | 2.000 |
| interpretability.mech-interp | 1 | 2.000 |
| applications.finance-edu | 1 | 1.667 |
| applications.nlp | 1 | 1.667 |
| diffusion.inverse | 1 | 1.667 |
| llm-reasoning.self-improve | 1 | 1.667 |
| representation.semi-weak | 1 | 1.667 |
| safety.adversarial | 1 | 1.333 |

## Top 15 papers

| Rank | # | Title | Mean (individual ratings); n; std | One-line idea |
|---:|---:|---|---|---|
| 33 | 49327 | [Inherent Trade-offs when Enforcing Correct Data Symmetries in Multi-head Self-attention](https://openreview.net/forum?id=rGUbthevD0) | 4.000 (4, 4, 4); n=3; std=0.000 | Characterizes equivariant attention through head-cluster permutations and disconnected parameter components. |
| 48 | 50584 | [Why Don’t You Take a Walk? Ranking and Risk With Walk Averaging](https://openreview.net/forum?id=MTm9SOGSyM) | 3.667 (4, 4, 3); n=3; std=0.471 | Shows walk training shrinks represented structure, with ranking and probability errors responding differently. |
| 72 | 25808 | [Graph Representations in J-Space](https://openreview.net/forum?id=OIKmF1KLHC) | 3.667 (3, 4, 4); n=3; std=0.471 | Edits workspace nodes and relations across token positions and layers to test connected-graph availability. |
| 226 | 27378 | [CURVSPREAD: CRITICAL CONFINEMENT FOR HYPERBOLIC GRAPH SELF-SUPERVISION](https://openreview.net/forum?id=ZD2jXlzQ4b) | 3.667 (3, 4, 4); n=3; std=0.471 | Calibrates hyperbolic dispersion by the ratio between radial confinement and volume growth. |
| 288 | 15761 | [ADHERE: Adaptive Denoising for Robust Hypergraph Clustering](https://openreview.net/forum?id=ZTjpA2iuXH) | 3.400 (3, 4, 3, 4, 3); n=5; std=0.490 | Denoises features and incidences into contrastive views while pruning unstable gradient signals. |
| 331 | 33401 | [Multi-Task Evolution for Zero-Shot Cross-Problem Generalization using LLMs](https://openreview.net/forum?id=LaiNhIg1kA) | 3.333 (3, 4, 3); n=3; std=0.471 | Evolves task-conditioned heuristic populations using transfer gaps and complementary source-task coverage. |
| 345 | 60553 | [CSRI-FGL: Cross-Client Semantic Relation Inference for Federated Graph Learning](https://openreview.net/forum?id=YvYQiTHtb0) | 3.333 (3, 4, 3); n=3; std=0.471 | Distills client-side language signals into federated edge generators with separate local and global GNN branches. |
| 415 | 53891 | [Gauge-Equivariant Aggregation for Spherical Attention](https://openreview.net/forum?id=vxhfeLxrou) | 3.333 (3, 4, 3); n=3; std=0.471 | Uses spherical quadrature and Levi-Civita transport for gauge-equivariant attention over geometric fields. |
| 435 | 10897 | [Faster Generalized Message Passing with Skew-Aware Parallelism and Work Partitioning](https://openreview.net/forum?id=2kmexwyXHg) | 3.333 (4, 3, 3); n=3; std=0.471 | Buckets nodes by degree, slices heavy neighborhoods, and overlaps asynchronous loads with computation. |
| 484 | 58412 | [HINTS: GENERATING MIP WARM STARTS VIA AN EVOLVING EXPERIENCE LIBRARY](https://openreview.net/forum?id=Um774RFHJU) | 3.333 (3, 3, 4); n=3; std=0.471 | Generates solver-injected construction heuristics and scores reusable experiences by branch-and-bound progress. |
| 553 | 29930 | [Prototype-guided Topology Augmentation for Edge-Imbalanced Graph Domain Adaptation](https://openreview.net/forum?id=DoDHcrPAHg) | 3.333 (4, 3, 3); n=3; std=0.471 | Allocates prototype-guided edge additions by within-domain deficits and cross-domain distribution discrepancies. |
| 566 | 37448 | [GrowBrep: Growing Closed B-Rep Shells One Face at a Time under Grammar Constraints](https://openreview.net/forum?id=ua10RlW7vr) | 3.333 (3, 3, 4); n=3; std=0.471 | Grows shells along open-edge frontiers with grammar masks that enforce closure and orientation. |
| 637 | 16666 | [When to Compress: Efficient LLM Reasoning on Graphs with One Billion Edges](https://openreview.net/forum?id=Ycx6kBNzAy) | 3.333 (4, 3, 3); n=3; std=0.471 | Learns answer-preserving certificate compression and gates it by execution savings versus construction cost. |
| 645 | 20616 | [Constant-Depth Rational-Weight GNNs and their Connection to Schanuel's Conjecture](https://openreview.net/forum?id=NudM6zc90a) | 3.333 (4, 3, 3); n=3; std=0.471 | Constructs uniform rational-weight sigmoid GNNs whose 1-WL expressivity depends on Schanuel's conjecture. |
| 680 | 35333 | [Benchmarking Geographical Temporal Knowledge Graph Reasoning](https://openreview.net/forum?id=mgQ5gW3E0W) | 3.333 (4, 3, 3); n=3; std=0.471 | Symbolically generates questions whose gold answers change when structural, temporal, or geographic constraints drop. |

## Themes & trends

- Exact symmetry carries architectural costs. #49327 proves that one equivariant attention parameterization cannot cover all components, while #53891 builds gauge-equivariant aggregation around transported geometric fields.
- Graph embeddings receive fine-grained theoretical treatment: #50584 separates ranking from probability error under walk averaging, and #20616 ties constant-depth rational-weight expressivity to Schanuel's conjecture.
- Scaling depends on work allocation and answer preservation. #10897 partitions GPU work around heavy-degree nodes; #16666 compresses to executable certificate graphs only when downstream savings justify it.
- LLMs search over algorithms rather than graph tokens in #33401, which evolves transferable heuristic populations, and #58412, which learns warm-start constructions from solver progress.
- Topology acts as a constraint and an intervention: #37448 enforces closed B-rep shells through decoding grammar, #29930 repairs edge imbalance, and #15761 denoises hypergraph incidences.
- Graph-language analysis now examines internal state as well as outputs, with #25808 tracing relational workspace information and #26601 studying graph-token sinks.

## Score signals

Equivariance is the only native category above the venue-wide mean of 2.31, at 2.338 across 180 papers. Topology scores 2.278 (315), gnn 2.241 (472), graph-llm 2.235 (178), and other 2.159 (59).

Higher-scoring cross tags with at least six papers are representation.domain at 2.833 (6), optimization.federated at 2.542 (12), representation.ssl at 2.502 (19), llm-agents.multi-agent at 2.444 (6), theory.transformer-theory at 2.394 (11), and science.pde at 2.365 (8). Below-mean groups include llm-agents.agents at 2.296 (9), neuro-cog.brain at 2.189 (11), evaluation.llm-bench at 2.183 (6), science.molecules at 1.857 (7), and time-series.forecasting at 1.944 (6).

## Taxonomy notes

- #25808 → interpretability/mech-interp: the paper edits and inspects language-model workspace states rather than proposing a GNN.
- #33401 and #58412 → optimization/combinatorial: both automate combinatorial-optimization heuristics, with no central graph-learning method.
- #37448 → gen-vision/three-d: autoregressive CAD boundary-representation generation is the research object.
- #49404 → safety/watermark or evaluation/eval-methods: zero-shot generated-text detection does not concern equivariant graph learning.
- #2724, #12284, and #3420 → vision/three-d-vision: mesh repair, motion capture, and skeleton-motion modeling are visual geometry tasks.
- #31375 → safety/watermark: certified steganographic recovery belongs with information hiding rather than graph-language modeling.
- No new fine category proposed; the pack cannot demonstrate the required 25-paper support for another tag.
