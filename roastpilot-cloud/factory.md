# roastpilot-cloud — Software Factory Spec (D98)

**Status**: Specced and agreed, 16 July 2026. Not yet implemented; F1 is the
implementing epic. Prep work (labels, issue templates, milestones, C1/F1
story issues) done 16 Jul 2026 directly in the `roastpilot-cloud` repo.
**Applies to**: `github.com/syamaner/roastpilot-cloud` only. The agent repo
keeps its interactive operating model (D23); safety-critical code is never
factory-autonomous.
**References**: Warp, "How to build a cloud software factory — the automatic
triage skill"
(<https://www.warp.dev/blog/how-to-build-a-cloud-software-factory-the-automatic-triage-skill>);
`bholmesdev/hubble.md` (<https://github.com/bholmesdev/hubble.md>) — working
reference implementation whose workflow structure we adapt. Platform
substitution: GitHub Actions + `anthropics/claude-code-action` (already proven
in the agent repo's `claude-code-review.yml`), not Warp Oz. No new platform, no
new billing.

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
| `ready-for-conventional-implementation` | Specced and verifiable for conventional/interactive delivery; deliberately does not authorize the factory workflow |
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
about 400 changed logic lines; a materially larger unit explains why splitting
would reduce reviewability; tests are excluded from the estimate and a test
diff over 600 lines requires pre-open QA). Triage enforces this bar: an issue
missing any of it comes back `ready-to-spec` or `needs-info`, never
`ready-to-implement`.

**Plan-small addendum (D104, 19 Jul 2026):** the size declaration is a **PR
plan**, not a hope — each ready issue maps to one or more ordered coherent
review units normally targeting about 400 changed **logic** lines each (tests
are excluded from the estimate), and the issue names their dependencies/order
and the **domain reviewer** each diff triggers (AGENTS.md rubric). A materially
larger unit records why it is more reviewable than the available splits. An
issue without the ordered, sized, reviewer-tagged plan is not
ready-to-implement. D119 supersedes D104's original binary size and exact-one
mapping; the decomposition and reviewer-routing gate remains.

**Execution-path boundary (D120-D122, 25-26 Jul 2026).** D119's size guide
governs conventional/interactive review units. The current automated publisher
cannot run independent pre-open review or produce multiple commits, so
`factory-dispatchable` issues retain an exact fail-closed technical envelope:
one issue/commit/PR; at most 400 combined changed textual lines across every
path category; a captured patch artifact no larger than 2 MiB; no binary patch;
and no mix of allowlisted inert
data/fixtures/generated/design-doc output with logic or tests. Migrations and
operational or unknown documentation are logic. The
privileged publisher classifies both the captured patch encoding and the
applied scratch-index diff before any push. Anything materially larger,
mixed-output, or otherwise requiring pre-open `qa` routes to conventional
execution and receives
`ready-for-conventional-implementation`, never the factory-authorizing
`ready-to-implement` label. Factory data plus logic remains separate issues/PRs
until multi-commit publishing exists. This exact automated envelope is a
temporary capability constraint, not a reversal of D119's general
reviewability guide.

**Dry-run / meta-issue exemption (18 Jul 2026, ruling from the first live
implement dry-run).** An internal factory-validation / dry-run issue — one
that exists to exercise the pipeline itself rather than ship a plan-derived
feature, and that self-declares as such — is **exempt from the plan-link
requirement**: it may substitute a reference to F1-S6 ("End-to-end dry run on
a sacrificial issue", §11) for the plan link, and triage must not bounce it to
`needs-info` on the missing link alone. All other §5 items still apply. (This
ruling was itself surfaced by triage: on the first live dry-run it correctly
recognised the meta nature of the issue, refused to guess whether the rule
bound it, and routed to `needs-info` with the question — the intended
surface→escalate→adjudicate loop. The exemption is the adjudication.)

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
- All third-party actions pinned by SHA. **The repo is PUBLIC (D100)** — so
  GitHub Advanced Security (CodeQL, dependency review, secret scanning + push
  protection) is free and the native gates are used directly; the OSS-fallback
  plan below (osv-scanner, gitleaks) is superseded. See D100.

## 7. Skills (in-repo, `.claude/skills/`)

- **`triage`** — read-only. Judges an issue against §5's bar and the plan
  repo (checked out read-only alongside), emits the JSON verdict. Never
  writes.
- **`to-issues`** — decomposes a plan epic (C2…C8) into story issues meeting
  §5, as a *draft batch the PM reviews* before anything is labelled
  `ready-to-implement`. This is why C2+ stories are deliberately not
  pre-created: decomposition is factory work, human-approved. **Per D104 as
  superseded by D119, its output is a PR PLAN**: per story — ordered coherent
  review units, scope, approximate logic size (normally about 400 lines),
  dependency order, and the domain reviewer each diff triggers.
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
| F1-S7 | **Pipeline supply-chain + self-modification hardening — in progress.** Action-pin/explicit-allowlist hardening and agent-influenced `--ignore-scripts` coverage merged as cloud #100; the deterministic protected-path guard was already present and its matching CODEOWNERS file merged as #101; the structural YAML audit completed in cloud #102 via PR #113 (`5262e77`); #41's immutable local marketplace delivery merged via PR #117 (`4396b1c`); #42's unconditional fail-closed unlicensed-output enforcement merged via PR #118 (`e7fdbd0`); and D112-D113's local-action reference/direct-entrypoint confinement merged via cloud #114 / PR #119 (`377fa77`). Per D108, code-owner enforcement stays off until a second independently eligible reviewer exists and #47 is held while the Claude GitHub App is suspended. Cloud #116 separately tracks the upstream stale-synchronize guard. The operator approved cloud #120's broader credential-reachability executable boundary in D117; its thirteen thin delivery slices are planned, and no repository-local action may enter a credential-bearing job before the first slice lands. Native GitHub secret/dependency gates satisfy the former scanner slice under D100. |
| F1-S9 | **Anti-gaming quality gates** — mutation testing (security-critical Python) + the anti-gaming diff classifier + the **spec-grounded review pipeline** (the §14 "should-add" hardening, now built): a read-only agent judges the PR diff against the linked issue's acceptance criteria and a deterministic publisher turns that verdict into merge-gating comments. See **D107** for the design + security model. Shipped d1–e (cloud #74/#82/#83/#86/#87 read-only-agent + publisher, #91 publish wiring); reconciliation/revalidation completeness is complete through cloud #88/#89/#90 and no longer blocks the factory-bot enable story (#47), which retains its separate enable/security scope. |
| F1-S8, S10, S11 | Documented in the roastpilot-cloud `docs/state/registry.md` story table (operator order: S5 → S10 → S8 → S9 → S7 → S6 → S11); this §11 table is being caught up incrementally, with F1-S9 and the now-active F1-S7 recorded here. |

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

5. **Oz-pivot option (raised 18 Jul, during the F1-S3 live-commissioning grind — a
   real decision for the C2+ phase, NOT M2-F1).** The self-assembled GHA +
   `claude-code-action` substrate has a recurring tax: runner-environment gremlins
   the managed Oz platform would eliminate (the ENV_SCRUB/bubblewrap/AppArmor-userns
   fight is the type case). Operator inputs (18 Jul): (a) Oz **can** use the Claude
   Code subscription (so no flip to metered/API billing — ongoing model cost stays
   roughly flat), (b) **no** ambassador discount (standard Oz pricing). Consequence:
   the pivot is mostly a one-time MIGRATION cost (days — the security model, guard,
   deterministic publisher, skills, and logic are substrate-independent and carry;
   the GHA/bubblewrap plumbing is discarded, and some of that rigor was only there to
   compensate for GHA not being managed) + a security RE-VERIFY of Oz's own isolation
   /trifecta model. Decision deferred to **after F1 proves the loop end-to-end on
   GHA** (don't pivot mid-grind); revisit at the C2 kickoff with a side-by-side. The
   build thesis ("adapt the Oz pattern without hosted Oz — prove it's portable") is a
   narrative cost of pivoting, but an honest one. **RESOLVED — Oz RULED OUT
   (18 Jul 2026, operator).** The subscription assumption (a) was wrong: the Claude
   Code subscription **cannot** be used with Oz, so a pivot would force metered
   (Warp-credit / Anthropic-API) billing on top of Oz compute — ongoing cost rises
   meaningfully, which was the single factor the whole decision hung on. Combined
   with (b) no discount, the migration doesn't pay for itself. **Decision: stay on
   GitHub Actions + `claude-code-action` for the whole factory (F1 and C2+); absorb
   the runner-environment tax (it's a bounded, one-time-per-gremlin cost, and each
   fix is now written down).** Oz not revisited unless the subscription-compat or
   pricing story changes.

## 13. Soundness validation + hardening (16 Jul 2026 research pass)

A four-angle adversarial validation of this spec (claude-code-action best
practice; the lethal-trifecta security model; Warp/hubble.md source fidelity;
the autonomy-ramp + review-collusion literature). **Verdict: SOUND ARCHITECTURE,
with must-fix gaps before the factory builds anything — concentrated in the
pre-merge CI secret path, pipeline self-modification, and test-strength gaming.**
The read-only-agent / privileged-publisher split is confirmed as GitHub Security
Lab's recommended two-workflow pattern and correctly breaks the lethal trifecta
at the agent job; the staged ratchet + different-model reviewer + independent
pr-triage all match established practice. The gaps below are what those good
instincts don't yet close.

**Must-fix — amends §8 Security:**

1. **Pin `claude-code-action` ≥ v1.0.94** (or a SHA at/after it) — the Jan-2026
   RyotaK/GMO bot-allowlist-bypass CVE fix. Keep `allowed_bots` /
   `allowed_non_write_users` explicit-allowlist (never `*`) and
   `show_full_output` off. Auth: follow the proven house precedent — the agent
   repo's `claude-code-review.yml` already runs `claude-code-action@v1` with an
   **OAuth token + read-only permissions**, so the factory adopts the same at
   F1-S2 (this resolves the §12 auth open item), with Workload Identity
   Federation (OIDC → short-lived credential, no static key) the hardening
   upgrade to weigh later.
2. **Human-gate the DEV-Snowflake-key CI job.** The publisher split does NOT
   cover the post-PR CI job, which by design runs *agent-authored code* against
   the DEV key — the second-order injection pattern (the agent writes the
   exfiltrator; the CI job pulls the trigger; RyotaK/Cline real-world proof).
   Put that job behind a **GitHub Environment with a required reviewer**,
   egress-lock the runner (step-security/harden-runner), and `npm ci
   --ignore-scripts`. Keep the DEV key's blast radius minimal by construction
   (DEV database only, resource-capped, no prod grants).
3. **The agent cannot modify the factory's own pipeline.** Its patch must never
   touch `.github/**` (workflows/actions), the privileged glue scripts,
   CODEOWNERS, or branch-protection config — the Pipeline-Poisoning (D-PPE)
   vector Anthropic's own `security.md` is silent on. Enforce with **CODEOWNERS
   on `.github/` + require-code-owner-review**, AND a deterministic guard in the
   publish path that fails any agent diff touching those paths.
4. **Secret-scan every agent-authored diff** (gitleaks/trufflehog) in the
   publish path before the PR opens; a committed-secret exfil attempt fails closed.

**Must-fix — amends §10 quality gates (the test-strength gaming vector):**

5. **Mutation testing on the diff, over the cloud repo's security-critical
   surface** (the secure views + their baked-in `visibility <> 'private'`
   filter, grants/roles, the Zod/Pydantic range+enum validation, the deletion
   cascade). The measured reward-hack of Claude-family authors (ImpossibleBench,
   ICLR 2026) is **test-file modification / weakened assertions**, and
   first-pass-CI-green + `codecov/patch` *reward* it — both are blind to
   test-strength reduction. A surviving mutant is a fact, not a model judgement:
   the non-model leg the correlated-reviewer finding demands (cross-family
   reviewers still co-accept ~16% of buggy code — two model lenses ≈ far fewer
   than two independent votes). This is what makes the green-rate promotion gate
   trustworthy instead of gameable.
6. **Hard rule: any diff that edits a test, weakens an assertion, or adds
   `# pragma: no cover` cannot auto-chain — it goes to a human.** Cheap,
   decisive, targets the author's dominant measured hack directly.

**Must-fix — operational governance (mostly cheap config, not engineering):**

7. **Aggregate cost caps + alerting** — a per-run token cap can't see N runs ×
   cap or a runaway retry loop. ~~Set an **Anthropic monthly spend limit** (hard
   pause) + a lower usage alert, AND a **GitHub Actions budget** (alerts +
   stop-at-limit) on Actions minutes.~~ **Reconciled by D102 (18 Jul 2026): this
   item assumed METERED billing; the actual model has no metered spend to cap.**
   Anthropic = flat-fee Claude Code subscription (the factory runs on the
   subscription token, not the pay-per-token API), so there is no dollar spend
   limit to set — runaway protection is the factory's own controls (per-run
   `max_turns` cap + the kill-switch, F1-S10). GitHub Actions = free/unlimited on
   a PUBLIC repo with NO payment method on file, so it cannot incur charges
   (fail-safe by construction). So the "cost cap" acceptance is met by the
   billing model, not by config. **REVISIT if any of these change:** repo goes
   private (Actions minutes become metered), a payment method is added, or the
   factory switches to metered Anthropic API billing — at which point set the
   real spend limit + Actions budget. Supersedes the §12 per-run-only open item.
8. **Idempotency guards on non-idempotent GitHub writes.** A naive whole-job
   retry re-fires side effects → a duplicate PR/comment. A branch push is
   idempotent (same ref); **PR-create and comment-post are not** — gate them
   with an "already exists?" pre-check keyed on issue/branch and disable naive
   retry on those steps (guard in the tool layer, not the prompt). Honor
   429/`Retry-After` with backoff on both APIs (GitHub's 100-concurrent
   secondary limit trips a fan-out first). D114 below records the complete
   REST rate-limit response contract used by the shared client.
9. **A manual kill-switch / global pause enforced OUTSIDE the agent's code** —
   the workflow-disable REST endpoint (one call halts everything) + an
   in-workflow "pause flag" repo variable the jobs read first. (An auto
   circuit-breaker on consecutive failures is a fast-follow; the *manual* switch
   is the must-fix.)
10. **A rollback runbook for a bad merged PR** — a documented, pre-tested path:
    Vercel Instant Rollback (stop the bleeding, seconds) + revert-PR (fix
    source-of-truth so it doesn't re-deploy). Design around the Vercel gotchas:
    instant rollback only works for previously-production-aliased deploys,
    doesn't re-apply env changes, and **turns OFF production auto-assign after —
    so auto-deploy silently pauses until someone re-promotes.**
11. **Dependency review on agent PRs.** An agent that adds/bumps npm deps to the
    Next.js app is a supply-chain vector (typosquats, known-vulnerable versions).
    ~~GitHub's `dependency-review-action` is paid on private repos → wire OSS
    `osv-scanner` instead.~~ **Superseded by D100: the repo is public, so
    `dependency-review-action` is free and is wired as the gate** (F1-S4, #37:
    `fail-on-severity: high`, GPL/AGPL deny-list, `fail-on-scopes: runtime,
    development, unknown`).
12. **Provenance trailer on every factory PR** — model ID + prompt/skill version
    + pinned action-SHA + issue ref in the PR body/commit (extend Claude Code's
    `Co-Authored-By`), so a *systemic* bad-PR cause is traceable and agent- vs
    human-authored history is distinguishable. Pair with a human `Signed-off-by`.
13. **A factory-level regression eval harness — the single gap a human merge gate
    does NOT cover.** The gate catches an individual bad PR but not a *systematic*
    quality regression from a model bump or a prompt edit. A modest suite (a
    dozen known issues → expected triage/PR outcomes + deterministic scorers:
    compiles / tests pass / diff-in-bounds), gated in CI on any prompt/model
    change, is the highest-leverage single addition (Anthropic's own eval
    guidance backs the capability-vs-regression split).

**Paywall caveat — RESOLVED by D100 (repo is public):** the caveat below applied
only while the repo was assumed private. GitHub push protection, dependency
review, CodeQL, and artifact attestations are paid (Advanced Security) *on
private repos*, but are **free on public repos** — which this repo is. So the
native gates are used directly (CodeQL #36, dependency-review #37, native
secret-scanning + push protection enabled), and the OSS equivalents (gitleaks,
osv-scanner) are NOT needed. If the repo is ever taken private, revisit: either
budget for Advanced Security or wire the OSS gates.

**D100 (18 Jul 2026) — the repo is public; native GHAS gates supersede the
OSS-fallback plan.** The factory security surface (§6) and the paywall caveats
(§8 #11, the caveat above) were written assuming a private repo. The repo was
made public at C1 kickoff, so CodeQL, dependency review, secret scanning + push
protection, and artifact attestations are all free and are wired as the native
gates (F1-S4: #35 Claude review, #36 CodeQL incl. `actions` + `python`, #37
dependency-review, native secret-scanning). osv-scanner / gitleaks are dropped.
Surfaced when Codex flagged the dependency-review step against the stale
"private repo → osv-scanner" plan text during #37 review.

**D101 (18 Jul 2026) — Snowflake preview isolation + synthetic-telemetry seed.**
Decided before the C2 build starts, so schema/data work inherits it.
- **In-account isolation, not a second account.** One Snowflake account; a
  dedicated PREVIEW environment fully separate from prod: database
  `ROASTPILOT_PREVIEW`, role `ROASTPILOT_PREVIEW_ROLE` (scoped to only that DB
  + warehouse), warehouse `PREVIEW_WH` (XS, auto-suspend 60s) capped by resource
  monitor `PREVIEW_MONITOR` (10 credits/month, notify→suspend), and a **key-pair
  SERVICE user** `ROASTPILOT_PREVIEW_APP` (no password login). Provisioned
  18 Jul.
- **Vercel env scoping IS the safety boundary.** Preview-scoped env vars point
  the app's PR preview deploys at `ROASTPILOT_PREVIEW`; Production-scoped vars at
  prod. Same var names (`SNOWFLAKE_ACCOUNT/USER/PRIVATE_KEY/ROLE/WAREHOUSE/
  DATABASE`, `SNOWFLAKE_AUTHENTICATOR=SNOWFLAKE_JWT`), different per-environment
  values. GH secrets/vars mirror the preview values for CI/migration runs
  (`SNOWFLAKE_PREVIEW_*` + `SNOWFLAKE_PREVIEW_PRIVATE_KEY` secret).
- **Hard rule:** migrations run against **prod only from `main`**; preview/CI
  migrations target the preview DB. A factory-generated migration must never
  reach prod from a PR/preview.
- **Preview/CI data = synthetic, seeded from local M1 roast telemetry, never
  prod, never real users.** A local enrichment pipeline (`scripts/seed/`, run by
  the operator) takes the real M1 roast curves (roastpilot-agent exports /
  `tests/fixtures/` live-roast excerpts), strips/synthesises identifying data,
  fans them into variations for volume, and **synthesises** the user/tasting/
  taster-surface rows. Built alongside the first schema migration (loader needs
  the C2 schema). Build note: multi-line PEM in env — app reads it directly or
  base64-encodes.

**D103 (19 Jul 2026) — shift the diverse lens LEFT: fold Codex before "ready",
not after.** F1's rework is dominated by review findings landing after a PR is
marked ready — F1-S8 alone ran **5 Codex rounds / ~15 real P1s, all post-open**,
on the grant-boundary keystone that two Opus `safety-reviewer` passes called
clean. Root cause: the pre-open review pass was Claude-family only (author +
subagent reviewers), and a same-family lens co-accepts a bug the author already
rationalised; the one lens that reliably caught them (Codex, a different model
family) only ran *after* the PR was ready, so every catch became rework. Three
process changes, codified in `pr-preflight` (step 3 + new step 5) and both
repos' AGENTS.md PR-Hygiene:
- **Diverse-lens pre-open loop (flagship):** open review-worthy PRs as a
  **draft**, trigger `@codex review`, wait for the verdict on the head sha
  (never guess time — match Codex's `Reviewed commit:` sha), fold every real
  finding, only then mark **ready**. A draft-fold is not rework; the same
  finding post-ready is.
- **Fix the CLASS, sweep the repo, pre-open** — one categorical fix + a
  repo-wide `grep` for siblings, never per-symptom patches (the round-2..N
  engine: the sanitizer, git-guard, and identifier-compare classes each recurred
  this way).
- **Snowflake grant-boundary checklist** on any grants/roles/migration diff (no
  PUBLIC grant + PUBLIC audited; USE SECONDARY ROLES is a statement not a
  session param; DEFAULT_SECONDARY_ROLES verified not assumed; future grants
  audited; exact identifier byte-compares) — folds the F1-S8 class up front.
The KPI stays **preventable post-open rework → ~0**, not the gross fix rate:
healthy rework (a reviewer catching a real defect) is the system working and
must not be gamed away. Codex stays advisory-but-triaged — this moves *when* it
runs, not whether it gates.

**D104 (19 Jul 2026) — PLAN-SMALL is a decomposition gate, not a review-time
catch.** (PM directive, from the agent-repo DORA/PR-flow work.) The `to-issues`
decomposition (§7) must output an explicit **PR plan**: each ready-to-implement
issue is exactly ONE thin PR, scoped so its **logic** diff is under ~400 lines —
Snowflake migrations, generated files, fixtures, and docs are exempt from the
cap and get their own issue/PR. Per drafted story the decomposition records:
scope, ~logic size, dependencies/order, and **which domain reviewer the PR
triggers** (AGENTS.md rubric: schema-migration-reviewer for Snowflake/grants,
privacy-auditor for routes/reviewer-data, factory-security-reviewer for
pipeline, qa/e2e). A story that decomposes into "build X" without this ordered,
sized, reviewer-tagged PR list is **NOT ready-to-implement** — this is now part
of §5's intake bar, enforced at the `ready-to-spec → ready-to-implement`
transition by `triage`. Encoded in the `to-issues` skill + §5/§7 + AGENTS.md.
**D119 supersedes D104's binary size cutoff and exact-one mapping; its
decomposition and reviewer-routing requirements remain.**

**D105 (19 Jul 2026) — factory draft-first adopted, with the draft-verdict
amendment; closes #62/#66.** The publisher opens each factory PR as a **DRAFT**;
the diverse lens (Codex) iterates on the draft; `pr-triage`/the lead folds
findings **by class**; only then is the PR marked ready. Iterating with Codex is
expected in the DRAFT phase; **once-on-final-commit / don't-re-litigate governs
only the POST-ready phase.** Two hard-won amendments from the live #64 arc:
- **The draft-phase exit is "no findings within a window", never "clean verdict
  on the draft"** — observed 19 Jul: an explicit `@codex review` on a draft runs
  and posts findings-reviews, but Codex does NOT complete the clean-verdict flow
  (no "Didn't find any major issues" comment) on drafts; a draft waiting for a
  clean signal waits forever. Verdict-at-ready.
- **claude-review skips drafts and runs on `ready_for_review` — but the skip
  must be coordinated with any review-gate/status logic, never shipped alone**:
  a skipped job reports Success, so a gate that treats "the review workflow ran
  successfully" as "a review executed" is satisfied by a run where it never ran
  (the agent repo hit exactly this race). The cloud repo keeps its draft-skip
  (merged in #65) — this repo's context differs from the agent repo's #593
  keep-on-drafts choice because factory PRs will open as drafts routinely and
  double-running claude-review per draft round is cost/noise at factory scale;
  the divergence is deliberate and recorded here (#66 closed on this decision).
  The ready-transition actor today is the lead/`pr-triage` (dispatch-first);
  automation of that transition is an autonomy-ratchet (§10) step, not assumed.

**D106 (19 Jul 2026) — account-role DDL is operator-run provisioning, never
migration-stream work (closes cloud #61). PROVISIONED same day:** the operator
ran the D106 script — roles `ROASTPILOT_AGENT` + `PUBLIC_WEB` (SYSADMIN
hierarchy), prod database **`ROASTPILOT`** (naming confirmed; the
DEV/PREVIEW/prod family is complete), shared warehouse `ROASTPILOT_WH` (XS,
auto-suspend 60) capped by `ROASTPILOT_MONITOR` (5 credits/month, notify 50%
/ suspend 100% / suspend-immediate 110%), warehouse USAGE granted to both
roles. Service USERS deliberately not created (key pairs arrive with C3/C4);
no prod deploy credential (C7 cutover decision). The ACCOUNT-scoped DDL C2 needs
(`CREATE ROLE ROASTPILOT_AGENT` / `PUBLIC_WEB`) is run once by the operator as
ACCOUNTADMIN, the same pattern as the preview/DEV-CI provisioning. Migrations
ASSUME the roles exist and only grant/use them within the database — all of
which the DEV-CI role can deploy and the F1-S8 grant audit can verify. Zero new
CI privilege; the audit's rejection of account grants stays correct-by-design.
The C2 decomposition includes the provisioning step as an explicit runbook
story. (Same batch of operator decisions, 19 Jul: cloud #47 = close the
review-job Bash exfil path THEN enable the Claude lens on factory PRs, in S7;
#59 = the PUBLIC-audit completeness limit ACCEPTED, closed; #58 folds into S6;
the live DEV dispatch bundles into S6's dry run; S6 additionally scopes the
@claude PR feedback loop + the codex-verdict stamp-and-flip status; C2 kicks
off after F1 completes.)

**D107 (21 Jul 2026) — F1-S9 spec-grounded review: design + security model +
the completeness slice (documents shipped work; the §14 "should-add"
spec-grounded-review item, now built).** F1-S9 landed anti-gaming quality gates
in three parts (mutation testing, the anti-gaming diff classifier, and the
spec-grounded review pipeline); this decision records the pipeline's design so
the plan reflects the merged reality (the §11 table previously stopped at F1-S6).

- **Architecture (controller owns the loop; the LLM advises — the M1 invariant
  holds here too).** A **read-only** review agent (no write token, no MCP write
  tools) reads the linked issue's acceptance criteria + the PR diff, both
  fenced as UNTRUSTED behind a **per-run CSPRNG nonce delimiter** (unforgeable —
  ends the char-class-guard arms race), and emits a typed verdict artifact. A
  separate **deterministic publisher** (privileged, `pull-requests: write` only)
  re-derives kind/severity from a TRUSTED `criteria-spine.json` (metadata only,
  no agent text) and turns the verdict into merge-gating inline comments +
  a summary. The agent cannot self-grade: severity is deterministic
  (`closing && !satisfied → blocker`), omitted criteria default to unsatisfied.
- **Security model (hardened over ~9 Codex rounds on cloud #87).** Publisher
  runs from `ref: base.sha` (never PR head — a PR must not rewrite its own
  judge), full checkout + `npm ci --ignore-scripts` off the base lock, minimal
  permissions (no id-token/contents:write), fail-closed artifact parsing
  (byte-cap → `isUtf8` → strict schema → cross-field invariants), fail-loud
  workflow-output validation (a runner regression must fail the step, never
  fabricate a no-op), capped attacker-influenced lists (65536-char comment
  limit), and TOCTOU revalidation of head-SHA + references before any
  destructive delete. Two-tier gating: inline blocker threads hard-gate via
  `required_conversation_resolution`; the summary/fallback is operator-attention
  (the publish job is NOT a required check — a skipped required check would
  deadlock the draft/dependabot/fork classes).
- **Go-live (operator, 21 Jul):** the gate is LIVE on the repo's own non-draft
  human/claude PRs (non-required, reversible); factory-bot enable is **#47**
  (which also closes the review-job Bash exfil path, per D106's S7 note).
- **Completeness slice — cloud #90 (folds #88/#89), must-fix before #47.**
  On `hasCriteria: true`, generation-aware reconciliation auto-deletes only
  **no-obligation** individual blockers whose closing reference was removed or
  downgraded, plus the diff-truncation aggregate only when **no current closing
  references remain**. The aggregate boundary preserves #77's interim
  cross-object-staleness guarantee: linked-issue criteria can change without a
  PR event, so a still-closing aggregate persists until #77 adds revision-aware
  revalidation. Reconciliation deliberately leaves verdict-satisfied threads
  for independent human/lead
  resolution so the review agent cannot self-unblock a PR. That path's
  generation guard ensures an older run never deletes a newer run's valid
  thread. The separate `hasCriteria: false` generic cleanup gets the same #88
  generation comparison in **90.6a-4**, sequenced after aggregate
  reconciliation and before the remaining 90.6b accuracy work (reopened by the
  90.6a-3 self-audit; placement approved 23 Jul). This closes the cross-run
  ownership race but not the pre-existing same-run REST window after the
  no-reference recheck: a body edit can make an older blocker applicable again
  before its DELETE. **90.6a-5** closes that distinct TOCTOU before #47 by
  revalidating after comment pagination at the destructive boundary, stopping
  fail-closed with an accurate partial-delete result on drift (merged as cloud
  #107, 23 Jul). Delete counts cover confirmed successful responses only; a
  failed DELETE response is explicitly indeterminate, and no later candidate is
  attempted. Any partial destructive cleanup force-publishes a PR-visible
  warning even when no prior summary comment exists. The slice also adds
  kind-aware +
  all-paths new-closing-reference revalidation (a body-edit `Refs↔Closes` change
  must not leave a stale gate or stale all-clear), a **complete
  reviewed-closing-set spine contract** (including closing issues with zero
  unmet criteria), runner-observed base-SHA verification, filtered fallback
  accuracy, and count/comment-budget accuracy. The original 90.1–90.6 plan was
  refined during implementation: 90.2 absorbed base provenance; 90.5 split out
  its current-state and TOCTOU hardening; and 90.6 split into bucket/fallback/
  aggregate-reconciliation/no-criteria-generation sub-slices plus final count,
  non-blocking-staleness, and assembled-comment-budget work. Each implementation
  PR remains ≤400 logic lines and routes through `factory-security-reviewer`
  (plus `qa` for accuracy slices). The remaining 90.6b work is serialised as:
  **90.6b-1** one assembled-comment budget (including byte-exact omitted-count
  suffix headroom), **90.6b-2** current-applicable count/exit semantics (#89),
  then **90.6b-3** the non-blocking de-referenced staleness filter. This order
  stabilises the final rendering boundary before sharing one applicability
  representation across count, exit, and non-blocking reporting.
  **90.6b-1 merged as cloud #108 on 23 Jul:** the complete summary now reserves
  every required appended section under one 65,536-character budget and both
  skip-list omission suffixes fit inside their exact shared 2,000-character
  allocation; only whole non-blocking bullets can be omitted, with an explicit
  artifact pointer. **90.6b-2 merged as cloud #109 on 23 Jul:** one
  current-applicable blocker count, derived from the same filtered criteria,
  unreviewed issues, and diff-truncation predicate as inline posting, now drives
  the summary headline, fallback inclusion, logging, and filtered exit status;
  de-referenced/downgraded review-time findings are labeled separately in the
  same finding unit. Inline-thread gating, reconciliation, and fallback payloads
  are unchanged. **90.6b-3 merged as cloud #110 on 23 Jul:** non-blocking
  findings whose issue is absent from the current any-kind reference set are
  omitted before rendering and budget accounting; still-referenced findings,
  including closing references downgraded to non-closing, remain visible. The
  existing pre-write reference-snapshot recheck guards that current-state
  decision, and #89 is complete. **Resolution-aware fallback exclusion merged
  as cloud #111 on 23 Jul, completing #90:** the publisher now queries bounded,
  strictly parsed GraphQL review-thread state using the root comment's
  64-bit-safe `fullDatabaseId`. Freshly created blockers and patched blockers
  confirmed on unresolved threads remain inline-only; patched blockers on
  resolved threads, or whose resolution state cannot be confirmed, stay
  visible in fallback and force the existing nonzero publisher result. The
  classification applies to successful all-PATCH plans as well as degraded
  partial plans, including criterion, unreviewed-issue, overflow aggregate,
  and diff-truncation covering markers. GraphQL/API/schema/pagination
  uncertainty omits nothing. #88, #89, and #90 are complete, so #47 is
  unblocked on the reconciliation-completeness axis while retaining its
  separate factory-bot enable and review-job security work. Process note
  (D104 applied retroactively):
  the original d4 grew to ~1224 logic lines across the review rounds — a
  monolith; the completeness work is deliberately sliced up front instead of
  folded.

**D108 (23 Jul 2026) — F1-S7 remaining-slice decisions.** The operator approved
the following boundaries after the S7 state audit:

- Keep `require_code_owner_reviews` **off** until a second independently
  eligible reviewer or team exists. The single current owner cannot provide an
  independent approval, so enabling enforcement now risks a protected-branch
  deadlock.
- While the Claude GitHub App is suspended, factory-authored PRs stay out of
  the Claude lens. Cloud #47 remains a separately specced redesign: its former
  Option A is not viable because the pinned review plugin relies on
  `gh pr view`, `gh pr diff`, and `gh pr comment`.
- Cloud #102 was delivered as thin PR #113 (`5262e77`). It replaced the
  best-effort regex pin/allowlist audit with a structural parse using the
  typed, dependency-free `yaml` package, including composite-action discovery,
  fail-closed invalid-YAML reporting, and a schema-correct executable-use
  non-vacuity check.
- Cloud #41 (immutable plugin delivery plus stale-synchronize re-review) and
  #42 (unknown-license fail-closed policy) remain separate follow-ups. Their
  post-#102 PM scope audits moved both to `needs-info`: #41 needs approval for
  a SHA-pinned local-marketplace checkout and a separate upstream-guard story,
  because the pinned action rejects ref-suffixed marketplace URLs; #42 needs
  approval for a deterministic `invalid-license-changes.unlicensed` output
  check and its exact-PURL exception policy. Neither is folded into the parser
  slice or implemented before those decisions. D110 below records the
  operator's subsequent approval of both recommendations.

**D109 (23 Jul 2026) — local composite-action audit boundary.** Review of cloud
#102 / PR #113 established that GitHub can execute a local composite action from
outside `.github/actions`, while #102's operator-approved audit boundary covers
only workflow manifests and `.github/actions/**/action.{yml,yaml}`. The cloud
repo currently has no local-action invocation and no action manifest, so this
is a latent gap rather than a reachable bypass. Cloud #114 records the required
follow-up decision: either constrain local actions to the protected
`.github/actions` root, including traversal and symlink handling, or recursively
trace every reachable local action and extend the protected-path model. That
design stayed out of merged PR #113 rather than silently broadening the parser
slice.

**D110 (23 Jul 2026) — F1-S7 follow-up implementation boundaries.** The
operator approved both post-#102 PM recommendations:

- Split cloud #41. The existing issue becomes the thin immutable-delivery
  story: checkout `anthropics/claude-code` at a source-reviewed full commit SHA
  and pass that checkout as a local `plugin_marketplaces` path. A direct
  `https://...git#<ref>` input is not viable because both the pinned and current
  `claude-code-action` marketplace validator require remote inputs to end in
  `.git`; Claude's marketplace-source contract also has no first-class exact
  `sha` field. Cloud #116 tracks the upstream code-review command's
  head-unaware "Claude has already commented" synchronize guard rather than
  folding a behavioral redesign or vendored command into the delivery pin.
  This immutable-delivery story merged in cloud PR #117 (`4396b1c`) with
  `anthropics/claude-code` pinned at
  `2982f951552e94f38cd972764ae94c1d90c41da3`.
- Implement cloud #42 as a repository-owned, typed, fail-closed parser over the
  pinned dependency-review action's `invalid-license-changes.unlicensed`
  output. Do not add a second scanner. Missing/malformed output and any
  unlicensed dependency fail the check. Exceptions are allowed only as exact
  reviewed PURLs through `allow-dependencies-licenses`, with an adjacent
  rationale; broad names, globs, and wildcard bypasses are forbidden. D111
  supersedes this exception allowance after exact-source review proved the
  action's PURL matcher ignores versions.

Both remain conventional F1 pipeline changes with the mandatory
`factory-security-reviewer` pass. Neither decision restores the suspended
Claude GitHub App, changes required checks, or changes branch protection.

**D111 (23 Jul 2026) — unknown-license exceptions are disabled.** Exact-source
inspection during cloud #42 implementation showed that the pinned
`dependency-review-action` does not implement exact-PURL license exceptions:
its `purlsMatch` comparison deliberately ignores PURL versions and compares
only ecosystem plus normalized package name. An entry such as
`pkg:npm/example@1.2.3` therefore exempts every version of `example`, which is
broader than D110's approved exact-reviewed-PURL boundary. The operator chose
the fail-closed option: cloud #42 permits no unknown-license exceptions. The
repository-owned parser fails on every non-empty `unlicensed` result, and the
workflow must not set `allow-dependencies-licenses`. A future exception
mechanism requires a separate decision and exact version-aware enforcement;
it cannot silently rely on the action's broader matcher. This shipped in cloud
PR #118 (`e7fdbd0`) with strict bounded parsing, sanitized failure reporting,
runner-equivalent structural guards against exception inputs, exact-process
failure tests, full changed-line coverage, and the mandatory
`factory-security-reviewer` findings fixed and re-reviewed.

**D112 (23 Jul 2026) — constrain local actions to the protected audit root.**
The operator chose the narrow policy from cloud #114: workflows and composite
actions may reference repository-local actions only through
`./.github/actions/**`. The structural audit normalizes POSIX and Windows
separators plus dot segments before enforcing that lexical boundary. It fails
closed when a local reference escapes the root, targets a missing or
non-directory action, has zero or multiple `action.yml` / `action.yaml`
manifests, or contains any symlink component. Rejecting symlinks keeps the
lexical path, real filesystem target, audit discovery, and protected-path
boundary identical rather than creating a second trusted resolution model.

Every workflow manifest and every action manifest under `.github/actions/**`
is audited independently. Nested local references and cycles therefore cannot
hide an unaudited manifest and do not require a recursive reachable-action
graph. The protected-path / CODEOWNERS boundary remains `.github/**`; local
actions elsewhere in the repository are forbidden rather than widening that
boundary. Cloud #114 is one conventional thin logic PR with mandatory
`factory-security-reviewer` and QA passes.

**D113 (24 Jul 2026) — D112 includes runner-resolved action entrypoints.**
Draft review of cloud PR #119 established that validating only the local action
directory and manifest leaves the same protected-root boundary open through a
Node action's `runs.main` / `runs.pre` / `runs.post`, or a local Docker action's
`runs.image`: the runner resolves those file-backed values from the action
directory, so traversal, an absolute path, or a symlink can execute mutable code
outside `.github/**`. The #114 slice therefore also requires every declared
file-backed entrypoint to be relative to its action directory, contained after
POSIX/Windows normalization, present, regular, and free of symlink components.
`docker://` images are remote identifiers rather than repository paths and stay
out of this filesystem check. This closes D112's chosen boundary; it does not
add import-graph tracing, shell-command parsing, recursive outside-root action
discovery, or a wider CODEOWNERS boundary. The direct-entrypoint closure shipped
in cloud PR #119 (`377fa77`) after the draft finding was independently triaged,
fixed, and re-reviewed.

Cloud #120 tracks that excluded executable-closure policy across Node imports
and spawns, composite shell, container workspace access, and ordinary
privileged workflow `run:` steps. Until #120 records an operator decision, no
repository-local action may be introduced into a privileged factory job.

**D114 (24 Jul 2026) — complete bounded REST rate-limit handling.** Cloud #54
completes #53's shared-client backoff against GitHub's documented REST
rate-limit response shapes. For a `403` or `429`, a valid `Retry-After` remains
authoritative. Otherwise `X-RateLimit-Remaining: 0` plus a valid
`X-RateLimit-Reset` UTC epoch timestamp identifies primary exhaustion and waits
exactly until reset. Either server-directed wait is honored only when it is at
or below the existing 60-second single-wait ceiling; a longer wait fails
without retrying early. A `429` without either usable timing signal starts with
the documented minimum 60-second wait; a continued failure doubles that wait
per GitHub's guidance and therefore exceeds the ceiling, so it gives up instead
of making an early second retry. "Continued" is consecutive per timing source:
a preceding `Retry-After` or primary-reset retry does not consume the first
headerless-fallback slot. An ordinary `403` without the primary-limit tuple or
`Retry-After` still fails immediately.

The existing five-retry budget remains the total-attempt bound. Invalid reset
headers never turn an ordinary `403` into a retry; a bare `429` still takes the
60-second fallback. This is one conventional thin logic PR in
`scripts/factory/github-api.mts` plus focused unit tests, with the mandatory
`factory-security-reviewer` and QA passes. It does not add GraphQL retry
handling, change call-site idempotency, alter workflow concurrency, or modify
the factory's privileged publish/reconcile paths.

This contract shipped in cloud PR #121 (`ac513fb`) after local security, QA,
and independent PR-triage review plus a clean final-head Codex verdict.

**D115 (24 Jul 2026) — reject literal invisible format characters at CI.**
Cloud #71 adds a conventional, human-directed F1-S7 hardening PR because its
workflow and protected scanner changes are outside the factory implementing
agent's writable boundary. A standalone step in the existing CI gates job
runs a dependency-free scanner from `scripts/factory/` before dependency
installation. The scanner replacement-decodes and examines every pathname
returned by `git ls-files -z`, plus every loaded regular-file and symlink byte
stream, and fails on every decoded literal Unicode
`Default_Ignorable_Code_Point`. Pathnames are scanned before allowlist and
entry-type handling, while their raw Git bytes remain the filesystem identity.
The exact-path allowlist exempts content only, never an invisible name, and a
malformed raw name cannot match through its lossy decoded label. NUL or
malformed UTF-8 bytes do not fail by themselves, but cannot suppress detection
of a valid default-ignorable sequence elsewhere in the same tracked entry.
This categorical boundary includes the
originally reported U+200B-U+200F, U+202A-U+202E, U+2060-U+2064, and U+FEFF
ranges plus sibling bidi controls, combining joiners, variation selectors,
tags, and reserved default-ignorables that have the same invisible-review
risk. It corrects the kickoff enumeration after PR #122's independent triage
applied the range-gap lesson already recorded by #70. Diagnostics identify the
path, line, column, and code point without echoing attacker-controlled source
text.

An exact repo-relative path allowlist exists but starts empty; adding an entry
requires a conventional review of the protected scanner. Source and tests use
visible `\uXXXX` escapes or runtime code-point construction instead of literal
forbidden characters. This slice does not rewrite or normalize files, inspect
untracked/generated/dependency content, reject non-default-ignorable Unicode
merely for being non-ASCII, or change any factory publish/reconcile behavior.
It is one PR under the 400-line logic cap, routed through
`factory-security-reviewer` and QA before opening.

This contract shipped in cloud PR #122 (`c0814869`) after local security and
mandatory QA passes, three independently triaged current-head Codex fixes, a
clean final-head Codex verdict, and exact-head Ubuntu execution of all 1,522
tests including the Linux raw-path regression.

**D116 (24 Jul 2026) — deterministic issue-triage backfill uses manual
dispatch.** Cloud #51 adds a required `workflow_dispatch.issue_number` input to
`triage-issues.yml` while retaining `issues: [opened]`. Manual dispatch is the
only new trigger: `reopened` would require mutating issue lifecycle state and
cannot retrigger an already-open missed issue, while `labeled` risks
self-triggering through the triage pipeline's own readiness-label writes.

Both event paths resolve one target issue number, then the seed job validates
it as a positive decimal integer, rejects REST objects carrying the
`pull_request` marker or a non-open state before any write, and publishes the
only value trusted by seeding, agent context, and privileged verdict
validation. Invalid targets cause no issue write. Every triage execution,
including an Actions re-run of the original `opened` event, establishes the
same two-phase hold before the agent starts. Under a short shared per-issue
privileged-operation lock, seed first removes `ready-to-implement`, ensures
`needs-triage`, removes every other superseded readiness label with per-label
mutations, and verifies that non-authorizing readiness state from a fresh read.
Only then does it write and verify the `hold:<run-id>.<run-attempt>` factory
generation. This suspends stale implementation authorization without replacing
unrelated labels from a stale snapshot; the seed job needs no repository
checkout or `contents: read`.
The triage job fetches the target issue's current title, body, state, author,
and structured comments by that number because a dispatch has no
`github.event.issue` payload and a
re-triage must see human clarification. Before the agent sees that context, a
deterministic filter tags and retains authorized clarifications only from the
non-null issue author (regardless of association) or an `OWNER`, `MEMBER`, or
`COLLABORATOR`; all other commenters are excluded. The factory's own prior
triage verdict is retained separately as non-authoritative history only when
both the `gh issue view` actor login (`github-actions`) and exact hidden triage
marker match, so neither an outsider copying the marker nor another bot comment
can amend the issue. Retained context is capped at 50 comments and 64 KiB of
serialized JSON, failing closed with a visible error rather than truncating.
The implementation agent receives the same provenance-filtered bounded
clarifications, so it cannot discard information that made an issue ready.
Because the tracked filter is executable trust-boundary code used by both
agents, the implementing agent cannot edit anything under
`.claude/skills/triage/`: edit-tool denies provide defense in depth and the
publisher's authoritative applied-tree path guard is the load-bearing control.
The privileged apply boundary re-checks open state before
either its verdict or fallback path writes, closing the seed-to-apply race; the
implementation workflow requires open state alongside `ready-to-implement`
before starting the agent, and the privileged implementation publisher
re-checks both REST open state and the exact current `ready-to-implement` label
from one snapshot immediately before any branch or PR write. Seed, apply, and
publish use the same non-cancelling per-issue concurrency group with
`queue: max`; the lock serializes only the privileged state transitions, not
the long-running read-only agent work. Before generation production lands, a
prerequisite publisher fence treats every valid or malformed generation-marker
line immediately adjacent to the exact bot-owned triage comment's terminal
marker as non-publishable. It traverses the complete bounded comment history
with GitHub's opaque GraphQL connection cursor and fails closed when the
connection cannot be exhausted; offset page numbers are unsafe because a
concurrent deletion before a page boundary could otherwise skip the first
comment on the next page. Generation-like text elsewhere in agent-authored
rationale is data, not trusted syntax. Existing marker-only triage history has
no adjacent generation line and continues to use the readiness boundary, so
the prerequisite changes no current dispatch. The factory stays paused and any
pre-fence publish run is drained before generation production is deployed.

Apply re-checks the open issue and its exact hold, replaces that hold with the
validated verdict plus final `<run-id>.<run-attempt>` generation, then mutates
and verifies readiness. The prerequisite fence makes both hold and final
generations non-authorizing during the producer slice, so a committed label
write with a lost response, or a failed recovery attempt, still cannot publish.
Implementation later captures the final generation at eligibility, and publish
replaces the blanket denial with an exact current bot/marker generation match.
Therefore a publisher and re-triage have a clear ordering: a publisher that
acquired the lock first may finish, while a seed that acquired it first
withdraws and verifies readiness before changing the generation. This is
immediate revocation at the privileged publish boundary without cancelling a
process mid-push. Numeric run-id-only markers remain readable as legacy history,
but every new execution includes
`GITHUB_RUN_ATTEMPT` so an Actions re-run cannot alias the prior attempt.
Dispatches from
non-`main` refs run no job and receive a run-unique rejected concurrency group,
so they cannot cancel or replace an
authorized per-issue run;
the existing `FACTORY_PAUSED` gate and pause notice remain authoritative. The
runbook discovers open issues only and uses explicit per-issue dispatches
against current `main` for both paused and disabled windows, avoiding the
old-run workflow-definition hazard of `gh run rerun`.

Delivery is seven ordered conventional PRs, each independently under the
400-line logic cap:

1. **51a — protected bounded context substrate.** Add the shared deterministic
   provenance/size filter, pass that context to triage and implementation, and
   protect the executable triage skill directory at both enforcement layers.
   This slice retains the existing `issues: [opened]` trigger and existing
   seeding/apply/publish semantics; its PR uses `Refs #51`.
2. **51b-1 — shared privileged lock and publisher eligibility fence.** Move
   only seed, apply, and publish onto the same short queued per-issue lock;
   reject non-canonical implementation targets; and re-check REST open state
   plus the exact readiness label before branch or PR writes. Long agent jobs
   stay outside the shared lock, and existing implementation dispatches remain
   operable. This slice uses `Refs #51`.
3. **51b-2a — generation-era publisher deny fence.** Teach the privileged
   publisher to read the canonical exact-bot/marker triage history and reject
   every valid or malformed adjacent generation-marker line across all comment
   pages through an opaque GraphQL cursor, failing closed before local git work
   when complete bounded exhaustion cannot be proved. Because no generation
   producer exists yet,
   current implementation dispatches remain operable. Pause and drain any
   pre-fence publish run before the producer deploys. This slice uses
   `Refs #51`.
4. **51b-2b-i — apply verification substrate and generation primitives.**
   Harden the existing apply path without activating generation production:
   validate the canonical trusted issue number, re-check open state at the
   privileged boundary, verify readiness PUT outcomes, and recover ambiguous
   authorizing writes to the existing fail-closed state. Add the typed marker
   build/extract primitives needed by the next slice. Existing opened-event
   triage remains generation-free and operable. This slice uses `Refs #51`.
5. **51b-2b-ii-a — opened-event two-phase generation producer core.** Keep the
   existing `issues: [opened]` trigger while atomically adding readiness-first
   verified seed holds, bounded unique-comment discovery, exact comment-id
   threading, final/fallback generation production, and run-id-plus-attempt
   identity for apply. Apply writes the validated final generation before
   replacing and verifying readiness; the 51b-2a publisher fence keeps every
   generated state non-publishable even across ambiguous API outcomes. Keep
   the factory paused through this producer-only rollout. This slice uses
   `Refs #51`.
6. **51b-2b-ii-b — deterministic manual dispatch and backfill activation.**
   Add the required dispatch input and run name, canonical target
   normalization/validation, main-only dispatch gates and per-target
   concurrency, current-context wiring, runbook procedure, and backfill
   execution on top of the already-atomic generation producer. This slice
   uses `Refs #51`.
7. **51b-3 — exact-generation implementation consumer.** Require the current
   dotted authorizing generation before the implementation agent starts and
   have the publisher re-check the same canonical exact-bot/marker history
   under the shared lock. Legacy numeric and hold generations remain readable
   history but cannot authorize publication. This slice records final state
   and closes #51.

Slice 51a shipped in cloud PR #123 (`eec686c2`) with 108 production
insertions. Local factory-security, QA, and independent triage passed; all
required CI and `codecov/patch` passed; the exact-head Codex review was clean.
The intentionally optional Claude review check failed while its App
installation was suspended. Slice 51b-1 shipped in cloud PR #124 (`4d3547f0`)
with 53 production insertions. Local factory-security, QA, and independent
triage passed; all required CI and `codecov/patch` passed. Its exact-head Codex
review incorrectly treated the newly documented job-concurrency `queue: max`
property as unsupported; independent triage verified the current GitHub schema,
recorded the accepted 100-item cap and wait-time FIFO semantics, and resolved
the thread with no code change. Slice 51b-2a shipped in cloud PR #125
(`04264719`) with 216 production insertions. The initial offset-page draft was
stopped before open when local factory-security review found that an unrelated
comment deletion could shift a page boundary and skip generated history; the
shipped publisher uses opaque GraphQL cursors and rejects partial, malformed,
errored, or unexhausted bounded responses before local git work. Local
factory-security, QA, and independent triage passed; all required CI and
`codecov/patch` passed after the five initially partial branches were covered;
the exact-head Codex review was clean. The intentionally optional Claude review
check failed while its App installation was suspended. Slice 51b-2b-i shipped
in cloud PR #126 (`20876886`) with 134 changed production lines. It validates
the canonical open target, verifies label replacements, recovers ambiguous
authorizing writes to the existing fail-closed state, and adds strict marker
primitives without activating generation production. Local factory-security,
QA, and independent triage passed; all required CI and `codecov/patch` passed.
The initially partial non-`Error` normalization branch was covered before
merge, and the exact-head Codex review was clean. The intentionally optional
Claude review check failed while its App installation was suspended. Slice
51b-2b-ii-a shipped in cloud PR #127 (`52facd22`) with 388 effective changed
production lines after the 32-line atomic dead-helper deletion exemption. It
activates verified two-phase generations for the existing opened-event path
only. Two exact-head Codex findings were independently confirmed and folded:
downstream-only re-runs now reuse the seed-established execution, and an
apply-only re-run accepts only that same trusted execution's exact hold or
final generation so it can repair a partial label/fallback failure. Local
factory-security, mandatory QA, and independent triage passed; all required CI
and `codecov/patch` passed; the final exact-head Codex verdict was clean. The
intentionally optional Claude review was skipped while its App installation
was suspended. The factory was paused and verified drained immediately before
merge and remains paused for the remaining rollout. Slice 51b-2b-ii-b shipped
in cloud PR #128 (`fb18fc0b`) with 69 changed production lines including the
validator trust-boundary doc update. It adds current-main per-issue manual
dispatch, rejects non-canonical targets before privileged writes, threads the
seed-validated target through triage and apply, and documents serial backfill
with exact readiness/final-generation verification. Pre-open QA added
behavior-level execution of the validation shell and documented `jq`
verifiers. Independent triage corrected retry guidance to require a fresh
dispatch rather than a downstream-only re-run whose seed generation remains
from attempt 1. Local factory-security, QA, and independent triage passed; all
required CI and `codecov/patch` passed; the exact-head Codex verdict was clean.
The intentionally optional Claude review check failed while its App
installation was suspended. The factory was paused and verified drained
immediately before merge and remained paused for 51b-3. Slice 51b-3 shipped in
cloud PR #129 (`9f49ae73`) with 152 changed production lines. It captures the
unique exact bot-owned final dotted generation before the implementation agent
starts and re-checks the complete canonical history under the shared publisher
lock before any branch or PR write; absent, duplicate, legacy, hold, malformed,
stale, and wrongly-owned history fails closed. Local factory-security, mandatory
QA, and independent triage passed; 1,639 tests passed with one intentional skip,
all changed executable lines were covered, and every required remote check
passed. `codecov/patch` did not post during the worker stall and was non-required
under the temporary operator decision. The spec-grounded review's six
current-head threads were independently dismissed as cross-slice false
positives after verifying the cumulative #123-#128 delivery. Codex's current-head
pagination finding was independently dismissed after a live API trace and the
official GitHub CLI v2.76.0 source confirmed that `gh issue view --json comments`
exhausts the comments connection before returning. All threads were resolved.
The intentionally optional Claude review check failed while its App installation
was suspended. The factory was paused and verified drained immediately before
merge and remains paused; no live triage-agent backfill runs while the Claude App
is suspended. Issue #51 is closed and its project item is Done.

This split was required when the settled 51a+51b draft reached 399 production
insertions before a final exact-head review found the protected-filter,
re-run-alias, cross-workflow race, and partial-write classes. None can be
deferred after merging code that introduces the affected trust boundary.
Reconstructing the corrected 51b design then reached 490 production insertions.
The first attempted split put the generation consumer before its producer, but
mandatory QA rejected that independently inoperable boundary. The corrected
sequence lands the shared readiness lock first, then the generation-era deny
fence, then the apply-verification substrate, opened-event producer, manual
dispatch activation, and exact-generation consumer; every intermediate state
remains operable and fail-closed at its available authorization boundary. All
seven slices route
through `factory-security-reviewer` and mandatory QA before opening and after
review folds. The story does not change triage verdict semantics or readiness
labels;
51a only narrows agent permissions around the new executable sanitizer. Live
agent execution waits for the suspended Claude GitHub App installation to
resume.

The earlier four-slice producer plan relied on readiness alone between 51b-2
and 51b-3. Pre-open factory-security and QA review rejected that boundary:
GitHub can commit an authorizing label write while its response is lost, and a
subsequent fail-closed reset can also fail. No multi-request rollback makes
that outcome atomic. The added prerequisite slice makes generation itself an
interim deny signal, so ambiguous readiness writes cannot authorize
publication. The same review also corrected seed ordering to verify readiness
withdrawal before writing the hold and required preservation of the prior
factory verdict as non-authoritative re-triage context.

The later 51b-2b implementation reached 544 changed production lines despite
staying at 398 insertions. The kickoff cap counts total live-logic churn, not
only insertions; its deletion exemption applies only to an atomically retired
unit. Pre-open independent triage therefore stopped the PR and split a
deploy-compatible apply-verification substrate from generation activation.

After the substrate shipped, the rebased activation draft still reached 421
changed production lines. Independent pre-open triage rejected a no-op manual
dispatch prerequisite as misleading scaffolding. The natural boundary keeps
the seed/apply generation transaction atomic: first produce generations for
the existing opened-event path, then expose deterministic manual dispatch and
its operator runbook on top of that producer. Both intermediate deployments
remain fail-closed behind the 51b-2a publisher fence, and the factory stays
paused until the exact-generation consumer is deployed.

**Must-fix — the factory's OWN PR must actually get reviewed (discovered live,
18 Jul 2026, on the first factory-authored PR #34):**

The publish job opens the PR as `github-actions[bot]` using the built-in
`GITHUB_TOKEN`. GitHub deliberately **suppresses / gates downstream workflow
triggers from `GITHUB_TOKEN`-authored events** (to prevent recursive runs). The
consequence, confirmed on #34: the factory PR's **CI run stalls in
`action_required`** (manual-approval-gated), the **Codex connector does not pick
it up** (same reason it skips Dependabot PRs), and Claude Code Review would not
fire either — so the PR the factory authored autonomously **sails past the entire
review + CI apparatus.** The automation that authors the PR is the same thing that
starves it of review. This is a hole in the review-integrity model, not a nicety.

- **FIX (the linchpin — a real security-posture decision, stays human §2):** the
  publish job must open the PR with a **workflow-triggering identity — a dedicated
  GitHub App token** (recommended: scoped, clean, revocable) or a PAT, **not** the
  built-in `GITHUB_TOKEN`. A PR authored by a proper App identity triggers CI +
  Codex + Claude Code Review exactly like a human-authored PR. Without this, "the
  review roster" cannot run on factory output at all. (Prerequisite for F1-S4;
  needs operator App-creation + secret.)
- **The roster for a factory PR = the same lenses we run on our own** (CI required;
  Codex advisory-but-triaged + the wait-for-verdict rule; Claude Code Review inline,
  not a required check; domain sub-agents routed by the AGENTS.md rubric). **Two
  decisions:** (i) publisher identity = GitHub App (rec) / PAT / live-with-manual-
  CI-approval; (ii) domain sub-agents on factory PRs = auto-run on matching diffs
  vs rubric-routed-for-human-invocation (rec: rubric-routed to start, automate later).
- **Independence is structural here (D23), not a courtesy:** the author of a factory
  PR is ALWAYS an agent, so the implement agent must never triage its own review —
  the human or the `pr-triage` sub-agent adjudicates every finding; the author only
  ever produced the diff. This is the single most important review rule in the
  factory, and the reason `pr-triage` exists.

**Should-add — hardening / correctness of the ramp:**

- **A permanent human spot-audit that survives full autonomy** — 100% of PRs
  touching the security surface (secure views / grants / validation) + ~10%
  random, rotated auditor. The current ramp removes the human at triage and
  never statistically re-inserts one.
- **Re-shape the §10 ratchet gate.** "≥5 with zero overrides" is under-powered:
  n=5 can't distinguish an 80%-good agent from a 50%-good one, and easy tickets
  won't surface the over-eager-on-underspecified-issue mode. Gate on **issue-type
  diversity + a confidence-interval acceptance threshold**; add a **shadow /
  draft-for-audit rung** before auto-chaining; and **weight triage-override-rate
  above first-pass-green** (green-rate is agent-movable — a canary built to be
  gamed; override-rate is a human judgement the agent can't write to).
- **Spec-grounded review** — review against the issue's acceptance criteria, not
  just the diff (green ≠ maintainable/correct-on-edge-cases, per SWE-Atlas).
- Fold at F1: `--ignore-scripts` (malicious postinstall), a guard against
  base64/obfuscated secret leakage in CI logs, and validation of the triage JSON
  at the applier (a prompt-injected verdict must not lie to the privileged job).

**Confirmed good (keep as-is):** the two-workflow trifecta break (§8), the
human-gated merge, the independent pr-triage adjudicator, the different-family
(Codex) reviewer as the *first* independence move, and the
non-safety-critical-repo-as-testbed scoping. hubble.md's
seed/read-only/privileged-publisher attribution verified real in its workflow
YAML. Wording nit: the Warp post *is* the Oz cloud-factory series (uses
`oz-agent-action`) — adapting the pattern without hosted Oz is legitimate, but
soften any implied clean separation.

Sources: Anthropic claude-code-action docs + `security.md`; GitHub Security Lab
two-workflow + pwn-request guidance; GMO Flatt/RyotaK CVE (fixed v1.0.94);
Willison on the lethal trifecta; ImpossibleBench (ICLR 2026); Cursor + Meta on
reward-hacking + mutation testing; "Play Favorites" / "Nine Judges, Two Effective
Votes" on cross-family reviewer correlation; Google SRE canarying-releases.

**D117 (25 Jul 2026) — privileged repository execution is bounded by
credential reachability.** For cloud #120, the operator selected the
protected-glue policy rather than an immutable-artifact system or a general
acceptance of protected code delegating to agent/PR-mutable workspace code.
The policy applies while a secret or a capable GitHub token is reachable, not
indiscriminately to every step in the same job.

The initial issue inventory found twelve jobs with an explicit `secrets.*`
reference or write permission. Pre-implementation security review corrected
that syntactic count: an action step can receive the implicit `github.token`
when its effective job permissions are non-empty even when the workflow never
spells `secrets.GITHUB_TOKEN`. The current boundary therefore covers fifteen
jobs: the eight factory jobs already listed on cloud #120, the DEV Snowflake,
Dependency Review, and CodeQL jobs, plus all four CI jobs. Future jobs fail
closed into the same classification when their effective permissions,
environment, secret expressions, reusable-workflow inputs, containers, or
runtime token production cannot be proven credential-free.

The trust and reachability model is:

- Repository executables have two explicit trusted-source classes. The general
  class is glue protected by the implementing-agent patch guard whose bytes
  come from an exact, already-reviewed revision that the current PR/agent
  cannot choose or mutate. A path named `scripts/factory/**` from PR head is
  not trusted merely because its pathname is protected. The only unprotected
  repository-code class accepted by this decision is `snowflake/**` from an
  exact, already-reviewed main `github.sha`, in the main-only DEV Environment
  job after human approval; this does not authorize unprotected code in any PR
  or agent workflow. Event `base.sha` and that named main `github.sha` are
  acceptable immutable sources only when checkout and any later restore/copy
  operation are verified against the same SHA. Any new trusted-source class
  requires a later operator decision.
- Credential sources include explicit secrets, the implicit `github.token`,
  OIDC request capability, App tokens minted into outputs, checkout-persisted
  credentials and helpers, environment/container/service credentials, and
  tokens or configuration written through output/state/config files.
  Permission inheritance, YAML aliases/merge keys, mapped or inherited
  reusable-workflow secrets, and dynamic secret-context access are part of the
  classifier. Unknown forms fail closed.
- Reachability runs in both directions through time. Mutable code before a
  credentialed step can poison the workspace, `$GITHUB_ENV`, `$GITHUB_PATH`,
  `NODE_OPTIONS`, package/git configuration, installed tools, background
  processes, or containers; a credentialed step can leave equivalent state
  for later mutable execution. A fresh job/runner plus a narrowly validated
  artifact is the default credential cut. In-job cleanup is not initially
  treated as proof.
- Trusted protected code may consume PR/agent-controlled **data** only through
  a typed, bounded contract that rejects unexpected names, types, sizes,
  symlinks, configuration, plugins, hooks, modules, or executables. Parsing
  untrusted diffs, source, coverage, or review artifacts is not itself
  execution; treating executable/configuration input as "data" is forbidden.
- Exact-SHA remote actions are explicit trusted delegation boundaries.
  Repository-local actions are not: `uses: ./...` is forbidden throughout
  every credential-bearing job because composite and container actions inherit
  workspace/context channels too broadly for a step-local textual exception.
  Remote actions that consume workspace data need their own bounded contract.
- Repository Node closure uses a closed supported grammar, not best-effort
  tracing. Literal relative static imports/exports must stay within the trusted
  tree. Dynamic import/`require`/`createRequire`, workers, VM/custom-loader
  paths, native addons, package/bin/script resolution, and child-process shell
  forms are rejected unless a structured exact rule proves the target.
  Approved external commands use a central no-shell executable/argument
  contract; unknown or computed repository execution fails closed.
- Ordinary workflow shell and container execution has its own closed structural
  grammar before any job activates this policy. Aliased or merged `run`,
  `shell`, `working-directory`, job/action containers, services, workspace
  mounts, and environment inheritance are resolved first. Direct scripts,
  `source`/`.`, shell indirection, command substitution, `eval`, package
  scripts/bins, and repository-path arguments must resolve to a trusted source;
  unsupported shell syntax fails closed. A pinned remote container/action is an
  explicit delegation boundary, not evidence that mounted workspace content is
  non-executable.

This decision is specifically the **repository-local executable** boundary.
It names, but does not pretend to cryptographically close, the existing
external trust root: GitHub-hosted runner images, the Actions runner and
expression engine, exact-SHA remote actions and their documented runtime
delivery, declared toolchain installers/versions, and package-manager content
accepted through the existing F1-S7 action-pin, lockfile, install-script,
dependency-review, and license controls. A future hash-complete external
supply-chain closure is a separate decision, not an implied property of D117.

Prompt-controlled misuse of an otherwise trusted credentialed tool is also a
separate capability problem. D117 constrains what repository code can execute;
it does not claim that the current Claude review job's allowed `gh pr` commands
are safe from prompt-driven argument misuse. Cloud #47 owns that Bash/tool
redesign and remains held while the Claude GitHub App is suspended.

Every violation fails the structural CI audit with a source line and no
partial allow. A job is not called compliant merely because its direct
entrypoint is protected while its import/process closure is unattested. The
factory remains paused during this work, and no local action may be introduced
before the first enforcement slice. Delivery is fourteen serial, independently
green conventional PRs off current `main`, each scoped as one coherent review
unit and normally targeting about 400 changed production lines. Every slice
routes through `factory-security-reviewer`, mandatory QA, and independent PR
triage:

1. **120a — credential classifier and all-job local-action ban.** Add the
   minimal semantic YAML classifier for effective permissions, explicit and
   implicit credential sources, environments, aliases/merge keys, reusable
   workflows, containers, and checkout persistence; reject every local action
   in every classified job. Apply this immediately to all fifteen live jobs.
2. **120b — source/reachability/data policy substrate.** Add the typed pure
   analyzer for immutable source provenance, bidirectional state reachability,
   fresh-runner cuts, exact-SHA remote delegation, and bounded data crossings.
   This is analysis substrate only and does not declare a Node entrypoint or
   live job compliant.
3. **120c-1 — closed Node import/provenance verifier.** Add bounded transitive
   static import/export closure, exact module resolution, symlink/realpath
   containment, cycle handling, and canonical closure evidence. It remains
   unactivated until each live boundary migration supplies a complete root set.
4. **120c-2 — Node runtime/process capability verifier.** Reject dynamic
   loaders/code generation and permit only centrally reviewed external process
   capabilities with closed executable, cwd, environment, and argument rules.
5. **120d — workflow-shell/container verifier.** Add the closed whole-step
   grammar and exact allowlist for ordinary `run` roots, working directories,
   shell indirection, package scripts/bins, and job/remote-action
   container/workspace execution. Unknown YAML or shell/container execution
   forms fail closed before any live-job activation.
6. **120e — triage workflow activation.** Enforce the completed classifier and
   closure for `seed`, `triage`, and `apply`: no-checkout inline writes,
   read-only agent/sanitizer execution, and protected exact-SHA apply glue.
7. **120f — implementation-agent credential cut.** The credential-bearing
   pinned Claude action may read and edit the workspace but may not invoke Bash,
   another process tool, package script, or mutable workspace executable.
   Environment scrubbing remains defense in depth rather than the trust
   boundary. Keep agent output as a bounded patch/data artifact and execute the
   resulting tree only in a fresh credential-free job.
8. **120g — implementation publisher activation.** Enforce exact trusted-source
   closure for the write-capable publisher and validate every artifact crossing
   before protected glue, git, or GitHub APIs consume it.
9. **120h — Claude review-agent activation.** Enforce source/data/closure
   contracts for `claude-review` and `spec-grounded-review`, including the
   immutable plugin checkout and the explicit #47 capability residual.
10. **120i — spec-grounding publisher activation.** Enforce the base-SHA
   protected closure and bounded review-artifact contract independently of the
   read-only review jobs.
11. **120j — Dependency Review remediation.** Stop executing a PR-head local
   script in the PR-write job; separate unprivileged validation from a clean
   write-capable pinned-action/reporting boundary with a bounded result.
12. **120k — CI and Codecov credential cut.** Remove unnecessary implicit token
    capability from the four ordinary CI jobs and move Codecov upload to a
    clean job that consumes only a bounded coverage artifact.
13. **120l — CodeQL remote-delegation contract.** Record and enforce the
    exact-SHA remote analyzer as trusted code consuming bounded untrusted source
    data, with no repository-local executable edge in the write-capable job.
14. **120m — DEV Snowflake trusted-main boundary.** Require main-only
    environment approval, exact `github.sha` checkout, and reviewed-source
    verification for every credential-bearing script/migration input; record
    package installation as part of D117's named external trust root. This
    final slice updates state and closes cloud #120.

Slices 120a-120d land the reusable analyzer/enforcement machinery; 120e-120i
activate the eight factory jobs before 120j-120m remediate the adjacent jobs.
Pure analyzer slices make no intermediate compliance claim, and activation
never precedes the closure it depends on. If any measured production diff
materially exceeds the target, the PR plan records whether a responsibility,
security-boundary, dependency-order, or reviewer-load split improves
reviewability. It splits when that analysis identifies a coherent boundary; it
does not split merely to preserve the planned count.

**D118 (25 Jul 2026) — Node closure splits at import provenance versus
runtime capability, with bounded traversal.** The first measured cloud #120
Node verifier was 563 production lines, beyond the then-exact 400-line hard
stop. The operator approved the security-review recommendation to split it
before a PR: 120c-1 owns static import/export and module provenance; 120c-2
owns dynamic loading, code generation, and external process capabilities.
Neither slice activates a live job, and 120d still owns workflow
shell/container launch semantics.

The operator also approved exact 120c-1 traversal ceilings after measuring the
current factory baseline (20 Node files, 18 relative static edges, 844,335
source bytes total, largest file 103,374 bytes):

- at most **128** canonical source files;
- at most **512** runtime static import/export edges;
- at most **1,000,000 bytes** per source file;
- at most **8,000,000 source bytes** across the closure.

The verifier fails closed when any ceiling is exceeded. It rejects symlink or
realpath escape, unsupported/non-explicit local resolution, and ambiguous
external resolution; returns the canonical verified file set so execution-time
byte evidence can be revalidated; and accepts no caller assertion as proof
merely because it is truthy. Package resolution remains within D117's named
lockfile/install external trust root and must resolve to the exact reviewed
package target, not a repository alias or URL-like specifier.

**D119 (25 Jul 2026) — PR size is a reviewability guide, not a binary
cutoff.** The operator superseded D104's binary size and exact-one mapping plus
the size-only parts of D117-D118: conventional PR plans normally target about
400 changed logic lines, but slice boundaries are chosen by coherent
responsibility, security boundary, dependency order, and reviewer load. A materially larger
slice records in its story plan and PR body why it is more reviewable than the
available splits, then passes the applicable domain reviewers and independent
pre-open triage. A large unexplained diff is replanned; a justified cohesive
diff may proceed. Tests remain excluded from the logic estimate. Docs,
fixtures, generated files, and data are excluded only when placed in their own
PR where independently reviewable or at least a dedicated non-logic commit;
atomic deletion remains excluded. The repositories' exact test-volume QA
trigger remains in force. D118's 120c-1/120c-2 split is retained because static
module provenance and runtime/process capability are distinct security
boundaries, not because the original combined draft crossed a line-count
threshold.

**D120 (25 Jul 2026) — execution path is an authorization boundary.**
Conventional-ready work uses the non-authorizing
`ready-for-conventional-implementation` label. Only factory-dispatchable work
may receive `ready-to-implement`. Until the automated publisher gains
independent pre-open review and multi-commit support, it deterministically
enforces the exact factory envelope recorded in §5 against its applied
scratch-index diff and rejects any out-of-envelope patch before push.

**D121 (26 Jul 2026) — factory logic and tests share one 400-line ceiling.**
Every factory patch containing logic or test-source churn is capped at 400
combined changed lines. A changed file under a test root can become
production-reachable through a logic import from either the same patch or an
earlier PR, and the current privileged publisher intentionally does not add a
second, fragile import parser merely to preserve D120's former 600-line
pure-test allowance. This is a conservative temporary authorization boundary:
a larger patch routes to conventional execution, where the existing test-volume
QA trigger still applies. A larger pure-test factory allowance may be
reconsidered after executable-closure enforcement proves test roots are
unreachable from production entrypoints.

**D122 (26 Jul 2026) — every textual factory path shares the ceiling, and
intake exposes the artifact cap.** A path-only inert-output allowlist cannot
prove runtime inertness: an earlier small logic PR can import or read an
allowlisted JSON, fixture, or design document, after which a later output-only
patch changes production behavior. Until executable-closure enforcement exists,
every non-binary changed line therefore contributes to the same 400-line factory
ceiling, including allowlisted data, fixtures, generated output, and design
docs. Path categories remain only to enforce the separate-issue/PR rule for
mixed output plus logic/tests. The publisher's existing 2 MiB captured-patch
limit is also an authorization/intake constraint; work expected to exceed it
routes to conventional execution rather than failing only after implementation.

**D123 (26 Jul 2026) — Node external processes are adapter capabilities, not
per-call exceptions.** The public 120c-1 import verifier remains strict and
continues to reject `node:child_process` everywhere. The combined executable
closure verifier may privately recognize that module only in one exact,
protected central process adapter. No other repository source receives a raw
process API exception.

The adapter exposes typed named capabilities backed by a central reviewed
registry. Each capability closes the executable identity, canonical working
directory, explicit environment, validated argument grammar, and `shell:
false`; callers cannot supply or override raw spawn options. Exact capability
rules are part of the verified executable closure, and an unknown capability,
executable, argument, directory, environment entry, or computed target fails
closed.

The initial supported runtime grammar rejects dynamic `import`, `require`,
`createRequire`, `eval`, `Function` and equivalent code constructors,
`node:vm`, workers, custom loaders/module registration, `process.dlopen`,
native addons, and raw `spawn`/`exec`/`fork` or equivalent external-process
paths outside the protected adapter. A later capability requires its own
reviewed registry rule; it is never authorized by a local call-site allowlist.
120d still owns workflow shell syntax, containers, startup flags, package
scripts/bins, and workflow environment inheritance. This analyzer slice
activates no live job and makes no compliance claim.

**D124 (26 Jul 2026) — runtime analysis precedes the first callable process
capability.** Pre-implementation factory-security review split D118's 120c-2
at a coherent security boundary:

1. **120c-2a** adds one stable-read traversal shared by static provenance and
   a closed, binding-aware repository runtime grammar. The combined verifier
   recognizes the hard-coded protected adapter path and exact allowed
   `node:child_process` import shape in synthetic fixtures only. It does not
   add a production adapter or raw process import.
2. **120c-2b** adds the protected adapter together with its first real named
   capability and migrates one consumer. The executable, canonical working
   directory, fresh explicit environment, command-specific bounded arguments,
   no-shell spawn options, timeout/output/lifecycle behavior, and immediate
   pre-spawn path revalidation are therefore reviewed against a concrete use,
   not an empty registry or generic runner.

The combined verifier analyzes the same canonical path, stable source bytes,
decoded text, and AST for both passes; it never calls the public import
verifier and then re-reads. The adapter identity is internal policy, not a
caller-selected exception, and the public import-only contract remains
universally strict. External locked packages remain terminal exact-resolution
delegations under D117's named lockfile/install trust root, so this repository
AST grammar claims closure over repository-triggered runtime capabilities, not
inspection of arbitrary dependency internals. Both slices remain unactivated
analysis/capability substrate and preserve 120d's separate workflow grammar.

**D125 (26 Jul 2026) — repository runtime analysis is bounded and uses closed
property grammar.** The 120c-2a analyzer admits at most **100,000 AST nodes**
and **256 levels of AST depth** per source file, inside D118's byte ceilings.
The measured current factory maxima are 5,969 nodes and depth 25, so the limits
leave more than 16× node and 10× depth headroom while bounding parser and
analysis amplification. Parser, traversal, or analyzer failure returns a
structured violation and erases all success evidence; it never escapes as an
uncaught availability failure.

Erased ambient declarations do not establish runtime bindings, and default
parameter environments are distinct from function-body `var` bindings.
Non-literal computed member reads, computed destructuring, reflection/code
constructor paths, and identity recovery through `global`, `globalThis`,
`module`, `Object`, or `process` fail closed. Direct `process` and `Object`
properties use exact minimal allowlists derived from the current factory
corpus. The 120c-2a synthetic adapter fixture may prove only the exact protected
named import; every use of its raw process binding remains rejected until
120c-2b adds and verifies the first concrete named capability.

**D126 (26 Jul 2026) — the first process capability is exact Git tracked-path
enumeration.** The operator approved `/usr/bin/git` as the exact executable
identity for 120c-2b. The protected adapter exposes only the typed
`listTrackedPaths(repositoryRoot)` capability and migrates only the
pre-install invisible-format scanner. The publisher's broader Git command
surface remains outside this slice.

The capability canonicalizes the supplied repository root with `realpath`,
requires it to be a directory, and immediately before spawning revalidates
both that canonical working directory and `/usr/bin/git`; the executable's
realpath must remain exactly `/usr/bin/git`. It runs exactly
`["ls-files", "-z"]` with `shell: false`, a 30-second timeout, `SIGKILL`,
ignored stdin, captured stdout/stderr, a 16 MiB output ceiling, and no
caller-supplied spawn option.

The child receives a fresh environment containing only `LC_ALL=C`,
`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`,
`GIT_OPTIONAL_LOCKS=0`, and `GIT_TERMINAL_PROMPT=0`; it inherits no `PATH`,
Git routing variable, credential, or other parent state. Nonzero exit,
signal termination, timeout/spawn error, unexpected output type, or output
above the ceiling fails closed through a sanitized capability error and never
echoes child stderr.

The executable-closure analyzer admits one raw `spawnSync` call only in this
exact adapter capability and validates the executable, argv, environment,
cwd binding, lifecycle, and output-bound rule structurally. Aliasing,
re-export, duplicate calls, computed registry access, alternate values, or
raw process use anywhere else remains rejected. This is capability substrate:
it neither activates a workflow nor declares a job compliant.
