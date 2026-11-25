# Neuroscience & Cognitive Science — ICLR 2027 domain brief

Source: `reports/inputs/neuro-cog.json` only. Ratings are on the 1–4 scale; the venue-wide mean of means is 2.31.

## Snapshot

- **Papers:** 625
- **Mean rating:** 2.276 (venue mean 2.31, so -0.034)
- **Top 60 in the pack:** means run from 4.00 down to 3.00.

Fine categories sorted by count. Papers carry 1–3 fine tags, so counts sum to more than 625. Tags from other majors are secondary tags on papers whose major is `neuro-cog`. `neuro-cog.other` appears to mean that no own-major fine pattern matched.

| Fine category | Count | Mean rating |
|---|---:|---:|
| `neuro-cog.brain` | 494 | 2.279 |
| `neuro-cog.cognition` | 99 | 2.184 |
| `neuro-cog.other` | 47 | 2.402 |
| `representation.ssl` | 20 | 2.218 |
| `multimodal.audio-speech` | 12 | 2.194 |
| `science.health` | 9 | 1.769 |
| `graphs.topology` | 7 | 2.143 |
| `llm-core.finetune` | 7 | 2.190 |
| `evaluation.llm-bench` | 6 | 2.569 |
| `llm-agents.agents` | 6 | 2.222 |
| `vision.low-level` | 6 | 2.167 |
| `representation.continual` | 4 | 2.500 |
| `probabilistic.uq` | 4 | 2.479 |
| `diffusion.flow-matching` | 4 | 2.375 |
| `llm-core.data` | 4 | 2.250 |
| `vision.three-d-vision` | 3 | 2.889 |
| `graphs.equivariance` | 3 | 2.556 |
| `llm-core.ssm` | 3 | 2.667 |
| `evaluation.datasets` | 3 | 2.556 |
| `multimodal.vlm` | 3 | 2.361 |
| `representation.domain` | 3 | 2.111 |
| `llm-efficiency.pruning` | 3 | 1.889 |

38 further fine tags have count < 3 (52 tag assignments in total). They are omitted here and listed in the input pack.

## Top 15 papers

Rank is the position within this domain. The number in parentheses is the pack's venue-wide `rank` field.

