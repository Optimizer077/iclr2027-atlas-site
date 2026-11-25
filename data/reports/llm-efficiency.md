# Efficient ML, Compression & Inference — ICLR 2027 domain brief

## Snapshot

1,489 papers; mean rating **2.331** on the 1–4 scale. Venue-wide mean of paper means: **2.31**.

Source: [supplied llm-efficiency pack](../inputs/llm-efficiency.json). Snapshot statistics cover the full major; paper-level discussion uses its top 60. Fine tags overlap, including tags from other majors, so counts must not be summed. All fine categories in the pack appear below, sorted by descending count. Aggregate review counts and standard deviations are not supplied.

| Fine category | Count | Mean rating | Versus venue mean (2.31) |
| --- | ---: | ---: | --- |
| `llm-efficiency.kv-cache` | 494 | 2.378 | Above |
| `llm-efficiency.quantization` | 432 | 2.333 | Above |
| `llm-efficiency.pruning` | 376 | 2.361 | Above |
| `llm-efficiency.speculative` | 181 | 2.409 | Above |
| `llm-efficiency.distillation` | 139 | 2.246 | Below |
| `llm-efficiency.systems` | 134 | 2.247 | Below |
| `llm-efficiency.other` | 73 | 2.347 | Above |
| `llm-core.long-context` | 37 | 2.418 | Above |
| `probabilistic.uq` | 24 | 2.292 | Below |
| `multimodal.vlm` | 22 | 2.317 | Above |
| `llm-agents.agents` | 19 | 2.365 | Above |
| `llm-core.moe` | 18 | 2.167 | Below |
| `gen-vision.video` | 14 | 2.387 | Above |
| `diffusion.discrete` | 13 | 2.295 | Below |
| `multimodal.efficient-vlm` | 11 | 2.568 | Above |
| `embodied.vla` | 10 | 2.608 | Above |
| `llm-core.architecture` | 9 | 2.259 | Below |
| `vision.vision-backbones` | 9 | 2.556 | Above |
| `llm-reasoning.cot` | 7 | 2.333 | Above |
| `llm-core.finetune` | 5 | 2.067 | Below |
| `optimization.optimizers` | 5 | 2.267 | Below |
| `evaluation.llm-bench` | 4 | 2.438 | Above |
| `llm-agents.deep-research` | 4 | 2.417 | Above |
| `llm-agents.multi-agent` | 4 | 2.250 | Below |
| `llm-reasoning.self-improve` | 4 | 1.833 | Below |
| `optimization.convex` | 4 | 2.583 | Above |
| `interpretability.xai` | 3 | 2.333 | Above |
| `llm-core.ssm` | 3 | 3.000 | Above |
| `llm-reasoning.rl-reasoning` | 3 | 2.556 | Above |
| `llm-reasoning.verifiers` | 3 | 2.333 | Above |
| `optimization.federated` | 3 | 2.083 | Below |
| `theory.generalization` | 3 | 2.111 | Below |
| `theory.online` | 3 | 1.672 | Below |
| `theory.transformer-theory` | 3 | 2.444 | Above |
| `diffusion.guidance` | 2 | 2.833 | Above |
| `diffusion.sampling` | 2 | 2.833 | Above |
| `evaluation.datasets` | 2 | 2.167 | Below |
| `gen-vision.ar-visual` | 2 | 2.833 | Above |
| `gen-vision.three-d` | 2 | 2.333 | Above |
| `graphs.equivariance` | 2 | 2.000 | Below |
| `graphs.topology` | 2 | 2.333 | Above |
| `interpretability.mech-interp` | 2 | 2.458 | Above |
| `interpretability.steering` | 2 | 2.333 | Above |
| `llm-agents.memory` | 2 | 2.333 | Above |
| `llm-core.data` | 2 | 2.333 | Above |
| `llm-core.icl` | 2 | 2.500 | Above |
| `representation.ssl` | 2 | 2.292 | Below |
| `rl.deep-rl` | 2 | 2.667 | Above |
| `rl.model-based` | 2 | 2.667 | Above |
| `safety.jailbreak` | 2 | 2.333 | Above |
| `time-series.ts-other` | 2 | 2.833 | Above |
| `applications.tabular` | 1 | 3.000 | Above |
| `diffusion.architecture` | 1 | 2.667 | Above |
| `diffusion.flow-matching` | 1 | 3.000 | Above |
| `embodied.navigation` | 1 | 2.333 | Above |
| `evaluation.eval-methods` | 1 | 1.667 | Below |
| `gen-vision.gan-vae` | 1 | 2.333 | Above |
| `gen-vision.t2i` | 1 | 2.667 | Above |
| `graphs.gnn` | 1 | 2.333 | Above |
| `llm-agents.computer-use` | 1 | 2.667 | Above |
| `multimodal.video-understanding` | 1 | 3.000 | Above |
| `neuro-cog.brain` | 1 | 3.000 | Above |
| `optimization.bo-hpo` | 1 | 2.000 | Below |
| `probabilistic.bayesian` | 1 | 2.333 | Above |
| `probabilistic.sampling` | 1 | 2.000 | Below |
| `representation.continual` | 1 | 3.333 | Above |
| `representation.meta` | 1 | 1.000 | Below |
| `representation.semi-weak` | 1 | 2.000 | Below |
| `rl.rl-theory` | 1 | 2.667 | Above |
| `safety.adversarial` | 1 | 2.000 | Below |
| `safety.fairness` | 1 | 2.333 | Above |
| `safety.privacy` | 1 | 2.667 | Above |
| `safety.watermark` | 1 | 2.333 | Above |
| `science.genomics` | 1 | 1.333 | Below |
| `science.pde` | 1 | 3.333 | Above |
| `science.protein` | 1 | 3.000 | Above |
| `time-series.ts-foundation` | 1 | 2.000 | Below |
| `vision.detection-seg` | 1 | 2.667 | Above |

