---
id: SPEC-35
title: "Reflections and Base36 Orbits"
kind: spec
layer: grammar
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-30 The Symbol Table G]]"
down: []
related:
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/animation.frame.ts"
dimensions: []
symbols: []
tags: [omi-imo, reflections, base36, orbits, labels, XOR]
---

# Reflections and Base36 Orbits

## The Reflections

From `rosetta/src/animation.frame.ts`:

```typescript
const reflections = [0, 1, 2, 4, 5, 8, 9, 10, 13, 16, 17, 18, 20, 25, 26, 29, 32]
```

Seventeen reflection points. These are the values at which the orbit reflects.

## Base36 Orbit Labels

Base36 is used as a compact human-readable orbit label.

```
Digits:
0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
```

## The Orbit Triples

From the transcripts, the base36 orbit triples are classified by type:

### 45 triples of type {α, α, β}

```
{3, 13, 14}, {3, 21, 22}, {3, 25, 26}, {5, 11, 14}, {5, 19, 22}, {5, 25, 28},
{6, 11, 13}, {6, 19, 21}, {6, 26, 28}, {7, 9, 14}, {7, 10, 13}, {7, 11, 12},
{7, 17, 22}, {7, 18, 21}, {7, 19, 20}, {7, 25, 30}, {7, 26, 29}, {7, 27, 28},
{9, 19, 26}, {9, 21, 28}, {10, 19, 25}, {10, 22, 28}, {11, 17, 26}, {11, 18, 25},
{11, 19, 24}, {11, 21, 30}, {11, 22, 29}, {11, 23, 28}, {12, 21, 25}, {12, 22, 26},
{13, 17, 28}, {13, 19, 30}, {13, 20, 25}, {13, 21, 24}, {13, 22, 27}, {13, 23, 26},
{14, 18, 28}, {14, 19, 29}, {14, 20, 26}, {14, 21, 27}, {14, 22, 24}, {14, 23, 25},
{15, 19, 28}, {15, 21, 26}, {15, 22, 25}
```

### 20 triples of type {β, β, β}

```
{3, 5, 6}, {3, 9, 10}, {3, 17, 18}, {3, 29, 30}, {5, 9, 12}, {5, 17, 20},
{5, 27, 30}, {6, 10, 12}, {6, 18, 20}, {6, 27, 29}, {9, 17, 24}, {9, 23, 30},
{10, 18, 24}, {10, 23, 29}, {12, 20, 24}, {12, 23, 27}, {15, 17, 30},
{15, 18, 29}, {15, 20, 27}, {15, 23, 24}
```

### 15 triples of type {β, β, β} (second set)

```
{3, 12, 15}, {3, 20, 23}, {3, 24, 27}, {5, 10, 15}, {5, 18, 23}, {5, 24, 29},
{6, 9, 15}, {6, 17, 23}, {6, 24, 30}, {9, 18, 27}, {9, 20, 29}, {10, 17, 27},
{10, 20, 30}, {12, 17, 29}, {12, 18, 30}
```

### 60 triples of type {α, β, γ}

```
{1, 6, 7}, {1, 10, 11}, {1, 12, 13}, {1, 14, 15}, {1, 18, 19}, {1, 20, 21},
{1, 22, 23}, {1, 24, 25}, {1, 26, 27}, {1, 28, 29}, {2, 5, 7}, {2, 9, 11},
{2, 12, 14}, {2, 13, 15}, {2, 17, 19}, {2, 20, 22}, {2, 21, 23}, {2, 24, 26},
{2, 25, 27}, {2, 28, 30}, {3, 4, 7}, {3, 8, 11}, {3, 16, 19}, {3, 28, 31},
{4, 9, 13}, {4, 10, 14}, {4, 11, 15}, {4, 17, 21}, {4, 18, 22}, {4, 19, 23},
{4, 24, 28}, {4, 25, 29}, {4, 26, 30}, {5, 8, 13}, {5, 16, 21}, {5, 26, 31},
{6, 8, 14}, {6, 16, 22}, {6, 25, 31}, {7, 8, 15}, {7, 16, 23}, {7, 24, 31},
{8, 17, 25}, {8, 18, 26}, {8, 19, 27}, {8, 20, 28}, {8, 21, 29}, {8, 22, 30},
{9, 16, 25}, {9, 22, 31}, {10, 16, 26}, {10, 21, 31}, {11, 16, 27}, {11, 20, 31},
{12, 16, 28}, {12, 19, 31}, {13, 16, 29}, {13, 18, 31}, {14, 16, 30}, {14, 17, 31}
```

### 15 triples of type {β, γ, γ}

```
{1, 2, 3}, {1, 4, 5}, {1, 8, 9}, {1, 16, 17}, {1, 30, 31}, {2, 4, 6}, {2, 8, 10},
{2, 16, 18}, {2, 29, 31}, {4, 8, 12}, {4, 16, 20}, {4, 27, 31}, {8, 16, 24},
{8, 23, 31}, {15, 16, 31}
```

## The XOR Orbit

The XOR orbit with Form 2 (= 5):

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

## The 16-Orbit

Looking at the orbit for Form 2 (= 5):

```
5 ^ 0  = 5
5 ^ 1  = 4
5 ^ 2  = 7
5 ^ 3  = 6
5 ^ 4  = 1
5 ^ 5  = 0
5 ^ 6  = 3
5 ^ 7  = 2
5 ^ 8  = 13
5 ^ 9  = 12
5 ^ 10 = 15
5 ^ 11 = 14
5 ^ 12 = 9
5 ^ 13 = 8
5 ^ 14 = 11
5 ^ 15 = 10
```

The low nibble XOR:

```
5, 4, 7, 6, 1, 0, 3, 2, 5, 4, 7, 6, 1, 0, 3, 2, ...
```

Period is 8. The pattern is:

```
5, 4, 7, 6, 1, 0, 3, 2
```

And this is exactly the low 3 bits of the sequence:

```
101, 100, 111, 110, 001, 000, 011, 010
```

In binary. Which is: 5, 4, 7, 6, 1, 0, 3, 2.

That's the 8-period. And the 8 values are all the 3-bit numbers in a specific order. This is the Gray code for 3 bits, XOR'd with 5.

The 8-period matches the delta function's exact period 8.
