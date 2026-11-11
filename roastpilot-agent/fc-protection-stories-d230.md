# D230 — Prepared story bodies and delivery order

10 November 2026. Revised local issue-body drafts, not published issues or delegation contracts.
[Decision and authority](fc-protection-d230.md). Issue numbers are unassigned.
The owner ratified product direction; exact issue context and each story-planner
contract still require their normal authority and provenance checks.

## Common story requirements

All stories inherit the eight clauses, source bases and architectural boundaries
in D230. Formal planning binds maintainer identity, issue body hash, comments and
revision watermark, Plan SHA and implementation base. Refresh before delegation.
Tests must fail causally when the corresponding guard is removed or inverted.
No controller or transport behaviour is proved by document preparation.

Safety/controller/recovery/runtime capability changes take SAFETY_CRITICAL:
full unfiltered native validation, statics, boundary contracts, mandatory independent
safety review and other triggered lenses. Gate-machinery changes additionally
require the exhaustive witness. Preserve protected checks and current-head review.
Reviewers do not edit implementation; the parent independently adjudicates findings.

## Prepared issue bodies

### M: Exact-session fixed-zero containment

Repository: coffee-roaster-mcp.

Scope and PR plan: One coherent 250–400 logic-line slice; explicit driver capability, strict request/response grammar, reservation and stale-completion handling.

Dependencies: Ratified Plan and new MCP story; existing #237 is dependency context, not this capability.

Acceptance: common requirements and criteria 1–3, 7–8, 11–12. Reviewers: Safety, security, MCP/downstream compatibility; QA when triggered.

### A1: Human-mode protection, dispatch and recovery

Repository: roastpilot-agent.

Scope and PR plan: four serial review units off current main — S1 domain/safety (320–420 logic lines), S2 strict MCP consumer (320–420), S3 controller/runner/lifecycle ownership integration (550–700), S4 safety-relevant UI (150–250 TypeScript lines). S3 is one cohesive actuation-ownership unit: splitting its endpoint latch, dispatch fence and lifecycle gate would create incomplete intermediate protection. Re-estimate and bind the contract at each slice's current base; tests and separated data are excluded from these estimates.

The scope remains fresh-reading eligibility, typed safety, endpoint latch, actual-dispatch and lifecycle fences, containment consumer and operator disposition. Human mode is constructor-injected for tests only; no public enablement/configuration surface is added before C. A1's one-attempt fixed-zero path preserves other actuator bits and suppresses ordinary human-mode resends; independent emergency and automatic-mode semantics remain unchanged. All four units take the safety route (S4 includes operator recovery projections). Preserve the story's required safety, security, MCP-contract and simulation lenses across the actual slices, plus UI/QA when triggered. No collector ownership or qualification/hardware completion is assigned by this refinement.

Dependencies: M source/contract; stays non-admitted until A2 and C.

Acceptance: common requirements and criteria 4–5, 7–8, 10–12. Reviewers: Safety, security, MCP contract, simulation; UI/QA when triggered.

### A2: Bounded persistence and visible uncertainty

Repository: roastpilot-agent.

Scope and PR plan: One coherent 350–500 logic-line slice; whole-turn budget, all-writer inventory, connection quarantine, bounded pending work and durability projection.

Dependencies: A1; does not alter endpoint ownership.

Acceptance: common requirements and criteria 5–8, 11–12. Reviewers: Safety, simulation; security, UI and QA as capabilities/coverage trigger.

### C: Mock human-FC consumer admission

Repository: roastpilot-agent.

Scope and PR plan: One coherent 250–400 logic-line slice; authority config isolation, current-child manual/v1 handshake, capture validation, Start uncertainty, human-mark reconciliation and shadow observation preservation.

Dependencies: M, A1, A2 and merged MCP #237/#238. Mock only.

Acceptance: common requirements and criteria 8–12. Reviewers: Safety, security, MCP contract, simulation; UI/QA when triggered.

