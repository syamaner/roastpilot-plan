# Torch-Free Pi Appliance — cross-repo rollout

**Decision:** D27 (`roastpilot-agent/plan.md`). **Created:** 11 Jun 2026.
**Goal:** ship RoastPilot as a headless **Raspberry Pi 5** appliance — native install
(PyPI wheel + pipx + systemd), bundled model, **no Docker**, and **no PyTorch** on
the Pi. This doc sequences the work across **three repos**; each phase gates the next.

```
  coffee-first-crack-detection   →   coffee-roaster-mcp   →   roastpilot-agent
        (model pipeline)               (MCP server)            (agent + UI / E11)
        drop torch, librosa mel        consume torch-free      native packaging
        — ACCURACY GATE                FC detection            pipx + systemd + model
```

The current Pi path is **not** torch-free: `requirements-pi.txt` still needs `torch`
CPU (separately installed) + `transformers` because the mel filterbank goes through
`ASTFeatureExtractor`. `librosa` and `numpy` are already in the deps — so the swap is
half-staged. Dropping torch removes the only hard ARM dependency and makes the native
install plain PyPI wheels.

---

## Phase 1 — Model pipeline (`coffee-first-crack-detection`)  ⟵ the prerequisite

Replace the torch feature extractor with a librosa one in the **ONNX inference path**,
then drop torch.

- [ ] Swap `ASTFeatureExtractor` mel filterbank → **`librosa.feature.melspectrogram`**
  (match the AST config exactly: 16 kHz, 128 mel bins, the AST window/hop/`fmin`/`fmax`,
  log-mel scaling, and AST's mean/std normalization). The ONNX model input must be
  byte-for-byte the same shape/scale it trained on.
- [ ] **ACCURACY GATE (hard):** re-run the **v2 test set (191 samples)** with the
  librosa front-end; **preserve ≥ the recorded 96.86 % accuracy / 96.9 % precision**
  (and the ≤1 false-positive behavior). A numeric diff of librosa-mel vs AST-mel on a
  few windows is the first check; the test-set metrics are the gate. **Do not land the
  swap if metrics regress** — tune the librosa params until they match, or stop and
  escalate.
- [ ] Remove **`torch`** + **`transformers`** from `requirements-pi.txt` (torchaudio /
  optimum are already excluded). Result: a torch-free Pi inference stack — `onnxruntime`,
  `librosa`, `soundfile`, `sounddevice`, `numpy`, `huggingface-hub`, `scikit-learn`,
  `pyyaml`, `tqdm`.
- [ ] Keep a torch-using path (dev/training) if useful, but the **Pi profile is
  torch-free**. Update `docs/posts/devto/post-4-edge.md` metrics + the install notes.
- **Output:** a torch-free ONNX FC-detection path + a pinned model artifact (the
  89.9 MB INT8 model, a fixed HF revision) the appliance can bundle.

## Phase 2 — MCP server (`coffee-roaster-mcp`)  ⟵ gated on Phase 1

- [ ] Consume the torch-free FC detection; update the MCP's Pi dependency set (drop
  torch); ensure the live **audio → FC** pipeline (USB mic, ALSA/portaudio, 16 kHz mono,
  10 s window / 7 s hop, threshold 0.90 + the ≥3-positive-in-30 s confirmation) runs
  torch-free on a Pi 5.
- [ ] Verify serial → Hottop + the audio pipeline coexist within the Pi 5's budget
  (FC at 2 threads "leaving cores for MCP + UI"); confirm no thermal throttle with the
  active cooler.
- [ ] Bump the MCP version; publish so `roastpilot-agent[pi]` can pin it.
- **Output:** a torch-free `coffee-roaster-mcp` release that does serial + FC with no
  torch.

## Phase 3 — Agent + UI (`roastpilot-agent`, E11 packaging)  ⟵ gated on Phase 2

- [ ] **`roastpilot-agent[pi]` extra** — declares the torch-free `coffee-roaster-mcp` +
  Pi deps; bundles `web/dist` (D1); `api.py` serves the SPA.
- [ ] **One-line installer** (`curl … | bash`, idempotent): `apt install libportaudio2`;
  `pipx install roastpilot-agent[pi]`; place the **bundled/cached pinned FC model**;
  add operator to `dialout`+`audio`; write the **systemd unit** (one service, agent
  spawns MCP stdio child per D6, restart → recovery); enable **avahi/mDNS**.
- [ ] **Bundled/offline model** — a roast never depends on a live HF pull (pinned
  revision; verify checksum at install).
- [ ] **Deploy doc** — Pi 5 + 27 W PSU + active cooler prereqs, config (env: OpenRouter
  key, port), data location, upgrade (`pipx upgrade`), `journalctl` log access, the
  `http://roastpilot.local:<port>` access story.
- [ ] Smoke: install into a clean Pi (or arm64 venv) → CLI + `/api/health` + SPA served.
- **Output:** *power on the Pi → it autostarts → open the URL from your phone.* No
  Docker, no torch, no network needed for the model.

---

## Sequencing & ownership

- **Strict order: 1 → 2 → 3** (each output is the next phase's input). Phases can be
  *specced/prompted* in parallel, but Phase 1's **accuracy gate** blocks everything —
  if librosa can't match AST's mel, the torch-free appliance doesn't happen and D27's
  torch-free clause reverts to "carry the pytorch-CPU index step" (the documented
  fallback).
- Each repo follows its own AGENTS.md (branch/PR/review). The FC-detection + MCP repos
  own the accuracy + hardware validation; roastpilot-agent owns E11.
- This is also the **first multi-repo agent hand-off** in the program — a blog beat in
  its own right (the spec coordinates repos the agents don't share a checkout across).
