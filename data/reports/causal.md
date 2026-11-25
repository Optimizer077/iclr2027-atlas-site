# Causality & Structured Reasoning — ICLR 2027 domain brief

Source: `reports/inputs/causal.json` only. Ratings are on the 1–4 scale; the venue-wide mean of means is 2.31.

## Snapshot

- **Papers:** 613
- **Mean rating:** 2.197 (venue mean 2.31, so -0.113)
- **Top 60 in the pack:** means run from 4.00 down to 3.00.

Fine categories sorted by count. Papers carry 1–3 fine tags, so counts sum to more than 613. Tags from other majors are secondary tags on papers whose major is `causal`. `causal.other` appears to mean that no own-major fine pattern matched.

| Fine category | Count | Mean rating |
|---|---:|---:|
| `causal.causal-inference` | 356 | 2.201 |
| `causal.formal` | 206 | 2.206 |
| `causal.other` | 56 | 2.141 |
| `llm-agents.agents` | 9 | 2.407 |
| `evaluation.llm-bench` | 9 | 2.185 |
| `rl.model-based` | 8 | 2.323 |
| `interpretability.xai` | 5 | 2.283 |
| `llm-agents.memory` | 5 | 1.867 |
| `applications.tabular` | 4 | 2.333 |
| `probabilistic.bayesian` | 4 | 2.417 |
| `llm-reasoning.cot` | 3 | 2.556 |
| `probabilistic.uq` | 3 | 2.111 |
| `multimodal.vlm` | 3 | 2.417 |
| `representation.ssl` | 3 | 2.111 |
| `alignment.sycophancy` | 3 | 2.111 |
| `llm-reasoning.self-improve` | 3 | 2.000 |
| `llm-reasoning.verifiers` | 3 | 1.889 |

41 further fine tags have count < 3 (53 tag assignments in total). They are omitted here and listed in the input pack.

## Top 15 papers

Rank is the position within this domain. The number in parentheses is the pack's venue-wide `rank` field.

