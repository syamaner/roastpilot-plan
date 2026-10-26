# Cloud sync product contract and ordered delivery plan

## 0. Status and authority

D220 (27 Oct 2026) records the operator's settled requirements in Plan#81.
Refs roastpilot-agent#955 and its children #956-#959. This document is the
cross-repository spec for LA-1 (sync, sharing and reviews) and LA-2 (references).
Its home epics are E15 in Agent and C9 in Cloud, verified collision-free by the
parent. E13 and E14 remain allocated to product agents under D91. The existing
LA-1 and LA-2 labels are kept.

Agent#955's historical E13 title is stale; A0 reconciles it in Agent state docs.
These identifiers organise delivery, do not override the operator's top-priority
choice and imply no hardware acceptance. D220 is defined once in the
[Cloud decisions table](roastpilot-cloud/plan.md#1-decisions-this-drill-down).

This is requirements documentation, not delivered enforcement or runtime proof.
Existing historical prose and examples remain intact; the narrow supersessions
are indexed in §13. Each later implementation unit needs a fresh contract.
The feature remains off until the operator-only gates in §12 are satisfied.

## 1. Scope and non-goals

This slice delivers only this Plan amendment and its pointers and allocations.
It performs no deployment, credential or account change, real roast upload,
Pi or hardware measurement, live cloud execution, provider API spend or unrelated
backlog work. Documents and mocks cannot satisfy an operator-only activation gate.

There is no account system, new base-table grant, generic sync framework, local
structured-tasting upload or new public description field. Private operator notes
and approved cloud taster-review notes have different privacy rules (§3).
No new resource envelope, refresh cadence, grace period or cost budget is set.

D97 Snowflake connector writes remain the write transport. HTTP is the review-read
path only. The existing delivery policy is unchanged, including retirement of the
autonomous CI factory, consumer-OAuth review bridge and SHA-scoped review gate.
This document does not reactivate any of them.

## 2. Settled product requirements R1-R9

**R1. Future eligible roasts only.** Upload automatically only future, normal,
completed roasts, with no backfill. Aborted, faulted, characterisation and dry-test
sessions stay local. A low tasting score alone is not an exclusion.
Capture the operator's test-run marker at roast start. Any marked run stays local
and never uploads automatically, whatever its driver, including the real roaster.
The marker is local provenance only, absent from curated exports and public
fields, and changes no safety or control behaviour. Do not infer bean presence
from the driver or mark historical runs retroactively. Unknown eligibility,
including unknown marker state, fails closed to no upload.
Later Agent start/API/UI slices implement and prove the marker (§7): marked mock
and real-driver paths do not enqueue; an unmarked normal completed run is
eligible; the marker cannot change after start; curated exports omit the marker.

**R2. Stable unlisted sharing.** An eligible roast has a stable unlisted link,
without discovery or a separate publish step. Public fields are limited to
bean/profile details, curves, key Celsius temperatures and timings, operator
rating and cloud reviews. Visibility selection and slug regeneration are deferred
outside this settled initial scope, not removed from history.

**R3. Private operator notes.** Operator notes are private by default and may
travel only through a private field. They never appear in public projections.
Approved public cloud taster-review notes remain part of cloud reviews (§3).

**R4. Independent learning consent.** Learning defaults on appliance-wide, with
per-roast opt-out. Learning consent is independent of sharing: opting out excludes
the roast from aggregation but neither withholds nor withdraws approved public
curves. Sharing is not evidence of learning consent.

**R5. Appliance-owned edits.** Automatically merge appliance-owned rating,
private operator note and consent edits as per-field latest intent. Explicit clear
and omission differ. Cloud reviews and omitted fields are preserved. Rejected
values remain local and visibly unacknowledged rather than silently nulled.

**R6. Durable intent and acknowledgement.** Persist the latest desired action
and its per-field acknowledgement durably. Older acknowledgements cannot erase
newer desired values, and an older opt-in cannot undo a newer opt-out. Retrying an
acknowledged intent is idempotent. A failed private operator note is never synced.

**R7. Separate local and cloud removal.** Removing a local roast keeps the cloud
copy. Cloud deletion is a separate explicit queued action backed by a permanent
tombstone. Local discard behaviour is unchanged. Transactional row changes and
stage-file cleanup are separate effects; §8 specifies their qualification limits.

**R8. Offline-capable reviews.** Refresh reviews automatically while idle, retain
an offline cache and offer Refresh now under the same admission and lifetime
bounds. Use the HTTP GET, pagination and ETag contract in §9. Cached data must not
be presented as fresh or as evidence of current public visibility.

**R9. Cached-only roast preparation.** Refresh references in the idle background;
prepare reads cached process aggregates only. No tasting text, flavour axes or
provider propagation is added. Cloud work never delays roast control, including
when the network, warehouse or child process is slow or unavailable (§10).

## 3. Principal and privacy model (B1)

Use one appliance principal with the existing `ROASTPILOT_AGENT` key-pair service
user. Credential provisioning is a later operator gate, not part of this document.
The public reader retains the existing `PUBLIC_WEB` boundary: two secure views
plus `SUBMIT_REVIEW`, without any base-table grant or third public view.
Prerequisite usage grants remain as recorded in the
[Cloud architecture](roastpilot-cloud/plan.md#3-architecture).

The closed public field set is bean/profile details, curves, key Celsius
temperatures and timings, operator rating and cloud reviews. Never public:
raw exports, private operator notes, the test-run marker, internal IDs, logs,
model or provider details. The private operator-note field is excluded from
**every** PUBLIC_WEB projection, regardless of whether it is populated.

Approved cloud taster-review notes remain public review content, displayed as
untrusted text. This neither prohibits those notes nor extends local
structured-tasting upload. Pulled reviewer names and text do not become trusted
instructions, markup or advisor input. No public description field is added.
Projection and schema changes require explicit schema-migration and privacy review.

## 4. Layering (B2)

Keep domain rules separate from application orchestration, adapters and presentation.
Domain responsibilities are eligibility, the versioned curated export, consent and
per-field intent/acknowledgement merge. They depend on no SDK, database or UI type.
Application orchestration owns outbox use, dispatch and refresh scheduling.

Infrastructure adapters own SQLite persistence, D97 Snowflake connector writes,
HTTP review reads and process lifecycle. Agent API and SPA presentation consume
application capabilities; the SPA renders server events and snapshots.
Use cohesive consumer-owned ports at these volatile boundaries. Alternate adapters
must satisfy the same behavioural contract; adding one must not rewrite settled
domain rules. Connect concrete implementations at the composition root.

Correctness, privacy, stable identity, provenance, consent ordering and schema
invariants remain closed and versioned. Inject nondeterministic clocks, identifiers
and external clients where deterministic substitution matters. No general-purpose
repository or speculative generic synchronisation framework is required.

## 5. Data and mutation contract (B3)

Export a closed, versioned curated shape, not raw local exports. Unknown or
unsupported schema versions fail closed. Stable roast identity and a stable
unlisted link survive retries and appliance-owned edits. The exact local schema
and the server ordering algorithm require later ratified contracts.

Represent each field's monotonic desired intent and acknowledgement independently.
An omitted field is preserved; explicit null requests a clear where the field's
contract permits it. Do not replace whole cloud records with local snapshots.
Preserve cloud reviews and all omitted fields. Acknowledgement is idempotent and
only confirms the corresponding accepted field intent, never a newer local edit.

A rejected value remains local and visibly unsynced. It cannot block a newer
consent decision; a failed private operator note is never marked synced.
Never silently null local public fields to make a rejected patch appear accepted.
Write ordering, acknowledgement and idempotency use the Cloud write protocol.
D97 connector transport is settled; this Plan does not choose its SQL algorithm.

## 6. Consent model

The appliance-wide learning default is on; each roast can opt out independently.
Learning controls aggregation eligibility, not unlisted sharing. A learning opt-out
therefore does not withhold or withdraw approved public curves. Public sharing
and aggregation must not be inferred from one another.

A newer per-roast opt-out supersedes an older opt-in, including across delayed
writes, retry, restart and late acknowledgement. Outbox persistence and server
ordering must preserve that rule. Client serialisation alone cannot establish it
against concurrent or legacy server callers. Qualification is required in §8.

## 7. Eligibility and the test-run marker (B9)

The operator confirmed that dry tests can use the normal roast screen with the
real roaster and approved a test-run marker captured at roast start. The question
is answered; it is neither an open question nor an activation gate.
A marked run never uploads automatically on either the mock or real-driver path.

The marker is local provenance, persisted immutably for that run. It is absent
from curated exports and public fields. It changes no controller, safety or
roast-control behaviour. No retroactive marking, backfill or inference of bean
presence from the driver is permitted. Add no T0, first-crack, rating or discard
exclusion. If future eligibility or marker state is unknown, do not upload.

Implementation and behavioural proof belong to later Agent start/API/UI slices,
including E1m. Their hardware-free tests must prove all four outcomes:

- A marked run does not enqueue on either mock or real-driver paths.
- An unmarked normal completed run is eligible.
- The marker cannot be changed after roast start.
- The marker is absent from the curated export.

Testing a real-driver software path is not physical hardware acceptance.
Any real-roaster claim still requires the supervised E12 hardware story.

## 8. Server correctness (B4)

Deletion tombstones are permanent. Every accepted legacy or new write path must
participate in a verified ordering/transaction protocol or be disabled: create,
patch, telemetry load, review submit, delete and summary-recompute side effects.
The exact SQL, locking or gate-table algorithm is **not** ratified here.

There is no client-only or single-client fallback while server consistency is
unqualified. One local dispatcher is not proof of server correctness. No caller
is activated before qualification. A late upload cannot resurrect a tombstoned
roast or restore stale consent, including through summary recomputation.

Transactional DML and stage-file effects are separate. Neither rollback of stage
operations nor atomic stage erasure is claimed. Later qualification must cover
crash and late-upload windows, deletion, cleanup and their recorded residuals.
Delivering an offline verifier and procedure is separate from executing the
operator-authorised synthetic DEV qualification. Documents and mocks prove neither.

## 9. Reviews read contract (B5)

The reviews GET is the HTTP review-read adapter only; D97 connector writes stay
the write transport. Use bounded pagination that reaches **all** reviews, with
stable opaque cursors and canonical ordering. No silent cap or misleading total.

Weak ETags are content-based and bound to the exact resource, representation and
page. Check current existence and visibility **before** returning a body or 304.
Do not inherit the existing page cache's stale-deletion residual. A query ID,
timestamp or count is not a content validator. Cache body and validator atomically
on the client so a validator cannot refer to a different cached representation.

ETags reduce transferred bodies, not necessarily warehouse queries or cost.
PUBLIC_WEB stays at two secure views plus `SUBMIT_REVIEW`, without base-table
access. Any projected rating or review-id column needs explicit contract and
migration review rather than an implicit expansion of the public projection.

## 10. Roast-control non-interference and references (B6)

Admit cloud work only while idle. Bound background process and HTTP lifetimes;
make them pre-emptible and reap them. Prove termination and resource release,
rather than inferring either from cancellation of a thread. Refresh now uses
the same admission and bounds. Existing resource and time budgets are not widened;
no new envelope, cadence, grace period or cost budget is invented here.

Replace D13's at-start fetch with idle background reference refresh. Prepare reads
cached, rating-filtered process aggregates only. No tasting text, flavour axes or
provider propagation is introduced. A slow or unavailable cloud cannot delay a
roast, and cloud data cannot bypass local control or safety policy.

The controller owns the loop; the advisor gives typed recommendations only and
never receives MCP write tools. Every roaster write passes safety policy. Restart
never auto-resumes heat or fan. Temperatures remain Celsius, verdicts stay typed,
and the SPA renders server events and snapshots without inferring phase locally.

## 11. Ordered per-repository PR plan (B7)

Each row is its own PR, with fresh main, Plan SHA, issue snapshot and ratified
contract. Actual diffs may add reviewers; they never silently remove a predicted
lens. Apply current-head gates in the relevant repository, including Agent D218
routes. No cross-repository PR is implied. Every client unit ships feature-off.

| Order | Repository | Unit | Depends on | Predicted reviewers |
|---|---|---|---|---|
| P0 | Plan | This requirements amendment | None | Targeted security on privacy/architecture; product audit at true story completion |
| A0 | Agent | E15 epic and registry; reconcile #955 title and #956-#959 | P0 | Sufficient independent docs review; product audit only for suspected drift |
| C0 | Cloud | C9 epic or state docs | P0 | Sufficient independent docs review; product audit only for suspected drift |
| C1 | Cloud | Curated projections and schema: private operator-note field, consent, tombstones, version | C0 | Security, schema-migration, privacy |
| C2 | Cloud | Write ordering, acknowledgement and idempotency; cover or disable every accepted path | C1 | Security; schema-migration and privacy if fields change |
| C3 | Cloud | Reviews HTTP GET/ETag/pagination within the two-view boundary | C1 | Security |
| C4 | Cloud | Offline verifier and qualification procedure, delivery only | C2 | Security, qa |
| E1m | Agent | Start/API/SPA marker capture; immutable local persistence; no export field or control change | A0 | Safety, schema-migration, ui-reviewer, qa |
| E1 | Agent | Closed curated export, fail-closed eligibility including marker exclusion, consent and intent merge | A0, E1m, C1 contract | Security, qa, privacy |
| E2 | Agent | Durable latest-intent and acknowledgement outbox persistence | E1 | Qa, schema-migration |
| E3 | Agent | D97 Snowflake connector write adapter; credentials by env-var name only | E1, C2 contract | Security |
| E4 | Agent | Idle admission and bounded, pre-emptible, reaped dispatcher lifetime | E2, E3, E1m | Safety, security |
| E5 | Agent | Owner-action and status API | E4 | Security |
| E6 | Agent | SPA sync status, unsynced values, cloud deletion and Refresh now | E5 | Ui-reviewer |
| E7 | Agent | HTTP review-read adapter and atomic cache | E3, C3 | Security |
| E8 | Agent | Idle reference refresh and cached-only prepare | E3 | Safety, security |

Cloud contracts precede any activated client. Reviewer labels denote lenses,
not authority to execute live gates. Product audit is for true story or epic
completion or suspected drift. Each implementation contract defines behavioural
and substitution tests for its boundaries; these rows authorise no implementation.
E1m needs E12 supervised hardware acceptance for any real-roaster claim.

## 12. Activation gates (B8)

These gates are operator-only. Documents, mocks and software delivery cannot
satisfy them. The feature stays off until **G1-G6** are met:

- **G1:** Authorised synthetic DEV concurrency, role and procedure qualification.
- **G2:** Deployed-caller and data compatibility checks.
- **G3:** Target packaging and resource evidence.
- **G4:** Credential provisioning.
- **G5:** Deployment.
- **G6:** Feature activation.

Unqualified server consistency fails closed, with no client-only fallback.
The start-marker decision is settled (§7), not an additional activation gate.
None of these operator gates is performed or claimed by this Plan slice.

## 13. Supersession index

Historical text is preserved. Pointers outside tables and fences name the exact
clause superseded; only the listed meanings change. Everything else stays in force.

| ID | File and section | Narrow supersession |
|---|---|---|
| S1 | Cloud plan §1 D13 | Idle refresh; cached-only prepare; retain no flavour-axis propagation |
| S2 | Cloud plan §4 schema comment | Learning consent independent of public sharing |
| S3 | Cloud plan §5 Upload | Keep D97 connector; use qualified write protocol, not a fixed algorithm |
| S4 | Cloud plan §5 Update | Per-field latest intent; visibility and slug regeneration deferred |
| S5 | Cloud plan §5 Delete and §8 deletion | Explicit queued deletion, permanent tombstone; separate DML/stage effects |
| S6 | Cloud plan §5 List/reviews | HTTP GET/ETag review-read contract only |
| S7 | Cloud plan §5 References | Idle refresh and cached-only prepare |
| S8 | Cloud plan §5 Privacy mapping | Learning opt-out excludes aggregation, not approved public curves |
| S9 | Cloud plan §12 privacy-auditor | Qualify deletion/cleanup claims; sharing remains independent of learning |
| S10 | Cloud README Decisions D13 | Idle refresh and cached-only prepare |
| S11 | Agent plan §5 sync_jobs and cloud_sync_status | Durable per-field latest intent and acknowledgement; local schema deferred |
| S12 | Agent plan §7 M2 SPA additions | Stable unlisted link; queued cloud deletion; automatic idle cached reviews |
| S13 | Orchestration advisor-context list | No tasting-text or flavour-axis propagation |
| S14 | Orchestration architecture diagram and Local Application | Idle refresh and cached-only prepare; upload arrow is a logical completion trigger, not a control-loop cloud wait |
| S15 | Orchestration responsibility/code sketches | Independent consent and sharing; cached-only prepare; sketches non-normative |
| S16 | Orchestration Flow 1 next-roast illustration | Non-normative temperature example superseded; Celsius only, no invented conversion |
| S17 | Orchestration Privacy and Ethics | Unlisted approved curves, learning default-on/opt-out, explicit queued deletion |

## 14. Traceability matrix

| Requirement | Sections carrying the requirement | Supersession pointers |
|---|---|---|
| R1 | §2 R1; §7 eligibility and immutable start marker | S11, S12 |
| R2 | §2 R2; §3 closed public fields; §5 stable identity | S4, S12, S17 |
| R3 | §2 R3; §3 private operator notes; §5 rejected notes | S4, S12 |
| R4 | §2 R4; §6 independent consent | S2, S8, S15, S17 |
| R5 | §2 R5; §5 field merge and explicit clear | S4, S11, S12 |
| R6 | §2 R6; §5 durable intent; §6 consent ordering | S3, S11 |
| R7 | §2 R7; §8 tombstones and stage residuals | S5, S9, S12, S17 |
| R8 | §2 R8; §9 complete HTTP review reads | S6, S12 |
| R9 | §2 R9; §10 idle references and cached prepare | S1, S7, S10, S13, S14 (diagram and Local Application), S15 |
| B1 | §3 single principal and private/public boundary | S2, S8, S9, S17 |
| B2 | §4 separated domain, orchestration, adapters and presentation | S11, S15 |
| B3 | §5 versioned curated export and per-field acknowledgement | S3, S4, S11 |
| B4 | §8 qualified server ordering and separate stage effects | S5, S9 |
| B5 | §9 HTTP pagination, existence/visibility and content ETags | S6, S12 |
| B6 | §10 proven bounded idle work; no new numeric budget | S1, S7, S10, S14, S15 |
| B7 | §11 separate PRs, fresh contracts, reviewers and gates | E15/C9 allocations and S11, S12 |
| B8 | §12 operator-only G1-G6; feature-off until qualified | S5, S9 |
| B9 | §2 R1; §7 capture, immutability, local-only marker and four proofs | S11, S12 |

## 15. Residuals

Content-based ETags can reduce response bytes without reducing warehouse queries
or cost. Late uploads and crashes need explicit qualification against tombstones,
consent ordering and recomputation. Stage-file erasure is non-atomic with row DML;
cleanup and retention residuals must be recorded rather than promised away.

The test-run-marker question is answered. Its later implementation and behavioural
proof remain undelivered by this prose slice; physical acceptance remains separate.
No runtime, live cloud or operator-gate evidence is created here.
