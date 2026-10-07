---
id: SPEC-43
title: "Prime Gaps and Sextuplets"
kind: spec
layer: hardware
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-40 The 6T XOR Circuit]]"
down: []
related:
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, primes, sextuplet, gaps, generator, pseudo-generator]
---

# Prime Gaps and Sextuplets

## The Prime Sextuplet

```
{5, 7, 11, 13, 17, 19}
```

The path:

```
2, 4, 0, 4, 2
```

The gaps are 2, 4, 2, 4, 2 — the alternating pattern.

## The Two Principles

```
Prime gap measurements:       magnitude, type
Prime groups:                 residue classes {1, 3, 7, 9} mod 10
```

## Prime vs Composite

```
Prime           →   atomic operations (bitwise)
Composite       →   structured operations (logic)
```

## The Trace

The trace is the linear sum of two gap prime groups XORing to zero on tetrahedral diagonals.

## The Pseudo-Generator

The pseudo-generator is the sexy prime sextuplet:

```
{5, 7, 11, 13, 17, 19}
```

This is the generator. And it generates the rest of the structure:

- The gaps are 2, 4, 2, 4, 2 — the alternating pattern
- The 5 is exceptional (it divides 210)
- The non-exceptional sextuplets follow 210n + {97, 101, 103, 107, 109, 113}

But the generator is pseudo because it doesn't close. It generates more generators. The 210p + n generates new sextuplets. Those sextuplets generate new sextuplets. Infinitely.

This is the monoidal structure: composition without closure.

## The 5 and 13

From the transcripts:

```
5   = 0101    bits 0, 2       not in {3,7,11,15} (needs bit 1)
13  = 1101    bits 0, 2, 3    not in {3,7,11,15} (needs bit 1)
```

So 5 and 13 are outside the four-block family. Not because they're not prime, but because they don't have the structural bits that define the groups.

The generator is structural, not arithmetic. It's defined by which bits are set, not by primality. The primes that happen to fall in the groups are incidental; the primes that don't are not part of the structure.

## The Generator

```
{0, 2, 1}          the 3-cycle
{3, 7, 11, 15}     the four-block family
{17, 19}           the 5-bit pair
```

And the structure is:

```
compareExchange    the one operation
    ↓
the generator      three groups of indices
    ↓
the orbit          the walk through the indices
    ↓
the closure        ∂(b) = 0000
```

## The Three Arities

```
3    the binding cycle       0, 2, 1
4    the middle family       3, 7, 11, 15
2    the evaluation pair     17, 19
```

And 3 : 4 : 2 is the shape. Three, four, two. And the sum is 3 + 4 + 2 = 9.

And 9 is 3². So the generator's total is the square of the binding arity.

Or: 3 × 4 × 2 = 24, which is 4!. So the product of the arities is the number of permutations of four elements.

## The Generator and the Block

```
4 radices            0x, 0b, 0o, 0d
6 edges              the six relations
4 faces              the four triples
1 centroid           0p, 0i, 0n
```

And the generator:

```
3    0, 2, 1         the binding cycle
4    3, 7, 11, 15    the four blocks
2    17, 19          the two anchors
```

And the block's numbers:

```
4 radices      matches the 4 in the middle
2 readings     matches the 2 in the evaluation
```

So the generator's arities match the block's structure. The 4 is the four radices; the 2 is the two readings; the 3 is the binding arity.

## The Indices

```
0, 2, 1              three indices for binding
3, 7, 11, 15         four indices for the middle
17, 19               two indices for evaluation
```

And the total is nine indices. And there are also the reserved 16 between the middle and the evaluation — so the full range is 0 to 19, with 16 reserved.

```
0-2        binding        three indices
3-15       middle         thirteen values, four chosen
16         reserved       one value
17-19      evaluation     three values, two chosen
```

So the range is 20 values, and the generator selects specific ones.
