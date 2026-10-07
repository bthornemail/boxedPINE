---
id: OPEN-03
title: "Glossary"
kind: open
layer: open
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-04 Discarded Claims]]"
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-21 The Inversion Law]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-24 Observers]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-35 Reflections and Orbits]]"
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
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, glossary, terminology, definitions]
---

# Glossary

Updated 2026-10-07 with the terms the open-question pass settled. Where a definition was corrected, the reason is linked.

## A

**Attempt** — The result of a try: either the tried value, or the caught deviation with its structured coordinate (position, expected, actual, difference). The difference is the repair, so a caught attempt is open for another try. A chain of attempts (a cochain of compare-exchanges) stops at the first catch. In `omi-files/omi-types`, module `OMI.Try`.

**apply** — The second primitive (slot 13, the 6T). It invokes a relation: `bind` with the correction half of the ruler set, then one delta step, so the relation drives onward. Categorically a Functor. Not yet implemented; see [[OPEN-01 Open Questions]] #6.

**Atomics.compareExchange** — The physical primitive. In one uninterrupted step it compares a slot with an expected value, swaps in the replacement if they match, and returns the old value. Those three parts are bind, apply and eval in one step.

## B

**β (beta)** — The observer unit: the constant 1 in XOR arithmetic. `NOT a = a ⊕ β`, and `β ⊕ β = 0`, so pairs of observer flips cancel. In the ±1 audio encoding β is multiplication by −1. Not `β + β`; see [[OPEN-00 Contradiction Register]] #7.

**bind** — The first primitive (slot 12, the 5T). Creates a knot, a bidirectional pair between two items. Categorically a Monad.

**blackboard** — Cube 2 of the 16-byte ruler. It holds the four-block family `{3, 7, 11, 15}` and stays fixed while Cubes 0 and 1 swap each cycle (rev1 Part XIII).

**Blob** — The 65,536-bit truth table, the minimum Boolean truth table for 16 binary choices. The −5D substrate. It is 8,192 bytes, exactly 128 buffers of 64 bytes. Every index in the protocol is an address in it, which is what makes it transportable.

**BOOT0 / BOOT1 / SECURE / USER** — The four pipeline outputs: the 5T collector node, the 6T collector, the 8T output and the 10T output. BOOT0 is XNOR as a voltage, shown as XOR by a sinking LED. BOOT1 is its inverse, which is XOR.

**BOUNDRY** — The type of the constraint result: either `[SPECTRAL, SPATIAL]` (the nested reading) or `COORDINATE` (the cube reading).

## C

**collapse** — The author's principle: just as Haskell collapses chains of types, treating everything as an index collapses logic that is not orthogonal into one structure.

**coordinate nibble** — A 4-bit index (0..15) into the first 16 indices of a buffer. `PLiteral` and `PStruct` positions are made of them, and sixteen fill the first 8 byte indices.

**COORDINATE** — The eight-slot cube reading. `[SPECTRAL, SPATIAL, SHAPE, SCALAR?]`.

**CONTINUUM** — The position array `[p: number, i: number, n: number]`.

**CONSTRAINT** — The function `(spectrum: TIME, space: SPACE | CONTINUUM) => BOUNDRY`.

## D

