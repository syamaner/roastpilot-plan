# D238 — Qualified HUMAN development timing

Status: owner-approved direction, implementation and qualification pending. This prepared Plan branch is not Plan main. The owner approved the exact reviewed timing proposal SHA-256 `5cd79e500e316fcecebac4440147f837b7645c5af93477e8e246718ad1ba4b2b` on 18 November 2026 and authorised descendant contracts and implementation under standing authority. Authority relay: https://github.com/syamaner/roastpilot-agent/issues/1078#issuecomment-6991884744

D231–D237 remain separately prepared A1 amendments; D238 does not claim their publication on this base. Governing source base for this preparation: Plan `93806f4c1049b86b21c3309a5f3cba3982708b98`.

## Owner brief and qualifications

# Timing policy for the next HUMAN roast — owner decision

The admission correction is progressing independently. This decision concerns how the controller proves development percentage and behaves when that proof is unavailable.

Recommended direction:

1. Use the producer's own accepted human FC, charge and qualified BT acquisition timing. Do not reconstruct a local Agent timestamp from a delayed reply or use rounded display DTR for control.
2. Admit ordinary recipe completion only when conservative timing evidence proves the full minimum development target and the temperature target together. Retain the existing minimum-target meaning; do not invent a development window. An upper limit at physical drop needs a separately qualified latency bound.
3. If timing required by an already admitted recipe becomes unusable, enter existing operator recovery/containment with a visible reason. Do not silently continue routine heating, automatically drop, or replay a human mark. A valid below-target sample still permits normal recipe progression under existing policy.
4. A recovered human mark requires explicit operator reconciliation before it can affect control. Existing emergency access, 196°C protection, one-drop ownership, restart restrictions and human override remain in force.

Approval would adopt this timing/containment direction and permit formal implementation contracts within it under the standing approval. It would not select new numerical thresholds or age tolerances, bypass qualification, enable Hottop, deploy software or authorise hardware actions.

This is a material operational-timing and recovery-policy decision, so it is outside the lead's authority to approve routine descendants. The existing standing approval explicitly reserves those decisions to the owner.

Independent high-effort Claude safety review PASSed this direction after corrections. This is a design review only, not implementation or hardware qualification. Parent verified the immutable packet audit and exact arithmetic script/result hashes. Synthetic checks include 729 points, 2,187 translation checks, equality and rejection cases; their scope is arithmetic only.

Exact reviewed proposal: the exact direction reproduced below, SHA-256 `5cd79e500e316fcecebac4440147f837b7645c5af93477e8e246718ad1ba4b2b`. independent review retained in Career at 50b940d.

Clarifications retained from the review: an absent human FC mark is expected before FC and does not itself invoke this new timing-loss disposition. The existing missing/late-FC protection remains; this direction creates no new pre-FC deadline. The implementation contract must prove the selected existing containment action and actual heat/fan outcome; neither a recovery label nor a command response establishes physical heat removal. A development window narrower than its qualified uncertainty cannot qualify. Emergency intent remains independent of the proposed timing/session evidence; its existing dispatch constraints remain.

Admission coordination: C1 remains owned by the roast lead, with its architecture-review corrections supplied under standing authority. OQ-2 does not gate C1. No new implementation or hardware actions have been performed by this proposal.


## Exact reviewed direction

The following text retains its pre-approval proposal wording as provenance. The status above supersedes only its pending-owner-direction statements, not its implementation/qualification restrictions.

# Proposed joint-temperature and development-time evidence

Status: design proposal for independent review and owner decision, not an implementation contract. No configuration, threshold, dispatch or operational timestamp is changed.

## Objective and authority

The owner wants controller-managed heat/fan and routine drop, with human override, reaching the target BT within the target human-marked development percentage without excessive darkening. Human first crack remains canonical; model events are diagnostic. Existing emergency and inclusive 196°C protection retain priority. This proposal resolves timing evidence only; it supplies no heat/fan policy or assurance that both targets are achievable.

C1 launch isolation can proceed independently. C3's reconciled marks remain history-only under its current contract. Adopting this proposal would require explicit owner agreement to new operational timing semantics and a separate producer/consumer contract. Standing authority cannot silently adopt it.

## Confirmed constraints from supplied receipts

