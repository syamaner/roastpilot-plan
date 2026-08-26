# F2 — `to-issues` DRAFT batch (PM-review, not filed)

**Draft for operator review (26 Aug 2026).** Decomposes the F2 milestone
([`factory-F2-spec-chain.md`](./factory-F2-spec-chain.md), decisions D-F2-1..4,
A1..A3) into story issues meeting factory.md §5's intake bar. **Nothing here is
filed.** Per the pipeline self-modification invariant, every F2 story touches the
protected factory surface (`.github/**`, `.claude/**`, `scripts/**`), so each is
**conventional/interactive** work — it earns `ready-for-conventional-implementation`,
never the factory-dispatchable `ready-to-implement`, and routes to
**`factory-security-reviewer`**. Filing order: A → B → (C, D in parallel) → E.

Shared plan link for all stories: `factory-F2-spec-chain.md` + `factory.md` §10
(autonomy ratchet), §13 (self-modification). Shared reviewer: `factory-security-reviewer`.

---

## F2-A — `story-planner` as a read-only review-lens workflow

**Problem.** `story-planner` exists as an agent but is orchestrator-invoked only;
the chain cannot run without it as a workflow. Wire it to post the implementation
contract on a story issue, triggered by the `ready-to-spec` label (D-F2-A1),
read-only + comment-sink only.

**Acceptance criteria (diff-verifiable).**
- A workflow (`.github/workflows/story-planner.yml`) triggers on
  `issues:[labeled]` where the label is `ready-to-spec`, and no other issue event.
