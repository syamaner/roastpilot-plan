# Repository Structure: Quick Reference

## TL;DR

**Strategy**: **Multi-repo per deployment unit**

```
5 repositories:
├── coffee-roaster-mcp          (Device: Hardware boundary) ✅ Exists
├── roastpilot-agent            (Device: Orchestration) 🟡 New
├── roastpilot-web              (Browser: UI) 🟡 New
├── roastpilot-cloud            (Cloud: Data plane) 🟡 New (M2)
└── coffee-first-crack-detection (ML: Training) ✅ Exists
```

---

## Visual Architecture

```
┌─────────────────────────────────────────────────────┐
│                    RASPBERRY PI                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  coffee-roaster-mcp (Python)               │    │
│  │  - USB → Hottop                            │    │
│  │  - Audio → First Crack Model               │    │
│  │  - MCP Protocol (stdio)                    │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                  │
│  ┌────────────────▼───────────────────────────┐    │
│  │  roastpilot-agent (Python)                 │    │
│  │  - State machine + Safety                  │    │
│  │  - PydanticAI advisor                      │    │
│  │  - SQLite persistence                      │    │
│  │  - FastAPI + SSE                           │    │
│  └────────────────┬───────────────────────────┘    │
│                   │ HTTP/WebSocket                  │
│                   │                                  │
│  ┌────────────────▼───────────────────────────┐    │
│  │  roastpilot-web (Static SPA)               │    │
│  │  - Bundled with agent                      │    │
│  │  - Served at http://raspberrypi:8000       │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
                     │
                     │ HTTPS (optional, best-effort)
                     │
┌────────────────────▼─────────────────────────────────┐
│              CLOUD (Supabase/Vercel)                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  roastpilot-cloud (TypeScript)              │    │
│  │  - Postgres (roast logs, reviews)          │    │
│  │  - S3/R2 (FC audio samples)                 │    │
│  │  - Reference roast aggregation              │    │
│  │  - Annotation service                       │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘
                     │
                     │ Model updates
                     │
┌────────────────────▼─────────────────────────────────┐
│          HUGGING FACE HUB (ML Models)                │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  coffee-first-crack-detection (Python)      │    │
│  │  - Training scripts                         │    │
│  │  - Fine-tuning on annotations               │    │
│  │  - ONNX model export                        │    │
│  │  - Publish to HF Hub                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Repository Details

### 1. `coffee-roaster-mcp` (Exists)
**What**: MCP server for Hottop hardware control  
**Where**: Device-local (Raspberry Pi)  
**Language**: Python  
**Responsibilities**: USB serial, audio capture, session lifecycle, telemetry

```bash
pip install coffee-roaster-mcp
coffee-roaster-mcp serve
```

---

### 2. `roastpilot-agent` (New - Milestone 1)
**What**: Agent orchestration layer  
**Where**: Device-local (same machine as MCP)  
**Language**: Python  
**Responsibilities**: State machine, safety, advisor, persistence, API

```bash
pip install roastpilot-agent
roastpilot-agent serve --mcp-server coffee-roaster-mcp
```

---

### 3. `roastpilot-web` (New - Milestone 1)
**What**: User interface (SPA)  
**Where**: Browser (same device or LAN)  
**Language**: TypeScript (React/Svelte)  
**Responsibilities**: Real-time monitoring, controls, tasting reviews

**Deployment**:
```bash
# Option A: Bundled with agent (simpler)
roastpilot-agent serve --spa-dir ./roastpilot-web/dist