1. Current displayed DTR rounds durations and uses multiple clock reads. A displayed 14.000% can correspond to less than 14% at the sampled instant.
2. Response elapsed time is acquired after the driver reading and runtime work. The same response envelope is not proof that BT and DTR were sampled together.
3. An Agent request/response bracket does not uniquely map a canonical producer event to an Agent monotonic origin. Delayed readback must not silently move the human event to local receipt time.
4. The current producer has canonical charge and human FC in its own session domain, but the existing receipts do not qualify a joint BT observation timestamp or its numeric uncertainty.

## Recommended interface direction

Use a versioned, atomic producer evidence record, built from one coherent current-session state. It carries producer/session identity, observation sequence, canonical charge and accepted human-mark identities and times, valid BT/ET, their qualified observation times, and the BT acquisition-time interval in the same producer-session clock domain. Each charge, FC, BT and ET time carries the same qualified producer clock-epoch identifier; session identity alone is insufficient. A restored session with a new clock epoch is rejected. Qualify monotonic-clock behaviour across host suspend; do not infer elapsed roast time across an unqualified discontinuity. Preserve the raw evidence and distinguish it from display metrics.

The contract must specify whether a temperature timestamp means device acquisition or host observation. A timestamp added at serialization is insufficient. S is specifically the BT acquisition instant, never response serialization or the later decision time. If the device cannot timestamp acquisition, qualify the actual age bound of its accepted sample and carry that bound: Slo is no later than host-observation lower bound minus the maximum proved acquisition age. Also prove Shi. Do not label host reception as physical acquisition. Rebuild these bounds for each fresh sample; do not reuse a prior sample under a later timestamp. Producer changes are separate scope, not implicitly authorised C work.

Use explicit closed bounds for each timing operand: C in [Clo, Chi], F in [Flo, Fhi], S in [Slo, Shi]. Bounds must come from proved serialization, clock and observation semantics; no arbitrary 1 ms subtraction or guessed maximum latency. Reject booleans, numeric strings, non-finite/negative values, impossible ordering, zero duration, unknown schema and unsupported numeric ranges. Missing evidence is unavailable, never zero. Strictly qualified inputs satisfy Chi <= Flo, Fhi <= Slo and Slo > Chi. This deliberately conservative condition rejects overlapping uncertain intervals rather than choosing a favourable chronology.

For those inputs define percentages with exact rational comparison over the qualified representation:

L = 100 * (Slo - Fhi) / (Slo - Clo)
U = 100 * (Shi - Flo) / (Shi - Chi)

These are conservative lower/upper bounds because the ratio increases with S and C, and decreases with F within C <= F <= S. A translation of all operands changes neither ratio. Exact rational comparison here means comparing the represented, qualified bounds without another floating point rounding step; it does not make the underlying device clock exact.

If the frozen recipe contract supplies a lower target only, require L >= target. If it supplies a closed development window [minimum, maximum], windowed completion remains unavailable until the contract qualifies the maximum at physical bean drop. That maximum-side interval uses a proved upper bound on physical drop time, including queue/dispatch and actuation latency, not merely Shi at BT acquisition. Require the resulting drop-time upper DTR bound <= maximum as well as the acquisition-time L >= minimum. No such latency bound is currently established. Validate any target/window as finite, within 0–100, with minimum <= maximum; a window narrower than the qualified uncertainty may never qualify. Do not invent a maximum or reinterpret an existing single target as a tolerance window. An interval straddling an edge is indeterminate, not met. At exact equality, a zero-uncertainty qualified sample can qualify; uncertainty may conservatively delay qualification.

Every recipe decision uses BT and DTR evidence at the same qualified BT acquisition instant, with required current freshness and existing run/phase/owner checks immediately before dispatch. A previously qualified lower DTR bound remains mathematically lower under an unchanged canonical timeline and advancing clock, but that is not permission to carry forward BT, upper-window eligibility, phase or dispatch authority. No stale-temperature inference or automatic retry follows.

## Admission, reconciliation and endpoint rules

