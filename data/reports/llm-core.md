# LLM Pretraining, Architecture & Scaling — ICLR 2027 domain brief

## Snapshot

1,901 papers; mean rating **2.305** on the 1–4 scale. Venue-wide mean of paper means: **2.31**.

Source: [supplied llm-core pack](../inputs/llm-core.json). Snapshot statistics cover the full major; paper-level discussion uses its top 60. Fine tags overlap, including tags from other majors, so counts must not be summed. All fine categories in the pack appear below, sorted by descending count. Aggregate review counts and standard deviations are not supplied.

| Fine category | Count | Mean rating | Versus venue mean (2.31) |
| --- | ---: | ---: | --- |
| `llm-core.finetune` | 510 | 2.266 | Below |
| `llm-core.moe` | 294 | 2.301 | Below |
| `llm-core.architecture` | 234 | 2.284 | Below |
| `llm-core.long-context` | 224 | 2.289 | Below |
| `llm-core.data` | 215 | 2.353 | Above |
| `llm-core.ssm` | 189 | 2.372 | Above |
| `llm-core.other` | 170 | 2.337 | Above |
| `llm-core.icl` | 118 | 2.340 | Above |
| `llm-core.scaling` | 114 | 2.432 | Above |
| `llm-core.multilingual` | 91 | 2.233 | Below |
| `optimization.federated` | 20 | 2.142 | Below |
| `llm-efficiency.kv-cache` | 16 | 2.066 | Below |
| `llm-efficiency.pruning` | 16 | 2.500 | Above |
| `llm-efficiency.quantization` | 14 | 2.179 | Below |
| `llm-agents.agents` | 9 | 2.389 | Above |
| `optimization.optimizers` | 9 | 2.611 | Above |
| `representation.continual` | 9 | 2.259 | Below |
| `causal.causal-inference` | 8 | 2.292 | Below |
| `diffusion.discrete` | 8 | 2.458 | Above |
| `llm-efficiency.speculative` | 8 | 2.562 | Above |
| `probabilistic.uq` | 8 | 2.708 | Above |
| `safety.jailbreak` | 8 | 2.417 | Above |
| `vision.detection-seg` | 8 | 2.208 | Below |
| `alignment.preference` | 6 | 2.333 | Above |
| `applications.tabular` | 6 | 2.292 | Below |
| `interpretability.mech-interp` | 6 | 2.514 | Above |
| `vision.three-d-vision` | 6 | 2.278 | Below |
| `graphs.topology` | 5 | 2.400 | Above |
| `multimodal.vlm` | 5 | 2.200 | Below |
| `neuro-cog.brain` | 5 | 1.933 | Below |
| `representation.domain` | 5 | 2.500 | Above |
| `representation.ssl` | 5 | 2.267 | Below |
| `applications.recsys` | 4 | 2.479 | Above |
| `gen-vision.ar-visual` | 4 | 2.250 | Below |
| `graphs.equivariance` | 4 | 2.000 | Below |
| `interpretability.steering` | 4 | 2.333 | Above |
| `llm-agents.deep-research` | 4 | 2.417 | Above |
| `llm-reasoning.test-time` | 4 | 2.583 | Above |
| `optimization.convex` | 4 | 2.750 | Above |
| `probabilistic.bayesian` | 4 | 2.167 | Below |
| `rl.exploration` | 4 | 2.542 | Above |
| `vision.vision-backbones` | 4 | 2.250 | Below |
| `applications.finance-edu` | 3 | 1.889 | Below |
| `evaluation.llm-bench` | 3 | 2.583 | Above |
| `llm-agents.multi-agent` | 3 | 2.556 | Above |
| `llm-efficiency.systems` | 3 | 2.667 | Above |
| `llm-reasoning.cot` | 3 | 1.556 | Below |
| `llm-reasoning.rl-reasoning` | 3 | 2.000 | Below |
| `theory.dynamics` | 3 | 2.167 | Below |
| `time-series.forecasting` | 3 | 1.806 | Below |
| `alignment.sycophancy` | 2 | 2.333 | Above |
| `diffusion.inverse` | 2 | 2.833 | Above |
| `embodied.driving` | 2 | 2.667 | Above |
| `interpretability.probing` | 2 | 2.500 | Above |
| `llm-agents.tool-use` | 2 | 1.583 | Below |
| `llm-efficiency.distillation` | 2 | 2.167 | Below |
| `llm-reasoning.self-improve` | 2 | 2.000 | Below |
| `multimodal.audio-speech` | 2 | 2.167 | Below |
| `representation.meta` | 2 | 2.167 | Below |
| `rl.model-based` | 2 | 2.000 | Below |
| `safety.privacy` | 2 | 1.667 | Below |
| `science.genomics` | 2 | 2.333 | Above |
| `science.pde` | 2 | 2.167 | Below |
| `theory.online` | 2 | 1.333 | Below |
| `time-series.ts-foundation` | 2 | 2.333 | Above |
| `applications.nlp` | 1 | 1.667 | Below |
| `causal.formal` | 1 | 1.250 | Below |
| `diffusion.architecture` | 1 | 2.000 | Below |
| `diffusion.sampling` | 1 | 2.333 | Above |
| `embodied.navigation` | 1 | 2.667 | Above |
| `embodied.vla` | 1 | 2.333 | Above |
| `embodied.world-models` | 1 | 1.500 | Below |
| `gen-vision.t2i` | 1 | 1.667 | Below |
| `gen-vision.three-d` | 1 | 3.000 | Above |
| `gen-vision.video` | 1 | 2.667 | Above |
| `graphs.gnn` | 1 | 2.333 | Above |
| `graphs.graph-llm` | 1 | 3.000 | Above |
| `interpretability.xai` | 1 | 2.333 | Above |
| `llm-agents.computer-use` | 1 | 3.333 | Above |
| `llm-agents.memory` | 1 | 2.333 | Above |
| `llm-reasoning.math` | 1 | 1.750 | Below |
| `llm-reasoning.verifiers` | 1 | 3.000 | Above |
| `optimization.bo-hpo` | 1 | 2.667 | Above |
| `representation.semi-weak` | 1 | 1.667 | Below |
| `rl.deep-rl` | 1 | 3.000 | Above |
| `rl.marl` | 1 | 2.000 | Below |
| `safety.fairness` | 1 | 2.333 | Above |
| `safety.watermark` | 1 | 2.667 | Above |
| `science.molecules` | 1 | 2.000 | Below |
| `science.scientific-discovery` | 1 | 2.333 | Above |
| `theory.generalization` | 1 | 2.667 | Above |
| `theory.transformer-theory` | 1 | 2.000 | Below |
| `time-series.dynamics` | 1 | 2.000 | Below |
| `time-series.ts-other` | 1 | 3.000 | Above |

