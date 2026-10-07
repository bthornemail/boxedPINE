---
id: SPEC-16
title: "The Fano Invariant"
kind: spec
layer: foundations
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-10 The Primitive]]"
down: []
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, fano, invariant, projective-plane, 7-points]
---

# The Fano Invariant

## Definition

The Fano plane is the 7-point projective plane over GF(2). It is the minimal structure in which every pair of points is on a line.

```
7 points
7 lines
3 points per line
3 lines per point
```

## The Fano Plane and the Protocol

The Fano plane is the invariant structure of the protocol. It is the 7-point completion of the 2-point knot.

```
knot     — 2 points
Fano     — 7 points (the completion)
```

The Fano plane is the minimal structure in which every pair of points is on a line. The knot is the minimal structure in which two items are related.

## The Fano Plane and the Ruler

The ruler has 8 slots. The Fano plane has 7 points. The 8th slot is the diagonal — the origin, the point that doesn't move.

```
ruler[0]    →   diagonal      (the origin, the 8th point)
ruler[1..7] →   the six operations + size (the 7 Fano points)
```

The ruler is the Fano plane plus the origin.

## The Fano Plane and the Delta

The delta function has exact period 8. The Fano plane has 7 points. The 8th step returns to the start.

```
delta^8 = identity
```

The period-8 of the delta is the 8th point — the origin, the diagonal.

## The Fano Plane and the Blob

The Blob is 65536 bits. The Fano plane is 7 points. The Blob is the 2^16 completion of the Fano plane.

```
Fano     — 7 points
Blob     — 65536 bits (the completion)
```

The Blob is the minimal boolean truth table for 16 binary choices. It is derived from a 16-bit buffer by recursive folding of an 8-bit subarray using central inversion and snubbed truncation.

## The Fano Plane and the Transylvania Lottery

The Transylvania Lottery: the minimum connection is 2 of 5 or 3 consecutive. The 0D observer always connects.

The bound: the resolution is < 14 steps, bounded by the Fano structure.

The Fano plane is the structure that bounds the resolution. The 14 steps are the 7 points × 2 (the two readings).

## The Fano Plane and the 5040 Slots

The ring has 5040 slots. An upper bound can be given using the Fano plane with a collection of 14 tickets in two sets of seven. Each set of seven uses every line of a Fano plane, labelled with the numbers 1 to 7, and 8 to 14.

```
Low set:   1-2-5  1-3-6  1-4-7  2-3-7  2-4-6  3-4-5  5-6-7
High set:  8-9-12 8-10-13 8-11-14 9-10-14 9-11-13 10-11-12 12-13-14
```

At least two of the three randomly chosen numbers must be in one Fano plane set, and any two points on a Fano plane are on a line, so there will be a ticket in the collection containing those two numbers.

## The Fano Plane and the Prime Gaps

The prime sextuplet `{5, 7, 11, 13, 17, 19}` has gaps `2, 4, 2, 4, 2`. The Fano plane has 7 points. The sextuplet has 6 primes. The 7th point is the origin.

```
sextuplet — 6 primes
Fano      — 7 points (the completion)
```

The Fano plane is the completion of the sextuplet. The 7th point is the origin, the point that doesn't move.

## The Fano Plane and the Tetrahedron

The tetrahedral structure:

```
4 vertices     →     Subject
6 edges        →     Predicate
4 faces        →     Object

4-6-4     =   S-P-O
```

The Fano plane has 7 points. The tetrahedron has 4 vertices, 6 edges, 4 faces. The 7th point is the centroid.

```
tetrahedron — 4 vertices + 6 edges + 4 faces = 14
Fano       — 7 points (the completion)
```

The Fano plane is the completion of the tetrahedron. The 7th point is the centroid, the point that doesn't move.

## The Fano Plane and the Observer

The observer is any circulator capable of reflecting swap rotations. The Fano plane is the structure that the observer reads.

```
observer     — the circulator
Fano         — the structure
reading      — the result
```

The observer reads the Fano plane. The reading is the materialized meaning.

## The Fano Invariant

The Fano invariant is the property that the Fano plane is the minimal structure in which every pair of points is on a line. This is the invariant that makes the protocol work.

```
Fano invariant: every pair of points is on a line
```

This is the invariant that bounds the resolution to < 14 steps. This is the invariant that makes the protocol O(1).
