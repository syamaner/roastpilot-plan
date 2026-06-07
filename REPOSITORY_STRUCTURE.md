# RoastPilot Repository Structure

## Overview

RoastPilot is split into **device-local** and **cloud** components with clear ownership boundaries. This document defines the repository organization and deployment model.

---

## Current Repository Landscape

### Existing Repositories (Active)

```
coffee-roaster-mcp/              # Device-local: MCP server (hardware boundary)
coffee-first-crack-detection/    # Shared: ML model training & artifacts
coffee-roaster-agent-v2/         # Device-local: Agent orchestration (this plan)
```

### Legacy Repositories (Reference)

```
coffee-roasting/                 # Legacy: n8n-based prototype (reference only)
```

---

## Proposed Repository Structure

### Strategy: **Monorepo per Deployment Unit**

**Principle**: Group code by **deployment boundary**, not by language or layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │   Device (Local)     │   Raspberry Pi / Mac / Linux          │
│  ├──────────────────────┤                                       │
│  │  coffee-roaster-mcp  │   USB → Hottop, Audio → FC model     │
│  │  coffee-roaster-     │   State machine, safety, advisor      │
│  │    agent-v2          │   Local SQLite, SSE API               │
│  └──────────────────────┘                                       │
│            ▲                                                     │
│            │ HTTP/WebSocket                                     │
│            ▼                                                     │
│  ┌──────────────────────┐                                       │
│  │    Browser (Local)   │   Same device or LAN                  │
│  ├──────────────────────┤                                       │
│  │  roastpilot-web      │   React/Svelte SPA                    │
│  └──────────────────────┘                                       │
│            │                                                     │
│            │ HTTPS (optional, best-effort)                      │
│            ▼                                                     │
│  ┌──────────────────────┐                                       │
│  │    Cloud (Optional)  │   Vercel / Railway / Supabase         │
│  ├──────────────────────┤                                       │
│  │  roastpilot-cloud    │   Roast logs, tasting reviews,        │
│  │                      │   reference summaries, annotation     │
│  └──────────────────────┘                                       │
│            │                                                     │
│            │ Model updates                                      │
│            ▼                                                     │
│  ┌──────────────────────┐                                       │
│  │  ML Training (Batch) │   Hugging Face Hub                    │
│  ├──────────────────────┤                                       │
│  │  coffee-first-crack- │   Training scripts, model artifacts   │
│  │    detection         │   Annotation tools, datasets          │
│  └──────────────────────┘                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Repository Definitions

### 1. `coffee-roaster-mcp` (Device-Local, Existing)

**Ownership**: Hardware boundary layer  
**Language**: Python  
**Deployment**: `pip install` or `uv` on device  
**Repository**: https://github.com/yourusername/coffee-roaster-mcp

**Contents**:
```
coffee-roaster-mcp/
├── src/
│   └── coffee_roaster_mcp/
│       ├── mcp_server.py          # MCP tools (start_roast, set_heat, etc.)
│       ├── session.py             # RoastSession lifecycle
│       ├── drivers.py             # Hottop driver + mock driver
│       ├── first_crack.py         # FC runtime integration
│       ├── exports.py             # Roast log export (JSONL, CSV)
│       └── config.py              # MCP server config
├── tests/                         # MCP server tests
├── docs/                          # Hardware setup, MCP protocol docs
├── pyproject.toml                 # Python package definition
└── README.md
```

**Responsibilities**:
- ✅ USB serial communication with Hottop roaster
- ✅ Audio capture and first-crack detection runtime
- ✅ Session lifecycle (start, T0, FC, drop, cooling, complete)
- ✅ Telemetry sampling and buffering
- ✅ Event timeline logging
- ✅ Roast log export (JSONL, CSV)
- ✅ MCP server protocol (stdio transport)

**Phase 2 enhancements** (for Loop B):
- Add raw audio ring buffer to pipeline protocol
- Extend `mark_first_crack` with `operator_hint` and `capture_audio`
- Add session fields for FC source tracking

**Deployment**:
```bash
# On device (Raspberry Pi / Mac / Linux)
pip install coffee-roaster-mcp
coffee-roaster-mcp serve
```

---

### 2. `coffee-roaster-agent-v2` (Device-Local, New)

**Ownership**: Orchestration and advisory layer  
**Language**: Python  
**Deployment**: `pip install` or `uv` on device  
**Repository**: https://github.com/yourusername/coffee-roaster-agent-v2 (this repo)