## Top 15 papers

Rank is within this major, preserving the input order, including ties. The pack omits reviewer confidence, so confidence-weighted tie-breaks cannot be independently checked. n counts the listed ratings; std is their population standard deviation, calculated from those ratings.

| Rank | #number | Title | Mean (individual ratings); n; std | One-line idea |
| ---: | --- | --- | --- | --- |
| 1 | #10806 | [SMELT: Scaling Laws for Compute-Matched MoE Looped Transformers](https://openreview.net/forum?id=RFvMxqnGL9) | 4.000 (4, 4, 4); n=3; std=0.000 | Loop middle MoE layers twice while narrowing model width to match parameters, per-token compute, and KV-cache budgets. |
| 2 | #11995 | [Integral DeltaNet: Improved Linear Attention with Adaptive Memory Integration](https://openreview.net/forum?id=2RuXSrvuem) | 4.000 (4, 4, 4); n=3; std=0.000 | Combine a fast delta-rule state with an integral history state through adaptive readout. |
| 3 | #21932 | [Multilinguality in Hybrid Attention LLMs](https://openreview.net/forum?id=xT5agIyCVG) | 4.000 (4, 4, 4); n=3; std=0.000 | Analyze multilingual representations across hybrid attention layers and test alternative recurrent/full-attention orderings through distillation. |
| 4 | #42215 | [UltraBERT: Beyond the Limit of BERT Pre-Training](https://openreview.net/forum?id=5nZYvSLKhV) | 4.000 (4, 4, 4); n=3; std=0.000 | Use separate language-model heads for low and high masking ratios, restricting distillation to the low-ratio branch. |
| 5 | #45284 | [Latent Taxonomies: How Property Induction Develops in Language Model Pre-training](https://openreview.net/forum?id=m5TLPK0U7O) | 4.000 (4, 4, 4); n=3; std=0.000 | Inject synthetic hierarchical facts during pretraining and track property transfer and taxonomic structure in entity representations. |
| 6 | #50478 | [Variable-Width Transformers](https://openreview.net/forum?id=6pbC57phxh) | 4.000 (4, 4, 4); n=3; std=0.000 | Widen early and late Transformer layers while narrowing middle layers with parameter-free residual resizing. |
| 7 | #2802 | [BranchTokens: Branch-Centric Tokenization and Test-Time Augmentation for Skeleton Generation](https://openreview.net/forum?id=69nOcEaHQA) | 3.667 (4, 3, 4); n=3; std=0.471 | Serialize skeletons by branches and select among rotated-view predictions using mesh coverage and cross-view agreement. |
| 8 | #6121 | [Suppressing the Shortcut Hidden Behind the Gains of VideoLLM Fine-Tuning](https://openreview.net/forum?id=PPII4JrkqX) | 3.667 (3, 4, 4); n=3; std=0.471 | Project fine-tuning updates orthogonally to the base model's text-only activation subspace to suppress video-bypassing shortcuts. |
| 9 | #15233 | [A Theory of Platonic Representations in Language Models](https://openreview.net/forum?id=fxtLdanc2R) | 3.667 (4, 3, 4); n=3; std=0.471 | Model shared multilingual hierarchy with probabilistic grammars and belief propagation to predict layerwise representation similarity. |
| 10 | #28436 | [Learning without Overwriting:  A Theory of Self-Distillation and Supervised Fine-Tuning in Continual Reasoning](https://openreview.net/forum?id=zQnQL2xLJ9) | 3.667 (4, 4, 3); n=3; std=0.471 | Model reasoning as graph search to analyze how sparse self-distillation and dense supervised updates affect forgetting. |
| 11 | #36176 | [Small-Scale Experiments: Are We There Yet?](https://openreview.net/forum?id=hAZxes7EMV) | 3.667 (3, 4, 4); n=3; std=0.471 | Tune small models to their performance frontier and analyze hyperparameter sensitivity before extrapolating scaling laws. |
| 12 | #18865 | [History Replays Itself: Unleashing Long-Context Capability in Linear Attention](https://openreview.net/forum?id=Q9UhSURI9U) | 3.667 (4, 3, 4); n=3; std=0.471 | Archive selected text using native backbone features, then replay retrieved evidence through recurrent models. |
| 13 | #42128 | [LongHarness: Advancing Agentic Reasoning over 100M-Token Corpora via Stateful Evidence Management](https://openreview.net/forum?id=6BgHc3SjtG) | 3.667 (3, 4, 4); n=3; std=0.471 | Couple explicit evidence and conclusion states so unresolved conclusions guide retrieval and new evidence updates conclusions. |
| 14 | #44900 | [Copy-Paste Language Models](https://openreview.net/forum?id=RsR9OqpcE9) | 3.667 (3, 4, 4); n=3; std=0.471 | Add a pointer-like copy-paste head that provides an alternative gradient path for copying input text. |
| 15 | #50303 | [One Token Away from Collapse: The Fragility of Instruction-Tuned Helpfulness](https://openreview.net/forum?id=Yw4tyBzytd) | 3.667 (4, 4, 3); n=3; std=0.471 | Probe constraint-induced response changes and recover helpfulness through mid-layer steering combined with decoder-enforced compliance. |

