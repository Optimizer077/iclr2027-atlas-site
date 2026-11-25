# Vision — ICLR 2027 domain brief

## Snapshot

1,561 papers; mean rating 2.387; 587 papers (mean ≥ 2.67). Standard deviations below use the population formula.

| Fine category | Count | Mean rating |
|---|---:|---:|
| vision.detection-seg | 448 | 2.363 |
| vision.three-d-vision | 428 | 2.507 |
| vision.other | 228 | 2.350 |
| vision.medical-imaging | 214 | 2.223 |
| vision.vision-backbones | 183 | 2.313 |
| vision.low-level | 174 | 2.415 |
| vision.remote-sensing | 101 | 2.324 |
| representation.ssl | 30 | 2.428 |
| multimodal.vlm | 21 | 2.508 |
| gen-vision.three-d | 17 | 2.333 |
| probabilistic.uq | 16 | 2.448 |
| llm-agents.agents | 16 | 2.510 |
| graphs.topology | 15 | 2.244 |
| llm-core.ssm | 15 | 2.150 |
| neuro-cog.brain | 13 | 2.231 |
| science.health | 11 | 2.348 |
| representation.semi-weak | 11 | 2.242 |
| representation.domain | 9 | 2.111 |
| llm-efficiency.quantization | 9 | 2.481 |
| optimization.federated | 8 | 2.292 |
| diffusion.flow-matching | 7 | 2.586 |
| llm-core.finetune | 7 | 2.619 |
| embodied.navigation | 6 | 2.056 |
| causal.causal-inference | 5 | 2.200 |
| rl.model-based | 5 | 2.667 |
| evaluation.llm-bench | 5 | 2.533 |
| probabilistic.bayesian | 5 | 2.000 |
| llm-efficiency.kv-cache | 4 | 2.646 |
| rl.exploration | 4 | 2.583 |
| optimization.convex | 4 | 2.479 |
| diffusion.architecture | 4 | 2.667 |
| llm-efficiency.pruning | 4 | 2.417 |
| safety.adversarial | 4 | 2.000 |
| llm-reasoning.self-improve | 4 | 2.375 |
| multimodal.vlm-hallucination | 3 | 3.028 |
| llm-agents.memory | 3 | 2.889 |
| science.weather-climate | 3 | 2.333 |
| llm-reasoning.cot | 3 | 2.667 |
| embodied.manipulation | 3 | 2.889 |
| alignment.sycophancy | 3 | 2.667 |
| alignment.preference | 3 | 2.556 |
| llm-efficiency.distillation | 3 | 2.000 |
| graphs.equivariance | 3 | 2.306 |
| llm-core.data | 3 | 2.028 |
| embodied.driving | 3 | 2.000 |
| time-series.ts-other | 3 | 1.889 |
| multimodal.vlm-reasoning | 3 | 1.889 |
| science.pde | 2 | 2.333 |
| graphs.gnn | 2 | 2.500 |
| theory.dynamics | 2 | 2.500 |
| llm-reasoning.test-time | 2 | 2.833 |
| gen-vision.video | 2 | 3.000 |
| llm-agents.deep-research | 2 | 2.500 |
| gen-vision.editing | 2 | 2.000 |
| interpretability.probing | 2 | 2.667 |
| gen-vision.t2i | 2 | 2.333 |
| time-series.forecasting | 2 | 1.833 |
| interpretability.sae | 2 | 2.167 |
| multimodal.audio-speech | 2 | 1.833 |
| llm-core.moe | 2 | 1.667 |
| llm-core.architecture | 2 | 1.833 |
| gen-vision.gan-vae | 1 | 3.333 |
| science.genomics | 1 | 3.333 |
| evaluation.datasets | 1 | 3.000 |
| embodied.vla | 1 | 3.000 |
| rl.deep-rl | 1 | 3.000 |
| theory.transformer-theory | 1 | 3.000 |
| multimodal.video-understanding | 1 | 2.667 |
| representation.continual | 1 | 2.667 |
| diffusion.alignment | 1 | 2.667 |
| llm-reasoning.rl-reasoning | 1 | 2.667 |
| llm-agents.code | 1 | 2.667 |
| safety.unlearning | 1 | 2.333 |
| safety.privacy | 1 | 2.333 |
| optimization.optimizers | 1 | 2.333 |
| science.molecules | 1 | 2.333 |
| llm-efficiency.speculative | 1 | 2.333 |
| llm-reasoning.verifiers | 1 | 2.000 |
| safety.watermark | 1 | 1.667 |
| diffusion.guidance | 1 | 1.667 |
| theory.online | 1 | 1.667 |
| diffusion.sampling | 1 | 1.667 |
| optimization.bo-hpo | 1 | 1.667 |
| rl.marl | 1 | 1.000 |

