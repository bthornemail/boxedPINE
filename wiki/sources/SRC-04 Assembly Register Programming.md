---
id: SRC-04
title: "Assembly Register Programming"
kind: source
layer: sources
status: canonical
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[SRC-99 Source Index]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-52 The REPL and the Digest]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, assembly, registers, machine-code, origin]
---

# Assembly Register Programming

## Summary

This is a 1820-page DeepSeek conversation transcript about assembly register programming. It is the apparent origin of OMI-IMO — it starts as an x86-64 tutorial, then pivots to the regex grammar G, the cube movement grammar, the two quadratic forms, the delta law, and the final bind/apply/eval spec.

## The Parts

- [[SRC-04a Assembly Register Programming|Part 1]] (lines 1-20000)
- [[SRC-04b Assembly Register Programming|Part 2]] (lines 20001-end)

## Key Claims

- This thread is the apparent origin of OMI-IMO
- It starts as an x86-64 tutorial, then pivots to the regex grammar G
- The cube movement grammar is defined
- The two quadratic forms are defined (Δ=0 affine vs Δ=−704 projective)
- The delta law and prime 73/5040 slide rule are defined
- The observed `calc` trace shows `64^k` periods
- The final `bind`/`apply`/`eval` spec is defined

## Key Definitions

- The regex grammar G: FRONT, BACK, INSIDE, OUTSIDE, UP, DOWN, LEFT, RIGHT, CENTER, CONSTRAINT, BOUNDARY, DEFLECT, REFLECT, INFLECT, AXIS, MNEMONIC
- The cube movement grammar: the six operations (top, bottom, right, left, forward, backward)
- The two quadratic forms: affine (16x² + 16xy + 4y²) and projective (60x² + 16xy + 4y²)
- The delta law: `delta16(x, c) = rotl16(x, 1) ^ rotl16(x, 3) ^ rotr16(x, 2) ^ c`
- The primitive signatures: bind, apply, eval

## Key Numbers

- 73 (the prime in the delta law)
- 5040 = 7! (the slide rule)
- 64^k (the observed periods in the calc trace)
- 16 (the ruler size)
- 8 (the delta period)

## Broken Items

- Undefined `G.PALINDROME`
- `linear % 0 = NaN`
- `xor` length mismatch
- The `isRight` arity mismatch

## Cross-references

- [[SPEC-10 The Primitive]] — the primitive
- [[SPEC-11 The Three Primitives]] — bind, apply, eval
- [[SPEC-12 The Ruler]] — the ruler
- [[SPEC-13 XOR Algebra]] — XOR algebra
- [[SPEC-15 The Delta Transform]] — the delta transform
- [[SPEC-30 The Symbol Table G]] — the symbol table
- [[SPEC-31 Declaration Syntax]] — declaration syntax
- [[SPEC-33 The Quadratic Forms]] — the quadratic forms
- [[SPEC-52 The REPL and the Digest]] — the REPL
- [[OPEN-02 Broken Code Inventory]] — broken code
