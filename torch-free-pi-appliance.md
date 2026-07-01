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

> **IMPLEMENTATION FINDING (1 Jul 2026, branch `feature/54-…`, commit `7226d41`) — supersedes
> the "librosa mel front-end" wording throughout this section.** `librosa` **cannot** reproduce
> `ASTFeatureExtractor`'s Kaldi `fbank` (preemphasis, DC-offset removal, `mel_floor`, log-mel,
> `(x−mean)/(std·2)` norm) — `librosa.feature.melspectrogram` gives different results and can't be
> swapped in. The front-end is therefore a **from-scratch numpy/scipy Kaldi-compatible** module
> (`mel_frontend.MelFrontend`, `from_config()` reads mean/std from `preprocessor_config.json`);
> `scipy>=1.11` is added to the Pi deps; **`librosa` is kept ONLY for audio I/O (`librosa.load`)**.
> So every "librosa mel front-end / swap to a librosa one" below means *that numpy/scipy Kaldi
> front-end*. **Accuracy gate PASSED in substance:** the front-end is numerically equivalent to AST
> (`input_values` match **<1.3e-05**, float32 noise; keystone test `test_numeric_mel_diff_vs_ast`),
> so there is **zero regression** — the literal 96.9%/≤1-FP gate numbers differ only because the
> test split grew 191→303 samples, where the **old AST path and the new path score identically**
> (98.3% / 91.1% / 4 FP). The 4-FP/precision-on-303 question is a separate MODEL-quality issue
> (filed in `coffee-first-crack-detection`), not a torch-free regression. Operator-accepted 1 Jul.

Replace the torch feature extractor with a numpy/scipy Kaldi-compatible one (NOT librosa — see the
finding above) in the **ONNX inference path**, then drop torch.

- [ ] Swap the `ASTFeatureExtractor` mel front-end → a librosa one in **all 3 consumers**:
  `src/coffee_first_crack/inference_onnx.py` (`_load_extractor` + `_predict_window`'s
  `self._extractor(...)→input_values`), **`scripts/evaluate_onnx.py`** (the gate harness),
  and `scripts/benchmark_onnx_pi.py`. **Exact parity recipe** (validated 13 Jun): read
  `mean=-4.2677393, std=4.5689974, num_mel_bins=128, max_length=1024, sampling_rate=16000`
  from the published `preprocessor_config.json`; **hardcode the AST spectrogram internals
  that are NOT in that json** (they are `ASTFeatureExtractor` class defaults — confirmed in
  the MCP's `_patch_ast_feature_extractor_for_numpy_only_runtime`): `frame_length=400,
  hop_length=160, fft_length=512, power=2.0, center=False, preemphasis=0.97, log_mel="log",
  mel_floor=1.192092955078125e-07, remove_dc_offset=True`. The ONNX `input_values` must be
  byte-for-byte the same shape/scale it trained on.
- [ ] **ACCURACY GATE (hard) — and it must run through the NEW front-end.** Re-run
  `scripts/evaluate_onnx.py` (the script that produced `results/v2_pi5_int8_4t_eval.json`)
  on the **v2 test set (191 samples)** **using the librosa front-end** (not the old AST
  one — else the gate validates the wrong path): **preserve ≥ 96.86 % accuracy / 96.9 %
  precision** (and ≤1 false-positive). First check = numeric diff of librosa-mel vs AST-mel
  `input_values` on a few windows. **Do not land if metrics regress** — tune or escalate.
- [ ] **CROSS-REPO ARTIFACT CONTRACT — keep publishing `onnx/{int8,fp32}/preprocessor_config.json`.**
  `export_onnx.py` emits it today (`feature_extractor.save_pretrained`); **both** this repo's
  consumers **and** the MCP's `artifacts.py` (`INT8_FEATURE_EXTRACTOR_FILENAME =
  onnx/int8/preprocessor_config.json`, a *required* resolve) read it for mean/std. Torch-free
  does NOT remove this file — the librosa front-end reads its params from it. If a "cleanup"
  drops it, Phase 2's artifact resolution breaks. (Surfaced 13 Jun validation.)
- [ ] Remove **`torch`** + **`transformers`** from `requirements-pi.txt` (torchaudio /
  optimum are already excluded). Result: a torch-free Pi inference stack — `onnxruntime`,
  `librosa`, `soundfile`, `sounddevice`, `numpy`, `huggingface-hub`, `scikit-learn`,
  `pyyaml`, `tqdm`.
- [ ] Keep a torch-using path (dev/training) if useful, but the **Pi profile is
  torch-free**. Update `docs/posts/devto/post-4-edge.md` metrics + the install notes.
- **Output:** a torch-free ONNX FC-detection path + a pinned model artifact (the
  89.9 MB INT8 model, a fixed HF revision) the appliance can bundle.

## Phase 2 — MCP server (`coffee-roaster-mcp`)  ⟵ gated on Phase 1

- [ ] Consume the torch-free FC detection; **drop `transformers`** from the MCP deps —
  note (validated 13 Jun): `torch` is **not** a hard MCP dep (the MCP already forces a
  numpy-only AST spectrogram via `detector.py:_patch_ast_feature_extractor_for_numpy_only_runtime`),
  so for this repo the swap is **transformers-free**; replace the `ASTFeatureExtractor`
  via the existing `feature_extractor_factory` seam with a librosa front-end matching that
  patch's exact params (`frame_length=400, hop_length=160, fft_length=512, power=2.0,
  center=False, preemphasis=0.97, log_mel, mel_floor=1.19e-07, remove_dc_offset=True` +
  mel_filters + mean/std — NOT librosa defaults). Ensure the live **audio → FC** pipeline
  (USB mic, ALSA/portaudio, 16 kHz mono, 10 s window / 7 s hop, threshold 0.90 + the
  ≥3-positive-in-30 s confirmation) runs on a Pi 5.
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
- [ ] **Bundled audio config matches the VALIDATED `pi_inference` profile** (gap surfaced
  13 Jun validation). The installer's `coffee-roaster-mcp.yaml` must set
  `first_crack.mode: audio` + `window_seconds: 10.0` / `overlap: 0.3` (7 s hop) /
  `confidence_threshold: 0.90` / `min_positive_windows: 3` / `confirmation_window_seconds:
  30.0` / `onnx_threads: 2`. The MCP **code defaults** (`window_seconds 1.0`, `overlap 0`,
  `min_positive_windows 1`, `confirmation 20 s`) are NOT production — the model is trained
  on **10 s** windows, so a default-config appliance ships *broken* detection. (Fix at the
  bundled-config layer here, or align the MCP audio-mode defaults in Phase 2.)
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