| Rank | # | Title | Mean (ratings) | One-line idea |
|---:|---:|---|---|---|
| 1 (12) | #19064 | [LeanPolish: Verified Supervision for Lean Proof Compression](https://openreview.net/forum?id=yRmdNlDhJS) | 4.00 (4, 4, 4) | Symbolic Lean 4 pipeline releases 33,402 accepted local edits and 65,596 failed attempts to train proof-compression rankers and editors. |
| 2 (29) | #45074 | [Isomorphism Is Not Enough: An Agentic Audit of Verified Code Generation in Lean](https://openreview.net/forum?id=vpeBqISgks) | 4.00 (4, 4, 4) | Three agentic stacks audit the CLEVER Lean vericoding benchmark, finding arguably flawed reference specs in 80 of 161 entries. |
| 3 (100) | #16716 | [Orthogonal Learning for Conditional Geodesic Treatment Effects](https://openreview.net/forum?id=egSxU75OZ3) | 3.67 (4, 4, 3) | Neyman-orthogonal learner for CATEs on Riemannian-manifold outcomes via treatment-specific conditional Fréchet means and log-map error expansion. |
| 4 (101) | #20577 | [LLM-Evolved Domain-Independent Heuristics for Symbolic AI Planning](https://openreview.net/forum?id=1UMm9d7raH) | 3.67 (4, 3, 4) | LLMs mutate C++ planning heuristics inside a MAP-Elites archive keyed by informedness and speed, yielding domain-independent heuristics. |
| 5 (106) | #35128 | [From Tokens to Policy: Causal and Interpretable Heterogeneous Treatment Effects Identification](https://openreview.net/forum?id=rO8xykiPQP) | 3.67 (4, 4, 3) | Recasts HTE identification as Markov-blanket discovery on multimodal pre-treatment representations; iterative search has a provable selection guarantee. |
| 6 (114) | #61044 | [The Blessing of Linear Non-Gaussian Models: Powerful Independent Subspace Inference for Latent-Variable Causal Discovery](https://openreview.net/forum?id=FClCY3xuSm) | 3.67 (4, 4, 3) | A fixed linear operator whose kernel characterizes all independent directions unifies GIN/TIN tests for latent-variable linear non-Gaussian discovery. |
| 7 (129) | #42382 | [Learning When to Imitate: Counterfactual Value Modeling for On-Policy Distillation](https://openreview.net/forum?id=Bd47PXo8f6) | 3.67 (4, 4, 3) | Matched rollouts under the frozen student compare teacher versus student actions; a counterfactual value model decides when to imitate. |
| 8 (155) | #31517 | [Exact Probability Powering from Samples Alone at the Collision Scale](https://openreview.net/forum?id=KegWkHURAG) | 3.67 (3, 4, 4) | Collision-map coupling-from-the-past samples exactly proportional to p^k from samples alone; theorems verified in Lean 4. |
| 9 (389) | #26375 | [Verification-Guided Safety-Repair of Learned Controllers](https://openreview.net/forum?id=UIngjIIVGR) | 3.33 (4, 3, 3) | Turns failed multi-step reachability analyses into constraints, compiled into exact local circuit patches for differentiable weightless controllers. |
| 10 (450) | #26460 | [Aligning Faithfulness for Theory-Scale Autoformalization](https://openreview.net/forum?id=dLw1nYoV9l) | 3.33 (3, 3, 4) | Recasts autoformalization faithfulness as context-aware phrase-level align-then-label; FaithAlign has 460 items and 4,982 annotated links. |
| 11 (451) | #26606 | [Counterfactual Predictions in Scientific Emulators Without Controlled Experiments](https://openreview.net/forum?id=4WswWFZt6y) | 3.33 (3, 3, 4) | Fixes a queried input of a pretrained emulator, reroutes its variation through a known mechanistic pathway, fine-tunes on factual data. |
| 12 (463) | #36637 | [Memory as Program: Should Agents Run Their Experience Instead of Rereading It?](https://openreview.net/forum?id=dCO9l3C571) | 3.33 (3, 3, 4) | Expresses an agent's control policy as executable programs over stored experience that compute action values and enforce admissibility. |
| 13 (466) | #40478 | [Learning-Guided Formal Abstractions for Policy Synthesis in Stochastic Systems](https://openreview.net/forum?id=AWDwsugeho) | 3.33 (3, 3, 4) | An RL policy selects promising state-action regions; a sound set-valued MDP abstraction there yields policies with certified reach-avoid bounds. |
| 14 (572) | #41419 | [Efficient Inference for Distributional Treatment Effects with Partially Observed Outcomes](https://openreview.net/forum?id=w1qlNX8tP2) | 3.33 (3, 3, 4) | Cross-fitted estimator combines conditional CDFs with and without a fully observed surrogate to estimate distributional effects with uniform bands. |
| 15 (675) | #32404 | [DatalogBench: Evaluating Large Language Models on Text-to-Datalog Synthesis](https://openreview.net/forum?id=gQNIsKfOh5) | 3.33 (4, 3, 3) | 136 text-to-Datalog tasks graded by execution on held-out inputs against a mutation-validated oracle. |

## Themes & trends