- The job runs the `story-planner` agent and posts exactly one issue comment
  carrying the contract; it performs **no** repo write, no code, no push, no
  network egress beyond that comment (assert the tool catalog is the permitted
  residual only, mirroring `claude-code-review.yml`'s metadata-only closure).
- Base-owned agent config is restored from a trusted revision before the model
  runs (event-pinned `base.sha` only when `base.ref` byte-equals the default
  branch, else default-branch tip; `--no-renames`; rm-before-checkout) — a PR's
  own `.claude`/`.mcp.json` cannot execute.
- A completion + contract-shape assertion fails the job closed unless the posted
  contract contains the D104-required fields (spec, behavioural + negative test
  list, PR plan, routing) non-vacuously.
- The prompt treats the issue body/title as untrusted input; a planted directive
  in an issue body cannot make the job write anything but comment text (negative
  test).

**Scope.** In: the workflow, the trigger, the injection hardening, the assertion.
Out: the `ready-to-spec` label application (that is F2-B's pre-filter triage) and
any auto-advance to `ready-to-implement` (F2-B's readiness gate).

**PR plan (D104, conventional slices).**
- A1 — workflow + `ready-to-spec` trigger + agent wiring + single comment sink (~250 logic lines). → `factory-security-reviewer`
- A2 — injection hardening: base-config restore from trusted revision + tool-catalog closure, reusing the `claude-code-review.yml` pattern (~200). → `factory-security-reviewer`
- A3 — completion + contract-shape assertion (fail-closed) + the untrusted-input negative test (~150 logic + tests). → `factory-security-reviewer` + `qa` if the test file exceeds 600 lines.

**Risk.** New model-in-workflow surface with a write sink; the #192/#194/#204
injection lineage is the threat model. Read-only + comment-only keeps it below the
owner-task-apply (#237) risk class, but the poisoned-issue → poisoned-contract path
must be closed by A2 + A3.

---

## F2-B — two-mode `triage` (pre-filter + post-contract readiness)

**Problem.** `triage` fires on `issues:[opened]` and judges readiness against a raw
issue. Per D-F2-A1 it needs two modes so the load-bearing D104 gate runs *after*
`story-planner` posts.

**Acceptance criteria (diff-verifiable).**
- On `issues:[opened]`, triage runs as a **pre-filter**: a genuine story is
  labelled `ready-to-spec`; a non-story is labelled `needs-info` (or closed with a
  reason). It does **not** emit `ready-to-implement` at this stage.
- After the `story-planner` contract is posted (F2-A), triage runs the **readiness**
  gate against §5 + D104 and transitions `ready-to-spec → ready-to-implement` only
  when the contract satisfies the bar; otherwise it stays `ready-to-spec` with the
  gap named.
- A manually-applied `ready-to-spec` label on any issue (new or old) enters the
  chain identically to the pre-filter's — the label is the single seam (D-F2-A1).
- Existing triage §5/D104 verdict contract and concurrency guards are preserved
  (no regression in the current `triage-issues.yml` behaviour it already enforces).

**Scope.** In: the two-mode split, the label transitions, the post-contract trigger.
Out: `story-planner` itself (F2-A), auto-dispatch of implement (F2-E).

**PR plan (D104, conventional slices).**
- B1 — pre-filter mode + `ready-to-spec`/`needs-info` labelling on open (~200). → `factory-security-reviewer`
- B2 — post-contract readiness trigger + the `ready-to-spec → ready-to-implement` transition against D104 (~250 + tests). → `factory-security-reviewer`

**Risk.** The readiness transition is the gate that authorises the factory to
build; a false `ready-to-implement` is a scope-escalation. Assert the transition
requires the contract fields present, and that the actor applying the label is the
workflow or an allowlisted human (ties to F2-C's identity model).

---

## F2-C — operator-comment contribution: enable + harden `owner-command-intake`  *(security keystone)*

**Problem.** The comment channel (`owner-command-intake.yml`) is built but dark.
Enable the minimal `/approve` + `/respec` grammar (D-F2-A2) under owner-identity
auth so the operator steers the chain by comment.

**Acceptance criteria (diff-verifiable).**
- Grammar is exactly `/approve` and `/respec` (D-F2-A2); any other slash-token is
  inert (fail-closed parse).
- **Owner-identity auth via `github.actor` allowlist (D-F2-A3):** a command from a
  non-allowlisted actor performs no action (negative test with a stranger login).
- `/respec` re-runs `story-planner` (F2-A) folding the comment as input and
  replaces the contract (full re-run, D-F2-A2); `/approve` advances the readiness
  transition (F2-B) for that issue.
- The comment body is untrusted input: it is never interpolated into a privileged
  prompt unsanitised (negative test — a command body carrying an injection cannot
  escalate beyond the two defined actions).
- The dark→live enable is a discrete, revertible step: `OWNER_COMMAND_INTAKE_ENABLED`
  gates the whole job; with it unset the workflow is inert.

**Scope.** In: the grammar, owner-auth, the two command→action wirings, the enable
step. Out: any command beyond `/approve` + `/respec` (later), auto-merge (never —
merge stays human).

**PR plan (D104, conventional slices).**
- C1 — grammar + `github.actor` allowlist auth + fail-closed parse + the negative auth/injection tests (~200 logic + tests). → `factory-security-reviewer` + `qa`
- C2 — command→action wiring: `/respec`→F2-A re-run, `/approve`→F2-B transition (~200). → `factory-security-reviewer`
- C3 — dark→live enable (`OWNER_COMMAND_INTAKE_ENABLED`) as an explicit operator ratchet step; docs the revert (~50). → `factory-security-reviewer`

**Risk.** Highest in F2: a comment-triggered privileged dispatch on a public repo.
The allowlist + fail-closed parse + untrusted-body handling are load-bearing; C1's
negative tests are the proof. Depends on F2-A and F2-B existing.

---

## F2-D — `to-issues → story-planner` handoff (no to-issues automation)

**Problem.** Confirm the chain link from decomposition to speccing without
automating `to-issues` (the human-approved-decomposition invariant holds).

**Acceptance criteria (diff-verifiable).**
- A story filed from a `to-issues` draft, once labelled `ready-to-spec` (by the PM
  or the F2-B pre-filter), flows into F2-A with no extra manual step.
- `to-issues` gains **no** workflow trigger (assert: no new `.github` trigger
  references the skill; it stays PM-invoked, draft-output).
- A short `factory.md` note records that the handoff seam is the `ready-to-spec`
  label, not an automated decomposition.

**Scope.** In: the doc note + a wiring confirmation/test. Out: any to-issues
automation.

**PR plan (D104).** Single slice (~80 logic + a doc note). → `factory-security-reviewer`.

**Risk.** Low. Guards the invariant that the factory does not auto-decompose its
own epics.

---

## F2-E — implement stage-2 auto-trigger (§10-gated, later)

**Problem.** The `issues:[labeled: ready-to-implement]` auto-dispatch of implement
exists in code, gated off. Enabling it closes the loop to autonomous PR-open.

**Acceptance criteria (diff-verifiable).**
- The stage-2 trigger activates only when the §10 clean-dispatch track-record
  criteria are met (named, checked) — this story does **not** enable it before that.
- With the gate met, a `ready-to-implement` label auto-dispatches implement exactly
  as a manual dispatch does (same read-only-agent + privileged-publisher path, no
  new capability).
- Merge remains human (assert: no auto-merge path introduced).

**Scope.** In: the gated enable + the §10-criteria check. Out: any change to the
implement agent's capabilities; the fold loop (that is #237-walled, out of all F2).

**PR plan (D104).** Single slice (~120), **held** until F2-A/B/C land and the C3
dogfood produces the §10 track-record. → `factory-security-reviewer`.

**Risk.** Enabling autonomous build-dispatch. Gated on evidence, not effort; the
human-merge invariant is the backstop.

---

## Cross-cutting

- **Dependencies:** A → B → (C, D) ; E last, §10-gated. C depends on A + B.
- **The #237 boundary:** no F2 story crosses it. The fold loop and owner-task-apply
  stay dark; F2 stops at PR-open + human fold + human merge (D-F2-4).
- **#10 (F1-S7 hardening):** A and C add privileged-ish workflows; they must fold
  into the self-modification hardening, not weaken it.
- **C3 dogfood:** once A + B land, the held C3 `to-issues` skeleton (L170) flows
  through the chain as its first real run, generating the §10 track-record E needs.
- **Registry:** each story's landing gets a D135 registry sync recording it (batch
  where sensible).