# Option B: Separate hosting (remote access)
vercel deploy
```

---

### 4. `roastpilot-cloud` (New - Milestone 2)
**What**: Cloud data plane  
**Where**: Cloud (Supabase/Vercel)  
**Language**: TypeScript  
**Responsibilities**: Roast logs, reviews, reference summaries, annotation

```bash
# Supabase
supabase db push
supabase functions deploy
```

---

### 5. `coffee-first-crack-detection` (Exists)
**What**: ML model training  
**Where**: GitHub Actions → Hugging Face Hub  
**Language**: Python (PyTorch)  
**Responsibilities**: Train FC model, fine-tune, publish ONNX

```bash
# GitHub Actions workflow (manual trigger)
gh workflow run train-and-publish.yml
```

---

## Deployment Timeline

### Milestone 1: Local-Only (No Cloud)
**Repos needed**:
- ✅ coffee-roaster-mcp (exists)
- 🟡 roastpilot-agent (new)
- 🟡 roastpilot-web (new)

**Installation**:
```bash
pip install coffee-roaster-mcp roastpilot-agent
roastpilot-agent serve --spa-dir ./web/dist
```

**Access**: http://raspberrypi.local:8000

---

### Milestone 2: Cloud-Enabled (Loop A)
**Repos needed**:
- All from M1
- 🟡 roastpilot-cloud (new)

**Features**:
- Upload roast logs
- Download reference roasts
- Submit tasting reviews
- Privacy controls

---

### Milestone 3: Model Improvement (Loop B)
**Repos needed**:
- All from M2
- ✅ coffee-first-crack-detection (exists)

**Features**:
- Audio annotation service
- Model fine-tuning pipeline
- Auto-update mechanism (opt-in)

---

## Why Multi-Repo?

✅ **Different deployment units**: Device vs Cloud vs ML  
✅ **Different release cadence**: Agent weekly, Cloud daily, Models monthly  
✅ **Different teams**: Hardware, Agent, Frontend, Backend, ML  
✅ **Independent versioning**: SemVer per component  
✅ **Faster CI/CD**: Only test/deploy changed repo  

❌ **Tradeoff**: Need version compatibility matrix

---

## Repository URLs (Recommended)

GitHub Organization: `github.com/roastpilot` (proposed - not created yet;
existing repositories currently live under `github.com/syamaner`)

```
github.com/roastpilot/coffee-roaster-mcp            # exists today as github.com/syamaner/coffee-roaster-mcp
github.com/roastpilot/roastpilot-agent              # new; working name coffee-roaster-agent-v2
github.com/roastpilot/roastpilot-web                # new
github.com/roastpilot/roastpilot-cloud              # new
github.com/roastpilot/coffee-first-crack-detection  # exists today as github.com/syamaner/coffee-first-crack-detection
```

---

## Development Workflow

```bash
# Terminal 1: MCP server (mock driver)
cd coffee-roaster-mcp
uv run coffee-roaster-mcp serve --driver mock

# Terminal 2: Agent
cd roastpilot-agent
uv run roastpilot-agent serve

# Terminal 3: Web dev server
cd roastpilot-web
npm run dev

# Browser
open http://localhost:5173
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Repo strategy** | Multi-repo | Different deployment units |
| **Device language** | Python | Matches MCP, ML ecosystem |
| **Web language** | TypeScript | Type safety, ecosystem |
| **Cloud language** | TypeScript | Matches web, serverless-friendly |
| **Web bundling** | With agent (M1) | Simpler initial deployment |
| **Cloud provider** | Supabase (M2) | Fastest to MVP |
| **ML hosting** | Hugging Face Hub | Standard for model distribution |

---

## Version Compatibility

```
Agent v2.0.x  → MCP v1.0.x  ✅ Works
Agent v2.1.x  → MCP v1.1.x  ✅ Works (adds operator_hint)
Agent v2.2.x  → MCP v2.0.x  ⚠️  Breaking (audio ring buffer)

Web v1.x.x    → Agent v2.x.x ✅ Backward compatible (API versioned)
Cloud v1.x.x  → Agent v2.x.x ✅ Backward compatible
```

---

## Summary

**5 repositories, 3 deployment targets, 2 languages**

- **Device-local**: MCP + Agent + Web (Python + TypeScript static)
- **Cloud**: API + DB + Storage (TypeScript serverless)
- **ML**: Training → HF Hub (Python batch jobs)

**Milestone 1**: 3 repos (MCP, Agent, Web) - Local-only  
**Milestone 2**: +1 repo (Cloud) - Loop A enabled  
**Milestone 3**: All 5 repos - Loop B enabled

**Next step**: Create `roastpilot-agent` and `roastpilot-web` repos for Milestone 1.
