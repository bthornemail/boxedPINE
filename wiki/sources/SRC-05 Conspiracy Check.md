---
id: SRC-05
title: "Conspiracy Check"
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
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
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
tags: [omi-imo, source, deepseek, verification, audit, conspiracy]
---

# Conspiracy Check

## Summary

This is a 1071-page DeepSeek conversation transcript about checking whether the OMI-IMO protocol's claims hold up. It covers the source-map spec, try/catch/finally semantics, escape() privileged set, Möbius/Mertens arithmetic, ASCII control codes, Braille/Unicode bit-packing, IEEE-754 patterns, and the OMI-IMO Protocol proposals.

## The Parts

- [[SRC-05a Conspiracy Check|Part 1]] (lines 1-27600)
- [[SRC-05b Conspiracy Check|Part 2]] (lines 27601-55119)

## Key Claims

- Real, verifiable content: source-map "unambiguous linking" spec text, try/catch/finally block semantics, escape() privileged set and its bitwise-NaN→0 coercion, Möbius/Mertens arithmetic (M(10) = -1), ASCII control codes, Braille/Unicode bit-packing, IEEE-754 patterns
- The OMI-IMO Protocol proposals: four primitives (BIND/APPLY/EVAL/DIGEST), Atomics.compareExchange, knot/fold/unfold, Octtrie, −5D→10D pipeline, C reference + tests, LISP 1.5/Meta-Lisp
- Many contradictions found (see below)

## Key Contradictions

- `0x19` conflated with ASCII 19 (25 vs 19)
- `240` claimed as LCM(1..6) (actual 60)
- `0/0=1` / `0%0=1` (actual NaN)
- "BigInt NaN" (not a thing)
- `73^43=114` (actual 98)
- Klein config "16 vertices" (actual 21)
- The missing `"z"`
- `HTML 1.1` control plane (doesn't exist)
- `0xBA` bash history (not a thing)
- `n=6, n²=64` (should be `2⁶`)
- `0.0014 = 0x0d` (actual 13)
- "prime ladder" including 9 (not prime)
- `AND = a^(a^b)^b` (=0)
- LISP `bind=cons` contradicting the claimed REPL output
- Octtrie 7-bit aliasing vs "alias-free" 16-bit claim
- The `rotl` "3C magic word" opening any Apache server (unsupported)

## Verified Arithmetic

- Discriminant `16² − 4·60·4 = −704` ✓
- `0xaa55` bit-palindrome ✓
- `13^13=0` ✓
- `OR = a^b^(a&b)` ✓

## Cross-references

- [[OPEN-00 Contradiction Register]] — all contradictions
- [[OPEN-04 Discarded Claims]] — all discarded claims
- [[SPEC-61 Implementation Status]] — implementation status
- [[META-02 Evidence and Confidence]] — evidence and confidence
