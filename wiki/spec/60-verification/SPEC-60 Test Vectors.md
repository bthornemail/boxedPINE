---
id: SPEC-60
title: "Conformance Test Vectors"
kind: spec
layer: verification
status: draft
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[SPEC-61 Implementation Status]]"
related:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-35 Reflections and Orbits]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, conformance, test-vectors, verification]
---

# Conformance Test Vectors

## The Five Conformance Tests

A conforming implementation MUST:

1. Provide `bind`, `apply`, and `eval` with the correct signatures
2. Preserve bind symmetry
3. Preserve the two readings of eval
4. Adhere to the operational laws
5. Keep substrates orthogonal

A conforming implementation MUST NOT:

1. Introduce new operations at the protocol layer
2. Override the primitives' laws
3. Allow substrate extensions to alter the primitives' behavior
4. Mutate trace log entries

## Test Vector 1: Bind Symmetry

```
knot[a] = b      ⟺    knot[b] = a
```

**Input:** Two items `a` and `b`.
**Expected:** `bind(a, b)` produces a knot where `knot[a] = b` and `knot[b] = a`.
**Pass condition:** Both directions hold.

## Test Vector 2: The Ruler

```
ruler[0]    →   diagonal      (the origin, XOR of all six)
ruler[1]    →   size          (the unit count, base 1)
ruler[2]    →   top
ruler[3]    →   bottom
ruler[4]    →   right
ruler[5]    →   left
ruler[6]    →   forward
ruler[7]    →   backward
```

**Input:** A 16-byte buffer.
**Expected:** The ruler is 2! + 3! = 8 slots long.
**Pass condition:** The ruler has 8 slots with the correct names and roles.

## Test Vector 3: The Delta Period

```
delta^8 = identity
```

**Input:** Any 8-byte state and 8-byte constant.
**Expected:** Applying delta 8 times returns the original state.
**Pass condition:** `delta^8(state, C) = state`.

## Test Vector 4: The XOR Orbit

```
0x0005 ^ n for n = 0..15
```

**Expected:**

```
5  4  7  6  1  0  3  2  13  12  15  14  9  8  11  10
```

**Pass condition:** The orbit visits all 16 values in the specified order.

## Test Vector 5: The Four-Block Family

```
base 3:   3 2 1 0 | 7 6 5 4 | 11 10 9 8 | 15 14 13 12
base 7:   7 6 5 4 | 3 2 1 0 | 15 14 13 12 | 11 10 9 8
base 11:  11 10 9 8 | 15 14 13 12 | 3 2 1 0 | 7 6 5 4
base 15:  15 14 13 12 | 11 10 9 8 | 7 6 5 4 | 3 2 1 0
```

**Pass condition:** All four bases produce four descending runs of four.

## Test Vector 6: The Orbital Base

```
base 19:  19 18 17 16 | 23 22 21 20 | 27 26 25 24 | 31 30 29 28
```

**Pass condition:** Base 19 produces the cleanest walk — four descending runs of four, in ascending block order.

## Test Vector 7: The Quadratic Forms

```
Affine:        16x² + 16xy + 4y² = (4x + 2y)²        Δ = 0
Projective:    60x² + 16xy + 4y²                     Δ = −704
```

**Pass condition:** The affine form factors into a perfect square. The projective form has discriminant −704.

## Test Vector 8: The Schläfli Families

```
{2,n}:{n,2}         →   constant 2
{2,4}:{4,2}         →   constant 4
{3,5}:{5,3}         →   constant φ → 60
```

**Pass condition:** The three families produce the constants 2, 4, and 60.

## Test Vector 9: The Generator

```
{0, 2, 1}          the 3-cycle
{3, 7, 11, 15}     the four-block family
{17, 19}           the 5-bit pair
```

**Pass condition:** The generator's arities are 3 : 4 : 2. Sum = 9. Product = 24 = 4!.

## Test Vector 10: The Closure

```
∂(b) = 0000
```

**Pass condition:** The XOR closure of all positions is zero when the frame is set.
