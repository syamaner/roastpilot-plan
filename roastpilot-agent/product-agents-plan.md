# Product Agents Plan (E13/E14) — agents IN the product (ratified direction, D91)

**Status:** Direction RATIFIED by the operator, 12 Jul 2026 (D91 in plan.md §1).
Sequenced AFTER E12 (supervised hardware validation). Slice-level story
breakdown happens at each epic's kickoff, per the standard epic process.

**The thesis:** RoastPilot becomes an extended test case for AI agents in
products. Both epics productise workflows already proven manually in the
build process itself — E13 is the `add-bean-profile` CLI skill (URL → extracted
fields → per-origin priors → operator edits/accepts) turned into a product
surface; E14 is the operator+lead roast-analysis loop (tastings → parameter
changes, e.g. roasts 9/10 → El Durazno dev-target raise; the roast-13/14
FC-timing bracket → agent#521) turned into a product surface. The CLI-agent
workflows are the validated spec.

---

## 1. Sequencing (ratified)

E11 (Pi packaging) → E12 (hardware validation) → **E13 (Origin Research
Agent)** → **E14 (Roast Analysis & Recommendation Agent)**.

E13 first because: (a) it builds the propose → review-diff → operator-accepts
surface that E14's recommendations land on; (b) E14's substrate (rated roasts)
grows for free with every roast day in between; (c) the risk gradient — E13 is
read-only research feeding a form, E14 proposes roast-target changes; (d) E13's
core flow is already de-risked across five beans via the CLI skill.

## 2. Architecture invariants (extend the M1 set; must-block in review)

1. **The agent proposes; the operator disposes.** No research result or
   recommendation persists without an explicit operator accept — the
   profile-write mirror of "the advisor never receives MCP write tools".
2. **E14 scope guard: per-bean profile parameters ONLY.** Controller law and
   safety configuration (taper, ceiling guard, rate limits, safety bounds) are
   human-and-plan territory. The agent may cite controller behaviour in
   rationale; it may never propose changes to it.
3. **Out of the roast runtime.** Research/analysis runs as a separate service
   path with no coupling to the tick loop; the appliance degrades gracefully
   offline (a Pi in a kitchen must roast without the research agent).
4. **Typed boundaries with provenance.** Research/analysis output is typed
   (extends `BeanProfileInput`) with per-field provenance: source/evidence
   (URLs or run ids), confidence, rationale — the review UI shows WHY, not
   just values.

## 3. E13 — Origin Research Agent

**Goal:** operator supplies a supplier URL / pasted text (v1) or asks for
extended research (v1.1); the agent produces a prefilled new-origin profile
with per-field provenance; operator edits/accepts in the SPA.

Slices (thin, per PR hygiene; refined at kickoff):
- **S0 — research spike (ratified):** search frameworks and agentic-research
  approaches for the extended-research slice. Working assumption is
  PydanticAI + OpenRouter (the D5 pattern: provider as config, deterministic
  fake in tests) with a pluggable search provider; **if the spike concludes
  differently, the conclusion wins** (operator, 12 Jul). Deliverable: a
  decision row + the S3 design.
- **S1 — structured extraction:** URL/pasted text → `OriginResearchResult`
  (= `BeanProfileInput` + per-field provenance/confidence/rationale). The
  add-bean-profile skill's encoded domain rules (first-roast de-risk to ~13 %,
  washed-high-grown ~18 % eventual dev, the proven 195 drop line, charge
  bounds) become versioned prompt teaching — advisor-prompt discipline (D69's
  lesson: prompt versions are controlled experiments).
- **S2 — review/accept UX:** prefilled add-origin form, per-field provenance
  affordances, nothing persists without accept. **This surface is the E14
  contract** — build it as "review a proposed profile (new or delta)" from the
  start.
- **S3 — extended research (v1.1):** multi-source (origin agronomy, processing
  priors, altitude/varietal context) behind the same typed output; gated on S0.

## 4. E14 — Roast Analysis & Recommendation Agent

**Goal:** analyse the roast corpus (telemetry, decision traces, ambient
covariates, weights, ratings/tasting notes) and produce recommendations as
**structured per-field profile deltas with run-id evidence**, landing in E13's
review surface for per-field accept/reject.

**The hybrid, staged honestly (aligns with `ml-learning-loop-plan.md` / D42):**
- **Deterministic feature extraction now** — landmark-registered curve
  features (turning-point anchoring), RoR shapes, dev/drop/loss stats,
  per-origin aggregates, paired comparisons. NOT fitted models: at current
  n (14 roasts, 2–5 per origin) fitting would violate the program's rigour
  bar. The D42 doc's §2 methods are the feature library.
- **LLM synthesis over features + tasting notes** → proposed deltas, each with
  rationale + evidence (run ids), e.g. "dev target 16→17: runs X,Y rated
  grassy at temp-short drops".
- **Fitted ML later, planned NOW (operator, 12 Jul):** "once we have enough
  data, we move towards ML — so we should have the plans for that and ensure
  we capture valuable signals." The migration path is D42 §3 (per-bean target
  curves → tracking); E14's job today is (a) the recommendation surface and
  (b) **the signal capture that makes future fitting possible** (§5 below).
- **The flywheel is the design:** accepted recommendation → next roast →
  tasting → next analysis. Accept/reject decisions are themselves recorded
  signals (labels for future ML on recommendation quality).

## 5. Signal capture — URGENT NOW (pre-E13/E14 obligation; extends D42 §4)

The corpus obligations start immediately, not at E14 kickoff — every roast
without these signals is a lost label:

1. **Structured tasting entry** (agent repo issue filed 12 Jul): extend the
   rating flow with `tasted_at` (degassing offset — same-day tastings are
   systematically confounded, as the operator flagged on roast 13), brew
   method/grind context, and a small controlled attribute vocabulary
   (sweetness/acidity/body + defect tags: grassy, baked, bitter, flat).
   Free-text notes stay; the attributes make notes computable.
2. **Ratings discipline:** every roast rated, revisit-tastings recorded as
   additional entries (not overwrites) — the roast-13 "flat → grassy"
   refinement is exactly the multi-tasting signal shape.
3. **Persisted curve features:** the E14 feature extraction, run per-roast at
   completion and stored, so the feature history is stable even as the
   extractor evolves (version the extractor).
4. **Recommendation outcomes:** accepted/edited/rejected per field, with the
   subsequent roast's outcome linked.

## 6. Open items

- E13-S0 search-framework spike (the one ratified research task).
- Cloud boundary: extended research is a natural cloud feature; D29 deferred
  the profile library to cloud. S0 should state where research RUNS for the
  Pi appliance (on-device calls vs cloud service) and the offline posture.
- Experiment-design recommendations ("A/B c1 vs c3 on this bean") — operator
  is open to E14 proposing these, as a SEPARATE slice with its own review
  surface, after the profile-delta loop is proven.
- E13/E14 epic files in the agent repo at kickoff, per the standard process.
