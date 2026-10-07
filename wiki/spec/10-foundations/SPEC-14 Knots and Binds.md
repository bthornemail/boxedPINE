---
id: SPEC-14
title: "Knots and Homoiconic Binds"
kind: spec
layer: foundations
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-10 The Primitive]]"
down: []
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-25 The Iff]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code:
  - "rosetta/src/model.ts"
dimensions: []
symbols: []
tags: [omi-imo, knots, binds, homoiconic, code-as-data]
---

# Knots and Homoiconic Binds

## Definition

A knot is a bidirectional pair between two items:

```
knot[a] = b      ⟺    knot[b] = a
```

The symmetry is the defining property. A knot is not a pointer — it is a relation. Both directions are equally real.

## The Knot Record

From `rosetta/src/model.ts`:

```typescript
export class Node {
    knot: Record<string, string> = {};
    bind(rule: Buffer = Buffer.allocUnsafe(8).fill(0), ruler: Buffer = Buffer.allocUnsafe(8).fill(0)) {
        const rulerKey = ruler.toString('hex');
        const ruleKey = rule.toString('hex');
        this.knot[rulerKey] = ruleKey;
        this.knot[ruleKey] = rulerKey;
        return this.knot;
    };
}
```

The knot is a `Record<string, string>` — a bidirectional map between hex-encoded buffers. The `bind` method creates the knot by writing both directions.

## Homoiconicity

The protocol is homoiconic: code is data. The knot is both a program and a value. The same structure that describes a computation is the computation.

How far the code has got toward this is tracked in [[PROG-00 Homoiconic Syntax Tracker]].

```
nature: Homoiconic Symmetrical Binds (Code-as-Data)
```

The canonical laws:

```
The graph is the structure.
The stream is the transport.
The canvas is the interoperability.
The sourcemap is the physical trace.
OMI-Lisp is the executable notation.
```

## The Bind as Monad

`bind` is the monadic operation. It composes relations. Given two knots, `bind` produces a new knot that relates them.

The bind is the composition operator of the protocol. It is how complex structures are built from simple ones.

## The Symmetry

The symmetry of the knot is the key property:

```
knot[a] = b      ⟺    knot[b] = a
```

This means the knot is its own inverse. Applying the bind twice returns to the start:

```
bind(bind(a, b), b) = a
```

The bind is an involution, like XOR.

## The Knot and the Orbit

The knot is the static structure. The orbit is the dynamic structure. The knot is the relation; the orbit is the walk through the relation.

```
knot     — the relation (static)
orbit    — the walk (dynamic)
```

The knot is the blackboard. The orbit is the traversal of the blackboard.

## The Knot and the Ruler

The ruler is the state that the knot operates on. The knot relates two rulers. The bind creates a knot between a rule and a ruler.

```
knot[rulerKey] = ruleKey
knot[ruleKey] = rulerKey
```

The ruler is the named k-tuple. The rule is the operation. The knot relates them.

## The Knot and the Delta

The delta transform is the operation that walks the ruler. The knot is the structure that the delta operates on.

```
knot     — the structure
delta    — the operation
orbit    — the result
```

The delta is the fold over the knot. The orbit is the result of the fold.

## The Knot and the Fano

The Fano plane is the 7-point projective plane. The knot is the 2-point relation. The Fano plane is the completion of the knot.

```
knot     — 2 points
Fano     — 7 points (the completion)
```

The Fano plane is the minimal structure in which every pair of points is on a line. The knot is the minimal structure in which two items are related.

## The Knot and the Blob

The Blob is the 65536-bit truth table. The knot is the 2-bit relation. The Blob is the completion of the knot.

```
knot     — 2 bits
Blob     — 65536 bits (the completion)
```

The Blob is the minimal boolean truth table for 16 binary choices. It is derived from a 16-bit buffer by recursive folding of an 8-bit subarray using central inversion and snubbed truncation.

## The Knot and the Observer

The observer is any circulator capable of reflecting swap rotations. The knot is the structure that the observer reads.

```
observer     — the circulator
knot         — the structure
reading      — the result
```

The observer reads the knot. The reading is the materialized meaning.
