---
id: SRC-09
title: "Try XOR Catch XNOR Finally as the Fano Plane of the Fold"
kind: source
layer: sources
status: draft
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-61 Implementation Status]]"
  - "[[SPEC-64 Three Cubes]]"
  - "[[SPEC-65 Hamming Code Delta]]"
  - "[[SPEC-66 BOM Swap Table]]"
sources: []
code:
  - "core/src/index.ts"
  - "core/src/model.ts"
dimensions: []
symbols: []
tags: [omi-imo, source, archive, fano, fold, try-catch]
---

# Try XOR Catch XNOR Finally as the Fano Plane of the Fold

Source file, outside the vault: `_archive/The try xor catch xnor finally as the Fano Plane of the Fold.md` (5861 lines). Written after the code was split into `core/`, `rosetta/`, `space/`, and `src/`.

## What it restates

These are stated in that conversation. They are not independently proven.

- The middle of `bind` is the blackboard `{3, 7, 11, 15}`, not the inline lambda cube `{4,6,8}` vs `{3,5,7,9}`.
- `delta16` is a Hamming step on a 16-byte window: bottom 8 is state, top 8 is the correction, then the halves swap.
- Access ops are `get` / `set` / `catch`. Protocol ops are `bind` / `apply` / `eval` / `digest`. Slot 8 is the buffer identity.
- `try` / `catch` / `finally` is the triangle of the fold. `finally` is the unconditional witness. The conversation calls this the Fano plane at triangle scale.
- The title's XOR/XNOR reading is the user's framing: `try` as XOR, `catch` as XNOR, `finally` as the attestation. The closing section does not prove that pairing.

## What it leaves open

The file ends by asking which reading is the Fano plane:

- three clauses alone (`try`, `catch`, `finally`), or
- three clauses plus four operations (`bind`, `apply`, `eval`, `digest`), totaling seven.

It also says the `{17, 19}` evaluation anchors are **not** resolved, so escape stays unconditional until they are.

## Code after the reorg

`core/src/index.ts` now holds the old `constants.ts` grammar plus the `Point` / `Triangle` / `get` / `set` / `catch` sketch. That sketch does not compile: `iExtant` is not a valid interface, `Simplex` nests functions illegally, and `omi` / `tensor` / `Deviation` are unbound.

`core/src/model.ts` still imports `./constants`, which no longer exists. `delta` and `delta16` live in `core/src/index.ts` and `delta16` is still not exported.