## Top 15 papers

Rank is within this major, preserving the input order, including ties. The pack omits reviewer confidence, so confidence-weighted tie-breaks cannot be independently checked. n counts the listed ratings; std is their population standard deviation, calculated from those ratings.

| Rank | #number | Title | Mean (individual ratings); n; std | One-line idea |
| ---: | --- | --- | --- | --- |
| 1 | #15829 | [DynamicKV: Predictive and Reversible KV-Cache Precision Allocation for Agentic LLM Inference](https://openreview.net/forum?id=ReOTai8HD3) | 4.000 (4, 4, 4); n=3; std=0.000 | Predict future attention and demotion damage to reversibly allocate KV precision using GPU bases and host-memory residuals. |
| 2 | #23443 | [Periodic Weak Spots: Phase Sensitivity from Chunked KV-Cache Compression](https://openreview.net/forum?id=2dhoYgHiC2) | 4.000 (4, 4, 4); n=3; std=0.000 | Vary information positions relative to compression windows and use causal interventions to diagnose phase-specific retrieval failures. |
| 3 | #25659 | [Do We Really Need KL Divergence for On-Policy Distillation of Large Language Models?](https://openreview.net/forum?id=kK5dgC2n6K) | 3.667 (4, 3, 4); n=3; std=0.471 | Use teacher-directed update signs on high-disagreement tokens and combine teachers through consensus supervision. |
| 4 | #58828 | [UP-MOPD: Update Projection in Multi-Teacher On-Policy Distillation](https://openreview.net/forum?id=LZxfSX1Oqu) | 3.667 (4, 4, 3); n=3; std=0.471 | Project optimizer-produced parameter displacements onto constraints that prevent first-order increases in individual domain losses. |
| 5 | #39610 | [D-cut: Adaptive Verification Depth Pruning for Batched Speculative Decoding](https://openreview.net/forum?id=CacgTMv4l5) | 3.667 (4, 3, 4); n=3; std=0.471 | Allocate speculative verification depth across requests using draft confidence and a deployment-specific runtime cost model. |
| 6 | #7827 | [KVpop - Key-Value Cache Compression with Predictive Online Pruning](https://openreview.net/forum?id=QbNnbiHvpL) | 3.667 (3, 4, 4); n=3; std=0.471 | Supervise fixed-budget KV eviction decisions with future-attention signals using stateless or delayed recurrent scorers. |
| 7 | #31930 | [Post-Training Leaves Behavioral Shadows on Unrelated Decisions](https://openreview.net/forum?id=cmznEFc4Wo) | 3.667 (4, 4, 3); n=3; std=0.471 | Find near-tie prompts using a public model and distill private updates from single-word teacher responses. |
| 8 | #30295 | [Disaggregated Quantization: Specializing LLM Prefill and Decode](https://openreview.net/forum?id=pBIUl16cPA) | 3.667 (4, 3, 4); n=3; std=0.471 | Specialize prefill and decode formats and weights, streaming auxiliary prefill checkpoints from SSD when needed. |
| 9 | #23093 | [No Man Is an Island: Overlapping Pruning for Near-Unstructured Quality at 2:4 Efficiency](https://openreview.net/forum?id=KZGndNHcs6) | 3.667 (4, 3, 4); n=3; std=0.471 | Overlap sparsity-selection windows to enlarge feasible pruning masks while retaining hardware selector and datapath constraints. |
| 10 | #52450 | [LinQuant: Functional Invariances for Low-Precision Linear Recurrences](https://openreview.net/forum?id=6egpMpGwZE) | 3.667 (3, 4, 4); n=3; std=0.471 | Apply function-preserving rotations, rescalings, and factor placements to make recurrent prefill operations easier to quantize. |
| 11 | #50375 | [Spatial But Not Temporal Reward Sparsity Drives Slow Policy Learning](https://openreview.net/forum?id=KuFXfejndl) | 3.667 (4, 3, 4); n=3; std=0.471 | Analyze a moving-target policy-learning model to separate spatial and temporal reward-sparsity effects. |
| 12 | #45173 | [Matryoshka Language Model Suites](https://openreview.net/forum?id=IgVNSa3MMg) | 3.667 (4, 4, 3); n=3; std=0.471 | Train nested language submodels jointly so smaller models share parameters, receive distillation, and draft for larger models. |
| 13 | #46794 | [CISA: Retrofitting Dense Attention Models with Chunk-Indexed Sparse Attention](https://openreview.net/forum?id=UpR5uTu7JV) | 3.500 (4, 3); n=2; std=0.500 | Select KV chunks through existing-key summaries and share indexing decisions across grouped or adjacent queries. |
| 14 | #49984 | [LazyFlash: Forward-Dense, Backward-Sparse Attention for Accelerated Long-Context Fine-Tuning](https://openreview.net/forum?id=ZITt6ZPPu0) | 3.500 (3, 3, 4, 4); n=4; std=0.500 | Keep attention forward passes dense while skipping low-gradient backward blocks with importance-sampled updates. |
| 15 | #59324 | [Quantization Modulates Batch-Context Non-Determinism in Greedy LLM Inference](https://openreview.net/forum?id=9kskCmPMqd) | 3.333 (2, 4, 4); n=3; std=0.943 | Compare greedy outputs across batch contexts and precision formats, then test batch-invariant kernels to isolate reduction-order effects. |

