---
id: SRC-00
title: "Protocol Review and Bug Fixes"
kind: source
layer: sources
status: canonical
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[SRC-99 Source Index]]"
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-51 JSON Canvas Interchange]]"
  - "[[SPEC-52 The REPL and the Digest]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-55 ASCII Folds]]"
  - "[[SPEC-60 Test Vectors]]"
  - "[[SPEC-61 Implementation Status]]"
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-04 Discarded Claims]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, protocol-review, bug-fixes]
---

# Protocol Review and Bug Fixes

## Summary

This is a 322-page DeepSeek conversation transcript about reviewing and fixing bugs in the OMI-IMO protocol implementation. It covers the protocol's core primitives, the ruler, the delta transform, the symbol table, the quadratic forms, the circuits, and the runtime.

## The Parts

- [[SRC-00a Protocol Review and Bug Fixes|Part 1]] (lines 1-12000)
- [[SRC-00b Protocol Review and Bug Fixes|Part 2]] (lines 12001-23606)

## Key Claims

- The protocol consists of exactly three operations: bind, apply, eval
- The ruler has 8 slots (2! + 3!)
- The delta function has exact period 8
- The 6T circuit is XNOR, not XOR (contradiction)
- The `pin` method always throws (bug)
- The `delta16` function is not exported (bug)
- The `switch` statement has fall-through cases (bug)
- The `PALINDROME` pattern is missing from G (bug)

## Key Definitions

- The ruler: `ruler[0]` through `ruler[7]`
- The delta: `delta16(x, c) = rotl16(x, 1) ^ rotl16(x, 3) ^ rotr16(x, 2) ^ c`
- The symbol table G: FRONT, BACK, INSIDE, OUTSIDE, UP, DOWN, LEFT, RIGHT, CENTER, CONSTRAINT, BOUNDARY, DEFLECT, REFLECT, INFLECT, AXIS, MNEMONIC
- The quadratic forms: affine (16x² + 16xy + 4y²) and projective (60x² + 16xy + 4y²)

## Key Numbers

- 2! + 3! = 8 (the ruler)
- 3! = 6 (the six operations)
- 2¹⁶ = 65536 (the Blob)
- 240 = 2 × 120 (the clock period)
- 5040 = 7! (the slide rule)

## Open Questions

- The period-8 vs period-240 relationship
- The `3! XOR 3! XOR 3! XOR 1!` expression
- The `beta + beta` question
- The Verilog `swap16` and `swap64` branches

## Cross-references

- [[SPEC-00 Canonical Statement]] — the canonical statement
- [[SPEC-10 The Primitive]] — the primitive
- [[SPEC-11 The Three Primitives]] — bind, apply, eval
- [[SPEC-12 The Ruler]] — the ruler
- [[SPEC-13 XOR Algebra]] — XOR algebra
- [[SPEC-14 Knots and Binds]] — knots and binds
- [[SPEC-15 The Delta Transform]] — the delta transform
- [[SPEC-16 The Fano Invariant]] — the Fano invariant
- [[SPEC-30 The Symbol Table G]] — the symbol table
- [[SPEC-31 Declaration Syntax]] — declaration syntax
- [[SPEC-33 The Quadratic Forms]] — the quadratic forms
- [[SPEC-40 The 6T XOR Circuit]] — the 6T circuit
- [[SPEC-41 The 8T XOR Circuit]] — the 8T circuit
- [[SPEC-42 Circuit Sourcemap]] — the sourcemap
- [[SPEC-43 Prime Gaps and Sextuplets]] — prime gaps
- [[SPEC-50 Stream Transport]] — stream transport
- [[SPEC-51 JSON Canvas Interchange]] — JSON canvas
- [[SPEC-52 The REPL and the Digest]] — the REPL
- [[SPEC-53 Clocks and Periods]] — clocks
- [[SPEC-54 The Web Platform Layers]] — web layers
- [[SPEC-55 ASCII Folds]] — ASCII folds
- [[SPEC-60 Test Vectors]] — test vectors
- [[SPEC-61 Implementation Status]] — implementation status
- [[OPEN-00 Contradiction Register]] — contradictions
- [[OPEN-01 Open Questions]] — open questions
- [[OPEN-02 Broken Code Inventory]] — broken code
- [[OPEN-04 Discarded Claims]] — discarded claims