**Contents**:
```
coffee-roaster-agent-v2/
├── src/
│   └── roastpilot_agent/
│       ├── controller.py          # State machine + tick loop
│       ├── mcp_client.py          # Typed MCP wrapper
│       ├── advisor.py             # PydanticAI + LLM interface
│       ├── safety.py              # Hard safety policy
│       ├── store.py               # SQLite persistence
│       ├── api.py                 # FastAPI + SSE
│       ├── cloud_sync.py          # Cloud upload/download (opt-in)
│       ├── models.py              # Pydantic shared types
│       └── config.py              # Agent config
├── tests/                         # Agent tests
├── docs/
│   ├── roastpilot-agent-orchestration-plan.md
│   ├── AGENT_HARNESS_ANALYSIS.md
│   ├── USER_FEEDBACK_LEARNING.md
│   └── REPOSITORY_STRUCTURE.md    # This file
├── pyproject.toml
└── README.md
```

**Responsibilities**:
- ✅ Deterministic state machine (idle → preheating → roasting → development → cooling)
- ✅ Safety policy (hard limits, clamps, rejections, faults)
- ✅ Advisory layer (PydanticAI + LLM, advisory-only)
- ✅ MCP client (typed wrapper for coffee-roaster-mcp tools)
- ✅ Local SQLite persistence (runs, snapshots, events, decisions)
- ✅ FastAPI REST + SSE endpoints for SPA
- ✅ Cloud sync (upload roast logs, download reference roasts, opt-in)
- ✅ Restart recovery (operator_recovery_required state)

**Deployment**:
```bash
# On device (same machine as MCP server)
pip install roastpilot-agent
roastpilot-agent serve --mcp-server coffee-roaster-mcp
```

**Dependencies**:
- `coffee-roaster-mcp` (MCP client connects via stdio)
- `pydantic-ai` (advisory layer)
- `fastapi` + `uvicorn` (API server)
- `aiosqlite` (persistence)
- `httpx` (cloud API client)

---

### 3. `roastpilot-web` (Device-Local or Remote, New)

**Ownership**: User interface  
**Language**: TypeScript (React/Svelte/Vue)  
**Deployment**: Static build served by agent OR hosted separately  
**Repository**: https://github.com/yourusername/roastpilot-web (NEW)

**Contents**:
```
roastpilot-web/
├── src/
│   ├── pages/
│   │   ├── RoastControl.tsx      # Active roast control (heat/fan sliders)
│   │   ├── RoastHistory.tsx      # Past roasts list
│   │   ├── RoastDetail.tsx       # Single roast view (curve, events)
│   │   ├── TastingReview.tsx     # Submit tasting feedback
│   │   └── Settings.tsx          # Privacy, cloud sync, model updates
│   ├── components/
│   │   ├── RoastCurve.tsx        # Real-time curve (bean temp, env temp, RoR)
│   │   ├── EventTimeline.tsx     # Roast events (T0, FC, drop, etc.)
│   │   ├── SafetyAlerts.tsx      # Safety warnings/faults
│   │   └── AdvisoryPanel.tsx     # LLM recommendations + rationale
│   ├── api/
│   │   ├── agent-client.ts       # FastAPI client (REST + SSE)
│   │   └── types.ts              # TypeScript types (from agent API)
│   └── hooks/
│       ├── useRoastState.ts      # SSE subscription
│       └── useRoastControl.ts    # Send commands to agent
├── public/
├── package.json
├── vite.config.ts (or next.config.js)
└── README.md
```

**Responsibilities**:
- ✅ Real-time roast monitoring (SSE from agent API)
- ✅ Manual controls (emergency stop, drop, mark FC, heat/fan overrides)
- ✅ Roast curve visualization (bean temp, env temp, RoR)
- ✅ Tasting review submission
- ✅ Privacy controls (opt-in/opt-out for cloud sync)
- ✅ Settings (advisory provider, model updates)

**Deployment Options**:

**Option A: Bundled with Agent** (Simpler for v1)
```bash
# Agent serves static files at /
roastpilot-agent serve --spa-dir ./roastpilot-web/dist
```

**Option B: Separate Hosting** (Better for remote access)
```bash
# Build static files
cd roastpilot-web
npm run build

# Deploy to Vercel/Netlify/Cloudflare Pages
vercel deploy

# Configure API URL
export VITE_AGENT_API_URL=http://raspberrypi.local:8000
```