| Rank | # | Title | Mean (ratings) | One-line idea |
|---:|---:|---|---|---|
| 1 (23) | #33909 | [Topographic Soft Matching Distance (TSMD): A Framework for Comparing the Spatial Organization of Neural Tuning](https://openreview.net/forum?id=CqEHkct4Dm) | 4.00 (4, 4, 4) | Fused Gromov–Wasserstein matching of neurons by tuning similarity and spatial geometry tests shared cortical topography against shuffled nulls. |
| 2 (85) | #60216 | [Piecewise Few-Spikes Neurons: Nonlinear Function Approximation for Provable and Efficient ANN-to-SNN Conversion](https://openreview.net/forum?id=YyzpHfaFn8) | 3.67 (3, 4, 4) | Piecewise few-spike neurons with time-dependent parameters approximate nonlinear activations in ANN-to-SNN conversion, with provable error-latency bounds. |
| 3 (110) | #48036 | [When Good Brain Predictors Make Bad Brain Controllers: A Regression Theory of Prediction–Control Dissociation](https://openreview.net/forum?id=yYLwwxqwDv) | 3.67 (4, 3, 4) | Ridge-regression theory shows prediction-optimal and control-optimal regularization obey different spectral conditions, so equally accurate encoders control neurons differently. |
| 4 (264) | #17819 | [Theta sweeps accelerate cognitive map learning by broadcasting information to unvisited regions](https://openreview.net/forum?id=AL9I4VjoM4) | 3.50 (4, 4, 3, 3) | Grid/place-cell network where theta sweeps broadcast sensory information to unvisited regions, with error-modulated Hebbian binding, speeding cognitive-map learning. |
| 5 (337) | #44237 | [Natural Gradient Learning in Predictive Coding through Lateral Circuits](https://openreview.net/forum?id=BEwseckHht) | 3.33 (3, 4, 3) | A lateral circuit learns activity correlations to implicitly invert the Fisher matrix, giving local natural-gradient learning in predictive coding. |
| 6 (375) | #16010 | [CLAG-SNN: Compact Local, Abstract Global for Efficient Spiking 3D Point Cloud Recognition](https://openreview.net/forum?id=QQ74GYa5tD) | 3.33 (3, 3, 4) | Spiking point-cloud network: structure-aware token compaction keeps local geometry; a nonlinearity-aware bottleneck abstracts global semantics. |
| 7 (383) | #23142 | [One-Step Latent-free EEG Generation with Mean-Field Flow](https://openreview.net/forum?id=vGevyOeTXG) | 3.33 (3, 4, 3) | One-step raw-EEG generator using mean-field token coupling over channels and time, trained with an average-velocity ℓ1 objective. |
| 8 (549) | #26891 | [Efficiency and robustness partition the solution space for memory in recurrent networks](https://openreview.net/forum?id=M9cjZO1K9C) | 3.33 (3, 4, 3) | Characterizes RNN solutions to a stimulus-recall task under weight efficiency, activity efficiency and noise robustness: low-rank versus transient-amplification motifs. |
| 9 (571) | #41362 | [From Imitation to Understanding: Emergent Expert Modelling in Social Learning](https://openreview.net/forum?id=vamTQUI0qS) | 3.33 (3, 4, 3) | Blind-corrected probes measure how much of a social learner's encoding of an expert is actual expert modelling, across four environments. |
| 10 (590) | #51521 | [Inferring Cognitive Profiles with Cognition-Conditioned Deep Inverse Planning](https://openreview.net/forum?id=VibyhbBwVK) | 3.33 (4, 3, 3) | Trains one hierarchical policy conditioned on cognitive parameters, then inverts it to infer people's subtasking strategies and cognitive profiles. |
| 11 (623) | #12183 | [Energy-Driven Higher-Order Graph State Evolution for Brain Network Analysis](https://openreview.net/forum?id=C7gKNd4S4R) | 3.33 (3, 4, 3) | Infers instance-specific latent factors whose group-wise energies drive dissipative node-state evolution on brain networks for disorder prediction. |
| 12 (712) | #43782 | [Multitask Interactions in Recurrent Dynamics across 100 Cognitive Tasks](https://openreview.net/forum?id=mHOeqQAdql) | 3.33 (3, 3, 4) | Trains hierarchical almost-linear RNNs jointly on 100 cognitive tasks to measure transfer and interference as nonlinearity varies. |
| 13 (728) | #48973 | [Pretrained Neuron-Level Representations Enable Across-Subject Zero-Shot Transfer of Neural Decoders](https://openreview.net/forum?id=JzDxBbSw8L) | 3.33 (3, 3, 4) | A pretrained neuron-level encoder replaces recording-specific parameters, letting spike-sorted decoders transfer zero-shot to unseen subjects. |
| 14 (743) | #51571 | [Cognitive Expert Language Models Better Align with the Corresponding Brain Systems](https://openreview.net/forum?id=MpWfEs4E4v) | 3.33 (3, 4, 3) | Domain-expert LLM variants (prompted or fine-tuned) best predict fMRI in the brain system matching their cognitive domain. |
| 15 (800) | #35252 | [In Search of Lost Time: Temporal Competence in Large Language Models](https://openreview.net/forum?id=iQG0FJJ0uk) | 3.33 (3, 3, 4) | Four evaluations trace LLM temporal competence from knowledge of time rules to duration prediction and time-cost-aware actions. |

## Themes & trends

