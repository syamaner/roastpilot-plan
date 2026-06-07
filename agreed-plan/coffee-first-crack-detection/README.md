# coffee-first-crack-detection — No-Change Note + Loop B Backlog Pointer

**Repo**: `github.com/syamaner/coffee-first-crack-detection` (exists)
**Milestone**: no M1/M2 work
**Status**: Pipeline complete and public (HF dataset, model, ONNX INT8 export,
demo Space). Documented in the 5-part dev.to series.

## M1/M2 position

The agent consumes the published model only through `coffee-roaster-mcp`'s
first-crack runtime. No training, evaluation, or publishing work is needed for
the agent harness or Loop A.

## Loop B backlog (appendix — not planned in detail, per decision D4)

Future fine-tuning loop, retained as design context only:

1. Validated FC-override samples downloaded from a future annotation service.
2. Dataset augmentation with recording-level splits (no leakage).
3. Fine-tune; evaluate on held-out test set; require improvement over baseline.
4. ONNX export; publish to HF Hub with version tag; manual review before
   release.
5. MCP downloads update on restart (opt-in).

Prerequisites live in other repos (MCP audio ring buffer, cloud annotation
pipeline) and are equally backlog. Per the CFP accuracy boundaries: this is
future backlog and must not be described publicly as current scope.