**Recommendation**: Start with Option A (bundled), add Option B later for remote access.

---

### 4. `roastpilot-cloud` (Cloud, New)

**Ownership**: Cloud data plane and services  
**Language**: TypeScript (Node.js) or Python  
**Deployment**: Vercel, Railway, Fly.io, or Supabase Edge Functions  
**Repository**: https://github.com/yourusername/roastpilot-cloud (NEW)

**Contents**:
```
roastpilot-cloud/
├── api/
│   ├── roasts/
│   │   ├── upload.ts             # Accept roast log uploads
│   │   ├── query.ts              # Query reference roasts
│   │   └── export.ts             # Download roast logs
│   ├── reviews/
│   │   ├── submit.ts             # Submit tasting review
│   │   └── list.ts               # List reviews for roast
│   ├── audio/
│   │   ├── upload.ts             # Upload FC override audio
│   │   └── annotate.ts           # Annotation interface API
│   └── models/
│       └── latest.ts             # Get latest FC model version
├── jobs/
│   ├── aggregate-references.ts   # Build reference summaries
│   ├── validate-annotations.ts   # Multi-annotator consensus
│   └── notify-model-updates.ts   # Alert on new model versions
├── db/
│   ├── schema.sql                # Postgres schema (or Prisma/Drizzle)
│   └── migrations/               # DB migrations
├── storage/
│   └── audio-samples/            # S3 or R2 bucket config
├── tests/
├── package.json
└── README.md
```

**Responsibilities**:
- ✅ Store roast logs with ratings
- ✅ Store FC override audio samples
- ✅ Aggregate roast data into reference summaries
- ✅ Serve reference roast queries (by bean origin, roast level, rating)
- ✅ Annotation service (for FC audio validation)
- ✅ Model registry (track FC model versions, notify updates)
- ✅ Privacy controls (anonymization, consent management)

**Tech Stack Options**:

**Option A: Supabase** (Simplest)
- Postgres database (managed)
- Storage buckets (S3-compatible)
- Edge Functions (TypeScript)
- Auth (built-in)

**Option B: Vercel + Neon + R2** (More flexible)
- Neon Postgres (serverless)
- Cloudflare R2 (S3-compatible storage)
- Vercel Edge Functions (TypeScript)
- Auth0 or Clerk (auth)

**Option C: Railway + Postgres + S3** (Full control)
- Railway (Docker deployment)
- Self-hosted Postgres
- AWS S3 or MinIO (storage)
- FastAPI or Express (API)

**Recommendation**: Start with Supabase (fastest to MVP), migrate to Option B/C if needed.

**Deployment**:
```bash
# Supabase
supabase link --project-ref YOUR_PROJECT
supabase db push
supabase functions deploy

# Or Vercel
vercel deploy
```

---

### 5. `coffee-first-crack-detection` (Shared, Existing)

**Ownership**: ML model training and artifacts  
**Language**: Python (PyTorch)  
**Deployment**: Hugging Face Hub (model artifacts) + GitHub Actions (CI/CD)  
**Repository**: https://github.com/yourusername/coffee-first-crack-detection

**Contents**:
```
coffee-first-crack-detection/
├── src/
│   ├── training/
│   │   ├── train.py              # Training script
│   │   ├── dataset.py            # Audio dataset loader
│   │   └── augmentation.py       # Audio augmentations
│   ├── evaluation/
│   │   ├── evaluate.py           # Eval on test set
│   │   └── metrics.py            # Precision, recall, timing accuracy
│   ├── export/
│   │   └── onnx.py               # Export to ONNX for inference
│   └── annotation/
│       └── validate.py           # Download + validate cloud samples
├── data/
│   ├── raw/                      # Raw audio clips
│   ├── annotations/              # Ground truth labels
│   └── processed/                # Preprocessed features
├── models/
│   └── checkpoints/              # Training checkpoints
├── notebooks/
│   └── analysis.ipynb            # Data exploration
├── .github/
│   └── workflows/
│       └── train-and-publish.yml # CI/CD: train → evaluate → publish
├── pyproject.toml
└── README.md
```

**Responsibilities**:
- ✅ Train first-crack detection model (PyTorch)
- ✅ Evaluate model on test set
- ✅ Export to ONNX for edge inference
- ✅ Publish to Hugging Face Hub
- ✅ Download validated annotations from cloud
- ✅ Fine-tune on new samples (Loop B)

