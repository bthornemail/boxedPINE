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

| Bug | File | Description |
|-----|------|-------------|
| `delta16` not exported | `rosetta/src/constants.ts` | Used internally by `model.ts` but cannot be imported |
| `switch` fall-through | `rosetta/src/model.ts` | The `switch` statement has fall-through cases without `break` |
| Division by zero | `rosetta/src/model.ts` | `linear % count === 0` throws when `count === 0` |
| `pin` always throws | `rosetta/src/model.ts` | The try/catch/finally structure always throws |
| `PALINDROME` missing | `rosetta/src/constants.ts` | Referenced in type but not in implementation |
| `Node`/`Buffer` truthiness | `rosetta/src/model.ts` | `if (front || back || right || left || up || down)` is always truthy |
| `animation.frame.ts` invalid TS | `rosetta/src/animation.frame.ts` | Missing `this.Q` reference |
| `isRight` arity mismatch | `rosetta/src/constants.ts` | `isRight` takes 1 arg but `RIGHT` regex has 2 capture groups |
| `xor` length mismatch | `rosetta/src/constants.ts` | `xor(a, b)` assumes `a` and `b` have the same length |

## The Protocol Handler

The closure-based protocol handler (Regex + Proxy + Reflect) is specified but not yet implemented as a working file. The specification is in [[SPEC-30 The Symbol Table G]].

## The Self-Generating Kernel

The self-generating kernel with the closure scope chain is specified but not yet implemented as a working file. The specification is in [[SPEC-30 The Symbol Table G]].

## Verification

The conformance test vectors are in [[SPEC-60 Test Vectors]]. The self-test is not yet run.

## Next Steps

1. Export `delta16` from `constants.ts`
2. Fix the `switch` fall-through in `model.ts`
3. Fix the division by zero in `model.ts`
4. Rewrite `animation.frame.ts` (invalid TS + missing `this.Q`)
5. Implement the `apply` method
6. Fix the `pin` method
7. Add `PALINDROME` to the `G` object
8. Implement the `learn` method
9. Implement the `regenerate` function
10. Run the self-test
