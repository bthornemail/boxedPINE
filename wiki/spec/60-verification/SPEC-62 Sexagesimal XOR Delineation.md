---
id: SPEC-62
title: "Sexagesimal XOR Delineation"
kind: spec
layer: verification
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-35 Reflections and Orbits]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-55 ASCII Folds]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, sexagesimal, XOR, 60, ASCII, delineation, orbit]
---

# Sexagesimal XOR Delineation

## The Generator

```
60 = 0x3C = 00111100
```

The middle six bits of a byte. Bits 2, 3, 4, 5 set. Bits 0, 1, 6, 7 clear.

60 is the sexagesimal base and the ASCII base. Every derivation below comes from `60 ^ n`.

## The Orbit of 60

### The First Sixteen Steps

```
60 ^ 0  = 60      <
60 ^ 1  = 61      =
60 ^ 2  = 62      >
60 ^ 3  = 63      ?
60 ^ 4  = 56      8
60 ^ 5  = 57      9
60 ^ 6  = 58      :
60 ^ 7  = 59      ;
60 ^ 8  = 52      4
60 ^ 9  = 53      5
60 ^ 10 = 54      6
60 ^ 11 = 55      7
60 ^ 12 = 48      0
60 ^ 13 = 49      1
60 ^ 14 = 50      2
60 ^ 15 = 51      3
```

### The Key Values

```
60 ^ 20  = 40      the middle bit
60 ^ 24  = 36      bits 3, 4
60 ^ 32  = 28      the top bit
60 ^ 36  = 24      bits 2, 5
60 ^ 48  = 12      bits 4, 5
60 ^ 50  = 14      bits 1, 4, 5
60 ^ 51  = 15      bits 0, 1, 4, 5
60 ^ 59  = 7       bits 0, 1, 3, 4, 5
60 ^ 60  = 0       the cancel
60 ^ 61  = 1       the identity
60 ^ 62  = 2
60 ^ 63  = 3
60 ^ 64  = 124     the high-bit toggle
```

### The Upper Half

```
128 ^ 60 = 0xBC = 188
128 ^ 64 = 0xC0 = 192
```

60 sits at the boundary between the low half (0-63) and the high half (64-127). And `60 ^ 64 = 124` crosses the boundary.

## The First Delineation — The Four Blocks

The first sixteen steps partition into four blocks of four:

```
BLOCK 0    60 61 62 63    < = > ?    bits 4,5 = 11
BLOCK 1    56 57 58 59    8 9 : ;    bits 4,5 = 10
BLOCK 2    52 53 54 55    4 5 6 7    bits 4,5 = 01
BLOCK 3    48 49 50 51    0 1 2 3    bits 4,5 = 00
```

Four blocks. Each a contiguous ASCII run. Each a class of characters. And the blocks are ordered descending by bits 4 and 5.

## The Bit Reading

```
block 0    0x3C-0x3F    bits 4,5 = 11    the comparison operators
block 1    0x38-0x3B    bits 4,5 = 10    high digits + low punctuation
block 2    0x34-0x37    bits 4,5 = 01    middle digits
block 3    0x30-0x33    bits 4,5 = 00    low digits
```

And within each block, bits 0 and 1 vary. Bits 2 and 3 vary between blocks.

## The Regex Patterns

```javascript
const BLOCK_0 = /^[<=>?]$/;      // 60-63
const BLOCK_1 = /^[89:;]$/;      // 56-59
const BLOCK_2 = /^[4567]$/;      // 52-55
const BLOCK_3 = /^[0123]$/;      // 48-51
```

Four patterns. Each a block. Each a class. And the four together define the printable range 48-63.

## The ASCII Derivation

```
ascii(n) = 60 ^ n            for n in 0..63
ascii(n) = 60 ^ n ^ 64       for n in 64..127
```

The orbit of 60 visits every ASCII character exactly once. The ASCII table is the orbit of 60.

## The Four-Block Family

```
base 3:   3  2  1  0  |  7  6  5  4  |  11 10 9  8  |  15 14 13 12
base 7:   7  6  5  4  |  3  2  1  0  |  15 14 13 12 |  11 10 9  8
base 11:  11 10 9  8  |  15 14 13 12 |  3  2  1  0  |  7  6  5  4
base 15:  15 14 13 12 |  11 10 9  8  |  7  6  5  4  |  3  2  1  0
```

Four bases, each a different ordering of the four blocks. All four share bits 0 and 1:

```
3   = 0011
7   = 0111
11  = 1011
15  = 1111
```

And bits 2 and 3 vary, giving the four block orderings.

Base 7 is the fulcrum — the one whose first half is `7 6 5 4 3 2 1 0` (the full low half descending) and second half is `15 14 13 12 11 10 9 8` (the full high half descending), splitting the space cleanly.

## The 5-bit Bases

```
base 17:  17 16 19 18 | 21 20 23 22 | 25 24 27 26 | 29 28 31 30
base 19:  19 18 17 16 | 23 22 21 20 | 27 26 25 24 | 31 30 29 28
```

Base 19 is the orbital base — the fully orthogonal one (bits 2 and 3 clear) whose walk is four descending runs of four in ascending block order.

## The Families

```
4-block family (bits 0,1 set):    3, 7, 11, 15
ascending family (bits 0,1 clear): 0, 4, 8, 12
pair-swap (bit 0 only):            1, 5, 9, 13
mid-swap (bit 1 only):             2, 6, 10, 14
orthogonal family (bit 2 clear):   0, 1, 2, 3, 8, 9, 10, 11
interfering family (bit 2 set):    4, 5, 6, 7, 12, 13, 14, 15
5-bit bases:                       17, 19
```

## The Generator {0,2,1}{3,7,11,15}{17,19}

```
{0, 2, 1}          the 3-cycle           binding
{3, 7, 11, 15}     the 4-block family    middle (blackboard)
{17, 19}           the 5-bit pair        evaluation
```

Structural, not arithmetic. The middle group is defined by bits 0 and 1 being set, not by primality. That's why 5 and 13 are excluded — they don't have bit 1 set.

```
3 : 4 : 2           sum 9 = 3², product 24 = 4!
```

## The Middle of Bind

```
OLD     {4,6,8} vs {3,5,7,9}      inline computation
NEW     {3, 7, 11, 15}            blackboard state
```

The middle should be the four-block family, extracted to a blackboard — an imaginal space where the four quadrants are the four block orderings. And bind becomes a transition function reading and writing the blackboard.

## The Compare-Exchange as Swap Selection

The three swaps (swap16, swap32, swap64) each have a different signature. The compare-exchange reads the difference, and the difference's signature is which swap is active. So:

```
deviation  =  expected ^ actual
signature  =  the swap selection
reading    =  bind, apply, or eval
```

The deviation is the swap; the swap is the reading.

## The Logical Loops

```
base 0    identity orbit
base 3    descending orbit      (four-block, starts 0-7)
base 7    fulcrum orbit         (splits 0-7 and 8-15)
base 11   orthogonal orbit      (four-block, mixed)
base 15   reverse orbit         (four-block, starts 12-15)
base 17   5-bit alternating
base 19   pure orbital cycle
```

Each is a logical loop — the orbit of the base under XOR with n = 0..15. The switch selects which loop runs.

## The N-Sphere

The orbit is the N-sphere of the base. Every value at XOR-distance popcount(n) from the base. And the orbit visits every value at every distance.

So the frame is:

```
5T       the base
10T      the endpoint
interior the walk through the sphere
```

And the sphere is the loop.
