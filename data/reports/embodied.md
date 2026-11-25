# Embodied AI — ICLR 2027 domain brief

## Snapshot

1,721 papers; mean rating 2.416; 691 papers (mean ≥ 2.67). Standard deviations below use the population formula.

| Fine category | Count | Mean rating |
|---|---:|---:|
| embodied.manipulation | 713 | 2.445 |
| embodied.vla | 555 | 2.410 |
| embodied.navigation | 427 | 2.402 |
| embodied.world-models | 399 | 2.375 |
| rl.model-based | 263 | 2.367 |
| embodied.driving | 229 | 2.382 |
| embodied.other | 50 | 2.521 |
| evaluation.llm-bench | 39 | 2.494 |
| llm-agents.memory | 34 | 2.382 |
| multimodal.vlm | 28 | 2.502 |
| rl.deep-rl | 22 | 2.451 |
| llm-reasoning.self-improve | 20 | 2.417 |
| vision.remote-sensing | 17 | 2.475 |
| causal.causal-inference | 15 | 2.311 |
| representation.ssl | 12 | 2.339 |
| llm-agents.agents | 12 | 2.242 |
| vision.three-d-vision | 11 | 2.303 |
| llm-efficiency.quantization | 9 | 2.315 |
| vision.detection-seg | 9 | 2.296 |
| llm-efficiency.pruning | 8 | 2.250 |
| representation.continual | 8 | 2.667 |
| probabilistic.uq | 7 | 2.476 |
| multimodal.audio-speech | 6 | 2.539 |
| rl.exploration | 6 | 2.542 |
| llm-reasoning.test-time | 6 | 2.444 |
| diffusion.flow-matching | 6 | 2.278 |
| representation.domain | 6 | 2.236 |
| neuro-cog.brain | 6 | 2.097 |
| llm-reasoning.cot | 5 | 2.400 |
| time-series.forecasting | 5 | 2.400 |
| rl.offline | 5 | 2.000 |
| llm-core.data | 5 | 2.267 |
| alignment.reward-modeling | 4 | 2.500 |
| gen-vision.video | 4 | 2.833 |
| graphs.gnn | 4 | 2.083 |
| llm-core.finetune | 4 | 2.354 |
| llm-reasoning.verifiers | 3 | 2.667 |
| diffusion.discrete | 3 | 2.417 |
| llm-agents.multi-agent | 3 | 2.167 |
| gen-vision.ar-visual | 3 | 2.306 |
| neuro-cog.cognition | 3 | 1.778 |
| probabilistic.bayesian | 2 | 2.667 |
| diffusion.architecture | 2 | 2.667 |
| llm-core.icl | 2 | 2.500 |
| gen-vision.t2i | 2 | 2.333 |
| gen-vision.three-d | 2 | 2.667 |
| llm-reasoning.rl-reasoning | 2 | 2.667 |
| science.pde | 2 | 2.833 |
| safety.jailbreak | 2 | 2.667 |
| llm-core.moe | 2 | 2.667 |
| multimodal.vlm-reasoning | 2 | 2.667 |
| vision.vision-backbones | 2 | 2.500 |
| alignment.preference | 2 | 2.333 |
| rl.marl | 2 | 2.333 |
| graphs.topology | 2 | 2.000 |
| evaluation.datasets | 2 | 2.000 |
| evaluation.eval-methods | 1 | 3.000 |
| graphs.equivariance | 1 | 3.000 |
| rl.rl-theory | 1 | 3.000 |
| optimization.federated | 1 | 3.000 |
| alignment.sycophancy | 1 | 3.000 |
| probabilistic.sampling | 1 | 2.667 |
| safety.adversarial | 1 | 2.667 |
| multimodal.vlm-hallucination | 1 | 2.667 |
| science.molecules | 1 | 2.333 |
| llm-efficiency.kv-cache | 1 | 2.333 |
| gen-vision.gan-vae | 1 | 2.333 |
| safety.unlearning | 1 | 2.333 |
| vision.low-level | 1 | 2.333 |
| science.genomics | 1 | 2.333 |
| theory.online | 1 | 2.000 |
| diffusion.sampling | 1 | 2.000 |
| interpretability.sae | 1 | 2.000 |
| diffusion.inverse | 1 | 1.667 |
| interpretability.probing | 1 | 1.333 |
| llm-efficiency.speculative | 1 | 1.333 |

