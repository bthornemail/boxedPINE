# Audit Schemas

This folder contains **JSON Schema (draft 2020-12)** definitions used by lane compilers and verifiers.

The goal is **compile-first determinism**:

- each lane emits artifacts (`*.json`, `*.svg`, `*.ndjson`, `*.glb`, etc.)
- each lane emits a **check receipt** (`*.check.json`) describing *exactly* what it produced
- each lane emits a **verify result** (`*.verify.json`) confirming hashes match
- `bundle.verify.json` can gate UI/runtime features based on `*.verify.json` pass/fail

## Ajv Extensions

These schemas are validated with **Ajv 2020** in `light-garden/audit` and `$data` enabled.

- `receipt.verify.schema.json` uses Ajv `$data` to enforce:
  - `outputs.verified_count === outputs.files.length` when `verified: true`

## File Conventions

### Check receipts

- Filename (recommended, artifact-derived): `<artifact>.<type>.check.json`
  - Example: `world.scene.patch.check.json`
  - Rationale: avoids ambiguity when a lane has multiple primary artifacts.
- Alternate (lane receipts): `lane.check.json` when one lane owns multiple outputs (allowed, but be explicit in docs + bundle policy).
- Schema: `receipt.check.schema.json`
- Purpose: declare inputs/outputs + sha256 for reproducible builds

Example kinds:

- `world.graph.check`
- `world.scene.patch.check`
- `world.mesh.ir.check`
- `world.dashboard.check`

### Verify results

- Filename (recommended, artifact-derived): `<artifact>.<type>.verify.json`
  - Example: `world.scene.patch.verify.json`
- Alternate (lane receipts): `lane.verify.json` (allowed, but document which outputs are covered).
- Schema: `receipt.verify.schema.json`
- Purpose: confirm the check receipt is attached and hashes match current files

Example kinds:

- `world.graph.verify`
- `world.scene.patch.verify`
- `world.mesh.ir.verify`
- `world.dashboard.verify`

## Required Fields (Receipt Contracts)

## Receipt Semantics (Recommended)

- `attached`: the verifier found the check file and all referenced outputs at their expected paths
- `verified`: the verifier recomputed sha256 and matched the check receipt
- `pass`: the lane is considered *good enough to gate on* (recommended: `pass => verified => attached`)

Guidance:

- Use `issues` for explainers and warnings (even if `pass: true`).
- Use `failures` for hard errors; if `pass: true`, keep `failures` empty.

### `*.check.json`

- `schema_version: 1`
- `kind: "<something>.check"`
- `lane_id: "<lane>"`
- `pass: boolean`
- `run_id: "sha256:<hex>"`
- `generated_at: RFC3339 timestamp`
- `inputs: { name -> {path, sha256, copied_from?} | null }`
- `outputs: { name -> {path, sha256} }`

Notes:

- `inputs.<name>` may be `null` when an input is optional and not present.
- `outputs` entries must be concrete file references with sha256.

### `*.verify.json`

- `schema_version: 1`
- `kind: "<something>.verify"`
- `lane_id: "<lane>"`
- `pass: boolean`
- `attached: boolean` (verifier found check + outputs at expected paths)
- `verified: boolean` (recomputed sha256 matches receipt)
- `require: boolean` (bundle gate should require this lane)
- `issues: string[]`
- `failures: string[]`
- `inputs.check: {path, sha256}`
- `outputs.verified_count: number`
- `outputs.files: {name, path, sha256}[]`
- `run_id: "sha256:<hex>"`

## World Contracts (IR Schemas)

### `world.graph.json`

- Schema: `world.graph.schema.json`
- `kind: "world.graph"`
- `lane_id: "graph"`
- Purpose: canonical, diff-friendly IR (nodes/edges/regions/paths) compiled from SVG/CanvasL/NDJSON sources.

### `world.scene.patch.json`

- Schema: `world.scene.patch.schema.json`
- `kind: "world.scene.patch"`
- `lane_id: "scene"`
- Purpose: deterministic placement and runtime-interpretable transforms/flags.

### `world.mesh.ir.json`

- Schema: `world.mesh.ir.schema.json`
- `kind: "world.mesh.ir"`
- `lane_id: "mesh"`
- Purpose: geometry IR suitable for deterministic glTF/GLB export (inline arrays or external buffers).

## Suggested Output Naming (Recommended)

Preferred: **artifact-derived receipts** (receipt filename + kind include the artifact type).

- `world.graph.json`
- `world.graph.check.json` (kind `world.graph.check`)
- `world.graph.verify.json` (kind `world.graph.verify`)

- `world.scene.patch.json`
- `world.scene.patch.check.json` (kind `world.scene.patch.check`)
- `world.scene.patch.verify.json` (kind `world.scene.patch.verify`)

- `world.mesh.ir.json`
- `world.mesh.ir.check.json` (kind `world.mesh.ir.check`)
- `world.mesh.ir.verify.json` (kind `world.mesh.ir.verify`)

If you choose **lane receipts** instead:

- the receipt should clearly enumerate all outputs in `outputs{...}`
- `bundle.verify.json` should document which receipt gates which runtime feature

## Running Schema Validation

The audit package includes a tiny Ajv validator:

```bash
npm --prefix light-garden/audit run -s validate:schema -- \
  --schema schemas/receipt.check.schema.json \
  --in ../narrative-series/Artifacts/world.dashboard.check.json
```

```bash
npm --prefix light-garden/audit run -s validate:schema -- \
  --schema schemas/world.graph.schema.json \
  --in ../narrative-series/Artifacts/world.graph.json
```

Validate a whole bundle directory (schema-only):

```bash
npm --prefix light-garden/audit run -s validate:bundle -- --dir ../narrative-series/Artifacts
```

Notes:

- `bundle.verify.json` is an aggregator (not a `*.verify.json` receipt) and is skipped by `validate:bundle`.

## Determinism Notes

- `run_id` should be derived from stable inputs (lane id + config + input sha256s + tool version), not wall clock.
- Outputs should be written in stable key order (where applicable) so the same inputs produce identical bytes.
