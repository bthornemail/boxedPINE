---
id: SPEC-65
title: "Hamming Code Delta and BOM Swap"
kind: spec
layer: verification
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[SPEC-62 Sexagesimal XOR Delineation]]"
  - "[[SPEC-64 Three Cubes]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/constants.ts"
dimensions: []
symbols: []
tags: [omi-imo, Hamming, delta, BOM, swap, byte-order, fold]
---

# Hamming Code Delta and BOM Swap

## Delta as a Hamming Code

```javascript
function delta(buf, C) {
    return xor(xor(xor(rotl(buf, 1), rotl(buf, 3)), rotr(buf, 2)), C);
}
```

Four operations: rotl 1, rotl 3, rotr 2, and XOR with C. That's a Hamming code — the three rotations are the parity checks of a Hamming code, and C is the syndrome.

Specifically: rotl 1 checks bit i against bit i-1; rotl 3 checks bit i against bit i-3; rotr 2 checks bit i against bit i+2. Three independent check functions. XOR'd together, they give the syndrome — the pattern of which checks failed.

That's exactly what a Hamming code does: three parity bits detect and localize a single error.

So delta is not "a rotation rule." It's a Hamming code step. The three rotations are the three parity checks, and C is the correction.

## Delta16 as the Fold

```javascript
function delta16(ruler) {
    const state = Buffer.from(ruler.subarray(0, 8));
    const C = Buffer.from(ruler.subarray(8, 16));
    const next = delta(state, C);
    ruler.set(next, 0);
    ruler.set(state, 8);
    return ruler;
}
```

The ruler is 16 bytes. The first 8 are the state. The second 8 are the correction C. And delta16:

1. Reads state (bytes 0-7)
2. Reads C (bytes 8-15)
3. Computes next = delta(state, C)
4. Writes next into bytes 0-7
5. Writes state into bytes 8-15
6. Returns the ruler

So the ruler is a 16-byte window, and delta16 shifts the window left by 8 while applying the Hamming code. The old state becomes the correction; the new state is the delta.

That's the 16/8 fold. The 16-byte ruler folds into an 8-byte subarray, and the subarray shifts forward.

## The Swap Permutation Instead of Compare-Exchange

The mutation isn't `Atomics.compareExchange`. It's a swap permutation against another full 16.

That is:

```
ruler_16     the current 16-byte window
BOM_16       another full 16-byte window
swap_perm    a permutation (swap16, swap32, swap64)
result       apply the swap permutation to ruler and BOM
```

And the swap is a BOM because it's a byte order mark. The BOM is the marker that says which endianness the 16 is in. And swapping the endianness is the permutation.

So:

```
swap16    permutes bytes 0-1, 2-3, 4-5, ...
swap32    permutes bytes 0-3, 4-7, 8-11, 12-15
swap64    permutes bytes 0-7, 8-15
```

Each swap is a byte order mark — it marks the byte order of the 16. And the mutation is applying the swap.

## Why This is the Blackboard

Because a swap permutation doesn't change the underlying 16. It changes the reading of the 16. Same bytes, different order.

So the mutation is:

```
read the 16 as little-endian    →  reading A
read the 16 as big-endian        →  reading B
the difference                   →  the swap
```

The bytes are the same. The reading differs. And the difference is the swap.

And the blackboard holds the reading. The bytes are the state; the reading is the blackboard. And the swap permutation moves the reading.

## The Two Prime Gap Squares

The two prime gaps are {2, 4} — the gaps in the sextuplet {5, 7, 11, 13, 17, 19} are 2, 4, 2, 4, 2. And the "two prime gap square distance" is:

```
4² = 16        the squared distance for gap 4
2² = 4         the squared distance for gap 2
```

And the lambda cube is:

```
even axes    {4, 6, 8}      the squared distances
odd axes     {3, 5, 7, 9}   the actual gaps
```

So the lambda cube measures the distance between the even square distances and the odd actual gaps. And that distance is the delta — the Hamming correction.

## The BOM as the Fold Marker

And the BOM — the byte order mark — is what marks the fold:

```
ruler[0..7]     state, in little-endian
ruler[8..15]    correction, in big-endian
```

Or the other way around. And the BOM says which.

And the swap permutation changes the BOM — it flips the byte order. So the mutation is:

```
read the ruler with the current BOM      →  state
swap to the other BOM                     →  new reading
read the ruler with the new BOM          →  new state
```

Same bytes. Different reading. And the difference is the swap.

## The Corrected Picture

```
OLD middle     {4,6,8} vs {3,5,7,9}      the lambda cube (canvas)
NEW middle     {3, 7, 11, 15}            the blackboard (state)

delta16        the Hamming-code step
swap16/32/64   the BOM permutation
ruler_16       the 16-byte window
BOM_16         the byte order mark
```

And the flow:

```
1. Read the ruler with the current BOM
2. Apply the delta (Hamming code)
3. Swap to the other BOM
4. Read the ruler with the new BOM
5. The difference is the reading
```

Same 16 bytes. Different reading. And the delta is the Hamming correction between them.
