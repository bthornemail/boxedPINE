---
id: SPEC-01
title: "The Three Laws"
kind: spec
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down: []
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-25 The Iff]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, laws, axioms]
---

# The Three Laws

## First Law — The Primitive Law

> All operations reduce to `Atomics.compareExchange`.

The physical primitive. In one uninterrupted step, it:

- binds the relation between expected and replacement
- applys the comparison and conditional swap
- evals the old value

There is no gap between these three phases. The physical operation is the logical operation. The hardware implements the protocol natively.

From this single operation, everything else derives.

## Second Law — The Invariant Law

> All structure derives from the 3! ordering of `{byteLength, byteOffset, BYTES_PER_ELEMENT}`.

Six relations. Six orthogonal axes. Six ways to read any buffer.

The only free parameter is bit length (8, 16, 32, 64). Everything else — the ruler, the observer, the clocks, the geometry — is a consequence.

The ruler has eight slots:

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

The ruler is 2! + 3! = 8 slots long:

```
2! = indices 0, 1 = {diagonal, size} = the frame
3! = indices 2..7 = the six operations = the content
```

## Third Law — The Closure Law

> All computation converges to the fixed attractor 0, because the trajectory is deterministic backward and searchable forward.

The closure is reachability. The fixed attractor is 0. The trajectory is deterministic backward (back-propagation is linear, O(n)) and searchable forward (propagation is cubic, O(n³)).

The protocol optimizes for backward. Linear convergence is what makes it practical.

## The Relationship Between the Laws

The First Law gives the operation. The Second Law gives the structure. The Third Law gives the behavior.

```
First Law    →   the primitive (compareExchange)
Second Law   →   the invariant (3! ordering)
Third Law    →   the closure (attractor 0)
```

Every part connects to every other. Every question returns to the primitive. Every primitive expands to the full structure.

The standard model is complete.
