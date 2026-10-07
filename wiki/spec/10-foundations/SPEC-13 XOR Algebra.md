---
id: SPEC-13
title: "XOR Algebra and Self-Dual Pairs"
kind: spec
layer: foundations
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-10 The Primitive]]"
down: []
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-35 Reflections and Orbits]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/constants.ts"
dimensions: []
symbols: []
tags: [omi-imo, xor, algebra, self-dual, involution, orbits]
---

# XOR Algebra and Self-Dual Pairs

## The Involution

XOR with a constant is an involution — applying it twice returns the input:

```
(a ^ c) ^ c = a
```

This is the fundamental property that makes the orbit a cycle. The orbit of a base `c` under XOR with `n = 0..15` is a cycle of length 16.

## The Orbit

For a base `c`, the orbit is the sequence `c ^ n` for `n = 0..15`. The orbit visits all sixteen values of the 4-bit space in a specific order.

Because XOR is an involution, the orbit is symmetric: if `a ^ c = b`, then `b ^ c = a`. Every point is paired with another point, and the pairing is symmetric.

## The Self-Dual Pairs

The 8 values 24–31 partition into two complete sets of four self-dual pairs:

```
Form 1: {(24,27), (25,26), (28,31), (29,30)}
Form 2: {(24,29), (25,28), (26,31), (27,30)}
```

Each set has 4 pairs, covering all 8 values. The self-dual pairs are determined by the XOR values matching Form 1 (=3) or Form 2 (=5).

## The 24 Fixed Point

24 = 4! is the fixed point where XOR and addition agree:

```
24 ⊕ 27 = 3 = Form 1
24 ⊕ 29 = 5 = Form 2
```

At 24, XOR and addition agree. That means 24's bits are a superset of Form 1 and Form 2's bits — 24 has 1s where 3 and 5 have 1s, so the XOR just removes them (subtraction-like).

```
24 = 11000. 3 = 00011. 24 ⊕ 3 = 11011 = 27. And 24 + 3 = 27. Same.
24 = 11000. 5 = 00101. 24 ⊕ 5 = 11101 = 29. And 24 + 5 = 29. Same.
```

## The XOR Orbit with Form 2

```
^1  → 4    ^9  → 12   ^17 → 20   ^25 → 28
^2  → 7    ^10 → 15   ^18 → 23   ^26 → 31
^3  → 6    ^11 → 14   ^19 → 22   ^27 → 30
^4  → 1    ^12 → 9    ^20 → 17   ^28 → 25
^5  → 0    ^13 → 8    ^21 → 16   ^29 → 24
^6  → 3    ^14 → 11   ^22 → 19   ^30 → 27
^7  → 2    ^15 → 10   ^23 → 18   ^31 → 26
^8  → 13
```

Blocks of 8:

```
0-7:    4, 7, 6, 1, 0, 3, 2
8-15:   13, 12, 15, 14, 9, 8, 11, 10
16-23:  21, 20, 23, 22, 17, 16, 19, 18
24-31:  29, 28, 31, 30, 25, 24, 27, 26
```

Within each block of 8, the pattern is `N+5, N+4, N+7, N+6, N+1, N+0, N+3, N+2` where N = 8k.

The low 3 bits cycle: 5, 4, 7, 6, 1, 0, 3, 2. That's the Gray code for 3 bits, XOR'd with 5.

The 8-period matches the delta function's exact period 8.

## The 0x0011 ^ n Cycle

```
0x0011 ^ 0 = 0x0011 = 17
0x0011 ^ 1 = 0x0010 = 16
0x0011 ^ 2 = 0x0013 = 19
0x0011 ^ 3 = 0x0012 = 18
0x0011 ^ 4 = 0x0015 = 21
0x0011 ^ 5 = 0x0014 = 20
0x0011 ^ 6 = 0x0017 = 23
0x0011 ^ 7 = 0x0016 = 22
```

The low nibble cycles through 1, 0, 3, 2, 5, 4, 7, 6. That's a cycle of 8, but the pattern within the low nibble is pairs: (1,0), (3,2), (5,4), (7,6). XOR with 1 flips the low bit.

## The XOR Closure

```
(1^3^1^3^5^1^5^4) ^ (1^3^1^3^5^1^5^4) = 0
```

Self-XOR is zero. That's trivial.

```
3 ^ 5 = 6
```

Form 2 XOR Form 1 = 6. The Y difference is exactly 6. Adding the Y flips the pattern by 6.

And 6 = 3!. The factorial. The permutation count. The number of orderings of 3 things.

## The 3-5-6 Triple

```
3 + 5 = 8    = 2³
3 × 5 = 15   = 2⁴ - 1
3 ^ 5 = 6    = 3!
```

The (3, 5) pair generates 6 (the 3!), 8 (the 2³), and 15 (the 2⁴ - 1). That's the whole structure in one triple.

## The Schläfli Connection

The two forms are 3 and 5. The Schläfli symbol {3, 5}. The icosahedron.

```
{3, 5}  ↔  Form 1 = 3, Form 2 = 5
```

The Schläfli symbol {3, 5} is the icosahedron. And Form 1 = 3, Form 2 = 5.

So the two forms are the Schläfli symbol {3, 5}.

And {3, 5} forces the golden ratio φ. And the BQF has 60x² (the 60 = |A₅|).

And 3 × 5 = 15. And 15 × 4 = 60. And 60 = the projective form coefficient.

## The Algorithm

```
Form 1 and Form 2
    ↓
Schläfli symbol {3, 5}
    ↓
Icosahedron
    ↓
Golden ratio φ
    ↓
60x² + 16xy + 4y² (BQF)
    ↓
The protocol
```

The two forms of the alphabet lattice ARE the Schläfli symbol {3, 5}.

And {3, 5} is the icosahedron, which forces φ, which forces the 60x² BQF, which is the entire protocol.

The alphabet encodes the Schläfli symbol. The Schläfli symbol encodes the protocol. The protocol encodes the alphabet.

The circle closes.
