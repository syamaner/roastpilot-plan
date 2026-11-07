# D227: #954 successor candidate after D225 recovery delivery

## Effect and ratification

This record has no effect before explicit repository-owner ratification of
its exact Plan pull-request head and verified merge. Ratification is recorded
in a repository-owner comment on that pull request naming the exact head.
After merge, verify that both decision files, `roastpilot-agent/plan.md` and
this file, match the ratified head, and record the merge SHA and tree in a
repository-owner comment; squash-merge provenance does not substitute for
this file-content check. If either merged file differs from the ratified
head, D227 has no effect and needs a new explicit decision.

The Plan repository's `main` has no branch protection. This record may merge
only under a fresh one-off owner merge decision for its concrete reviewed
pull request; no earlier merge exception, including the one given for Plan
PR #92, carries over. No repository setting or protection is changed, and no
Agent or Plan protection is bypassed.

On ratification and verified merge, the D210/D211 historical evidence
identified in the D224 execution record satisfies the cold-load sequencing
prerequisite for the exact successor candidate below only. No second implicit
qualification-reuse approval is required. This is not a new cold run or cold
qualification, does not admit published MCP 0.2.4 to cold mode, supplies no
measured live-runtime headroom and establishes no hardware readiness. The
original D210/D211 outcomes, including the original exit-6 `NOT_CONFORMANT`
result, and every failed dry attempt remain unchanged; no failed result
becomes a pass. Candidate admission is conditional and is not hardware
readiness. Final live acceptance remains a separate human decision.

This clarifies D183/D191's material-identity clauses and D192's fresh-
characterisation sequencing clause only for this successor: by ratifying this
record, the owner determines that the identified changes since the qualified
historical Agent and the D224 candidate are non-material for the
characterised cold-load prerequisite. Those clauses otherwise remain
unchanged.

Agent decision numbers in this record refer to `roastpilot-agent/plan.md`.
Cloud decisions D220 to D223 and D226 in `roastpilot-cloud/plan.md` are
separate records.

## Relationship to D224 and D225

The D224 row and its execution record remain immutable historical records.
D224's Agent binding (reviewed source
`7ed3b787a608bb48a0789d211ef94749b035973a`, tree
`4c11333b68df271ed3998af73ba62836f29a9240`, wheel SHA-256
`96cdfce574045aaed92fbf3f48d5dd8b9889deb75f58e7d7299f7bcc4758b79c`) does not
transfer to this successor.

This successor incorporates by reference, unchanged, every condition,
identity and configuration check, threshold, interval definition, proof
obligation, evidence-retention rule, attempt rule and human-authority
boundary in `roastpilot-agent/pi-live-acceptance-d224.md` at Plan commit
`f433876e42de5f5f923fb46f0bc05b088b5723ec`, file SHA-256
`fcc2b4a0a0edb108f60f6cf20098d75789b3daf948a19319e6336e98596027d7`, subject
only to these substitutions:

1. Every reference there to the intended or candidate Agent source, tree,
   wheel or payload, including the accepted identity delta for the exact
   Agent source/wheel identity, means the successor Agent binding below.
2. The prerequisite that protected delivery of reviewed `7ed3b787` be
   recorded in an owner comment before ratification is replaced by the
   direct protected-merge binding below.
3. The D224 independent static review handback (SHA-256
   `610a5eb7af0b4a653b47230a2fc83ef2e287cf87328489ff598c0238c115f03b`)
   remains D224 history; this successor's review binding is under
   "Materiality assessment and disclosure".
4. The phrase "two Agent SQLite store reads per cold health call versus one
   (with no MCP call)" is replaced by the cold-health disclosure below. Every
   other unmeasured cost listed in that paragraph remains.
5. The static comparison counts there are supplemented, not replaced, by the
   counts below.

No other D224 term is substituted, relaxed or removed. Where this record
restates a D224 term, the restatement never narrows it; if a restatement and
the D224 record appear to differ, the stricter reading applies and
progression is blocked until the owner resolves the difference.

D225 clauses 8, 9 and 10 in `roastpilot-agent/plan.md` at the same Plan
commit apply exactly as written. Under clause 9, this record is the
separately ratified successor candidate binding. Under clause 8, the ordering
below governs this successor's dry preflight. Under clause 10, retirement on
the retained Pi database remains a separate later operator action. No
threshold, cold-admission or qualification requirement is weakened or
waived.

## Exact successor identity