## Top 15 papers

| Rank | # | Title | Mean (individual ratings); n; std | One-line idea |
|---:|---:|---|---|---|
| 70 | 23021 | [Sensor Generalist Policies for Fast Optimization of Robotic Sensor Suites](https://openreview.net/forum?id=CjVqkoY5YQ) | 3.667 (4, 4, 3); n=3; std=0.471 | Trains one policy across sensor configurations to amortize evaluation and jointly search sensors and control. |
| 87 | 10380 | [FlowWAM: Optical Flow as a Unified Action Representation for World Action Models](https://openreview.net/forum?id=JH9BScjevX) | 3.667 (3, 4, 4); n=3; std=0.471 | Models optical flow as a parallel video stream for action prediction and future-video conditioning. |
| 120 | 22041 | [Do Robotic World Models Really Follow Actions? Diagnosing and Aligning Action-Conditioned Generation for Policy Learning](https://openreview.net/forum?id=7J91hd103b) | 3.667 (4, 3, 4); n=3; std=0.471 | Measures off-expert action following, then aligns intermediate representations under action interventions. |
| 149 | 23458 | [GeoWRA: Geometric Latent World Residual Action Models](https://openreview.net/forum?id=PCE6xKHWVO) | 3.667 (3, 4, 4); n=3; std=0.471 | Couples latent actions and predicted futures bidirectionally through bounded residuals and hyperbolic geometry. |
| 158 | 32275 | [When the Gate Does Not Gate: Bounded Memory Injection with Normalized Direction for Vision-Language-Action Models](https://openreview.net/forum?id=2Hr4PyIsGt) | 3.667 (4, 4, 3); n=3; std=0.471 | Orthogonalizes and normalizes memory updates so gates control a fixed injection-magnitude budget. |
| 169 | 41399 | [Dex-One2Many: Learning Dexterous Manipulation from a Single Human Demonstration](https://openreview.net/forum?id=mFld0i4oyi) | 3.667 (3, 4, 4); n=3; std=0.471 | Converts one video into sequential scene graphs that generate reset states and dense RL rewards. |
| 174 | 45690 | [ForagerSim: Evaluating Embodied Map-Based Reasoning in Large-Scale Dynamic Worlds](https://openreview.net/forum?id=KH9izZNOKI) | 3.667 (4, 4, 3); n=3; std=0.471 | Varies sensing, scale, topology, dynamics, and tasks to isolate map-based reasoning demands. |
| 213 | 28544 | [Beyond Validation Loss: Coverage and Reliability Dynamics in Robot Policy Pretraining](https://openreview.net/forum?id=XQ4fu2Go1z) | 3.667 (4, 4, 3); n=3; std=0.471 | Uses closed-loop pass@k to guide checkpoint selection and generative augmentation for posttraining. |
| 253 | 13675 | [WBench: A Comprehensive Multi-turn Benchmark for Interactive World Model Evaluation](https://openreview.net/forum?id=PQdqz0vaG5) | 3.667 (4, 4, 3); n=3; std=0.471 | Scores multi-turn generated worlds on quality, adherence, consistency, and physics using specialist metrics. |
| 299 | 20276 | [Revisiting Open-Loop Execution in Robotics: Toward Reactive, Higher-Performing Policies](https://openreview.net/forum?id=E8kCaahqbf) | 3.333 (4, 2, 4); n=3; std=0.943 | Attributes action-chunk benefits to non-Markovian demonstrations and favors long-context reactive policies. |
| 333 | 36301 | [1Step-WAM: You World Action Model but Faster using One Step Action Generation](https://openreview.net/forum?id=VqgFgmH3fn) | 3.333 (3, 4, 3); n=3; std=0.471 | Calibrates first-step velocities and bandwidth-constrained decoding to replace iterative action denoising. |
| 350 | 47193 | [BeJEPA: A Goal-Conditioned Humanoid Behavior World Model via Unsupervised RL](https://openreview.net/forum?id=0Krw9xEhhn) | 3.333 (2, 4, 4); n=3; std=0.943 | Combines next-state and goal-conditioned successor embeddings to improve control without long imagined rollouts. |
| 362 | 8309 | [Steering Generative Robot Policies with Optimal Transport Maps](https://openreview.net/forum?id=Qn14WaPywU) | 3.333 (3, 4, 3); n=3; std=0.471 | Transports frozen policy samples toward virtual high-reward trajectories with a relaxed target marginal. |
| 430 | 9491 | [RoboPhyScan: A Large-Scale Sim-Ready Real-World Object Dataset with Manipulation Annotations](https://openreview.net/forum?id=XfHOVkE9yo) | 3.333 (3, 3, 4); n=3; std=0.471 | Aligns scanned purchasable objects with articulation, physical properties, affordances, and grasp annotations. |
| 489 | 305 | [Residual Modeling Closes the Regression and Generative Policy Gap in Robot Learning](https://openreview.net/forum?id=fKq8qGzBwD) | 3.333 (4, 3, 3); n=3; std=0.471 | Learns input-dependent Student-t residual scales to reduce heavy-tail influence in one-pass action regression. |

## Themes & trends

- World and action models share representations directly: #10380 encodes actions as optical-flow video, while #23458 feeds latent actions into prediction and returns bounded world residuals to action generation.
- Action fidelity is now an evaluation target. #22041 tests off-expert trajectories and action interventions, whereas #13675 scores multi-turn interaction adherence alongside consistency and physics.
- Memory and action chunking receive controlled revisions. #32275 makes memory-gate magnitude identifiable, and #20276 ties open-loop benefits to non-Markovian demonstrations rather than compounding error alone.
- Human demonstrations become task structure instead of motion templates. #41399 extracts scene graphs for RL resets and rewards; #59168 reconstructs physically faithful dexterous demonstrations from egocentric video.
- Inference and regression challenge iterative generative control: #36301 collapses denoising to one calibrated step, #8309 transports frozen action distributions at inference, and #305 models heavy-tailed residuals directly.

## Score signals

All six native fine categories exceed the venue-wide mean of 2.31: other at 2.521 (50), manipulation at 2.445 (713), vla at 2.410 (555), navigation at 2.402 (427), driving at 2.382 (229), and world-models at 2.375 (399). Rl.model-based, a large cross tag, scores 2.367 across 263 papers.

Other above-mean cross tags with at least eight papers include multimodal.vlm at 2.502 (28), evaluation.llm-bench at 2.494 (39), vision.remote-sensing at 2.475 (17), rl.deep-rl at 2.451 (22), llm-reasoning.self-improve at 2.417 (20), representation.continual at 2.667 (8), and representation.ssl at 2.339 (12). Below 2.31 are llm-agents.agents at 2.242 (12), vision.three-d-vision at 2.303 (11), vision.detection-seg at 2.296 (9), and llm-efficiency.pruning at 2.250 (8).

## Taxonomy notes

- #36301, #7105, and #13937 → embodied/world-models: each title explicitly concerns world-action models rather than embodied.other.
- #19678 → embodied/driving: grounded pretraining for collaborative V2X perception is more specific than embodied.other.
- #37426 → embodied/manipulation: RL-based inverse kinematics for robot arms is a manipulation method.
- #50357 → science/pde: the paper presents a peridynamics-inspired neural simulator for fracture dynamics.
- #28561 → time-series/dynamics: its research object is mechanism consistency in time-series world models.
- No new fine category proposed; the pack does not establish 25-paper support for any additional tag.
