# Representation, Transfer & Continual Learning — ICLR 2027 domain brief

Source: `reports/inputs/representation.json` only. Ratings are on the 1–4 scale; the venue-wide mean of means is 2.31.

## Snapshot

- **Papers:** 1592
- **Mean rating:** 2.253 (venue mean 2.31, so −0.057)
- **Top 60 in the pack:** means run from 4.00 down to 3.33.

#41395 has only two ratings (4, 4).

Fine categories sorted by count. Papers can carry up to 3 fine tags. `representation.other` means no fine pattern matched.

| Fine category | Count | Mean rating |
|---|---:|---:|
| `representation.ssl` | 784 | 2.244 |
| `representation.continual` | 326 | 2.290 |
| `representation.domain` | 314 | 2.242 |
| `representation.other` | 109 | 2.240 |
| `representation.semi-weak` | 106 | 2.233 |
| `representation.meta` | 76 | 2.221 |
| `llm-core.finetune` | 28 | 2.464 |
| `rl.model-based` | 22 | 2.258 |
| `multimodal.vlm` | 19 | 2.404 |
| `probabilistic.uq` | 16 | 2.180 |
| `neuro-cog.brain` | 12 | 1.917 |
| `optimization.federated` | 12 | 2.389 |
| `vision.three-d-vision` | 8 | 2.823 |
| `causal.causal-inference` | 7 | 2.262 |
| `embodied.world-models` | 7 | 2.124 |
| `graphs.topology` | 7 | 2.048 |
| `interpretability.steering` | 7 | 2.524 |
| `time-series.ts-other` | 7 | 2.000 |
| `science.health` | 6 | 2.264 |
| `graphs.equivariance` | 5 | 2.533 |
| `graphs.gnn` | 5 | 2.100 |
| `interpretability.probing` | 5 | 2.467 |
| `llm-agents.agents` | 5 | 2.267 |
| `llm-agents.memory` | 5 | 2.133 |
| `safety.adversarial` | 5 | 2.017 |
| `science.genomics` | 5 | 2.400 |
| `vision.detection-seg` | 5 | 2.067 |
| `vision.medical-imaging` | 5 | 2.333 |
| `applications.tabular` | 4 | 2.417 |
| `multimodal.audio-speech` | 4 | 2.083 |
| `safety.unlearning` | 4 | 2.333 |
| `vision.vision-backbones` | 4 | 2.417 |
| `evaluation.datasets` | 3 | 2.333 |
| `gen-vision.gan-vae` | 3 | 2.222 |
| `llm-core.icl` | 3 | 2.111 |
| `llm-core.moe` | 3 | 2.444 |
| `llm-efficiency.pruning` | 3 | 2.222 |
| `safety.watermark` | 3 | 2.306 |
| `theory.dynamics` | 3 | 2.000 |
| `time-series.forecasting` | 3 | 2.222 |
| `vision.remote-sensing` | 3 | 1.778 |

49 further fine tags have count < 3 (60 tag assignments in total) and are omitted here; they are listed in the input pack.

## Top 15 papers

Rank is the position within this domain. The number in parentheses is the pack's `rank` field, which appears to be a venue-wide ordering.