| Item | Binding |
| --- | --- |
| Protected Agent merge | `1a9c27118ab804d64a564e75158072b758f3b898` |
| Protected Agent tree | `8bbbf7cec73e06bc488db4a6915ca2446da4ade3` |
| Reviewed Agent head | `b721106f283eb81314fd3636d011727e366042f2`; complete tree equal to the protected merge |
| Agent wheel | `roastpilot_agent-0.1.0.dev0-py3-none-any.whl`, SHA-256 `e54f0f3f82523b1ada0a21411d00b68be0d5bbfe18d6709cc067d1a2dbc160bb`, built from the protected merge |
| MCP | Published `coffee-roaster-mcp==0.2.4`, source `e2fab8e910e7bff59d158b612c19e17d33a765c2`, wheel SHA-256 `b11b6764b520bbb7662d4f82841949322222c239a1024d7cc4c74f1875020b70` |
| Dependency boundary | 93 distributions; the 91 non-Agent/MCP distributions preserved byte-for-byte; dependency-file manifest SHA-256 `703997fa6e0d0950dc5b11fa6e2ea12732f33e1e892b1fc0925439cf18dba576`, defined as in the D224 record |
| Qualified historical Agent | Source `fcd457492c300712491e0bcb2ae9dcb4b55535b6`, original wheel SHA-256 `f3313ceef9846770ba00affd8708dc3d74871402b620072a125eef067715900e` |
| Prior D224 Agent (not transferred) | Source `7ed3b787a608bb48a0789d211ef94749b035973a`, wheel SHA-256 `96cdfce574045aaed92fbf3f48d5dd8b9889deb75f58e7d7299f7bcc4758b79c` |
| Qualified historical MCP wheel | Unreleased 0.2.2 candidate, SHA-256 `4f52048efa4c368e785c30acface04356dd943583a251e02a9b635905dec476a`, as identified in the incorporated D224 record |
| Live recipe input | Restored Brazil Santos (Natural), retained input SHA-256 `b8ca3bfa8c4ae536ca36c540e1398c24d0b5484fbf55b3a011ac84dcbb3267d5` |

The parent delivery session attests that the final wheel's 63 Python payload
files equal the protected committed source, its 40 SPA payload files equal
the independently reviewed synthetic-capture bundle, its RECORD hashes and
sizes verify, and its runtime dependency requirements equal those of the
D224 candidate. These are host attestations, not independent re-hashing and
not installed-Pi verification. Before any progression, the installed Agent,
MCP, SPA and dependency bytes on the Pi, and the frozen configuration,
model, provider, prompt, host, devices, power and cooling, must satisfy the
unchanged D224 verification boundary with this record's Agent substitution.
No dependency resolver run or upgrade is authorised, and no cold-admission
rule changes automatically. Any changed dependency bytes or versions
invalidate this candidate boundary.

The qualified cold advisory context was synthetic `Cold characterisation`
with a 195 °C target, not a saved bean recipe; the live bean profile is not
historically identical to it. The operator-selected live recipe is the
restored Brazil Santos (Natural): 250 g, 195 °C drop, 14% development,
initial heat 100%, fan 30%, charge guidance 170-200 °C. Its retained input
SHA-256 is computed over the original UTF-8 JSON input-file bytes with no
canonicalisation or whitespace/newline changes. Before import, verify those
exact bytes; after normal API import, compare every parsed original input
field with the server profile, excluding only server-generated metadata.
Freeze and verify that normal server profile before the actuating preflight
and the live run. This is the existing cold-to-normal-live lifecycle
distinction, not measured equivalence of live advisory context or load.

## Materiality assessment and disclosure

Endpoint comparisons of the actual wheels show 50 of 63 Python files
byte-identical to the original qualified wheel and 60 of 63 byte-identical to
the D224 wheel. Only `api.py`, `models.py` and `store.py` differ from the
D224 wheel. The cold engine, MCP client, two-phase checker, conformance
modules, cold app, cold CLI, cold runner, configuration and safety modules
are byte-identical to the D224 wheel, as are its `METADATA`, `WHEEL` and
entry points, so declared dependencies are unchanged. The recovery change
adds no module, dependency, third-party import or migration; the migration
count remains 21. The built SPA changes with the reviewed recovery UI; the
cold characterisation page chunk is byte-identical across the original, D224
and successor wheels (host attestation). This inventory alone does not
establish non-materiality.

The independent high-effort authenticated Claude Opus 5.5 static assessment
has result SHA-256
`a410e1c083c861f6754489233879394f4a0e71b914f169d2c1a027e7c9b535b9`, and its
completed factual supplement has result SHA-256
`a03a6f4d7d93fc5fa2b9eee7b76bd3590f222c5016e67d0963af91531946bdee`. Both
processes terminated successfully; the parent audited their actual tool,
model and path transcripts and their unchanged inputs. They read only
software inputs and no raw Pi evidence. They are static software assessments,
not runtime measurements, and they did not re-hash the artifacts. The
supplement corrected the cold-health count and widened the live-cost
description; the parent resolved its two remaining factual points from
protected source: the public lease reader delegates to the connection
reader, and a fresh cold store has trusted lease absence. Current
conclusion: bounded non-materiality is supported for the characterised cold
workload only, with no blocker and no timing, headroom or acceptance claim.
The D224 assessment and the D210/D211 interpretation remain evidence, never
automatic authority for this successor. Any uncertain or material unlisted
delta blocks this ruling.

