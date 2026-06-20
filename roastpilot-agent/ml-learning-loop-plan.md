# ML Learning-Loop & Fine-Tune Plan (proposed D42) — §7 detailed design

**Status:** RATIFIED as **D42** (operator, 20 Jun 2026); now plan.md §1 D42. Over-done line
set at drop > 197 °C with the §7.1 seed = ≤195 °C core + 196–197 °C soft (operator: good roasts
occur at 196–197). Expands plan §7 (the learning
loop → anticipatory per-bean control, and the roast logs as a fine-tune corpus) into a
concrete, methodology-grounded design. Ratify into `plan.md` §1 as **D42** once accepted.

**Grounded in three parallel due-diligence streams (20 Jun):**
1. **Empirical** — classification + literature reconciliation on our 47 `.alog` roasts
   (`roastpilot-agent` PR #290, `docs/research/hottop-alog-classification-2026-06-20.md`).
2. **Origin priors** — cited per-origin processing / altitude / density for our ~10 origins.
3. **ML methodology** — a verified deep-research report (24/25 claims confirmed) on
   few-shot curve learning, repeated-batch tracking control, and learning-from-logs.

The operator's offline Hottop findings (Roast Rebels recipes, Rao DTR, the probe quirk,
the `.alog` classifier) are the domain input this builds on.

---

## 0. The headline: the research VALIDATES §7.1's existing shape

§7.1 already said *"the deterministic rules are the degenerate (no-plan) case; a learning
loop produces a per-bean target plan the controller tracks anticipatorily."* The ML
methodology research lands on exactly that as the **responsibly-buildable** path, and names
the methods. Nothing here is a redesign; it is §7 made concrete and honestly staged.

A terminology guard, because we now have **two** "reference curves":
- **#223/#275 reference curve (D40)** = the *in-progress roast's own* telemetry to time t
  (what the post-FC LLM sees). Already scoped, first-roast.
- **§7.1 target curve (this doc)** = a *learned per-bean ideal* the controller tracks
  anticipatorily. The subject below. Keep them distinct in code + prose.

---

## 1. Our data reality (empirical, PR #290) — what the learning loop must fit

- **47 roasts, single operator, single Hottop.** At the **operator's over-done line of
  drop > 197 °C** (decided 20 Jun): **17 medium / 10 dark / 20 over-dark** (the earlier >200 °C
  proxy gave 6 over-dark; 14 roasts in (197,200] flip). The filename-labelled `kona_3_dark`
  classified dark (sanity-check passed).
- **Known-good medium reference set (the §7.1 seed) = 17 roasts**, all mapping to fixtures
  `artisan-01…22`, second-crack-not-reached, drop 189.0–196.3 °C, **DTR median 16.6 %**
  (range 12.4–20.7 %). *Boundary caveat:* the 197 line sits in the densest drop-BT bin
  (196–198 °C), so the medium/over-dark split is sensitive there (`artisan-22` at 196.3 stays
  in; several 197–198 flip out). A cleaner ≤195 °C band would give a less boundary-sensitive
  seed for the reference curves — operator's call before §7.1 prototyping.
- **DTR median 15.3 %** (IQR 13.6–18.6 %), **below Rao's 20–25 %** — our target is *our*
  profile (~15 %), not the textbook band. (Confirms D33/D36: anchor to profile, not
  published numbers.)
- **Probe offset confirmed:** FC display BT median **178 °C**, drop **197 °C** — the
  ~20–30 °C-low cluster. Per-roaster calibration is mandatory; we already use the profile
  band, not absolutes.
- **No RoR crash (0/47):** a managed declining shape, not a crash (and the integer-resolution
  probe would mask a shallow one). Confirms #229 → crash-detection stays dropped.
- **No bean metadata in the files** (`beans`/`organization` empty); origin is recoverable
  from filenames, processing/density/altitude only from the cited priors (flagged ASSUMED).
- 28/47 map to the existing `artisan-NN` fixtures.

**Resolved (operator, 20 Jun): the over-done line is drop > 197 °C** → the known-good medium
seed is the 17 roasts above. One residual choice flagged above: a tighter ≤195 °C band for a
less boundary-sensitive seed.

---

## 2. Buildable NOW — the per-bean target curve + tracking (§7.1)

### 2.1 Represent the target as a *landmark-registered* reference curve
**Do not naively average roasts across clock time.** Cross-sectional averaging of
time-varying trajectories is a documented failure mode — the mean "resembles no real roast
and distorts the dynamics" (Müller, FDA, UC Davis). **Register first:** align each known-good
roast on its phase landmarks (CHARGE → DRY-END → FCs → DROP) via landmark time-warping, *then*
average. Our roasts already carry these event markers, so registration is immediately
applicable.

Add an **uncertainty band**, not just a point curve: Functional Data Analysis (sparse-FPCA /
PACE, designed for *sparse, few* longitudinal samples — matches our ~5 s, tiny-N data) or a
Gaussian-process curve. The band is what tells the controller how much latitude it has at
each phase.

