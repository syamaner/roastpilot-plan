# roastpilot-plan

Program repository for **RoastPilot** — agreed plans, decision records,
cross-repo epics, and UI prototypes for the deterministic coffee-roasting
agent rebuild.

## Layout

| Path | What |
|---|---|
| `agreed-plan/00-repository-structure.md` | Repository structure decision record (D1–D4) |
| `agreed-plan/roastpilot-agent/` | Agent harness component plan (M1), UI prompt pack, Figma Make prototypes + frozen screenshots |
| `agreed-plan/roastpilot-cloud/` | Cloud data plane component plan (M2 / Loop A) |
| `agreed-plan/coffee-roaster-mcp/` | Small Loop A contract change spec |
| `agreed-plan/coffee-first-crack-detection/` | No-change note + Loop B backlog appendix |
| `roastpilot-agent-orchestration-plan.md` | Authoritative architecture plan (controller, safety, advisor) |
| `AGENT_HARNESS_ANALYSIS.md`, `USER_FEEDBACK_LEARNING.md`, … | Supporting analyses and draft-era documents (superseded where agreed-plan says so) |

## Related repositories

- [`coffee-roaster-mcp`](https://github.com/syamaner/coffee-roaster-mcp) — hardware/session MCP boundary (exists, PyPI + MCP Registry)
- [`roastpilot-agent`](https://github.com/syamaner/roastpilot-agent) — deterministic agent harness + device SPA (M1)
- [`roastpilot-cloud`](https://github.com/syamaner/roastpilot-cloud) — roast sharing, tasting feedback, reference summaries (M2)
- [`coffee-first-crack-detection`](https://github.com/syamaner/coffee-first-crack-detection) — ML pipeline (exists, Hugging Face)

Cross-repo epics (LA-1 sync & sharing, LA-2 reference feedback loop) are
tracked here; single-repo epics live in their home repositories.