### L: Candidate and later live-admission qualification

Repository: cross-repository.

Scope and PR plan: Later contract; size and PR split require concrete candidate and evidence scope. No live operation is authorised by this draft.

Dependencies: M/A1/A2/C, strict diagnostic collector interpretation, exact installed candidate and fresh qualification.

Acceptance: all integrated obligations plus the L-specific requirements below. Reviewers: Safety, driver/contract and independent evidence review; other lenses by scope.

### Issue coverage and ambient limitation

The roast agent's read-only coverage check on 9 November found no existing
active-session fixed-zero containment story. M remains separate from MCP #230
(stopped-fault exact-session recovery). Closed #237 is mock-only; #227 cold
projection is context, not authority for M.

MCP #199 is an open ambient non-finite-value boundary issue (reported revision:
2026-08-11T06:48:59Z; zero comments). The roast agent reports that `_current_value`
still checks the sentinel then converts to float without rejecting non-finite
values. Its issue describes independent Agent triad guards; those guards were
not freshly reverified by that coverage check. L must resolve or explicitly
qualify this ambient-validity limitation against its exact candidate. This is
not evidence of a current Agent control bypass and does not expand M's scope.

### L-specific acceptance

Bind exact installed Agent/MCP/SDK artifacts and effective configuration. Demonstrate
sensor freshness, target-storage budget, transport ownership and command disposition
using software/cold evidence before supervised hardware admission. Bind actual room
probe reading, placement and age with BT/ET; a remembered room temperature is not a
measurement. Agree the manual/shadow interval, actual hop, recording continuity,
identity and durability interpretation separately. Legacy zero inference counters
are not timing proof. Preserve operator presence and independent physical stop.
No mock pass, RPC acknowledgement or commanded actuator bit proves physical effect.
D227 acceptance does not transfer automatically. Immediate physical GO stays separate.
Before L starts, name the delivery owner and contract for the strict diagnostic
collector prerequisite; its implementation is not silently assigned to C or L.

## Outcome semantics for formal contract selection

The formal contract must select exact wire names/version; the semantic grammar
below is the proposed closed set, not a currently implemented API.

| Semantic outcome | Evidence needed | Permitted follow-up |
| --- | --- | --- |
| Known non-dispatch: reservation conflict | Server-owned pre-driver refusal for the exact session, with no invocation | No automatic retry in the initial capability (D230 clause 4), including reservation conflicts |
| Known non-dispatch: permanent incompatibility or identity failure | Unsupported capability/driver/protocol, wrong/stopped/replaced session, malformed request | No automatic retry or fallback; admission/recovery failure |
| Invoked, returned valid command-state evidence | Driver invocation and typed result tied to reservation/session | Record command state, not physical heat removal; no automatic repeat |
| Invoked, result missing/invalid or exception | Invocation known but reliable applied-state evidence absent | Unknown outcome, retain latch; no automatic retry |
| Local timeout/cancellation or missing response | Remote invocation/settlement not proven | Unknown outcome even if the local task ended; no routine/containment retry |
| Superseded by independent emergency/lifecycle action | Exact owner/generation evidence | New owner governs; stale completion cannot release latch or update newer run |

The earlier transient-retry proposal is withdrawn. A future automatic retry
requires a closed typed outcome, a reachable transient producer and causal tests
under a separate ratified contract. Do not add an operation-nonce journal merely
to enable automatic continuation: conservative unknown-until-explicit-reconciliation
is the initial recommendation. This is not permission to spin, clear another
owner's reservation, reconnect or infer settlement. Independent
emergency admission is preserved in all rows; its dispatch constraints remain
honestly visible. Existing MCP stale-completion emergency fallback is unchanged.

## Criterion ownership