**Workflow** (Loop B):
```
1. Cloud annotators validate FC overrides
2. GitHub Action: Download validated samples
3. Augment training dataset
4. Fine-tune model
5. Evaluate on test set (require improvement)
6. Export to ONNX
7. Publish to Hugging Face Hub
8. MCP downloads update on next restart
```

**Deployment** (CI/CD):
```yaml
# .github/workflows/train-and-publish.yml
on:
  workflow_dispatch:
    inputs:
      dataset_version:
        description: 'Dataset version to train on'
        required: true

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - name: Download dataset from cloud
      - name: Train model
      - name: Evaluate on test set
      - name: Export to ONNX
      - name: Publish to HuggingFace Hub
```

**Model versioning**:
```
huggingface.co/roastpilot/first-crack-detection
├── v1.0.0 (baseline)
├── v1.1.0 (+100 annotated samples)
├── v1.2.0 (+200 annotated samples)
└── latest (alias to newest)
```

---

## Repository Ownership Matrix

| Repository | Deployment | Language | Owner | Phase |
|------------|-----------|----------|-------|-------|
| **coffee-roaster-mcp** | Device-local | Python | Hardware team | Exists |
| **coffee-roaster-agent-v2** | Device-local | Python | Agent team | Milestone 1 |
| **roastpilot-web** | Device/Cloud | TypeScript | Frontend team | Milestone 1 |
| **roastpilot-cloud** | Cloud | TypeScript/Python | Backend team | Milestone 2 |
| **coffee-first-crack-detection** | Batch/HF Hub | Python | ML team | Exists |

---

## Deployment Topology

### Milestone 1: Local-Only (No Cloud)

```
┌──────────────────────────────────────────┐
│         Device (Raspberry Pi)            │
├──────────────────────────────────────────┤
│  coffee-roaster-mcp (MCP server)         │
│  roastpilot-agent (controller + API)     │
│  roastpilot-web (static SPA)             │
│  SQLite (local persistence)              │
└──────────────────────────────────────────┘
           ▲
           │ HTTP/WebSocket
           ▼
┌──────────────────────────────────────────┐
│       Browser (Same device or LAN)       │
├──────────────────────────────────────────┤
│  http://raspberrypi.local:8000           │
└──────────────────────────────────────────┘
```

**Installation**:
```bash
# On Raspberry Pi
pip install coffee-roaster-mcp
pip install roastpilot-agent

# Start services
coffee-roaster-mcp serve &
roastpilot-agent serve --spa-dir ./web/dist

# Access from browser
open http://raspberrypi.local:8000
```

---

### Milestone 2: Cloud-Enabled (Optional)

```
┌──────────────────────────────────────────┐
│         Device (Raspberry Pi)            │
├──────────────────────────────────────────┤
│  coffee-roaster-mcp (MCP server)         │
│  roastpilot-agent (controller + API)     │
│  SQLite (local persistence)              │
└──────────────────────────────────────────┘
           │
           │ HTTPS (best-effort, async)
           ▼
┌──────────────────────────────────────────┐
│        Cloud (Supabase/Vercel)           │
├──────────────────────────────────────────┤
│  roastpilot-cloud (API + DB)             │
│  Postgres (roast logs, reviews)          │
│  S3/R2 (audio samples)                   │
└──────────────────────────────────────────┘
           ▲
           │ HTTPS
           ▼
┌──────────────────────────────────────────┐
│       Browser (Anywhere)                 │
├──────────────────────────────────────────┤
│  https://roastpilot.app                  │
│  (view roasts, submit reviews)           │
└──────────────────────────────────────────┘
```

**Features enabled**:
- ✅ Upload roast logs to cloud (async, best-effort)
- ✅ Download reference roasts before roasting
- ✅ Submit tasting reviews from anywhere
- ✅ Community roast gallery (opt-in)
- ✅ FC audio annotation (for model improvement)

---

## Inter-Repository Dependencies

### Dependency Graph

```
roastpilot-web
    │
    └─▶ roastpilot-agent (FastAPI REST + SSE)
            │
            ├─▶ coffee-roaster-mcp (MCP stdio client)
            │       └─▶ Hottop hardware (USB serial)
            │
            ├─▶ roastpilot-cloud (HTTP API, optional)
            │       └─▶ Postgres + S3
            │
            └─▶ PydanticAI (advisory LLM)

coffee-first-crack-detection
    │
    ├─▶ roastpilot-cloud (download annotations)
    └─▶ Hugging Face Hub (publish models)
            │
            └─▶ coffee-roaster-mcp (downloads model)
```