### 2.2 Pool across origins — carefully
Per-origin N is tiny (some origins 1–4 roasts). Borrow strength via **Bayesian hierarchical
partial pooling** or a **multi-task GP**: an origin with few roasts shrinks toward the
population curve; one with many approaches its own mean (a precision-weighted compromise).
**Caveat (verified):** multi-task sharing helps **only for genuinely correlated origins**
(the ρ→1 limit; one "free lunch" claim was adversarially refuted). So **learn** the
inter-origin correlations rather than assume uniform sharing — and the priors stream gives us
the structure to expect (dense washed Taiwan/Jamaica/CR vs soft Brazil/Cuba vs Vietnam
robusta vs wet-hulled Indonesia). **First check the inter-origin correlation empirically on
the 47** before committing to pooling vs largely-per-origin.

### 2.3 Track it anticipatorily (the controller's job — advisory-only preserved)
The controller tracks the target as **deviation-from-reference**; the ML only supplies the
target/setpoints, never actuation.
- **Cross-roast setpoint refinement:** Iterative Learning Control / Terminal-ILC improves the
  input cycle-to-cycle from the previous batch's terminal error (`u[k]=u[k-1]+K(y_d−y_T[k-1])`);
  Batch-MPC / ILMPC use stored past-batch info + live measurements (shown *essential*, not
  just helpful, for tracking under model error). Roasting is a repeated batch → this family
  fits. **ILC is the least model-dependent**; validity needs a **repeatable charge/initial
  state** (verify our roasts satisfy this).