**delta** — The step law. Current form: `swap16(x) ⊕ swap32(x) ⊕ swap64(x) ⊕ c`, a permutation law with period 4. Earlier form: `delta16(x, c) = rotl16(x, 1) ^ rotl16(x, 3) ^ rotr16(x, 2) ^ c` on 16-bit words. Its period is exactly 8: proved in Coq in `omi-axioms`, and every orbit length divides 8. Rotating the 8 *bytes* instead is the block reading, with period 4. That is intended: one step per 64-value quarter of the byte ([[OPEN-00 Contradiction Register]] #46).

**distinguished triples** — The 7, 35, 155 and 651 triples of the octonions, sedenions, trigintaduonions and 64-ions. They are exactly the XOR-closed triples `{a, b, a ⊕ b}` of non-zero 3-, 4-, 5- and 6-bit indices (the lines of binary projective space; the 7 are the Fano plane). All 155 listed in `_archive/animation.frame.ts` satisfy `a ⊕ b = c`.

**diagonal** — Ruler slot 0, the XOR of the six spatial slots. As an index, `12 = 0b1100`: 60's wordform at 4 bits, the start of the last 4-slot block of 16.

**digest** — The fourth primitive (slot 15, the 10T). Folds the relations; computes the generalized F-mean of the ruler. The read-eval-print loop.

## E

**eval** — The third primitive (slot 14, the 8T). Reads a knot as a value descriptor, extracting its materialized meaning. Categorically a Comonad.

## F

**Exponent / Exception** — The two halves of a buffer that trade roles each cycle (Cube 0 and Cube 1). The targets of the exchange in `compareExchange(buffer64, 60, 60, Exponent | Exception)`.

**F-mean** — The generalized mean `M_p(x_1, ..., x_n) = ( (1/n) Σ x_i^p )^(1/p)`. The mean order p is determined by the observer's position.

**Fano plane** — The 7-point projective plane over GF(2). The minimal structure in which every pair of points lies on exactly one line.

**four-block family** — The bases `{3, 7, 11, 15} = 3 ⊕ {0, 4, 8, 12}`: 3 XORed with each subset of the diagonal's bits. See [[OPEN-01 Open Questions]] #10.

## G

**G** — The regex-constrained vocabulary: the symbol table that defines the admissible tokens. Frozen in `_archive/index.ts`; mutable (a `Map`) in the self-generating kernel.

**generation** — The self-generating kernel's counter of how many rules it has learned.

## H

**Hamming sphere** — The set of values at a fixed number of differing bits from a centre. The XOR orbit of any 4-bit value splits into spheres of sizes 1, 4, 6, 4, 1; 5 and 10 are antipodes.

**Homoiconic** — Code is data. The knot is both a program and a value.

## I

**index (vs value)** — The protocol's supreme notion (`_archive/The Supreme Notion Indices, Not Value.md`): every quantity is a position, never a magnitude. Indices combine by XOR, walk and compare. They are never added or multiplied. "Negative" means the complement `i ^ (2ⁿ − 1)`.

**iExtant** — The extant-state record. It carries the Exponent and Exception that an exchange swaps in. As a torus it has coordinates (scope, shape) (rev1 Part X).

**iff** — The base equivalence. `position(n) ⟺ period(n−1, n, n+1)`. The position holds iff the period holds.

## K

**knot** — A bidirectional pair between two items. `knot[a] = b ⟺ knot[b] = a`.

## L

**learn** — The kernel operation that adds a new pattern to the grammar and increments the generation. Working code: [[OPEN-01 Open Questions]] #8.

**logical loop** — The orbit of a base under XOR with n = 0..15: a cycle of length 16 that exists because XOR is an involution.

## M

**mnemonic** — The word frame: the human-readable label for a position.

## O

**observer** — Any circulator capable of reflecting swap rotations. A perceptron. In the virtual breadboard, an `AnalyserNode` reading a net.

**orbit** — The sequence `c ^ n` for `n = 0..15`. A cycle of length 16.

## P

**period hierarchy** — 8 (delta unit cell) | 240 (time crystal) | 5040 (supercell, 7!). Each divides the next.

**pinch** — The 0-sphere: two points.

## R

**regenerate** — Rebuilds a kernel from its description by replaying the learned rules. Positions are not replayed.

**RULER** — The function `(boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE, COORDINATE]`.

**RULE** — The function `(boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE]`.

## S

**SCALAR** — The reading `[e: FRONT | BACK, d: UP | DOWN, n: LEFT | RIGHT]`.

**SHAPE** — The eight-slot cube reading `[POINT, INDEX, FRONT, BACK, UP, DOWN, LEFT, RIGHT]`.

**sink / source** — LED polarity. A sinking LED lights when its node is low; a sourcing LED lights when its node is high.

**SPACE** — The position array `[b: number, o: number, x: number]`.

**SPECTRAL** — The reading `[p: number, i: number]`.

**SPATIAL** — The reading `[b: number, o: number, x: number, e: number, d: number, n: number]`.

**STRUCT** — The full wordform `${number}${'e' | '.'}${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'}`.

**swap16 / swap32 / swap64** — Byte reversal inside each 2-, 4- or 8-byte group. On 8 bytes they move index `j` to `j ⊕ 1`, `j ⊕ 3` and `j ⊕ 7`: XOR, XOR, and XNOR (complement) on the position. They replace the delta's rotations and must be applied to a copy (permutation, not mutation); Node's `Buffer.swapN` mutates in place. By convention they pair with bind, apply and eval ([[OPEN-01 Open Questions]] #12). See [[OPEN-00 Contradiction Register]] #48.

## T

**TIME** — The position array `[e: number, d: number]`.

**tri-state buffer** — A bus driver whose output is high, low or disconnected. The source's "tri-site" was a typo for this.