## Themes & trends

Recurring mechanisms in this selected top-60 set; the pack does not establish change over time or domain-wide prevalence.

- Compute allocation changes across depth: #10806 trades width for recurrent MoE depth, while #50478 widens early and late layers and narrows the middle.
- Recurrent computation separates immediate state from historical evidence: #11995 adds integral memory; #18865 stores sparse episodes and replays them through the backbone.
- Multilingual structure depends on layer organization: #21932 studies hybrid-attention ordering, and #15233 derives similarity patterns from shared hierarchical grammar structure.
- Post-training controls where updates act: #6121 removes text-only shortcut directions, while #28436 contrasts sparse self-distillation updates with dense supervised updates.
- Pretraining recipes require task-specific controls: #42215 separates masking ratios for classification and retrieval; #36176 shows why small-model scaling comparisons require extensive tuning.

## Score signals

Five `llm-core.*` groups exceed 2.31: scaling (114 papers; 2.432), state-space/linear-attention models (189; 2.372), data (215; 2.353), in-context learning (118; 2.340), and `other` (170; 2.337). Five fall below it: MoE (294; 2.301), long context (224; 2.289), architecture (234; 2.284), fine-tuning (510; 2.266), and multilingual work (91; 2.233). The major's 2.305 mean is only 0.005 below the venue baseline; these rounded aggregate figures do not establish a meaningful statistical separation.

The snapshot table marks every supplied fine category above, below, or equal to 2.31, including cross-major tags. These are descriptive comparisons within this major, not venue-wide estimates for each tag; overlapping groups and small counts do not establish statistically reliable differences.

## Taxonomy notes

Suggested corrections from the abstracts, not applied changes. Each entry gives a proposed major and fine tags; secondary tags can preserve the method when the research object suggests a different major.

- #2802 → major `gen-vision`, fine `gen-vision.three-d` and `gen-vision.ar-visual`: branch tokens encode skeletal geometry, not language pretraining data.
- #6121 → major `multimodal`, fine `multimodal.video-understanding` plus `llm-core.finetune`: the method specifically grounds video-model answers in visual evidence.
- #42128 → major `llm-agents`, fine `llm-agents.deep-research` and `llm-agents.memory`: an external harness manages evidence across a corpus rather than extending model context architecture.
- #44900 → retain major `llm-core`, replace `llm-core.other` with `llm-core.architecture`: the copy-paste head changes the model and its gradient paths.
- #51732 → major `theory`, fine `theory.online` plus `optimization.convex`: the paper proves kernel-SVM training complexity bounds, not an SSM or language-model method.
- #59103 → major `optimization`, fine `optimization.optimizers`: exponential-moving-average updates accelerate k-means; the scaling laws concern clustering hyperparameters.
- #46254 → retain major `llm-core` and fine `llm-core.ssm`, removing `vision.detection-seg`: state tracking refers to algebraic recurrent computation rather than visual object tracking.

No new fine category proposed. The pack does not establish the required ≥25-paper support for a distinct new category (rule T3); the corrections above can use existing tags.