## Top 15 papers

| Rank | # | Title | Mean (individual ratings); n; std | One-line idea |
|---:|---:|---|---|---|
| 1 | 4088 | [Carve VFM: Carving Specialists out of Generalists, Automatic Task-Specific Compression of Vision Foundation Models](https://openreview.net/forum?id=mztlVxoA85) | 4.000 (4, 4, 4); n=3; std=0.000 | Searches layer capacities with recovery-aware fitness, then reconstructs pruned behavior through closed-form low-rank corrections. |
| 24 | 35804 | [DMap: Efficient Dense Matching and Bundle Adjustment for Accurate 3D reconstruction](https://openreview.net/forum?id=iikGG5Se3J) | 4.000 (4, 4, 4); n=3; std=0.000 | Combines frozen-feature dense matching with pixel-grid bundle adjustment and parallel depth marginalization. |
| 88 | 13685 | [Confidence Falls Short: Asymmetric Certainty Gains from Optimization Hinder Multimodal Classification](https://openreview.net/forum?id=8k3HVSKemN) | 3.667 (4, 3, 4); n=3; std=0.471 | Suppresses top-confidence in strong modalities and excites it in weak modalities using sparsity measurements. |
| 122 | 22518 | [Structure as State, Not Skip: Bridging Semantic Representation and Structural Detail for 3D Medical Image Segmentation](https://openreview.net/forum?id=U1IsCTzxjN) | 3.667 (3, 4, 4); n=3; std=0.471 | Maintains persistent multiscale states inside a shared ViT instead of encoder-decoder skip connections. |
| 138 | 9332 | [S4VY: Segment Anything in Feed-Forward 4D Visual Geometry](https://openreview.net/forum?id=t62keNF6Zx) | 3.667 (4, 3, 4); n=3; std=0.471 | Decodes persistent 4D object queries into masks and grounds language through active tree search. |
| 148 | 20895 | [PACT: End-to-End Learning of Human Pose, Contacts, and Forces from Video](https://openreview.net/forum?id=6zIhJuWxmV) | 3.667 (4, 4, 3); n=3; std=0.471 | Adds contact-force tokens and physics-based pseudo-labels to joint temporal human reconstruction. |
| 167 | 39273 | [Exploiting the Law of Prägnanz in Diffusion Models to Prevent Unauthorized 3D Structure Reconstruction](https://openreview.net/forum?id=MC0c6Vsq91) | 3.667 (4, 3, 4); n=3; std=0.471 | Injects low-amplitude simple decoy structures that redirect diffusion-based 3D reconstruction. |
| 187 | 7882 | [Rethinking Multi-View Clustering as Symmetric Incremental Reasoning](https://openreview.net/forum?id=5PWu6Ds1fO) | 3.667 (4, 3, 4); n=3; std=0.471 | Uses anchor-excluded symmetric interactions and feature-wise updates for incremental cross-view reasoning. |
| 228 | 38554 | [Allocation-Dependent Distortion for Fair Clustering Ensembles](https://openreview.net/forum?id=V84yBc0EgP) | 3.667 (3, 4, 4); n=3; std=0.471 | Weights group-cluster distortion by protected-group allocation within a finite-descent consensus objective. |
| 270 | 8050 | [Linearizing Vision-Language ViTs Beyond the Training Resolution](https://openreview.net/forum?id=A6ElQ5Rm6E) | 3.500 (3, 4, 4, 3); n=4; std=0.500 | Distills ViTs into hybrid recurrent encoders with RL-selected attention layers for cross-resolution recovery. |
| 282 | 4207 | [Hilbert Operator for Progressive Encoding (HOPE): A Mathematical Framework for Deconstructing Learned Representations in Deep Networks](https://openreview.net/forum?id=eaiwREISSU) | 3.500 (3, 4); n=2; std=0.500 | Models neurons as rank-one Hilbert–Schmidt operators, unifying pruning, merging, and block eviction. |
| 285 | 573 | [Prototype-Routed Flow Matching for Incomplete Multi-View Clustering](https://openreview.net/forum?id=z7tlMaVseU) | 3.400 (3, 4, 3, 3, 4); n=5; std=0.490 | Routes conditional latent transport with online prototypes and sample-specific residual velocities. |
| 298 | 19452 | [RAP: Radial-Angular Random Projection for Hyperbolic Representations](https://openreview.net/forum?id=ijKTLDpoKI) | 3.333 (4, 4, 2); n=3; std=0.943 | Preserves hyperbolic radial coordinates exactly while randomly projecting only angular directions. |
| 309 | 8254 | [When Motion Misleads: Causal-Role-Aware Motion-Turbulence Disentanglement for Turbulent Infrared Video Super-Resolution](https://openreview.net/forum?id=VP9mj6YGw9) | 3.333 (3, 4, 3); n=3; std=0.471 | Uses phase coherence to separate real motion from turbulence and regulate one-step diffusion conditioning. |
| 328 | 30786 | [Towards Active Cross-View Object Geo-Localization](https://openreview.net/forum?id=AMxZBBqCXB) | 3.333 (3, 3, 4); n=3; std=0.471 | Trains viewpoint selection and stopping through prompt adaptation, trajectory supervision, and cost-aware GRPO. |

## Themes & trends

- Compression joins selection with recovery. #4088 reconstructs removed behavior while allocating layer capacity; #4207 gives pruning and neuron merging a shared operator formulation.
- Dense geometry returns to optimization: #35804 differentiates dense warps through bundle adjustment, while #9332 attaches segmentation queries to feed-forward 4D geometry.
- Multi-view clustering is a sizable cluster among higher-scoring papers. #7882 uses incremental cross-view reasoning, #573 routes flow matching through prototypes, and #25193 transports semantic latents across views.
- Physical structure supplies training signals in #20895, which jointly predicts forces and pose, and #8254, which separates coherent motion from refractive turbulence.
- Vision models increasingly choose their observations or search paths. #30786 learns viewpoint acquisition and stopping, while #9332 uses tree search to locate frames for language grounding.

## Score signals

Six native categories exceed the venue-wide mean of 2.31: three-d-vision at 2.507 (428), low-level at 2.415 (174), detection-seg at 2.363 (448), other at 2.350 (228), remote-sensing at 2.324 (101), and vision-backbones at 2.313 (183). Medical-imaging is the only native category below that line, at 2.223 across 214 papers.

Among cross tags with at least seven papers, llm-core.finetune scores 2.619 (7), diffusion.flow-matching 2.586 (7), llm-agents.agents 2.510 (16), multimodal.vlm 2.508 (21), llm-efficiency.quantization 2.481 (9), probabilistic.uq 2.448 (16), and representation.ssl 2.428 (30). Lower-scoring groups include graphs.topology at 2.244 (15), llm-core.ssm at 2.150 (15), neuro-cog.brain at 2.231 (13), representation.semi-weak at 2.242 (11), representation.domain at 2.111 (9), and embodied.navigation at 2.056 (6).

## Taxonomy notes

- #13685 → multimodal/other: the abstract studies confidence imbalance in multimodal classification, not a specifically visual mechanism.
- #38554 → safety/fairness: protected-group allocation in clustering ensembles is the central problem; no vision-specific assumption appears in the abstract.
- #30786 → vision/remote-sensing: cross-view geo-localization and UAV query views fit this tag better than vision.other.
- #9907 → vision/low-level: event-aware visible-infrared video fusion is an image-fusion method rather than vision.other.
- #6255 → llm-agents/computer-use: GUI grounding is recast as object detection, but the research object is computer interaction.
- No new fine category proposed; the input pack does not demonstrate the required 25-paper support for a candidate.