- **Lean 4 is the shared verification substrate.** Proof compression from released edit logs (#19064), segment-level supervision for provers (#1447), synthetic proof-state data with adaptive beam size (#1469), MCTS implemented inside Lean (#20880), conjecture selection for prover training (#43603), and Mathlib semantic search (#23348). Papers outside formal methods also machine-check their core theorems in Lean (#31517, #26606).
- **Specifications and verified code as learning targets.** Autoformalized program specs rewarded via executable postconditions (#41359), theory-scale faithfulness evaluation for autoformalization (#26460), cost-aware agent orchestration for program verification (#25091), clause-compositional loop invariants (#29383), and execution-graded text-to-Datalog (#32404).
- **Audits of shortcuts in supervision and benchmarks.** #45074 finds arguably flawed reference specs in 80 of 161 CLEVER entries; #19064 shows first-success search supervision admits a goal-independent ranking rule; #2931 uses benchmark counterfactuals to catch harness overfitting; #23315 controls the observational view when comparing causal foundation models.
- **Learning combined with certification for control.** Reachability-guided controller repair compiled into circuit patches (#26375), RL-guided sound abstractions with certified reach-avoid bounds (#40478), and a study of which symbols help hybrid discrete–continuous planning (#35731).
- **Debiased effect estimation beyond the standard CATE.** Orthogonal learners for manifold-valued (#16716) and long-term (#15689) effects, regularized two-stage CATE (#56773), distributional effects with surrogate outcomes (#41419), proximal inference under hidden confounding (#1631, #43716, #33583), and causal foundation models whose group-level intervals undercover (#46974).
- **Latent-variable and scalable causal discovery.** Independent-subspace tests for linear non-Gaussian models (#61044), Hessian rank constraints (#22243), differentiable latent trees (#23449), PCMCI-style discovery at millions of variables (#22583), local Fisher information (#35270), and heterogeneous domains (#16393). LLMs enter as knowledge sources gated by a trust check (#61821) or as agents in an interactive SCM environment (#21848).

## Score signals

All numbers come from the pack's `fine_stats`. Differences are taken against the venue mean of 2.31; n is the tag count within this domain.

- **Domain level:** mean 2.197, 0.113 below the venue mean (2.31), the lowest of the four domains in this batch.
- **Own fine tags, all below the venue mean:** `causal.formal` 2.206 (n=206), `causal.causal-inference` 2.201 (n=356), `causal.other` 2.141 (n=56).
- **Formal leads at the top despite a similar mean:** `formal` is on 22 of the top 60 against 36 for `causal-inference`, but on 8 of the top 15, and both 4.00 papers (#19064, #45074) are `formal`.
- **Secondary tags with n >= 5 above the venue mean:** `llm-agents.agents` 2.407 (9, +0.097) and `rl.model-based` 2.323 (8, +0.013). **Below:** `interpretability.xai` 2.283 (5), `evaluation.llm-bench` 2.185 (9), `llm-agents.memory` 1.867 (5, the lowest).
- **Too small to read:** `time-series.ts-other` 2.733 (2), `representation.domain` 2.583 (2), `llm-reasoning.cot` 2.556 (3), and several single-paper tags at 3.0 or 1.0–1.333.
- **Top 60:** means run 4.00–3.00. At least 32 of the 60 have a mean of 3.00.

## Taxonomy notes

**Possibly misclassified papers in the top 60.** 12 of the top 60 mention "counterfactual" in the title, keywords, TL;DR or abstract opening, and the causal-inference fine pattern includes that word. Several of these papers use the term for matched rollouts in LLM or agent RL, not for causal identification.

| # | Current | Suggested | Reason |
|---:|---|---|---|
| #42382 | `causal.causal-inference` | `llm-efficiency.distillation` (+ `llm-reasoning`) | On-policy reasoning distillation. The counterfactual signal is a teacher-versus-student rollout comparison. |
| #33824 | `causal.causal-inference` | `llm-reasoning.rl-reasoning` | GRPO-trained routing between thinking and direct-answer modes. |
| #8515 | `causal.causal-inference` | `safety.jailbreak` | It learns LLM safety and over-refusal boundaries from paired safe and unsafe instructions. |
| #47880 | `causal.causal-inference` | `evaluation.eval-methods` | It removes an answer-length confound from the bits-per-byte LM metric. |
| #2931 | `causal.causal-inference` | `evaluation.eval-methods` | It detects benchmark-wide shortcuts during agent harness optimization. |
| #25052 | `causal.causal-inference` | `llm-agents.code` | RTL change localization; it matched "counterfactual supervision". |
| #36637 | `causal.formal` | `llm-agents.memory` | WebArena agent memory executed as programs; it matched "neuro-symbolic". |
| #31517 | `causal.formal` | `probabilistic.sampling` | An exact sampling algorithm; Lean is used only to check its theorems. |
| #20577 | `causal.other` | `causal.formal` | LLM-evolved heuristics for symbolic planning (a fine fix within the major). |

**Proposed new fine categories** (T3 needs >= 25 papers; the pack shows only the top 60, so counts are unverified)

1. **Treatment-Effect Estimation**: estimators and inference for average, conditional, distributional or long-term effects (orthogonal, proximal, IV), split from discovery. e.g. #16716, #41419, #56773, #1631, #43716, #15689, #33583.
2. **Causal Discovery & Latent Structure**: recovering causal graphs or latent causal variables from data, including LLM-assisted discovery. e.g. #61044, #16393, #22243, #22583, #23449, #35270, #61821.
3. **Program & Controller Verification**: specifications, invariants, verified code and certified or repaired controllers, split from theorem proving in `causal.formal`. e.g. #45074, #41359, #25091, #29383, #26375, #40478.
