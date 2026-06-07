# roastpilot-plan

Program repository for **RoastPilot** — agreed plans, decision records,
cross-repo epics, and UI prototypes for the deterministic coffee-roasting
agent rebuild.

## Layout

| Path | What |
|---|---|
| [`00-repository-structure.md`](00-repository-structure.md) | Repository structure decision record (D1–D4), milestones, verified ground truth |
| [`roastpilot-agent-orchestration-plan.md`](roastpilot-agent-orchestration-plan.md) | Authoritative architecture plan: controller, state machine, safety policy, advisor (its repo-structure section is superseded — banner inside) |
| [`roastpilot-agent/`](roastpilot-agent/) | Agent harness component plan (M1, D5–D9, epics E1–E12), UI prompt pack, Figma Make prototypes + frozen screenshots |
| [`roastpilot-cloud/`](roastpilot-cloud/) | Cloud data plane component plan (M2 / Loop A, D10–D13, epics C1–C7) |
| [`coffee-roaster-mcp/`](coffee-roaster-mcp/) | Small Loop A contract change spec (FC override source marker) |
| [`coffee-first-crack-detection/`](coffee-first-crack-detection/) | No-change note + Loop B backlog appendix |
| [`archive/`](archive/) | Superseded draft-era documents (kept for history; see its README) |

## Related repositories

- [`coffee-roaster-mcp`](https://github.com/syamaner/coffee-roaster-mcp) — hardware/session MCP boundary (exists, PyPI + MCP Registry)
- [`roastpilot-agent`](https://github.com/syamaner/roastpilot-agent) — deterministic agent harness + device SPA (M1)
- [`roastpilot-cloud`](https://github.com/syamaner/roastpilot-cloud) — roast sharing, tasting feedback, reference summaries (M2)
- [`coffee-first-crack-detection`](https://github.com/syamaner/coffee-first-crack-detection) — ML pipeline (exists, Hugging Face)

## Epic management

Single-repo epics (E1–E12, C1–C7) live as spec files + issues in their home
repositories. The two cross-repo epics — **LA-1** (roast sync & sharing) and
**LA-2** (reference feedback loop) — are tracked here: spec files in this
repo, epic tracking issues with cross-repo task lists, and one user-level
GitHub Project ("RoastPilot") as the cross-repo view.