M owns producer criteria 1–3, plus an explicit no-retry rule for the new server
capability and preservation of existing MCP behaviour. Criteria 7–8 and 11 in
M's mapping are integration context: M supplies typed identity, refusal,
invocation and uncertainty evidence; Agent orchestration remains A1/A2/C work.
A1 owns protection, dispatch, endpoint latch and operator recovery in 4–5, 7–8
and 11. A2 owns persistence criterion 6 and proves its integration cannot bypass
A1 fences. A2 mappings to criteria 7–8 mean that expired or late storage work
cannot trigger retries or bypass A1 ownership; A1/C own transport orchestration.
C owns authority/capture/reconciliation criteria 9–10. A1 supports
criterion 10's latch boundary; C owns human-event reconciliation. Criterion 12
applies within each story's scope, with real-candidate qualification deferred to L.

## Numbered behavioural acceptance criteria

1. M rejects missing/malformed/unknown support and wrong/stopped/replaced session
   before driver invocation; no generic set_heat/e-stop substitution on refusal.
2. M commands only heat zero and preserves fan/drum/solenoid/cooling absent an
   independently admitted lifecycle/emergency action. Driver contract tests start
   from partial-drop command state; tests use fakes/injected transports only.
3. M performs no automatic retry, including reservation-conflict refusal.
   Test zero calls on refusal and no resend after conflict release. M's outcome
   grammar proves pre-call refusal, invocation uncertainty and stale
   completion separately. A stale completion cannot release a newer owner's
   reservation or update its session. Preserve legitimate matching-owner cleanup
   and emergency fallback; cleanup alone never proves remote command settlement.
   Bind the fallback record.
4. A1 handles below/equal/above threshold, charge/phase/freshness combinations and
   same-tick confirmed charge without storage ahead of urgent action. Calling
   current `_apply_phase_rules` first is insufficient because it awaits storage.
   Include accepted-temperature stalls while session time/raw packet counts
   advance, counter resets/wrong types and ignored/error/unit-invalid readings.
   Non-finite BT or ET is invalid and cannot count as fresh evidence.
   With valid eligibility, admit one safety-evaluated compound drop with no
   model/DTR/advisor/dwell gate; record interrupted/unmet target, not success.
   Each gate independence and one-dispatch guard needs a causal mutation test.
   Invalid/stale temperature evidence inhibits routine heat/fan and enters recovery;
   it cannot admit a new protective drop. Existing endpoint latch and no-heating-resume
   persist. If freshness fails before actual drop dispatch, withhold it and show
   operator intervention/reconciliation. Freshness restoration alone cannot dispatch
   the pending drop. Test stale-before-admission, stale-between-admission-and-dispatch,
   recovered-freshness, issued/unknown drop, and the separately eligible operator
   disposition. Never retry an issued/unknown drop. Fixed-zero remains subject to
   clause 4; independent emergency intent remains available.
   If no endpoint was admitted before freshness loss, recovered readings alone
   neither resume routine heat/fan nor admit an automatic drop from recovery.
   Require explicit operator reconciliation through safety. For an eligible
   continued roast, restore the control phase only through that action and evaluate
   fresh BT >=196°C protection before any routine heat/fan dispatch. Unknown
   command disposition or endpoint history blocks continuation. Test fresh recovery
   below/equal/above 196°C, no operator action, failed reconciliation, and independent
   emergency intent. An admitted-endpoint latch continues to forbid heating resume.
5. A1 fences every queued/new routine heat/fan/drop path, joins operator/legacy
   endpoint requests, preserves emergency admission and records in-flight intervals.
6. A2's persistence budget covers prior-turn history, queue audit and all controller
   sink awaits. Block each boundary, test late commit and cancellation suppression;
   no stale continuation actuates or clears recovery. No unbounded task/backlog.
   Inventory all relevant writers/connections, including recovery/background work,
   and test their lock bounds and visible unavailable/unknown durability status.
   Storage failure/overrun alone causes zero automatic drop dispatches: inhibit
   routine control and enter containment/recovery. A concurrent independent valid
   protection trigger is tested separately; database failure cannot erase it.
