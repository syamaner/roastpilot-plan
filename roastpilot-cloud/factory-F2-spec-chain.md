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
Run the `story-planner` agent on a story issue; post the implementation contract
as an issue comment. **Read-only + comment-sink only**, on the #192/#204
metadata-only injection-hardened lineage: base-owned config restored from a
trusted revision before the agent runs, tool-catalog closure asserted, no repo
write / no code / no egress beyond the single comment sink. A poisoned issue body
must not be able to steer the contract into anything but comment text (the
orchestrator-verifies-before-posting property, #162, becomes a workflow-side
completion + contract-shape assertion). Likely 3 slices: (A1) agent + workflow
wiring + comment sink; (A2) injection hardening (config restore / tool-catalog /
trusted-revision), reusing the `claude-code-review.yml` pattern; (A3) completion +
contract-shape assertion (the fields D104 needs are present, non-vacuous).
**Reviewer: `factory-security-reviewer`.**

### Story B — chain sequencing: `story-planner` → `triage`
Re-sequence per D-F2-1 so `triage` validates the specced issue. Wire the raw-open
triage as a `needs-info` pre-filter; the readiness gate runs after Story A posts
the contract. **Reviewer: `factory-security-reviewer`.**

### Story C — operator-comment contribution: enable + harden `owner-command-intake`  *(security keystone)*
The `/approve` + `/respec` grammar (D-F2-2). **Owner-identity auth, fail-closed**
(only the operator's comments act; a stranger's `/respec` is inert — the repo is
public). Comment body is **untrusted input** (#194 lineage; never interpolated
into a privileged prompt unsanitised). Each command re-triggers its chain hop:
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

## Open sub-decisions (resolve via comment)

- Story A trigger: on issue-open directly, or on a `needs-spec` label the pre-filter
  triage applies? (Affects how B's pre-filter is wired.)
- `/respec` re-run: full re-spec, or an incremental fold of the comment into the
  existing contract?
- Owner-identity source: GitHub actor login allowlist, or a stronger binding?
