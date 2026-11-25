# Visual Generation (Image, Video, 3D) — ICLR 2027 domain brief

## Snapshot

1,476 papers; mean rating **2.512** on the 1–4 scale. Venue-wide mean of paper means: **2.31**.

Source: [supplied gen-vision pack](../inputs/gen-vision.json). Snapshot statistics cover the full major; paper-level discussion uses its top 60. Fine tags overlap, including tags from other majors, so counts must not be summed. All fine categories in the pack appear below, sorted by descending count. Aggregate review counts and standard deviations are not supplied.

| Fine category | Count | Mean rating | Versus venue mean (2.31) |
| --- | ---: | ---: | --- |
| `gen-vision.video` | 400 | 2.572 | Above |
| `gen-vision.three-d` | 304 | 2.542 | Above |
| `gen-vision.other` | 301 | 2.444 | Above |
| `gen-vision.t2i` | 289 | 2.490 | Above |
| `gen-vision.editing` | 139 | 2.623 | Above |
| `gen-vision.ar-visual` | 104 | 2.580 | Above |
| `gen-vision.gan-vae` | 72 | 2.292 | Below |
| `multimodal.audio-speech` | 17 | 2.505 | Above |
| `llm-agents.agents` | 16 | 2.562 | Above |
| `llm-agents.memory` | 16 | 2.625 | Above |
| `vision.three-d-vision` | 16 | 2.521 | Above |
| `llm-efficiency.kv-cache` | 13 | 2.564 | Above |
| `multimodal.video-understanding` | 13 | 2.641 | Above |
| `llm-core.data` | 12 | 2.500 | Above |
| `diffusion.architecture` | 11 | 2.662 | Above |
| `diffusion.sampling` | 9 | 2.704 | Above |
| `evaluation.llm-bench` | 9 | 2.704 | Above |
| `rl.model-based` | 9 | 2.657 | Above |
| `diffusion.flow-matching` | 8 | 2.583 | Above |
| `llm-efficiency.quantization` | 8 | 2.500 | Above |
| `embodied.world-models` | 7 | 2.619 | Above |
| `llm-core.finetune` | 7 | 2.095 | Below |
| `llm-efficiency.pruning` | 7 | 2.333 | Above |
| `multimodal.vlm` | 7 | 2.452 | Above |
| `llm-reasoning.verifiers` | 6 | 2.611 | Above |
| `alignment.reward-modeling` | 5 | 2.413 | Above |
| `llm-core.architecture` | 5 | 2.533 | Above |
| `alignment.preference` | 4 | 2.500 | Above |
| `interpretability.steering` | 4 | 2.417 | Above |
| `llm-reasoning.rl-reasoning` | 4 | 2.250 | Below |
| `llm-reasoning.self-improve` | 4 | 2.417 | Above |
| `llm-reasoning.test-time` | 4 | 2.583 | Above |
| `representation.ssl` | 4 | 2.667 | Above |
| `safety.jailbreak` | 4 | 2.750 | Above |
| `vision.detection-seg` | 4 | 2.833 | Above |
| `vision.medical-imaging` | 4 | 2.417 | Above |
| `diffusion.guidance` | 3 | 2.000 | Below |
| `graphs.topology` | 3 | 2.667 | Above |
| `llm-efficiency.speculative` | 3 | 3.111 | Above |
| `probabilistic.bayesian` | 3 | 2.444 | Above |
| `time-series.ts-other` | 3 | 2.444 | Above |
| `vision.low-level` | 3 | 1.778 | Below |
| `causal.causal-inference` | 2 | 1.500 | Below |
| `diffusion.distillation` | 2 | 2.833 | Above |
| `embodied.navigation` | 2 | 2.333 | Above |
| `evaluation.datasets` | 2 | 2.333 | Above |
| `interpretability.probing` | 2 | 3.000 | Above |
| `llm-reasoning.cot` | 2 | 3.000 | Above |
| `probabilistic.uq` | 2 | 1.833 | Below |
| `representation.domain` | 2 | 2.000 | Below |
| `vision.remote-sensing` | 2 | 3.000 | Above |
| `alignment.sycophancy` | 1 | 2.333 | Above |
| `applications.recsys` | 1 | 2.000 | Below |
| `applications.tabular` | 1 | 3.000 | Above |
| `embodied.driving` | 1 | 3.000 | Above |
| `embodied.manipulation` | 1 | 2.333 | Above |
| `graphs.graph-llm` | 1 | 2.667 | Above |
| `interpretability.xai` | 1 | 2.667 | Above |
| `llm-core.long-context` | 1 | 3.333 | Above |
| `llm-core.moe` | 1 | 1.667 | Below |
| `llm-core.multilingual` | 1 | 2.333 | Above |
| `llm-core.ssm` | 1 | 3.000 | Above |
| `llm-efficiency.distillation` | 1 | 2.333 | Above |
| `optimization.convex` | 1 | 1.667 | Below |
| `optimization.federated` | 1 | 2.333 | Above |
| `rl.exploration` | 1 | 2.000 | Below |
| `safety.adversarial` | 1 | 2.667 | Above |
| `safety.fairness` | 1 | 2.000 | Below |
| `safety.unlearning` | 1 | 2.333 | Above |
| `safety.watermark` | 1 | 1.667 | Below |
| `science.pde` | 1 | 2.667 | Above |
| `science.weather-climate` | 1 | 2.200 | Below |
| `time-series.dynamics` | 1 | 2.667 | Above |
| `vision.vision-backbones` | 1 | 2.667 | Above |