| Rank | # | Title | Mean (ratings) | One-line idea |
|---:|---:|---|---|---|
| 1 (7) | #12797 | [TaxoMFM: A Taxonomy-Aware Foundation Model for the Human Gut Microbiome](https://openreview.net/forum?id=Azyz6klPCa) | 4.00 (4, 4, 4) | Relation-biased self-attention over four taxonomic ranks plus hierarchical compositional decoding pretrains multiscale gut microbiome representations. |
| 2 (37) | #60501 | [Outperforming 1000 Euclidean Layers With Hyperbolic Contrastive RL](https://openreview.net/forum?id=ldn229Iy07) | 4.00 (4, 4, 4) | Replaces Euclidean distances in contrastive RL's objective with hyperbolic geodesic distances, so shallow agents capture maze route geometry. |
| 3 (38) | #41395 | [Zero-Shot Control with Gaussian Representations and Test-Time Adjustment](https://openreview.net/forum?id=WeUNn9rlIi) | 4.00 (4, 4) | Successor features on latent-dynamics representations regularized toward isotropic Gaussians, plus model-based test-time search over the pretrained policy family. |
| 4 (66) | #19945 | [The Geometry of Logic: Stratification Induces Semantic Structure and Robust Reasoning](https://openreview.net/forum?id=kNE7WNxuZK) | 3.67 (4, 4, 3) | Partitions the residual stream into orthogonal Data and Type subspaces, with type-based attention and gating controlling data transformations. |
| 5 (132) | #52157 | [Optimal VC Dimension of Contrastive Learning With Margin](https://openreview.net/forum?id=cRvwvthrBO) | 3.67 (4, 3, 4) | Proves optimal VC-dimension bounds for learning d-dimensional embeddings from margin-satisfying anchor–positive–negative triplets, resolving Alon et al.'s question. |
| 6 (137) | #8408 | [Scr4tch: Self-Supervised 4D Reconstruction from Raw Video Alone](https://openreview.net/forum?id=AZyfy4tocm) | 3.67 (3, 4, 4) | Latent cross-view reconstruction with motion constraints separating camera from scene dynamics, then joint optimization into explicit deformable 4D scenes. |
| 7 (140) | #10730 | [Mapping and Matching Joint Learning for Unpaired Unsupervised Visible-Infrared Person Re-Identification](https://openreview.net/forum?id=mxAoSbgOth) | 3.67 (4, 3, 4) | Attention-guided cross-modality feature mapping plus matching of real cross-modality positive clusters for unpaired unsupervised visible-infrared ReID. |
| 8 (145) | #18298 | [Global Average Precision for Representation Learning](https://openreview.net/forum?id=AsDkLi7mAk) | 3.67 (4, 4, 3) | Differentiable surrogate of global average precision ranking all query–candidate pairs jointly; drop-in replacement for InfoNCE and per-query AP losses. |
| 9 (153) | #30460 | [EXACT: Estimation–Support Asymmetry in Test-Time Adaptation](https://openreview.net/forum?id=mtgeo9qBIo) | 3.67 (3, 4, 4) | Uses global target statistics when test data are scarce and class-specific statistics as samples accumulate, without updating the model. |
| 10 (171) | #44881 | [From Ranking to Selection: Evaluating Representation Proxies in RL](https://openreview.net/forum?id=hweb3jGXCJ) | 3.67 (4, 4, 3) | Scores representation proxies by downstream performance of the representation each selects relative to the best, alongside rank correlation. |
| 11 (173) | #44969 | [Synoptic Information: A Variational Principle for Joint Representation Learning](https://openreview.net/forum?id=naRYgKObRP) | 3.67 (4, 3, 4) | Two-temperature variational principle for bits shared between two compressed views; exact self-consistent encoder equations, closed-form for Gaussians via CCA. |
| 12 (189) | #11848 | [Uncertainty-Driven Trustworthy Multi-modal Information Bottleneck Clustering](https://openreview.net/forum?id=n9zG3wmMK9) | 3.67 (3, 4, 4) | Uncertainty-regulated information-bottleneck compression with dual-path fusion: uncertainty-weighted features plus Dempster–Shafer opinion aggregation for multi-modal clustering. |
| 13 (216) | #32843 | [Whitening Improves Robustness to Spurious Correlations in Linear Probes](https://openreview.net/forum?id=jyS8W0bWJR) | 3.67 (4, 4, 3) | Linear probes favor large-covariance-eigenvalue directions via max-margin bias; whitening equalizes eigenvalues, reducing reliance on spurious features without spurious-feature labels. |
| 14 (224) | #19731 | [What to Preserve and Trust in Multi-modal Clustering: Cross-Guided Information Bottleneck with Reliable Contrastive Learning](https://openreview.net/forum?id=JYMIxuG7ph) | 3.67 (4, 3, 4) | Per-sample cross-guided information bottleneck from other modalities plus contrastive learning reweighting negative pairs by reliability, for multi-modal clustering. |
| 15 (273) | #49162 | [fDAG-ACDC: Uncertainty-Adaptive Factor-Count Selection for High-Dimensional Causal Discovery](https://openreview.net/forum?id=QvAAGu1wUz) | 3.50 (3, 4, 4, 3) | Local posterior-predictive checks per node and parents within each environment select the latent factor count, with model-selection consistency. |

