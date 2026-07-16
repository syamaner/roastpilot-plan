# roastpilot-cloud — Software Factory Spec (D98)

**Status**: Specced and agreed, 16 July 2026. Not yet implemented; F1 is the
implementing epic. Prep work (labels, issue templates, milestones, C1/F1
story issues) done 16 Jul 2026 directly in the `roastpilot-cloud` repo.
**Applies to**: `github.com/syamaner/roastpilot-cloud` only. The agent repo
keeps its interactive operating model (D23); safety-critical code is never
factory-autonomous.
**References**: Warp, "How to build a cloud software factory" (the automatic
triage skill); `bholmesdev/hubble.md` (working reference implementation whose
workflow structure we adapt). Platform substitution: GitHub Actions +
`anthropics/claude-code-action` (already proven in the agent repo's
`claude-code-review.yml`), not Warp Oz. No new platform, no new billing.

---

## 1. Decision (D98)

**roastpilot-cloud epics C2–C8 are built factory-first**: a GitHub-issue-driven
pipeline where agents triage, implement, and review, and a human specs,
clarifies, and merges. C1 (scaffold) and F1 (the factory itself) are built
conventionally, because the factory needs gates, labels, and templates to
exist before autonomous issue→PR flow means anything.

Why this repo is the right testbed, and the agent repo is not:

1. **Non-safety-critical.** Worst case is a broken web page, never a hot
   roaster. The Architecture Invariants that make agent-repo autonomy
   dangerous do not exist here.
2. **The hardest factory prerequisite is already house discipline.** The
   stated limit of the pattern is poorly-specified work; the fix is
   well-specced issues. The plan-repo → epic → story pipeline already
   produces exactly that, and D97's plan decomposes naturally into thin
   slices.
3. **Deterministic, cloud-friendly verification.** TypeScript strict +
   Vitest + Playwright against Vercel preview deploys; no hardware in the
   loop anywhere.
4. **The back half already exists.** Automated Claude Code Review, Codex
   (advisory-but-triaged), branch protection with conversation resolution,
   codecov, pr-triage independence (D23), the Codex-wait merge rule: all
   proven in the agent repo and ported as-is.

## 2. What stays human (permanently, not "for now")

- Plan-repo decisions (D-numbers), epic definition, scope rulings.
- Answering `needs-info` triage outcomes and adjudicating `needs-discussion`.
- **Merging.** The factory ends at "PR open, CI green, reviews in"; branch
  protection plus the Codex-wait rule is the human gate. Auto-arming merge is
  an explicit later decision gated on the §10 track record, not a default.
- Secrets provisioning (Snowflake keys, Vercel, Anthropic API), account
  setup, anything touching spend or security posture.
- Reviewing and applying `to-issues` decomposition output before any story
  becomes `ready-to-implement` (§7).

## 3. Pipeline

```text
issue opened
   │
   ▼
[seed]      dumb job: apply needs-triage if no readiness label
   │        (agent failure always leaves a known inbox state)
   ▼
[triage]    read-only agent job: triage skill → structured JSON verdict
   │        (no writable token in this job)
   ▼
[apply]     privileged job: swap readiness label, post triage comment
   │
   ├─ needs-info / needs-discussion / wait-to-implement → stops, human acts
   │
   ▼ ready-to-implement
[implement] read-only agent job: checkout (persist-credentials: false),
   │        implement, run local gates (lint/typecheck/unit), emit patch
   ▼
[publish]   privileged job: push feature/{issue}-{slug}, open PR
   │        (Closes #N / Refs #N per house rules)
   ▼
CI gates + review roster (Claude Code Review inline, Codex advisory)
   │
   ▼
human: pr-triage adjudication → Codex-wait → merge
```

**Staged autonomy**: for the first stories, the triage→implement chain is
broken on purpose; implementation runs by manual `workflow_dispatch` after
the human reads the triage comment. Direct chaining (label event triggers
implement, as hubble.md does) is enabled once §10's criteria are met.

## 4. Label taxonomy

Exactly one readiness label on every open issue (the seed job guarantees it):

| Label | Meaning |
|---|---|
| `needs-triage` | Inbox state; seeded on open, replaced by triage |
| `ready-to-implement` | Specced, thin, verifiable; the factory may build it |
| `ready-to-spec` | Sound idea, needs decomposition/spec before building |
| `needs-info` | Triage could not proceed; question posted, human answers |
| `wait-to-implement` | Specced but held (dependencies, M1-deadline rule, sequencing) |
| `wontfix` | Closed with reasoning (pairs with `prevented-pre-pr` where it prevented work) |

Plus: `epic:F1` / `epic:C1` … `epic:C8` (routing + metrics), and the house
`prevented-pre-pr` label.

## 5. Issue quality bar

The story issue template (in-repo, `.github/ISSUE_TEMPLATE/story.yml`)
requires: plan link (which epic §, which plan lines), acceptance criteria as
checkboxes, in-scope surface (files/areas), out-of-scope statement,
verification notes (which suite proves it), and a size declaration (target
≤ ~400 changed lines; bigger means split before labelling). Triage enforces
this bar: an issue missing any of it comes back `ready-to-spec` or
`needs-info`, never `ready-to-implement`.