## Top 15 papers

Rank is within this major, preserving the input order, including ties. The pack omits reviewer confidence, so confidence-weighted tie-breaks cannot be independently checked. n counts the listed ratings; std is their population standard deviation, calculated from those ratings.

| Rank | #number | Title | Mean (individual ratings); n; std | One-line idea |
| ---: | --- | --- | --- | --- |
| 1 | #27788 | [Parallel Decoding Distillation for Fast Image and Video Generation](https://openreview.net/forum?id=mkncGn42Ir) | 4.000 (4, 4, 4); n=3; std=0.000 | Predict multiple denoising steps per network evaluation through trajectory-based distillation of diffusion and flow models. |
| 2 | #37847 | [Understanding Scattered Forest Search: A Version-Space Perspective on Multi-Turn Program Correction](https://openreview.net/forum?id=4VMmxO5eLl) | 3.667 (4, 3, 4); n=3; std=0.471 | Analyze program correction as version-space refinement and compare depth-wise refinement with iterative repair-instruction updates. |
| 3 | #6759 | [Light Field Primitive for Novel View Synthesis](https://openreview.net/forum?id=86vBQaO1Gs) | 3.667 (4, 3, 4); n=3; std=0.471 | Represent groups of rays as differentiable primitives in four-dimensional light-field space and composite their responses. |
| 4 | #1629 | [MoE4D: Mixture of Spatio-Temporal Experts with Frequency-Modulated Router for LiDAR Novel View Synthesis](https://openreview.net/forum?id=w5TxyzfYog) | 3.667 (4, 3, 4); n=3; std=0.471 | Route four-dimensional signals among spatial-temporal experts using frequency information, then distill dense experts into sparse ones. |
| 5 | #52562 | [RefTree: Scaling Reference-to-Image Generation via Hierarchical Image Decomposition](https://openreview.net/forum?id=kmfNwHyohD) | 3.667 (3, 4, 4); n=3; std=0.471 | Decompose images into concept trees to extract references, verify consistency, and merge reference-grounded prompts. |
| 6 | #10346 | [Frequency-Aligned Latent Adaptation for Text-to-Infrared Image Generation](https://openreview.net/forum?id=44QRuQVbGW) | 3.667 (3, 4, 4); n=3; std=0.471 | Adapt infrared latent encodings through frequency alignment and mean-only posterior refinement before transferring corrections to the denoiser. |
| 7 | #10947 | [OmniMM: A Unified Language-Motion Model with Biomechanical Skeleton Motion](https://openreview.net/forum?id=no9B6rTq9l) | 3.667 (4, 3, 4); n=3; std=0.471 | Couple modality-specific Transformer towers through shared attention to jointly model biomechanical motion, parametric motion, and language. |
| 8 | #33712 | [RealSynz: Naturalizing Synthetic Images with Envelope Variation Statistics](https://openreview.net/forum?id=80jkP3BMjb) | 3.667 (4, 4, 3); n=3; std=0.471 | Correct fine-detail moment ratios and learn where to redistribute detail or add texture in generated images. |
| 9 | #5326 | [OSFAL: Orthogonal Cross-Spectral Feature Alignment and Layer-Localized Cross-View Learning for Any-Scenario Person Re-Identification](https://openreview.net/forum?id=3WJt45k8b3) | 3.667 (3, 4, 4); n=3; std=0.471 | Align spectral features with orthogonal transformations and apply cross-view contrastive learning at a selected encoder layer. |
| 10 | #5953 | [JLD: PERCEPTUAL DISTANCE THROUGH A JACOBIAN LENS](https://openreview.net/forum?id=HDZmeQWsiP) | 3.667 (3, 4, 4); n=3; std=0.471 | Use a frozen encoder's Jacobian to construct a perceptual metric over early visual features. |
| 11 | #20990 | [VolS-GS: Relightable Gaussian Splatting With Volumetric Subsurface Scattering](https://openreview.net/forum?id=RWcRiQ45vV) | 3.667 (3, 4, 4); n=3; std=0.471 | Solve differentiable volumetric light transport over Gaussian primitives with learned scattering and absorption coefficients. |
| 12 | #38629 | [A Unified Reasoning Framework for World Knowledge-Aligned Image Generation and Editing](https://openreview.net/forum?id=IlAkJHa45w) | 3.667 (4, 3, 4); n=3; std=0.471 | Combine world-knowledge planning with editing-based visual self-correction inside a unified multimodal representation. |
| 13 | #16073 | [UniBioTransfer: A Unified Framework for Multiple Biometrics Transfer](https://openreview.net/forum?id=CSvwscsOjR) | 3.667 (4, 3, 4); n=3; std=0.471 | Combine unified attribute-transfer data with a mixture-of-experts model and staged training to separate task-specific knowledge. |
| 14 | #27614 | [ConstraintGS: Modeling Primitive-Level Reconstruction Constraints for Sparse-View Gaussian Splatting](https://openreview.net/forum?id=OUMKQPvct3) | 3.667 (4, 4, 3); n=3; std=0.471 | Estimate primitive-level rendering support and viewing coverage to allocate opacity suppression under a fixed budget. |
| 15 | #8957 | [GAE: Learning a Geometry-Native Latent Space for 3D-Consistent World Generation](https://openreview.net/forum?id=jDSV8YrtWR) | 3.667 (4, 3, 4); n=3; std=0.471 | Reparameterize geometry-model features into shared latents decodable as appearance, depth, cameras, and point maps. |