## Themes & trends

- **Representation learning for RL and zero-shot control.** Ranks 2 and 3 are both RL representation papers. The cluster covers:
  - hyperbolic geodesics in contrastive RL: #60501
  - Gaussian-regularized successor features with test-time policy search: #41395
  - action-sequence (chunked) contrastive RL: #26852
  - selection-based scoring of representation proxies: #44881
  - greedy action consolidation for continual RL: #30420
- **Joint-embedding predictive objectives (JEPA family).** The cluster covers:
  - a set-level characterization of what JEPA represents: #48801
  - distributional rather than point prediction: #12611
  - JEPA-style latent guidance for video reasoning: #21514
  - prompt-residual prediction for vision graph prompting: #14176
  - post-training multimodal embeddings to predict physical dynamics in representation space: #1502
- **Test-time adaptation through better use of target statistics.** Methods choose between global and class-specific statistics by data support (#30460), whiten within-class covariance (#32177), gate corrections by expected gain in continual TTA (#23113), cast TTA as data assimilation with restored inputs (#23237), use numerical manifolds in LLMs (#23737), and adapt per test pair for homography (#6601). #32843 uses the same whitening idea for linear probes against spurious correlations.
- **Identifiability, disentanglement and object-centric structure.** The cluster covers:
  - identifiable slot disentanglement under max-pooling: #58971
  - entropy-ordered normalizing flows as nonlinear PCA: #45315
  - masked feature reconstruction for slots: #48612
  - a position paper arguing object-centric representations are insufficient for interaction understanding: #20857
  - model selection of the latent factor count in causal representation learning: #49162
- **Redesigning contrastive and multi-view objectives, with theory.** The cluster covers:
  - a global-AP surrogate replacing InfoNCE: #18298
  - adaptive margins for hard negatives: #4775
  - first-principles multi-view patch-level SSL: #42738
  - optimal VC bounds for contrastive learning with margin: #52157
  - an information-theoretic two-view compression principle: #44969
  - information-bottleneck multi-modal clustering: #11848, #19731
  - non-Euclidean embedding geometry: #1589, #15532
- **PEFT-based continual learning and the mechanics of forgetting.** The cluster covers:
  - LoRA modules for class-incremental learning: #30871
  - a controlled dissection of PEFT-based continual learning: #44463
  - class-incremental learning with zero-shot unlearning: #46193
  - low-rank temporal domain generalization: #14964
  - analyses that recast forgetting as spurious (#13556) or as solution density (#31928)

## Score signals

The domain mean is 2.253, which is −0.057 below the venue mean of 2.31. This is the lowest of the four domains in this batch (theory 2.346, optimization 2.303, probabilistic 2.273).

**Fine categories inside `representation`.** All six are below the venue mean:

- `representation.continual` 2.290 (n = 326), the closest
- `representation.ssl` 2.244 (n = 784)
- `representation.domain` 2.242 (n = 314)
- `representation.other` 2.240 (n = 109)
- `representation.semi-weak` 2.233 (n = 106)
- `representation.meta` 2.221 (n = 76)

**Cross-major tags above the venue mean:**

- `llm-core.finetune` 2.464 (n = 28)
- `multimodal.vlm` 2.404 (n = 19)
- `optimization.federated` 2.389 (n = 12)
- `vision.three-d-vision` 2.823 (n = 8)
- `interpretability.steering` 2.524 (n = 7)
- `graphs.equivariance` 2.533 (n = 5)
- `interpretability.probing` 2.467 (n = 5)
- `science.genomics` 2.400 (n = 5)
- `llm-core.moe` 2.444 (n = 3)

**Cross-major tags below the venue mean:**

- `rl.model-based` 2.258 (n = 22)
- `probabilistic.uq` 2.180 (n = 16)
- `neuro-cog.brain` 1.917 (n = 12)
- `time-series.ts-other` 2.000 (n = 7)
- `graphs.topology` 2.048 (n = 7)
- `embodied.world-models` 2.124 (n = 7)
- `safety.adversarial` 2.017 (n = 5)
- `vision.detection-seg` 2.067 (n = 5)
- `vision.remote-sensing` 1.778 (n = 3)

**Within the top 60:**

- `representation.ssl` 35 papers (34 as first tag)
- `representation.domain` 13
- `representation.continual` 8
- `representation.other` 3
- `llm-core.finetune` 3

`representation.ssl` dominates both the category (784 papers) and the top 60. Its pattern includes the generic phrase "representation learning", so its top-60 share partly reflects keyword breadth (see Taxonomy notes).

Every cross-major signal rests on n ≤ 28.

## Taxonomy notes

**Likely misclassified or mis-tagged (top 60).** `representation.ssl` matches the generic keyword "representation learning", and "contrastive" matches non-SSL uses. Several cases follow:

- #12797 → `science` / `science.genomics`. It is a gut-microbiome foundation model with a taxonomic hierarchy, and its only tag is `representation.ssl`.
- #19945 → `llm-core` / `llm-core.architecture`. STRAT is a Transformer architecture that partitions the residual stream. The tag comes from the "Representation Learning" keyword.
- #49162 → `causal` / `causal.causal-inference` as the major. It is model selection for causal discovery and is currently first-tagged `representation.ssl`.
- #8408 → `vision` / `vision.three-d-vision`. It does self-supervised 4D reconstruction. Its `gen-vision.three-d` tag points at generation, which this paper does not do.
- #55293 → `llm-reasoning` / `llm-reasoning.rl-reasoning`, keeping `representation.semi-weak` as a second tag. It studies RLVR under noisy labels.
- #28560 → `safety` / `safety.watermark`. It detects AI-generated text and attributes generators. The `representation.domain` tag comes from "out-of-distribution generalization".
- #20027 → `evaluation.eval-methods`. It measures persuasion through likelihood probing. "Contrastive" here is not contrastive representation learning.
- #51479 → `llm-core` / `llm-core.scaling`. It studies transformer knowledge capacity and memorization and is tagged `representation.ssl`.
- #13556 → add `representation.continual`. It covers forgetting during LM fine-tuning, but the title's "not Catastrophic" means the `catastrophic forgetting` pattern does not fire.
- #18615 → `embodied` / `embodied.world-models`. It is a world-action model for robot manipulation.
- #21514 → `multimodal.vlm-reasoning` or `gen-vision.video`. It does video reasoning through video generation.
- #31124 → replace `vision.three-d-vision` with `graphs.gnn`. It does multi-view graph domain adaptation, and "multi-view" triggered the 3D-vision tag.
- #30460 → drop `graphs.equivariance`. It is test-time adaptation with no equivariance content in the abstract.
- #53319 → add `time-series.ts-other`. #54081 → add `science.health`. #33971 → add `science.molecules`. All three carry an application domain beyond `representation`.

**Proposed new fine categories (major `representation`).** The pack covers only the top 60, so I cannot check rule T3 (≥ 25 papers) from it.

1. **Test-Time Adaptation.** Adapting a deployed model with unlabeled test data, by statistics, normalization or self-supervised updates, including continual TTA. It is split from `representation.domain`, which would keep training-time domain adaptation, domain generalization and OOD detection. Examples: #30460, #32177, #23113, #23237, #23737, #6601.
2. **Representation Learning for RL & Control.** Self-supervised, contrastive and successor-feature representations learned for decision making, plus methods to evaluate them. The object is the representation, not the RL algorithm. Examples: #60501, #41395, #26852, #44881.
3. **Disentanglement, Identifiability & Object-Centric Learning.** Recovering factorized, identifiable or slot-structured latents from unlabeled data. Examples: #58971, #45315, #48612, #20857.

Considered and not proposed: **joint-embedding predictive learning (JEPA)** (#48801, #12611, #21514, #14176). It is a strong cluster, but it is named after a method family, which rule T4 discourages. It could become a pattern inside `representation.ssl` instead.