- **Anticipatory action under lag:** classical static feedforward *degrades* exactly in the
  lag-dominated regime. Use **model-based feedforward** — an inverse machine model, or a
  GPC-style future-disturbance predictor — to act before the deviation appears. This is the
  principled basis for the late-Maillard anticipatory heat-trim (D36/#228). Note: the
  MPC-family needs a process model; ILC does not.
- **Degenerate case = the deterministic rules** (D35 #222) when no learned plan exists.

### 2.4 Simplest possible start
**Retrieval / nearest-neighbour over past roasts** (match the current roast to the closest
historical good roast of that bean and surface its trajectory) is the lowest-complexity entry
and is small-N-safe — worth a prototype before the full FDA/GP machinery.

---

## 3. Aspirational LATER — the fine-tuned control brain (§7.2)

Honestly far off at N=47:
- **Fine-tuned end-to-end policy / offline RL / RL-tuned MPC** is data- and
  simulator-hungry: the cited reactor work needed **500+ training episodes against a physics
  simulator** we do not have. "Collect orders of magnitude more data and/or build a simulator
  first."
- **Behavioural cloning** is the small-N-friendliest *learned policy*, but suffers
  compounding error over long (multi-minute) horizons — escapable only under a **controlled
  payoff range + a simple policy class** (informs corpus/policy design, not a small-N promise).
- **Outcome labels unlock the learned objective:** with cup-quality / preference labels you
  can do preference / reward modelling (the RLHF-style path). Without them you can only learn
  "what we did", not "what was good" — §7.2's stated gap.

**The swappable control-brain interface (rules → LLM → fine-tuned model) stays the
architecture;** §7.2 is a later slot-in, not a near-term build.

---

## 3b. External public data — a registration-only supplement, not a shortcut (researched 20 Jun)

Can we augment N=47 with public roast curves? **Modestly, and only as registered shape.**
- **Best lead: Roastetta** (~2,400 roasts, an explicit Hottop-2K+ filter, BT/ET + charge/
  dry-end/FC/drop landmarks, JSON-profile download) — but the *Hottop-specific* count is
  **unverified** (the sample skewed Kaleido) and there's **no stated reuse licence**; verify
  volume + export path by hand before relying on it.
- **Crumbs:** Sweet Maria's (`.alog`/CSV, but Probat/Popper), `jacciz` (~4 Bullet `.alog`, °F).
- **The gold is not public:** curves paired with cup scores effectively don't exist openly
  (CQI ~1,340 and an FT-NIR set have scores but **no curves**; the one source joining BT
  curves to ~33,338 cupping ratings — a TU Wien thesis — is **proprietary/unreleased**).
- **Hard caveat:** every accessible source is a **different machine** (different probe
  calibration → only landmark-*registered* shape transfers, never absolute temps) or
  **unlabelled**. So external data can add curve-shape variety for *generalisation*, kept
  **strictly separate** from our single-machine reference curves; it cannot supply same-machine
  temps or the outcome labels.

**Verdict:** our own cup-rated roasts remain the higher-quality core; **there is no public path
to a labelled fine-tune corpus today** (reinforces §3 — §7.2 depends on growing OUR labelled
set). Roastetta-after-verification is an optional registration-only generalisation supplement,
not a near-term priority.

---

## 4. What this makes URGENT now — the corpus/data design (the load-bearing items)

The methods above are only as good as the data we start logging *today*:
1. **Outcome labels — the INFRASTRUCTURE ALREADY EXISTS (correction, 20 Jun).** The harness
   already persists `operator_rating` (1–5) + `operator_notes` with a `cloud_sync_status`
   field (cloud-handoff ready, D29), exposed via `POST /api/roasts/{id}/rating` and the
   `RoastRating` stars+notes widget on the detail page. So the gap is **not** the mechanism —
   it is (a) the *habit* (rate every roast through the system, per operator, until the cloud
   feedback brain exists) and (b) deciding the label modality later (pairwise vs absolute vs a
   drop-proxy). The operator IS the label source until D29. *Start rating now.*
2. **Bean metadata — the real capture gap (the #290 finding).** Origin / processing / density /
   altitude are absent from the logs. **The Start Roast form must gain `processing` + altitude/
   density** (it has identity + targets but not these two ML-critical axes); the past 47 stay
   ASSUMED (filenames give origin, priors give flagged defaults, operator can't retro-correct).
   New roasts: operator enters it accurately. (Form-revision proposal pairs with #273.)
3. **Consistent event markers** (CHARGE/DRY/FCs/DROP) — required for landmark registration;
   already mostly present, formalise it.
4. **Repeatable charge state** — log charge temp/mass/ambient so ILC's repeated-batch
   assumption is checkable (and so cross-roast learning is sound).
5. **Per-roaster calibration** — already handled (profile band, not absolute temps); keep.

This is the same asset as the §C test harness: one growing, labelled, registered roast corpus
serves both the learning loop and the eventual fine-tune.

---

## 5. Open questions to resolve empirically on our 47 (cheap, no new roasts)
1. **Inter-origin correlation** — does pooling across origins actually help, or is it
   largely per-origin with weak shrinkage to a global mean? (Decides §2.2.)
2. **ILC validity** — do our roasts satisfy the repeated-batch assumption (charge/ambient
   invariance), or does batch-to-batch variation break it?
3. **Min useful labelled set + modality** — how many labels, and which kind, give the most
   signal per labelled roast?
4. **Offline-eval scheme** — leave-one-roast-out with the registration done *inside* each
   fold; what trajectory-distance metric, and how to avoid the "agreement-with-known-good ≠
   optimal" + single-operator-confound traps (the recurring eval lesson: a perfect tiny-set
   score is a warning).

---

## 6. Honest caveats (from the research itself)
- **Application leap:** the methods come from adjacent domains (FDA growth curves, batch
  reactors, thermoforming, robotics offline-RL) — the batch-reactor *temperature-trajectory*
  tracking is the closest, but no source is coffee-specific. The roast analogy is our
  engineering framing, sound but not source-asserted.
- **Asymptotic vs finite-sample:** the pooling limit (ρ→1), the offline-RL-beats-BC
  conditions, and the horizon-independent-BC result are large-sample characterisations — they
  direct design, not guarantee anything at N=47.
- **Single operator / single machine** confounds everything; treat conclusions as
  this-roaster-specific until validated more broadly.

---

## 7. Recommended sequencing
1. **Operator: set the over-done line (196 vs 200)** → fixes the known-good medium set (§1).
2. **Prototype the registered reference curve** on the known-good mediums (landmark-register
   → mean + band), per origin where N allows, with the inter-origin correlation check (§2.1–2.2,
   §5.1). Cheap, no new roasts, on the existing 47. *(A natural follow-on to #290.)*
3. **Start the corpus upgrades now** (§4): outcome labels + bean metadata + repeatable-charge
   logging — these gate everything later and cost nothing but discipline.
4. **Defer** the tracking-control build (ILC/feedforward) until the first-roast control loop
   (#223–#276) ships and there's a learned target to track; defer the fine-tune (§3) until the
   labelled corpus is orders of magnitude larger.

Net: **build the registered reference-curve + retrieval now, design the labelled corpus now,
and keep the fine-tune as a later slot-in** — exactly §7.1's degenerate-case-first shape, now
with named methods and an honest data-scale verdict.

## Sources
Per-bean curve / pooling: Müller FDA (anson.ucdavis.edu/~mueller/chapter9.pdf); Bonilla/Chai/
Williams multi-task GP (NIPS 2007); Vasishth hierarchical shrinkage; Ashton & Sollich (ρ→1
limit, NIPS 2012). Tracking: Lee et al. Batch-MPC (AIChE 1999); Terminal-ILC (arXiv:1703.09789);
predictive feedforward (IFAC 2017); LV-ILMPC (Control Eng. Practice 2020); RL-tuned MPC (ACS
Omega 2025). Learning-from-logs: Kumar et al. (ICLR 2022); Foster/Block/Misra (NeurIPS 2024).
Commercial: Cropster bean-curve prediction. Plus the in-house empirical (#290) + origin priors.