## Themes & trends

Recurring mechanisms in this selected top-60 set; the pack does not establish change over time or domain-wide prevalence.

- Generation representations carry geometry: #8957 makes geometry-model features the generative state; #6759 represents scenes directly through light-field ray primitives.
- Primitive-level control for Gaussian rendering: #20990 propagates light through volumetric scattering, while #27614 assigns opacity attenuation using reconstruction support.
- Reference and instruction decomposition: #52562 organizes multi-reference prompts as concept trees; #38629 separates knowledge-based planning from corrective editing.
- Expert specialization for heterogeneous inputs: #1629 routes spatial-temporal signals across rendering experts, and #16073 separates knowledge across biometric transfer tasks.
- Correcting representations and output statistics: #10346 adapts latents to infrared frequencies; #33712 redistributes fine detail according to natural-image statistics.

## Score signals

Six of seven `gen-vision.*` groups exceed 2.31. Editing leads these groups at 2.623 (139 papers), followed by autoregressive/unified visual generation at 2.580 (104) and video at 2.572 (400). 3D generation scores 2.542 (304), text-to-image 2.490 (289), and `other` 2.444 (301). GANs/VAEs are the exception: 2.292 across 72 papers, below the venue mean. The major mean is 2.512; the taxonomy errors identified below mean this is the supplied grouping's score, not a corrected estimate.

The snapshot table marks every supplied fine category above, below, or equal to 2.31, including cross-major tags. These are descriptive comparisons within this major, not venue-wide estimates for each tag; overlapping groups and small counts do not establish statistically reliable differences.

## Taxonomy notes

Suggested corrections from the abstracts, not applied changes. Each entry gives a proposed major and fine tags; secondary tags can preserve the method when the research object suggests a different major.

- #37847 → major `llm-agents`, fine `llm-agents.code` and `llm-reasoning.test-time`: the abstract analyzes multi-turn program repair and search, not visual generation.
- #5326 → major `vision`, fine `representation.domain` and `representation.ssl`: identity retrieval across spectra and viewpoints uses feature alignment and contrastive learning.
- #5953 → major `evaluation`, fine `evaluation.eval-methods` plus `vision.low-level`: the contribution is a perceptual-distance metric for judging images and videos.
- #27156 → major `science`, fine `science.molecules`: Gaussian primitives parameterize molecular orbitals in a quantum-mechanical solver, rather than a visual renderer.
- #3715 → major `graphs`, fine `graphs.gnn`: multi-granularity graph representations and anomaly detection are central; the abstract gives no visual-generation or time-series task.
- #7317 → major `safety`, fine `safety.watermark`: the model detects and verifies artifacts as evidence of AI-generated video provenance.
- #21585 → major `vision`, fine `vision.low-level`: the target is blind face restoration from degraded observations.
- #52632 → major `safety`, fine `safety.adversarial` plus `gen-vision.video`: protective perturbations disrupt unauthorized image-to-video generation.

No new fine category proposed. The pack does not establish the required ≥25-paper support for a distinct new category (rule T3); the corrections above can use existing tags.