Changed capabilities, as assessed:

- The health rework is reachable in cold, because the cold app builds an
  ordinary service with no roaster, MCP client or advisor.
- Classification of a run-bound CLOSED lease against its close audit is
  unreachable in cold, where the fresh private store has no lease row; it
  applies to every live read of such a lease.
- Stranded-fault retirement is unavailable in cold: no retirement identity
  is captured, no MCP call or reconciliation occurs, and the cold read-only
  guard answers 409 to any mutating request. Live retirement makes one MCP
  session-presence read and one store-only durable transaction on a
  dedicated connection, makes no actuator call, never auto-resumes, and
  leaves restart clearance REQUIRED.
- Emergency-stop dispatch tracking adds a constant-cost set that only blocks
  retirement admission.
- Models add one enum, four Pydantic models and two health projection
  fields.
- The SPA adds the retirement card, its request hook and pure parsers. It
  adds no query, polling interval, timer, event stream or route; the
  retirement request is sent only when the operator submits after all four
  confirmations, followed by one health refetch.

Cold-health disclosure (replacing the D224 phrase in substitution 4): this
wheel performs eight read-only Store calls per cold health call on the
existing main connection: three fault-lease reads (before the snapshot,
inside it, and a refresh that always runs in cold because no retirement
identity is captured), two active-run reads, one latest-run read, one
process restart-clearance read and one provenance absence probe of a single
SELECT. It performs no write, no MCP call and opens no dedicated connection;
the D220 initialisation probe and the fault-control store and MCP reads are
skipped in cold. The count is eight because the run-private cold store is a
newly created empty version-zero database, so lease absence is trusted and
the generation-zero lease reads CLOSED; if absence were untrusted, the lease
would read UNKNOWN, the provenance probe would be skipped and the count
would be seven. Against empty tables the cost is constant; its wall time is
unmeasured. The cold page issues no health requests. Existing normal
operator pages still poll health every three seconds, so an operator route
open during a cold run would cost these reads on each poll instead of two.
Whether any client polled health during the historical cold runs remains
unknown.

Unmeasured live costs, never cold-characterisation or live headroom proof:

- The review found no `operator_actions` index in any of the 21 migrations.
  While the live lease is a run-bound CLOSED lease, each health call makes at
  least four, and five when the refresh read runs, close-audit
  classifications, each scanning `operator_actions` with JSON validation of
  every matching row.
- The latest-run read and each of the two active-run reads scan unindexed
  `roast_runs` columns and parse the returned profile and, for the latest
  run, configuration JSON.
- Live health still persists process-epoch and clearance rows on its first
  call and performs MCP fault readbacks while a fault lease is OPEN.
- The retirement action's dedicated connections, `BEGIN IMMEDIATE`
  transaction and fsyncs under WAL with `synchronous=FULL`.
- Import-time construction of the new model classes, the larger health JSON,
  and browser parsing of the changed shared or entry bundle if the browser
  runs on the Pi.
- History-dependent growth of the table-scan and matching-row parsing costs above; no timing or headroom is measured.
- The D224 residuals remain: 21 rather than 16 migrations on each fresh
  run-private cold store, the SciPy import and recording-on recorder
  construction inside the first `start_roast_session`, and whether that call
  completes within its bound.

No headroom or readiness is inferred from static evidence. The supervised
startup, resource and live gates decide.

D191's N=1, X=200 ms and production fatal streak 30 remain locked. D210's
10-minute recording-off plus 10-minute recording-on characterisation and
D211's policy 4 interpretation revision 1 remain unchanged and
reproducible. Published MCP 0.2.4 remains not cold-admitted. No version
literal, historical reader, result schema, temperature screen, advisory
window or timeout changes. This record closes neither MCP #157 nor #194.

## Retained database action and dry preflight

Candidate admission itself authorises no Pi connection, installation,
database action, reboot, recording, actuation, bean charge or live run.
Each later physical step requires fresh bounded operator authority under the
D224 record and D225.

Retirement on the retained Pi database (D225 clause 10) is a separate later
operator action on this candidate after admission, requiring fresh bounded
operator authorisation with physical presence. Before it runs, preserve and
verify a private copy of the pre-retirement database through the established
two-copy checksummed evidence workflow. Preserve the stranded failed attempt
and all its evidence unchanged. Use only the governed server action
**Confirm stopped roaster and retire stranded fault**; no manual SQLite
edit, database replacement or substitution is allowed. Retirement is
bookkeeping only, not observed hardware safe-zero or D212 proof, and grants
no Start. A separate new D213 physical confirmation and a new typed
current-child no-session proof are required before Start can become
eligible. A failed or uncertain retirement requires human disposition.

