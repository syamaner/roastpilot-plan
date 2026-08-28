# F2 — Autonomous spec chain + operator-comment contribution

**Status: DRAFT for operator review (26 Aug 2026).** Iterate by commenting inline
or on the story issues once filed. Folds into `factory.md` §10 (autonomy ratchet)
and the §11 milestone table once ratified. This is the front-half-of-autonomy
milestone: it makes the pipeline take an issue from filed → specced → triaged →
`ready-to-implement` → PR open with no interactive session, and it gives the
operator a first-class steering channel via issue comments.

## Goal

Auto-wire the spec chain the operator named:

```
to-issues  ─▶  story-planner  ─▶  triage  ─▶  ready-to-implement  ─▶  (implement, PR open)
   │               │               │                                        ▲
 (PM-reviewed   (writes the     (validates the                    operator comments
  draft, human   contract on     specced issue                    steer any hop  ─┘
  files stories) the issue)      against §5/D104)
```

## Locked operator decisions (26 Aug 2026)

- **D-F2-1 — trigger topology: spec-first.** A filed story runs `story-planner`
  first (contract posted on the issue), THEN `triage` validates the *specced*
  issue against §5 + the D104 bar. This re-sequences the current
  `triage-issues.yml` trigger, which fires on `issues:[opened]` against the raw
  issue. (The raw-open triage becomes a cheap "is this even a story / needs-info"
  pre-filter; the load-bearing readiness gate runs post-`story-planner`.)
- **D-F2-2 — minimal comment grammar.** Start with `/approve` and `/respec`
  only; widen later if warranted. Small deliberately, to bound the security
  surface of a comment-triggered dispatch.
- **D-F2-3 — new milestone F2.** Tracked as its own milestone, not folded into an
  existing F1 story. It is nonetheless §10 autonomy-ratchet work and advances that
  track record.
- **D-F2-4 — scope = front-half only.** F2 delivers issue → spec → triage →
  `ready-to-implement` → PR open, autonomously. The **fold loop** (review findings
  → applied fixes) and **merge** stay human, because owner-task-apply / autonomy
  dial-1 is **#237-walled** (the task-agent's `Read` provably escapes to a
  co-resident credential). Discharging #237 needs a new task-agent isolation
  architecture and is a **separate track**, explicitly out of F2 scope.

## The honest boundary

F2 stops exactly where the factory stops today: PR open, CI green, reviews in,
**human folds and human merges**. What it removes is the interactive session
driving the *front* half (decompose → spec → triage → dispatch). The 26 Aug
#337/#356 session is the evidence for why the fold half cannot be in scope: every
PR that session opened drew a fold or a judgment call (a live SQL bug, connector
precision nits, a registry consistency miss), and applying those is precisely the
#237-walled capability.

## Current state (what's already built)

| Leg | State | F2 action |
|---|---|---|
| `triage` | Wired: `triage-issues.yml` on `issues:[opened]` + dispatch | **Re-sequence** to run post-`story-planner` (D-F2-1) |
| `story-planner` | Agent only (`.claude/agents/story-planner.md`), orchestrator-invoked; NOT workflow-wired | **Build the workflow** (Story A) |
| `owner-command-intake` | **Built but DARK** (`owner-command-intake.yml`, `issue_comment:[created]`, gated `OWNER_COMMAND_INTAKE_ENABLED`) | **Enable + harden** (Story C) |
| `to-issues` | Skill, PM-invoked, draft output | **No automation** — human-approved decomposition invariant holds (Story D) |
| implement stage-2 auto-trigger | Coded (`issues:[labeled: ready-to-implement]`), gated off | §10-gated, later (Story E) |

## Stories (dependency-ordered) — pre-`to-issues` sketch

Each needs the full §5 intake-bar shape (plan link, diff-verifiable ACs, D104 PR
plan, routing) before it is `ready-to-spec`. Sketched here for review.

### Story A — `story-planner` as a read-only workflow  *(the missing leg)*
Triggered by the `ready-to-spec` label (D-F2-A1). Run the `story-planner` agent on
the labelled story issue; post the implementation contract as an issue comment.
**Read-only + comment-sink only**, on the #192/#204
injection-hardened lineage: base-owned config restored from a
trusted revision before the agent runs, tool-catalog closure asserted against the
**correct residual** — story-planner NEEDS repo readers (Read/Grep/Glob, ±
retrieval) to write a contract, so its permitted catalog is
*readers + one comment sink, everything egress/execution/write denied*, NOT the
`claude-code-review.yml` metadata-only (`[ToolSearch]` + sinks, no readers)
closure it cannot literally mirror — no repo write / no code / no egress beyond
the single comment sink. A poisoned issue body
must not be able to steer the contract into anything but comment text (the
orchestrator-verifies-before-posting property, #162, becomes a workflow-side
completion + contract-shape assertion). Likely 3 slices: (A1) agent + workflow
wiring + comment sink; (A2) injection hardening (config restore / tool-catalog /
trusted-revision), reusing the `claude-code-review.yml` pattern; (A3) completion +
contract-shape assertion (the fields D104 needs are present, non-vacuous).
**Reviewer: `factory-security-reviewer`.**