7. A1 treats MCP local timeout as remote-unknown. Selected-SDK real-stdio tests
   reproduce sync blockage and async controls; no false preemption/settlement claim.
8. A1/C perform no automatic retry from the unproven reservation-conflict category;
   no unknown-result retry or automatic redrop. Resolve interaction with existing
   safety heat-off retries explicitly before contracting. A material safety/behaviour
   change or conflict with ratified no-resend policy returns to the owner; source
   proof that existing independent emergency semantics remain unchanged does not
   itself require a new product choice. Unknown drop/containment results cause
   zero reconnect, child-restart or new-session escape attempts. Emergency remains
   callable; remote service/physical success are separate claims.
9. C validates strict manual authority, manual/v1, mock driver/audio/override and
   requested capture settings before Start/initial actuation. Missing readback,
   old child, truthy strings, stale generation or rejected ack never downgrade.
   Absent readback fields rely only on the reviewed child's explicit contract,
   not fabricated effective configuration evidence.
   Isolate inherited human-authority keys so they cannot leak into automatic mode;
   prove automatic-mode configuration and runtime parity. C requires independently
   proven mock-producer freshness semantics under shared contract tests; Hottop
   evidence alone cannot admit it. C owns this consumer-side proof against the
   bound existing mock. Failed proof closes admission; any necessary MCP producer
   change needs separately ratified scope and is not automatically M work.
   Unknown Start outcome
   enters recovery without another Start. Preserve validated shadow-observation
   evidence for the separate qualification collector. Malformed diagnostic-only
   metadata invalidates diagnostic qualification, not canonical human FC or
   independently valid control telemetry; actual control/transport faults retain
   their safety handling. Pre-Start protocol admission stays strict.
10. C preserves canonical accepted human timestamps after lost response for the
    exact retained child and session; changed/evicted/ambiguous identity stays unresolved.
    Post-endpoint new notes never change phase/DTR or cancel protection; model detections never do so.
11. Restart/fault/recovery cannot replay heat/drop or auto-resume. UI projects
    server authority, unknown durability/actuation and operator intervention,
    without asserting physical cooling from command-state fields.
    Operator disposition must not require heating resume or bypass exact-session,
    charge, fresh evidence and known prior-drop state, all through safety evaluation.
    In the approved stale-reading disposition path, missing fresh evidence makes
    software operator drop unavailable; expose physical intervention/reconciliation.
    Independent emergency authority is unchanged. Test blocked restart persistence.
    An unknown possible prior drop refuses another software drop, exposes unknown
    outcome and requires physical operator intervention/reconciliation. Show that
    existing emergency fallbacks may stop the drum and close the chute; never
    present emergency admission or RPC completion as physical evacuation proof.
12. Preserve automatic-mode behaviour and existing MCP mock-only restrictions.
    Record BT/ET/measured ambient validity/age/placement, batch and initial thermal
    state, command timeline, human FC,
    recording continuity and outcome for the later baseline. No recipe-success
    or hardware-ready claim is made by a mock pass. Invalid/non-finite ambient is
    recorded as invalid, never a valid measurement. #199 remains L qualification
    context, not a scope expansion of M.

For every changed guard, formal planning must map removal/inversion to a causal
test. Safety changes require full native validation and risk-routed independent
reviews; implementation completion and hardware qualification remain distinct.

## Scope control

These are preparation units, not a demand for artificial code splits. Formal
story-planner may refine coherent PR plans within ratified scope; material policy,
architecture or authority changes return to the owner. Any materially larger unit
needs a reviewability rationale. Tests over 600 changed lines require QA review.
No existing #954 acceptance issue or closed #237 silently authorises these features.
Do not publish these bodies, share a new provider packet, implement or enable live
mode merely because this local preparation is complete.
