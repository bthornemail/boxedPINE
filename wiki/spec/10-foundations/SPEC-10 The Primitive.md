---
id: SPEC-10
title: "The Primitive: Atomics.compareExchange"
kind: spec
layer: foundations
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down:
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
related:
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-52 The REPL and the Digest]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/model.ts"
  - "rosetta/src/bind.offset.ts"
  - "rosetta/src/constants.ts"
dimensions: []
symbols: []
tags: [omi-imo, primitive, compareExchange, atomics]
---

# The Primitive: Atomics.compareExchange

## Definition

```typescript
Atomics.compareExchange(typedArray, index, expectedValue, replacementValue)
```

Returns the old value at `typedArray[index]`. If the old value equals `expectedValue`, writes `replacementValue`. Otherwise writes nothing. Either way, returns the old value.

## The Three Phases

In one uninterrupted atomic step, it:

| Phase | Action |
|-------|--------|
| bind | binds the relation between expected and replacement |
| apply | applys the comparison and conditional swap |
| eval | evals the old value |

There is no gap between these three phases. The physical operation is the logical operation. The hardware implements the protocol natively.

## The Four Permutations

The four atomic operations on three indices:

```
{0, 2, 1}         →     swap 2 and 1
{2, 1, 0}         →     reverse
{1, 0, 2}         →     cycle
{0, 1, 2}         →     identity
```

Four permutations. Four atomic operations.

The extremes:

```
012   →   forward (identity)
210   →   reverse
```

## The Swap Selection

The compare-exchange is the deviation detector, and the deviation is the swap selection.

Each of the three swaps (`swap16`, `swap32`, `swap64`) has a different signature — a different set of indices that change:

```
swap16    indices (1, 0, 3, 2, 5, 4, ...) change
swap32    indices (3, 2, 1, 0, 7, 6, 5, 4, ...) change
swap64    indices (7, 6, 5, 4, 3, 2, 1, 0, ...) change
```

The compare-exchange reads the difference between the buffer and its swap-applied version. The difference's signature is which swap is active.

Because the three swaps pair with the three readings:

```
swap16    bind       small slice
swap32    apply      medium slice
swap64    eval       large slice
```

The compare-exchange is simultaneously the read, the selection, and the conditional write, with the deviation selecting which of the three swaps — and thus which of the three readings — is the active one.

## The Deviation

```typescript
function compareExchange(handler, position, expected, replacement) {
  const actual = handler[position];
  if (actual === expected) {
    handler[position] = replacement;
    return { matched: true, now: replacement, difference: 0 };
  }
  return { matched: false, now: actual, difference: (expected ^ actual) >>> 0 };
}
```

The difference is the XOR of expected and actual. It is the deviation. The deviation's signature is the swap selection.

## The Structural Coherence Gate

From `rosetta/src/bind.offset.ts`:

```typescript
const coherence = Atomics.compareExchange(metric, 0, 2, 1) ^
    Atomics.compareExchange(metric, 1, 0, 2) ^
    Atomics.compareExchange(metric, 2, 1, 0);

if (coherence === undefined || coherence === 0) {
    return new ArrayBuffer(2); // Safe zero-polynomial invariant exit
}
```

The 3! atomic coherence validation check. If the structural check fails, immediately output a safe, zero-polynomial coordinate view so the system avoids a hard crash and can instantly continue processing downstream compliant folding tasks.

## The Backplane Lambda Cube

```typescript
const delta = new Int16Array(metric.buffer, metric.byteOffset);
const omi = new Int16Array(metric.buffer, metric.byteOffset + (delta.length * 2));
const meta = metric[0];

const lambdaCube = meta ^
    // The Even Axis Loop (Stable Structural Base Core: 4, 6, 8)
    Atomics.compareExchange(delta, 4, 8, 6) ^
    Atomics.compareExchange(delta, 6, 4, 8) ^
    Atomics.compareExchange(delta, 8, 6, 4) ^
    // The Odd Axis Loop (Prime Group Resonant Grid: 5, 7, 9)
    Atomics.compareExchange(omi, 5, 9, 7) ^
    Atomics.compareExchange(omi, 7, 5, 9) ^
    Atomics.compareExchange(omi, 9, 7, 5);
```

The logic/lambda cube using the 4-6-8 even core vs 5-7-9 prime residue dimensions. This measures the spatial envelope trapped between the (two prime gap)³ boundaries.

## The Projective Reduction

```typescript
const x = lambdaCube;
const y = coherence;

// Explicit 11-variant splitting of the 60x² + 16xy + 4y² form:
// 4 * (11*x*x + 4*x*x + 4*x*y + y*y)
const projectiveForm = 4 * ((11 * x * x) + (4 * x * x) + (4 * x * y) + (y * y));

const deltaAnchor = Atomics.compareExchange(delta, 17, 17, projectiveForm);
const omiAnchor = Atomics.compareExchange(omi, 17, 19, projectiveForm);

return new ArrayBuffer(
    metric.buffer,
    delta.byteOffset + (17 * 8),
    2
);
```

The invariant projection using the 11x² splitting variant. This safely isolates the missing 7-valued projective discriminant. 24^11 (1521681143169024) drives the 240MHz / 44100Hz / 60fps clock reduction.

## The O(1) Resolution

The projection is atomic, so the resolution is constant-time. The algebraic limit: the 64-ions are non-associative. The algebraic context is limited to Cartesian rendering. The spatial enumeration is limited to the 16x² affine data.

## The Closure

The closure is reachability. The fixed attractor is 0. The trajectory is deterministic backward and searchable forward.

```
∂(b) = 0000
```

The XOR closure. When the deviation across all positions is zero, the frame is set.
