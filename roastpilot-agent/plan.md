# roastpilot-agent — Component Plan (M1)

**Status**: Drilled down and agreed, 6 June 2026
**Repo to create**: `github.com/syamaner/roastpilot-agent`
**Deadline anchor**: harness complete July 2026; demo assets recorded before 17–18 Sept talk
**Authoritative architecture source**: `roastpilot-agent-orchestration-plan.md` (this document refines, never contradicts)

---

## 1. Decisions (this drill-down)

| # | Decision | Choice | Notes |
|---|----------|--------|-------|
| D5 | Advisor provider | **OpenRouter** via PydanticAI (OpenAI-compatible endpoint) | One API surface, swappable model slugs — enables advisor-model comparison material for the talk. Model slug is config (`ADVISOR_MODEL`); default to a strong structured-output model (Anthropic Claude Sonnet slug on OpenRouter; confirm exact slug at implementation). Tests always use a deterministic `FakeAdvisor`. |
| D6 | MCP wiring | **Agent spawns `coffee-roaster-mcp` as stdio child process** | One systemd unit; agent restart ⇒ clean MCP restart into the recovery flow. Matches the published stdio transport (`config.py` hard-codes `TransportType = Literal["stdio"]`). |
| D7 | Profiles | **Minimal static profile** | name, bean (origin/varietal/weight), charge guidance range (default 170–200 °C), initial heat/fan, target drop temp, target development %. No curve targets in M1. |
| D8 | SPA scope (M1) | **Dashboard + roast detail + history** | Settings via config file; rating UI + cloud screens are M2. |
| D15 | Safety verdict vocabulary & shared enums (7 Jun 2026, E1 review) | **Six typed verdicts: `ALLOW / CLAMP / REJECT / RECOVERY / FAULT / EMERGENCY_STOP`; `SafetyEvaluation.adjusted_heat/fan` nullable; `RoastPhase` lives in `models.py`; shared enums are plain `Enum`, never `StrEnum`** | Resolves the E1-review discrepancy: §5's schema column already said `recovery` while the kickoff's five-value list was an elision. RECOVERY signals "enter `operator_recovery_required`" as distinct from FAULT (acknowledge-and-stop). Nullable adjusted values per §5 schema — REJECT/RECOVERY/FAULT/E-STOP carry no adjusted command, and a fabricated 0 is indistinguishable from a clamp-to-zero in the decision trace. `RoastPhase` moved from `controller.py` to `models.py` (store/api/advisor all consume the phase vocabulary; importing from controller would cycle once the tick loop wires those modules) — controller re-exports it. Plain `Enum` (not `StrEnum`) so comparing a member to a raw string is a pyright strict error (`reportUnnecessaryComparison`), enforcing the never-string-compared invariant mechanically. |
| D16 | Safety coverage completion (7 Jun 2026, post-E1 issue audit) | **Three orchestration-plan § Safety Policy items were dropped in this plan's §8 condensation and must be assigned: (1) invalid phase command attempts and (2) FC/T0 source validity → safety policy (E3, new story E3-S5); (3) operator timeout in operator-required states → controller (E4), with a cross-reference from E7's disconnect-handling story** | Audit of the E1-derived issues against the orchestration plan's 15-item first-layer safety list found these three unassigned in any epic. Ownership split keeps E3 = pure command/safety rules and E4 = state-machine behavior, consistent with the T0-debounce ownership already in E4. Invalid-phase = command×phase validity matrix (e.g. `set_heat` during `cooling` rejected); source validity = FC/T0 state transitions accepted only from MCP detection status or explicit operator action; operator timeout matters *only* in true operator-required states (manual confirmation, hold, recovery), per orchestration plan § Safety Policy. |
| D17 | July milestone definition of done (7 Jun 2026, programme review) | **"Harness complete (July)" = (1) E9 vertical slice green in CI (12-step mock roast), + (2) E10 device dashboard usable for a live roast (D8 scope), + (3) one supervised real-hardware roast end-to-end.** E11 (packaging) and E12 demo-asset polish may run into August; demo assets (≥1 CLAMP and ≥1 REJECT trace, MCP interaction trace, full-workflow screen recording) must be recorded by end of August to leave September for slides. | The CFP organizer notes promise "completion expected in July" without defining completion; this pins it so implementation optimizes for the right finish line. Criterion (3) deliberately pulls hardware risk forward: the first supervised hardware session should happen in **June**, which also resolves plan §11 item 2 (`drop_beans` cooling behavior) early. E1–E3 closed 7 June; E4 active. |
| D18 | Advisor is provider-agnostic via a config-selected PydanticAI model factory (7 Jun 2026, E8 design) | **One `PydanticAIAdvisor` consumes a PydanticAI `Model` built by a `build_model(config)` factory — NOT one advisor class per provider.** `AdvisorConfig` gains `provider: Literal["openai","anthropic","google","ollama","openai_compatible"]` (default `openai_compatible`). `openai_compatible` + base_url covers OpenRouter (bake-off) and Ollama (local LAN); `openai`/`anthropic`/`google` use PydanticAI native providers directly. Each native provider is an optional dependency extra; each has its own `*_API_KEY` env. `FakeAdvisor` stays the test/CI default — no live calls in CI; each provider path tested behind a recorded-response double. | Supersedes the OpenRouter-only reading of D5: structured-output handling, prompt versioning, context hashing, and typed error mapping are written once; only Model construction varies per provider. Native-direct avoids OpenRouter's hop/markup for the settled default (and reuses the operator's existing OpenAI key), while OpenRouter remains one option for the cross-provider bake-off (E8-S4). Closes the E8-S2 ambiguity about whether "OpenAI-compatible endpoint" meant OpenRouter-only — it does not. |
| D19 | Operator-action ownership across E4/E7/E9 (8 Jun 2026, E7 implementation) | **§6 lists 9 operator actions; as of E7 the queue accepts and records all 9 but only 5 are executable.** Controller handlers exist for **5** (E4): `mark_first_crack` (`operator_mark_first_crack`), `drop_beans` (`operator_drop_beans`), `stop_cooling` (`operator_stop_cooling`), `emergency_stop` (`operator_emergency_stop`), `acknowledge_recovery` (`operator_resume`/`operator_acknowledge_fault`). The remaining **4** — `mark_beans_added`, `start_cooling`, `pause_advisory`, `resume_advisory` — are **queued-but-not-executable** until E9. Agreed split: **E4** = core controller handlers; **E7** = the API queues all 9 (action → `operator_actions` row → controller queue) with a phase-validity pre-check via the existing `evaluate_command_phase`, no MCP write; **E9** = wires the remaining 4 controller handlers + the queue drain + a queue bound + a terminal-run guard, each routing through the *full* safety policy before any MCP write. | E7 is the API surface and E9 the live wiring (D17 vertical slice); making 4 new hardware-adjacent handlers was out of E7 scope (AGENTS.md: heat/fan/drop/cooling/e-stop behavior needs explicit tests + safety review, and E7 must not change `controller.py`/`safety.py`). Recording the gap so E9 does not silently ship 4 inert actions: the queue's accept/record path and the controller's execute path are deliberately separated, and the queue never bypasses safety (the controller re-runs the full policy on drain). Cross-references: agent-repo `docs/epics/E07-api.md` "For E9" notes and `docs/epics/E09-vertical-slice.md` "E7 handoff (do first)" section. |
| D20 | Advisor default model + prompt, from the E8-S4 bake-off (8 Jun 2026) — resolves §11 item 1 | **Default: `anthropic/claude-opus-4.8` via OpenRouter (`provider=openai_compatible`), prompt `v1`.** Operator-judged bake-off of 7 candidates (local reasoning-off Qwen + 6 OpenRouter slugs: gemini-3.5-flash, claude-haiku-4.5, gpt-5-mini, claude-sonnet-4.6, claude-opus-4.8, gpt-5.5) replayed through the real `PydanticAIAdvisor` against the same grounded 7-Jun live-roast context at 3 development moments, N=3. The **hard gate is latency** (≤10 s, the controller's tick-aligned budget); quality is operator-judged. Only `gpt-5-mini` failed the gate (reasons by default, 12–16 s). Opus-4.8 won: frontier reasoning with comfortable latency margin (~4.4 s; ~5.7 s on v1) — decisive for an **electric** roaster, whose thermal lag means advice must arrive early. The bake-off also surfaced that the original `v0` prompt ("small, conservative adjustments") suppressed the drastic early heat cuts an electric roaster needs to maximize development time in its narrow first-crack→drop window; **prompt `v1`** encodes that hardware reality and is now the default. Native-Anthropic (`provider=anthropic`, no OpenRouter hop/markup, D18) is a config swap when an `ANTHROPIC_API_KEY` is available. | Closes the last M1 open item. Slugs/providers are config-swappable (D18), so the default is revisable without code change. Captured as agent-repo `docs/advisor-bakeoff-2026-06-08.md` (reproducible via `scripts/advisor_bakeoff.py`); also the talk's first real A/B advice dataset. Open follow-ups (non-blocking): ambient/room temperature in `AdvisorContext` (operator notes it affects an electric roast); re-measure if the slate or prompt changes materially. |
| D21 | Advisor prompt refined to `v2` (fan + duration); default updated (8 Jun 2026, third bake-off run) — refines D20 | **Default prompt is now `v2`** (model unchanged: `anthropic/claude-opus-4.8` via OpenRouter). Operator domain input after the v1 run surfaced two gaps v1 ignored: on a **Hottop the fan is a primary, flavor-coupled lever** — it sets the heat-transfer *mode* (radiant/conductive → convective) and prevents scorched/baked flavor, not just a coolant — and the real development objective is **duration** (a ~10–20 % development ratio, ~10 % can be excellent), with `target_drop_temp_c` a *guide* one may run modestly past (beans risk too-dark past ~195 °C, bean-dependent). `v1` was heat-only and treated the drop temp as a hard stop. `v2` encodes both coupled levers and judges `should_drop` on the development ratio. A third full-slate run under `v2` (same context/moments/N=3): the richer prompt (~1.8 k vs ~1.1 k chars) added ~1–2 s and pushed the borderline frontier models over the 10 s gate — **only qwen-local, haiku-4.5, and opus-4.8 pass; sonnet-4.6, gemini-3.5-flash, gpt-5.5, gpt-5-mini all bust.** Opus is the only frontier model still passing (~6.2 s), and its advice now coordinates heat+fan and reasons about the development ratio. Haiku-4.5 (~4.6 s, cheap) followed v2 well and is the documented fast/cheap fallback. | Confirms opus on the *shipped* prompt and demonstrates the latency gate's value: the more roast craft in the prompt, the more opus's margin matters. The eval doubled as a domain-knowledge elicitation tool — three operator clarifications (electric → fan-as-transfer-mode → duration-over-temperature) each sharpened the prompt. Captured in the same agent-repo doc (`docs/advisor-bakeoff-2026-06-08.md`, "Third run"). Surfaced follow-up: make `target_development_percent` an explicit `AdvisorContext` field so per-bean targets override the prompt's general band; refine the ~195 °C darkness threshold with more data. |
| D22 | Advisor `reasoning_effort` knob + measured token/cost; default reasoning `None`, opus holds (8 Jun 2026, cost/reasoning pass) — confirms D21 | **`AdvisorConfig.reasoning_effort`** (`None`/`off`/`minimal`/`low`/`medium`/`high`, default **`None`**) controls the OpenRouter `reasoning` request param for the openai-compatible path; `PydanticAIAdvisor.last_usage` records per-call tokens (cost/observability). A measured v2 pass priced each call against live OpenRouter rates, reasoning on vs off. Findings: the latency gate is also a **cost** filter (the over-gate models are the reasoning-token spenders); **opus is the most expensive *passing* model** ($0.0187/call, 5.6× haiku) but cost is not a constraint; **reasoning is mandatory on some endpoints** — disabling it on `gemini-3.5-flash` and `gpt-5-mini` returns a 400, so gpt-5-mini is permanently over the gate; the **Anthropic models do no extended thinking** (0 reasoning tokens) so their latency is structural and reasoning-off is a no-op; **`gpt-5.5` + `reasoning_effort="off"`** is transformative (10.8 s → 2.9 s, $0.0174 → $0.0075, over→passing) but cuts heat harder than opus (toward the stall/bake band), so it is documented as a speed/cost alternative, not the default. | Default stays **`opus` + `v2`**, `reasoning_effort=None` — forcing `"off"` would 400 on a gemini/gpt-5-mini swap-in and opus does not reason anyway. The knob + usage capture are reusable production cost-observability; the measured table is talk material (the gate-as-cost-filter point). Captured in `docs/advisor-bakeoff-2026-06-08.md` ("Fourth pass"). |
| D23 | E10 re-sliced for parallel agent-team delivery + the team operating model (9 Jun 2026, E10 kickoff) | **E10 is re-sliced from 4 stories into 6 so each is a clean single-owner branch/PR and the fan-out is unambiguous** (the prior S2 bundled scaffold+dashboard; S3 bundled history+detail — both fused a shared concern with a page). New stories: **S1 Replay harness** (Python) · **S2 SPA foundation** (scaffold + design tokens + typed API/SSE client + the **shared `LiveCurve`** + verdict helper + routing + SSE hook — the single-owned substrate) · **S3 Dashboard** · **S4 History** · **S5 Detail** · **S6 SPA tests + SSE behavior** (Safari/iPad §11.4). Dependencies: **S2 blocks S3/S4/S5**; S1 ∥ S2; S3 ∥ S4 ∥ S5 after S2 merges; S6 last. Operating model (agent team, the E10 experiment): the lead/PM session builds (or assigns) S1+S2, then spawns one teammate per page (S3/S4/S5), each **owning only `web/src/pages/<page>/` and consuming `components/shared` read-only**. **Review is independent of the author**: GitHub Claude Code Review + codecov on every PR (+ a `/review-branch` roster workflow pass as a second independent review), and `ui-reviewer` on the page PRs. **Triage is independent too**: GitHub review feedback is adjudicated by the lead/PM or the `pr-triage` subagent — **never the author teammate self-dismissing on its own PR** (closes the last "agent grading its own homework" gap). | E9's retro and the orchestration docs make the rule concrete: fan-out pays on *separable* work, but only once the shared substrate (the 5-series uPlot curve used by both dashboard and detail, the typed API/SSE client, the SSE hook, design tokens) exists single-owned — three page-teammates each scaffolding would collide and the experiment would fail for the wrong reason. The 6-story slice makes foundation-first explicit and gives each teammate a conflict-free branch. Independent review+triage is what lets the team run supervised rather than self-certifying. Cross-references: agent-repo `docs/epics/E10-spa.md`, `roastpilot-plan/.../e10-ui-kickoff.md`, the `pr-triage` subagent (`.claude/agents/pr-triage.md`), and the AGENTS.md merge policy (triage ownership). |
| D24 | E10 snapshot / visual-testing approach (9 Jun 2026, community-researched) | **Two-track visual testing, split by job.** (1) **CI gate = scripted `@playwright/test` `toHaveScreenshot()`** in a *pinned* Playwright Docker image (`mcr.microsoft.com/playwright:vX.Y.Z`, `--platform=linux/amd64` to match GitHub CI), baselines generated **inside** the container; deterministic via the replay harness + fixed viewport + `document.fonts.ready` + animations off + small tolerance (`maxDiffPixelRatio ≈ 0.01`, keep non-zero — even Docker drifts arm64↔amd64). (2) **The uPlot canvas is NOT pixel-snapshotted** — `mask:` the canvas region in chrome screenshots and **assert the chart's *data*** via a test hook (the replay harness makes data deterministic); at most one loose "did it blank/crash" canvas smoke shot. No GPU runner (the GPU-snapshot path is ~7–10 min/test + paid). Pixel-snapshot the **DOM chrome** (header, advisory panel, badges, modals, tables) per replay state. **Vitest** snapshots only as sparse `toMatchInlineSnapshot` on small stable mappers (SSE-event→view-model, verdict→badge) — never full-DOM snapshots of shadcn/Radix (flaky). **Agent `ui-reviewer` uses the Microsoft Playwright MCP (`@playwright/mcp`)** for exploratory, *direction-match* review vs the frozen prototype baselines (`sketches/screenshots/`) — **kept OUT of the merge gate** (context-staleness flakiness + ~4× token cost). Scripted Playwright = the deterministic gate; the MCP = the judgment. Owned: **S2** sets up the scripted snapshot harness + the chart-data test hook + the `.mcp.json` wiring; **S6** runs it headless in pinned-Docker CI. Tooling: Playwright built-in is sufficient (committed PNG baselines); **Argos** (OSS, 5k shots/mo free) noted as the escape hatch if baselines get unwieldy — not adopted. | Canvas pixel-snapshots are the worst case for flake without a paid GPU runner; the replay harness makes data-assertion strictly better than pixel-assertion for the chart. The MCP is intent-driven (great for exploration + accessibility-tree review, wrong for deterministic gates), so the gate stays scripted. Community-researched (Playwright docs, practitioner reports, microsoft/playwright-mcp). Cross-refs: `docs/epics/E10-spa.md`, the `ui-reviewer` agent, and the `capture` skill. |
| D25 | E10 operator-action enablement: server-derived `enabled_actions` (9 Jun 2026, resolves the D23 S2/S3 open question) | **Resolves the open question on how the operator action bar knows which actions are valid without hardcoding the command×phase matrix client-side (the invariant): option (a) — the server exposes `enabled_actions: list[OperatorAction]` on the run snapshot (`RoastDetail`) and enriches the live `phase_changed` SSE frame, derived READ-ONLY from the existing `COMMAND_PHASE_MATRIX` + controller; the SPA's action bar mirrors it.** Shipped as a **separate small E7-contract PR** (models.py field + safety.py `enabled_operator_actions()` + `OPERATOR_ACTION_COMMAND` single-sourced from api.py's private map + store.py snapshot population + api.py `EventBroadcaster.emit` enrichment), routed through **`safety-reviewer`**; it **merges before S3 builds the action bar** (S2 ships the SPA types forward-compatible with `enabled_actions?` optional). **`enabled_actions` is a PURE PERMISSION MIRROR** — exactly what the controller would accept, no more, no less — **NOT a "what to render" list**: `pause_advisory`/`resume_advisory` are ungated by the controller so they appear in **every** phase (no invented restriction); `acknowledge_recovery` appears only in `operator_recovery_required` (controller-enforced); `emergency_stop` everywhere; the matrix-mapped actions by the matrix. The page (S3) owns the *presentation* call of hiding permitted-but-meaningless actions on terminal roasts. **No new safety logic** — it is a read-only projection of data the matrix/controller already encode, pinned by a **biconditional consistency test** (`controller_accepts(action, phase)` IFF `action ∈ enabled_operator_actions(phase)`, over all 6 actions × all phases, driving the real controller) so the UI-enablement can never drift from controller enforcement. | Option (a) is the literal expression of the "action bar mirrors server state" invariant; (b) (optimistic enable + typed reject) tempts a hidden client-side matrix to avoid flicker. Choosing the *pure mirror* (not "every non-terminal phase") is what makes the consistency test a clean exception-free biconditional — the honest anti-drift pin — rather than one needing carve-outs for the ungated control actions. Enablement is never enforcement: the controller still re-validates every action on drain. Surfaced + sharpened during the E10 agent-team run (the platform teammate's reading of the real controller showed the original `ACTIVE_ROAST_PHASES` gate for pause/resume would have invented a restriction). Cross-refs: agent-repo `src/roastpilot_agent/{models,safety,store,api}.py`, `docs/epics/E10-spa.md` (S3 + the open-question note), the E7 `enabled_actions` PR (via `safety-reviewer`). |
| D26 | E10 visual testing — **un-mask the uPlot canvas; snapshot it; baselines are CI-Docker-only** (9 Jun 2026, revises D24 track 2 + closes the pending "D24 revision at S6") | **Reverses D24's canvas-masking call.** D24 masked the uPlot curve out of `toHaveScreenshot()` and asserted only its *data*, on the premise that canvas pixels are the worst case for cross-OS flake and that determinism needs a paid GPU runner. Both halves were over-stated: Playwright captures 2D-canvas pixels reliably, **uPlot rasterizes through Skia's CPU path** (not WebGL — no GPU runner in question), and the cross-OS flake lives only across *environments*, which D24's **own** envelope already neutralizes for the DOM chrome (pinned `mcr.microsoft.com/playwright:vX.Y.Z --platform=linux/amd64`, baselines generated **inside** the container, fixed viewport, `fonts.ready`, animations off, small non-zero `maxDiffPixelRatio`). The masking left the **chart — the product's primary visual element — as the one thing never visually regression-tested** (a 0px-collapsed canvas, wrong series color, broken legend, clipped axis all pass a green data-assert). **New rule:** (1) **stop masking** — the canvas is included in the page screenshots; (2) **baselines are a CI-only artifact** — generated and diffed **only** inside the pinned amd64 Docker image, **never** on a dev machine (this is also the fix for the slow-macOS / `npm ci`-clobbers-`node_modules` pain that put D24 up for revision); (3) **canvas determinism kit:** `deviceScaleFactor: 1` (uPlot scales its backing store by DPR), wait on the existing `window.__chart` point-count hook before shooting (no async-data race), `fonts.ready` + bundled webfont for axis text, replay-fixed data, residual jitter absorbed by the kept `maxDiffPixelRatio ≈ 0.01`; (4) **the chart-data assertion STAYS as a complementary layer, not a replacement** — data-assert green + pixel-diff red ⇒ a *render/CSS* regression not a data bug; the data-assert remains the authoritative correctness oracle and the snapshot is a visual-smoke layer over it. Owned: **S6** un-masks the **existing** shipped snapshots (`dashboard-live` + foundation/history/detail states) and regenerates their baselines in Docker, **and** adds the **new** multi-fixture states (`dashboard-fault`/`dashboard-recovery`/detail) with the canvas un-masked from the start. | Masking made the safety-net the product can least afford to skip. The original flake fear was real but already mitigated by D24's pinning envelope — extending it to a 2D canvas costs nothing and recovers the highest-value visual coverage on the board. Keeping the data-assert turns the pair into a diagnostic (which layer is red localizes the bug) rather than redundant. The CI-only-baselines rule resolves the macOS-Docker friction that triggered the revision (memory `visual-test-docker-revisit-s6`). Surfaced by the operator: "Playwright works with canvas — get the graph into screenshots." Cross-refs: `docs/epics/E10-spa.md` (S6 + the D24 section), the `ui-reviewer` agent note, the `capture` skill, memory `visual-test-docker-revisit-s6` + `playwright-docker-clobbers-node-modules`. **S6-impl addendum (11 Jun 2026):** the bundled axis webfont in kit element (3) is **optional, not required** — baselines are generated AND diffed only inside the one pinned amd64 image (Docker-vs-Docker), so the system font stack renders identically; a webfont only matters *cross-environment*, which the CI-only-baselines rule already eliminates. S6 shipped without it (roster-confirmed on PR #125). The other kit elements (`deviceScaleFactor:1`, the `window.__chart` point-count gate, animations off, `maxDiffPixelRatio≈0.01`) are load-bearing and shipped. Also surfaced during S6: un-masking a *developed* curve immediately caught replay bug **#128** (stepped `--step` `elapsed_seconds` is wall-clock, collapsing the curve x-axis) — the `dashboard-developed` state is a fast-follow pending that fix; the un-masked `roast-detail` spread curve guards curve rendering meanwhile. |
| D27 | Pi appliance distribution: **native-only** (PyPI wheel + pipx + systemd), **bundled model**, **torch-free** FC path (11 Jun 2026, E11 packaging) | **The RoastPilot appliance is a headless Raspberry Pi 5 plugged into the Hottop (USB serial) + a USB mic, distributed NATIVELY — no Docker image.** A `roastpilot-agent[pi]` PyPI wheel (bundles `web/dist` per D1; declares `coffee-roaster-mcp` + the Pi extras) installed via **pipx**, plus a **one-line installer** that does the un-fun parts once: `apt install libportaudio2`, places the **bundled/pinned FC model** locally (offline-capable — a roast never waits on a live HF pull), adds the operator to `dialout`+`audio`, writes **one systemd unit** (agent spawns the MCP stdio child, per D6; restart → recovery, never auto-resumes heat/fan), and enables **mDNS** so headless use is *power on → autostart → open `http://roastpilot.local:<port>`* from any device on the LAN. **The FC inference path is TORCH-FREE:** the mel filterbank moves from transformers' `ASTFeatureExtractor` to **librosa** (already in `requirements-pi.txt`), dropping **torch + transformers** from the Pi dependency set so the install is plain PyPI wheels (no separate pytorch-CPU index step). This is a **cross-repo change** sequenced in `torch-free-pi-appliance.md` (model pipeline → MCP → agent+UI), **gated on accuracy**: the librosa mel must match the AST mel closely enough to hold ≥ the recorded **96.86 % acc / 96.9 % precision** on the FC repo's v2 191-sample test set before the swap lands. The advisor still needs OpenRouter network at roast time (an offline/local advisor is a separate, out-of-scope concern). | **Native beats Docker because the make-or-break is hardware access, not dependency reproducibility.** FC detection lives or dies on reliable USB-mic capture, and **ALSA-mic passthrough into a container on a Pi is the single most fragile, non-expert-hostile part of the stack** (it can re-break on any Pi-OS audio-stack change); native gives the mic + serial direct, boring access (`dialout`/`audio` groups). The native downside — ARM dependency setup — is *bounded and one-time*, and the **torch-free path removes the only hard dep** (the pytorch-CPU wheel/index), leaving normal PyPI wheels; librosa being already present shows the swap was intended. **Bundled model** makes the appliance offline-roast-capable. Operator-chosen 11 Jun 2026 (native-only + bundle/cache). Hardware prereqs (document in the deploy doc): **Pi 5 + official 27 W PSU + active cooler** — the ONNX INT8 model (89.9 MB) runs 2-thread ~2.45 s/window deliberately "leaving cores for MCP + UI", and sustained inference needs the cooler. Cross-refs: `torch-free-pi-appliance.md` (the 3-repo rollout), agent-repo `docs/epics/E11-packaging.md`, `coffee-first-crack-detection` (`requirements-pi.txt`, the edge post metrics), `coffee-roaster-mcp`, D6 (one systemd unit), D1 (SPA ships in the wheel). |
| D28 | E11 start gated on the operator's manual test tasks — #134 (supervised hardware roast) + #135 (real-device SSE) — before E11 implementation begins (13 Jun 2026, E11 prerequisite; recorded after a cross-session fidelity loss) | **E11 (Pi packaging — #136/#137/#138) implementation must NOT begin until BOTH operator-owned (@syamaner) manual test tasks are Done: #134 (E12-S1 — supervised hardware roast *through the agent harness*, D17 criterion 3) and #135 (E10-S6 manual — Safari / iPadOS SSE keep-alive + reconnect on real devices).** This is a **separate gate** from the torch-free chain (D27: Phase 1 #54 librosa accuracy gate → Phase 2 #157 torch-free MCP), which must *also* be green before E11 can pin its `[pi]` extra / bundle the model. Allowance: the **contract-buildable** E11 scaffolding (hatchling build-hook for `web/dist`, base-wheel + installer skeleton, systemd unit, deploy doc) MAY be pre-staged **only on explicit operator opt-in**; the `[pi]` version-pin, bundled-model, and arm64 smoke wait on both gates. | **Validate the harness on real hardware + real devices before investing in packaging/distributing it** — don't build a Pi appliance around a harness not yet proven end-to-end by a supervised roast and real-device SSE. **Recorded as a decision because the original agreement was verbal (prior session) and written into NO durable artifact** (memory / registry Active Context / E11 epic / a GitHub "blocks" dependency), so it evaporated at the session boundary — a fresh session, orienting from registry→epic→board, reconstructed only D27's torch-free gate and surfaced #134/#135 as a *question* instead of knowing them as the agreed gate. A first-person instance of the project's own "handoff hygiene / decisions-as-durable-D-numbers = the only cross-session shared memory" thesis. Cross-refs: agent-repo `docs/state/registry.md` (Active Context), `docs/epics/E11-packaging.md` (prerequisite), GitHub #136/#137/#138 blocked-by #134/#135, `torch-free-pi-appliance.md` (the other gate), D17 (criterion 3), memory `e11-blocked-on-operator-manual-tests`. |
| D29 | Saved / selectable roast-profile library deferred to **roastpilot-cloud** (feedback-learning) — out of M1/M2 on-appliance scope (13 Jun 2026, reviewing the new Start Roast button) | **M1 keeps `RoastProfile` inline-per-roast (D7): the operator types the profile into the Start Roast form — or `POST /api/roasts` — at each roast. There is NO saved-profile library, NO profile dropdown, NO clone-from-history, and NO post-start profile edit** (the active run's profile is frozen into `roast_runs.profile_json` at start; completed runs are immutable). Profile *selection / reuse / rating-matched recommendation* is **deferred to roastpilot-cloud**, where feedback-learning lives — matching profiles to roast outcomes + operator ratings is a cloud concern, and **the cloud rollout is not yet fully planned**. | Keeps the appliance UX minimal (the "automated roaster — important *overrides* only" operating principle): a profile CRUD/library on the device is scope the cloud will own better, *with* the rating signal that makes selection meaningful. The agent/appliance stays the deterministic roast executor; the cloud becomes the profile/feedback brain. Operator decision 13 Jun 2026. Cross-refs: D7 (minimal static profiles), agent-repo `RoastProfile` + the Start Roast form (#158/#160), memory `automated-roaster-minimal-ux`. **Revisit when roastpilot-cloud is planned.** |
| D30 | Advisor sustainedly unavailable → **fail closed after N consecutive failures** (13 Jun 2026, agent #166; operator decision during/after the #134 roast) | **When the advisor is sustainedly unavailable — `N` consecutive *availability* failures (`provider_error`/`timeout`) — the controller drives heat→0 and enters `operator_recovery_required`; the operator must then explicitly resume / drop / cool.** A single transient failure still just **holds current targets** (the existing E3-S3 hold-current fallback, unchanged). `N` is configurable (propose default **3** ≈ a few seconds of sustained outage). The hard safety ceilings (`max_bean_temp_c` 230 / `max_env_temp_c` 240 / `pre_t0_max_bean_temp_c` 200) and Emergency Stop stay active throughout regardless. | **Rationale:** in the #134 roast the advisor ran on an expired key → `provider_error` *every tick*; the deterministic fallback held heat at the profile's 100 % with **no operator-facing escalation and no manual heat dial** (minimal-UX, D-`automated-roaster`), forcing the operator to babysit and ultimately e-stop. A *sustained* outage should fail closed, not silently run the static profile up to the safety ceiling. The operator chose fail-closed-after-N over **immediate-stop** (too hair-trigger — occasional blips are expected on an electric roaster) and over **hold-with-alarm** (the operator wants the roast to stop, not to hand-roast through an outage). Reuses the existing recovery machinery — **restart/STOP → `operator_recovery_required`, never auto-resume heat/fan** (architecture invariant, preserved). **Open implementation questions routed to safety-reviewer (#166):** (1) which statuses count toward `N` — recommend the *availability* failures (`provider_error`/`timeout`); `malformed`/`unsafe` are provider-reachable, a separate class; (2) which of the six `SafetyVerdict`s carries the heat-0 escalation; (3) arm only post-T0 (a pre-charge outage is less urgent)?; (4) a paused advisor isn't called, so its (absent) calls must not accrue toward `N`. This is a **safety/controller change** — implementation goes through safety-reviewer before merge. Cross-refs: agent-repo #166, `safety.py`/`controller.py`, the `_consecutive_read_failures` counter (mirror it for advisor failures), D17 (criterion 3 — the supervised roast that surfaced this), the architecture invariant "restart never auto-resumes heat/fan". **Implementation note (#185 safety-reviewer PASS, 13 Jun):** "N *consecutive* availability failures" = N `provider_error`/`timeout` with **no intervening successful (`ok`) decision**; a *reachable-but-bad* (`malformed`/`unsafe`) outcome is **transparent** — it neither increments nor resets the streak. This is the fail-safe reading (the stop fires *more* readily, never leaves the heater on longer) and matches the operator intent: a flapping provider that only returns bad payloads should still trip the stop, not sit in hold-current forever. A healthy advisor resets on every `ok`. Escalation verdict is **RECOVERY** (heat→0 + overrun-safe fan → `operator_recovery_required`), not FAULT/EMERGENCY_STOP. |
| D31 | RoastProfile richer **bean identity** — extends D7 (13 Jun 2026, agent #164/#188) | **`RoastProfile` gains `country`, `farm`, `description`, `bean_species`, `is_blend`** — keeping `bean_origin` + `bean_varietal` (cultivar). **All new fields optional/defaulted** so a frozen pre-#164 `roast_runs.profile_json` still deserializes (completed-run immutability preserved; back-compat test pins it). **`bean_species` is a constrained `Literal["arabica","robusta","liberica","excelsa"]`, deliberately NOT a new `models.py` Enum** — a Literal keeps the change lead-verifiable instead of triggering the rubric's models.py-enum → safety-reviewer escalation, while still rejecting unknown values. **Blend model:** `is_blend` flag; the primary bean carries the structured fields (country/farm/species); secondary beans go in `description` (no structured component list — out of scope, deferred). Surfaced in the Start Roast form, roast detail, and history. | Extends D7's minimal static profile with the bean provenance an operator actually records. **Cloud-transfer intent (alongside D29):** structured `country`/`bean_species` is exactly the signal **roastpilot-cloud**'s feedback-learning will key profiles + ratings on, so it's modeled **structured (not free-text)** to transfer cleanly — but profile *selection / library* stays D29-deferred; D31 only enriches the per-roast inline fields. Operator request 13 Jun during the #134 roast prep. Cross-refs: D7 (minimal profile), D29 (cloud profile brain), agent `models.RoastProfile`, #164/#188. |

## 2. Verified MCP Contract (ground truth, coffee-roaster-mcp v0.1.3)

Extracted from source 6 June 2026. The typed client (`mcp_client.py`) wraps exactly this surface.

**13 tools** (`mcp_server.py:493-779`): `get_server_info`, `get_runtime_config`,
`start_roast_session`, `get_roast_state(session_id?)`, `set_heat(heat_level_percent)`,
`set_fan(fan_level_percent)`, `mark_beans_added`, `mark_first_crack`, `drop_beans`,
`start_cooling`, `stop_cooling`, `export_roast_log(session_id?)`,
`emergency_stop(reason?)`.

**Key facts the agent design relies on:**

- `get_roast_state` returns `RoastSessionState` (`mcp_server.py:328-363`) with:
  MCP phase, heat/fan %, cooling flag, all lifecycle timestamps (UTC + monotonic
  pairs), **derived metrics already computed** (`bean_ror_c_per_min`,
  `env_ror_c_per_min`, `bean_temp_delta_60s_c`, `development_time_seconds`,
  `development_percent`), nested `device_state` (live `bean_temp_c`,
  `env_temp_c`, `connected`), `t0_status`, `first_crack_status`, and the event
  timeline. **All temperatures Celsius.**
- **MCP has its own phase machine** (`session.py:19-27`): `pre_roast → roasting
  → development → dropped → cooling → complete`, plus `fault`. Events are
  **latched singletons** (except `fault`): `beans_added`,
  `first_crack_detected`, `beans_dropped`, `cooling_started`, `cooling_stopped`.
- **Auto-T0** (`T0Status`, `mcp_server.py:304-324`): detects charge by bean-temp
  drop from preheat max (default threshold 25 °C, ≥2 preheat samples). Detected
  T0 event payload includes `source: "auto_t0"`, charge temp, drop, threshold.
- **FC status** (`FirstCrackStatus`, `mcp_server.py:270-298`): `mode`
  (disabled/audio/manual), `status` (pending/detected/manual/faulted/…),
  detection timestamps, `allow_manual_override`, plus audio pipeline counters
  (queued/emitted/dropped/processed windows) — surface these counters in the
  dashboard's diagnostics drawer.
- **Export** (`exports.py`): `roast.jsonl`, `roast.csv` (20 columns incl. RoR,
  dev %, FC model metadata), `summary.json`. `ExportRoastLogResult` returns all
  paths + `ready` flag.
- **Simulation paths that already exist**: default driver is `mock`
  (`config.py:31-38`); audio can run from WAV (`COFFEE_AUDIO_SOURCE=wav`,
  `COFFEE_AUDIO_REPLAY_MODE=realtime|detector_paced`). ⇒ **Full-loop demo and
  CI runs need no hardware**: mock driver + recorded roast WAV exercises the
  real FC detector end to end.

**Implication adopted**: because MCP T0/FC are latched singleton events, the
agent's 3-tick T0 debounce primarily guards read errors/staleness rather than
sensor flapping (MCP latches detection internally). Keep the debounce — it is
cheap and defends against transient `get_roast_state` failures — but tests
should reflect that flapping originates from read faults, not MCP state.

## 3. Phase Mapping (agent ↔ MCP)

Agent phases are the operator-facing truth; MCP phases are inputs.

| Agent phase | MCP phase observed | Entry trigger | Exit trigger |
|---|---|---|---|
| `idle` | no session | — | operator starts roast |
| `starting` | no session → `pre_roast` | `POST /api/roasts` | `start_roast_session` OK |
| `preheating` | `pre_roast` | session started | `t0_status.status == "detected"` (or recovery-only operator `mark_beans_added`) held for `t0_debounce_ticks` |
| `roasting_pre_first_crack` | `roasting` | T0 confirmed | `first_crack_status.status == "detected"` or operator `mark_first_crack` |
| `development` | `development` | FC confirmed | validated drop decision or operator drop → `drop_beans` |
| `cooling` | `dropped`/`cooling` | `drop_beans` executed | cooling stopped (operator or policy) |
| `complete` | `complete` | `stop_cooling` + `export_roast_log` ready | — |
| `faulted` | any (often `fault`) | safety verdict FAULT/E-STOP, MCP fault, unrecoverable error | operator acknowledgement |
| `operator_recovery_required` | any | restart with possibly-active run; ambiguous MCP state; configured overrun severity | explicit operator action |

E4-S1 refinements (7 Jun 2026, agreed at implementation): `complete → idle`
is a legal controller reset edge (a long-running service needs to return to
idle for the next run; the table above leaves `complete` exit-less);
`operator_recovery_required` exits are {preheating, roasting_pre_first_crack,
development, cooling, complete, idle} plus the universal `faulted` —
operator resume/cool/end only, and **`starting` is never a recovery target**
(the start handshake must not re-run against a possibly-active roaster).
E4-S4 addition: `roasting_pre_first_crack → cooling` is legal — the D16
command×phase matrix deliberately allows an operator early-abort
`drop_beans` during roasting, so the table must support the resulting
state (found by safety review: the prior table made the abort drop fire
hardware and then fail the phase transition).

Verification story (M1): confirm on mock + hardware whether `drop_beans`
engages cooling on the Hottop (orchestration plan treats `drop_beans` as
drop+cooling; MCP records `cooling_started` as a separate event). The
controller's cooling entry handles both: if `cooling_on` is not observed within
a configured window after drop, controller issues `start_cooling` and logs it.

## 4. Module Design

Per orchestration plan § Implementation Modules, with refinements:

```text
src/roastpilot_agent/
├── controller.py     # transition table, tick() loop, T0 debounce; re-exports
│                     #   RoastPhase from models.py (its home per D15)
├── mcp_client.py     # Typed wrapper over the 13 tools; owns the MCP child process
│                     #   (spawn, health, restart→recovery); Pydantic mirrors of
│                     #   RoastSessionState / T0Status / FirstCrackStatus
├── advisor.py        # RoastAdvisor ABC, AdvisorContext, RoastDecision,
│                     #   PydanticAIAdvisor (OpenRouter), FakeAdvisor (tests/demo)
├── safety.py         # SafetyVerdict enum, SafetyEvaluation, rule set, rate limits
├── store.py          # aiosqlite store, schema v1, recovery reads
├── api.py            # FastAPI: REST + SSE + static web/ mount; replay mode
├── replay.py         # ReplaySource: streams recorded exports through the real
│                     #   SSE pipeline at 1×–60× (dev/demo/UI prototyping)
├── models.py         # Shared Pydantic models & enums (RoastPhase per D15,
│                     #   RoastProfile); plain Enum, never StrEnum (D15)
└── config.py         # ControllerConfig, AdvisorConfig, SafetyLimits, AppConfig
web/                  # Vite + React + TS SPA (built into the wheel)
```

Advisor specifics (D5):
- `AdvisorConfig`: `provider_base_url` (default OpenRouter), `api_key_env`,
  `model_slug`, `timeout_seconds=10.0`, `temperature`, `prompt_version`.
- `AdvisorContext` built from `RoastSessionState` + profile + recent decisions
  (+ `reference_roasts: list[RoastReference] = []`, empty until M2).
- Failure handling unchanged from orchestration plan: timeout/malformed/unsafe
  ⇒ rejected recommendation ⇒ deterministic fallback (hold current targets);
  every outcome persisted.

## 5. SQLite Schema v1

WAL + `synchronous=FULL` (orchestration plan defaults). Commit per tick during
active roasts; telemetry rows every `telemetry_log_interval_seconds` (5 s).

```sql
CREATE TABLE roast_runs (
  id TEXT PRIMARY KEY,                      -- uuid4
  mcp_session_id TEXT,
  agent_phase TEXT NOT NULL,                -- last persisted agent phase
  profile_json TEXT NOT NULL,               -- frozen RoastProfile
  config_json TEXT NOT NULL,                -- frozen ControllerConfig + SafetyLimits
  started_at_utc TEXT NOT NULL,
  completed_at_utc TEXT,
  outcome TEXT,                             -- completed | aborted | faulted
  fault_reason TEXT,
  log_dir TEXT,                             -- from ExportRoastLogResult
  export_manifest_json TEXT,                -- jsonl/csv/summary paths + ready
  operator_rating INTEGER CHECK (operator_rating BETWEEN 1 AND 5),
  operator_notes TEXT,
  cloud_sync_status TEXT NOT NULL DEFAULT 'local_only',
                                            -- local_only|pending_sync|synced|sync_failed
  cloud_roast_id TEXT,
  public_slug TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE roast_events (                 -- agent-level event log (superset of MCP events)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  kind TEXT NOT NULL,                       -- run_started|phase_changed|charge_guidance|
                                            -- t0_detected|first_crack|advisory|command_*|
                                            -- safety_*|fault|recovery_*|logs_exported|run_completed
  source TEXT NOT NULL,                     -- controller|mcp|operator|advisor|safety
  monotonic_seconds REAL,
  recorded_at_utc TEXT NOT NULL,
  payload_json TEXT
);

CREATE TABLE telemetry_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  recorded_at_utc TEXT NOT NULL,
  elapsed_seconds REAL,
  agent_phase TEXT NOT NULL,
  mcp_phase TEXT,
  bean_temp_c REAL, env_temp_c REAL,
  bean_ror_c_per_min REAL, env_ror_c_per_min REAL,
  heat_level_percent INTEGER, fan_level_percent INTEGER,
  cooling_on INTEGER,
  development_percent REAL,
  raw_state_json TEXT                       -- full RoastSessionState dump
);

CREATE TABLE safety_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  rule TEXT NOT NULL,                       -- which rule fired / 'all_clear'
  verdict TEXT NOT NULL,                    -- allow|clamp|reject|recovery|fault|emergency_stop
  input_heat INTEGER, input_fan INTEGER,
  adjusted_heat INTEGER, adjusted_fan INTEGER,
  reason TEXT NOT NULL,
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE advisor_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  provider TEXT NOT NULL, model TEXT NOT NULL, prompt_version TEXT NOT NULL,
  context_hash TEXT NOT NULL,               -- hash, not raw payload (plan policy)
  latency_ms INTEGER,
  decision_json TEXT,                       -- RoastDecision or NULL on failure
  status TEXT NOT NULL,                     -- ok|timeout|malformed|provider_error
  safety_evaluation_id INTEGER REFERENCES safety_evaluations(id),
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE command_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  tool TEXT NOT NULL,                       -- MCP tool name
  args_json TEXT,
  source TEXT NOT NULL,                     -- policy|advisor|operator|safety|recovery
  safety_evaluation_id INTEGER REFERENCES safety_evaluations(id),
  status TEXT NOT NULL,                     -- ok|failed
  result_json TEXT,
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE operator_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT REFERENCES roast_runs(id),
  action TEXT NOT NULL,
  payload_json TEXT,
  result TEXT NOT NULL,                     -- accepted|rejected|failed
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE sync_jobs (                    -- M2; table ships in v1 schema
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,                     -- pending|in_flight|done|failed
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE reference_roasts (             -- M2 cache; table ships in v1 schema
  id TEXT PRIMARY KEY,                      -- cloud summary id
  bean_origin TEXT NOT NULL,
  roast_level TEXT NOT NULL,
  summary_json TEXT NOT NULL,               -- RoastReference payload
  fetched_at_utc TEXT NOT NULL
);
```

Indexes: `(run_id, tick)` on telemetry/safety/advisor/command tables;
`(run_id, kind)` on roast_events; `cloud_sync_status` on roast_runs.

## 6. API Contract (REST + SSE)

REST (JSON; Pydantic response models in `models.py`):

| Method & path | Purpose |
|---|---|
| `GET /api/health` | liveness + MCP child status + active run id |
| `POST /api/roasts` | start roast; body = `RoastProfile` (inline, D7); 409 if run active |
| `GET /api/roasts` | history list (id, started, outcome, bean, rating, dev %) |
| `GET /api/roasts/{id}` | run detail: profile, phase, outcome, export manifest |
| `GET /api/roasts/{id}/telemetry` | persisted snapshots (downsample query param) |
| `GET /api/roasts/{id}/timeline` | roast_events + safety + advisor + command trail (the decision trace — also the talk demo data) |
| `GET /api/roasts/{id}/log` | export manifest; file download endpoints |
| `POST /api/roasts/{id}/operator-actions` | body `{action, payload?}` — see below |
| `POST /api/roasts/{id}/rating` | operator self-rating `{stars, notes}` |
| `GET /api/roasts/{id}/events` | **SSE** stream |

Operator actions (enum): `mark_beans_added` (recovery-only), `mark_first_crack`,
`pause_advisory`, `resume_advisory`, `drop_beans`, `start_cooling`
(recovery-only), `stop_cooling`, `emergency_stop`, `acknowledge_recovery`.
Every action → `operator_actions` row → controller queue → safety policy → MCP.

SSE event types (`event:` field; `data:` = typed JSON): `run_started`,
`phase_changed`, `telemetry` (every tick), `charge_guidance`, `t0_detected`,
`first_crack`, `advisory` (decision + safety verdict + rationale),
`command_executed`, `command_failed`, `safety_alert`, `fault`,
`recovery_required`, `logs_exported`, `run_completed`, `heartbeat` (15 s).
SPA renders only from these events + snapshots — never infers phase locally.

## 7. Device SPA (`web/`)

Stack: Vite + React + TypeScript, Tailwind + shadcn/ui, **uPlot** for curves,
TanStack Query (REST) + native `EventSource` (SSE). **Playwright is a core E10
capability, not a late test chore** — it backs the `ui-reviewer` visual review,
the component/E2E tests, the screenshot baselines, and the E12 demo
screen-recording rig; set it up early (S1+S2) against the replay harness, reusing
the sketches' `playwright-core` + system-Chrome pattern (`sketches/capture.mjs`).

Pages (D8):
- **`/` Dashboard (live)** — the demo centerpiece:
  - Header: phase badge, elapsed / development time, dev %, profile name, MCP
    connection + FC pipeline status (diagnostics drawer shows audio counters).
  - Live curve (uPlot), **five series**: bean temp, env temp (left axis, °C);
    RoR (right axis, °C/min); **heat % and fan % as step-after lines** on a
    0–100 % scale (Artisan convention — control values are stepwise, drawn
    thinner/dimmer in the gauge colors, amber/teal, so cause-and-effect with
    the temp curves is visible). Event markers (T0, FC, drop), charge guidance
    band (170–200 °C) during preheat.
  - **Legend with live cursor readout**: color-keyed entries for all five
    series showing the value at the hovered time (uPlot's native legend);
    click-to-toggle series visibility for decluttering.
  - Control row: heat % and fan % (current + advisor target), cooling state.
  - **Advisory panel**: latest `RoastDecision` (targets, confidence, rationale)
    with **verdict badge ALLOW / CLAMP / REJECT** and reason; scrollable
    decision history. This panel is the talk's safety-boundary visual.
  - Safety banner (alerts/faults) + recovery modal (`operator_recovery_required`).
  - Operator action bar: Emergency Stop (prominent, confirm-press), Drop,
    Mark First Crack, Pause/Resume advisory, Stop Cooling.
  - Add-beans guidance toast (non-blocking, per plan).
- **`/roasts` History** — table: date, bean, profile, outcome, FC time, dev %,
  rating; links to detail.
- **`/roasts/:id` Detail** — full curve from persisted telemetry (same five
  series + legend + cursor readout as the live chart; scrubbing shows
  temps, RoR, **and heat/fan control values** at that moment, so advisory
  decisions in the trace can be visually correlated with their effect), event
  timeline, decision trace table (advisory → verdict → command), export
  downloads, self-rating widget (writes `operator_rating`).
  - **Trace-row → chart highlight**: clicking a decision-trace row highlights
    that timestamp on the curve (vertical marker + row selection state),
    linking each ALLOW/CLAMP/REJECT to its visible effect on the temp/RoR
    curves and the heat/fan step lines. This makes the recorded demo's
    decision-trace walkthrough self-explanatory.

**M2 additions to the SPA (owner-side cloud UI, per cloud-plan D10 — not M1
scope)**: because the owner never logs into the cloud, these live in the
device SPA and talk to the cloud through the agent:

- **Detail page cloud section**: sync status badge (`local_only /
  pending_sync / synced / sync_failed` with retry button), **Share** (copy
  unlisted link `https://…/r/{slug}`), visibility selector
  (private/unlisted/public), **Regenerate link** (slug revocation, with
  "old links stop working" confirmation), **Delete from cloud**
  (confirmation states what cascades: reviews + artifacts).
- **Cloud reviews in detail view**: taster reviews fetched via agent
  (`GET /api/roasts/{id}/reviews` on the cloud), shown alongside the operator
  self-rating.
- **History list**: small sync-status glyph per row.
- Agent REST additions for these: `POST /api/roasts/{id}/sync` (exists in
  plan), plus proxy endpoints for visibility/slug/delete/reviews — defined at
  M2 alongside cloud C3.

**Replay harness** (`replay.py` + `--replay` CLI flag): streams a recorded
roast export (JSONL/CSV from real past roasts) through the *real* SSE pipeline
at 1×–60×. Uses: UI development without hardware, deterministic UI tests,
and recording the talk's screen-capture. Note this complements, not replaces,
full-loop simulation via MCP mock driver + WAV audio source.

Packaging: `web/dist` built in CI (Node step) and included in the wheel via a
hatchling `force-include`/build hook; `api.py` mounts it as static files. Dev
mode: Vite dev server proxying `/api`.

## 8. Test Plan

Maps orchestration plan § Testing Plan to concrete suites (all M1 tests run
hardware-free):

| Suite | Coverage |
|---|---|
| `test_controller.py` | transition table (valid path, invalid rejections), T0 debounce (incl. read-fault flapping per §2 note), tick scheduler drift/jitter, add-beans guidance emitted once, operator-timeout policy in operator-required states (D16: timeout matters *only* in true operator-required states — manual confirmation, hold, recovery — never in normal phases) |
| `test_safety.py` | max bean/env temp, pre-T0 overrun → heat 0% + recovery/fault by severity, stale/missing telemetry, bounds, rate limits, unsafe drop rejection, e-stop, **invalid phase command attempts** (command×phase validity matrix, D16), **FC/T0 source validity** (accept only MCP detection or explicit operator action, D16) |
| `test_advisor.py` | FakeAdvisor fixtures: valid / malformed / unsafe / timeout / provider error; OpenRouter impl behind a recorded-response test double |
| `test_mcp_client.py` | typed mirrors vs recorded `get_roast_state` payloads from real MCP (contract fixtures), child-process lifecycle, read/write failure paths |
| `test_store.py` | schema migration, per-tick commit rows, restart recovery reads, completed-run immutability |
| `test_api.py` | routes, SSE stream typing, operator action queue, disconnect handling |
| `test_milestone1.py` | the 12-step mock vertical slice end-to-end (fake MCP), then against real MCP server in mock mode (subprocess) |
| `web/` tests | component tests + Playwright against the replay harness |

Contract fixtures: capture real `RoastSessionState` JSON from the actual MCP
server (mock driver) and commit as fixtures — `mcp-contract-checker` sub-agent
re-validates them against the installed `coffee-roaster-mcp` version.

## 9. Epic / Story Breakdown (spec-driven coding-agent workflow)

| Epic | Scope | Depends on |
|---|---|---|
| E1 Scaffold | pyproject (py3.11+), ruff/pyright/pytest gates, CI, README skeleton, **AGENTS.md** (canonical repo rules per D14, templated on coffee-roaster-mcp's) + one-line `CLAUDE.md` (`@AGENTS.md`), `.claude/agents/` sub-agents (§10), `docs/epics/` spec files | — |
| E2 Models & config | enums, RoastProfile, ControllerConfig, AdvisorConfig, SafetyLimits, SafetyVerdict/Evaluation | E1 |
| E3 Safety policy | full rule set + tests, incl. invalid-phase-command and FC/T0 source-validity rules (D16) | E2 |
| E4 Controller | state machine, tick loop, debounce, fake-MCP harness, operator-timeout policy in operator-required states (D16) | E2, E3 |
| E5 MCP client | typed wrapper, subprocess lifecycle, contract fixtures | E2 |
| E6 Store | schema v1, recovery reads, tick commits | E2 |
| E7 API | REST + SSE + operator action queue | E4, E6 |
| E8 Advisor | interface + FakeAdvisor + OpenRouter impl + call-frequency policy | E2 |
| E9 Vertical slice | 12-step mock milestone test; wire E4–E8 together. **The first green run's decision trace is recorded as a demo asset the same day** (it is talk material, not just a test gate) | E4–E8 |
| E10 SPA | scaffold, replay harness, dashboard, detail, history | E7 |
| E11 Packaging | wheel incl. `web/dist`, systemd unit, deployment doc | E9, E10 |
| E12 Validation & demo | supervised Hottop runs; record demo traces (≥1 CLAMP, ≥1 REJECT), MCP interaction trace, full-workflow screen capture. **Capture measured M1 metrics from the decision trace from E9's first run onward**: advisory acceptance rate (ALLOW/CLAMP/REJECT mix), operator interventions per roast, roasts completing without recovery — honest measured numbers for the talk (the banned determinism percentages' replacement) and the baseline M2's feedback loop is judged against | E11 |

E12's outputs are the talk's demo plan artifacts — treat them as deliverables,
not byproducts.

## 10. Sub-Agent Definitions (`.claude/agents/` in the new repo)

- **safety-reviewer** — triggered for PRs touching `safety.py`, `controller.py`,
  `models.py` enums. Checks: every transition has a test; no code path delivers
  advisor output to `mcp_client` without a `SafetyEvaluation`; verdicts remain
  typed (no string comparisons); restart never auto-resumes heat/fan; e-stop
  reachable from every phase. Tools: Read, Grep, Bash (pytest).
- **mcp-contract-checker** — re-derives the tool surface from the installed
  `coffee-roaster-mcp` package and diffs against `mcp_client.py` mirrors +
  committed contract fixtures. Run on dependency bumps.
- **sim-roast-runner** — runs the mock vertical slice and/or replay scenarios,
  summarizes the decision trace (advisory → verdict → command) as markdown;
  used for regression review and generating talk demo traces.
- **ui-reviewer** — Playwright against the replay harness; screenshots each
  page state (preheat, roasting, development w/ CLAMP verdict, recovery modal,
  fault) and reviews against the page inventory in §7.

## 11. Remaining Open Items

1. Exact OpenRouter model slug + structured-output settings —
   **RESOLVED 8 Jun 2026 at E8-S4 (D20):** default `anthropic/claude-opus-4.8`
   via OpenRouter with electric-roaster prompt `v1`, chosen by an
   operator-judged bake-off of 7 candidates against the same grounded
   live-roast context (latency-gated at the 10 s tick budget). Captured in
   agent-repo `docs/advisor-bakeoff-2026-06-08.md`; revisable by config (D18).
2. `drop_beans` cooling behavior on real hardware — **RESOLVED 7 Jun 2026**,
   ahead of the E12 story: coffee-roaster-mcp's E7-S6 live Hottop roast
   (branch `e7-s6-live-roast-validation`, session `c5707681…`, driver
   `hottop_kn8828b_2k_plus`, live audio FC at confidence 0.907) shows
   `beans_dropped` → `cooling_started` 0.37 ms apart with the drop payload
   already reading `cooling_on: true, heat 0, fan 100` — drop+cooling is
   atomic. The agent controller keeps its post-drop `start_cooling`
   fallback as defense-in-depth, but the primary path is confirmed.
3. Hatchling build-hook details for `web/dist` — resolve at E11 (fallback:
   commit built dist for the first release).
4. SSE keep-alive/reconnect behavior on Safari/iOS (operator may use an iPad) —
   **RESOLVED 13 Jun 2026 (#135):** validated on iPad + iPhone Safari (latest
   iPadOS/iOS) against the live replay — connects/streams, heartbeat holds idle,
   background/lock/wifi-blip reconnects and re-hydrates (incl. the #154 curve
   backfill), and the safety invariant held (a UI disconnect produced GET-only
   reads, no roaster action). The two-task E11 gate (D28) now has only #134 left.