## 6. Workflows (implemented in F1; structure adapted from hubble.md)

- **`triage-issues.yml`** — `on: issues [opened]`; seed → triage → apply as
  in §3. Concurrency group per issue number, cancel-in-progress. Triage skill
  output is structured JSON (readiness + reasoning + missing-info questions)
  validated by the apply job before any label write.
- **`implement-ready-issues.yml`** — `on: workflow_dispatch` (stage 1), plus
  `issues [labeled: ready-to-implement]` (stage 2, once enabled). Agent job
  has `contents: read` only and `persist-credentials: false`; a separate
  publish job holds the write token and pushes the branch + PR. Concurrency
  per issue, no cancel (never orphan a half-published branch).
- **`claude-code-review.yml`** — ported from the agent repo unchanged in
  spirit: `/code-review --comment`, inline findings block via conversation
  resolution, the check itself not required (workflow-edit guard, agent-repo
  lesson).
- All third-party actions pinned by SHA; repo stays private until first
  public-worthy release, but the security posture assumes public.

## 7. Skills (in-repo, `.claude/skills/`)

- **`triage`** — read-only. Judges an issue against §5's bar and the plan
  repo (checked out read-only alongside), emits the JSON verdict. Never
  writes.
- **`to-issues`** — decomposes a plan epic (C2…C8) into story issues meeting
  §5, as a *draft batch the PM reviews* before anything is labelled
  `ready-to-implement`. This is why C2+ stories are deliberately not
  pre-created: decomposition is factory work, human-approved.
- Implementation conventions (stack rules, gates, PR hygiene) live in the
  repo's `AGENTS.md` (written at C1), which the implementing agent reads
  like any Claude Code session would.

## 8. Security model

- **Agent jobs hold nothing.** No writable GitHub token
  (`persist-credentials: false`, read-only `GITHUB_TOKEN`), no Snowflake
  secrets, no Vercel tokens. The Anthropic API key is the only secret in the
  agent job.
- **Privileged jobs are narrow.** Label writes, comment posts, branch push,
  PR create. They run deterministic scripts, never agent output as code.
- **Snowflake:** implementing agents run unit tests against the mocked SQL
  API boundary only. Contract tests against `ROASTPILOT_DEV` run in the
  post-PR CI job with a CI-scoped key (DEV database only), inside the
  resource monitor cap (plan.md §15). Post-cutover production keys never
  enter Actions.
- **Vercel previews** come from the Vercel GitHub integration, not from
  tokens in workflows.

## 9. Merge policy

Identical to the agent repo's AGENTS.md, no factory exceptions: green CI is
necessary but not sufficient; every inline thread resolved (branch
protection); Codex is advisory-but-triaged with the wait-for-verdict rule;
`pr-triage` adjudicates independently of the author (D23 — doubly important
here, where the author is always an agent). The factory never merges.

## 10. Cost, metrics, and the autonomy ratchet

- **Per-issue cost**: triage is cheap (read-only, small context);
  implementation is a real token spend (Sonnet by default per the house
  model-selection policy; Opus only for explicitly-flagged hard stories).
- **Metrics**: reuse the PR-flow metrics (churn, avoidable rework,
  findings-pre-open) plus factory-specific ones: triage accuracy (human
  overrides per 10 triages), first-pass-CI-green rate, human-touch minutes
  per story.
- **Ratchet criteria** (each step is a conscious change, recorded here):
  1. Enable triage→implement chaining after ~5 manually-dispatched stories
     with zero triage overrides and ≥80% first-pass green.
  2. Consider auto-arming merge on green+resolved only after a full epic
     (C2) lands factory-built with no post-merge defect traced to a factory
     PR. (The Codex-wait rule makes this mostly moot; revisit then.)

## 11. F1 epic — stories

| Story | Scope |
|---|---|
| F1-S1 | Labels, issue templates, milestones, story issues for C1/F1 — **done at prep, 16 Jul 2026** (no issue; this doc is the record) |
| F1-S2 | `triage-issues.yml` + triage skill (seed/triage/apply, JSON contract, concurrency) |
| F1-S3 | `implement-ready-issues.yml` (read-only agent + privileged publisher, dispatch-first) |
| F1-S4 | Review workflow port + repo `AGENTS.md` review rubric section |
| F1-S5 | `to-issues` skill + dry-run decomposition of C2 (output PM-reviewed, then labelled) |
| F1-S6 | End-to-end dry run on a sacrificial issue; factory runbook (failure modes, stuck states, cost log) |

Sequencing: C1 (conventional) → F1 → C2+ (factory). The M2 timing rule is
unchanged: none of this starts while it would compete with the M1 harness
deadline.

## 12. Open items

1. `claude-code-action` auth mode (API key vs OAuth token) and version pin →
   decide at F1-S2.
2. Per-run token budget guardrail (hard cap per implement run, and what the
   workflow does on hitting it) → F1-S3.
3. Whether triage checks out the plan repo (public, read-only) for full
   context or works from links quoted in the issue body → F1-S2; start with
   checkout, it is cheap.
4. Issue intake beyond the operator (e.g. tasters reporting bugs via the
   public page) is out of scope until the repo is public; revisit at C7.
