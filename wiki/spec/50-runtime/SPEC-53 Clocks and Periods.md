---
id: SPEC-53
title: "Clocks and Periods"
kind: spec
layer: runtime
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-50 Stream Transport]]"
down: []
related:
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-51 JSON Canvas Interchange]]"
  - "[[SPEC-52 The REPL and the Digest]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-55 ASCII Folds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/clock.md"
  - "rosetta/src/animation.frame.ts"
dimensions: []
symbols: []
tags: [omi-imo, clocks, periods, 240, 5040, time-crystals, delta]
---

# Clocks and Periods

## The Delta Period

The delta function has exact period 8. This is proven in the Coq development referenced in the transcripts.

```
delta^8 = identity
```

The 8-period matches the XOR orbit's 8-period. The XOR orbit's 8-period and the delta function's 8-period are the same 8.

## The 240 Clock

The protocol's behavior is time crystals (period 240).

```
T(8) = 120 = 5!
240 = 2 × 120
```

The 240 is twice the 8th tetrahedral number. The 240-clock is the protocol's fundamental period.

## The 5040 Slide Rule

The ring has 5040 slots.

```
5040 = 7!
```

An upper bound can be given using the Fano plane with a collection of 14 tickets in two sets of seven. Each set of seven uses every line of a Fano plane, labelled with the numbers 1 to 7, and 8 to 14.

## The 240 MHz / 44100 Hz / 60 fps Clock Lattice

From the transcripts:

```
24^11 (1521681143169024) drives the 240MHz / 44100Hz / 60fps clock reduction.
```

The clock lattice is:

| Frequency | Role |
|-----------|------|
| 240 MHz | the master clock |
| 44100 Hz | the audio sample rate |
| 60 fps | the video frame rate |

The 24^11 drives the reduction from 240 MHz to 44100 Hz and 60 fps.

## The 12ⁿ and 16ⁿ Relationship

From `rosetta/src/clock.md`:

```
12ⁿ  — the sine reading
16ⁿ  — the cosine reading
 8   — the byte space that both read from
```

```
12² + 16²  =  144 + 256  =  400  =  20²
```

That's a Pythagorean triple: (12, 16, 20). And 20 = 4 × 5 = 2² × 5.

Dividing through by 4:

```
3² + 4² = 5²
```

The fundamental Pythagorean triple. 3-4-5.

## The Musical Reading

```
12 / 8 = 1.5   (the perfect fifth, 3/2)
16 / 8 = 2.0   (the octave, 2/1)
```

So 12/8 = 3/2 and 16/8 = 2/1. That's exactly the perfect fifth and the octave in music.

The 12-base is the fifth. The 16-base is the octave.

```
· 8 = fundamental (1/1)
· 12 = fifth (3/2)
· 16 = octave (2/1)
```

That's a chord: fundamental + fifth + octave. The simplest consonant chord.

## The 8ⁿ Question

```
8⁰ = 1
8¹ = 8
8² = 64
8³ = 512
8⁴ = 4096
8⁵ = 32768
8⁶ = 262144
8⁷ = 2097152
8⁸ = 16777216
```

Interesting: 8⁴ = 4096 = 2¹².

And 16³ = 4096 = 2¹² too.

So 8⁴ = 16³ = 2¹² = 4096.

That's a coincidence of exponents: 8⁴ = (2³)⁴ = 2¹² and 16³ = (2⁴)³ = 2¹².

So 8 and 16 share a common power at n = 4 and n = 3 respectively.

## The Complete Picture

```
8ⁿ  = fundamental (1/1) → (2/1) at n=1 for the octave
12ⁿ = fifth (3/2)
16ⁿ = octave (2/1)
```

Their relationships:

```
8ⁿ = 12ⁿ × (2/3)ⁿ
16ⁿ = 12ⁿ × (4/3)ⁿ
16ⁿ = 8ⁿ × 2ⁿ
```

And at specific points:

```
16⁴ = 65536 = 2¹⁶ = the Blob
8⁴  = 4096  = 2¹² = the 12-bit address
12⁴ = 20736 = 2⁸ × 3⁴
```

## The Time Crystals

The protocol's behavior is time crystals (period 240). The time crystal is the periodic structure that repeats every 240 steps.

```
240 = 2 × 120 = 2 × T(8) = 2 × 5!
```

The 240-clock is the time crystal. The 5040 slide rule is the supercell. The 8-period is the unit cell.