### Version Compatibility

**SemVer Strategy**:
- **coffee-roaster-mcp**: `v1.x.x` (stable MCP protocol)
- **roastpilot-agent**: `v2.x.x` (matches v2 plan)
- **roastpilot-web**: `v1.x.x` (matches agent API)
- **roastpilot-cloud**: `v1.x.x` (API versioning)
- **coffee-first-crack-detection**: `v1.x.x` (model versioning)

**Compatibility matrix**:
```
Agent v2.0.x  → MCP v1.0.x (works)
Agent v2.1.x  → MCP v1.1.x (requires MCP upgrade for Loop B)
Agent v2.x.x  → Cloud v1.x.x (backward compatible)
Web v1.x.x    → Agent v2.x.x (API versioned)
```

**Breaking changes**:
- **MCP v1.0 → v1.1**: Add `operator_hint` parameter (backward compatible, optional)
- **MCP v1.1 → v2.0**: Add audio ring buffer (breaking, requires upgrade)

---

## Development Workflow

### Local Development (All Repos)

```bash
# Terminal 1: Start MCP server
cd coffee-roaster-mcp
uv run coffee-roaster-mcp serve --driver mock

# Terminal 2: Start agent
cd coffee-roaster-agent-v2
uv run roastpilot-agent serve --mcp-server coffee-roaster-mcp

# Terminal 3: Start web dev server
cd roastpilot-web
npm run dev

# Browser
open http://localhost:5173  # Vite dev server proxies to agent
```

### CI/CD Pipeline

**coffee-roaster-mcp**:
```yaml
on: [push]
jobs:
  test:
    - pytest
    - ruff check
  publish:
    - build wheel
    - publish to PyPI
```

**roastpilot-agent**:
```yaml
on: [push]
jobs:
  test:
    - pytest
    - ruff check
    - mock roast integration test
  publish:
    - build wheel
    - publish to PyPI
```

**roastpilot-web**:
```yaml
on: [push]
jobs:
  test:
    - npm test
    - npm run typecheck
  deploy:
    - npm run build
    - vercel deploy (preview)
    - vercel deploy --prod (main branch)
```

**roastpilot-cloud**:
```yaml
on: [push]
jobs:
  test:
    - npm test
    - integration tests (against staging DB)
  deploy:
    - supabase db push (staging)
    - supabase functions deploy (staging)
    - (manual approval)
    - supabase db push (production)
    - supabase functions deploy (production)
```

**coffee-first-crack-detection**:
```yaml
on: workflow_dispatch
jobs:
  train:
    - download validated samples from cloud
    - train model
    - evaluate on test set
    - export to ONNX
    - publish to Hugging Face Hub
```

---

## Migration from Legacy Prototype

### From `coffee-roasting` to New Structure

**Current state** (legacy monorepo):
```
coffee-roasting/
├── src/
│   ├── mcp_servers/              → Migrated to coffee-roaster-mcp
│   ├── orchestration/            → Replaced by roastpilot-agent
│   ├── training/                 → Migrated to coffee-first-crack-detection
│   └── utils/                    → Split across new repos
```

**Migration plan**:

1. **Phase 1: MCP Server** ✅ (Already done)
   - `coffee-roasting/src/mcp_servers/roaster_control/` → `coffee-roaster-mcp/`
   - `coffee-roasting/src/mcp_servers/first_crack_detection/` → `coffee-roaster-mcp/`
   - Result: `coffee-roaster-mcp` v1.0 (released)

2. **Phase 2: Agent v2** (Milestone 1)
   - `coffee-roasting/src/orchestration/` → **REPLACED** by `roastpilot-agent/`
   - No migration; full rewrite with deterministic architecture

3. **Phase 3: ML Training** ✅ (Already done)
   - `coffee-roasting/src/training/` → `coffee-first-crack-detection/`
   - Result: `coffee-first-crack-detection` v1.0 (released)

4. **Phase 4: Cloud** (Milestone 2)
   - `coffee-roasting` had no cloud component (used Aspire orchestration)
   - Create `roastpilot-cloud` from scratch

5. **Phase 5: Web UI** (Milestone 1)
   - `coffee-roasting` had no web UI (used n8n interface)
   - Create `roastpilot-web` from scratch

