---
id: SRC-03
title: "Protocol Sequence Analysis"
kind: source
layer: sources
status: canonical
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[SRC-99 Source Index]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-35 Reflections and Orbits]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-55 ASCII Folds]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, sequence, orbits, generator, analysis]
---

# Protocol Sequence Analysis

## Summary

This is a 2218-page DeepSeek conversation transcript about protocol sequence analysis. It covers the XOR orbit, the four-block family, the generator, the quadratic forms, the delta transform, the Fano plane, and the protocol handler.

## The Parts

- [[SRC-03a Protocol Sequence Analysis|Part 1]] (lines 1-31500)
- [[SRC-03b Protocol Sequence Analysis|Part 2]] (lines 31501-63000)
- [[SRC-03c Protocol Sequence Analysis|Part 3]] (lines 63001-94500)
- [[SRC-03d Protocol Sequence Analysis|Part 4]] (lines 94501-125453)

## Key Claims

- The orbit table has 16 rows (one per base 0x0-0xF) plus base 19 for the 5-bit case
- The four-block family is {3, 7, 11, 15} — the bases with bits 0 and 1 set
- Base 7 is the fulcrum — the only one whose first half is 7→0 and second half is 15→8
- Base 19 is the orbital base — fully orthogonal to the diagonal 12 = 01100
- The generator is {0,2,1}{3,7,11,15}{17,19} — arities 3:4:2, sum 9, product 24 = 4!
- The compare-exchange is the deviation detector; the deviation is the swap selection
- The protocol handler is built from Regex + Proxy + Reflect
- The kernel is self-generating via the closure scope chain

## Key Definitions

- The orbit: the sequence `c ^ n` for `n = 0..15`
- The four-block family: {3, 7, 11, 15} — bases with bits 0 and 1 set
- The fulcrum: base 7 — the only one that splits the space into two clean halves
- The orbital base: base 19 — fully orthogonal to the diagonal
- The generator: {0,2,1}{3,7,11,15}{17,19}
- The protocol handler: Regex (constraint) + Proxy (trap) + Reflect (operation)
- The self-generating kernel: mutable grammar + closure scope chain + learn method

## Key Numbers

- 16 (the orbit length)
- 4 (the four-block family size)
- 3:4:2 (the generator arities)
- 9 (the generator sum)
- 24 = 4! (the generator product)
- 12 = 01100 (the diagonal)
- 19 = 10011 (the orbital base)

## Open Questions

- The period-8 vs period-240 relationship
- The `3! XOR 3! XOR 3! XOR 1!` expression
- The `beta + beta` question
- The Verilog `swap16` and `swap64` branches
- The missing bibliography for inline markers [1]-[14]

## Cross-references

- [[SPEC-13 XOR Algebra]] — XOR algebra
- [[SPEC-15 The Delta Transform]] — the delta transform
- [[SPEC-16 The Fano Invariant]] — the Fano invariant
- [[SPEC-33 The Quadratic Forms]] — the quadratic forms
- [[SPEC-35 Reflections and Orbits]] — reflections and orbits
- [[SPEC-43 Prime Gaps and Sextuplets]] — prime gaps
- [[SPEC-53 Clocks and Periods]] — clocks
- [[SPEC-55 ASCII Folds]] — ASCII folds
- [[OPEN-00 Contradiction Register]] — contradictions
- [[OPEN-01 Open Questions]] — open questions
- [[OPEN-02 Broken Code Inventory]] — broken code