- **Spiking networks are engineered for efficiency more than as brain models.** 12 of the top 60 are SNN method papers: provable ANN-to-SNN conversion (#60216), adaptive thresholds replacing normalization (#22725), softmax-free winner-take-all attention for spiking LMs (#38531), localized STBP to cut memory (#20021), spiking MoE routing (#6419), function-preserving growth (#13637), post-training compression (#14958), point-cloud SNNs (#16010, #16975), time-variant synapses for event vision (#20396), and structural regularization (#14742). #33455 asks when spike timing carries information beyond rates.
- **EEG foundation models are being diagnosed and patched.** Shortcut learning in masked pretraining (#1076), the frozen-probing gap (#20393), label-limited adaptation (#776), continual learning (#41469), multi-band discrete pretraining targets (#17812), language and covariate interfaces (#1567, #11245), and causal state-space models for unbounded streams (#48115).
- **Cross-subject and cross-animal transfer through learned shared input spaces.** Neuron-level representations for zero-shot spike-sorted decoding (#48973), signal-derived channel coordinates (#53344) and summary tokens (#55485) for intracranial EEG, learnable reflection equivariance for EEG (#54293), and a benchmark over 139 mice and 276 regions (#49953).
- **Generative models of neural signals with domain-specific fidelity checks.** One-step raw-EEG generation (#23142), a bipolar-montage failure hidden behind reported fidelity gains (#47155), and event-level fMRI-to-video reconstruction (#1490).
- **Methodology for comparing models with brains.** TSMD compares the spatial layout of tuning across individuals (#33909); #48036 shows held-out prediction accuracy does not fix control quality; #51571 measures domain-specific LLM–brain alignment; #41324 requires zero and shuffled controls for brain-conditioned LMs; #10915 proposes one information-theoretic scale for speech BCIs.
- **Task-trained and normative circuit models as hypotheses.** RNN solution spaces under efficiency and robustness constraints (#26891), 100-task multitask RNNs (#43782), ordinal schemas for sequence working memory (#52984), theta-sweep cognitive-map learning (#17819), and normative attention allocation under metabolic cost (#34834).

## Score signals

All numbers come from the pack's `fine_stats`. Differences are taken against the venue mean of 2.31; n is the tag count within this domain.

- **Domain level:** mean 2.276, 0.034 below the venue mean (2.31).
- **Own fine tags:** only `neuro-cog.other` is above the venue mean, at 2.402 (n=47, +0.092). `neuro-cog.brain` 2.279 (n=494, -0.031) and `neuro-cog.cognition` 2.184 (n=99, -0.126) are below.
- **Cognition is lower on average but strong at the very top:** it is on 6 of the top 15 and 8 of the top 60, while `brain` is on 9 of the top 15 and 46 of the top 60.
- **Secondary tags with n >= 5:** above is `evaluation.llm-bench` 2.569 (6). Below are `representation.ssl` 2.218 (20), `llm-agents.agents` 2.222 (6), `multimodal.audio-speech` 2.194 (12), `llm-core.finetune` 2.190 (7), `vision.low-level` 2.167 (6), `graphs.topology` 2.143 (7), and `science.health` 1.769 (9, the lowest).
- **Too small to read:** `theory.dynamics` 3.333 (1), `interpretability.mech-interp` 3.167 (2), `vision.three-d-vision` 2.889 (3), `llm-core.ssm` 2.667 (3).
- **Top 60:** means run 4.00–3.00. The top paper (#33909) is the only one at 4.00, and at least 26 of the 60 sit at 3.00.

## Taxonomy notes

**Possibly misclassified papers in the top 60**

| # | Current | Suggested | Reason |
|---:|---|---|---|
| #17074 | `neuro-cog.brain` | `llm-core.architecture` | CORTEX learns shared and specialized modules inside dense LLMs; it matched the word "cortex". |
| #17895 | `neuro-cog.brain` | `llm-core.finetune` (or `interpretability.steering`) | It consolidates in-context gains into LLM weights (editing, skill learning, steering); only the framing is biological. |
| #16555 | `neuro-cog.brain` | `vision.medical-imaging` (+ `science.pde`) | Diffusion-MRI fiber-orientation super-resolution with a spherical neural operator. |
| #44630 | fine `embodied.manipulation` | drop it; keep `neuro-cog.cognition` | "Manipulation" means psychological manipulation in a theory-of-mind benchmark, not robotics. |
| #44237 | fine `interpretability.mech-interp` | `optimization.optimizers` | It proposes a natural-gradient learning rule for predictive coding, not circuit interpretability. |
| #23142 | fine `theory.dynamics` | `diffusion.flow-matching` | One-step flow generator trained with an average-velocity objective. |
| #33909, #34834 | `neuro-cog.other` | `neuro-cog.brain`, `neuro-cog.cognition` | Neural-tuning topography and normative attention allocation fit the existing fines; the patterns miss these terms. |

**Proposed new fine categories** (T3 needs >= 25 papers; the pack shows only the top 60, so counts are unverified)

1. **Spiking Neural Networks & Neuromorphic Computing**: SNN neuron models, training, conversion, compression and architectures for efficient computation, separate from analysis of biological recordings. e.g. #60216, #22725, #38531, #33455, #20021, #13637 (12 SNN method papers in the top 60).
2. **Neural Signal Foundation Models**: pretraining, adaptation and cross-subject transfer of models on recorded EEG, iEEG or spike data. e.g. #20393, #1076, #776, #41469, #48973, #53344.
3. **Task-Trained & Normative Circuit Models**: networks trained or optimized on tasks to explain neural dynamics or behavior (RNN solution spaces, cognitive maps, working memory). e.g. #26891, #43782, #52984, #17819, #34834.