**Result**: `coffee-roasting` becomes **read-only reference** after Milestone 1.

---

## Monorepo vs Multi-Repo Decision

### Why Multi-Repo (Chosen Strategy)

**Reasons**:
1. **Different deployment units**: Device vs Cloud vs ML training
2. **Different release cadence**: Agent weekly, Cloud daily, Models monthly
3. **Different teams**: Hardware, Agent, Frontend, Backend, ML
4. **Different languages**: Python (MCP, Agent) vs TypeScript (Web, Cloud)
5. **Independent versioning**: SemVer per component

**Tradeoffs**:
- ❌ Harder to coordinate breaking changes (need version matrix)
- ❌ More repos to manage (5 repos instead of 1)
- ✅ Easier to onboard new contributors (smaller scope per repo)
- ✅ Faster CI/CD (only test/deploy changed repo)
- ✅ Clear ownership boundaries

### Alternative: Monorepo with Turborepo/Nx

**If we chose monorepo**:
```
roastpilot/
├── apps/
│   ├── agent/                    # Python (roastpilot-agent)
│   ├── web/                      # TypeScript (roastpilot-web)
│   └── cloud/                    # TypeScript (roastpilot-cloud)
├── packages/
│   ├── mcp/                      # Python (coffee-roaster-mcp)
│   ├── ml-training/              # Python (coffee-first-crack-detection)
│   └── shared-types/             # TypeScript (API types)
├── turbo.json
└── package.json
```

**When to reconsider monorepo**:
- Team grows to 10+ people working across all components
- Shared types cause frequent breaking changes
- Need atomic commits across multiple components

**For now**: Multi-repo is correct for team size and deployment model.

---

## Repository URLs (Recommended)

### GitHub Organization

Create organization: `github.com/roastpilot` (proposed - not created yet;
existing repositories currently live under `github.com/syamaner`)

**Repositories** (target layout under the proposed org):
```
github.com/roastpilot/coffee-roaster-mcp          # Exists today as github.com/syamaner/coffee-roaster-mcp
github.com/roastpilot/roastpilot-agent            # New (this plan; working name coffee-roaster-agent-v2)
github.com/roastpilot/roastpilot-web              # New
github.com/roastpilot/roastpilot-cloud            # New
github.com/roastpilot/coffee-first-crack-detection # Exists today as github.com/syamaner/coffee-first-crack-detection
github.com/roastpilot/coffee-roasting             # Archive (legacy; exists today as github.com/syamaner/coffee-roasting)
```

**Why organization**:
- ✅ Shared team access
- ✅ Consistent branding
- ✅ Community discoverability
- ✅ GitHub Discussions for community

---

## Summary

### Repository Strategy: Multi-Repo per Deployment Unit

| Repository | Purpose | Deployment | Language | Status |
|------------|---------|------------|----------|--------|
| **coffee-roaster-mcp** | Hardware boundary | Device-local | Python | ✅ Exists |
| **roastpilot-agent** | Orchestration + advisory | Device-local | Python | 🟡 New (Milestone 1) |
| **roastpilot-web** | User interface | Device/Cloud | TypeScript | 🟡 New (Milestone 1) |
| **roastpilot-cloud** | Cloud data plane | Cloud | TypeScript | 🟡 New (Milestone 2) |
| **coffee-first-crack-detection** | ML training | Batch/HF Hub | Python | ✅ Exists |

### Deployment Model

**Milestone 1 (Local-Only)**:
- Device: MCP + Agent + Web (bundled)
- No cloud dependency
- Local SQLite persistence

**Milestone 2 (Cloud-Enabled)**:
- Device: Same as M1
- Cloud: API + DB + Storage (optional)
- Best-effort sync, local-first

**Milestone 3 (Model Improvement)**:
- ML training: Download annotations, fine-tune, publish
- Cloud: Annotation service
- Device: Auto-download model updates (opt-in)

### Key Principles

1. **Deployment boundary = Repository boundary**
2. **Local-first architecture** (cloud is optional enhancement)
3. **Multi-repo for independent versioning and deployment**
4. **Clear ownership** (one team per repo)
5. **SemVer compatibility matrix** (document breaking changes)

This structure enables:
- ✅ Independent development and deployment
- ✅ Clear team ownership
- ✅ Graceful degradation (cloud optional)
- ✅ Easy onboarding (smaller repos)
- ✅ Flexible hosting (device, cloud, hybrid)