### Story B — chain sequencing: two-mode `triage`
Give `triage` two modes (D-F2-A1): a **pre-filter** on `issues:[opened]` that
applies `ready-to-spec` to genuine stories (or `needs-info` / closes a non-story),
and the existing **readiness** gate that now runs *post-contract* (after Story A
posts) to move `ready-to-spec → ready-to-implement` against §5/D104. The
`ready-to-spec` label is the seam between them and the manual/retroactive entry
point. **Reviewer: `factory-security-reviewer`.**

### Story C — operator-comment contribution: extend + enable `owner-command-intake`  *(security keystone)*
Add the `/approve` + `/respec` verbs (D-F2-2) to the EXISTING verb grammar
(D-F2-A4 — not greenfield). **Owner-identity auth, fail-closed** already exists
(`factory-owner-allowlist.mts`; a stranger's `/respec` is inert — the repo is
public). Comment body is **untrusted input**, already nonce-fenced (#194 lineage;
never interpolated into a privileged prompt unsanitised). Both new verbs live
under `OWNER_COMMAND_INTAKE_ENABLED` only and must not reach the
`OWNER_TASK_APPLY_ENABLED` (#237-walled) task-apply path. Each command re-triggers its chain hop:
`/respec` re-runs `story-planner` folding the comment as input; `/approve`
advances the readiness transition. Enabling a comment-triggered privileged
dispatch is the highest-risk piece here. Likely 3 slices: (C1) grammar + owner-auth
+ fail-closed parse; (C2) command→action wiring; (C3) the dark→live enable
(`OWNER_COMMAND_INTAKE_ENABLED`), an explicit operator ratchet step.
**Reviewer: `factory-security-reviewer` + adversarial tests.**

### Story D — `to-issues → story-planner` handoff
to-issues stays PM-reviewed (decomposition is human-approved by design). The chain
link is "filed story → `story-planner`" (Story A's trigger). Recommend to-issues
gains **no** automation. Small. **Reviewer: `factory-security-reviewer`.**

### Story E — (downstream, §10-gated) implement stage-2 auto-trigger
`ready-to-implement` → auto-dispatch implement. Exists in code, gated on the §10
clean-dispatch track record. Enabling closes the loop to autonomous PR-open.
Separate, later. **Reviewer: `factory-security-reviewer`.**

## Sequence + the C3 dogfood

A → B first (they make the chain real), then C (the steer channel), with D
alongside A. E is §10-gated and last. **C3 is F2's first live test:** once A + B
land, the C3 `to-issues` draft (produced but held, 26 Aug) flows through the chain
instead of being hand-driven, generating the §10 track-record the ratchet needs.

## Relations / dependencies

- **#10 (F1-S7 pipeline supply-chain + self-modification hardening)** — every new
  privileged-ish workflow (Story A, Story C) folds into that hardening; F2 must not
  weaken it.
- **#328 (spec-grounding AC extraction robustness)** — adjacent triage/spec quality;
  a specced-issue triage (D-F2-1) leans on AC extraction working on the real corpus.
- **#237 (task-agent Read escape / dial-1 fold-wall)** — the boundary F2 does NOT
  cross (D-F2-4); the fold-half track.

## Resolved sub-decisions (operator, 26 Aug)

- **D-F2-A1 — Story A trigger: the `ready-to-spec` label** (operator-revised — more
  flexible than on-open). `story-planner` fires when an issue gains the
  `ready-to-spec` label, which the on-open `triage` pre-filter applies to genuine
  stories AND which the operator/PM can apply manually to pull any issue — new or
  old — into the chain. This filters non-stories (bugs, questions, duplicates)
  before the opus `story-planner` runs, allows retroactive/manual entry, and reuses
  the existing label taxonomy (`ready-to-spec` = "needs a spec before building").
  Still spec-first per D-F2-1: the on-open triage is only a lightweight
  is-this-a-story classifier; the load-bearing D104 readiness gate runs *post-contract*
  to move `ready-to-spec → ready-to-implement`. So `triage` has two modes — pre-filter
  (on open → applies `ready-to-spec` / `needs-info`) and readiness (post-contract →
  `ready-to-implement`). (Supersedes the initial on-issue-open reading.)
- **D-F2-A2 — `/respec` = full re-run.** `/respec` re-runs `story-planner` from
  scratch, folding the operator's comment as additional input, and replaces the
  contract. Simpler and safer than incremental contract-patching (no merge logic to
  exploit); an incremental fold is a later optimisation only if full re-run proves
  too coarse.
- **D-F2-A3 — Owner-identity = GitHub actor-login allowlist.** Only comments whose
  `github.actor` is on the allowlist act; every other `/`-command is inert
  (fail-closed). A stronger binding can layer on later if the allowlist proves
  insufficient.
- **D-F2-A4 — F2-C reuses the existing `owner-command-intake` security surface;
  it is NOT greenfield (operator, 26 Aug, from the F2-A..E D104 review).**
  `owner-command-intake.yml` + `scripts/factory/owner-command-logic.mts` already
  ship the load-bearing pieces: a leading-command verb grammar (`question` /
  `task`, ASCII-folded), owner-identity auth (`factory-owner-allowlist.mts` /
  `isFactoryOwnerLogin`, already fail-closed), nonce-fenced untrusted-body
  handling (the #194 lineage), and a **separately gated** task-apply path
  (`OWNER_TASK_APPLY_ENABLED`, the #237 dial-1 wall). So F2-C ADDS two verbs
  (`/approve`, `/respec`) to that existing grammar and wires them; it does not
  rebuild the allowlist / parse / fence. **Both new verbs live under
  `OWNER_COMMAND_INTAKE_ENABLED` only and MUST NOT reach the
  `OWNER_TASK_APPLY_ENABLED` path**: `/respec` re-runs the read-only
  `story-planner` workflow (F2-A), `/approve` advances the F2-B readiness label
  transition — neither is a repo-patch apply, so the #237 wall is untouched. C1
  therefore shrinks to verb-addition + wiring, and its adversarial tests target
  the "new verb cannot escalate into the task-apply path" property.

- **D-F2-A5 — F2-A posts via a deterministic publisher, NOT the model (Option B;
  operator, 26 Aug, from the story-planner contract's F-0.3 fork).** story-planner
  runs in **agent mode**: the model holds **no write credential** (its job is
  `issues: read`; it writes the contract to a scoped output file via a narrow
  `Edit(<output path>)` grant, the `triage-issues.yml` pattern), and a **separate
  deterministic publisher job** (the sole `issues: write`) validates the
  contract's shape/markers/sentinel **before** posting exactly one comment
  (`scripts/factory/post-owner-command-response.mts` / `apply-triage-verdict.mts`
  pattern). This supersedes the drafted AC3 "one comment sink in the model's
  residual" (Option A / tag-mode) reading: story-planner's issue→contract-comment
  shape IS the triage/owner-command sibling pattern, not the PR-diff-review shape
  claude-code-review uses tag mode for. Rationale: (a) no write credential in the
  model's environment; (b) AC5 becomes a **pre-post** deterministic gate so a
  vacuous or prompt-injected-forged contract is never published (Option A's
  post-hoc assertion is benign-truncation-sound but adversarially forgeable); (c)
  D23-aligned (the deterministic publisher, not the model, decides what posts);
  (d) no unverified tag-mode-on-`issues:labeled` probe needed. The catalog residual
  (F-0.1) stays readers-only (`Read`/`Grep`/`Glob`/`LS` + `ToolSearch`) + the
  scoped `Edit` output grant; no retrieval tool (auggie MCP is not wired in-runner),
  no comment MCP sink.

- **D-F2-A6 — F2-A PR-1 registers-after-merge for the halt-inventory bootstrap
  (operator, 26 Aug, from PR-1's factory-integrity test failures).** Adding a
  `FACTORY_PAUSED`-gated model-invoking workflow trips three factory-integrity
  inventories (`runbook-halt-inventory`, the claude-action token-count, the #120
  execution-surface accounting). The halt-inventory needs the workflow's **numeric
  GitHub workflow ID**, which GitHub assigns only **after** the file is on the
  default branch (verified: two empty `actions/workflows` API queries from the
  pushed branch; and #242 history shows the established pattern is
  register-after-merge — `codex-verdict-status` (#225) and `owner-command-intake`
  (#230) merged dark FIRST, then #242 created the halt test + runbook entries
  retroactively). story-planner is the **first** gated workflow added AFTER that
  test exists, so it is the first to hit the bootstrap. Resolution: **PR-1 ships
  story-planner gated by `STORY_PLANNER_ENABLED` only (no `FACTORY_PAUSED`
  conjunct)** — so it is not classified gated, the halt-inventory/runbook needs no
  change, and PR-1 is green with only the two ID-free inventory updates
  (execution-surface totals + a delta comment; token-count 7→8). The
  `FACTORY_PAUSED` gate + runbook entry (with the **real** ID) land in a follow-up
  once main assigns the ID — bundled with activation (F2-C's dark→live enable) or
  a fast-follow. While dark, story-planner cannot run, so honoring `FACTORY_PAUSED`
  is moot; and a placeholder ID (the rejected alternative) would ship a
  knowingly-wrong operational runbook entry.

- **D-F2-A7 — resolve the connector P1 (Read-scope credential-exfil) by empirical
  probe before merging #371 (operator, 26 Aug).** The Codex connector posted a P1
  on story-planner's `Read(./**)` scoping: it claims scoped `Read(...)` only
  auto-approves matching reads and does NOT revoke the action's default read
  access (citing `owner-command-intake.yml:163-166`), so `/proc/self/environ` →
  `CLAUDE_CODE_OAUTH_TOKEN` → verbatim comment stays reachable. This CONTRADICTS
  `factory-security-reviewer`'s CONFIRMED-CLOSED, which relied on the PR-#78 probe
  (`Read(review-context/**)` denied an absolute read, `permission_denials_count:1`)
  but INFERRED the exact `./**` form. The evidence leans fsr (a live probe beats an
  assertion), but a credential-exfil P1 with a documented repo contradiction is not
  waved through. Per the repo's "confirm with a probe, don't guess" standard
  (#20/#22/#78), resolve empirically: adapt `task-agent-read-confinement-probe.yml`
  on a throwaway branch to grant the exact `Read(./**),Grep(./**),Glob(./**),LS(./**)`
  form, attempt an out-of-workspace/absolute read, and assert
  `permission_denials_count >= 1` (read-confinement-probe Environment gate + probe
  token, NOT the real credential). Denied → P1 resolved with evidence → merge;
  allowed → the vector is real → redesign before merge. #371 stays PARKED (not
  clean; P1 unresolved) until the probe settles it. Also fold the connector P2
  (`isSubstantive` accepts a single char → strengthen the non-vacuity check).

With these, F2's design is stable. Next step: turn the five stories into a
`to-issues` draft batch (each with the §5 intake-bar shape) for PM review + filing.

## F2-C build decisions (operator, 28 Aug — issue #390, story-planner contract)

The F2-C `story-planner` contract (issue #390) surfaced that the existing
owner-command surface is **PR-scoped** while `/approve` + `/respec` are
**issue-scoped**, so the reusable parts are the leaf modules (grammar, allowlist,
nonce-fence, sanitizer), not the intake workflow or `deriveResponseAuthorization`.
Three build decisions, all operator-chosen:

- **D-F2-C1 — verb syntax = `@claude approve` / `@claude respec`** (extend the
  existing closed `{question, task}` verb set, reusing the hardened
  parse/ASCII-fold/fail-closed grammar). The plan's earlier `/approve` `/respec`
  slash notation (D-F2-2) is read as shorthand; the literal leading-slash grammar
  was rejected as a larger new parse surface for no security gain.
- **D-F2-C2 — architecture = a NEW isolated `owner-command-issue-intake.yml`,
  gated on `OWNER_COMMAND_INTAKE_ENABLED`, containing no task path at all
  (no `task-agent`/`task-apply` job, no `OWNER_TASK_APPLY_ENABLED`, no
  `contents: write`).** This makes the #237 keystone STRUCTURAL-BY-ABSENCE and
  leaves the byte-frozen PR intake (`owner-command-intake.yml`) untouched. **This
  AMENDS D-F2-A4**: F2-C still reuses the existing *leaf security modules* (not
  greenfield in that sense), but it does NOT extend the existing intake
  *workflow* the way D-F2-A4's "reuse the existing surface" was first read. The
  PR-scoped-vs-issue-scoped split (only discovered by reading the code during the
  #390 contract) is the reason. The new workflow ships dark on
  `OWNER_COMMAND_INTAKE_ENABLED` only (D-F2-A6 register-after-merge pattern: add
  the `FACTORY_PAUSED` gate + numeric-ID runbook entry at activation, not build).
- **D-F2-C3 — sequence: `/approve` first (C1 + C2a), `/respec` DEFERRED (C2b).**
  `/respec`'s target `story-planner.yml` is not dispatchable today, so `/respec`
  would have to add a `workflow_dispatch` + comment-fold input, expanding F2-A's
  trigger/injection surface and hitting the `allowed_bots: ""` activation
  obligation (#383). `/approve`'s target (triage readiness dispatch) is already
  built. So C1 (grammar + issue-scoped owner-auth + dark issue-intake workflow)
  and C2a (`@claude approve` -> `triage-issues.yml` `triage_mode: readiness`
  dispatch) build now; C2b (`/respec` + story-planner dispatch/fold) waits until
  the #383 / story-planner activation surface is settled. C3 (flipping
  `OWNER_COMMAND_INTAKE_ENABLED`) is an operator ratchet, out of scope for the
  buildable slices. `factory-security-reviewer` mandatory on every slice.