Use the same verified frozen recording-on configuration for the empty dry
preflight and the live run, identity-verified before the supervised idle
reboot and first-session measurement. Any configuration change after
preflight invalidates that preflight and its startup measurement. The first
normal `start_roast_session` after an authorised idle reboot, with no active
run and the roaster physically stopped, must complete within the unchanged
`call_timeout_seconds = 5.0` MCP session-call bound; repeated warm starts,
artificial warm-up or cache seeding never substitute for that measurement,
and a timeout or uncertain startup is a failed preflight. The operator
remains beside the empty stopped Hottop with the independent physical stop
accessible and ventilation ready. A D213 clearance valid for the current
Agent process precedes every Start. The pre-retirement backup precedes
retirement, and retirement and its subsequent D213 clearance precede any
Start; the later bounded physical authorisation fixes an order satisfying
all of these constraints and adds no other step.

The dry preflight follows D225 clause 8 in this order: empty normal preheat
at the selected profile's targets; software emergency stop with positive
`driver_safety_method_called` evidence from the existing MCP append-only
event log, never inferred from API acceptance or lease persistence; physical
heat-off confirmation; D212 Stop cooling and acknowledge with fresh
exact-session typed safe-zero proof and confirmed durable closure; only then
graceful Agent restart; operator confirmation plus retained server evidence
of no automatic heat or fan resume and no actuator write before clearance;
a new D213 clearance. If D212 closure is not durably confirmed, do not
restart: stop, retain the attempt as failed and obtain human disposition
before any retry. Retirement is not a planned step of a passing preflight,
and no heated mid-run crash or recovery exercise is added. Any additional
physical procedure or retry needs fresh bounded operator authority.

During the authorised preflight, before live GO, the existing read-only
evidence collector must demonstrate that it retains the necessary boundaries
and metrics; an unavailable measure is reported as unproven, never replaced
by elapsed time or a source-only assumption. No instrumentation or threshold
change is authorised.

## Live authority and acceptance retained

A clean dry preflight is followed by a separate immediate operator live GO;
no beans are charged before it. The observation requirement remains at least
1,200 seconds of continuous collector monotonic time, anchored at the
collector's first confirmed snapshot after a successful normal live-session
start, containing one complete normal roast through drop and cooling and
supervised heat-zero idle if needed. No profile, preheat, charge timing or
development choice changes to reach the minimum, and drop, cooling, abort
and emergency stop are never delayed or shortened for the clock. An abort or
emergency-stop outcome is retained as a safety outcome and does not qualify.

The capture, inference-eligible, all-session inference and full observation
intervals of the D224 record apply unchanged: capture from session start
through drop; inference-eligible from the automatic T0 pending-audio discard
through first-crack detection, or drop if detection remains pending; actual
all-session inference including any post-drop pending-window processing;
and the full observation window. D191 N=1, X=200 ms over the trailing 60
seconds and fatal streak 30, zero incremental dropped detector windows and
zero inference overruns in the eligible interval, maximum inference duration
below the seven-second hop across all session inference, and no growing
queue remain required; a post-drop overrun is a failure. Producer zeros alone
prove no activity: positive processed-window evidence with correlated
session, capture and mode continuity and unambiguous boundary ordering is
required. Running maxima are not subtracted, all overruns and preheat and
post-detection queue counters are reported separately, and missing or
ambiguous measures are unproven, never a zero delta.

Retain the complete primary WAV and sidecars, the controller, advisor and
operator decision and safety trace, restart and recovery state, MCP, audio,
inference and host metrics, process and capture continuity and actual
sample gaps. Host bounds remain: 80 °C abort/alarm, clean current and sticky
under-voltage, capping and throttling bits from the validation boot, at
least 512 MiB MemAvailable, and at least 2 GiB free disk before start and
1 GiB throughout.

Every attempt, passing or failing, is listed and kept in the two-copy
checksummed private evidence workflow, and none is combined or discarded in
favour of a later pass. A failed or uncertain attempt requires human
disposition before retry, and each new attempt needs a fresh supervised dry
preflight, a valid current-process D213 clearance and a new immediate live
GO. Process or child replacement, unexpected capture restart, lost
supervision, uncertain continuity, a manual T0 without the discard boundary
or a manual first-crack truncation cannot qualify. Independent read-only
evidence review and explicit operator acceptance remain required. Only
sanitised findings and private-manifest hashes may enter Git.

## Status and exclusions

This record changes no Agent file, epic status table, registry entry or
GitHub status. #954 remains open and E11-S3 remains in progress until its
remaining acceptance is actually satisfied. It does not absorb MCP #157 or
#194 and grants no release, publication, deployment, hardware-validation,
general hardware-readiness or live-acceptance authority.
