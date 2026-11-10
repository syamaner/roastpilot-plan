# D230 — Human-FC protection and consumer admission

10 November 2026. Local revision of draft Plan PR #101; not effective.
Published head remains `55ab0615d95dfb0f2b7af3a0efeafb6ba9762036` until separately updated.
No implementation, hardware qualification or live admission is claimed.

## Authority and bindings

The owner approved the eight-clause policy on 9 November 2026 and authorised
formal Plan and story preparation. Exact policy binding: Career commit
`6579088b481a7806469d1e7cfa07bec0841be03b`, file SHA-256
`2d6b412a9e00116446696b977128280fd98d803c3ef75b600949210ef78a05d5`.
The clauses below reproduce that approved policy without changing its thresholds
or authority. Local D230 numbering was checked against current main and open
Plan PRs; refresh before publication to detect concurrent allocation.

Preparation bases:

- Plan: `8dc990c94a67419d22a474d76c29a347d67ecce7`.
- Agent: `1a9c27118ab804d64a564e75158072b758f3b898`.
- MCP: `58a94cf9b5e53ee72fc03ec986d6656bcdb0b888` (#237 delivered by #238, mock only).

This decision defines a future opt-in human-authority mode. Existing automatic
mode remains unchanged. It neither activates that mode nor transfers D227's
candidate or automatic-mode qualification to it. Earlier proposal wording that
permits transient containment retries is superseded by clause 4.

## Goal and FC authority

Aim to reach target BT within target human-operational development %, while
extending the roast without excessive roast degree. The first baseline measures
the existing trajectory; it does not promise those targets will both be met.
Record BT, ET and measured room temperature, with reading validity/age, probe
placement, batch/thermal state, commands, human FC and final outcome. Do not apply
an unvalidated seasonal correction based on the change from summer to this room.

Only accepted human FC starts development. Model detections remain diagnostic.
A lost response to a human mark may be reconciled against the same child/session's
accepted event at its original time. New human observations after endpoint admission
are labelled local notes and cannot change operational DTR or cancel protection.

## Ratified eight-clause policy

1. **Temperature protection:** inclusive indicated BT >=196°C, for confirmed
   charged pre-FC/development in an admitted human-mode run, invokes one compound
   protective drop through safety policy. No model, DTR, advisor or dwell gate.
   This is an indicated operating policy, not a calibrated safety/colour guarantee.
   Protection records an interrupted/unmet target, not recipe success.
2. **Accepted readings:** admission and runtime decisions require verified fresh
   accepted temperature readings, not an advancing server clock or packet count
   alone. Wrong types, counter reset/epoch mismatch, ignored/error/unit-invalid
   readings and stalled accepted progress must not look fresh. Reuse existing
   evidence only after its meaning is proven by contract tests; otherwise admission
   remains closed. Do not invent readings or silently fall back to session time.
3. **Latch:** admitting protection inhibits routine heat/fan and all competing
   endpoint paths before their next actual dispatch. No heating resume for that
   run after endpoint admission. If restart loses trustworthy endpoint history or
   command disposition, heating resume remains unavailable. This does not ban
   every unrelated, positively reconciled interruption by implication.
4. **Unknown commands:** a timeout or missing/malformed response means unknown,
   even when the local await has ended. No automatic redrop, containment resend,
   reconnect or new session to escape that uncertainty. One reviewed exact-session
   fixed-zero containment operation may run only when prior ownership is settled
   and eligibility is proven; it preserves the other commanded actuator bits.
   The initial new capability has no automatic retry on reservation conflicts.
   A later typed transient retry or operation-nonce journal is a separate change.
5. **Operator disposition:** an interrupted charged run must not require resuming
   heat before the operator can dispose of the beans. A software operator drop
   requires the exact current session and known prior-drop disposition. If a drop
   may already have been issued or the channel is unresolved, do not blindly send
   another one; show that software outcome is unknown and require physical operator
   intervention/reconciliation. No unsupported motor/fan sequence is invented here.
6. **Storage:** propose one tick interval (default 1.0s) total awaited persistence
   budget per human-mode turn. On overrun, inhibit routine control and enter
   containment/recovery; storage failure alone never causes automatic drop.
   Pending/late storage work cannot resume control or imply durability. Account
   for every relevant writer and connection, including recovery and background
   work, with bounded outstanding tasks and visible unavailable/unknown status.
   Target-storage qualification must precede accepting this budget for live use.
7. **Emergency:** independent emergency intent remains available and highest
   priority. Preserve existing MCP emergency fallbacks; disclose that they can
   stop the drum and close the chute. A blocked remote event loop may prevent a
   second request being serviced. Admission, RPC return, frame progress and physical
   heat removal/evacuation are separate facts. The operator remains present with
   the existing independently reviewed physical stop procedure available.
8. **Diagnostic evidence:** preserve validated shadow observations for a strict,
   bounded collector using existing MCP records. Legacy zero inference counters
   are not timing proof. Incomplete/ambiguous coverage, identity or durability is
   unknown/non-acceptance. Diagnostic-only parse failures do not acquire FC/control
   authority or invalidate independently valid canonical telemetry; actual control
   and transport faults still follow safety policy. Pre-Start admission is strict.

The material trade-off is deliberate: uncertain history or command settlement
can forfeit continued roasting and require operator intervention. It must not be
"recovered" by guessing that an irreversible command failed. This package chooses
that conservative behaviour instead of expanding the first change with an
automatic reconciliation/retry protocol.

## Ratified stale-reading clarification — 10 November 2026

The owner approved this clarification following the document review at Plan head
`55ab0615`. Its source is Career `752858f`,
`fc-protection-document-review-disposition.md`, proposed clarification section.
The direction is now ratified; the final sentence requesting a decision is
historical and omitted below. Original eight clauses above remain unchanged.

If accepted temperature evidence becomes invalid or stale during an admitted
charged human-mode run, inhibit routine heat/fan and enter recovery. A new
protective drop cannot be admitted from stale evidence. Any admitted endpoint
retains its latch and prohibits heating resume. If its drop has not yet been
issued and dispatch-time freshness fails, withhold that dispatch and show the
need for operator intervention/reconciliation. Do not automatically dispatch it
merely because readings later recover: operator disposition must re-establish
exact-session, charge, fresh evidence and known prior-drop state through safety.
An already issued or possibly issued drop remains non-repeatable; local timeout
never proves non-dispatch. Fixed-zero containment is permitted only under clause
4's proven ownership/eligibility conditions. Independent emergency intent remains
available; physical operator intervention is required when software cannot act.

Trade-off: stale telemetry can forfeit an automatic protective drop and require
the present operator to act. This avoids claiming a new temperature-based
irreversible action is justified by invalid evidence. It does not claim that
waiting is physically safe or that a blocked transport will service containment.

## Effectiveness and review scope

Policy direction and draft publication approval do not approve this revised Plan
head for merge. D230 becomes effective only after explicit owner approval of the
exact final head and a verified merge. No decision effectiveness implies software
implementation, consumer admission, installed-candidate qualification or live GO.
The six-file document review confirmed policy fidelity at `55ab0615` and identified
acceptance gaps; these local corrections are not a new independent review pass.
The one-tick storage budget remains a proposed default pending target-storage
qualification, as clause 6 requires.

## Architecture gate and unresolved proof

Domain policy owns typed eligibility, endpoint ownership and outcome meanings;
application orchestration owns child/run identity, dispatch arbitration and
recovery. Infrastructure adapters own clocks, storage and MCP/driver transport.
Every write still requires SafetyEvaluation. The advisor has no write tools;
server events remain the UI's authority. Driver support uses an explicit versioned
capability contract, not driver-name or method-presence inference. All supported
implementations must satisfy the same behavioural contract tests.

Accepted-pair producer evidence supports using status_packet_count minus
ignored_temperature_packet_count for the bound Hottop producer only. Progress
means acceptance, not physical acquisition age. Local evidence: MCP source
`58a94cf9b5e53ee72fc03ec986d6656bcdb0b888`, producer probe receipt
`accepted-temperature-progress-proof.json`, SHA-256
`2f0242184f0c27ddb16b0b81348df7a232bb1d556cfd313c3889add6e8ad1f6c`.
This is local producer evidence, not a consumer contract test or physical freshness
qualification. Mock producers need their own admitted freshness contract and the
same behavioural tests; Hottop counter semantics do not transfer by driver shape. A newly observed counter must
not receive age zero: under valid ordered same-child history, use the previous
observation's request-admission time as a conservative acceptance lower bound.
Initial/reset/lost history and a long unobserved gap remain unproven; unchanged
or ignored samples do not renew freshness. Recheck age at actual dispatch.
Counter algebra alone proves neither sensor calibration nor packet backlog age.
Exact projection, clock and validity contracts remain implementation obligations.

Resolve the recovery command matrix, existing retry/emergency ownership,
all-writer storage bounds and lock/cancellation behaviour, queue/advisor delay,
remote SDK and candidate settlement, canonical human-event reconciliation and diagnostic projection
before admitting a consumer. Local timeout never proves remote settlement.
The completed safety-design review is prospective advice with two disclosed
Read size-limit errors; it is not a clean final safety pass or implementation proof.

## Delivery and qualification boundaries

[Story preparation](fc-protection-stories-d230.md) defines M, A1, A2, C and later L.
Each implementation slice requires complete maintainer-ratified issue context,
current Plan/source bindings and a mandatory story-planner contract before a
named implementation leaf starts. The draft bodies are not those contracts.
All intermediate slices remain non-admitted for human/live use. Removing any
required protection closes admission; no flag silently downgrades authority.

L must bind installed packages, SDK/configuration, fresh probe/capture checks,
software/cold timing evidence, and a separately ratified manual/shadow interval,
actual hop and complete coverage/durability rules. Do not inherit D227's automatic
qualification interval or require an unqualified live roast to qualify itself.
Supervised hardware acceptance and immediate physical GO remain separate.
The strict diagnostic collector remains an explicitly tracked prerequisite to L;
its concrete delivery owner and contract must be assigned before L can start.
This does not silently expand C or L into collector implementation.

After qualification, the first instrumented baseline records BT, ET, measured
ambient and validity/age/placement, initial thermal state, batch, actual commands,
accepted human FC and outcome. Use those observations to assess target-BT timing
against operational development %, and then design bounded heat/fan identification.
No seasonal offset, PI gain, taper, fan policy or new recipe is selected here.
Neither achieved target temperature alone nor protection firing is recipe success.
