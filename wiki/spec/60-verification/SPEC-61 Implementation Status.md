---
id: SPEC-61
title: "Implementation Status"
kind: spec
layer: verification
status: draft
spec: OMI-IMO-2026
up: "[[SPEC-60 Test Vectors]]"
down: []
related:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[OPEN-02 Broken Code Inventory]]"
sources:
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/model.ts"
  - "rosetta/src/constants.ts"
  - "rosetta/src/bind.offset.ts"
  - "rosetta/src/animation.frame.ts"
  - "rosetta/src/index.ts"
dimensions: []
symbols: []
tags: [omi-imo, implementation, status, bugs, completeness]
---

# Implementation Status

## Overview

The OMI-IMO protocol is specified but not fully implemented. The specification is complete (the Rosetta Stone, the type system, the grammar, the circuits). The implementation is partial.

## What Exists

| Component | File | Status |
|-----------|------|--------|
| Type system | `rosetta/src/index.ts` | Complete |
| Symbol table G | `core/src/index.ts` | Moved; file does not compile |
| Delta transform | `core/src/index.ts` | Moved; `delta16` still unexported |
| Arc functions | `rosetta/src/constants.ts` | Complete |
| Node class | `rosetta/src/model.ts` | Partial |
| Domain class | `rosetta/src/model.ts` | Partial |
| Bind offset | `rosetta/src/bind.offset.ts` | Complete |
| Stream bus | `rosetta/src/bin.ts` | Complete |
| CUPS integration | `rosetta/src/bin.ts` | Complete |
| WebVTT producer | `rosetta/src/bin.ts` | Complete |
| REPL server | `rosetta/src/main.ts` | Complete |
| SSE server | `rosetta/src/main.ts` | Complete |
| Animation frame | `rosetta/src/animation.frame.ts` | Partial |
| Rosetta Stone YAML | `rosetta/src/omi_rosetta_stone.yaml` | Complete |
| Virtual breadboard kernel | `omi-files/omi/audio/breadboard/kernel.mjs` | Complete; self-test passes |
| Virtual breadboard page | `omi-files/omi/audio/breadboard/index.html` | Complete |
| Unified canonical statement | `rosetta/src/unified_canonical_statement.yaml` | Complete |

## What Is Missing

| Component | Description |
|-----------|-------------|
| `apply` method | The `apply` method in `Node` is a stub — declared but not implemented |
| `pin` method | The `pin` method always throws — the try/catch/finally structure is broken |
| `delta16` export | `delta16` is not exported from `constants.ts` |
| `PALINDROME` pattern | Referenced in the synthesis but not in the actual `G` object |
| `learn` method | The self-modifying kernel's `learn` method is not yet implemented |
| `regenerate` function | The kernel regeneration from description is not yet implemented |
| Self-test | The self-test is not yet run |

## After the 2026-10-06 reorg

Code now lives in `core/`, `rosetta/`, `space/`, and `src/`. Old paths `rosetta/src/constants.ts` and `rosetta/src/model.ts` are gone. `core/src/model.ts` still imports `./constants`. The Fano Fold conversation ([[SRC-09 Try XOR Catch XNOR Finally]]) restates the blackboard and the try/catch/finally triangle. It does not close `{17, 19}`.

## Known Bugs

Verified 2026-10-07; full list with fixes in [[OPEN-02 Broken Code Inventory]]. The old `rosetta/src` paths are now `_archive/index.ts` (constants) and `_archive/model.ts`.

| Bug | File | Verdict |
|-----|------|---------|
| `delta16` not exported | `_archive/index.ts` | Confirmed |
| `delta` rotates bytes (period 4) | `_archive/index.ts` | Intended block reading; only the `delta16` name clashes |
| `index.ts` does not compile | `_archive/index.ts` | Confirmed |
| `PALINDROME` missing from `G` | `_archive/index.ts` | Confirmed |
| `xor` length mismatch | `_archive/index.ts` | Confirmed (minor) |
| `isRight` arity mismatch | `_archive/index.ts` | Not a bug |
| `Node` constructor throws at `swap32` | `_archive/model.ts` | Confirmed |
| `switch` fall-through | `_archive/model.ts` | Confirmed (intent unknown) |
| `Node`/`Buffer` truthiness | `_archive/model.ts` | Confirmed (always throws) |
| Division by zero | `_archive/model.ts` | Not a bug (`NaN`) |
| `pin` | `_archive/model.ts` | Never returns its Blob URL |
| `animation.frame.ts` | `_archive/animation.frame.ts` | Not a TS file past line 79 |

## The Protocol Handler

The closure-based protocol handler (Regex + Proxy + Reflect) is specified but not yet implemented as a working file. The specification is in [[SPEC-30 The Symbol Table G]].

## The Self-Generating Kernel

A working self-generating kernel (mutable `Map` grammar, `learn`, `describe`, `regenerate`, `selfTest`) is in the Fano Fold conversation, [[SRC-09 Try XOR Catch XNOR Finally]]. Extracted and run on 2026-10-07, it passed 19 of 20 self-test checks; the failure is the `HEX` regex. It is not yet a file in the repo. See [[OPEN-01 Open Questions]] #8–9.

A scoped version exists for circuits: [[SPEC-44 The Virtual Breadboard]] has a working `learn` (truth table → gate rule) and regenerates its whole graph from a description. It does not cover the regex grammar G.

## Verification

The conformance test vectors are in [[SPEC-60 Test Vectors]]. The Fano Fold kernel self-test was run (19/20). The virtual breadboard self-test passes (`npm test` in `omi-files/omi/audio`). The delta's exact period 8 is proved in `omi-files/omi-axioms/coq/04-execution/Delta16HasExactPeriodEight.v` (compiles, no `Admitted`).

## Next Steps

1. Move the Fano Fold kernel into the repo as a module, with the `HEX`/`BINARY`/`OCTAL` regex fixes
2. Export `delta16`, and give the block-level fold (period 4; the fold itself has period 12) a name distinct from the bit-level `delta16` (period 8)
3. Add `PALINDROME` to `G`
4. Fix the `Node` constructor (16-byte centroid, copy before each swap, `.length` checks)
5. Implement `apply` (bind + correction + one delta step) and make `pin` return its URL
6. Decide whether `regenerate` restores positions as well as grammar