## Themes & trends

Recurring mechanisms in this selected top-60 set; the pack does not establish change over time or domain-wide prevalence.

- KV budgets depend on future usefulness: #15829 predicts attention and demotion damage before reallocating precision; #7827 learns keep/drop decisions from future-attention supervision.
- Sparse computation follows hardware and runtime costs: #39610 allocates verification depth across concurrent requests; #23093 changes pruning-mask geometry while retaining hardware constraints.
- Quantization adapts to the computation stage: #30295 separates prefill and decode weights/formats, while #52450 transforms linear recurrences before low-precision prefill.
- Compression needs behavior-sensitive evaluation: #23443 finds retrieval depends on compression-window phase; #59324 tests how batching and quantization change greedy answers.
- Distillation operates on selective updates: #25659 emphasizes teacher-directed motion on high-disagreement tokens, and #58828 projects final optimizer displacements to limit domain interference.

## Score signals

Five `llm-efficiency.*` groups exceed 2.31: speculative/parallel decoding (181 papers; 2.409), KV-cache/attention efficiency (494; 2.378), pruning (376; 2.361), `other` (73; 2.347), and quantization (432; 2.333). Distillation (139; 2.246) and systems (134; 2.247) fall below it. The major mean, 2.331, is above the baseline by 0.021. These figures describe the supplied categories; they do not imply that a technique causes higher ratings.

The snapshot table marks every supplied fine category above, below, or equal to 2.31, including cross-major tags. These are descriptive comparisons within this major, not venue-wide estimates for each tag; overlapping groups and small counts do not establish statistically reliable differences.

## Taxonomy notes

Suggested corrections from the abstracts, not applied changes. Each entry gives a proposed major and fine tags; secondary tags can preserve the method when the research object suggests a different major.

- #50375 → major `rl`, fine `rl.rl-theory` and `rl.exploration`: sparsity refers to rewards in policy learning, not pruning model weights or tokens.
- #25659 → retain major `llm-efficiency`, replace `llm-efficiency.other` with `llm-efficiency.distillation`: on-policy teacher-student update directions are its central object.
- #24128 → major `science`, fine `science.pde` plus `llm-efficiency.pruning`: the sparse-attention architecture models steady-state physical fields on meshes.
- #51315 → major `llm-agents`, fine `llm-agents.code` and `llm-agents.deep-research`, with `interpretability.sae`: sparse codes support evolving-code retrieval and index reuse, not network pruning.
- #20664 → retain major `llm-efficiency`, fine `llm-efficiency.pruning`, `llm-efficiency.kv-cache`, and `vision.detection-seg`, replacing `time-series.ts-other`: pruning targets spatial image patches and anomaly maps.
- #45173 → retain major `llm-efficiency`, add `llm-core.architecture` and `llm-efficiency.distillation` alongside `llm-efficiency.speculative`: nested parameter sharing and joint distillation are central to the suite.
- #31930 → retain major `llm-efficiency` and fine `llm-efficiency.distillation`, with possible `safety.privacy`: the abstract studies transfer of information about private updates; it does not establish a general privacy guarantee or violation.

No new fine category proposed. The pack does not establish the required ≥25-paper support for a distinct new category (rule T3); the corrections above can use existing tags.

