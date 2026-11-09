# D230 — Human-FC protection and consumer admission

9 November 2026. Local formal Plan draft; owner direction ratified, publication pending.
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
means acceptance, not physical acquisition age. A newly observed counter must
not receive age zero: under valid ordered same-child history, use the previous
observation's request-admission time as a conservative acceptance lower bound.
Initial/reset/lost history and a long unobserved gap remain unproven; unchanged
or ignored samples do not renew freshness. Recheck age at actual dispatch.
Counter algebra alone proves neither sensor calibration nor packet backlog age.
Exact projection, clock and validity contracts remain implementation obligations.

Resolve the recovery command matrix, existing retry/emergency ownership,
all-writer storage bounds and late cancellation, queue/advisor delay, remote
SDK settlement, canonical human-event reconciliation and diagnostic projection
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

After qualification, the first instrumented baseline records BT, ET, measured
ambient and validity/age/placement, initial thermal state, batch, actual commands,
accepted human FC and outcome. Use those observations to assess target-BT timing
against operational development %, and then design bounded heat/fan identification.
No seasonal offset, PI gain, taper, fan policy or new recipe is selected here.
Neither achieved target temperature alone nor protection firing is recipe success.