- A direct or recovered human event can contribute only after C proves original accepted event identity, current retained child/session, chronology and provenance. A model event or local receipt timestamp cannot substitute.
- A recovered historical record alone causes no operational transition. The eventual approved timing contract must require explicit operator action for recovery/reconciliation admission through existing safety policy; restart remains operator_recovery_required and never directly makes routine drop eligible; it must not cause automatic heat/fan resumption or replay a mark.
- Missing/inconsistent timing inhibits routine recipe completion. Proposed owner decision: timing that becomes unusable for an already admitted recipe, or a definitively missed development window, enters the existing operator-recovery/containment policy with visible reason and no automatic routine heat/fan continuation. Apply the existing safety-evaluated containment rules, not a newly invented actuator command or target. Refuse recipe activation before Start when its required timing capability is unqualified. This does not automatically drop beans, resume heat, or override independent protection. A merely valid below-target DTR sample is ordinary recipe progression, not this recovery trigger. This proposed disposition requires owner agreement; it is not already implemented or authorised by this note. Preserve the approved mark-scoped uncertainty policy, independent actuator/transport/storage recovery and independently valid 196°C protection. Do not promote uncertainty about a mark into permission to clear an unrelated command UNKNOWN.
- Revalidate ownership and freshness after every relevant await. Child/session replacement, changed canonical timeline, sequence regression, clock discontinuity, stale BT/ET or endpoint admission invalidates the recipe evidence. A late response cannot reopen an endpoint or recategorise an interruption as success.
- Emergency and protection arbitration precede recipe completion. When both recipe and 196°C protection are eligible, protection owns the single endpoint and records interruption. Operator override remains independently safety-evaluated. The normal producer drop call and recovery drop call have different semantics. Routine recipe dispatch remains unavailable unless producer-side validation or an equivalently proved atomic ownership invariant binds the actual command to the evidence session and clock epoch. Consumer preflight/rechecking alone does not close the final dispatch race. Do not substitute the recovery parameter for normal Drop. Independent emergency intent stays available from every phase, including fault/recovery, and is not gated by DTR evidence, recipe eligibility or the recipe endpoint latch; preserve existing emergency dispatch/session/arbiter constraints without promising physical preemption. Endpoint exclusivity still prohibits repeated normal/protective drops.
- Record evaluated interval, raw operands/identities, sample and dispatch times, target/window, decision reason, command acceptance, readback, durability and physical observation separately.

## Required proof before implementation completion

Producer: coherent one-clock observation; canonical event identity; raw numeric bounds; delayed serialization; clock/sequence reset; invalid temperature; acquisition-age semantics and fixture evidence. Bind supported producer and SDK versions. No real-roaster claim from mock tests.

Consumer: wrong/replaced child, wrong session, malformed/raw coercible scalars, absence, reversed chronology, stale/repeated sequence, inherited model timestamps, direct versus recovered human mark, and arrival after endpoint admission. Assert zero dispatch for each invalid case.

Controller: below/equal/above target and every window edge; uncertain interval crossing an edge; BT crossing before/after the DTR sample; queuing and persistence delays; emergency/operator/protection races; unknown previous drop; restart and explicit recovery; no retries or automatic heating resume. Remove each admission guard in a bounded causal test. Preserve AUTOMATIC behaviour independently.

BT comparison: preserve the already approved inclusive target comparison over qualified BT evidence. Define its raw numeric representation and measurement/rounding uncertainty in the contract, and require a conservative bound where that uncertainty affects qualification. A target at or above 196°C cannot outrank protection. Define conversion to exact rational bounds explicitly (e.g. exact binary value versus decimal wire representation), accounting for serialization representation error.

Display/history: expose unavailable or bounded DTR evidence without replacing historical actual controller timestamps. State the clock basis and whether the value is display-only or used for control. Preserve accepted/sent/readback/durable/physical distinctions.

## Delivery and owner decision

First finish independent C1/C2 work under the ratified boundaries. Prepare a distinct producer observation-evidence slice and consumer/control timing slice, with story-planner contracts and explicit source bindings; their exact split follows architecture review. C3 history retention can remain bounded separately. Recipe control follows qualified evidence, not an unsafe provisional public flag.

Owner decision sought only after independent review: adopt same-producer-session, conservatively bounded timing evidence for future joint-target control, explicit operator-gated reconciliation, and the proposed existing recovery/containment disposition when admitted recipe timing becomes unusable, with no inferred Agent-clock anchor. Retain the current lower-target semantics; bounded-window completion stays unavailable until the separately specified physical-drop maximum is qualified. This is an architecture/operational semantics decision, not approval to change a numerical target or operate hardware. Actual timestamp/age bounds remain qualification obligations; if a bound cannot be proved, admission stays unavailable.

The accompanying exact-arithmetic checks validate the interval formula and counterexamples only. They do not validate the producer, consumer, dispatch or hardware.
